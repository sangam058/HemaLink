// Test script to verify Supabase data connection
// Run this in browser console or as a Node.js script

const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase Data Connection...');
  
  // Check if environment variables are loaded
  const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
  
  console.log('📋 Environment Check:');
  console.log('- URL Found:', !!supabaseUrl);
  console.log('- Key Found:', !!supabaseKey);
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Environment variables missing');
    return false;
  }
  
  try {
    // Import Supabase client
    const { supabase } = await import('./src/lib/supabase.js');
    
    console.log('🔌 Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').single();
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // Test all tables
    const tables = [
      'profiles',
      'donors', 
      'requesters',
      'hospitals',
      'admins',
      'blood_requests',
      'donations',
      'blood_inventory',
      'campaigns'
    ];
    
    console.log('📊 Testing table access...');
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.error(`❌ Table ${table}:`, error.message);
        } else {
          console.log(`✅ Table ${table}: ${count} records`);
        }
      } catch (err) {
        console.error(`❌ Table ${table} error:`, err);
      }
    }
    
    // Test real-time subscriptions
    console.log('📡 Testing real-time subscriptions...');
    
    const channel = supabase
      .channel('test-connection')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        (payload) => console.log('📡 Real-time update:', payload)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active');
        } else {
          console.log('⚠️ Real-time status:', status);
        }
      });
    
    // Cleanup after 5 seconds
    setTimeout(() => {
      supabase.removeChannel(channel);
      console.log('🧹 Test completed');
    }, 5000);
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
};

// Auto-run in browser
if (typeof window !== 'undefined') {
  window.testSupabaseConnection = testSupabaseConnection;
  console.log('🚀 Run testSupabaseConnection() in console to test');
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testSupabaseConnection };
}
