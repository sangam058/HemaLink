import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Enhanced validation
const isConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey !== 'placeholder-key';

// Only show warning if keys are missing in production/vercel
if (!isConfigured && import.meta.env.PROD) {
  console.error('❌ Supabase credentials missing in production. Check your Vercel Environment Variables.');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// SAFE DEBUGGING: Log if keys are present (just the first 5 chars for safety)
if (import.meta.env.PROD && isConfigured) {
  console.log('✅ Supabase Connection Status:', {
    urlFound: !!supabaseUrl,
    keyFound: !!supabaseAnonKey,
    urlPrefix: supabaseUrl?.substring(0, 15), // Safe to show origin
    keyPrefix: supabaseAnonKey?.substring(0, 8)  // Safe for debugging 'eyJ'
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export const isSupabaseConfigured = isConfigured;
