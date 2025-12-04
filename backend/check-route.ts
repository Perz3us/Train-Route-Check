
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const route = await prisma.route.findUnique({
    where: { trainNumber: 'TRN_001' },
  });

  if (route) {
    console.log('Route found:', route);
  } else {
    console.log('Route NOT found for TRN_001');
    
    // Check if any route exists
    const allRoutes = await prisma.route.findMany();
    console.log('All existing routes:', allRoutes.map(r => r.trainNumber));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
