// src/modules/routes/routes.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateRouteDto, UpdateRouteDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  private createTimeOnly(timeString: string): Date {
    // Add seconds if not provided
    const timeWithSeconds =
      timeString.includes(':') && timeString.split(':').length === 2
        ? `${timeString}:00`
        : timeString;

    return new Date(`2025-01-01T${timeWithSeconds}`);
  }

  async create(createRouteDto: CreateRouteDto, createdBy?: string) {
    const existingRoute = await this.prisma.route.findUnique({
      where: { trainNumber: createRouteDto.trainNumber },
    });

    if (existingRoute) {
      throw new ConflictException('Train number already exists');
    }

    const stationIds = createRouteDto.stations.map((s) => s.stationId);
    const existingStations = await this.prisma.station.findMany({
      where: { id: { in: stationIds } },
    });

    if (existingStations.length !== stationIds.length) {
      throw new BadRequestException('One or more stations do not exist');
    }

    const sequences = createRouteDto.stations
      .map((s) => s.sequence)
      .sort((a, b) => a - b);
    for (let i = 0; i < sequences.length; i++) {
      if (sequences[i] !== i + 1) {
        throw new BadRequestException(
          'Station sequences must be sequential starting from 1',
        );
      }
    }

    let startTime: Date | undefined;
    let endTime: Date | undefined;
    if (createRouteDto.startTime && createRouteDto.endTime) {
      startTime = this.createTimeOnly(createRouteDto.startTime);
      endTime = this.createTimeOnly(createRouteDto.endTime);
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const route = await tx.route.create({
          data: {
            trainNumber: createRouteDto.trainNumber,
            name: createRouteDto.name,
            isActive: createRouteDto.isActive ?? true,
            startTime: startTime,
            endTime: endTime,
            createdBy: createdBy,
          },
        });

        const routeStationsData = createRouteDto.stations.map((station) => ({
          routeId: route.id,
          stationId: station.stationId,
          sequence: station.sequence,
          distanceFromStart: station.distanceFromStart,
          estimatedDuration: station.estimatedDuration,
          stopDuration: station.stopDuration ?? 2,
        }));

        await tx.routeStation.createMany({
          data: routeStationsData,
        });

        return await tx.route.findUnique({
          where: { id: route.id },
          include: {
            routeStations: {
              include: { station: true },
              orderBy: { sequence: 'asc' },
            },
          },
        });
      });

      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Train number already exists');
        }
      }
      throw error;
    }
  }

  async findAll(options?: {
    isActive?: boolean;
    includeStations?: boolean;
    page?: number;
    limit?: number;
  }) {
    const {
      isActive,
      includeStations = true,
      page = 1,
      limit = 10,
    } = options || {};

    const where: Prisma.RouteWhereInput = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const skip = (page - 1) * limit;

    const [routes, total] = await Promise.all([
      this.prisma.route.findMany({
        where,
        include: includeStations
          ? {
              routeStations: {
                include: { station: true },
                orderBy: { sequence: 'asc' },
              },
            }
          : undefined,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.route.count({ where }),
    ]);

    return {
      data: routes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: {
        routeStations: {
          include: { station: true },
          orderBy: { sequence: 'asc' },
        },
      },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async findByTrainNumber(trainNumber: string) {
    const route = await this.prisma.route.findUnique({
      where: { trainNumber },
      include: {
        routeStations: {
          include: { station: true },
          orderBy: { sequence: 'asc' },
        },
      },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async update(id: string, updateRouteDto: UpdateRouteDto) {
    const existingRoute = await this.findOne(id);

    let startTime: Date | undefined;
    let endTime: Date | undefined;
    if (updateRouteDto.startTime && updateRouteDto.endTime) {
      startTime = this.createTimeOnly(updateRouteDto.startTime);
      endTime = this.createTimeOnly(updateRouteDto.endTime);
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Update basic route info
        const updatedRoute = await tx.route.update({
          where: { id },
          data: {
            trainNumber: updateRouteDto.trainNumber,
            name: updateRouteDto.name,
            isActive: updateRouteDto.isActive,
            startTime: startTime,
            endTime: endTime,
          },
        });

        if (updateRouteDto.stations) {
          await tx.routeStation.deleteMany({
            where: { routeId: id },
          });

          const stationIds = updateRouteDto.stations.map((s) => s.stationId);
          const existingStations = await tx.station.findMany({
            where: { id: { in: stationIds } },
          });

          if (existingStations.length !== stationIds.length) {
            throw new BadRequestException('One or more stations do not exist');
          }

          const routeStationsData = updateRouteDto.stations.map((station) => ({
            routeId: id,
            stationId: station.stationId,
            sequence: station.sequence,
            distanceFromStart: station.distanceFromStart,
            estimatedDuration: station.estimatedDuration,
            stopDuration: station.stopDuration ?? 2,
          }));

          await tx.routeStation.createMany({
            data: routeStationsData,
          });
        }

        return await tx.route.findUnique({
          where: { id },
          include: {
            routeStations: {
              include: { station: true },
              orderBy: { sequence: 'asc' },
            },
          },
        });
      });

      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Train number already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    const existingRoute = await this.findOne(id);

    const deletedRoute = await this.prisma.route.update({
      where: { id },
      data: { isActive: false },
    });

    return deletedRoute;
  }

  async hardDelete(id: string) {
    const existingRoute = await this.findOne(id);

    await this.prisma.routeStation.deleteMany({
      where: { routeId: id },
    });

    await this.prisma.route.delete({
      where: { id },
    });

    return { message: 'Route permanently deleted' };
  }

  async getRouteStats() {
    const [totalRoutes, activeRoutes, totalStations] = await Promise.all([
      this.prisma.route.count(),
      this.prisma.route.count({ where: { isActive: true } }),
      this.prisma.routeStation.count(),
    ]);

    return {
      totalRoutes,
      activeRoutes,
      inactiveRoutes: totalRoutes - activeRoutes,
      totalStations,
      averageStationsPerRoute: totalStations / totalRoutes || 0,
    };
  }
}
