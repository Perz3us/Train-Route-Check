import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking live_locations data...');
  try {
    const locations = await prisma.liveLocation.findMany({
        orderBy: { updatedAt: 'desc' }
    });
    console.log('Found locations:', locations.length);
    console.log(JSON.stringify(locations, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
