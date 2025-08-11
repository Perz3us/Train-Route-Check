import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { LiveLocationDto } from './dto/live-location.dto';

@Injectable()
export class LiveLocationsService {
  private readonly logger = new Logger(LiveLocationsService.name);

  constructor(private prisma: PrismaService) {}

  async createOrUpdateLocation(locationDto: LiveLocationDto) {
    try {
      const existingLocation = await this.prisma.liveLocation.findFirst({
        where: { trainNumber: locationDto.trainNumber },
      });

      const data = {
        trainNumber: locationDto.trainNumber,
        latitude: locationDto.latitude,
        longitude: locationDto.longitude,
        speed: locationDto.speed,
        heading: locationDto.heading,
        accuracy: locationDto.accuracy,
        deviceId: locationDto.deviceId,
        batteryLevel: locationDto.batteryLevel,
        signalStrength: locationDto.signalStrength,
        timestamp: locationDto.timestamp,
      };

      if (existingLocation) {
        const result = await this.prisma.liveLocation.update({
          where: { id: existingLocation.id },
          data,
        });
        this.logger.log(`Successfully updated live location for train ${locationDto.trainNumber}`);
        return result;
      } else {
        const result = await this.prisma.liveLocation.create({
          data,
        });
        this.logger.log(`Successfully created live location for train ${locationDto.trainNumber}`);
        return result;
      }
    } catch (error) {
      this.logger.error(`Exception in createOrUpdateLocation: ${error.message}`);
      throw error;
    }
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

      return location;
    } catch (error) {
      this.logger.error(`Exception in getLatestLocation: ${error.message}`);
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

      return locations;
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
