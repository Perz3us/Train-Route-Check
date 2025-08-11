import { Module } from '@nestjs/common';
import { LiveLocationsService } from './live-locations.service';
import { LiveLocationsController } from './live-locations.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LiveLocationsController],
  providers: [LiveLocationsService],
  exports: [LiveLocationsService],
})
export class LiveLocationsModule {}