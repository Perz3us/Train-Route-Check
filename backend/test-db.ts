
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('Testing Prisma Connection with DIRECT_URL...');
  const url = process.env.DIRECT_URL;
  console.log('DIRECT_URL defined:', !!url);
  if (url) {
      console.log('URL Host:', url.split('@')[1]);
  }

  const prisma = new PrismaClient({
      datasources: {
        db: {
          url: url,
        },
      },
      log: ['query', 'info', 'warn', 'error'],
  });

  try {
    await prisma.$connect();
    console.log('Successfully connected to database!');
    const count = await prisma.profile.count();
    console.log('Profile count:', count);
  } catch (e) {
    console.error('Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
