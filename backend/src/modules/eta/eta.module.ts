import { Module } from '@nestjs/common';
import { EtaService } from './eta.service';
import { EtaController } from './eta.controller';
import { RoutesModule } from '../routes/routes.module';
import { LiveLocationsModule } from '../live-locations/live-locations.module';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
  imports: [RoutesModule, LiveLocationsModule, PrismaModule],
  controllers: [EtaController],
  providers: [EtaService],
  exports: [EtaService],
})
export class EtaModule {}