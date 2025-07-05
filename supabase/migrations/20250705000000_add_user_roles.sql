/*
  # Add User Roles System

  1. User Roles
    - guest: Not signed in, can preview the site but cannot use functions
    - user: Default role when they sign up, can only use Gemini API
    - paid: Can use all 3 API providers and image enhancer  
    - admin: Full access including image enhancer and all features

  2. Changes
    - Add role column to profiles table
    - Add subscription_end_date for paid users
    - Add policies for role-based access
    - Create functions for role management

  3. Security
    - RLS policies updated for role-based access
    - Default role assignment on signup
*/

-- Add role enum type
CREATE TYPE user_role AS ENUM ('guest', 'user', 'paid', 'admin');

-- Add role and subscription columns to profiles table
ALTER TABLE profiles 
ADD COLUMN role user_role DEFAULT 'user',
ADD COLUMN subscription_end_date timestamptz,
ADD COLUMN created_by_admin boolean DEFAULT false;

-- Update existing users to have 'user' role
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- Set specific admin user
UPDATE profiles SET role = 'admin' WHERE email = 'nick.dunham@aol.com';

-- Create index for role-based queries
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_subscription ON profiles(subscription_end_date) WHERE subscription_end_date IS NOT NULL;

-- Function to check if user has paid access
CREATE OR REPLACE FUNCTION has_paid_access(user_id uuid)
RETURNS boolean AS $$
DECLARE
  user_role user_role;
  sub_end_date timestamptz;
BEGIN
  SELECT role, subscription_end_date 
  INTO user_role, sub_end_date
  FROM profiles 
  WHERE id = user_id;
  
  -- Admin always has access
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Check if paid role and subscription is active
  IF user_role = 'paid' AND (sub_end_date IS NULL OR sub_end_date > now()) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access image enhancer
CREATE OR REPLACE FUNCTION can_access_image_enhancer(user_id uuid)
RETURNS boolean AS $$
DECLARE
  user_role user_role;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = user_id;
  
  -- Only admin and paid users can access image enhancer
  RETURN user_role IN ('admin', 'paid');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get allowed API providers for user
CREATE OR REPLACE FUNCTION get_allowed_api_providers(user_id uuid)
RETURNS text[] AS $$
DECLARE
  user_role user_role;
  sub_end_date timestamptz;
  providers text[];
BEGIN
  SELECT role, subscription_end_date 
  INTO user_role, sub_end_date
  FROM profiles 
  WHERE id = user_id;
  
  -- Admin and paid users get all providers
  IF user_role = 'admin' OR (user_role = 'paid' AND (sub_end_date IS NULL OR sub_end_date > now())) THEN
    providers := ARRAY['GEMINI', 'SERPAPI', 'SEARCHAPI', 'OPENLENS'];
  -- Regular users only get Gemini
  ELSIF user_role = 'user' THEN
    providers := ARRAY['GEMINI'];
  -- Guests get nothing
  ELSE
    providers := ARRAY[]::text[];
  END IF;
  
  RETURN providers;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the profiles trigger to set default role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    new.email,
    'user'::user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for role-based access to scans table
-- Users can only access their own scans, but admins can see usage statistics

-- Admin policy for viewing all scans (for statistics)
CREATE POLICY "Admins can read all scans for statistics"
  ON scans
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update scan creation to check API provider access
CREATE OR REPLACE FUNCTION check_api_provider_access()
RETURNS trigger AS $$
DECLARE
  allowed_providers text[];
BEGIN
  -- Get allowed providers for the user
  SELECT get_allowed_api_providers(NEW.user_id) INTO allowed_providers;
  
  -- Check if the API provider is allowed
  IF NOT (NEW.api_provider = ANY(allowed_providers)) THEN
    RAISE EXCEPTION 'Access denied: User does not have permission to use % API provider', NEW.api_provider;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to check API provider access when creating scans
CREATE TRIGGER check_scan_api_provider_access
  BEFORE INSERT ON scans
  FOR EACH ROW
  EXECUTE FUNCTION check_api_provider_access();

-- Create a view for user statistics (for admins)
-- Note: Access control for views is handled at the application level
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
  p.role,
  COUNT(DISTINCT p.id) as user_count,
  COUNT(s.id) as total_scans,
  COUNT(DISTINCT s.api_provider) as unique_providers_used,
  AVG(CASE WHEN s.created_at >= now() - interval '30 days' THEN 1 ELSE 0 END) as avg_monthly_activity
FROM profiles p
LEFT JOIN scans s ON p.id = s.user_id
GROUP BY p.role;

-- Grant access to the view for authenticated users
-- Application-level access control will ensure only admins can query this view
GRANT SELECT ON user_statistics TO authenticated;
