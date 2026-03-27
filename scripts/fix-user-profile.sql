-- IMMEDIATE FIX FOR USER PROFILE ISSUE
-- Run this in Supabase SQL Editor to fix the specific user

-- 1. Create the missing profile for user 3c6677d6-93a0-4031-be21-35ec0628c00d
INSERT INTO public.profiles (id, email, name, phone, role, location, is_verified, created_at)
VALUES (
  '3c6677d6-93a0-4031-be21-35ec0628c00d', 
  'testuser@example.com', -- Update with actual email used
  'Test User',
  '1234567890',
  'donor',
  '{"address": "Andheri (W)", "city": "mumbai", "state": "maharashtra", "country": "India"}',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  location = EXCLUDED.location,
  is_verified = EXCLUDED.is_verified;

-- 2. Create donor-specific data
INSERT INTO public.donors (id, blood_group, points, level, badges, total_donations, last_donation_date, is_available)
VALUES (
  '3c6677d6-93a0-4031-be21-35ec0628c00d',
  'O+', -- Update with actual blood group if different
  0,
  1,
  '[]'::jsonb,
  0,
  NULL,
  true
) ON CONFLICT (id) DO NOTHING;

-- 3. Verify the data was created
SELECT 'Profile and donor data created successfully' as status,
       p.name as profile_name,
       p.email as profile_email,
       p.role as user_role,
       d.blood_group as donor_blood_group
FROM profiles p
LEFT JOIN donors d ON p.id = d.id
WHERE p.id = '3c6677d6-93a0-4031-be21-35ec0628c00d';
