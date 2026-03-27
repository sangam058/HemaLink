-- ADMIN RLS OVERRIDE PATCH
-- This script replaces restrictive Row Level Security (RLS) policies 
-- with policies that grant administrative accounts full access to manage records.

-- 1. Profiles
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (
  auth.uid() = id OR 
  EXISTS(SELECT 1 FROM admins WHERE id = auth.uid())
);

-- 2. Donors
DROP POLICY IF EXISTS "Donors can update their own data." ON donors;
CREATE POLICY "Donors can update their own data." ON donors FOR UPDATE USING (
  auth.uid() = id OR 
  EXISTS(SELECT 1 FROM admins WHERE id = auth.uid())
);

-- 3. Requesters
DROP POLICY IF EXISTS "Requesters can update their own data." ON requesters;
CREATE POLICY "Requesters can update their own data." ON requesters FOR UPDATE USING (
  auth.uid() = id OR 
  EXISTS(SELECT 1 FROM admins WHERE id = auth.uid())
);

-- 4. Hospitals
DROP POLICY IF EXISTS "Hospitals can update their own data." ON hospitals;
CREATE POLICY "Hospitals can update their own data." ON hospitals FOR UPDATE USING (
  auth.uid() = id OR 
  EXISTS(SELECT 1 FROM admins WHERE id = auth.uid())
);

-- 5. Blood Requests
DROP POLICY IF EXISTS "Updates for requests." ON blood_requests;
CREATE POLICY "Updates for requests." ON blood_requests FOR UPDATE USING (
  auth.uid() = requester_id OR 
  auth.uid() = assigned_donor_id OR 
  EXISTS(SELECT 1 FROM hospitals WHERE id = auth.uid() AND id = blood_requests.hospital_id) OR
  EXISTS(SELECT 1 FROM admins WHERE id = auth.uid())
);

-- 6. Donations
DROP POLICY IF EXISTS "Donations viewable by participant and hospital." ON donations;
CREATE POLICY "Donations viewable by participant and hospital." ON donations FOR SELECT USING (
  auth.uid() = donor_id OR 
  auth.uid() = hospital_id OR
  EXISTS(SELECT 1 FROM admins WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Donations manageable by donor or hospital." ON donations;
CREATE POLICY "Donations manageable by donor or hospital." ON donations FOR ALL USING (
  auth.uid() = donor_id OR 
  auth.uid() = hospital_id OR
  EXISTS(SELECT 1 FROM admins WHERE id = auth.uid())
);

-- 7. Blood Inventory
DROP POLICY IF EXISTS "Hospitals manage their inventory." ON blood_inventory;
CREATE POLICY "Hospitals manage their inventory." ON blood_inventory FOR ALL USING (
  auth.uid() = hospital_id OR
  EXISTS(SELECT 1 FROM admins WHERE id = auth.uid())
);

-- 8. Campaigns
DROP POLICY IF EXISTS "Hospitals manage their campaigns." ON campaigns;
CREATE POLICY "Hospitals manage their campaigns." ON campaigns FOR ALL USING (
  auth.uid() = hospital_id OR
  EXISTS(SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Success message
SELECT 'Admin RLS overrides applied successfully' as status;
