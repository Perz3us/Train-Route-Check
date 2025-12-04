"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IoTLocationService = void 0;
const axios_1 = __importDefault(require("axios"));
class IoTLocationService {
    constructor(backendUrl) {
        this.batchSize = 1;
        this.flushInterval = 5000; // 5 seconds
        this.locationBuffer = [];
        this.backendUrl = backendUrl;
        // Auto-flush buffer periodically
        setInterval(() => this.flushBuffer(), this.flushInterval);
    }
    async sendLocationUpdate(locationData) {
        this.locationBuffer.push(locationData);
        if (this.locationBuffer.length >= this.batchSize) {
            await this.flushBuffer();
        }
    }
    async flushBuffer() {
        if (this.locationBuffer.length === 0)
            return;
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
                    await axios_1.default.post(`${this.backendUrl}/api/iot/location`, transformedData);
                    console.log(`Successfully sent location update for train ${location.train_number}`);
                }
                catch (error) {
                    console.log('FAILED PAYLOAD:', JSON.stringify(transformedData));
                    if (axios_1.default.isAxiosError(error) && error.response) {
                        console.log('ERROR_DETAILS:', JSON.stringify(error.response.data));
                    }
                    else {
                        console.log('ERROR:', error.message);
                    }
                    // Re-add failed items to buffer for retry
                    this.locationBuffer.push(location);
                }
            }
        }
        catch (error) {
            console.error('Location update error:', error);
            this.locationBuffer.unshift(...batch);
        }
    }
}
exports.IoTLocationService = IoTLocationService;
//# sourceMappingURL=iot-location.service.js.map