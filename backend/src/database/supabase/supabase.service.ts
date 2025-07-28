import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url');
    const serviceRoleKey = this.configService.get<string>(
      'supabase.serviceRoleKey',
    );
    if (!url || !serviceRoleKey) {
      throw new Error('Supabase URL and Service Role Key are required');
    }
    this.supabase = createClient(url, serviceRoleKey);
  }
  get client(): SupabaseClient {
    return this.supabase;
  }
}
