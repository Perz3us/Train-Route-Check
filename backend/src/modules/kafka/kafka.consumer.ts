import { Kafka, Consumer } from 'kafkajs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: 'train-processor',
      brokers: [this.configService.get<string>('KAFKA_BROKER') || 'localhost:29092'],
    });
    this.consumer = this.kafka.consumer({ groupId: 'train-processor-group' });
    
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey =  this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY'); 

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key must be defined in environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'iot.train.location.raw',
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const val = message.value?.toString();
        if (!val) return;
        
        try {
            const data = JSON.parse(val);
            
            const lag = Date.now() - new Date(data.timestamp).getTime();
            console.log(`[Kafka] Processing message for ${data.train_id}. Lag: ${lag}ms`);

            // Enrich: compute nearest station, ETA, smooth coordinates, filter duplicates
            const enriched = await this.enrichLocation(data);

            // Upsert to Supabase table `live_locations` (using the existing table name from design.md)
            // Note: design.md mentioned train_locations but existing schema has live_locations
            // We'll stick to live_locations as per existing schema
            const { error } = await this.supabase.from('live_locations').upsert({
            train_number: enriched.train_id, // Mapping train_id to train_number
            latitude: enriched.lat,
            longitude: enriched.lng,
            speed: enriched.speed_kmph,
            heading: enriched.heading,
            device_id: enriched.device_id,
            timestamp: enriched.timestamp,
            updated_at: new Date().toISOString(),
            // Add other fields if necessary
            }, { onConflict: 'train_number' });

            if (error) {
                console.error('Error upserting to Supabase:', error);
            }

        } catch (err) {
            console.error('Error processing message:', err);
            // Send to dead-letter topic iot.errors or log
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  async enrichLocation(data: any) {
    // Implement smoothing, nearest station search, ETA calculation
    // For now, return data as is
    return data;
  }
}
