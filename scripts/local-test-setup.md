# Local Testing Guide for Hemalink

## 🚀 Complete Local Testing Before Push to Main

This guide will help you verify everything works perfectly locally before deploying.

## 📋 Prerequisites Checklist

### 1. Environment Setup
- [ ] Node.js 18+ installed
- [ ] Supabase project created
- [ ] Git repository initialized
- [ ] VS Code or preferred IDE ready

### 2. Local Environment Variables
Create `.env.local` file in project root:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Edit `.env.local` with your actual Supabase credentials:
```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

### 3. Database Setup
- [ ] Supabase project created and running
- [ ] Database schema deployed
- [ ] Triggers and functions deployed

## 🧪 Step-by-Step Local Testing

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Deploy Database Locally
```bash
# Windows
scripts/deploy-database.bat

# Or manually:
# 1. Open Supabase Dashboard → SQL Editor
# 2. Run database/schema.sql
# 3. Run database/triggers.sql
# 4. Run database/security.sql
```

### Step 3: Start Development Server
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## 🔍 Testing Checklist

### 1. Configuration Testing
- [ ] Application loads without errors
- [ ] No "Supabase credentials missing" errors
- [ ] Console shows: "✅ Supabase Connection Status"
- [ ] Welcome page displays correctly

### 2. Authentication Testing

#### Admin Login
- [ ] Go to `/login`
- [ ] Login with: `sangam@gmail.com` / `sangam362004`
- [ ] Select "Admin" role
- [ ] Dashboard loads successfully
- [ ] Admin navigation works

#### User Registration
**Donor Registration:**
- [ ] Go to `/signup`
- [ ] Fill donor form with test data
- [ ] Submit successfully
- [ ] Redirect to donor dashboard
- [ ] Donor profile data displays correctly

**Requester Registration:**
- [ ] Register as blood requester
- [ ] Dashboard loads with request management
- [ ] User data displays correctly

**Hospital Registration:**
- [ ] Register as hospital
- [ ] Dashboard loads with hospital features
- [ ] Hospital profile shows correctly

### 3. Data Flow Testing

#### Blood Request Creation
- [ ] Login as requester
- [ ] Create new blood request
- [ ] Request appears in dashboard
- [ ] Check Supabase Dashboard → blood_requests table
- [ ] Data appears correctly in database

#### Donation Management
- [ ] Login as donor
- [ ] View available requests
- [ ] Respond to a request
- [ ] Donation appears in donor dashboard
- [ ] Check Supabase → donations table

#### Real-time Updates
- [ ] Open two browser windows
- [ ] Create request in one window
- [ ] Updates appear in other window
- [ ] Console shows real-time subscription messages

### 4. Navigation Testing
- [ ] All routes work without 404 errors
- [ ] Role-based routing works correctly
- [ ] Navigation between pages is smooth
- [ ] Back/forward browser buttons work

### 5. Error Handling Testing
- [ ] Invalid login shows proper error
- [ ] Network errors handled gracefully
- [ ] Form validation works
- [ ] Loading states display properly

## 🛠️ Debugging Tools

### Browser Console Commands
Run these in browser console during testing:

```javascript
// Check Supabase connection
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase configured:', !!import.meta.env.VITE_SUPABASE_URL);

// Check auth state
supabase.auth.getSession().then(({ data: { session } }) => {
  console.log('Current session:', session);
});

// Test database connection
supabase.from('profiles').select('count').then(console.log);
```

### Network Tab Monitoring
- Open DevTools → Network tab
- Look for requests to your Supabase URL
- Check for 200/201 responses
- Verify WebSocket connections for real-time

### Database Verification
After testing, check Supabase Dashboard:
- [ ] Authentication → Users (new registrations)
- [ ] Table Editor → profiles (user data)
- [ ] Table Editor → blood_requests (requests created)
- [ ] Table Editor → donations (donation records)

## 📊 Performance Testing

### Load Time Testing
- [ ] Initial page load < 3 seconds
- [ ] Dashboard loads < 2 seconds
- [ ] Navigation between pages < 1 second

### Memory Testing
- [ ] No memory leaks during extended use
- [ ] Console shows no growing error count
- [ ] Application remains responsive

## 🐛 Common Issues & Solutions

### Issue: "Supabase credentials missing"
**Solution**: Check `.env.local` file exists and has correct values

### Issue: Dashboard not loading after registration
**Solution**: 
1. Check browser console for errors
2. Verify database triggers are deployed
3. Check user appears in `profiles` table

### Issue: Real-time updates not working
**Solution**:
1. Check WebSocket connections in Network tab
2. Verify Supabase Real-time is enabled
3. Check RLS policies allow subscriptions

### Issue: CORS errors
**Solution**: Add localhost to Supabase CORS settings

## ✅ Success Criteria

Your local setup is ready when:

1. **All user types can register and login**
2. **Dashboards load with correct data**
3. **CRUD operations work for all features**
4. **Real-time updates function properly**
5. **No console errors during normal usage**
6. **Data syncs correctly with Supabase**
7. **Navigation and routing work flawlessly**

## 🚀 Ready to Deploy Checklist

Before pushing to main repo, ensure:

- [ ] All tests above pass
- [ ] No sensitive data in code
- [ ] Environment variables properly configured
- [ ] Database schema deployed
- [ ] Git repository is clean
- [ ] Commit messages are descriptive

## 📝 Test Results Template

Use this to track your testing:

```
=== LOCAL TEST RESULTS ===
Date: [Date]
Environment: [Local/Production]

✅ Configuration: [Pass/Fail]
✅ Admin Login: [Pass/Fail] 
✅ Donor Registration: [Pass/Fail]
✅ Requester Registration: [Pass/Fail]
✅ Hospital Registration: [Pass/Fail]
✅ Blood Requests: [Pass/Fail]
✅ Donations: [Pass/Fail]
✅ Real-time Updates: [Pass/Fail]
✅ Navigation: [Pass/Fail]
✅ Error Handling: [Pass/Fail]

Notes:
[Any issues found]

Ready for Deploy: [Yes/No]
```

---

## 🎯 Next Steps After Local Testing

1. **Commit your changes:**
```bash
git add .
git commit -m "feat: complete local testing and fixes"
```

2. **Push to main:**
```bash
git push origin main
```

3. **Deploy to Vercel:**
```bash
vercel --prod
```

4. **Set Vercel Environment Variables**
5. **Test production deployment**

---

**🎉 Once all local tests pass, you're ready to push to main repo!**
