"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var train_simulator_1 = require("./train-simulator");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
// Configuration - in a real application, this would come from environment variables or a config file
var BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
// Example train configurations
var trainConfigs = [
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
var simulators = [];
trainConfigs.forEach(function (config) {
    var simulator = new train_simulator_1.AdvancedTrainSimulator(config, BACKEND_URL);
    simulators.push(simulator);
    simulator.startSimulation();
});
// Handle graceful shutdown
process.on('SIGINT', function () {
    console.log('Shutting down simulators...');
    simulators.forEach(function (simulator) {
        simulator.stopSimulation();
    });
    process.exit(0);
});
