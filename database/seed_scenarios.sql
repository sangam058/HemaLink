-- Hemalink Expanded Real-World Seed Data (Mumbai, Maharashtra)
-- IMPORTANT: Run this in your Supabase SQL Editor.
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
  
  -- ==========================================
  -- 0. CLEANUP PREVIOUS SEED DATA to prevent Duplicate Email errors
  -- ==========================================
  -- Manually cascade delete to avoid foreign key constraint errors
  DELETE FROM public.donations WHERE hospital_id IN (SELECT id FROM auth.users WHERE email LIKE '%@mumbai.in') OR donor_id IN (SELECT id FROM auth.users WHERE email LIKE '%@donor.in');
  DELETE FROM public.blood_requests WHERE requester_id IN (SELECT id FROM auth.users WHERE email LIKE '%@requester.in');
  DELETE FROM public.blood_inventory WHERE hospital_id IN (SELECT id FROM auth.users WHERE email LIKE '%@mumbai.in');
  
  DELETE FROM auth.users WHERE email LIKE '%@mumbai.in' OR email LIKE '%@donor.in' OR email LIKE '%@requester.in';

  -- ==========================================
  -- 1. HOSPITALS (Password: password123)
  -- ==========================================
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at) VALUES 
  (h1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'apollo@mumbai.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Apollo Hospitals Navi Mumbai', 'role', 'hospital', 'hospitalName', 'Apollo Hospitals Navi Mumbai', 'licenseNumber', 'LIC-101', 'phone', '+911111111111', 'location', json_build_object('address', 'Navi Mumbai', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (h2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lilavati@mumbai.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Lilavati Hospital', 'role', 'hospital', 'hospitalName', 'Lilavati Hospital', 'licenseNumber', 'LIC-102', 'phone', '+911111111112', 'location', json_build_object('address', 'Bandra Reclamation', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (h3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hinduja@mumbai.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Hinduja Hospital', 'role', 'hospital', 'hospitalName', 'Hinduja Hospital', 'licenseNumber', 'LIC-103', 'phone', '+911111111113', 'location', json_build_object('address', 'Mahim', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (h4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fortis@mumbai.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Fortis Hospital', 'role', 'hospital', 'hospitalName', 'Fortis Hospital', 'licenseNumber', 'LIC-104', 'phone', '+911111111114', 'location', json_build_object('address', 'Mulund', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (h5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kokilaben@mumbai.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Kokilaben Ambani Hospital', 'role', 'hospital', 'hospitalName', 'Kokilaben Ambani Hospital', 'licenseNumber', 'LIC-105', 'phone', '+911111111115', 'location', json_build_object('address', 'Andheri West', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (h6, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nanavati@mumbai.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Nanavati Max Super Speciality', 'role', 'hospital', 'hospitalName', 'Nanavati Max Super Speciality', 'licenseNumber', 'LIC-106', 'phone', '+911111111116', 'location', json_build_object('address', 'Vile Parle', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (h7, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'breachcandy@mumbai.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Breach Candy Hospital', 'role', 'hospital', 'hospitalName', 'Breach Candy Hospital', 'licenseNumber', 'LIC-107', 'phone', '+911111111117', 'location', json_build_object('address', 'Breach Candy', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (h8, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'saifee@mumbai.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Saifee Hospital', 'role', 'hospital', 'hospitalName', 'Saifee Hospital', 'licenseNumber', 'LIC-108', 'phone', '+911111111118', 'location', json_build_object('address', 'Charni Road', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (h9, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jaslok@mumbai.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Jaslok Hospital', 'role', 'hospital', 'hospitalName', 'Jaslok Hospital', 'licenseNumber', 'LIC-109', 'phone', '+911111111119', 'location', json_build_object('address', 'Pedder Road', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (h10, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sion@mumbai.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Lokmanya Tilak Sion Hospital', 'role', 'hospital', 'hospitalName', 'Lokmanya Tilak Sion Hospital', 'licenseNumber', 'LIC-110', 'phone', '+911111111120', 'location', json_build_object('address', 'Sion East', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now());

  -- Verify all hospitals instantly
  UPDATE public.hospitals SET status = 'active', verified_at = now() WHERE id IN (h1, h2, h3, h4, h5, h6, h7, h8, h9, h10);
  UPDATE public.profiles SET is_verified = true WHERE id IN (h1, h2, h3, h4, h5, h6, h7, h8, h9, h10);

  -- ==========================================
  -- 2. DONORS (Password: password123)
  -- ==========================================
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at) VALUES 
  (d1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rajesh@donor.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Rajesh Kumar', 'role', 'donor', 'bloodGroup', 'O+', 'phone', '+918888888801', 'location', json_build_object('address', 'Andheri', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (d2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'amit@donor.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Amit Singh', 'role', 'donor', 'bloodGroup', 'A+', 'phone', '+918888888802', 'location', json_build_object('address', 'Bandra', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (d3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vikas@donor.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Vikas Patil', 'role', 'donor', 'bloodGroup', 'B+', 'phone', '+918888888803', 'location', json_build_object('address', 'Dadar', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (d4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sanjay@donor.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Sanjay Joshi', 'role', 'donor', 'bloodGroup', 'AB+', 'phone', '+918888888804', 'location', json_build_object('address', 'Borivali', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (d5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'neha@donor.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Neha Mehta', 'role', 'donor', 'bloodGroup', 'O-', 'phone', '+918888888805', 'location', json_build_object('address', 'Juhu', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (d6, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pooja@donor.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Pooja Iyer', 'role', 'donor', 'bloodGroup', 'A-', 'phone', '+918888888806', 'location', json_build_object('address', 'Matunga', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (d7, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rahul@donor.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Rahul Deshmukh', 'role', 'donor', 'bloodGroup', 'B-', 'phone', '+918888888807', 'location', json_build_object('address', 'Goregaon', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (d8, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sneha@donor.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Sneha Kulkarni', 'role', 'donor', 'bloodGroup', 'AB-', 'phone', '+918888888808', 'location', json_build_object('address', 'Thane', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (d9, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'karan@donor.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Karan Shah', 'role', 'donor', 'bloodGroup', 'O+', 'phone', '+918888888809', 'location', json_build_object('address', 'Kandivali', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (d10, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manish@donor.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Manish Gupta', 'role', 'donor', 'bloodGroup', 'B+', 'phone', '+918888888810', 'location', json_build_object('address', 'Vikhroli', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now());

  -- ==========================================
  -- 3. REQUESTERS (Password: password123)
  -- ==========================================
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at) VALUES 
  (r1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priya@requester.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Priya Sharma', 'role', 'requester', 'phone', '+917777777701', 'emergencyContact', '+919999999901', 'location', json_build_object('address', 'Bandra', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (r2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sunil@requester.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Sunil Verma', 'role', 'requester', 'phone', '+917777777702', 'emergencyContact', '+919999999902', 'location', json_build_object('address', 'Chembur', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (r3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'anjali@requester.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Anjali Desai', 'role', 'requester', 'phone', '+917777777703', 'emergencyContact', '+919999999903', 'location', json_build_object('address', 'Santacruz', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (r4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rohit@requester.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Rohit Nair', 'role', 'requester', 'phone', '+917777777704', 'emergencyContact', '+919999999904', 'location', json_build_object('address', 'Malad', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (r5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kavita@requester.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Kavita Chawla', 'role', 'requester', 'phone', '+917777777705', 'emergencyContact', '+919999999905', 'location', json_build_object('address', 'Powai', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (r6, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vinay@requester.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Vinay Yadav', 'role', 'requester', 'phone', '+917777777706', 'emergencyContact', '+919999999906', 'location', json_build_object('address', 'Ghatkopar', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (r7, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'divya@requester.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Divya Mhatre', 'role', 'requester', 'phone', '+917777777707', 'emergencyContact', '+919999999907', 'location', json_build_object('address', 'Dadar', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (r8, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'anil@requester.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Anil Gawande', 'role', 'requester', 'phone', '+917777777708', 'emergencyContact', '+919999999908', 'location', json_build_object('address', 'Kurla', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (r9, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'megha@requester.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Megha Rane', 'role', 'requester', 'phone', '+917777777709', 'emergencyContact', '+919999999909', 'location', json_build_object('address', 'Vile Parle', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now()),
  (r10, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'prashant@requester.in', crypt('password123', gen_salt('bf')), now(), json_build_object('name', 'Prashant More', 'role', 'requester', 'phone', '+917777777710', 'emergencyContact', '+919999999910', 'location', json_build_object('address', 'Sion', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), now(), now());

  -- ==========================================
  -- 4. HOSPITAL INVENTORY
  -- ==========================================
  INSERT INTO public.blood_inventory (hospital_id, blood_group, units, expiry_date) VALUES 
  (h1, 'O+', 15, now() + interval '30 days'), (h1, 'A+', 10, now() + interval '30 days'),
  (h2, 'B+', 20, now() + interval '30 days'), (h2, 'AB+', 5, now() + interval '30 days'),
  (h3, 'O-', 3, now() + interval '30 days'), (h3, 'A-', 2, now() + interval '30 days'),
  (h4, 'O+', 12, now() + interval '30 days'), (h4, 'B-', 4, now() + interval '30 days'),
  (h5, 'AB-', 1, now() + interval '30 days'), (h5, 'A+', 8, now() + interval '30 days');


  -- ==========================================
  -- 5. MATCHING SCENARIOS
  -- ==========================================
  
  -- SCENARIO A: Requester matched from Hospital Inventory
  -- Priya requests O+ blood and Apollo hospital fulfills it.
  INSERT INTO public.blood_requests (id, requester_id, requester_name, patient_name, blood_group, units, hospital_id, hospital_name, location, date_needed, reason, priority, status)
  VALUES (req1, r1, 'Priya Sharma', 'Mother of Priya', 'O+', 2, h1, 'Apollo Hospitals Navi Mumbai', json_build_object('address', 'Navi Mumbai', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India'), now() + interval '1 day', 'Scheduled Surgery', 'urgent', 'fulfilled');
  
  -- SCENARIO B: Requester matched with a Donor
  -- Rajesh volunteers to donate. 
  INSERT INTO public.blood_requests (id, requester_id, requester_name, patient_name, blood_group, units, location, date_needed, reason, priority, status, assigned_donor_id, assigned_donor_name, hospital_name)
  VALUES (req2, r1, 'Priya Sharma', 'Relative in Accident', 'O+', 1, json_build_object('address', 'Bandra', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India'), now() + interval '2 days', 'Accident', 'emergency', 'donor_assigned', d1, 'Rajesh Kumar', 'Lilavati Hospital');

  -- SCENARIO C: Donor Rewards (Hospital marks donation as completed)
  -- Rajesh finishes his donation at Lilavati Hospital.
  INSERT INTO public.donations (donor_id, donor_name, hospital_id, hospital_name, request_id, blood_group, units, status, scheduled_date, completed_date, points_earned)
  VALUES (d1, 'Rajesh Kumar', h2, 'Lilavati Hospital', req2, 'O+', 1, 'completed', now() - interval '1 day', now(), 150);

END $$;
