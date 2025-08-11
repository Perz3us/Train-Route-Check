export class RouteStationResponseDto {
  id: string;
  stationId: string;
  sequence: number;
  distanceFromStart: number;
  estimatedDuration?: number;
  stopDuration: number;
  station: {
    id: string;
    name: string;
    code: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
  };
}

export class RouteResponseDto {
  id: string;
  trainNumber: string;
  name: string;
  isActive: boolean;
  startTime?: string;
  endTime?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  routeStations: RouteStationResponseDto[];
}
