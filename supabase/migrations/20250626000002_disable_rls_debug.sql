/*
  # Temporarily disable RLS for debugging
  
  This will help us test if the issue is with RLS policies or something else.
  We can re-enable it once we confirm the basic functionality works.
*/

-- Temporarily disable RLS on scans table
ALTER TABLE scans DISABLE ROW LEVEL SECURITY;
