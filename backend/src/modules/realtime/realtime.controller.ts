import {
  Controller,
  Get,
  Param,
  Logger,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { SupabaseRealtimeService } from '../../database/supabase/supabase-realtime.service';
import { LiveLocationsService } from '../live-locations/live-locations.service';
import { Observable, interval, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Controller('realtime')
export class RealtimeController {
  private readonly logger = new Logger(RealtimeController.name);

  constructor(
    private readonly liveLocationsService: LiveLocationsService,
    private readonly supabaseRealtimeService: SupabaseRealtimeService,
  ) {}

  @Sse('train/:trainNumber')
  async streamTrainLocation(@Param('trainNumber') trainNumber: string): Promise<Observable<MessageEvent>> {
    this.logger.log(`Starting SSE stream for train ${trainNumber}`);
    
    // Return an observable that emits location updates
    return new Observable<MessageEvent>((subscriber) => {
      // Set up the subscription to live location updates
      this.supabaseRealtimeService.subscribeToLiveLocations(trainNumber, (payload) => {
        subscriber.next({
          type: 'location-update',
          data: JSON.stringify(payload),
        });
      }).catch((error) => {
        this.logger.error(`Error in SSE stream for train ${trainNumber}: ${error.message}`);
        subscriber.error(error);
      });

      // Return cleanup function
      return () => {
        this.logger.log(`Closing SSE stream for train ${trainNumber}`);
        this.supabaseRealtimeService.unsubscribe(`train-${trainNumber}`);
      };
    });
  }

  @Sse('all-trains')
  async streamAllTrainLocations(): Promise<Observable<MessageEvent>> {
    this.logger.log('Starting SSE stream for all trains');
    
    // Return an observable that emits location updates
    return new Observable<MessageEvent>((subscriber) => {
      // Set up the subscription to all live location updates
      this.supabaseRealtimeService.subscribeToAllLiveLocations((payload) => {
        subscriber.next({
          type: 'location-update',
          data: JSON.stringify(payload),
        });
      }).catch((error) => {
        this.logger.error(`Error in SSE stream for all trains: ${error.message}`);
        subscriber.error(error);
      });

      // Return cleanup function
      return () => {
        this.logger.log('Closing SSE stream for all trains');
        this.supabaseRealtimeService.unsubscribe('all-live-locations');
      };
    });
  }
}