-- Hemalink Admin User Seed Script
-- Run this in your Supabase SQL Editor to create the admin user

DO $$
DECLARE
  admin_id UUID := gen_random_uuid();
BEGIN
  -- 1. Create Auth User
  -- Delete any existing user with this email to avoid conflicts
  DELETE FROM auth.users WHERE email = 'sangam@gmail.com';

  -- Inserting into auth.users will automatically trigger the creation 
  -- of the public.profiles and public.admins rows thanks to handle_new_user trigger
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    admin_id, 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'sangam@gmail.com', 
    crypt('sangam362004', gen_salt('bf')), 
    now(), 
    '{"role": "admin", "name": "Sangam Admin", "phone": "+910000000000", "location": {"city": "System"}}'::jsonb, 
    now(), 
    now()
  );

  -- 2. Create Auth Identity (Required for Supabase GoTrue to allow email/password login)
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    admin_id,
    format('{"sub":"%s","email":"%s"}', admin_id::text, 'sangam@gmail.com')::jsonb,
    'email',
    admin_id::text,
    now(),
    now(),
    now()
  );

  RAISE NOTICE 'Admin user sangam@gmail.com created successfully!';
END $$;
