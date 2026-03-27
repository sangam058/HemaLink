# Local Testing Checklist

## 🚀 Quick Start - Test Everything Locally

### Option 1: Automated Testing (Recommended)
```bash
# Run this script
scripts/quick-test.bat
```

### Option 2: Manual Testing
```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Deploy database
scripts/deploy-database.bat

# 4. Start dev server
npm run dev
```

## 📋 Step-by-Step Testing Guide

### 1. Environment Setup ✅
- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created with Supabase credentials
- [ ] Database schema deployed (`scripts/deploy-database.bat`)

### 2. Application Startup ✅
- [ ] Run `npm run dev`
- [ ] Browser opens to http://localhost:5173
- [ ] No console errors on page load
- [ ] Welcome page displays correctly

### 3. Configuration Testing ✅
Open browser console (F12) and run:
```javascript
testLocalSetup()
```

Expected results:
- [ ] ✅ Environment variables configured correctly
- [ ] ✅ Supabase client initialized
- [ ] ✅ Database connection successful
- [ ] ✅ Auth system working
- [ ] ✅ Real-time subscription active
- [ ] ✅ All tables accessible

### 4. User Registration Testing ✅

#### Admin Access
- [ ] Go to `/login`
- [ ] Login: `sangam@gmail.com` / `sangam362004`
- [ ] Role: Admin
- [ ] Dashboard loads successfully
- [ ] Admin navigation works

#### Donor Registration
- [ ] Go to `/signup`
- [ ] Fill donor registration form:
  ```
  Name: Test Donor
  Email: test@donor.com
  Phone: 1234567890
  Role: Donor
  Blood Group: O+
  Location: Mumbai, India
  ```
- [ ] Submit successfully
- [ ] Redirect to donor dashboard
- [ ] Donor profile shows correctly
- [ ] Check Supabase Dashboard → profiles table

#### Requester Registration
- [ ] Register as blood requester
- [ ] Dashboard loads with request management
- [ ] Create new blood request
- [ ] Request appears in dashboard

#### Hospital Registration
- [ ] Register as hospital
- [ ] Dashboard loads with hospital features
- [ ] Hospital profile displays correctly

### 5. Data Flow Testing ✅

#### Blood Request Flow
- [ ] Login as requester
- [ ] Create blood request:
  ```
  Patient Name: Test Patient
  Blood Group: A+
  Units: 2
  Hospital: Test Hospital
  Priority: Normal
  ```
- [ ] Request appears in dashboard
- [ ] Check Supabase → blood_requests table
- [ ] Data appears correctly

#### Donation Flow
- [ ] Login as donor
- [ ] View available requests
- [ ] Respond to a request
- [ ] Donation appears in donor dashboard
- [ ] Check Supabase → donations table

#### Real-time Testing
- [ ] Open two browser windows
- [ ] Create request in one window
- [ ] Updates appear in other window automatically
- [ ] Console shows real-time subscription messages

### 6. Navigation & Routing ✅
- [ ] All routes work without 404 errors:
  - `/` - Home page
  - `/about` - About page
  - `/login` - Login page
  - `/signup` - Signup page
  - `/donor` - Donor dashboard (requires auth)
  - `/requester` - Requester dashboard (requires auth)
  - `/hospital` - Hospital dashboard (requires auth)
  - `/admin` - Admin dashboard (requires auth)

- [ ] Role-based routing works correctly
- [ ] Navigation between pages is smooth
- [ ] Back/forward browser buttons work

### 7. Error Handling ✅
- [ ] Invalid login shows proper error message
- [ ] Duplicate registration handled gracefully
- [ ] Network errors show user-friendly messages
- [ ] Loading states display during operations
- [ ] Form validation works correctly

## 🔍 Debugging Commands

### Browser Console Tests
```javascript
// Check environment
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 10) + '...');

// Check auth
supabase.auth.getSession().then(({ data: { session } }) => {
  console.log('Session:', session ? 'Active' : 'None');
});

// Test database
supabase.from('profiles').select('count').then(console.log);

// Run full test suite
testLocalSetup()
```

### Database Verification
After testing, check Supabase Dashboard:

#### Authentication → Users
- [ ] New users appear after registration
- [ ] Email verification works (if enabled)

#### Table Editor
- [ ] `profiles` table has user records
- [ ] `donors` table has donor-specific data
- [ ] `requesters` table has requester data
- [ ] `hospitals` table has hospital data
- [ ] `blood_requests` table has requests
- [ ] `donations` table has donation records

## ✅ Success Criteria

Your local setup is READY when:

1. **Environment**: All environment variables configured
2. **Database**: Connection successful and all tables accessible
3. **Authentication**: Login/registration works for all user types
4. **Dashboards**: All role-based dashboards load correctly
5. **Data Flow**: CRUD operations work and sync with Supabase
6. **Real-time**: Live updates work across multiple sessions
7. **Navigation**: All routes work without errors
8. **Error Handling**: Graceful error handling throughout

## 🚨 Common Issues & Solutions

### Issue: "Supabase credentials missing"
**Solution**: Check `.env.local` file exists and has correct values

### Issue: Database connection failed
**Solution**: Run `scripts/deploy-database.bat` to deploy schema

### Issue: Dashboard not loading after registration
**Solution**: 
1. Check browser console for errors
2. Verify user appears in `profiles` table
3. Check database triggers are deployed

### Issue: Real-time updates not working
**Solution**:
1. Check WebSocket connections in DevTools Network tab
2. Verify Real-time is enabled in Supabase Dashboard
3. Check RLS policies allow subscriptions

## 📊 Test Results Template

Copy and paste this to track your progress:

```
=== LOCAL TEST RESULTS ===
Date: ___________

Environment Setup:
✅ Dependencies installed: [Yes/No]
✅ .env.local configured: [Yes/No]
✅ Database deployed: [Yes/No]

Application Testing:
✅ App starts without errors: [Pass/Fail]
✅ Environment variables work: [Pass/Fail]
✅ Database connection: [Pass/Fail]
✅ Auth system: [Pass/Fail]
✅ Real-time subscriptions: [Pass/Fail]

User Registration:
✅ Admin login works: [Pass/Fail]
✅ Donor registration: [Pass/Fail]
✅ Requester registration: [Pass/Fail]
✅ Hospital registration: [Pass/Fail]

Data Flow:
✅ Blood requests work: [Pass/Fail]
✅ Donations work: [Pass/Fail]
✅ Real-time updates: [Pass/Fail]

Navigation & UI:
✅ All routes work: [Pass/Fail]
✅ Role-based routing: [Pass/Fail]
✅ Error handling: [Pass/Fail]

OVERALL STATUS: [READY FOR DEPLOY / FIX ISSUES]

Notes: _________________________________
```

## 🎯 Ready to Deploy?

If all tests pass:

1. **Commit changes:**
```bash
git add .
git commit -m "feat: complete local testing and validation"
```

2. **Push to main:**
```bash
git push origin main
```

3. **Deploy to Vercel:**
```bash
vercel --prod
```

4. **Set Vercel Environment Variables:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

**🎉 Once all local tests pass, you're ready to push to main repo and deploy!**
