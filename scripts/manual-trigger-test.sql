-- Test the trigger function manually
-- First, let's check if the user exists in auth.users
SELECT id, email, created_at FROM auth.users WHERE id = 'e7d534a0-04ae-48c1-a436-ce5e9c3ed0a8';

-- Then, let's manually call the trigger function to see if it works
-- We'll simulate what happens when a user is inserted
SELECT public.handle_new_user() AS trigger_result;

-- Check if a profile was created
SELECT * FROM profiles WHERE user_id = 'e7d534a0-04ae-48c1-a436-ce5e9c3ed0a8';