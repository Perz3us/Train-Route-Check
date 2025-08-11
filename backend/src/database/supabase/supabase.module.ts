import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseRealtimeService } from './supabase-realtime.service';

@Module({
  providers: [SupabaseService, SupabaseRealtimeService],
  exports: [SupabaseService, SupabaseRealtimeService],
})
export class SupabaseModule {}
