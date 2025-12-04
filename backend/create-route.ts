
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if it already exists
  const existing = await prisma.route.findUnique({
    where: { trainNumber: 'TRN_001' },
  });

  if (existing) {
    console.log('Route TRN_001 already exists.');
    return;
  }

  // Create the route
  const route = await prisma.route.create({
    data: {
      trainNumber: 'TRN_001',
      name: 'Colombo - Kandy Express',
      isActive: true,
      startTime: new Date('1970-01-01T06:00:00Z'),
      endTime: new Date('1970-01-01T09:00:00Z'),
    },
  });

  console.log('Created route:', route);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
