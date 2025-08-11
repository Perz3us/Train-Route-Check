import { Module } from '@nestjs/common';
import { RealtimeController } from './realtime.controller';
import { LiveLocationsModule } from '../live-locations/live-locations.module';

import { SupabaseModule } from '../../database/supabase/supabase.module';

@Module({
  imports: [LiveLocationsModule, SupabaseModule],
  controllers: [RealtimeController],
})
export class RealtimeModule {}