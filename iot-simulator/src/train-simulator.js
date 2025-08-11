"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedTrainSimulator = void 0;
var iot_location_service_1 = require("./iot-location.service");
var AdvancedTrainSimulator = /** @class */ (function () {
    function AdvancedTrainSimulator(trainConfig, backendUrl) {
        this.currentSpeed = 0;
        this.currentHeading = 0;
        this.batteryLevel = 100;
        this.isRunning = false;
        this.trainConfig = trainConfig;
        this.locationService = new iot_location_service_1.IoTLocationService(backendUrl);
        this.currentPosition = trainConfig.startPosition;
    }
    AdvancedTrainSimulator.prototype.startSimulation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var nextPosition, locationWithNoise, deviceData, locationUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isRunning = true;
                        console.log("Starting simulation for train ".concat(this.trainConfig.trainNumber));
                        _a.label = 1;
                    case 1:
                        if (!this.isRunning) return [3 /*break*/, 4];
                        nextPosition = this.calculateNextPosition();
                        locationWithNoise = this.addGPSNoise(nextPosition);
                        deviceData = this.simulateDeviceData();
                        locationUpdate = {
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
                        // Send to Supabase
                        return [4 /*yield*/, this.locationService.sendLocationUpdate(locationUpdate)];
                    case 2:
                        // Send to Supabase
                        _a.sent();
                        console.log("Sent location update for train ".concat(this.trainConfig.trainNumber));
                        // Wait for next update (simulate GPS frequency)
                        return [4 /*yield*/, this.sleep(this.trainConfig.updateInterval || 5000)];
                    case 3:
                        // Wait for next update (simulate GPS frequency)
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AdvancedTrainSimulator.prototype.calculateNextPosition = function () {
        // This is a simplified implementation
        // In a real implementation, you would calculate movement based on:
        // - Current speed and acceleration
        // - Route curvature and elevation
        // - Station stops and signal delays
        // - Weather conditions
        // For now, we'll just move the train in a simple pattern
        var delta = 0.001; // Small movement increment
        return {
            latitude: this.currentPosition.latitude + delta,
            longitude: this.currentPosition.longitude + delta,
        };
    };
    AdvancedTrainSimulator.prototype.addGPSNoise = function (position) {
        // Add realistic GPS accuracy variations
        var accuracyMeters = 3 + Math.random() * 7; // 3-10 meter accuracy
        var latNoise = (Math.random() - 0.5) * 2 * (accuracyMeters / 111320);
        var lngNoise = (Math.random() - 0.5) *
            2 *
            (accuracyMeters /
                (111320 * Math.cos((position.latitude * Math.PI) / 180)));
        return {
            latitude: position.latitude + latNoise,
            longitude: position.longitude + lngNoise,
        };
    };
    AdvancedTrainSimulator.prototype.simulateDeviceData = function () {
        // Simulate realistic device characteristics
        return {
            accuracy: 3 + Math.random() * 7,
            batteryLevel: Math.max(0, this.batteryLevel - 0.1), // Gradual drain
            signalStrength: -50 - Math.random() * 40, // -50 to -90 dBm
        };
    };
    AdvancedTrainSimulator.prototype.sleep = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    AdvancedTrainSimulator.prototype.stopSimulation = function () {
        this.isRunning = false;
        console.log("Stopped simulation for train ".concat(this.trainConfig.trainNumber));
    };
    return AdvancedTrainSimulator;
}());
exports.AdvancedTrainSimulator = AdvancedTrainSimulator;
