# Kafka Integration Design for Train Route Schedule Checker

This document describes a practical design and implementation plan to add Kafka to the Train Route Schedule Checker system using the NestJS HTTP → Kafka pattern. It contains architecture, topics & schemas, Docker Compose for local dev, NestJS producer & consumer examples, operational notes, and a step-by-step implementation checklist.

---

## 1. Overview

**Goal:** Accept GPS telemetry from IoT devices via NestJS HTTP endpoints, publish messages into Kafka, process them with Kafka consumers that enrich/validate and persist to Supabase (Postgres). Frontend continues to use Supabase Realtime for live UI updates.

**High-level flow:**

```
IoT device (ESP32) -> POST /iot/location (NestJS HTTP) -> Kafka topic (iot.train.location.raw)
  -> train-processor consumer -> Enrich/validate -> Upsert to Supabase train_locations table
  -> Supabase Realtime -> Next.js frontend map updates
```

Benefits: loose coupling, buffering, better scale, replayability, and more robust ingestion.

---

## 2. Topics & Naming Conventions

Use clear topic naming and partitioning. Prefer `train_id` as partition key to preserve per-train ordering.

**Topics:**

* `iot.train.location.raw` — Raw telemetry as received from devices. (Retention short: e.g., 7 days)
* `train.location.enriched` — Enriched and validated location updates (ETAs, nearest station). (Optional)
* `train.events` — Start/stop/alerts/route changes.
* `iot.errors` (dead-letter) — Malformed or failed messages.

**Partitioning:**

* Partition by `train_id`.

**Retention & Compaction:**

* `iot.train.location.raw`: time-based retention (7d) to conserve space.
* `train.location.enriched`: time-based retention or longer depending on analytics needs.
* For storing the latest state per train, consider a compacted topic `train.current_state`.

---

## 3. Message Schema (JSON Schema example)

Store schemas in Schema Registry (recommended) and validate on producer or consumer.

```json
{
  "type": "object",
  "properties": {
    "train_id": {"type": "string"},
    "timestamp": {"type": "string", "format": "date-time"},
    "lat": {"type": "number"},
    "lng": {"type": "number"},
    "speed_kmph": {"type": "number"},
    "heading": {"type": "number"},
    "device_id": {"type": "string"},
    "battery": {"type": "number"},
    "accuracy": {"type":"number"},
    "source": {"type":"string"}
  },
  "required": ["train_id","timestamp","lat","lng"]
}
```

Keep messages minimal — only telemetry and small metadata. Persist heavier objects in Postgres.

---

## 4. Local Dev Docker Compose (Kafka + Zookeeper + Schema Registry)

Drop this in `/devops/docker-compose.kafka.yml` for local development.

```yaml
version: "3.8"
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    depends_on: [zookeeper]
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2181'
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092,PLAINTEXT_HOST://localhost:29092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    ports:
      - "29092:29092"

  schema-registry:
    image: confluentinc/cp-schema-registry:7.4.0
    depends_on: [kafka, zookeeper]
    environment:
      SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS: PLAINTEXT://kafka:9092
      SCHEMA_REGISTRY_HOST_NAME: schema-registry
      SCHEMA_REGISTRY_LISTENERS: http://0.0.0.0:8081
    ports:
      - "8081:8081"
```

Notes:

* Use Confluent Cloud or Strimzi/AKS/GKE in production.
* Consider separate Compose files if you run Connect or Control Center locally.

---

## 5. NestJS: Producer (kafkajs)

**Install:**

```bash
npm install kafkajs
```

**Producer module (suggested file: `src/kafka/kafka.producer.ts`)**

```ts
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'train-backend',
  brokers: [process.env.KAFKA_BROKER || 'localhost:29092'],
});

export const producer = kafka.producer();

export async function startProducer() {
  await producer.connect();
}

export async function produceLocation(msg: any) {
  await producer.send({
    topic: 'iot.train.location.raw',
    messages: [
      {
        key: msg.train_id,
        value: JSON.stringify(msg),
      },
    ],
  });
}
```

**Controller (suggested: `src/controllers/iot.controller.ts`)**

```ts
import { Controller, Post, Body } from '@nestjs/common';
import { produceLocation } from '../kafka/kafka.producer';

@Controller('iot')
export class IotController {
  @Post('location')
  async location(@Body() payload: any) {
    // TODO: Validate with Zod or class-validator
    await produceLocation(payload);
    return { status: 'accepted' };
  }
}
```

**Bootstrap producer** in `main.ts` or a module init:

```ts
import { startProducer } from './kafka/kafka.producer';

async function bootstrap(){
  // ... existing Nest bootstrap code
  await startProducer();
}
```

**Validation:** run light validation at controller level (Zod/Joi/class-validator). If message fails validation, return 4xx and/or publish to `iot.errors` dead-letter.

---

## 6. NestJS: Consumer (enrich -> Supabase)

**Install consumer dependencies**

```bash
npm install kafkajs @supabase/supabase-js
```

**Consumer (suggested: `src/kafka/kafka.consumer.ts`)**

```ts
import { Kafka } from 'kafkajs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const kafka = new Kafka({
  clientId: 'train-processor',
  brokers: [process.env.KAFKA_BROKER || 'localhost:29092'],
});

const consumer = kafka.consumer({ groupId: 'train-processor-group' });

export async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'iot.train.location.raw', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const val = message.value?.toString();
      if (!val) return;
      const data = JSON.parse(val);

      try {
        // Enrich: compute nearest station, ETA, smooth coordinates, filter duplicates
        const enriched = await enrichLocation(data);

        // Upsert to Supabase table `train_locations`
        await supabase.from('train_locations').upsert({
          train_id: enriched.train_id,
          last_seen: enriched.timestamp,
          lat: enriched.lat,
          lng: enriched.lng,
          speed_kmph: enriched.speed_kmph,
        }, { onConflict: 'train_id' });

        // Optionally produce to `train.location.enriched`
      } catch (err) {
        // Send to dead-letter topic iot.errors or log
      }
    },
  });
}

async function enrichLocation(data: any) {
  // Implement smoothing, nearest station search, ETA calculation
  return data;
}
```

**Notes:**

* Use idempotent upserts keyed by `train_id` and compare timestamps to avoid overwriting newer data with older messages.
* Add a `last_updated_at` and `source` (kafka) fields to your `train_locations` table.

---

## 7. Supabase Schema (example)

SQL to create a simple `train_locations` table used for Realtime updates:

```sql
create table if not exists train_locations (
  train_id text primary key,
  last_seen timestamptz,
  lat double precision,
  lng double precision,
  speed_kmph real,
  heading real,
  device_id text,
  battery real,
  updated_at timestamptz default now()
);
```

Grant Realtime rights to the service role or use row-level policies appropriately for security.

---

## 8. Frontend (Next.js) — Realtime subscriptions

Frontend subscribes to `train_locations` via Supabase Realtime client. When a record is upserted, the subscription callback updates the map marker for that `train_id`.

Example steps:

* On component mount, fetch initial list of `train_locations`.
* Subscribe to `INSERT`/`UPDATE` events and update in-memory store (TanStack Query / SWR / Zustand).

---

## 9. Operational Considerations

**Security**

* Use TLS + SASL for Kafka in prod.
* Use ACLs and per-service credentials.
* Secrets: store Kafka/Supabase keys in environment variables or secret manager.

**Reliability**

* Replication factor >= 3 for brokers in prod.
* Multiple consumers (consumer groups) for parallel processing.
* Use a dead-letter topic `iot.errors` for malformed messages.

**Scaling**

* Partition count should be chosen according to expected throughput and number of consumers.
* Keep partition key `train_id` for ordering; increase partitions for parallelism across trains.

**Monitoring**

* Export Kafka JMX metrics to Prometheus.
* Monitor consumer group lag, broker health, under-replicated partitions.
* Alert on consumer lag and producer errors.

**Backup**

* Backup Postgres regularly; Kafka is not a long-term archive unless configured.

---

## 10. Testing & Validation

**Local testing:**

* Run the docker-compose stack with Kafka + Schema Registry.
* Use your `iot-simulator` to POST to the NestJS `/iot/location` endpoint.
* Verify messages land in Kafka (use `kafkacat` or Confluent CLI).
* Start consumer and verify Supabase table upserts and Supabase Realtime events in frontend.

**Load testing:**

* Use the simulator to produce bursts of messages at expected real-world rates (and 2x-3x higher for safety).
* Monitor consumer lag and tune partitions and consumer counts.

**Edge cases:**

* Out-of-order messages: check timestamps and ignore older messages.
* Duplicate messages: upsert by (train_id, timestamp) or use dedup logic.

---

## 11. Step-by-step Implementation Checklist

1. Decide Kafka deployment (Managed Confluent Cloud vs self-hosted Strimzi).
2. Add Docker Compose file for local Kafka (if needed).
3. Add Schema Registry (dev/prod) and register JSON/Avro schemas.
4. Create topics: `iot.train.location.raw`, `train.location.enriched`, `iot.errors`.
5. Implement NestJS producer module + controller to accept `/iot/location`.
6. Implement validation at controller (Zod/class-validator).
7. Implement consumer service to enrich and upsert to Supabase.
8. Create `train_locations` table in Supabase and enable Realtime.
9. Connect frontend to Supabase Realtime subscription.
10. Add logging, error handling, and DLQ publishing.
11. Add monitoring (Prometheus/Grafana) for Kafka and consumers.
12. Perform load testing with the simulator and tune the system.
13. Harden security: TLS, SASL, ACLs, secrets management.

---

## 12. Example: Minimal E2E (dev) Quickstart

1. Start Kafka + Schema Registry using the Docker Compose above.
2. Start NestJS backend (make sure `KAFKA_BROKER=localhost:29092` in `.env`).
3. Start `train-processor` consumer or the same Nest app consumer.
4. Start the iot-simulator configured to POST to `http://localhost:3000/iot/location`.
5. Watch the `train_locations` table in Supabase for updates and ensure the frontend map updates.

---

## 13. Appendix: Helpful Patterns

* **Dead-letter topic**: publish invalid or failed messages to `iot.errors` with metadata about failure.
* **Idempotency**: upsert by `train_id` and use timestamp checks to avoid older message overwrites.
* **Compacted topic for current state**: `train.current_state` with log compaction keeps only latest state per `train_id` in Kafka.
* **Schema evolution**: use Schema Registry + Avro/Protobuf and compatible schema changes (add optional fields).

---

## 14. Next steps I can provide

* A ready-to-paste NestJS module with producer + consumer + DTOs + validation.
* A Docker Compose with Kafka Connect (JDBC sink) and topic creation scripts.
* An adapted `iot-simulator` script that produces directly to Kafka for load testing.

If you want one of those, tell me which and I will add it to the repo or produce the code ready to drop into `/backend`.
