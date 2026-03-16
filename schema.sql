-- Supabase Database Schema for Hemalink
-- Run this in the Supabase SQL Editor

-- 1. Custom Types
CREATE TYPE user_role AS ENUM ('requester', 'donor', 'hospital', 'admin');
CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE request_status AS ENUM ('pending', 'donor_assigned', 'in_progress', 'fulfilled', 'rejected', 'cancelled');
CREATE TYPE donation_status AS ENUM ('scheduled', 'awaiting_confirmation', 'completed', 'cancelled', 'rejected');
CREATE TYPE hospital_status_enum AS ENUM ('pending_approval', 'active', 'suspended', 'rejected');
CREATE TYPE priority_enum AS ENUM ('emergency', 'urgent', 'normal');

-- 2. Profiles Table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- Storing passwords in profiles if not using auth completely, but let's assume auth handles passwords
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role user_role NOT NULL,
  blood_group blood_group,
  location JSONB NOT NULL,
  avatar TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Donor specific
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges JSONB DEFAULT '[]'::JSONB,
  total_donations INTEGER DEFAULT 0,
  last_donation_date TIMESTAMP WITH TIME ZONE,
  is_available BOOLEAN DEFAULT TRUE,
  
  -- Requester specific
  emergency_contact TEXT,

  -- Hospital specific
  hospital_name TEXT,
  license_number TEXT,
  hospital_status hospital_status_enum,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Admin specific
  permissions JSONB DEFAULT '[]'::JSONB
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger for automatically creating a profile for new users (if using Supabase Auth signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role, location, blood_group, hospital_name, license_number)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone',
    (new.raw_user_meta_data->>'role')::user_role,
    (new.raw_user_meta_data->>'location')::jsonb,
    (new.raw_user_meta_data->>'bloodGroup')::blood_group,
    new.raw_user_meta_data->>'hospitalName',
    new.raw_user_meta_data->>'licenseNumber'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: In this project we'll just insert straight to profiles for simplicity, or use auth trigger.

-- 3. Blood Requests Table
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

-- Enable RLS for blood_requests
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requests are viewable by everyone." ON blood_requests
  FOR SELECT USING (true);

CREATE POLICY "Requesters can create requests." ON blood_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Requesters and assigned donors can update requests." ON blood_requests
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = assigned_donor_id OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'hospital' AND id = blood_requests.hospital_id));

-- 4. Donations Table
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

-- Enable RLS for donations
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Donations viewable by participant and hospital." ON donations
  FOR SELECT USING (auth.uid() = donor_id OR auth.uid() = hospital_id);

CREATE POLICY "Donors can create donations." ON donations
  FOR INSERT WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Donors and hospitals can update donations." ON donations
  FOR UPDATE USING (auth.uid() = donor_id OR auth.uid() = hospital_id);

-- 5. Blood Inventory Table
CREATE TABLE blood_inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hospital_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blood_group blood_group NOT NULL,
  units INTEGER NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(hospital_id, blood_group)
);

-- Enable RLS for blood_inventory
ALTER TABLE blood_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inventory is viewable by everyone." ON blood_inventory
  FOR SELECT USING (true);

CREATE POLICY "Hospitals can update their inventory." ON blood_inventory
  FOR ALL USING (auth.uid() = hospital_id);

-- 6. Campaigns Table
CREATE TABLE campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hospital_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hospital_name TEXT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location JSONB NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  target_blood_groups blood_group[] NOT NULL,
  target_units INTEGER NOT NULL,
  collected_units INTEGER DEFAULT 0,
  attendees UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaigns are viewable by everyone." ON campaigns
  FOR SELECT USING (true);

CREATE POLICY "Hospitals can create and update their campaigns." ON campaigns
  FOR ALL USING (auth.uid() = hospital_id);

-- 7. Dummy Data for Sangam Admin
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000000', 'sangam@gmail.com', crypt('sangam362004', gen_salt('bf')), now(), '{"name":"Sangam Admin","phone":"+91 9999999999","role":"admin","location":{"address":"HQ","city":"New Delhi","state":"Delhi","country":"India","lat":28.6139,"lng":77.2090}}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Optionally turn on realtime for these tables
alter publication supabase_realtime add table profiles, blood_requests, donations, blood_inventory, campaigns;
