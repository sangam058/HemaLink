-- Run this in your Supabase SQL Editor AFTER deploying the edge function

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

