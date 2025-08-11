# IoT Simulator for Train Route Check

This is a standalone IoT simulator that generates realistic train location data and sends it to the Supabase database for the Train Route Check application.

## Features

- Simulates multiple trains moving along routes
- Generates realistic GPS data with accuracy variations
- Simulates device characteristics (battery level, signal strength)
- Sends data to Supabase in batches for efficiency
- Can be run independently of the main application

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set environment variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. Configure train simulations in `src/index.ts`

## Usage

### Development
```
npm run start:dev
```

### Production
```
npm run build
npm run start:prod
```

## Configuration

The simulator can be configured by modifying the `trainConfigs` array in `src/index.ts`. Each train configuration includes:

- `trainNumber`: Unique identifier for the train
- `deviceId`: Unique identifier for the IoT device
- `startPosition`: Initial latitude and longitude
- `route`: Route information (currently unused in this simple implementation)
- `updateInterval`: How frequently to send location updates (in milliseconds)

## Implementation Details

The simulator implements:

1. **Realistic Movement**: Trains move along simulated routes with realistic acceleration and deceleration
2. **GPS Noise**: Adds realistic variations to GPS coordinates
3. **Device Simulation**: Simulates battery drain and signal strength variations
4. **Batch Processing**: Sends location updates in batches to reduce database load
5. **Graceful Shutdown**: Properly stops simulations on SIGINT (Ctrl+C)