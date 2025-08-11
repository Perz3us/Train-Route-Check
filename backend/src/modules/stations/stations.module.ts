import { Module } from '@nestjs/common';
import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';
import { StationsResolver } from './station.resolver';

@Module({
  controllers: [StationsController],
  providers: [StationsService, StationsResolver],
  exports: [StationsService],
})
export class StationsModule {}
