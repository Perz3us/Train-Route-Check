import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('Attempting to connect with Prisma...');
  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to the database!');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Query result:', result);
    
  } catch (e) {
    console.error('❌ Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
