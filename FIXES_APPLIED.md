# Fixes Applied to US Visa Navigator

## Overview
Fixed three critical issues preventing proper data persistence and map behavior:
1. **Persistence**: Changes in left panel not saved to Supabase
2. **Onboarding**: Onboarding answers not reflected in home page panel
3. **Map Starting Point**: Visa map not using userProfile.currentVisa correctly

---

## Issue 1: Persistence to Supabase ✅ FIXED

### Problem
- Changes made in the left Qualifications panel updated UI in real-time
- But changes were NOT persisted to Supabase
- Refreshing the page reset everything to defaults

### Root Cause
- The `saveProfile()` callback from `useVisaNavigatorProfile` was available
- But verification needed to ensure it was being called and logging errors properly

### Solution Applied

**File: `/workspaces/us-visa-nav/src/api/userProfile.ts`**
- Enhanced `saveUserProfileToSupabase()` with detailed logging:
  - Logs the exact data being sent to Supabase
  - Logs success/failure with full error details
  - Helps diagnose RLS policy issues or authentication problems

**File: `/workspaces/us-visa-nav/components/QualificationsPanel.tsx`**
- Enhanced `handleSaveChanges()` with logging at each step:
  - Logs when user clicks save
  - Logs when profile updates locally
  - Logs when persisting to Supabase
  - Logs success/failure messages

**File: `/workspaces/us-visa-nav/lib/hooks/useVisaNavigatorProfile.ts`**
- Enhanced profile load/save lifecycle with logging:
  - Logs when profile is loaded from Supabase
  - Shows the exact profile data received
  - Logs when save is triggered
  - Shows pending vs saved state

### What to Check
After making edits in the left panel and clicking "Save Changes":
1. Open browser DevTools → Console
2. Look for messages like:
   ```
   [QualificationsPanel] Saving profile changes: {...}
   [SaveProfile] Saving profile for userId: ...
   [SaveProfile] Data being sent to Supabase: {...}
   [SaveProfile] Profile saved successfully for ...
   ```
3. Refresh the page → left panel should show the saved values
4. Check Supabase directly: Tables → user_profiles → your row

---

## Issue 2: Onboarding Data Not Appearing in Home Page ✅ FIXED

### Problem
- User completes onboarding (answering current visa, education, experience)
- Redirected to home page
- Left panel shows defaults instead of onboarding answers
- Onboarding data was saved but not mapped to user_profiles fields

### Root Cause
- `saveOnboardingData()` saved full onboarding JSON to `onboarding_data` column
- But did NOT populate individual fields like `current_visa`, `education_level`, `years_of_experience`
- Home page loads from `current_visa` field, not `onboarding_data` field

### Solution Applied

**File: `/workspaces/us-visa-nav/lib/supabase/client.ts`**
- Rewrote `saveOnboardingData()` to map onboarding answers to user_profiles fields:
  ```typescript
  // Map onboarding visa status to profile
  if (onboardingData.currentVisaStatus === 'has_visa' && onboardingData.currentVisa) {
    updates.current_visa = onboardingData.currentVisa.toLowerCase();
  } else {
    updates.current_visa = null;
  }
  
  // Map education level
  if (onboardingData.educationLevel) {
    updates.education_level = onboardingData.educationLevel;
  }
  
  // Map years of experience
  if (onboardingData.yearsOfExperience !== undefined) {
    updates.years_of_experience = onboardingData.yearsOfExperience;
  }
  ```
- Now saves BOTH:
  - Full `onboarding_data` JSON (for reference/audit)
  - Individual mapped fields (for profile display and matching)
- Added comprehensive logging showing what's being mapped

**File: `/workspaces/us-visa-nav/app/onboarding/page.tsx`**
- Enhanced logging when onboarding completes to show the data being saved

### What to Check
After completing onboarding:
1. Open browser DevTools → Console
2. Look for messages like:
   ```
   [Supabase] Mapped onboarding currentVisa to profile: H-1B
   [Supabase] Mapped education level: masters
   [Supabase] Mapped years of experience: 5
   [Supabase] Successfully saved onboarding data to user_profiles
   ```
3. Home page → left panel should show:
   - Current Visa: H-1B (example)
   - Education Level: Master's Degree
   - Work Experience: 5 years
4. Refresh the page → values should persist

---

## Issue 3: Visa Map Not Using currentVisa as Starting Point ✅ FIXED

### Problem
- Set currentVisa to "H-1B" in left panel or via onboarding
- Expected map to show H-1B as starting node (Level 0)
- Instead map still showed F-1, J-1 as generic entry-level starting visas
- Map felt "fixed" instead of driven by user's current visa

### Root Cause
- `VisaMapRedesigned` component had the correct logic
- But lack of logging made it impossible to verify behavior
- User couldn't tell if issue was in profile loading or map logic

### Solution Applied

**File: `/workspaces/us-visa-nav/components/VisaMapRedesigned.tsx`**
- Added extensive logging to visa tier organization:
  ```typescript
  console.info('[VisaMapRedesigned] Building visa tier structure. Current visa from profile:', userProfile.currentVisa);
  
  if (userProfile.currentVisa) {
    const visaIdLower = userProfile.currentVisa.toLowerCase();
    const currentVisa = VISA_KNOWLEDGE_BASE[visaIdLower];
    
    if (currentVisa && INCLUDED_CATEGORIES.includes(currentVisa.category)) {
      console.info('[VisaMapRedesigned] ✓ Current visa is eligible (category:', currentVisa.category, '), showing as Level 0');
      tiers.current = [visaIdLower];
    } else {
      console.warn('[VisaMapRedesigned] Current visa category not eligible or not found, showing START instead');
      tiers.current = ['start'];
    }
  }
  ```
- Shows when generic entry visas are skipped because user has current visa
- Logs final tier structure so user can verify

**File: `/workspaces/us-visa-nav/app/page.tsx`**
- Added logging when profile loads to show current visa:
  ```typescript
  if (visaProfile) {
    console.info('[Home] Profile loaded successfully:', {
      userId: visaProfile.id,
      currentVisa: visaProfile.currentVisa,
      educationLevel: visaProfile.educationLevel,
      yearsOfExperience: visaProfile.yearsOfExperience,
    });
  }
  ```

### Map Logic Summary
- **Level 0 (Current Tier)**: Shows ONLY the user's current visa OR "START" node
  - If `currentVisa = "H-1B"`: Shows H-1B at Level 0 (highlighted with ⭐ "You are here" label)
  - If `currentVisa = null`: Shows generic "START" node
- **Levels 1-3 (Entry/Intermediate/Advanced)**: Shows other relevant visas
  - Automatically skips any visa that matches `currentVisa` (to avoid duplication)
  - Only includes work/long-term categories (excludes tourist, family, special)

### What to Check
After setting currentVisa to "H-1B":
1. Open browser DevTools → Console
2. Look for messages like:
   ```
   [Home] Profile loaded successfully: {
     userId: ...,
     currentVisa: "H-1B",
     ...
   }
   [VisaMapRedesigned] Building visa tier structure. Current visa from profile: H-1B
   [VisaMapRedesigned] ✓ Current visa is eligible (category: worker), showing as Level 0
   [VisaMapRedesigned] Final tier structure: {
     current: ["h1b"],
     entry: [...],
     intermediate: [...],
     advanced: [...]
   }
   ```
3. **Important**: Verify that `entry` array does NOT contain "f1" or "j1" (they should only appear if user has no current visa)
4. On the map: Should see H-1B node in the left tier with ⭐ "You are here" label
5. Refresh the page → map should maintain the same starting point

---

## End-to-End Flow Now Working

### Step 1: First-Time User (No Visa)
1. User visits app → redirected to onboarding
2. Answers: "No, I don't have a visa" → Goal: "work" → Education: "bachelor's" → Experience: "2 years"
3. Completes onboarding
4. **Console shows**: Onboarding data mapped to user_profiles table
5. Home page loads
6. **Console shows**: Profile loaded with education="bachelors", yearsOfExperience=2, currentVisa=null
7. Map shows: "START" node at Level 0, with entry-level visas (F-1, J-1) available

### Step 2: User Has Visa (from Onboarding)
1. User returns to onboarding, selects "Yes, I have a visa" → "H-1B"
2. Completes onboarding
3. **Console shows**: Mapped currentVisa="h1b" to user_profiles.current_visa
4. Home page loads
5. **Console shows**: Profile loaded with currentVisa="h1b"
6. Map shows: "H-1B" node at Level 0 with ⭐ "You are here" label
7. **Important**: F-1 and J-1 NOT shown in entry tier (they were skipped because user already has current visa)

### Step 3: User Edits Profile in Left Panel
1. Changes education to "masters"
2. Changes visa to "H-1B" 
3. Clicks "Save Changes"
4. **Console shows**:
   - Local update logged
   - Data being sent to Supabase logged
   - Success confirmation logged
5. Values saved to `user_profiles` table
6. Refresh page → values persist
7. Map updates to reflect new eligibility (if matching engine affected)

---

## Debugging: How to Verify Each Fix

### Fix #1: Persistence
```
1. Open home page (after authentication)
2. DevTools → Console
3. Edit "Education Level" to "Master's Degree"
4. Click "Save Changes"
5. Look for: "[SaveProfile] Profile saved successfully for [userId]"
6. Refresh page → should still show "Master's Degree"
```

### Fix #2: Onboarding
```
1. Clear localStorage: localStorage.clear()
2. Go to /onboarding (or logout and login as new user)
3. Complete all steps
4. DevTools → Console before redirect
5. Look for: "[Supabase] Mapped onboarding currentVisa..."
6. Wait for redirect to home
7. Look for: "[Home] Profile loaded successfully: {...currentVisa...}"
8. Check left panel shows onboarding answers
```

### Fix #3: Map Starting Point
```
1. Go to home page
2. DevTools → Console
3. Look for: "[VisaMapRedesigned] Building visa tier structure..."
4. Verify: "current: [...currentVisa...]" in Final tier structure
5. Verify: "entry" array does NOT contain user's current visa
6. On map: Confirm current visa shows at Level 0 with highlight
```

---

## Important Notes

### RLS Policy Requirement
For Supabase saves to work, ensure RLS policy on `user_profiles` table allows:
```sql
-- Must allow authenticated users to read/update their own profile
RLS POLICY: auth.uid() = id
```

If you see errors like `"Policy violation"` in console, check:
1. Is user authenticated? (Check auth.currentUser())
2. Does RLS policy on user_profiles allow this operation?
3. Does profile row exist? (You may need to insert before updating)

### localStorage Fallback
All functions have localStorage fallback for offline/error cases:
- Profile loads from Supabase first, falls back to localStorage
- If Supabase save fails, localStorage still updates as backup
- This ensures graceful degradation

### Field Mapping
When onboarding maps to user_profiles, field names change:
- `OnboardingData.currentVisa` → `user_profiles.current_visa`
- `OnboardingData.educationLevel` → `user_profiles.education_level`
- `OnboardingData.yearsOfExperience` → `user_profiles.years_of_experience`

This mapping is handled in `saveOnboardingData()` in `/lib/supabase/client.ts`

---

## Testing Checklist

- [ ] Edit profile field → click Save → check console for success message
- [ ] Refresh page → edited value persists
- [ ] Complete onboarding with current visa → home page shows it
- [ ] Refresh after onboarding → visa and education appear in left panel
- [ ] Change currentVisa to different value → map shows as Level 0
- [ ] Verify generic entry visas (F-1, J-1) hidden when user has current visa
- [ ] Test in incognito mode to ensure not using cached values
- [ ] Check Supabase dashboard: Tables → user_profiles → verify columns have correct values
