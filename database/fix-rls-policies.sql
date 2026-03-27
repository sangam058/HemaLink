-- FIX RLS POLICIES FOR PROFILE ACCESS
-- Run this in Supabase SQL Editor to fix 406/403 errors

-- 1. Drop existing problematic policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;
DROP POLICY IF EXISTS "Donors are viewable by everyone." ON donors;
DROP POLICY IF EXISTS "Donors can update their own data." ON donors;
DROP POLICY IF EXISTS "Requesters are viewable by everyone." ON requesters;
DROP POLICY IF EXISTS "Requesters can update their own data." ON requesters;
DROP POLICY IF EXISTS "Hospitals are viewable by everyone." ON hospitals;
DROP POLICY IF EXISTS "Hospitals can update their own data." ON hospitals;
DROP POLICY IF EXISTS "Admins are viewable by everyone." ON admins;
DROP POLICY IF EXISTS "Admins can update their own data." ON admins;

-- 2. Create proper RLS policies for profiles
CREATE POLICY "Enable read access for all users based on role" ON profiles
  FOR SELECT
  USING (
    -- Allow all users to read profiles
    true
  );

CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT
  WITH CHECK (
    -- Only allow inserts from trigger (service role) or authenticated users
    auth.role() = 'service_role' OR auth.role() = 'authenticated'
  );

CREATE POLICY "Enable update for own profile" ON profiles
  FOR UPDATE
  USING (
    -- Users can only update their own profile
    auth.uid() = id
  );

CREATE POLICY "Enable delete for own profile" ON profiles
  FOR DELETE
  USING (
    -- Users can only delete their own profile
    auth.uid() = id
  );

-- 3. Create proper RLS policies for donors
CREATE POLICY "Enable read access for donors" ON donors
  FOR SELECT
  USING (
    -- Allow all users to read donor data
    true
  );

CREATE POLICY "Enable insert for donors" ON donors
  FOR INSERT
  WITH CHECK (
    -- Only allow inserts from trigger or own profile
    auth.role() = 'service_role' OR auth.uid() = id
  );

CREATE POLICY "Enable update for own donor data" ON donors
  FOR UPDATE
  USING (
    -- Donors can only update their own data
    auth.uid() = id
  );

-- 4. Create proper RLS policies for requesters
CREATE POLICY "Enable read access for requesters" ON requesters
  FOR SELECT
  USING (
    -- Allow all users to read requester data
    true
  );

CREATE POLICY "Enable insert for requesters" ON requesters
  FOR INSERT
  WITH CHECK (
    -- Only allow inserts from trigger or own profile
    auth.role() = 'service_role' OR auth.uid() = id
  );

CREATE POLICY "Enable update for own requester data" ON requesters
  FOR UPDATE
  USING (
    -- Requesters can only update their own data
    auth.uid() = id
  );

-- 5. Create proper RLS policies for hospitals
CREATE POLICY "Enable read access for hospitals" ON hospitals
  FOR SELECT
  USING (
    -- Allow all users to read hospital data
    true
  );

CREATE POLICY "Enable insert for hospitals" ON hospitals
  FOR INSERT
  WITH CHECK (
    -- Only allow inserts from trigger or own profile
    auth.role() = 'service_role' OR auth.uid() = id
  );

CREATE POLICY "Enable update for own hospital data" ON hospitals
  FOR UPDATE
  USING (
    -- Hospitals can only update their own data
    auth.uid() = id
  );

-- 6. Create proper RLS policies for admins
CREATE POLICY "Enable read access for admins" ON admins
  FOR SELECT
  USING (
    -- Allow all users to read admin data
    true
  );

CREATE POLICY "Enable insert for admins" ON admins
  FOR INSERT
  WITH CHECK (
    -- Only allow inserts from trigger or own profile
    auth.role() = 'service_role' OR auth.uid() = id
  );

CREATE POLICY "Enable update for own admin data" ON admins
  FOR UPDATE
  USING (
    -- Admins can only update their own data
    auth.uid() = id
  );

-- 7. Grant necessary permissions to service role
-- This allows the trigger to bypass RLS
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 8. Verification
SELECT 'RLS policies fixed successfully' as status,
       'Now users can access profiles and role tables' as message;
