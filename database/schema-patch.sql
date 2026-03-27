-- 1. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Safely trigger RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Debug Logs Table
CREATE TABLE IF NOT EXISTS public.debug_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT DEFAULT 'info',
  message TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.debug_logs ENABLE ROW LEVEL SECURITY;

-- 3. DROP ALL EXISTING POLICIES (to make script re-runnable)
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can mark own notifications as read" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert logs" ON public.debug_logs;
DROP POLICY IF EXISTS "Admins can view logs" ON public.debug_logs;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- 4. RE-CREATE POLICIES
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mark own notifications as read" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert logs" ON public.debug_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view logs" ON public.debug_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- 5. FUNCTION: call_notification_hub (FIXED JSON SYNTAX)
-- This function is now completely bulletproof even if headers are missing
CREATE OR REPLACE FUNCTION public.call_notification_hub()
RETURNS trigger AS $$
DECLARE
  headers_text TEXT;
  host_val TEXT;
BEGIN
  -- Safely get request context
  BEGIN
    headers_text := current_setting('request.headers', true);
    -- Check if it looks like JSON
    IF headers_text IS NOT NULL AND left(headers_text, 1) = '{' THEN
      host_val := (headers_text::jsonb)->>'host';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    host_val := NULL;
  END;

  -- Only attempt network call if we are in a real request (not SQL editor/seed)
  IF host_val IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://' || host_val || '/functions/v1/notification-hub',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', current_setting('request.headers', true)
      ),
      body := jsonb_build_object(
        'table', TG_TABLE_NAME,
        'type', TG_OP,
        'record', row_to_json(NEW)
      )::text
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never fail the main transaction
  RAISE WARNING 'Notification hub skipped: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. TRIGGERS
DROP TRIGGER IF EXISTS on_blood_request_created ON public.blood_requests;
CREATE TRIGGER on_blood_request_created
  AFTER INSERT ON public.blood_requests
  FOR EACH ROW EXECUTE FUNCTION public.call_notification_hub();

DROP TRIGGER IF EXISTS on_donation_completed ON public.donations;
CREATE TRIGGER on_donation_completed
  AFTER UPDATE OF status ON public.donations
  FOR EACH ROW WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.call_notification_hub();

-- Done!
SELECT 'SCHEMA PATCH APPLIED SUCCESSFULLY' as status;
