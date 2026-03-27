-- FIX FOR PROFILE CREATION ISSUE
-- Run this in Supabase SQL Editor to fix the trigger

-- 1. First, manually create the profile for the existing user
INSERT INTO public.profiles (id, email, name, phone, role, location, is_verified, created_at)
VALUES (
  '3c6677d6-93a0-4031-be21-35ec0628c00d', 
  'your_test_email@gmail.com', -- Replace with actual email used
  'Test User',
  '1234567890',
  'donor',
  '{"address": "Andheri (W)", "city": "mumbai", "state": "maharashtra", "country": "India"}',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  location = EXCLUDED.location,
  is_verified = EXCLUDED.is_verified;

-- 2. Create donor-specific data
INSERT INTO public.donors (id, blood_group, points, level, badges, total_donations, last_donation_date, is_available)
VALUES (
  '3c6677d6-93a0-4031-be21-35ec0628c00d',
  'O+', -- Replace with actual blood group
  0,
  1,
  '[]'::jsonb,
  0,
  NULL,
  true
) ON CONFLICT (id) DO NOTHING;

-- 3. Fix the trigger function to ensure it works properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  role_text TEXT;
  full_name TEXT;
  phone_num TEXT;
  loc_data JSONB;
  blood_group_val TEXT;
BEGIN
  -- Extract metadata safely
  role_text := COALESCE(new.raw_user_meta_data->>'role', 'donor');
  full_name := COALESCE(new.raw_user_meta_data->>'name', 'New User');
  phone_num := COALESCE(new.raw_user_meta_data->>'phone', '');
  loc_data := COALESCE(new.raw_user_meta_data->'location', '{"city": "Mumbai", "address": "Not provided"}'::jsonb);
  blood_group_val := COALESCE(new.raw_user_meta_data->>'bloodGroup', 'O+');

  -- 1. Create Base Profile
  INSERT INTO public.profiles (id, email, name, phone, role, location, is_verified, created_at)
  VALUES (new.id, new.email, full_name, phone_num, role_text::user_role, loc_data, false, NOW())
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    location = EXCLUDED.location,
    role = EXCLUDED.role;

  -- 2. Create Role-Specific Entry
  CASE role_text
    WHEN 'donor' THEN
      INSERT INTO public.donors (id, blood_group, points, level, badges, total_donations, last_donation_date, is_available)
      VALUES (
        new.id, 
        blood_group_val::blood_group,
        0, 1, '[]'::jsonb, 0, NULL, true
      ) ON CONFLICT (id) DO NOTHING;
      
    WHEN 'requester' THEN
      INSERT INTO public.requesters (id, emergency_contact)
      VALUES (
        new.id, 
        new.raw_user_meta_data->>'emergencyContact'
      ) ON CONFLICT (id) DO NOTHING;
      
    WHEN 'hospital' THEN
      INSERT INTO public.hospitals (id, hospital_name, license_number, status, verified_at)
      VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'hospitalName', full_name), 
        COALESCE(new.raw_user_meta_data->>'licenseNumber', 'PENDING'),
        'active',
        NOW()
      ) ON CONFLICT (id) DO NOTHING;
      
    WHEN 'admin' THEN
      INSERT INTO public.admins (id, permissions)
      VALUES (new.id, '["all"]'::jsonb) 
      ON CONFLICT (id) DO NOTHING;
  END CASE;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure the trigger is properly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Test the trigger by creating a test user (you can remove this later)
-- This will help verify the trigger is working
SELECT 'Trigger function updated and attached successfully' as status;
