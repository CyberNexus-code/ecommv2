import { createAdminClient } from '../../src/lib/supabase/admin'

async function createTestUser() {
  const supabase = createAdminClient();
  const email = 'testuser@example.com';
  const password = 'TestPassword123!';

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }

  console.log('Test user created:', data.user);
}

createTestUser();
