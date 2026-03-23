-- Supabase Database Schema for Hemalink
-- Run this in the Supabase SQL Editor

-- 0. Clean Up (Uncomment if you want a fresh start - WARNING: DELETES ALL DATA)
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.blood_inventory CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.blood_requests CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.hospitals CASCADE;
DROP TABLE IF EXISTS public.requesters CASCADE;
DROP TABLE IF EXISTS public.donors CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.blood_group CASCADE;
DROP TYPE IF EXISTS public.request_status CASCADE;
DROP TYPE IF EXISTS public.donation_status CASCADE;
DROP TYPE IF EXISTS public.hospital_status_enum CASCADE;
DROP TYPE IF EXISTS public.priority_enum CASCADE;

-- 1. Custom Types
CREATE TYPE user_role AS ENUM ('requester', 'donor', 'hospital', 'admin');
CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE request_status AS ENUM ('pending', 'donor_assigned', 'in_progress', 'fulfilled', 'rejected', 'cancelled');
CREATE TYPE donation_status AS ENUM ('scheduled', 'awaiting_confirmation', 'completed', 'cancelled', 'rejected');
CREATE TYPE hospital_status_enum AS ENUM ('pending_approval', 'active', 'suspended', 'rejected');
CREATE TYPE priority_enum AS ENUM ('emergency', 'urgent', 'normal');

-- 2. Profiles Table (base info for all users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role user_role NOT NULL,
  location JSONB NOT NULL,
  avatar TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.1 Donors Table
CREATE TABLE donors (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  blood_group blood_group NOT NULL,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges JSONB DEFAULT '[]'::jsonb,
  total_donations INTEGER DEFAULT 0,
  last_donation_date TIMESTAMP WITH TIME ZONE,
  is_available BOOLEAN DEFAULT TRUE
);

-- 2.2 Requesters Table
CREATE TABLE requesters (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  emergency_contact TEXT
);

-- 2.3 Hospitals Table
CREATE TABLE hospitals (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  hospital_name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  status hospital_status_enum DEFAULT 'pending_approval',
  verified_at TIMESTAMP WITH TIME ZONE
);

-- 2.4 Admins Table
CREATE TABLE admins (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  permissions JSONB DEFAULT '[]'::jsonb
);

-- 3. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE requesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Donors are viewable by everyone." ON donors FOR SELECT USING (true);
CREATE POLICY "Donors can update their own data." ON donors FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Requesters are viewable by everyone." ON requesters FOR SELECT USING (true);
CREATE POLICY "Requesters can update their own data." ON requesters FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Hospitals are viewable by everyone." ON hospitals FOR SELECT USING (true);
CREATE POLICY "Hospitals can update their own data." ON hospitals FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins are viewable by everyone." ON admins FOR SELECT USING (true);
CREATE POLICY "Admins can update their own data." ON admins FOR UPDATE USING (auth.uid() = id);

-- 4. Blood Requests Table
CREATE TABLE blood_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  requester_name TEXT,
  patient_name TEXT,
  blood_group blood_group NOT NULL,
  units INTEGER NOT NULL,
  hospital_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  hospital_name TEXT,
  location JSONB NOT NULL,
  date_needed TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  prescription TEXT,
  priority priority_enum NOT NULL,
  status request_status DEFAULT 'pending',
  assigned_donor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_donor_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Requests are viewable by everyone." ON blood_requests FOR SELECT USING (true);
CREATE POLICY "Requesters can create requests." ON blood_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Updates for requests." ON blood_requests FOR UPDATE USING (
  auth.uid() = requester_id OR 
  auth.uid() = assigned_donor_id OR 
  EXISTS(SELECT 1 FROM hospitals WHERE id = auth.uid() AND id = blood_requests.hospital_id)
);

-- 5. Donations Table
CREATE TABLE donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  donor_name TEXT,
  hospital_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  hospital_name TEXT,
  request_id UUID REFERENCES blood_requests(id) ON DELETE SET NULL,
  blood_group blood_group NOT NULL,
  units INTEGER NOT NULL,
  status donation_status DEFAULT 'scheduled',
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_date TIMESTAMP WITH TIME ZONE,
  points_earned INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donations viewable by participant and hospital." ON donations FOR SELECT USING (auth.uid() = donor_id OR auth.uid() = hospital_id);
CREATE POLICY "Donations manageable by donor or hospital." ON donations FOR ALL USING (auth.uid() = donor_id OR auth.uid() = hospital_id);

-- 6. Blood Inventory Table
CREATE TABLE blood_inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hospital_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blood_group blood_group NOT NULL,
  units INTEGER NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE blood_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory viewable by everyone." ON blood_inventory FOR SELECT USING (true);
CREATE POLICY "Hospitals manage their inventory." ON blood_inventory FOR ALL USING (auth.uid() = hospital_id);

-- 7. Campaigns Table
CREATE TABLE campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hospital_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hospital_name TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location JSONB NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  target_blood_groups blood_group[] DEFAULT '{}',
  target_units INTEGER NOT NULL,
  collected_units INTEGER DEFAULT 0,
  attendees UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campaigns are viewable by everyone." ON campaigns FOR SELECT USING (true);
CREATE POLICY "Hospitals manage their campaigns." ON campaigns FOR ALL USING (auth.uid() = hospital_id);
