import { Kafka, Producer } from 'kafkajs';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor(private configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: 'train-backend',
      brokers: [this.configService.get<string>('KAFKA_BROKER') || 'localhost:29092'],
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async produceLocation(msg: any) {
    await this.producer.send({
      topic: 'iot.train.location.raw',
      messages: [
        {
          key: msg.train_id,
          value: JSON.stringify(msg),
        },
      ],
    });
  }
}
