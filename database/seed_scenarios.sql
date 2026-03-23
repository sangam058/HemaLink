-- Hemalink Real-World Seed Data (Mumbai, Maharashtra)
-- IMPORTANT: Run this in your Supabase SQL Editor.
-- This script leverages your existing triggers (`handle_new_user`, `on_donation_completed`, `on_request_status_updated`)
-- to seamlessly simulate a real-world application state!

DO $$
DECLARE
  hospital_uuid UUID := gen_random_uuid();
  donor_uuid UUID := gen_random_uuid();
  requester_uuid UUID := gen_random_uuid();
  req_match_uuid UUID := gen_random_uuid();
BEGIN
  -- 1. Create Real-World Entities directly into auth.users
  -- Your 'handle_new_user' trigger will automatically sync these to profiles, donors, requesters, and hospitals!
  
  -- HOSPITAL: Mumbai City General
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
  VALUES (
    hospital_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
    'hospital@mumbai.in', crypt('demo123', gen_salt('bf')), now(), 
    json_build_object('name', 'Mumbai City General', 'role', 'hospital', 'hospitalName', 'Mumbai City General', 'licenseNumber', 'MUM-LIC-999', 'phone', '+919876543210', 'location', json_build_object('address', 'Dharavi', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), 
    now(), now()
  );

  -- DONOR: Rajesh Kumar
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
  VALUES (
    donor_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
    'rajesh@donor.in', crypt('demo123', gen_salt('bf')), now(), 
    json_build_object('name', 'Rajesh Kumar', 'role', 'donor', 'bloodGroup', 'O+', 'phone', '+918888888888', 'location', json_build_object('address', 'Andheri East', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), 
    now(), now()
  );

  -- REQUESTER: Priya Sharma
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
  VALUES (
    requester_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
    'priya@requester.in', crypt('demo123', gen_salt('bf')), now(), 
    json_build_object('name', 'Priya Sharma', 'role', 'requester', 'phone', '+917777777777', 'emergencyContact', '+919999999999', 'location', json_build_object('address', 'Bandra West', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India')), 
    now(), now()
  );

  -- 2. Verify Mumbai City General Hospital
  UPDATE public.hospitals SET status = 'active', verified_at = now() WHERE id = hospital_uuid;
  UPDATE public.profiles SET is_verified = true WHERE id = hospital_uuid;

  -- 3. Add Inventory to Hospital
  INSERT INTO public.blood_inventory (hospital_id, blood_group, units, expiry_date)
  VALUES (hospital_uuid, 'O+', 10, now() + interval '30 days');

  -- 4. SCENARIO 1: Requester matched from Hospital Inventory
  -- Priya requests O+ blood and the hospital fulfills it.
  -- This will trigger "Your Blood Request has been Fulfilled!" email to Priya.
  INSERT INTO public.blood_requests (requester_id, requester_name, patient_name, blood_group, units, hospital_id, hospital_name, location, date_needed, reason, priority, status)
  VALUES (requester_uuid, 'Priya Sharma', 'Mother of Priya', 'O+', 2, hospital_uuid, 'Mumbai City General', json_build_object('address', 'Bandra West', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India'), now() + interval '1 day', 'Scheduled Surgery', 'urgent', 'fulfilled');
  
  -- 5. SCENARIO 2: Requester matched with a Donor
  -- Rajesh volunteers to donate. 
  -- This will trigger "A Donor has accepted your blood request!" email to Priya.
  INSERT INTO public.blood_requests (id, requester_id, requester_name, patient_name, blood_group, units, location, date_needed, reason, priority, status, assigned_donor_id, assigned_donor_name, hospital_name)
  VALUES (req_match_uuid, requester_uuid, 'Priya Sharma', 'Relative in Accident', 'O+', 1, json_build_object('address', 'Bandra West', 'city', 'Mumbai', 'state', 'Maharashtra', 'country', 'India'), now() + interval '2 days', 'Accident', 'emergency', 'donor_assigned', donor_uuid, 'Rajesh Kumar', 'Mumbai City General');

  -- 6. SCENARIO 3: Donor Rewards (Hospital marks donation as completed)
  -- Rajesh finishes his donation at Mumbai City General.
  -- This fires the `on_donation_completed` trigger which correctly gives Rajesh his rewards points!
  INSERT INTO public.donations (donor_id, donor_name, hospital_id, hospital_name, request_id, blood_group, units, status, scheduled_date, completed_date, points_earned)
  VALUES (donor_uuid, 'Rajesh Kumar', hospital_uuid, 'Mumbai City General', req_match_uuid, 'O+', 1, 'completed', now() - interval '1 day', now(), 150);

END $$;
