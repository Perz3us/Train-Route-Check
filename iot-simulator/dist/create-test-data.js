"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const backendUrl = 'http://localhost:3001';
async function createRoutes() {
    const routes = [
        {
            trainNumber: 'TRN_001',
            name: 'Test Route 1',
            isActive: true,
            startTime: '08:00',
            endTime: '10:00'
        },
        {
            trainNumber: 'TRN_002',
            name: 'Test Route 2',
            isActive: true,
            startTime: '10:00',
            endTime: '12:00'
        }
    ];
    for (const route of routes) {
        try {
            // Check if exists first (optional, but good practice)
            // For simplicity, just try to create and ignore 409 (Conflict) or similar if unique constraint
            // But API might not return 409 if handled differently.
            // Let's just try to create.
            await axios_1.default.post(`${backendUrl}/api/routes`, route);
            console.log(`Created route ${route.trainNumber}`);
        }
        catch (error) {
            console.log(`Failed to create route ${route.trainNumber}: ${error.message}`);
            if (error.response) {
                console.log('Details:', error.response.data);
            }
        }
    }
}
createRoutes();
//# sourceMappingURL=create-test-data.js.map