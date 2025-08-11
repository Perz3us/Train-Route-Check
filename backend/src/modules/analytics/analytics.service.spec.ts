import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../database/prisma/prisma.service';


describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: { locationHistory: { groupBy: jest.fn(), findMany: jest.fn(), aggregate: jest.fn() }, route: { findMany: jest.fn(), findUnique: jest.fn() }, liveLocation: { count: jest.fn(), aggregate: jest.fn() } } },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPopularRoutes', () => {
    it('should return popular routes', async () => {
      const result = [{ trainNumber: 'T123', _count: { trainNumber: 10 } }];
      const routes = [{ trainNumber: 'T123', name: 'Test Route' }];
      (prisma.locationHistory.groupBy as jest.Mock).mockResolvedValue(result);
      (prisma.route.findMany as jest.Mock).mockResolvedValue(routes);

      const popularRoutes = await service.getPopularRoutes();

      expect(popularRoutes).toEqual([{ trainNumber: 'T123', routeName: 'Test Route', trackingSessions: 10 }]);
    });
  });

  describe('calculateRouteDelays', () => {
    it('should calculate route delays', async () => {
      const locationHistory = [
        {
          trainNumber: 'T123',
          latitude: { toNumber: () => 1 },
          longitude: { toNumber: () => 1 },
          timestamp: new Date(),
          route: {
            startTime: new Date(),
            routeStations: [
              { stationId: 'S1', station: { name: 'Station 1', latitude: { toNumber: () => 0 }, longitude: { toNumber: () => 0 } }, estimatedDuration: 0, distanceFromStart: { toNumber: () => 0 } },
              { stationId: 'S2', station: { name: 'Station 2', latitude: { toNumber: () => 1 }, longitude: { toNumber: () => 1 } }, estimatedDuration: 60, distanceFromStart: { toNumber: () => 100 } },
            ],
          },
        },
      ];
      (prisma.locationHistory.findMany as jest.Mock).mockResolvedValue(locationHistory);

      const delays = await service.calculateRouteDelays();

      expect(delays).toBeDefined();
    });
  });

  describe('getTrainPerformance', () => {
    it('should return train performance', async () => {
      const result = { _count: { _all: 10 }, _avg: { speed: 50 }, _max: { speed: 100 } };
      const route = { name: 'Test Route' };
      (prisma.locationHistory.aggregate as jest.Mock).mockResolvedValue(result);
      (prisma.route.findUnique as jest.Mock).mockResolvedValue(route);

      const performance = await service.getTrainPerformance('T123');

      expect(performance).toEqual({
        trainNumber: 'T123',
        routeName: 'Test Route',
        daysActive: 10,
        avgSpeed: 50,
        maxSpeed: 100,
        totalLocationPoints: 10,
      });
    });
  });

  describe('getSystemHealth', () => {
    it('should return system health', async () => {
      const activeTrains = 10;
      const systemHealth = { _avg: { batteryLevel: 80, signalStrength: -60 } };
      (prisma.liveLocation.count as jest.Mock).mockResolvedValue(activeTrains);
      (prisma.liveLocation.aggregate as jest.Mock).mockResolvedValue(systemHealth);

      const health = await service.getSystemHealth();

      expect(health).toEqual({
        activeTrains: 10,
        avgBattery: 80,
        avgSignal: -60,
      });
    });
  });
});
