// Using built-in fetch API instead of axios
const fs = require('fs');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const UPDATE_INTERVAL = process.env.UPDATE_INTERVAL || 5000; // 5 seconds

// Train configurations
const trains = [
  {
    trainNumber: 'TRN_001',
    deviceId: 'DEVICE_001',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    trainNumber: 'TRN_002',
    deviceId: 'DEVICE_002',
    latitude: 13.0827,
    longitude: 80.2707,
  }
];

// Function to generate realistic GPS data with noise
function addGPSNoise(lat, lng) {
  // Add realistic GPS accuracy variations (3-10 meters)
  const accuracyMeters = 3 + Math.random() * 7;
  const latNoise = (Math.random() - 0.5) * 2 * (accuracyMeters / 111320);
  const lngNoise = (Math.random() - 0.5) * 2 * (accuracyMeters / (111320 * Math.cos((lat * Math.PI) / 180)));
  
  return {
    latitude: lat + latNoise,
    longitude: lng + lngNoise
  };
}

// Function to simulate device data
function simulateDeviceData() {
  return {
    speed: 40 + Math.random() * 60, // 40-100 km/h
    heading: Math.random() * 360, // 0-360 degrees
    accuracy: 3 + Math.random() * 7, // 3-10 meters
    batteryLevel: 50 + Math.random() * 50, // 50-100%
    signalStrength: -50 - Math.random() * 40 // -50 to -90 dBm
  };
}

// Function to send location data to backend
async function sendLocationData(train) {
  try {
    // Add GPS noise to location
    const { latitude, longitude } = addGPSNoise(train.latitude, train.longitude);
    
    // Simulate device data
    const deviceData = simulateDeviceData();
    
    // Prepare location data
    const locationData = {
      train_number: train.trainNumber,
      latitude,
      longitude,
      ...deviceData,
      device_id: train.deviceId,
      timestamp: new Date().toISOString()
    };
    
    // Send data to backend API using fetch
    const response = await fetch(`${API_URL}/locations/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(locationData)
    });
    
    if (response.ok) {
      const responseData = await response.json();
      console.log(`[${new Date().toISOString()}] Sent location data for ${train.trainNumber}:`, responseData);
    } else {
      console.error(`[${new Date().toISOString()}] Error sending data for ${train.trainNumber}:`, response.status, response.statusText);
    }
    
    // Update train position for next iteration (simple movement simulation)
    train.latitude += 0.0001 * (Math.random() - 0.5);
    train.longitude += 0.0001 * (Math.random() - 0.5);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error sending data for ${train.trainNumber}:`, error.message);
  }
}

// Main simulation function
function startSimulation() {
  console.log('Starting IoT Simulator...');
  console.log(`API URL: ${API_URL}`);
  console.log(`Update Interval: ${UPDATE_INTERVAL}ms`);
  console.log(`Number of trains: ${trains.length}`);
  
  // Send initial data
  trains.forEach(train => sendLocationData(train));
  
  // Set up interval for periodic updates
  setInterval(() => {
    trains.forEach(train => sendLocationData(train));
  }, UPDATE_INTERVAL);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down IoT Simulator...');
  process.exit(0);
});

// Start the simulation
startSimulation();