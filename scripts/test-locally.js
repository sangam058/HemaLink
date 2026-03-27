// Local Testing Script for Hemalink
// Run this to verify everything works locally

const testLocalSetup = async () => {
  console.log('🧪 Starting Local Hemalink Testing...');
  console.log('=====================================');
  
  const results = {
    environment: false,
    supabase: false,
    auth: false,
    database: false,
    realtime: false
  };
  
  // Test 1: Environment Variables
  console.log('\n📋 1. Testing Environment Variables...');
  const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey && 
      supabaseUrl !== 'https://placeholder.supabase.co' && 
      supabaseKey !== 'placeholder-key') {
    console.log('✅ Environment variables configured correctly');
    results.environment = true;
  } else {
    console.log('❌ Environment variables missing or invalid');
    console.log('   Check your .env.local file');
  }
  
  // Test 2: Supabase Connection
  console.log('\n🔌 2. Testing Supabase Connection...');
  try {
    const { supabase } = await import('./src/lib/supabase.js');
    if (supabase) {
      console.log('✅ Supabase client initialized');
      results.supabase = true;
      
      // Test 3: Database Connection
      console.log('\n🗄️ 3. Testing Database Connection...');
      const { data, error } = await supabase.from('profiles').select('count').single();
      
      if (!error && data !== null) {
        console.log('✅ Database connection successful');
        results.database = true;
        
        // Test 4: Auth System
        console.log('\n🔐 4. Testing Auth System...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('✅ Auth system working (Current session:', session ? 'Active' : 'None', ')');
        results.auth = true;
        
        // Test 5: Real-time Subscriptions
        console.log('\n📡 5. Testing Real-time Subscriptions...');
        const channel = supabase
          .channel('test-local')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'profiles' }, 
            (payload) => console.log('   📡 Real-time event received:', payload.event)
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('✅ Real-time subscription active');
              results.realtime = true;
            }
          });
        
        // Cleanup after 3 seconds
        setTimeout(() => {
          supabase.removeChannel(channel);
        }, 3000);
        
      } else {
        console.log('❌ Database connection failed:', error?.message);
      }
    }
  } catch (error) {
    console.log('❌ Supabase initialization failed:', error.message);
  }
  
  // Test 6: All Tables Access
  console.log('\n📊 6. Testing Table Access...');
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
  
  let tableAccessResults = [];
  try {
    const { supabase } = await import('./src/lib/supabase.js');
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('count').single();
        if (!error) {
          console.log(`   ✅ ${table}`);
          tableAccessResults.push(true);
        } else {
          console.log(`   ❌ ${table}: ${error.message}`);
          tableAccessResults.push(false);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`);
        tableAccessResults.push(false);
      }
    }
  } catch (error) {
    console.log('❌ Could not test table access:', error.message);
  }
  
  // Results Summary
  console.log('\n📋 TEST RESULTS SUMMARY');
  console.log('=====================================');
  
  const allPassed = Object.values(results).every(v => v === true) && 
                   tableAccessResults.every(v => v === true);
  
  console.log(`Environment Variables: ${results.environment ? '✅' : '❌'}`);
  console.log(`Supabase Client: ${results.supabase ? '✅' : '❌'}`);
  console.log(`Database Connection: ${results.database ? '✅' : '❌'}`);
  console.log(`Auth System: ${results.auth ? '✅' : '❌'}`);
  console.log(`Real-time Subscriptions: ${results.realtime ? '✅' : '❌'}`);
  console.log(`All Tables Access: ${tableAccessResults.every(v => v === true) ? '✅' : '❌'}`);
  
  console.log('\n🎯 OVERALL STATUS:', allPassed ? '✅ READY FOR DEPLOYMENT' : '❌ FIX ISSUES FIRST');
  
  if (!allPassed) {
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    if (!results.environment) {
      console.log('   • Set up .env.local with correct Supabase credentials');
    }
    if (!results.database) {
      console.log('   • Deploy database schema using scripts/deploy-database.bat');
    }
    if (!results.auth) {
      console.log('   • Check Supabase Auth settings');
    }
    if (!results.realtime) {
      console.log('   • Enable Real-time in Supabase Dashboard');
    }
    if (!tableAccessResults.every(v => v === true)) {
      console.log('   • Check RLS policies and table permissions');
    }
  } else {
    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Test user registration flows');
    console.log('   2. Test dashboard loading');
    console.log('   3. Test CRUD operations');
    console.log('   4. Commit and push to main repo');
    console.log('   5. Deploy to Vercel');
  }
  
  return allPassed;
};

// Auto-run in browser
if (typeof window !== 'undefined') {
  window.testLocalSetup = testLocalSetup;
  console.log('🚀 Run testLocalSetup() in console to test everything locally');
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testLocalSetup };
}
