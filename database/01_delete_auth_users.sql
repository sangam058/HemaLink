-- Run this in your Supabase SQL Editor to delete the ghost users!
-- IT VOUCHES TO CLEAN THE AUTHENTICATION CACHE SO THE ADMIN SCRIPT CAN RUN.

DELETE FROM auth.users WHERE email = 'sangam@gmail.com';

-- If you have any other test emails you made earlier, you can add them below like this:
-- DELETE FROM auth.users WHERE email = 'donor@gmail.com';
-- DELETE FROM auth.users WHERE email = 'hospital@gmail.com';

SELECT 'Ghost accounts deleted! You can now run register-admin-fix.js' as status;
