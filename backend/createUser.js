require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'password';
  let userId;
  let userEmail;

  // Check if user already exists
  const { data: { users }, error: findError } = await supabase.auth.admin.listUsers();
  if (findError) {
      console.error('Error fetching users:', findError.message);
      return;
  }

  const existingUser = users.find(u => u.email === adminEmail);

  if (existingUser) {
    console.log(`User ${adminEmail} already exists.`);
    userId = existingUser.id;
    userEmail = existingUser.email;
  } else {
    console.log(`User ${adminEmail} not found, creating...`);
    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (authError) {
      console.error('Error creating user in Auth:', authError.message);
      return;
    }
    console.log('User created successfully in Auth:', authData.user.id);
    userId = authData.user.id;
    userEmail = authData.user.email;
  }

  // 2. Insert or update the user's profile in the 'profiles' table
  console.log(`Upserting profile for user ID: ${userId}`);
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId, // Link to the auth.users table
        email: userEmail,
        role: 'admin', // Set the admin role
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (profileError) {
    console.error('Error upserting user profile:', profileError.message);
    return;
  }

  console.log('User profile upserted successfully.');
}

createAdminUser();