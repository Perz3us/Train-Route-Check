"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const train_simulator_1 = require("./train-simulator");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configuration - in a real application, this would come from environment variables or a config file
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
// Example train configurations
const trainConfigs = [
    {
        trainNumber: 'TRN_001',
        deviceId: 'DEVICE_TRN_001',
        startPosition: {
            latitude: 6.9333, // Colombo Fort
            longitude: 79.8500,
        },
        route: [],
        updateInterval: 2000, // 2 seconds for faster updates
    }
];
// Create and start simulators for each train
const simulators = [];
trainConfigs.forEach(config => {
    const simulator = new train_simulator_1.AdvancedTrainSimulator(config, BACKEND_URL);
    simulators.push(simulator);
    simulator.startSimulation(10);
});
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down simulators...');
    simulators.forEach(simulator => {
        simulator.stopSimulation();
    });
    process.exit(0);
});
//# sourceMappingURL=index.js.map