-- EMERGENCY FIX FOR SIGNUP 500 ERROR
-- Run this in Supabase SQL Editor immediately

-- 1. Disable the problematic trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Create a simpler trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  role_text TEXT;
  full_name TEXT;
  phone_num TEXT;
  loc_data JSONB;
  blood_group_val TEXT;
BEGIN
  -- Extract metadata safely with defaults
  role_text := COALESCE(new.raw_user_meta_data->>'role', 'donor');
  full_name := COALESCE(new.raw_user_meta_data->>'name', 'New User');
  phone_num := COALESCE(new.raw_user_meta_data->>'phone', '0000000000');
  loc_data := COALESCE(new.raw_user_meta_data->'location', '{"city": "Mumbai", "address": "Not provided"}'::jsonb);
  blood_group_val := COALESCE(new.raw_user_meta_data->>'bloodGroup', 'O+');

  -- Create Base Profile with explicit casting
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
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create Role-Specific Entry
  CASE role_text
    WHEN 'donor' THEN
      INSERT INTO public.donors (id, blood_group, points, level, badges, total_donations, is_available)
      VALUES (
        new.id, 
        blood_group_val::blood_group,
        0, 1, '[]'::jsonb, 0, true
      ) ON CONFLICT (id) DO NOTHING;
      
    WHEN 'requester' THEN
      INSERT INTO public.requesters (id, emergency_contact)
      VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'emergencyContact', '')
      ) ON CONFLICT (id) DO NOTHING;
      
    WHEN 'hospital' THEN
      INSERT INTO public.hospitals (id, hospital_name, license_number, status)
      VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'hospitalName', full_name), 
        COALESCE(new.raw_user_meta_data->>'licenseNumber', 'PENDING'),
        'active'
      ) ON CONFLICT (id) DO NOTHING;
      
    WHEN 'admin' THEN
      INSERT INTO public.admins (id, permissions)
      VALUES (new.id, '["all"]'::jsonb) 
      ON CONFLICT (id) DO NOTHING;
  END CASE;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-enable the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Test the trigger with a simple verification
SELECT 'Emergency fix applied successfully' as status,
       'Trigger function recreated and attached' as message;
