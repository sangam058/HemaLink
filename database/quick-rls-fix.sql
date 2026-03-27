-- QUICK RLS FIX - IMMEDIATE SOLUTION
-- Run this in Supabase SQL Editor to fix 406/403 errors

-- 1. Disable RLS temporarily to test
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE donors DISABLE ROW LEVEL SECURITY;
ALTER TABLE requesters DISABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- 2. Re-enable RLS with simple policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE requesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 3. Create simple open policies
CREATE POLICY "Enable all access to profiles" ON profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all access to donors" ON donors
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all access to requesters" ON requesters
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all access to hospitals" ON hospitals
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all access to admins" ON admins
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Test the fix
SELECT 'Quick RLS fix applied' as status,
       'All tables now have open access policies' as message;
