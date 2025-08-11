import { Test, TestingModule } from '@nestjs/testing';
import { LiveLocationsService } from './live-locations.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Logger, NotFoundException } from '@nestjs/common';
import { LiveLocationDto } from './dto/live-location.dto';

// Mock Prisma service
const mockPrismaService = {
  liveLocation: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  locationHistory: {
    createMany: jest.fn(),
  },
};

describe('LiveLocationsService', () => {
  let service: LiveLocationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveLocationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LiveLocationsService>(LiveLocationsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Mock the logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrUpdateLocation', () => {
    it('should update a location if it exists', async () => {
      const locationDto: LiveLocationDto = {
        trainNumber: 'T123',
        latitude: 40.7128,
        longitude: -74.006,
        timestamp: new Date().toISOString(),
      };
      const existingLocation = { id: '1', ...locationDto };

      mockPrismaService.liveLocation.findFirst.mockResolvedValue(existingLocation);
      mockPrismaService.liveLocation.update.mockResolvedValue(existingLocation);

      const result = await service.createOrUpdateLocation(locationDto);

      expect(result).toEqual(existingLocation);
      expect(prisma.liveLocation.findFirst).toHaveBeenCalledWith({ where: { trainNumber: 'T123' } });
      expect(prisma.liveLocation.update).toHaveBeenCalledWith({
        where: { id: existingLocation.id },
        data: expect.any(Object),
      });
    });

    it('should create a location if it does not exist', async () => {
      const locationDto: LiveLocationDto = {
        trainNumber: 'T123',
        latitude: 40.7128,
        longitude: -74.006,
        timestamp: new Date().toISOString(),
      };
      const newLocation = { id: '1', ...locationDto };

      mockPrismaService.liveLocation.findFirst.mockResolvedValue(null);
      mockPrismaService.liveLocation.create.mockResolvedValue(newLocation);

      const result = await service.createOrUpdateLocation(locationDto);

      expect(result).toEqual(newLocation);
      expect(prisma.liveLocation.findFirst).toHaveBeenCalledWith({ where: { trainNumber: 'T123' } });
      expect(prisma.liveLocation.create).toHaveBeenCalledWith({ data: expect.any(Object) });
    });
  });

  describe('getLatestLocation', () => {
    it('should retrieve the latest location for a train', async () => {
      const trainNumber = 'T123';
      const mockLocation = { id: '1', trainNumber, latitude: 40.7128, longitude: -74.006, timestamp: new Date() };

      mockPrismaService.liveLocation.findFirst.mockResolvedValue(mockLocation);

      const result = await service.getLatestLocation(trainNumber);

      expect(result).toEqual(mockLocation);
      expect(prisma.liveLocation.findFirst).toHaveBeenCalledWith({
        where: { trainNumber },
        orderBy: { timestamp: 'desc' },
      });
    });

    it('should throw NotFoundException if no location is found', async () => {
      const trainNumber = 'T123';

      mockPrismaService.liveLocation.findFirst.mockResolvedValue(null);

      await expect(service.getLatestLocation(trainNumber)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLocationsByTrain', () => {
    it('should retrieve locations for a train', async () => {
      const trainNumber = 'T123';
      const limit = 5;
      const mockLocations = [{ id: '1' }, { id: '2' }];

      mockPrismaService.liveLocation.findMany.mockResolvedValue(mockLocations);

      const result = await service.getLocationsByTrain(trainNumber, limit);

      expect(result).toEqual(mockLocations);
      expect(prisma.liveLocation.findMany).toHaveBeenCalledWith({
        where: { trainNumber },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });
    });
  });

  describe('archiveOldLocations', () => {
    it('should archive old locations successfully', async () => {
      const oldLocations = [{ id: '1' }, { id: '2' }];

      mockPrismaService.liveLocation.findMany.mockResolvedValue(oldLocations);

      const result = await service.archiveOldLocations();

      expect(result).toEqual({ archived: oldLocations.length });
      expect(prisma.locationHistory.createMany).toHaveBeenCalled();
      expect(prisma.liveLocation.deleteMany).toHaveBeenCalled();
    });

    it('should handle when no old locations exist', async () => {
      mockPrismaService.liveLocation.findMany.mockResolvedValue([]);

      const result = await service.archiveOldLocations();

      expect(result).toEqual({ archived: 0 });
      expect(prisma.locationHistory.createMany).not.toHaveBeenCalled();
      expect(prisma.liveLocation.deleteMany).not.toHaveBeenCalled();
    });
  });
});
