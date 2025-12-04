import { Controller, Post, Body } from '@nestjs/common';
import { KafkaProducerService } from '../kafka/kafka.producer';

@Controller('iot')
export class IotController {
  constructor(private readonly kafkaProducerService: KafkaProducerService) {}

  @Post('location')
  async location(@Body() payload: any) {
    // TODO: Validate with Zod or class-validator
    await this.kafkaProducerService.produceLocation(payload);
    return { status: 'accepted' };
  }
}
