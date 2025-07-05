-- Run this in your Supabase SQL editor to check your profile
SELECT 
  id, 
  email, 
  name, 
  role, 
  subscription_end_date,
  created_at
FROM profiles 
WHERE email = 'nick.dunham@aol.com';

-- If the role is not 'admin', run this to fix it:
-- UPDATE profiles SET role = 'admin' WHERE email = 'nick.dunham@aol.com';

-- Also check the role column exists:
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';
