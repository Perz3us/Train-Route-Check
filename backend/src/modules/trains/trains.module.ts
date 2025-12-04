import { Module } from '@nestjs/common';
import { TrainsService } from './trains.service';
import { TrainsController } from './trains.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TrainsController],
  providers: [TrainsService],
  exports: [TrainsService],
})
export class TrainsModule {}
