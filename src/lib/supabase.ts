import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Only show warning if keys are missing in production/vercel
if ((!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) && import.meta.env.PROD) {
  console.warn('⚠️ Supabase credentials missing. Check your Vercel Environment Variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
