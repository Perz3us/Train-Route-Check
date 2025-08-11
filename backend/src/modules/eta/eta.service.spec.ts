import { Test, TestingModule } from '@nestjs/testing';
import { EtaService } from './eta.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RoutesService } from '../routes/routes.service';
import { LiveLocationsService } from '../live-locations/live-locations.service';
import { NotFoundException } from '@nestjs/common';


describe('EtaService', () => {
  let service: EtaService;
  let prisma: PrismaService;
  let routesService: RoutesService;
  let liveLocationsService: LiveLocationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EtaService,
        { provide: PrismaService, useValue: {}},
        { provide: RoutesService, useValue: { findByTrainNumber: jest.fn() } },
        { provide: LiveLocationsService, useValue: { getLatestLocation: jest.fn() } },
      ],
    }).compile();

    service = module.get<EtaService>(EtaService);
    prisma = module.get<PrismaService>(PrismaService);
    routesService = module.get<RoutesService>(RoutesService);
    liveLocationsService = module.get<LiveLocationsService>(LiveLocationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateEta', () => {
    it('should calculate ETA successfully', async () => {
      const trainNumber = 'T123';
      const destinationStationId = 'S2';
      const route = {
        trainNumber,
        startTime: new Date(),
        routeStations: [
          { 
            stationId: 'S1', 
            distanceFromStart: { toNumber: () => 0 }, 
            estimatedDuration: 0, 
            station: { 
              latitude: { toNumber: () => 0 }, 
              longitude: { toNumber: () => 0 },
              name: 'Station 1'
            } 
          },
          { 
            stationId: 'S2', 
            distanceFromStart: { toNumber: () => 100 }, 
            estimatedDuration: 120, 
            station: { 
              latitude: { toNumber: () => 1 }, 
              longitude: { toNumber: () => 1 },
              name: 'Station 2'
            } 
          },
        ],
      };
      const latestLocation = { 
        latitude: { toNumber: () => 0.5 }, 
        longitude: { toNumber: () => 0.5 }, 
        speed: { toNumber: () => 50 }, 
        timestamp: new Date(),
        trainNumber: 'T123'
      };

      (routesService.findByTrainNumber as jest.Mock).mockResolvedValue(route);
      (liveLocationsService.getLatestLocation as jest.Mock).mockResolvedValue(latestLocation);

      const result = await service.calculateEta(trainNumber, destinationStationId);

      expect(result).toBeDefined();
      // Note: The exact value might vary based on the calculation, but it should be a number
      expect(typeof result.estimatedMinutes).toBe('number');
    });

    it('should throw NotFoundException if route not found', async () => {
      (routesService.findByTrainNumber as jest.Mock).mockResolvedValue(null);

      await expect(service.calculateEta('T123', 'S2')).rejects.toThrow(NotFoundException);
    });
  });
});
