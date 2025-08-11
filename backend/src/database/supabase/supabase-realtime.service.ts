import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseRealtimeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SupabaseRealtimeService.name);
  private supabase: SupabaseClient;
  private subscriptions: Map<string, any> = new Map();

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url');
    const serviceRoleKey = this.configService.get<string>('supabase.serviceRoleKey');
    
    if (!url || !serviceRoleKey) {
      throw new Error('Supabase URL and Service Role Key are required');
    }
    
    this.supabase = createClient(url, serviceRoleKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  async onModuleInit() {
    this.logger.log('Supabase Realtime Service initialized');
  }

  async onModuleDestroy() {
    // Unsubscribe from all channels
    for (const [channelName, subscription] of this.subscriptions.entries()) {
      try {
        await subscription.unsubscribe();
        this.logger.log(`Unsubscribed from channel: ${channelName}`);
      } catch (error) {
        this.logger.error(`Error unsubscribing from channel ${channelName}: ${error.message}`);
      }
    }
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  // Subscribe to live location changes
  async subscribeToLiveLocations(trainNumber: string, callback: (payload: any) => void) {
    const channelName = `train-${trainNumber}`;
    
    // Check if already subscribed
    if (this.subscriptions.has(channelName)) {
      this.logger.warn(`Already subscribed to channel: ${channelName}`);
      return this.subscriptions.get(channelName);
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_locations',
          filter: `train_number=eq.${trainNumber}`,
        },
        (payload) => {
          this.logger.log(`Received live location update for train ${trainNumber}`);
          callback(payload);
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.logger.log(`Successfully subscribed to live locations for train ${trainNumber}`);
        } else if (status === 'CHANNEL_ERROR') {
          this.logger.error(`Error subscribing to live locations for train ${trainNumber}`);
        } else if (status === 'CLOSED') {
          this.logger.log(`Closed subscription to live locations for train ${trainNumber}`);
        }
      });

    this.subscriptions.set(channelName, channel);
    return channel;
  }

  // Subscribe to all live locations
  async subscribeToAllLiveLocations(callback: (payload: any) => void) {
    const channelName = 'all-live-locations';
    
    // Check if already subscribed
    if (this.subscriptions.has(channelName)) {
      this.logger.warn(`Already subscribed to channel: ${channelName}`);
      return this.subscriptions.get(channelName);
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_locations',
        },
        (payload) => {
          this.logger.log('Received live location update for any train');
          callback(payload);
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.logger.log('Successfully subscribed to all live locations');
        } else if (status === 'CHANNEL_ERROR') {
          this.logger.error('Error subscribing to all live locations');
        } else if (status === 'CLOSED') {
          this.logger.log('Closed subscription to all live locations');
        }
      });

    this.subscriptions.set(channelName, channel);
    return channel;
  }

  // Unsubscribe from a channel
  async unsubscribe(channelName: string) {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      try {
        await subscription.unsubscribe();
        this.subscriptions.delete(channelName);
        this.logger.log(`Unsubscribed from channel: ${channelName}`);
      } catch (error) {
        this.logger.error(`Error unsubscribing from channel ${channelName}: ${error.message}`);
        throw error;
      }
    } else {
      this.logger.warn(`No subscription found for channel: ${channelName}`);
    }
  }

  // Broadcast system-wide updates
  async broadcastUpdate(channelName: string, event: string, payload: any) {
    const channel = this.supabase.channel(channelName);
    
    try {
      await channel.send({
        type: 'broadcast',
        event,
        payload,
      });
      
      this.logger.log(`Broadcast update sent on channel ${channelName} with event ${event}`);
    } catch (error) {
      this.logger.error(`Error broadcasting update: ${error.message}`);
      throw error;
    }
  }

  // Listen for broadcast updates
  async listenForBroadcasts(channelName: string, event: string, callback: (payload: any) => void) {
    const fullChannelName = `broadcast-${channelName}`;
    
    // Check if already subscribed
    if (this.subscriptions.has(fullChannelName)) {
      this.logger.warn(`Already subscribed to broadcast channel: ${fullChannelName}`);
      return this.subscriptions.get(fullChannelName);
    }

    const channel = this.supabase
      .channel(fullChannelName)
      .on('broadcast', { event }, (payload) => {
        this.logger.log(`Received broadcast on channel ${channelName} with event ${event}`);
        callback(payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.logger.log(`Successfully subscribed to broadcast channel ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
          this.logger.error(`Error subscribing to broadcast channel ${channelName}`);
        } else if (status === 'CLOSED') {
          this.logger.log(`Closed subscription to broadcast channel ${channelName}`);
        }
      });

    this.subscriptions.set(fullChannelName, channel);
    return channel;
  }
}