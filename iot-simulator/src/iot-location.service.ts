import axios from 'axios';
import { LocationUpdate } from './types';

export class IoTLocationService {
  private backendUrl: string;
  private batchSize = 1;
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
        // Transform the data to match the Kafka message schema
        const transformedData = {
          train_id: location.train_number,
          lat: location.latitude,
          lng: location.longitude,
          speed_kmph: location.speed,
          heading: location.heading,
          accuracy: location.accuracy,
          device_id: location.device_id,
          timestamp: location.timestamp,
          source: 'iot-simulator',
        };

        try {
          // Send to the new IoT endpoint (Kafka producer)
          // Note: The backend has a global prefix 'api', so the path is /api/iot/location
          await axios.post(`${this.backendUrl}/api/iot/location`, transformedData);
          console.log(`Successfully sent location update for train ${location.train_number}`);
        } catch (error: any) {
          console.log('FAILED PAYLOAD:', JSON.stringify(transformedData));
          if (axios.isAxiosError(error) && error.response) {
            console.log('ERROR_DETAILS:', JSON.stringify(error.response.data));
          } else {
            console.log('ERROR:', error.message);
          }
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
  // Archive functionality has been moved/deprecated
  // async archiveOldLocations() { ... }
}