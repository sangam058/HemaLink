-- HemaLink Schema Patch
-- Run this in the Supabase SQL Editor to add missing tables

--------------------------------------------------------------------------------
-- 1. Notifications Table
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('request', 'donation', 'campaign', 'reward', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Safely Create Policies (using DROP IF EXISTS to allow re-running)
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark own notifications as read" ON public.notifications;
CREATE POLICY "Users can mark own notifications as read" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

--------------------------------------------------------------------------------
-- 2. Debug Logs Table (For System Monitoring)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.debug_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  level TEXT DEFAULT 'info',
  message TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.debug_logs ENABLE ROW LEVEL SECURITY;

-- Admins only
CREATE POLICY "Admins can view logs" ON public.debug_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

--------------------------------------------------------------------------------
-- 3. Update Realtime Publication
--------------------------------------------------------------------------------
BEGIN;
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
COMMIT;

--------------------------------------------------------------------------------
-- 4. Edge Function Webhooks (Professional Email Alerts)
--------------------------------------------------------------------------------
-- Enable the net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Function to call the notification-hub edge function
CREATE OR REPLACE FUNCTION public.call_notification_hub()
RETURNS trigger AS $$
  DECLARE
    headers_text TEXT;
    host_val TEXT;
    auth_val TEXT;
  BEGIN
    -- This helps avoid errors when running from the SQL Editor where headers are missing
    BEGIN
      headers_text := current_setting('request.headers', true);
      IF headers_text IS NOT NULL AND headers_text LIKE '{%' THEN
        host_val := headers_text::jsonb->>'host';
        auth_val := headers_text::jsonb->>'authorization';
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- If headers are not valid JSON or missing, just keep them NULL
    END;

    -- Only proceed if we have a valid host (e.g. not a seed script)
    IF host_val IS NOT NULL THEN
      PERFORM net.http_post(
        url := 'https://' || host_val || '/functions/v1/notification-hub',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || auth_val
        ),
        body := jsonb_build_object(
          'table', TG_TABLE_NAME,
          'type', TG_OP,
          'record', row_to_json(NEW),
          'old_record', row_to_json(OLD)
        )::text
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Completely silent failure for notifications to ensure main transaction SUCCEEDS
    RAISE WARNING 'Notification hub trigger failed: %', SQLERRM;
  END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for important events
DROP TRIGGER IF EXISTS on_blood_request_alert ON public.blood_requests;
CREATE TRIGGER on_blood_request_alert
  AFTER INSERT OR UPDATE ON public.blood_requests
  FOR EACH ROW EXECUTE FUNCTION public.call_notification_hub();

DROP TRIGGER IF EXISTS on_donation_alert ON public.donations;
CREATE TRIGGER on_donation_alert
  AFTER INSERT ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.call_notification_hub();

DROP TRIGGER IF EXISTS on_campaign_alert ON public.campaigns;
CREATE TRIGGER on_campaign_alert
  AFTER INSERT ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.call_notification_hub();
