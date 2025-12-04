import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Query to list all tables in the public schema
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    console.log('Tables in public schema:', tables);
  } catch (error) {
    console.error('Error querying tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
