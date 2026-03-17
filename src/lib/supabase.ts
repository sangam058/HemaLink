import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create the client if we have valid credentials to avoid fatal URL errors
export const supabase = (supabaseUrl && supabaseUrl !== 'YOUR_SUPABASE_PROJECT_URL') 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

// Provide a warning if Supabase is not configured
if (!supabase) {
  console.warn('Supabase is not configured. Some features may not work, falling back to local mock data.');
}
