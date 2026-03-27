-- PROFESSIONAL PRODUCTION HARDENING FOR HEMALINK
-- This script enables RLS on ALL tables and applies restrictive policies.

--------------------------------------------------------------------------------
-- 0. PREAMBLE: Enable RLS on all tables
--------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE requesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE debug_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- 1. PROFILES
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

--------------------------------------------------------------------------------
-- 2. ROLE TABLES (Donors, Hospitals, Requesters)
--------------------------------------------------------------------------------
-- Donors
DROP POLICY IF EXISTS "Donor basic info viewable by authenticated" ON donors;
CREATE POLICY "Donor basic info viewable by authenticated" ON donors
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Donors can update own data" ON donors;
CREATE POLICY "Donors can update own data" ON donors
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Hospitals
DROP POLICY IF EXISTS "Hospitals are viewable by authenticated" ON hospitals;
CREATE POLICY "Hospitals are viewable by authenticated" ON hospitals
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Hospitals can update own data" ON hospitals;
CREATE POLICY "Hospitals can update own data" ON hospitals
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Requesters
DROP POLICY IF EXISTS "Requesters are viewable by authenticated" ON requesters;
CREATE POLICY "Requesters are viewable by authenticated" ON requesters
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Requesters can update own data" ON requesters;
CREATE POLICY "Requesters can update own data" ON requesters
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

--------------------------------------------------------------------------------
-- 3. BLOOD REQUESTS
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Blood requests viewable by authenticated" ON blood_requests;
CREATE POLICY "Blood requests viewable by authenticated" ON blood_requests
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create own requests" ON blood_requests;
CREATE POLICY "Users can create own requests" ON blood_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can update own requests" ON blood_requests;
CREATE POLICY "Users can update own requests" ON blood_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() IN (SELECT id FROM admins));

--------------------------------------------------------------------------------
-- 4. DONATIONS
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Involved parties can view donations" ON donations;
CREATE POLICY "Involved parties can view donations" ON donations
  FOR SELECT TO authenticated
  USING (
    auth.uid() = donor_id OR 
    auth.uid() = hospital_id OR 
    auth.uid() IN (SELECT id FROM admins)
  );

DROP POLICY IF EXISTS "Authorized parties can manage donations" ON donations;
CREATE POLICY "Authorized parties can manage donations" ON donations
  FOR ALL TO authenticated
  USING (auth.uid() = hospital_id OR auth.uid() IN (SELECT id FROM admins));

--------------------------------------------------------------------------------
-- 5. BLOOD INVENTORY
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Inventory viewable by authenticated" ON blood_inventory;
CREATE POLICY "Inventory viewable by authenticated" ON blood_inventory
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Hospitals can manage own inventory" ON blood_inventory;
CREATE POLICY "Hospitals can manage own inventory" ON blood_inventory
  FOR ALL TO authenticated
  USING (auth.uid() = hospital_id)
  WITH CHECK (auth.uid() = hospital_id);

--------------------------------------------------------------------------------
-- 6. CAMPAIGNS
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Campaigns viewable by authenticated" ON campaigns;
CREATE POLICY "Campaigns viewable by authenticated" ON campaigns
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Hospitals can manage own campaigns" ON campaigns;
CREATE POLICY "Hospitals can manage own campaigns" ON campaigns
  FOR ALL TO authenticated
  USING (auth.uid() = hospital_id)
  WITH CHECK (auth.uid() = hospital_id);

--------------------------------------------------------------------------------
-- 7. ADMINS & LOGS
--------------------------------------------------------------------------------
-- Admins table restricted to admins
DROP POLICY IF EXISTS "Admins viewable by admins" ON admins;
CREATE POLICY "Admins viewable by admins" ON admins
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT id FROM admins));

-- Debug logs restricted to admins
DROP POLICY IF EXISTS "Debug logs viewable by admins" ON debug_logs;
CREATE POLICY "Debug logs viewable by admins" ON debug_logs
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT id FROM admins));

--------------------------------------------------------------------------------
-- 8. NOTIFICATIONS
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System & Admins can create notifications" ON notifications;
CREATE POLICY "System & Admins can create notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

--------------------------------------------------------------------------------
-- 9. REALTIME REPLICATION
--------------------------------------------------------------------------------
-- Ensure critical tables are in the publication
BEGIN;
  -- Remove existing if any to avoid errors on duplicate addition
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS blood_requests, donations, blood_inventory, notifications;
  -- Add them all back
  ALTER PUBLICATION supabase_realtime ADD TABLE blood_requests, donations, blood_inventory, notifications;
COMMIT;
