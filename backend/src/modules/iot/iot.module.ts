import { Module } from '@nestjs/common';
import { IotController } from './iot.controller';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [IotController],
})
export class IotModule {}
