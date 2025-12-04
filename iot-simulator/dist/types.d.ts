export interface Position {
    latitude: number;
    longitude: number;
}
export interface LocationUpdate {
    train_number: string;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
    device_id?: string;
    battery_level?: number;
    signal_strength?: number;
    timestamp: string;
}
export interface TrainConfig {
    trainNumber: string;
    deviceId: string;
    startPosition: Position;
    route: any[];
    updateInterval?: number;
}
//# sourceMappingURL=types.d.ts.map