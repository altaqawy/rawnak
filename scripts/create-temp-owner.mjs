import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = 'owner@rawnak.test';
const PASSWORD = 'Owner123!';

async function main() {
  // Step 1: Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === EMAIL);

  let userId;

  if (existing) {
    console.log(`User ${EMAIL} already exists with ID: ${existing.id}`);
    userId = existing.id;
  } else {
    // Step 2: Create auth user
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: EMAIL,
        password: PASSWORD,
        email_confirm: true, // auto-confirm email
        user_metadata: { locale: 'ar' },
      });

    if (createError) {
      console.error('Failed to create user:', createError.message);
      process.exit(1);
    }

    userId = newUser.user.id;
    console.log(`Created user ${EMAIL} with ID: ${userId}`);
  }

  // Step 3: Update role to owner (the trigger already created a 'customer' row)
  const { error: roleError } = await supabase
    .from('user_roles')
    .update({
      role: 'owner',
      scopes: ['all'],
    })
    .eq('user_id', userId);

  if (roleError) {
    console.error('Failed to update role:', roleError.message);
    // Try inserting instead (in case the trigger didn't fire)
    const { error: insertError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'owner',
        scopes: ['all'],
      });

    if (insertError) {
      console.error('Failed to insert role:', insertError.message);
      process.exit(1);
    }
  }

  console.log(`\nTemporary owner account ready!`);
  console.log(`Email:    ${EMAIL}`);
  console.log(`Password: ${PASSWORD}`);
  console.log(`User ID:  ${userId}`);
  console.log(`Role:     owner`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
