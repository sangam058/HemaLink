-- Run this in your Supabase SQL Editor AFTER deploying the edge function

-- 0. Professional Trigger for User Profile Management
-- Handles Donor, Requester, Hospital, and Admin roles automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  role_text TEXT;
  full_name TEXT;
  phone_num TEXT;
  loc_data JSONB;
BEGIN
  -- Extract metadata safely
  role_text := COALESCE(new.raw_user_meta_data->>'role', 'donor');
  full_name := COALESCE(new.raw_user_meta_data->>'name', 'New User');
  phone_num := COALESCE(new.raw_user_meta_data->>'phone', '');
  loc_data  := COALESCE(new.raw_user_meta_data->'location', '{"city": "Mumbai", "address": "Not provided"}'::jsonb);

  -- 1. Create Base Profile
  INSERT INTO public.profiles (id, email, name, phone, role, location)
  VALUES (new.id, new.email, full_name, phone_num, role_text::user_role, loc_data)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    location = EXCLUDED.location;

  -- 2. Create Role-Specific Entry
  CASE role_text
    WHEN 'donor' THEN
      INSERT INTO public.donors (id, blood_group, points, level, is_available)
      VALUES (
        new.id, 
        COALESCE((new.raw_user_meta_data->>'bloodGroup'), 'O+')::blood_group,
        0, 1, true
      ) ON CONFLICT (id) DO NOTHING;
      
    WHEN 'requester' THEN
      INSERT INTO public.requesters (id, emergency_contact)
      VALUES (
        new.id, 
        new.raw_user_meta_data->>'emergencyContact'
      ) ON CONFLICT (id) DO NOTHING;
      
    WHEN 'hospital' THEN
      INSERT INTO public.hospitals (id, hospital_name, license_number, status)
      VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'hospitalName', full_name), 
        COALESCE(new.raw_user_meta_data->>'licenseNumber', 'PENDING'),
        'active' -- Set to active for the presentation ease
      ) ON CONFLICT (id) DO NOTHING;
      
    WHEN 'admin' THEN
      INSERT INTO public.admins (id, permissions)
      VALUES (new.id, '["all"]'::jsonb) 
      ON CONFLICT (id) DO NOTHING;
  END CASE;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Utility Function to Manually Sync Profiles (Professional fallback)
CREATE OR REPLACE FUNCTION public.sync_all_auth_users()
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role, location)
  SELECT 
    id, email, 
    COALESCE(raw_user_meta_data->>'name', 'User'),
    COALESCE(raw_user_meta_data->>'phone', ''),
    (COALESCE(raw_user_meta_data->>'role', 'donor'))::user_role,
    COALESCE(raw_user_meta_data->'location', '{}'::jsonb)
  FROM auth.users
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-enable the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

