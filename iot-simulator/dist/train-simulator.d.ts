import { TrainConfig } from './types';
export declare class AdvancedTrainSimulator {
    private locationService;
    private trainConfig;
    private currentPosition;
    private currentSpeed;
    private currentHeading;
    private batteryLevel;
    private isRunning;
    constructor(trainConfig: TrainConfig, backendUrl: string);
    startSimulation(limit?: number): Promise<void>;
    private calculateNextPosition;
    private addGPSNoise;
    private simulateDeviceData;
    private sleep;
    stopSimulation(): void;
}
//# sourceMappingURL=train-simulator.d.ts.map