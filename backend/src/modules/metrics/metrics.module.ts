import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { SupabaseModule } from '../../database/supabase/supabase.module';

@Module({
  imports: [PrismaModule, SupabaseModule],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}