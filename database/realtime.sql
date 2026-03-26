-- Enable Realtime for the required tables
-- This adds the tables to the 'supabase_realtime' publication

-- First, ensure the publication exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Add tables to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE blood_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE donations;
ALTER PUBLICATION supabase_realtime ADD TABLE blood_inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;

-- Note: You may also need to enable the 'realtime' extension in the 
-- Database -> Extensions tab of your Supabase dashboard if it's not already on.
