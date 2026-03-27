# Hemalink Database Deployment Checklist

## 🚀 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Login to Supabase: `supabase login`
- [ ] Have your Supabase Project Reference ready

### 2. Database Schema Deployment
- [ ] Run the deployment script:
  - Windows: `scripts/deploy-database.bat`
  - Mac/Linux: `bash scripts/deploy-database.sh`

### 3. Manual SQL Deployment (Alternative)
If the script fails, run these manually in Supabase SQL Editor:

#### Schema
```sql
-- Run database/schema.sql first
```

#### Triggers
```sql
-- Run database/triggers.sql second
```

#### Security Policies
```sql
-- Run database/security.sql third
```

## 🔧 Vercel Configuration

### Environment Variables
Add these in your Vercel Dashboard → Project Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Get Your Keys
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Settings → API
4. Copy the Project URL and Anon/Public Key

## 🧪 Testing Checklist

### User Registration Flow
- [ ] Donor registration works
- [ ] Requester registration works  
- [ ] Hospital registration works
- [ ] Admin login works (sangam@gmail.com / sangam362004)

### Dashboard Loading
- [ ] Donor dashboard loads after registration
- [ ] Requester dashboard loads after registration
- [ ] Hospital dashboard loads after registration
- [ ] Admin dashboard loads after login

### Database Tables
Verify these tables exist and have data:
- [ ] `profiles` - Base user information
- [ ] `donors` - Donor-specific data
- [ ] `requesters` - Requester-specific data
- [ ] `hospitals` - Hospital-specific data
- [ ] `admins` - Admin-specific data

## 🐛 Common Issues & Fixes

### Issue: Dashboard not loading after registration
**Cause**: Database triggers not deployed or profile creation failed
**Fix**: 
1. Check browser console for errors
2. Verify triggers are deployed: `supabase db push`
3. Check if user exists in `profiles` table

### Issue: "Supabase credentials missing" error
**Cause**: Environment variables not set in Vercel
**Fix**: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to Vercel

### Issue: User registration successful but login fails
**Cause**: Email verification required or profile not created
**Fix**: 
1. Check email for verification link
2. Verify database triggers are working
3. Check `profiles` table for user record

## 📊 Monitoring

### Check Logs
- Supabase Dashboard → Logs → Database
- Vercel Dashboard → Functions → Logs
- Browser Console (F12)

### Verify Real-time Updates
- Test blood request creation
- Verify dashboard updates in real-time
- Check WebSocket connections in console

## 🔄 Post-Deployment

1. **Clear Browser Cache**: Users may need to clear cache
2. **Test All User Flows**: End-to-end testing
3. **Monitor Performance**: Check dashboard load times
4. **Backup Database**: Create a backup after successful deployment

## 📞 Support

If issues persist:
1. Check this checklist first
2. Review browser console errors
3. Verify Supabase logs
4. Test with different user roles
5. Contact support with error logs
