import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gtrcrlffraubioivlzxy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0cmNybGZmcmF1YmlvaXZsenh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODExNjcsImV4cCI6MjA4OTI1NzE2N30.wa9iTuRYrsDRDz3-z5pbLft4X126yHY3rcPZg-WzAbI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function registerRealAdmin() {
  const email = 'sangam@gmail.com';
  const password = 'sangam362004';

  console.log(`🚀 Creating admin account for ${email}...`);

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: 'Sangam Admin',
        phone: '+910000000000',
        role: 'admin',
        location: { city: 'Mumbai', address: 'System Default' }
      }
    }
  });

  if (signUpError) {
    if (signUpError.message.includes('already registered')) {
      console.log(`\n⚠️ Wait, ${email} is already in the database but currently corrupted!`);
      console.log(`\n---> ACTION REQUIRED <---`);
      console.log('1. Go to your Supabase Dashboard SQL Editor');
      console.log(`2. Run this command to wipe the broken account:`);
      console.log(`   DELETE FROM auth.users WHERE email = '${email}';`);
      console.log(`3. Run this script again:  node register-admin-fix.js`);
    } else {
      // Sometimes "Database error finding user" pops up if it's deeply corrupted
      console.log(`\n❌ Error from Supabase:`, signUpError.message);
      console.log(`\nIf you see 'Database error finding user', it's because the old SQL script left a broken ghost account.`);
      console.log(`Please go to the Supabase Dashboard SQL Editor and run:`);
      console.log(`DELETE FROM auth.users WHERE email = '${email}';`);
      console.log(`Then try this script again.`);
    }
    return;
  }

  // Double check login
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  
  if (signInError) {
    console.error('Login verify failed:', signInError.message);
  } else {
    console.log(`\n🎉 SUCCESS! Your admin account is fully functional!`);
    console.log(`You can now log into the web app as admin with these credentials.`);
  }
}

registerRealAdmin().catch(console.error);
