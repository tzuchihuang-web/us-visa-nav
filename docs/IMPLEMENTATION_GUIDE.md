# Implementation Guide: Next Steps

This guide walks you through connecting the US Visa Nav app to a real Supabase backend and testing the authentication + database functionality.

## Phase 2 Status: ✅ Complete

Authentication system is fully implemented and ready to connect to Supabase.

**What's been built:**
- ✅ Authentication pages (signup/login)
- ✅ Protected routes on all pages
- ✅ useAuth hook with session management
- ✅ User profile page with edit functionality
- ✅ Supabase service functions (lib/supabase/client.ts)
- ✅ Database schema (user_profiles, visa_applications)
- ✅ Build verified (npm run build succeeds)

## Quick Start: 3 Steps

### Step 1: Create Supabase Project (5 mins)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `us-visa-nav` (or your choice)
   - Database Password: Create a strong password
   - Region: Choose closest to you (e.g., `us-east-1` for US)
5. Wait for project creation (2-3 minutes)
6. Once ready, go to **Settings → API**
7. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon Key** (long string starting with `eyJ...`)

### Step 2: Configure Environment Variables (2 mins)

1. In VS Code, open `.env.local`
2. Add these lines with your copied values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-key-here...
   ```
3. Save the file
4. Restart your dev server: Press `Ctrl+C` then `npm run dev`

### Step 3: Initialize Database Schema (3 mins)

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire SQL from `docs/SUPABASE_SETUP.ts`
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see 3 successful operations:
   - ✅ Created user_profiles table
   - ✅ Created visa_applications table
   - ✅ Created auto-profile trigger

### Step 4: Enable Email Authentication (2 mins)

1. In Supabase, go to **Authentication → Providers** (left sidebar)
2. Find **Email**
3. Make sure it's **enabled** (toggle should be on)
4. Scroll to bottom and click **Save**

## Testing the Flow

### Test Signup:
1. Go to `http://localhost:3000`
2. You'll be redirected to `/auth` (login page)
3. Click **Sign Up** tab
4. Enter any email and password (min 6 chars)
5. Click **Sign Up**
6. Wait 1-2 seconds...
7. You should be redirected to home page (skill-tree visible!)

### Verify in Supabase:
1. Go to Supabase dashboard
2. Go to **SQL Editor** → **New Query**
3. Run this:
   ```sql
   SELECT id, email, created_at FROM user_profiles ORDER BY created_at DESC LIMIT 5;
   ```
4. You should see your newly created account!

### Test Login:
1. Go to `/auth`
2. Use the same email/password from signup
3. Click **Sign In**
4. Should redirect to home page again
5. Header should show your email in top right

### Test Profile Page:
1. Click **Profile** in header
2. You should see your email, name field (empty), and visa interests (empty)
3. Click **Edit Profile**
4. Type a name, click **Save**
5. Name should persist (refresh page - it stays!)

## File Structure: New Files Added

```
/lib/supabase/
  client.ts          - All database service functions
    getUserProfile()
    updateUserProfile()
    updateUserSkills()
    setCurrentVisa()
    addVisaInterest()
    removeVisaInterest()
    getVisaApplications()
    createVisaApplication()
    updateApplicationProgress()
    deleteVisaApplication()

/app/auth/
  page.tsx           - Signup/login form (already created)

/lib/hooks/
  useAuth.ts         - Authentication hook (already created)

/components/
  ProtectedRoute.tsx - Route protection (already created)
```

## Database Schema Summary

### user_profiles table
```
id (UUID) - User ID from auth
email (text) - User's email
name (text) - Display name
current_visa (text) - Currently selected visa
visa_interests (text[]) - Array of visa codes (F1, H1B, etc)
education_level (int 0-5) - Skill level
work_experience (int 0-5) - Skill level
field_of_work (int 0-5) - Skill level
citizenship_level (int 0-5) - Skill level
investment_level (int 0-5) - Skill level
language_level (int 0-5) - Skill level
created_at (timestamp)
updated_at (timestamp)
```

### visa_applications table
```
id (UUID) - Application ID
user_id (UUID) - Reference to user_profiles.id
visa_type (text) - Visa code (F1, H1B, etc)
status (text) - 'planning', 'in_progress', 'approved', 'denied'
current_step (int) - Which step in process
progress_percentage (int 0-100) - Overall progress
documents_uploaded (text[]) - Array of doc names
notes (text) - User's notes
created_at (timestamp)
updated_at (timestamp)
```

## Troubleshooting

### Build Error: "Module not found: Can't resolve '@supabase/supabase-js'"
**Solution:** The package is already installed. Verify:
```bash
npm list @supabase/supabase-js
```

### Environment Variables Not Working
**Solution:** Make sure you:
1. Edited `.env.local` (not `.env`)
2. Saved the file
3. **Restarted dev server** (Ctrl+C, then `npm run dev`)
4. Variables must start with `NEXT_PUBLIC_` to be accessible in browser

### "Failed to authenticate" error
**Solution:**
1. Check your email/password in form
2. Verify user exists in Supabase SQL:
   ```sql
   SELECT email FROM auth.users;
   ```
3. Make sure email authentication is enabled in Auth providers

### Profile data not saving
**Solution:**
1. Check browser console for errors (F12)
2. Verify `.env.local` has correct credentials
3. Check Supabase dashboard → SQL Editor → run:
   ```sql
   SELECT * FROM user_profiles LIMIT 1;
   ```

## Next Phase: Phase 3 (Visa Matching Algorithm)

Once you have Supabase working and can:
- ✅ Sign up / login with real Supabase
- ✅ See user data in database
- ✅ Edit and persist profile info

We'll build:
1. Skill level update UI on home page (skill-tree)
2. Visa eligibility matching based on skills
3. Application tracking page
4. Visa recommendation engine

## Need Help?

1. Check Supabase logs: Dashboard → Logs (see API errors)
2. Check browser console: F12 → Console (see client errors)
3. Review error messages in app
4. Check `.env.local` is correctly formatted

## Performance Notes

- Supabase queries are lazy-loaded (only run when needed)
- User profile loaded once per page mount
- Session persists via browser local storage
- All tables have Row-Level Security (users see only their own data)

---

**Ready to start?** Begin with Step 1 above!
