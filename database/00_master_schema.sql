-- 00_master_schema.sql
-- HemaLink Master Database Schema
-- Run this in the Supabase SQL Editor (Click the solid green "Run" button) to perform a clean, professional restart

-- 0. Deep Cleanup (Safely drop everything so we start fresh)
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.blood_inventory CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.blood_requests CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.debug_logs CASCADE;

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

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.call_notification_hub() CASCADE;

-- 1. Custom Types
CREATE TYPE user_role AS ENUM ('requester', 'donor', 'hospital', 'admin');
CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE request_status AS ENUM ('pending', 'donor_assigned', 'in_progress', 'fulfilled', 'rejected', 'cancelled');
CREATE TYPE donation_status AS ENUM ('scheduled', 'awaiting_confirmation', 'completed', 'cancelled', 'rejected');
CREATE TYPE hospital_status_enum AS ENUM ('pending_approval', 'active', 'suspended', 'rejected');
CREATE TYPE priority_enum AS ENUM ('emergency', 'urgent', 'normal');

-- 2. Base Tables
-- 2.0 Profiles Table (base info for all users)
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

-- 2.5 Blood Requests Table
CREATE TABLE blood_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- 2.6 Donations Table
CREATE TABLE donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- 2.7 Blood Inventory Table
CREATE TABLE blood_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blood_group blood_group NOT NULL,
  units INTEGER NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.8 Campaigns Table
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- 2.9 Notifications Table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.10 Debug Logs Table
CREATE TABLE debug_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT DEFAULT 'info',
  message TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Row Level Security Setup
-- Enable RLS everywhere
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE requesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE debug_logs ENABLE ROW LEVEL SECURITY;

-- 4. Unified RLS Policies (With Admin Override)
-- Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id OR EXISTS(SELECT 1 FROM admins WHERE id = auth.uid()));

-- Donors
CREATE POLICY "Donors are viewable by everyone." ON donors FOR SELECT USING (true);
CREATE POLICY "Donors can update their own data." ON donors FOR UPDATE USING (auth.uid() = id OR EXISTS(SELECT 1 FROM admins WHERE id = auth.uid()));

-- Requesters
CREATE POLICY "Requesters are viewable by everyone." ON requesters FOR SELECT USING (true);
CREATE POLICY "Requesters can update their own data." ON requesters FOR UPDATE USING (auth.uid() = id OR EXISTS(SELECT 1 FROM admins WHERE id = auth.uid()));

-- Hospitals
CREATE POLICY "Hospitals are viewable by everyone." ON hospitals FOR SELECT USING (true);
CREATE POLICY "Hospitals can update their own data." ON hospitals FOR UPDATE USING (auth.uid() = id OR EXISTS(SELECT 1 FROM admins WHERE id = auth.uid()));

-- Admins
CREATE POLICY "Admins are viewable by everyone." ON admins FOR SELECT USING (true);
CREATE POLICY "Admins can update their own data." ON admins FOR UPDATE USING (auth.uid() = id OR EXISTS(SELECT 1 FROM admins WHERE id = auth.uid()));

-- Blood Requests
CREATE POLICY "Requests are viewable by everyone." ON blood_requests FOR SELECT USING (true);
CREATE POLICY "Requesters can create requests." ON blood_requests FOR INSERT WITH CHECK (auth.uid() = requester_id OR EXISTS(SELECT 1 FROM admins WHERE id = auth.uid()));
CREATE POLICY "Updates for requests." ON blood_requests FOR UPDATE USING (
  auth.uid() = requester_id OR 
  auth.uid() = assigned_donor_id OR 
  EXISTS(SELECT 1 FROM hospitals WHERE id = auth.uid() AND id = blood_requests.hospital_id) OR
  EXISTS(SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Donations
CREATE POLICY "Donations viewable by participant and hospital." ON donations FOR SELECT USING (
  auth.uid() = donor_id OR 
  auth.uid() = hospital_id OR
  EXISTS(SELECT 1 FROM admins WHERE id = auth.uid())
);
CREATE POLICY "Donations manageable by donor or hospital." ON donations FOR ALL USING (
  auth.uid() = donor_id OR 
  auth.uid() = hospital_id OR
  EXISTS(SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Blood Inventory
CREATE POLICY "Inventory viewable by everyone." ON blood_inventory FOR SELECT USING (true);
CREATE POLICY "Hospitals manage their inventory." ON blood_inventory FOR ALL USING (
  auth.uid() = hospital_id OR
  EXISTS(SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Campaigns
CREATE POLICY "Campaigns are viewable by everyone." ON campaigns FOR SELECT USING (true);
CREATE POLICY "Hospitals manage their campaigns." ON campaigns FOR ALL USING (
  auth.uid() = hospital_id OR
  EXISTS(SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id OR EXISTS(SELECT 1 FROM admins WHERE id = auth.uid()));
CREATE POLICY "Users can mark own notifications as read" ON notifications FOR UPDATE USING (auth.uid() = user_id OR EXISTS(SELECT 1 FROM admins WHERE id = auth.uid()));
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Debug Logs
CREATE POLICY "System can insert logs" ON debug_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view logs" ON debug_logs FOR SELECT USING (EXISTS(SELECT 1 FROM admins WHERE id = auth.uid()));

-- 5. Helper Functions & Triggers
-- Bulletproof User Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  extracted_role public.user_role;
  default_role public.user_role := 'donor'::public.user_role;
  extracted_name TEXT;
  extracted_phone TEXT;
BEGIN
  -- Strict parsing
  BEGIN
    extracted_role := COALESCE(new.raw_user_meta_data->>'role', default_role::text)::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    extracted_role := default_role;
  END;

  extracted_name := COALESCE(new.raw_user_meta_data->>'name', 'User ' || substr(new.id::text, 1, 8));
  extracted_phone := COALESCE(new.raw_user_meta_data->>'phone', '');

  -- 1. Base Profile Mapping
  BEGIN
    INSERT INTO public.profiles (id, email, name, phone, role, location, is_verified)
    VALUES (
      new.id,
      new.email,
      extracted_name,
      extracted_phone,
      extracted_role,
      COALESCE(new.raw_user_meta_data->'location', '{"city": "Mumbai", "address": "Not provided"}'::jsonb),
      false
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Profile insertion failed: %', SQLERRM;
    RETURN NEW;
  END;

  -- 2. Role Specific Mapping
  BEGIN
    CASE extracted_role
      WHEN 'donor' THEN
        INSERT INTO public.donors (id, blood_group)
        VALUES (new.id, COALESCE((new.raw_user_meta_data->>'bloodGroup')::public.blood_group, 'O+'::public.blood_group))
        ON CONFLICT (id) DO NOTHING;
      WHEN 'requester' THEN
        INSERT INTO public.requesters (id, emergency_contact)
        VALUES (new.id, COALESCE(new.raw_user_meta_data->>'emergencyContact', ''))
        ON CONFLICT (id) DO NOTHING;
      WHEN 'hospital' THEN
        INSERT INTO public.hospitals (id, hospital_name, license_number, status)
        VALUES (
          new.id, 
          COALESCE(new.raw_user_meta_data->>'hospitalName', extracted_name),
          COALESCE(new.raw_user_meta_data->>'licenseNumber', 'PENDING'),
          'active'
        )
        ON CONFLICT (id) DO NOTHING;
      WHEN 'admin' THEN
        INSERT INTO public.admins (id, permissions)
        VALUES (new.id, '["all"]'::jsonb)
        ON CONFLICT (id) DO NOTHING;
    END CASE;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Role mapping insertion failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- We don't need notification_hub trigger since notifications are inserted securely via the application.
-- End of schema
SELECT 'MASTER SCHEMA APPLIED SUCCESSFULLY!' as deployment_status;
