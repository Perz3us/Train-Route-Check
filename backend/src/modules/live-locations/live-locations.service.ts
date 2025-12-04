import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { LiveLocationDto } from './dto/live-location.dto';

@Injectable()
export class LiveLocationsService {
  private readonly logger = new Logger(LiveLocationsService.name);

  constructor(private prisma: PrismaService) {}

  // createOrUpdateLocation has been removed to enforce data ingestion via Kafka
  // async createOrUpdateLocation(locationDto: LiveLocationDto) { ... }

  private mapToSnakeCase(location: any) {
    if (!location) return null;
    return {
      id: location.id,
      train_number: location.trainNumber,
      latitude: location.latitude,
      longitude: location.longitude,
      speed: location.speed,
      heading: location.heading,
      accuracy: location.accuracy,
      device_id: location.deviceId,
      battery_level: location.batteryLevel,
      signal_strength: location.signalStrength,
      timestamp: location.timestamp,
      created_at: location.createdAt,
      updated_at: location.updatedAt,
    };
  }

  async getLatestLocation(trainNumber: string) {
    try {
      const location = await this.prisma.liveLocation.findFirst({
        where: { trainNumber },
        orderBy: { timestamp: 'desc' },
      });

      if (!location) {
        throw new NotFoundException(`No location found for train ${trainNumber}`);
      }

      return this.mapToSnakeCase(location);
    } catch (error) {
      this.logger.error(`Exception in getLatestLocation: ${error.message}`);
      throw error;
    }
  }

  async getAllLatestLocations() {
    try {
      // Since we update the same record for each train, getting all records gives us the latest for all trains
      const locations = await this.prisma.liveLocation.findMany({
        orderBy: { timestamp: 'desc' },
      });

      return locations.map(loc => this.mapToSnakeCase(loc));
    } catch (error) {
      this.logger.error(`Exception in getAllLatestLocations: ${error.message}`);
      throw error;
    }
  }

  async getLocationsByTrain(trainNumber: string, limit: number = 10) {
    try {
      const locations = await this.prisma.liveLocation.findMany({
        where: { trainNumber },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      return locations.map(loc => this.mapToSnakeCase(loc));
    } catch (error) {
      this.logger.error(`Exception in getLocationsByTrain: ${error.message}`);
      throw error;
    }
  }

  async archiveOldLocations() {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const oldLocations = await this.prisma.liveLocation.findMany({
        where: { timestamp: { lt: twentyFourHoursAgo } },
      });

      if (oldLocations.length > 0) {
        const historyRecords = oldLocations.map(location => ({
          trainNumber: location.trainNumber,
          latitude: location.latitude,
          longitude: location.longitude,
          speed: location.speed,
          heading: location.heading,
          deviceId: location.deviceId,
          timestamp: location.timestamp,
        }));

        await this.prisma.locationHistory.createMany({
          data: historyRecords,
        });

        await this.prisma.liveLocation.deleteMany({
          where: { id: { in: oldLocations.map(l => l.id) } },
        });

        this.logger.log(`Archived ${oldLocations.length} old location records`);
        return { archived: oldLocations.length };
      }

      return { archived: 0 };
    } catch (error) {
      this.logger.error(`Exception in archiveOldLocations: ${error.message}`);
      throw error;
    }
  }
}
