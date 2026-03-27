-- CLEAN TRIGGER FOR REAL USER PROFILES
-- Run this in Supabase SQL Editor - no test data, just the trigger

-- 1. Remove any existing problematic triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Create robust trigger function for real users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  role_text TEXT;
  full_name TEXT;
  phone_num TEXT;
  loc_data JSONB;
  blood_group_val TEXT;
  hospital_name_val TEXT;
  license_num TEXT;
  emergency_contact_val TEXT;
BEGIN
  -- Extract metadata safely with proper defaults
  role_text := COALESCE(new.raw_user_meta_data->>'role', 'donor');
  full_name := COALESCE(new.raw_user_meta_data->>'name', 'New User');
  phone_num := COALESCE(new.raw_user_meta_data->>'phone', '');
  loc_data := COALESCE(new.raw_user_meta_data->'location', '{"city": "Mumbai", "address": "Not provided"}'::jsonb);
  blood_group_val := COALESCE(new.raw_user_meta_data->>'bloodGroup', 'O+');
  hospital_name_val := COALESCE(new.raw_user_meta_data->>'hospitalName', full_name);
  license_num := COALESCE(new.raw_user_meta_data->>'licenseNumber', 'PENDING');
  emergency_contact_val := COALESCE(new.raw_user_meta_data->>'emergencyContact', '');

  -- Create Base Profile with proper error handling
  BEGIN
    INSERT INTO public.profiles (id, email, name, phone, role, location, is_verified, created_at)
    VALUES (
      new.id, 
      new.email, 
      full_name, 
      phone_num, 
      role_text::user_role, 
      loc_data, 
      false, 
      NOW()
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the entire auth process
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
  END;

  -- Create Role-Specific Entry with proper error handling
  BEGIN
    CASE role_text
      WHEN 'donor' THEN
        INSERT INTO public.donors (id, blood_group, points, level, badges, total_donations, last_donation_date, is_available)
        VALUES (
          new.id, 
          blood_group_val::blood_group,
          0, 1, '[]'::jsonb, 0, NULL, true
        );
        
      WHEN 'requester' THEN
        INSERT INTO public.requesters (id, emergency_contact)
        VALUES (new.id, emergency_contact_val);
        
      WHEN 'hospital' THEN
        INSERT INTO public.hospitals (id, hospital_name, license_number, status, verified_at)
        VALUES (
          new.id, 
          hospital_name_val, 
          license_num, 
          'active',
          NOW()
        );
        
      WHEN 'admin' THEN
        INSERT INTO public.admins (id, permissions)
        VALUES (new.id, '["all"]'::jsonb);
    END CASE;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the entire auth process
    RAISE LOG 'Error creating role data for user %: %', new.id, SQLERRM;
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verification
SELECT 'Clean trigger created successfully - ready for real user profiles' as status;
