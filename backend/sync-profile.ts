import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const prisma = new PrismaClient();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function main() {
  const adminEmail = 'admin@railtrack.lk';
  console.log(`Checking sync for ${adminEmail}...`);

  // 1. Check if user exists in Supabase Auth
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing auth users:', listError);
    return;
  }

  const authUser = listData.users.find(u => u.email === adminEmail);

  if (!authUser) {
    console.error('Admin user NOT found in Supabase Auth. Please run seed again.');
    return;
  }

  console.log(`Found Auth User: ${authUser.id}`);

  // 2. Check if profile exists in Prisma
  const profile = await prisma.profile.findUnique({
    where: { id: authUser.id },
  });

  if (profile) {
    console.log('Profile already exists:', profile);
  } else {
    console.log('Profile missing! Creating now...');
    try {
      const newProfile = await prisma.profile.create({
        data: {
          id: authUser.id,
          email: authUser.email!,
          fullName: 'System Administrator',
          role: 'admin',
        },
      });
      console.log('Created profile:', newProfile);
    } catch (e) {
      console.error('Error creating profile:', e);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
