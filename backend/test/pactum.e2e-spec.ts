import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../src/database/prisma/prisma.service';
import * as pactum from 'pactum';
import configuration from '../src/config/configuration';
import { AppModule } from '../src/app.module';

describe('Train Route Check API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
          envFilePath: ['.env.test'], // Use test environment variables
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
    
    // Set up Pactum
    pactum.request.setBaseUrl(`http://localhost:${process.env.PORT || 3001}/api`);
    
    // Get Prisma service for test database operations
    prisma = app.get(PrismaService);
    
    // Clean up database before tests
    await cleanupDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  // Helper function to clean up the test database
  const cleanupDatabase = async () => {
    // Delete in correct order to avoid foreign key constraint errors
    await prisma.locationHistory.deleteMany({});
    await prisma.liveLocation.deleteMany({});
    await prisma.routeStation.deleteMany({});
    await prisma.route.deleteMany({});
    await prisma.station.deleteMany({});
    await prisma.profile.deleteMany({});
  };

  describe('Stations', () => {
    const stationDto = {
      name: 'Central Station',
      code: 'CEN',
      latitude: 40.7128,
      longitude: -74.006,
      city: 'New York',
      state: 'NY',
    };

    it('should create a station', () => {
      return pactum
        .spec()
        .post('/stations')
        .withBody(stationDto)
        .expectStatus(201)
        .stores('stationId', 'id');
    });

    it('should get all stations', () => {
      return pactum
        .spec()
        .get('/stations')
        .expectStatus(200)
        .expectJsonLength('$.length', 1);
    });

    it('should get a station by id', () => {
      return pactum
        .spec()
        .get('/stations/{id}')
        .withPathParams('id', '$S{stationId}')
        .expectStatus(200)
        .expectJsonLike({
          id: '$S{stationId}',
          name: stationDto.name,
          code: stationDto.code,
        });
    });

    it('should update a station', () => {
      const updatedStation = {
        name: 'Updated Central Station',
        city: 'Brooklyn',
      };

      return pactum
        .spec()
        .patch('/stations/{id}')
        .withPathParams('id', '$S{stationId}')
        .withBody(updatedStation)
        .expectStatus(200)
        .expectJsonLike({
          id: '$S{stationId}',
          name: updatedStation.name,
          code: stationDto.code,
          city: updatedStation.city,
        });
    });

    it('should delete a station', () => {
      return pactum
        .spec()
        .delete('/stations/{id}')
        .withPathParams('id', '$S{stationId}')
        .expectStatus(200);
    });
  });

  describe('Routes', () => {
    let station1Id: string;
    let station2Id: string;

    const station1Dto = {
      name: 'Station One',
      code: 'STN1',
      latitude: 40.7128,
      longitude: -74.006,
      city: 'City One',
      state: 'State One',
    };

    const station2Dto = {
      name: 'Station Two',
      code: 'STN2',
      latitude: 41.8781,
      longitude: -87.6298,
      city: 'City Two',
      state: 'State Two',
    };

    beforeAll(async () => {
      // Create stations for route testing
      const station1Response = await pactum
        .spec()
        .post('/stations')
        .withBody(station1Dto)
        .expectStatus(201)
        .returns('id');

      const station2Response = await pactum
        .spec()
        .post('/stations')
        .withBody(station2Dto)
        .expectStatus(201)
        .returns('id');

      station1Id = station1Response;
      station2Id = station2Response;
    });

    const routeDto = {
      trainNumber: 'T123',
      name: 'Express Route',
      startTime: '08:00',
      endTime: '12:00',
      stations: [
        {
          stationId: station1Id,
          sequence: 1,
          distanceFromStart: 0,
          estimatedDuration: 30,
          stopDuration: 5,
        },
        {
          stationId: station2Id,
          sequence: 2,
          distanceFromStart: 100,
          estimatedDuration: 45,
          stopDuration: 10,
        },
      ],
    };

    it('should create a route', () => {
      return pactum
        .spec()
        .post('/routes')
        .withBody(routeDto)
        .expectStatus(201)
        .stores('routeId', 'id');
    });

    it('should get all routes', () => {
      return pactum
        .spec()
        .get('/routes')
        .expectStatus(200)
        .expectJsonLength('$.data.length', 1);
    });

    it('should get a route by id', () => {
      return pactum
        .spec()
        .get('/routes/{id}')
        .withPathParams('id', '$S{routeId}')
        .expectStatus(200)
        .expectJsonLike({
          id: '$S{routeId}',
          trainNumber: routeDto.trainNumber,
          name: routeDto.name,
        });
    });

    it('should get a route by train number', () => {
      return pactum
        .spec()
        .get('/routes/train/{trainNumber}')
        .withPathParams('trainNumber', routeDto.trainNumber)
        .expectStatus(200)
        .expectJsonLike({
          trainNumber: routeDto.trainNumber,
          name: routeDto.name,
        });
    });

    it('should update a route', () => {
      const updatedRoute = {
        name: 'Updated Express Route',
        isActive: false,
      };

      return pactum
        .spec()
        .patch('/routes/{id}')
        .withPathParams('id', '$S{routeId}')
        .withBody(updatedRoute)
        .expectStatus(200)
        .expectJsonLike({
          id: '$S{routeId}',
          name: updatedRoute.name,
          isActive: updatedRoute.isActive,
        });
    });

    it('should delete a route', () => {
      return pactum
        .spec()
        .delete('/routes/{id}')
        .withPathParams('id', '$S{routeId}')
        .expectStatus(200);
    });

    afterAll(async () => {
      // Clean up stations
      await pactum.spec().delete('/stations/{id}').withPathParams('id', station1Id);
      await pactum.spec().delete('/stations/{id}').withPathParams('id', station2Id);
    });
  });

  describe('Route Statistics', () => {
    it('should get route statistics', () => {
      return pactum
        .spec()
        .get('/routes/stats')
        .expectStatus(200)
        .expectJsonLike({
          totalRoutes: 0,
          activeRoutes: 0,
          inactiveRoutes: 0,
        });
    });
  });

  describe('Search Stations', () => {
    const stationDto = {
      name: 'Grand Central',
      code: 'GCT',
      latitude: 40.7527,
      longitude: -73.9772,
      city: 'New York',
      state: 'NY',
    };

    beforeAll(async () => {
      await pactum
        .spec()
        .post('/stations')
        .withBody(stationDto)
        .expectStatus(201);
    });

    it('should search stations by name', () => {
      return pactum
        .spec()
        .get('/stations/search/{query}')
        .withPathParams('query', 'Grand')
        .expectStatus(200)
        .expectJsonLength('$.length', 1);
    });

    it('should search stations by code', () => {
      return pactum
        .spec()
        .get('/stations/search/{query}')
        .withPathParams('query', 'GCT')
        .expectStatus(200)
        .expectJsonLength('$.length', 1);
    });

    it('should search stations by city', () => {
      return pactum
        .spec()
        .get('/stations/search/{query}')
        .withPathParams('query', 'New York')
        .expectStatus(200)
        .expectJsonLength('$.length', 1);
    });

    afterAll(async () => {
      // Clean up station
      await pactum
        .spec()
        .get('/stations/search/{query}')
        .withPathParams('query', 'Grand')
        .expectStatus(200)
        .returns('[0].id')
        .then((id) => {
          return pactum.spec().delete('/stations/{id}').withPathParams('id', id);
        });
    });
  });
});