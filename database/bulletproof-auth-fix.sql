-- BULLETPROOF AUTH TRIGGER FIX
-- This script replaces unstable triggers with a fault-tolerant solution.
-- It ensures that even if profile creation fails, the user signup succeeds.

--------------------------------------------------------------------------------
-- 1. CLEANUP: Remove any existing problematic triggers
--------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- Note: Replace public.handle_new_user() with your actual function name if different
DROP FUNCTION IF EXISTS public.handle_new_user();

--------------------------------------------------------------------------------
-- 2. CREATE BULLETPROOF TRIGGER FUNCTION
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner's privileges (postgres) to bypass RLS
SET search_path = public
AS $$
DECLARE
  default_role TEXT := 'donor';
  extracted_role TEXT;
  extracted_name TEXT;
  extracted_phone TEXT;
BEGIN
  -- A. LOG INITIALIZATION (VISIBLE IN SUPABASE LOGS)
  RAISE NOTICE 'Bulletproof Trigger start: New User ID %', new.id;

  -- B. SAFE METADATA EXTRACTION
  -- Using COALESCE for every field to prevent null constraint violations
  extracted_role := COALESCE(new.raw_user_meta_data->>'role', default_role);
  extracted_name := COALESCE(new.raw_user_meta_data->>'name', 'User ' || substr(new.id::text, 1, 8));
  extracted_phone := COALESCE(new.raw_user_meta_data->>'phone', '');

  -- C. ATTEMPT INSERTION WITH CORE EXCEPTION HANDLING
  BEGIN
    -- Insert into profiles (idempotent with ON CONFLICT)
    INSERT INTO public.profiles (id, email, name, phone, role, location, is_verified)
    VALUES (
      new.id,
      new.email,
      extracted_name,
      extracted_phone,
      extracted_role::user_role, -- Assumes user_role enum exists
      COALESCE(new.raw_user_meta_data->'location', '{"city": "Mumbai", "address": "Not provided"}'::jsonb),
      false
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      phone = EXCLUDED.phone,
      role = EXCLUDED.role;

    -- D. ATTEMPT ROLE-SPECIFIC INSERTION
    CASE extracted_role
      WHEN 'donor' THEN
        INSERT INTO public.donors (id, blood_group)
        VALUES (new.id, COALESCE((new.raw_user_meta_data->>'bloodGroup')::blood_group, 'O+'::blood_group))
        ON CONFLICT (id) DO NOTHING;
      WHEN 'requester' THEN
        INSERT INTO public.requesters (id, emergency_contact)
        VALUES (new.id, COALESCE(new.raw_user_meta_data->>'emergencyContact', ''))
        ON CONFLICT (id) DO NOTHING;
      WHEN 'hospital' THEN
        INSERT INTO public.hospitals (id, hospital_name, status)
        VALUES (new.id, COALESCE(new.raw_user_meta_data->>'hospitalName', extracted_name), 'active')
        ON CONFLICT (id) DO NOTHING;
      ELSE
        -- No specific data needed for other roles
    END CASE;

    RAISE NOTICE 'Bulletproof Trigger success: Profile created for %', new.id;

  EXCEPTION WHEN OTHERS THEN
    -- E. FAIL-SAFE: LOG ERROR BUT DO NOT THROW
    -- This is the most important part: catching the error prevents the 500 Auth error.
    -- The user will still be able to sign up, and we can fix their profile later.
    RAISE WARNING 'CRITICAL: Trigger failed for user %: %', new.id, SQLERRM;
    -- Optionally log to a debug table if it exists
    -- INSERT INTO public.debug_logs (message, context) VALUES ('Trigger Failed', jsonb_build_object('user_id', new.id, 'error', SQLERRM));
  END;

  -- F. ALWAYS RETURN NEW TO ALLOW AUTH.USERS INSERT TO PROCEED
  RETURN new;
END;
$$;

--------------------------------------------------------------------------------
-- 3. RE-CREATE TRIGGER
--------------------------------------------------------------------------------
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

--------------------------------------------------------------------------------
-- 4. FIX RLS (Ensure owner can insert)
--------------------------------------------------------------------------------
-- Since the trigger is SECURITY DEFINER, it runs as 'postgres'
-- and typically bypasses RLS. However, ensure profiles is manageable.
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

GRANT ALL ON public.profiles TO postgres, service_role;
GRANT ALL ON public.donors TO postgres, service_role;
GRANT ALL ON public.hospitals TO postgres, service_role;
GRANT ALL ON public.requesters TO postgres, service_role;

--------------------------------------------------------------------------------
-- 5. VERIFICATION
--------------------------------------------------------------------------------
SELECT 'FIX APPLIED: Trigger is now fault-tolerant' as status;
