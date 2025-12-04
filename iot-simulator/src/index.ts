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
    deviceId: 'DEVICE_TRN_001',
    startPosition: {
      latitude: 6.9333, // Colombo Fort
      longitude: 79.8500,
    },
    route: [], 
    updateInterval: 1000, // 1 second for smoother updates
  }
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