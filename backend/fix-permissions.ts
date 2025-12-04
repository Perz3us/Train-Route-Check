
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DIRECT_URL, // Use direct connection for admin tasks
      },
    },
});

async function fixPermissions() {
  console.log('Granting permissions to service_role and anon...');
  try {
    // Grant usage on schema public
    await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO service_role;`);
    await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO anon;`);

    // Grant all privileges on all tables in schema public
    await prisma.$executeRawUnsafe(`GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;`);
    await prisma.$executeRawUnsafe(`GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;`);
    
    // Grant all privileges on all sequences (for auto-increment IDs)
    await prisma.$executeRawUnsafe(`GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;`);
    await prisma.$executeRawUnsafe(`GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;`);

    console.log('✅ Permissions granted successfully.');
  } catch (e) {
    console.error('❌ Failed to grant permissions:', e);
  } finally {
    await prisma.$disconnect();
  }
}

fixPermissions();
