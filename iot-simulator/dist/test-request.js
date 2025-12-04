"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const backendUrl = 'http://localhost:3001';
async function test() {
    const data = {
        train_id: '1000',
        lat: 12.9716,
        lng: 77.5946,
        speed_kmph: 0,
        heading: 0,
        accuracy: 5,
        device_id: 'DEVICE_001',
        battery_level: 100,
        signal_strength: -60,
        timestamp: new Date().toISOString(),
        source: 'test-script'
    };
    try {
        const response = await axios_1.default.post(`${backendUrl}/api/iot/location`, data);
        console.log('Success:', response.data);
    }
    catch (error) {
        console.log('Error:', error.message);
        if (error.response) {
            console.log('Response data:', JSON.stringify(error.response.data));
        }
    }
}
test();
//# sourceMappingURL=test-request.js.map