import { LocationUpdate } from './types';
export declare class IoTLocationService {
    private backendUrl;
    private batchSize;
    private flushInterval;
    private locationBuffer;
    constructor(backendUrl: string);
    sendLocationUpdate(locationData: LocationUpdate): Promise<void>;
    private flushBuffer;
}
//# sourceMappingURL=iot-location.service.d.ts.map