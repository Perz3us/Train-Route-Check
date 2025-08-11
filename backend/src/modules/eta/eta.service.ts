import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RoutesService } from '../routes/routes.service';
import { LiveLocationsService } from '../live-locations/live-locations.service';
import { Decimal } from 'decimal.js';

export interface EtaResult {
  trainNumber: string;
  destinationStationId: string;
  estimatedArrival: string;
  distanceToDestination: number;
  estimatedMinutes: number;
  currentSpeed: number;
  lastUpdated: string;
}

@Injectable()
export class EtaService {
  private readonly logger = new Logger(EtaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly routesService: RoutesService,
    private readonly liveLocationsService: LiveLocationsService,
  ) {}

  async calculateEta(
    trainNumber: string,
    destinationStationId: string,
  ): Promise<EtaResult> {
    try {
      const route = await this.routesService.findByTrainNumber(trainNumber);
      if (!route) {
        throw new NotFoundException(`Route not found for train ${trainNumber}`);
      }

      const destinationRouteStation = route.routeStations.find(
        rs => rs.stationId === destinationStationId,
      );

      if (!destinationRouteStation) {
        throw new NotFoundException(
          `Destination station ${destinationStationId} not found in route ${trainNumber}`,
        );
      }

      const latestLocation = await this.liveLocationsService.getLatestLocation(trainNumber);
      if (!latestLocation) {
        throw new NotFoundException(`No location data found for train ${trainNumber}`);
      }

      const { distanceFromStart, lastPassedStation } = await this.calculateDistanceFromStart(latestLocation, route.routeStations);
      const distanceToDestination = new Decimal(
      typeof destinationRouteStation.distanceFromStart === 'object' 
        ? destinationRouteStation.distanceFromStart.toNumber() 
        : destinationRouteStation.distanceFromStart
    ).toNumber() - distanceFromStart;

      if (distanceToDestination <= 0) {
        return {
          trainNumber,
          destinationStationId,
          estimatedArrival: new Date().toISOString(),
          distanceToDestination: 0,
          estimatedMinutes: 0,
          currentSpeed: latestLocation.speed ? latestLocation.speed.toNumber() : 0,
          lastUpdated: new Date().toISOString(),
        };
      }

      const estimatedMinutes = this.calculateTravelTime(latestLocation, route, lastPassedStation, destinationRouteStation, distanceFromStart);
      const estimatedArrival = new Date(Date.now() + estimatedMinutes * 60 * 1000).toISOString();

      return {
        trainNumber,
        destinationStationId,
        estimatedArrival,
        distanceToDestination,
        estimatedMinutes: Math.round(estimatedMinutes),
        currentSpeed: latestLocation.speed ? latestLocation.speed.toNumber() : 0,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error calculating ETA: ${error.message}`);
      throw error;
    }
  }

  private async calculateDistanceFromStart(location, routeStations) {
    const { lastPassedStation, nextStation } = this.findLastAndNextStation(routeStations, location.latitude, location.longitude);
    const lastStationCoords = { 
      lat: typeof lastPassedStation.station.latitude === 'object' 
        ? lastPassedStation.station.latitude.toNumber() 
        : lastPassedStation.station.latitude,
      lon: typeof lastPassedStation.station.longitude === 'object' 
        ? lastPassedStation.station.longitude.toNumber() 
        : lastPassedStation.station.longitude
    };
    const nextStationCoords = { 
      lat: typeof nextStation.station.latitude === 'object' 
        ? nextStation.station.latitude.toNumber() 
        : nextStation.station.latitude,
      lon: typeof nextStation.station.longitude === 'object' 
        ? nextStation.station.longitude.toNumber() 
        : nextStation.station.longitude
    };
    const currentLocationCoords = { 
      lat: typeof location.latitude === 'object' 
        ? location.latitude.toNumber() 
        : location.latitude,
      lon: typeof location.longitude === 'object' 
        ? location.longitude.toNumber() 
        : location.longitude
    };

    const segmentDistance = this.getDistance(lastStationCoords.lat, lastStationCoords.lon, nextStationCoords.lat, nextStationCoords.lon);
    const distanceFromLastStation = this.getDistance(lastStationCoords.lat, lastStationCoords.lon, currentLocationCoords.lat, currentLocationCoords.lon);

    const lastPassedDistance = typeof lastPassedStation.distanceFromStart === 'object' 
      ? lastPassedStation.distanceFromStart.toNumber() 
      : lastPassedStation.distanceFromStart;
    const nextStationDistance = typeof nextStation.distanceFromStart === 'object' 
      ? nextStation.distanceFromStart.toNumber() 
      : nextStation.distanceFromStart;
    const lastPassedDistanceDecimal = new Decimal(lastPassedDistance);
    const nextStationDistanceDecimal = new Decimal(nextStationDistance);
    const distanceFromStart = lastPassedDistanceDecimal.toNumber() + 
      (distanceFromLastStation / segmentDistance) * 
      (nextStationDistanceDecimal.toNumber() - lastPassedDistanceDecimal.toNumber());

    return { distanceFromStart, lastPassedStation };
  }

  private findLastAndNextStation(routeStations, currentLatitude, currentLongitude) {
    let lastPassedStation = routeStations[0];
    let nextStation = routeStations[1];
    let minDistance = Number.MAX_VALUE;

    for (let i = 0; i < routeStations.length - 1; i++) {
      const distance = this.getDistance(currentLatitude, currentLongitude, routeStations[i].station.latitude.toNumber(), routeStations[i].station.longitude.toNumber());
      if (distance < minDistance) {
        minDistance = distance;
        lastPassedStation = routeStations[i];
        nextStation = routeStations[i+1];
      }
    }
    return { lastPassedStation, nextStation };
  }

  private calculateTravelTime(latestLocation, route, lastStation, destinationStation, distanceFromStart) {
    const lastStationDistance = typeof lastStation.distanceFromStart === 'object' 
      ? lastStation.distanceFromStart.toNumber() 
      : lastStation.distanceFromStart;
    const destinationStationDistance = typeof destinationStation.distanceFromStart === 'object' 
      ? destinationStation.distanceFromStart.toNumber() 
      : destinationStation.distanceFromStart;
      
    const segmentDistance = new Decimal(destinationStationDistance).toNumber() - new Decimal(lastStationDistance).toNumber();
    const segmentDuration = destinationStation.estimatedDuration - lastStation.estimatedDuration;
    if (segmentDuration === 0) {
      return 0;
    }
    const averageSpeed = segmentDistance / (segmentDuration / 60);

    const distanceToTravel = new Decimal(destinationStationDistance).toNumber() - distanceFromStart;
    const travelTime = (distanceToTravel / averageSpeed) * 60;

    return travelTime;
  }

  private findLastPassedStation(routeStations, currentLatitude, currentLongitude) {
    let lastPassedStation = routeStations[0];
    let minDistance = Number.MAX_VALUE;

    for (const station of routeStations) {
      const distance = this.getDistance(currentLatitude, currentLongitude, station.station.latitude.toNumber(), station.station.longitude.toNumber());
      if (distance < minDistance) {
        minDistance = distance;
        lastPassedStation = station;
      }
    }
    return lastPassedStation;
  }

  private getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  async getEtasForRoute(trainNumber: string): Promise<EtaResult[]> {
    try {
      const route = await this.routesService.findByTrainNumber(trainNumber);
      if (!route) {
        throw new NotFoundException(`Route not found for train ${trainNumber}`);
      }

      const etas = await Promise.all(
        route.routeStations.map(async (routeStation) => {
          try {
            return await this.calculateEta(trainNumber, routeStation.stationId);
          } catch (error) {
            this.logger.error(
              `Error calculating ETA for station ${routeStation.stationId}: ${error.message}`,
            );
            return null;
          }
        }),
      );

      return etas.filter((eta): eta is EtaResult => eta !== null);
    } catch (error) {
      this.logger.error(`Error getting ETAs for route: ${error.message}`);
      throw error;
    }
  }

  async getDelayInfo(trainNumber: string): Promise<any> {
    try {
      const route = await this.routesService.findByTrainNumber(trainNumber);
      if (!route) {
        throw new NotFoundException(`Route not found for train ${trainNumber}`);
      }

      const latestLocation = await this.liveLocationsService.getLatestLocation(trainNumber);
      if (!latestLocation) {
        throw new NotFoundException(`No location data found for train ${trainNumber}`);
      }

      const { lastPassedStation } = await this.calculateDistanceFromStart(latestLocation, route.routeStations);
      if (!route.startTime) {
        throw new NotFoundException(`Route start time not found for train ${trainNumber}`);
      }
      const scheduledTimeAtLastStation = new Date(route.startTime);
      scheduledTimeAtLastStation.setMinutes(scheduledTimeAtLastStation.getMinutes() + lastPassedStation.estimatedDuration);

      const actualTimeAtLastStation = new Date(latestLocation.timestamp);
      const delayInMinutes = (actualTimeAtLastStation.getTime() - scheduledTimeAtLastStation.getTime()) / (1000 * 60);

      return {
        trainNumber,
        currentDelay: Math.round(delayInMinutes),
        isDelayed: delayInMinutes > 5,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error getting delay info: ${error.message}`);
      throw error;
    }
  }
}