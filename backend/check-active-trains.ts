import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const count = await prisma.liveLocation.count({
    where: {
      timestamp: {
        gte: fiveMinutesAgo,
      },
    },
  });
  console.log('COUNT:', count);
  const all = await prisma.liveLocation.findMany();
  console.log('ALL LOCATIONS:', JSON.stringify(all, null, 2));
}

check()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
