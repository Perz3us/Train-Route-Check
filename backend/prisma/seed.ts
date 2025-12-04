import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
console.log('Current working directory:', process.cwd());
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

const prisma = new PrismaClient();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

console.log('SUPABASE_URL exists:', !!supabaseUrl);
console.log('DATABASE_URL exists:', !!databaseUrl);

if (!supabaseUrl || !supabaseServiceRoleKey || !databaseUrl) {
  console.error('Missing required env vars in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const adminEmail = 'admin@railtrack.lk';
  const adminPassword = 'admin123';
  const adminName = 'System Administrator';

  console.log(`Checking for admin user: ${adminEmail}`);

  // Check if admin profile already exists in our public schema
  const existingProfile = await prisma.profile.findUnique({
    where: { email: adminEmail },
  });

  if (existingProfile) {
    console.log('Admin profile already exists.');
    return;
  }

  console.log('Creating admin user in Supabase Auth...');

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: adminName },
  });

  if (authError) {
    console.error('Error creating auth user:', authError);
    // If user already exists in Auth but not in Profile, we might need to handle that.
    // For now, we'll assume if profile doesn't exist, we should try to create the auth user.
    // If auth user exists, we'll try to get their ID.
    if (authError.message.includes('already registered') || authError.status === 422) {
        console.log('User already registered in Auth, attempting to fetch ID...');
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        const user = listData.users.find(u => u.email === adminEmail);
        if (user) {
            await createProfile(user.id, adminEmail, adminName);
            return;
        }
    }
    process.exit(1);
  }

  if (authData.user) {
    await createProfile(authData.user.id, adminEmail, adminName);
  }
}

async function createProfile(id: string, email: string, fullName: string) {
    console.log(`Creating profile for user ${id}...`);
    try {
        await prisma.profile.create({
            data: {
              id: id,
              email: email,
              fullName: fullName,
              role: 'admin',
            },
          });
          console.log('Admin profile created successfully.');
    } catch (error) {
        console.error('Error creating profile:', error);
    }
}

main()
  .catch((e) => {
    console.error('SEED SCRIPT ERROR:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
