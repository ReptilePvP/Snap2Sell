-- SQL to check current profile state
-- Run this in your Supabase SQL editor

-- Check if the role column exists in profiles table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';

-- Check your specific profile
SELECT id, name, email, role, created_at, updated_at
FROM profiles 
WHERE email = 'nick.dunham@aol.com';

-- Check all profiles to see role distribution
SELECT role, COUNT(*) as count
FROM profiles 
GROUP BY role
ORDER BY count DESC;

-- If your profile doesn't have admin role, run this to fix it:
-- UPDATE profiles SET role = 'admin' WHERE email = 'nick.dunham@aol.com';
