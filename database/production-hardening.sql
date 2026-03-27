-- PRODUCTION HARDENING FOR HEMALINK
-- This script applies more restrictive RLS policies for a real-world scenario.

-- 1. PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users based on role" ON profiles;
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. DONORS
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for donors" ON donors;
CREATE POLICY "Donor basic info viewable by authenticated" ON donors
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Enable update for own donor data" ON donors;
CREATE POLICY "Donors can update own data" ON donors
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. BLOOD REQUESTS
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Blood requests are viewable by everyone" ON blood_requests;
CREATE POLICY "Blood requests viewable by authenticated" ON blood_requests
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create blood requests" ON blood_requests;
CREATE POLICY "Users can create own requests" ON blood_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can update own blood requests" ON blood_requests;
CREATE POLICY "Users can update own requests" ON blood_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() IN (SELECT id FROM admins));

-- 4. DONATIONS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Donations are viewable by involved parties" ON donations;
CREATE POLICY "Involved parties can view donations" ON donations
  FOR SELECT TO authenticated
  USING (
    auth.uid() = donor_id OR 
    auth.uid() = hospital_id OR 
    auth.uid() IN (SELECT id FROM admins)
  );

-- 5. BLOOD INVENTORY
ALTER TABLE blood_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Inventory is viewable by everyone" ON blood_inventory;
CREATE POLICY "Inventory viewable by authenticated" ON blood_inventory
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Hospitals can manage their inventory" ON blood_inventory;
CREATE POLICY "Hospitals can manage own inventory" ON blood_inventory
  FOR ALL TO authenticated
  USING (auth.uid() = hospital_id)
  WITH CHECK (auth.uid() = hospital_id);

-- 6. CAMPAIGNS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Campaigns are viewable by everyone" ON campaigns;
CREATE POLICY "Campaigns viewable by authenticated" ON campaigns
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Hospitals can manage their campaigns" ON campaigns;
CREATE POLICY "Hospitals can manage own campaigns" ON campaigns
  FOR ALL TO authenticated
  USING (auth.uid() = hospital_id)
  WITH CHECK (auth.uid() = hospital_id);

-- 7. REALTIME REPLICATION
-- Ensure important tables are in the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE blood_requests, donations, blood_inventory, notifications;
