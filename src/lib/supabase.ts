import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Only show warning if keys are missing in production/vercel
if ((!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) && import.meta.env.PROD) {
  console.warn('⚠️ Supabase credentials missing. Check your Vercel Environment Variables.');
}

// SAFE DEBUGGING: Log if keys are present (just the first 5 chars for safety)
if (import.meta.env.PROD) {
  console.log('🔌 Supabase Connection Status:', {
    urlFound: !!supabaseUrl,
    keyFound: !!supabaseAnonKey,
    urlPrefix: supabaseUrl?.substring(0, 15), // Safe to show origin
    keyPrefix: supabaseAnonKey?.substring(0, 8)  // Safe for debugging 'eyJ'
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
