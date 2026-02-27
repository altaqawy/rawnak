-- Run this once after your first successful login/signup.
-- Step 1: find your real auth user ID:
-- select id, email, created_at from auth.users order by created_at desc;
--
-- Step 2: replace <REAL_OWNER_USER_ID> with your UUID and run:
update public.user_roles
set role = 'owner',
    scopes = array['all']::public.content_scope[],
    updated_at = timezone('utc', now())
where user_id = '<REAL_OWNER_USER_ID>'::uuid;