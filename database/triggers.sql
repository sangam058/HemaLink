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
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone',
    role_text::user_role,
    (new.raw_user_meta_data->>'location')::jsonb
  );

  -- 2. Insert into role-specific table
  IF role_text = 'donor' THEN
    INSERT INTO public.donors (id, blood_group, is_available)
    VALUES (new.id, (new.raw_user_meta_data->>'bloodGroup')::blood_group, true);
  ELSIF role_text = 'requester' THEN
    INSERT INTO public.requesters (id, emergency_contact)
    VALUES (new.id, new.raw_user_meta_data->>'emergencyContact');
  ELSIF role_text = 'hospital' THEN
    INSERT INTO public.hospitals (id, hospital_name, license_number, status)
    VALUES (
      new.id, 
      new.raw_user_meta_data->>'hospitalName', 
      new.raw_user_meta_data->>'licenseNumber',
      'pending_approval'
    );
  ELSIF role_text = 'admin' THEN
    INSERT INTO public.admins (id, permissions)
    VALUES (new.id, '[]'::jsonb);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a generic function that calls our Edge Function via pg_net
CREATE OR REPLACE FUNCTION public.invoke_notification_hub()
RETURNS trigger AS $$
DECLARE
  webhook_url TEXT := 'https://YOUR_SUPABASE_PROJECT_IDENTIFIER.supabase.co/functions/v1/notification-hub';
  webhook_secret TEXT := current_setting('app.settings.webhook_secret', true); -- Or hardcode a secret
  payload JSONB;
BEGIN
  payload := json_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'record', row_to_json(NEW),
    'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE null END
  );

  PERFORM net.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || webhook_secret
    ),
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 1. Trigger for Welcome Email on New Profile
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.invoke_notification_hub();

-- 2. Trigger for Emergency Blood Requests
DROP TRIGGER IF EXISTS on_emergency_request_created ON public.blood_requests;
CREATE TRIGGER on_emergency_request_created
  AFTER INSERT ON public.blood_requests
  FOR EACH ROW
  WHEN (NEW.priority = 'emergency')
  EXECUTE FUNCTION public.invoke_notification_hub();

-- 3. Trigger for Scheduled Donations
DROP TRIGGER IF EXISTS on_donation_booked ON public.donations;
CREATE TRIGGER on_donation_booked
  AFTER INSERT ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.invoke_notification_hub();

-- 4. Trigger for Low Inventory Warning
DROP TRIGGER IF EXISTS on_inventory_low ON public.blood_inventory;
CREATE TRIGGER on_inventory_low
  AFTER UPDATE ON public.blood_inventory
  FOR EACH ROW
  WHEN (NEW.units < 5 AND OLD.units >= 5)
  EXECUTE FUNCTION public.invoke_notification_hub();

-- 5. Trigger for New Hospital Campaigns
DROP TRIGGER IF EXISTS on_campaign_created ON public.campaigns;
CREATE TRIGGER on_campaign_created
  AFTER INSERT ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.invoke_notification_hub();

-- 6. Trigger for Donor Rewards when Donation is Completed
CREATE OR REPLACE FUNCTION public.handle_donation_completed()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.donors
    SET 
      points = points + COALESCE(NEW.points_earned, 50),
      total_donations = total_donations + 1,
      last_donation_date = COALESCE(NEW.completed_date, now())
    WHERE id = NEW.donor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_donation_completed ON public.donations;
CREATE TRIGGER on_donation_completed
  AFTER UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_donation_completed();

-- 7. Trigger for Request Updates (Match / Fulfill)
DROP TRIGGER IF EXISTS on_request_status_updated ON public.blood_requests;
CREATE TRIGGER on_request_status_updated
  AFTER UPDATE OF status ON public.blood_requests
  FOR EACH ROW
  WHEN (NEW.status IN ('fulfilled', 'donor_assigned'))
  EXECUTE FUNCTION public.invoke_notification_hub();

