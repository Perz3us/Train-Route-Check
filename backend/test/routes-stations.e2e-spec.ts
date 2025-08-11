import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';

describe('Routes and Stations (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
    
    // Set up Pactum
    pactum.request.setBaseUrl(`http://localhost:${process.env.PORT || 3001}`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Stations', () => {
    const stationDto = {
      name: 'Test Station',
      code: 'TST',
      latitude: 40.7128,
      longitude: -74.006,
      city: 'Test City',
      state: 'Test State',
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
        name: 'Updated Station',
        city: 'Updated City',
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
        .expectStatus(204);
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
      name: 'Test Route',
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
        name: 'Updated Route',
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
});