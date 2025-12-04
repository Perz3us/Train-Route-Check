import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class StationsService {
  constructor(private prismaService: PrismaService) {}

  async findAll() {
    try {
      const stations = await this.prismaService.station.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      console.log(`Found ${stations.length} stations`);
      return stations;
    } catch (error) {
      console.error('Error fetching stations:', error);
      throw new Error('Failed to fetch stations');
    }
  }

  async findOne(id: string) {
    try {
      const station = await this.prismaService.station.findUnique({
        where: { id },
        include: {
          routeStations: {
            include: {
              route: {
                select: {
                  id: true,
                  name: true,
                  trainNumber: true,
                  isActive: true,
                },
              },
            },
          },
        },
      });

      if (!station) {
        throw new NotFoundException(`Station with ID "${id}" not found`);
      }

      console.log(`Found station: ${station.name}`);
      return station;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching station:', error);
      throw new Error('Failed to fetch station');
    }
  }

  async create(createStationDto: CreateStationDto) {
    try {
      const station = await this.prismaService.station.create({
        data: createStationDto,
      });

      console.log(`Created station: ${station.name} (${station.code})`);
      return station;
    } catch (error) {
      // Handle unique constraint violations (duplicate code)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Station with code "${createStationDto.code}" already exists`,
          );
        }
      }

      console.error('Error creating station:', error);
      throw new Error('Failed to create station');
    }
  }
  async update(id: string, updateStationDto: UpdateStationDto) {
    try {
      const station = await this.prismaService.station.update({
        where: { id },
        data: updateStationDto,
      });

      console.log(`Updated station: ${station.name}`);
      return station;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Station with ID "${id}" not found`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Station with code "${updateStationDto.code}" already exists`,
          );
        }
      }

      console.error('Error updating station:', error);
      throw new Error('Failed to update station');
    }
  }

  async remove(id: string) {
    try {
      const station = await this.prismaService.station.delete({
        where: { id },
      });

      console.log(`Deleted station: ${station.name}`);
      return { message: `Station "${station.name}" has been deleted` };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Station with ID "${id}" not found`);
        }
      }

      console.error('Error deleting station:', error);
      throw new Error('Failed to delete station');
    }
  }
  async search(query: string) {
    try {
      const stations = await this.prismaService.station.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { code: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
            { province: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: {
          name: 'asc',
        },
      });

      console.log(`Search "${query}" found ${stations.length} stations`);
      return stations;
    } catch (error) {
      console.error('Error searching stations:', error);
      throw new Error('Failed to search stations');
    }
  }
}
