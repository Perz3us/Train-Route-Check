import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Decimal } from 'decimal.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private prisma: PrismaService,
  ) {}

  async getPopularRoutes(daysBack: number = 30) {
    try {
      const result = await this.prisma.locationHistory.groupBy({
        by: ['trainNumber'],
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - daysBack)),
          },
        },
        _count: {
          trainNumber: true,
        },
        orderBy: {
          _count: {
            trainNumber: 'desc',
          },
        },
      });

      const routes = await this.prisma.route.findMany({
        where: {
          trainNumber: {
            in: result.map(r => r.trainNumber),
          },
        },
      });

      return result.map(r => {
        const route = routes.find(route => route.trainNumber === r.trainNumber);
        return {
          trainNumber: r.trainNumber,
          routeName: route ? route.name : 'N/A',
          trackingSessions: r._count.trainNumber,
        };
      });
    } catch (error) {
      this.logger.error(`Failed to fetch popular routes: ${error.message}`);
      throw error;
    }
  }

  async calculateRouteDelays(trainNumber?: string, daysBack: number = 7) {
    try {
      const where: Prisma.LocationHistoryWhereInput = {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - daysBack)),
        },
      };

      if (trainNumber) {
        where.trainNumber = trainNumber;
      }

      const locationHistory = await this.prisma.locationHistory.findMany({
        where,
        include: {
          route: {
            include: {
              routeStations: {
                include: {
                  station: true,
                },
              },
            },
          },
        },
      });

      const delays = locationHistory.map(lh => {
        const route = lh.route;
        if (!route || !route.startTime) {
          return null;
        }

        const lastPassedStation = this.findLastPassedStation(route.routeStations, lh.latitude, lh.longitude);
        const scheduledTimeAtLastStation = new Date(route.startTime);
        scheduledTimeAtLastStation.setMinutes(scheduledTimeAtLastStation.getMinutes() + lastPassedStation.estimatedDuration);

        const actualTimeAtLastStation = new Date(lh.timestamp);
        const delayInMinutes = (actualTimeAtLastStation.getTime() - scheduledTimeAtLastStation.getTime()) / (1000 * 60);

        return {
          trainNumber: lh.trainNumber,
          stationName: lastPassedStation.station.name,
          scheduledTime: scheduledTimeAtLastStation.toISOString(),
          actualTime: actualTimeAtLastStation.toISOString(),
          delayInMinutes: Math.round(delayInMinutes),
        };
      });

      return delays.filter(d => d !== null);
    } catch (error) {
      this.logger.error(`Failed to calculate route delays: ${error.message}`);
      throw error;
    }
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

  async getTrainPerformance(trainNumber: string) {
    try {
      const result = await this.prisma.locationHistory.aggregate({
        _count: {
          _all: true,
        },
        _avg: {
          speed: true,
        },
        _max: {
          speed: true,
        },
        where: {
          trainNumber,
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      });

      const route = await this.prisma.route.findUnique({
        where: {
          trainNumber,
        },
      });

      return {
        trainNumber,
        routeName: route ? route.name : 'N/A',
        daysActive: result._count._all,
        avgSpeed: result._avg.speed,
        maxSpeed: result._max.speed,
        totalLocationPoints: result._count._all,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch train performance: ${error.message}`);
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const activeTrains = await this.prisma.liveLocation.count({
        where: {
          timestamp: {
            gte: fiveMinutesAgo,
          },
        },
      });

      const systemHealth = await this.prisma.liveLocation.aggregate({
        _avg: {
          batteryLevel: true,
          signalStrength: true,
        },
        where: {
          timestamp: {
            gte: new Date(Date.now() - 10 * 60 * 1000),
          },
        },
      });

      return {
        activeTrains,
        avgBattery: systemHealth._avg.batteryLevel,
        avgSignal: systemHealth._avg.signalStrength,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch system health: ${error.message}`);
      throw error;
    }
  }
}