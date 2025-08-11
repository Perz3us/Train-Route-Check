import { AdvancedTrainSimulator } from './train-simulator';
import { TrainConfig } from './types';
import dotenv from 'dotenv';
dotenv.config();

// Configuration - in a real application, this would come from environment variables or a config file
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Example train configurations
const trainConfigs: TrainConfig[] = [
  {
    trainNumber: 'TRN_001',
    deviceId: 'DEVICE_001',
    startPosition: {
      latitude: 12.9716,
      longitude: 77.5946,
    },
    route: [], // In a real implementation, this would contain route information
    updateInterval: 5000, // 5 seconds
  },
  {
    trainNumber: 'TRN_002',
    deviceId: 'DEVICE_002',
    startPosition: {
      latitude: 13.0827,
      longitude: 80.2707,
    },
    route: [],
    updateInterval: 7000, // 7 seconds
  },
];

// Create and start simulators for each train
const simulators: AdvancedTrainSimulator[] = [];

trainConfigs.forEach(config => {
  const simulator = new AdvancedTrainSimulator(
    config,
    BACKEND_URL
  );
  simulators.push(simulator);
  simulator.startSimulation();
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down simulators...');
  simulators.forEach(simulator => {
    simulator.stopSimulation();
  });
  process.exit(0);
});