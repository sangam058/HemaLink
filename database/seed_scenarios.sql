-- Hemalink Expanded Real-World Seed Data (Mumbai, Maharashtra)
-- IMPORTANT: Run this in your Supabase SQL Editor AFTER running the schema and auth fixes.
-- Password for all accounts: password123

DO $$
DECLARE
  -- Hospitals
  h1 UUID := gen_random_uuid(); h2 UUID := gen_random_uuid(); h3 UUID := gen_random_uuid(); h4 UUID := gen_random_uuid(); h5 UUID := gen_random_uuid();
  h6 UUID := gen_random_uuid(); h7 UUID := gen_random_uuid(); h8 UUID := gen_random_uuid(); h9 UUID := gen_random_uuid(); h10 UUID := gen_random_uuid();
  
  -- Donors
  d1 UUID := gen_random_uuid(); d2 UUID := gen_random_uuid(); d3 UUID := gen_random_uuid(); d4 UUID := gen_random_uuid(); d5 UUID := gen_random_uuid();
  d6 UUID := gen_random_uuid(); d7 UUID := gen_random_uuid(); d8 UUID := gen_random_uuid(); d9 UUID := gen_random_uuid(); d10 UUID := gen_random_uuid();

  -- Requesters
  r1 UUID := gen_random_uuid(); r2 UUID := gen_random_uuid(); r3 UUID := gen_random_uuid(); r4 UUID := gen_random_uuid(); r5 UUID := gen_random_uuid();
  r6 UUID := gen_random_uuid(); r7 UUID := gen_random_uuid(); r8 UUID := gen_random_uuid(); r9 UUID := gen_random_uuid(); r10 UUID := gen_random_uuid();

  -- Requests
  req1 UUID := gen_random_uuid(); req2 UUID := gen_random_uuid(); req3 UUID := gen_random_uuid();
BEGIN
  
  -- 0. CLEANUP (Force cascading cleanup)
  DELETE FROM public.donations;
  DELETE FROM public.blood_requests;
  DELETE FROM public.blood_inventory;
  DELETE FROM public.donors;
  DELETE FROM public.requesters;
  DELETE FROM public.hospitals;
  DELETE FROM public.profiles;
  DELETE FROM auth.users WHERE email LIKE '%@mumbai.in' OR email LIKE '%@donor.in' OR email LIKE '%@requester.in';

  -- 1. HOSPITALS (Auth + Profiles + Role)
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at) VALUES 
  (h1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'apollo@mumbai.in', crypt('password123', gen_salt('bf')), now(), '{"role": "hospital"}', now(), now()),
  (h2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lilavati@mumbai.in', crypt('password123', gen_salt('bf')), now(), '{"role": "hospital"}', now(), now()),
  (h3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hinduja@mumbai.in', crypt('password123', gen_salt('bf')), now(), '{"role": "hospital"}', now(), now()),
  (h4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fortis@mumbai.in', crypt('password123', gen_salt('bf')), now(), '{"role": "hospital"}', now(), now()),
  (h5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kokilaben@mumbai.in', crypt('password123', gen_salt('bf')), now(), '{"role": "hospital"}', now(), now()),
  (h6, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nanavati@mumbai.in', crypt('password123', gen_salt('bf')), now(), '{"role": "hospital"}', now(), now()),
  (h7, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'breachcandy@mumbai.in', crypt('password123', gen_salt('bf')), now(), '{"role": "hospital"}', now(), now()),
  (h8, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'saifee@mumbai.in', crypt('password123', gen_salt('bf')), now(), '{"role": "hospital"}', now(), now()),
  (h9, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jaslok@mumbai.in', crypt('password123', gen_salt('bf')), now(), '{"role": "hospital"}', now(), now()),
  (h10, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sion@mumbai.in', crypt('password123', gen_salt('bf')), now(), '{"role": "hospital"}', now(), now());

  INSERT INTO public.profiles (id, email, name, phone, role, location, is_verified) VALUES
  (h1, 'apollo@mumbai.in', 'Apollo Hospitals Navi Mumbai', '+911111111111', 'hospital', '{"address": "Navi Mumbai", "city": "Mumbai"}'::jsonb, true),
  (h2, 'lilavati@mumbai.in', 'Lilavati Hospital', '+911111111112', 'hospital', '{"address": "Bandra", "city": "Mumbai"}'::jsonb, true),
  (h3, 'hinduja@mumbai.in', 'Hinduja Hospital', '+911111111113', 'hospital', '{"address": "Mahim", "city": "Mumbai"}'::jsonb, true),
  (h4, 'fortis@mumbai.in', 'Fortis Hospital', '+911111111114', 'hospital', '{"address": "Mulund", "city": "Mumbai"}'::jsonb, true),
  (h5, 'kokilaben@mumbai.in', 'Kokilaben Ambani Hospital', '+911111111115', 'hospital', '{"address": "Andheri", "city": "Mumbai"}'::jsonb, true),
  (h6, 'nanavati@mumbai.in', 'Nanavati Max Super Speciality', '+911111111116', 'hospital', '{"address": "Vile Parle", "city": "Mumbai"}'::jsonb, true),
  (h7, 'breachcandy@mumbai.in', 'Breach Candy Hospital', '+911111111117', 'hospital', '{"address": "Breach Candy", "city": "Mumbai"}'::jsonb, true),
  (h8, 'saifee@mumbai.in', 'Saifee Hospital', '+911111111118', 'hospital', '{"address": "Charni Road", "city": "Mumbai"}'::jsonb, true),
  (h9, 'jaslok@mumbai.in', 'Jaslok Hospital', '+911111111119', 'hospital', '{"address": "Pedder Road", "city": "Mumbai"}'::jsonb, true),
  (h10, 'sion@mumbai.in', 'Lokmanya Tilak Sion Hospital', '+911111111120', 'hospital', '{"address": "Sion East", "city": "Mumbai"}'::jsonb, true);

  INSERT INTO public.hospitals (id, hospital_name, license_number, status, verified_at) VALUES 
  (h1, 'Apollo Hospitals Navi Mumbai', 'LIC-101', 'active', now()), (h2, 'Lilavati Hospital', 'LIC-102', 'active', now()),
  (h3, 'Hinduja Hospital', 'LIC-103', 'active', now()), (h4, 'Fortis Hospital', 'LIC-104', 'active', now()),
  (h5, 'Kokilaben Ambani Hospital', 'LIC-105', 'active', now()), (h6, 'Nanavati Max Super Speciality', 'LIC-106', 'active', now()),
  (h7, 'Breach Candy Hospital', 'LIC-107', 'active', now()), (h8, 'Saifee Hospital', 'LIC-108', 'active', now()),
  (h9, 'Jaslok Hospital', 'LIC-109', 'active', now()), (h10, 'Lokmanya Tilak Sion Hospital', 'LIC-110', 'active', now());

  -- 2. DONORS (Auth + Profiles + Role)
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at) VALUES 
  (d1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rajesh@donor.in', crypt('password123', gen_salt('bf')), now(), '{"role": "donor"}', now(), now()),
  (d2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'amit@donor.in', crypt('password123', gen_salt('bf')), now(), '{"role": "donor"}', now(), now());

  INSERT INTO public.profiles (id, email, name, phone, role, location) VALUES
  (d1, 'rajesh@donor.in', 'Rajesh Kumar', '+918888888801', 'donor', '{"city": "Mumbai"}'::jsonb),
  (d2, 'amit@donor.in', 'Amit Singh', '+918888888802', 'donor', '{"city": "Mumbai"}'::jsonb);

  INSERT INTO public.donors (id, blood_group, points, level, badges, total_donations, is_available) VALUES 
  (d1, 'O+', 150, 1, '[]'::jsonb, 1, true), (d2, 'A+', 0, 1, '[]'::jsonb, 0, true);

  -- 3. REQUESTERS (Auth + Profiles + Role)
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at) VALUES 
  (r1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priya@requester.in', crypt('password123', gen_salt('bf')), now(), '{"role": "requester"}', now(), now());

  INSERT INTO public.profiles (id, email, name, phone, role, location) VALUES
  (r1, 'priya@requester.in', 'Priya Sharma', '+917777777701', 'requester', '{"city": "Mumbai"}'::jsonb);

  INSERT INTO public.requesters (id, emergency_contact) VALUES (r1, '+919999999901');

  -- 4. HOSPITAL INVENTORY
  INSERT INTO public.blood_inventory (hospital_id, blood_group, units, expiry_date) VALUES 
  (h1, 'O+', 15, now() + interval '30 days'), (h1, 'A+', 10, now() + interval '30 days'),
  (h2, 'B+', 20, now() + interval '30 days'), (h2, 'AB+', 5, now() + interval '30 days');


  -- 5. MATCHING SCENARIOS
  INSERT INTO public.blood_requests (id, requester_id, requester_name, patient_name, blood_group, units, hospital_id, hospital_name, location, date_needed, reason, priority, status)
  VALUES (req1, r1, 'Priya Sharma', 'Mother of Priya', 'O+', 2, h1, 'Apollo Hospitals Navi Mumbai', '{"address": "Navi Mumbai", "city": "Mumbai"}'::jsonb, now() + interval '1 day', 'Scheduled Surgery', 'urgent', 'fulfilled');
  
  INSERT INTO public.donations (donor_id, donor_name, hospital_id, hospital_name, request_id, blood_group, units, status, scheduled_date, completed_date, points_earned)
  VALUES (d1, 'Rajesh Kumar', h2, 'Lilavati Hospital', req1, 'O+', 1, 'completed', now() - interval '1 day', now(), 150);

  RAISE NOTICE 'SEED DATA CREATED SUCCESSFULLY';

END $$;
