-- RESET TRIGGER COMPLETELY
-- Run this if you want to start fresh with no test data

-- 1. Remove all triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Clean up any test data (optional - uncomment if needed)
-- DELETE FROM public.profiles WHERE email LIKE '%test%' OR email LIKE '%example%';
-- DELETE FROM public.donors WHERE id IN (SELECT id FROM public.profiles WHERE email LIKE '%test%' OR email LIKE '%example%');
-- DELETE FROM public.requesters WHERE id IN (SELECT id FROM public.profiles WHERE email LIKE '%test%' OR email LIKE '%example%');
-- DELETE FROM public.hospitals WHERE id IN (SELECT id FROM public.profiles WHERE email LIKE '%test%' OR email LIKE '%example%');

-- 3. Create the final working trigger
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
  loc_data := COALESCE(new.raw_user_meta_data->'location', '{"city": "Mumbai"}'::jsonb);

  -- Create Base Profile
  INSERT INTO public.profiles (id, email, name, phone, role, location, is_verified, created_at)
  VALUES (new.id, new.email, full_name, phone_num, role_text::user_role, loc_data, false, NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Create Role-Specific Entry
  CASE role_text
    WHEN 'donor' THEN
      INSERT INTO public.donors (id, blood_group, points, level, badges, total_donations, is_available)
      VALUES (new.id, COALESCE(new.raw_user_meta_data->>'bloodGroup', 'O+')::blood_group, 0, 1, '[]'::jsonb, 0, true)
      ON CONFLICT (id) DO NOTHING;
      
    WHEN 'requester' THEN
      INSERT INTO public.requesters (id, emergency_contact)
      VALUES (new.id, COALESCE(new.raw_user_meta_data->>'emergencyContact', ''))
      ON CONFLICT (id) DO NOTHING;
      
    WHEN 'hospital' THEN
      INSERT INTO public.hospitals (id, hospital_name, license_number, status, verified_at)
      VALUES (new.id, COALESCE(new.raw_user_meta_data->>'hospitalName', full_name), COALESCE(new.raw_user_meta_data->>'licenseNumber', 'PENDING'), 'active', NOW())
      ON CONFLICT (id) DO NOTHING;
      
    WHEN 'admin' THEN
      INSERT INTO public.admins (id, permissions)
      VALUES (new.id, '["all"]'::jsonb)
      ON CONFLICT (id) DO NOTHING;
  END CASE;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

SELECT 'Trigger reset complete - ready for production use' as status;
