import axios from 'axios';
import { LocationUpdate } from './types';

export class IoTLocationService {
  private backendUrl: string;
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds
  private locationBuffer: LocationUpdate[] = [];

  constructor(backendUrl: string) {
    this.backendUrl = backendUrl;

    // Auto-flush buffer periodically
    setInterval(() => this.flushBuffer(), this.flushInterval);
  }

  async sendLocationUpdate(locationData: LocationUpdate) {
    this.locationBuffer.push(locationData);

    if (this.locationBuffer.length >= this.batchSize) {
      await this.flushBuffer();
    }
  }

  private async flushBuffer() {
    if (this.locationBuffer.length === 0) return;

    const batch = [...this.locationBuffer];
    this.locationBuffer = [];

    try {
      // Send each location update individually to the NestJS backend
      for (const location of batch) {
        // Transform the data to match the NestJS DTO
        const transformedData = {
          trainNumber: location.train_number,
          latitude: location.latitude,
          longitude: location.longitude,
          speed: location.speed,
          heading: location.heading,
          accuracy: location.accuracy,
          deviceId: location.device_id,
          batteryLevel: location.battery_level,
          signalStrength: location.signal_strength,
          timestamp: location.timestamp,
        };

        try {
          await axios.post(`${this.backendUrl}/api/live-locations`, transformedData);
          console.log(`Successfully sent location update for train ${location.train_number}`);
        } catch (error) {
          console.error(`Failed to send location update for train ${location.train_number}:`, error.message);
          // Re-add failed items to buffer for retry
          this.locationBuffer.push(location);
        }
      }
    } catch (error) {
      console.error('Location update error:', error);
      this.locationBuffer.unshift(...batch);
    }
  }

  // Archive old locations - this would need to be implemented in the backend
  async archiveOldLocations() {
    try {
      await axios.post(`${this.backendUrl}/api/live-locations/archive`);
      console.log('Successfully triggered archive of old locations');
    } catch (error) {
      console.error('Failed to archive old locations:', error.message);
    }
  }
}