import { IoTLocationService } from './iot-location.service';
import { Position, TrainConfig, LocationUpdate } from './types';

export class AdvancedTrainSimulator {
  private locationService: IoTLocationService;
  private trainConfig: TrainConfig;
  private currentPosition: Position;
  private currentSpeed: number = 0;
  private currentHeading: number = 0;
  private batteryLevel: number = 100;
  private isRunning: boolean = false;

  constructor(trainConfig: TrainConfig, backendUrl: string) {
    this.trainConfig = trainConfig;
    this.locationService = new IoTLocationService(backendUrl);
    this.currentPosition = trainConfig.startPosition;
  }

  async startSimulation(limit?: number) {
    this.isRunning = true;
    console.log(`Starting simulation for train ${this.trainConfig.trainNumber}`);
    let count = 0;

    while (this.isRunning) {
      if (limit && count >= limit) {
        console.log(`Reached limit of ${limit} updates. Stopping simulation.`);
        this.stopSimulation();
        break;
      }
      count++;
      // Calculate next position based on route and speed
      const nextPosition = this.calculateNextPosition();
      this.currentPosition = nextPosition;
      this.currentSpeed = 60 + Math.random() * 10; // Random speed between 60-70 km/h

      // Add realistic variations
      const locationWithNoise = this.addGPSNoise(nextPosition);

      // Simulate device characteristics
      const deviceData = this.simulateDeviceData();

      // Create location update
      const locationUpdate: LocationUpdate = {
        train_number: this.trainConfig.trainNumber,
        latitude: locationWithNoise.latitude,
        longitude: locationWithNoise.longitude,
        speed: this.currentSpeed,
        heading: this.currentHeading,
        accuracy: deviceData.accuracy,
        device_id: this.trainConfig.deviceId,
        battery_level: deviceData.batteryLevel,
        signal_strength: deviceData.signalStrength,
        timestamp: new Date().toISOString(),
      };

      console.log('Sending payload:', JSON.stringify(locationUpdate));
      // Send to Supabase
      await this.locationService.sendLocationUpdate(locationUpdate);
      console.log(`Sent location update for train ${this.trainConfig.trainNumber}`);

      // Wait for next update (simulate GPS frequency)
      await this.sleep(this.trainConfig.updateInterval || 5000);
    }
  }

  private calculateNextPosition(): Position {
    // This is a simplified implementation
    // In a real implementation, you would calculate movement based on:
    // - Current speed and acceleration
    // - Route curvature and elevation
    // - Station stops and signal delays
    // - Weather conditions
    
    // For now, we'll just move the train in a simple pattern
    // Calculate realistic delta based on speed (approx 16.6m/s for 60km/h)
    // 1 degree lat = ~111km = 111000m
    // Delta for 1s at 60km/h = 16.6 / 111000 = ~0.00015
    const delta = 0.00015; 
    return {
      latitude: this.currentPosition.latitude + delta,
      longitude: this.currentPosition.longitude + delta,
    };
  }

  private addGPSNoise(position: Position): Position {
    // Add realistic GPS accuracy variations
    const accuracyMeters = 3 + Math.random() * 7; // 3-10 meter accuracy
    const latNoise = (Math.random() - 0.5) * 2 * (accuracyMeters / 111320);
    const lngNoise =
      (Math.random() - 0.5) *
      2 *
      (accuracyMeters /
        (111320 * Math.cos((position.latitude * Math.PI) / 180)));

    return {
      latitude: position.latitude + latNoise,
      longitude: position.longitude + lngNoise,
    };
  }

  private simulateDeviceData() {
    // Simulate realistic device characteristics
    return {
      accuracy: 3 + Math.random() * 7,
      batteryLevel: Math.floor(Math.max(0, this.batteryLevel - 0.1)), // Gradual drain, integer
      signalStrength: Math.floor(-50 - Math.random() * 40), // -50 to -90 dBm, integer
    };
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stopSimulation() {
    this.isRunning = false;
    console.log(`Stopped simulation for train ${this.trainConfig.trainNumber}`);
  }
}