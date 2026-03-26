-- Run this in your Supabase SQL Editor AFTER deploying the edge function

-- 0. Trigger for automatically creating a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  role_text TEXT := (new.raw_user_meta_data->>'role');
BEGIN
  -- 1. Insert into base profiles table
  INSERT INTO public.profiles (id, email, name, phone, role, location)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(role_text, 'donor')::user_role,
    COALESCE((new.raw_user_meta_data->'location'), '{}'::jsonb)
  );

  -- 2. Insert into role-specific table
  IF role_text = 'donor' THEN
    INSERT INTO public.donors (id, blood_group, is_available)
    VALUES (new.id, COALESCE((new.raw_user_meta_data->>'bloodGroup'), 'O+')::blood_group, true);
  ELSIF role_text = 'requester' THEN
    INSERT INTO public.requesters (id, emergency_contact)
    VALUES (new.id, new.raw_user_meta_data->>'emergencyContact');
  ELSIF role_text = 'hospital' THEN
    INSERT INTO public.hospitals (id, hospital_name, license_number, status)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'hospitalName', 'New Hospital'), 
      COALESCE(new.raw_user_meta_data->>'licenseNumber', ''),
      'pending_approval'
    );
  ELSIF role_text = 'admin' THEN
    INSERT INTO public.admins (id, permissions)
    VALUES (new.id, '[]'::jsonb);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (Remaining triggers commented out to prevent 500 errors if pg_net is not enabled)
/*
CREATE OR REPLACE FUNCTION public.invoke_notification_hub() ...
*/


