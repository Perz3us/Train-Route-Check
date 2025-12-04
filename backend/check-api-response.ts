import { LiveLocationsService } from './src/modules/live-locations/live-locations.service';

async function main() {
  console.log('Checking API response format...');
  
  // Mock PrismaService
  const mockPrismaService = {
    liveLocation: {
      findFirst: async () => ({
        id: '123',
        trainNumber: 'TRN_TEST',
        latitude: 10.0,
        longitude: 80.0,
        speed: 50,
        heading: 90,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findMany: async () => ([{
        id: '123',
        trainNumber: 'TRN_TEST',
        latitude: 10.0,
        longitude: 80.0,
        speed: 50,
        heading: 90,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }]),
    },
  };

  const service = new LiveLocationsService(mockPrismaService as any);
  const result = await service.getAllLatestLocations();

  console.log('Result:', JSON.stringify(result, null, 2));

  // Check if the first item has snake_case keys
  const item = result[0] as any;
  if (item.train_number === 'TRN_TEST' && item.trainNumber === undefined) {
    console.log('✅ SUCCESS: Response is in snake_case');
  } else {
    console.log('❌ FAILURE: Response is NOT in snake_case');
  }
}

main();
