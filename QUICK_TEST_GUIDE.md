# Quick Test Guide - US Visa Navigator Fixes

## 🚀 30-Second Summary of What Was Fixed

| Issue | Was Broken | Is Fixed | How to Verify |
|-------|-----------|----------|---------------|
| **Persistence** | Left panel edits didn't save to DB | Now saves to Supabase with logging | Edit field → Save → Refresh → persists |
| **Onboarding** | Answers didn't appear in home panel | Now maps to user_profiles fields | Complete onboarding → home shows answers |
| **Map Starting Point** | Map showed generic START even with H-1B set | Now shows currentVisa as Level 0 | Set visa → Map shows ⭐ at Level 0 |

---

## Quick Test 1: Persistence (2 minutes)

```
STEP 1: Navigate to home page
STEP 2: Open DevTools (F12) → Console tab
STEP 3: In left panel, change "Education Level" to "Master's Degree"
STEP 4: Click "Save Changes" button
STEP 5: In console, search for "[SaveProfile]"
  
EXPECTED: Should see message like:
  "[SaveProfile] Profile saved successfully for [userId]"

STEP 6: Refresh the page (Cmd+R or F5)
STEP 7: Left panel should still show "Master's Degree"

✅ PASS: Value persisted to Supabase
❌ FAIL: Value reverted or error in console
```

Console output to expect:
```
[QualificationsPanel] Saving profile changes: {educationLevel: "masters"}
[UseVisaNavigatorProfile] Starting profile save to Supabase...
[SaveProfile] Data being sent to Supabase: {education_level: "masters", ...}
[SaveProfile] Profile saved successfully for abc123
```

---

## Quick Test 2: Onboarding (3 minutes)

```
STEP 1: If you've done onboarding before, clear localStorage:
  → Open DevTools Console
  → Type: localStorage.clear()
  → Press Enter

STEP 2: Go to /onboarding (or logout and log back in as new user)

STEP 3: Fill in onboarding:
  Step 0: "Yes, I currently hold a U.S. visa"
  Step 1: Select "H-1B (Specialty Occupation Worker)"
  Step 2: Select education level "Master's Degree"
  Step 3: Enter experience "5" years
  → Click "Complete"

STEP 4: Open DevTools Console before redirect completes

STEP 5: Search for "[Supabase] Mapped"

EXPECTED: Should see messages like:
  "[Supabase] Mapped onboarding currentVisa to profile: H-1B"
  "[Supabase] Mapped education level: masters"
  "[Supabase] Mapped years of experience: 5"
  "[Supabase] Successfully saved onboarding data to user_profiles"

STEP 6: Wait for redirect to home page

STEP 7: Left panel should show:
  Current Visa: H-1B (or h1b)
  Education Level: Master's Degree (or masters)
  Work Experience: 5

STEP 8: Refresh page (Cmd+R or F5)

STEP 9: Left panel should STILL show H-1B, Master's, 5 years

✅ PASS: Onboarding answers appear and persist
❌ FAIL: Answers don't appear or disappear on refresh
```

Console output to expect:
```
[Onboarding] Completing onboarding and mapping to UserProfile: {
  currentVisaStatus: "has_visa",
  currentVisa: "H-1B",
  educationLevel: "masters",
  yearsOfExperience: 5
}
[Supabase] Mapped onboarding currentVisa to profile: H-1B
[Supabase] Mapped education level: masters
[Supabase] Mapped years of experience: 5
[Supabase] Successfully saved onboarding data to user_profiles
[Onboarding] Redirecting to home page after onboarding completion
[UseVisaNavigatorProfile] ✓ Profile loaded from Supabase: {
  id: "abc123...",
  currentVisa: "H-1B",
  educationLevel: "masters",
  yearsOfExperience: 5
}
```

---

## Quick Test 3: Map Starting Point (2 minutes)

```
STEP 1: Go to home page (ensure you have a profile loaded)

STEP 2: In left panel, set "Current Visa Status" to "H-1B"
  (or any visa value like "F-1", "L-1B", etc.)

STEP 3: Click "Save Changes"

STEP 4: Open DevTools Console

STEP 5: Search for "[VisaMapRedesigned]"

EXPECTED: Should see messages like:
  "[VisaMapRedesigned] Building visa tier structure. Current visa: H-1B"
  "[VisaMapRedesigned] ✓ Current visa is eligible (category: worker), showing as Level 0"
  "[VisaMapRedesigned] Final tier structure: { current: ["h1b"], entry: [...], ... }"

STEP 6: Look at the visa map on the right side

STEP 7: The leftmost column should show ONE visa node (H-1B)
  with a star ⭐ icon and label "You are here"

STEP 8: The next column (entry level) should show F-1, J-1, etc.
  but NOT H-1B (since it's already at Level 0)

STEP 9: Refresh page (Cmd+R or F5)

STEP 10: Map should still show H-1B at Level 0

✅ PASS: Current visa is at Level 0, entry visas in next tier
❌ FAIL: Map shows START node or H-1B in entry tier
```

Console output to expect:
```
[Home] Profile loaded successfully: {
  userId: "abc123...",
  currentVisa: "H-1B",
  educationLevel: "...",
  yearsOfExperience: ...
}
[VisaMapRedesigned] Building visa tier structure. Current visa: H-1B
[VisaMapRedesigned] User has currentVisa: H-1B
[VisaMapRedesigned] Looking up visa in knowledge base: h1b
[VisaMapRedesigned] ✓ Current visa is eligible (category: worker), showing as Level 0
[VisaMapRedesigned] Skipping visa h1b (already showing at Level 0 as current visa)
[VisaMapRedesigned] Final tier structure: {
  current: ["h1b"],
  entry: ["f1", "j1", "b2"],
  intermediate: ["opt", "l1b", "o1"],
  advanced: ["eb1a", "eb2gc", "eb5"]
}
```

---

## Quick Test 4: End-to-End (5 minutes)

```
Complete flow test from onboarding to persistence:

STEP 1: localStorage.clear() in console
STEP 2: Go to /onboarding
STEP 3: Complete onboarding:
  - "Yes, I have a visa"
  - Select "L-1B (Intracompany Transferee)"
  - Education: "Ph.D."
  - Experience: "10" years
STEP 4: Check console for "[Supabase] Mapped..." messages
STEP 5: Home page loads
STEP 6: Left panel shows:
  - Current Visa: L-1B (or l1b)
  - Education: Ph.D. (or phd)
  - Experience: 10 years
STEP 7: Map shows L-1B at Level 0 with ⭐ label
STEP 8: Edit work experience to "11" years
STEP 9: Click "Save Changes"
STEP 10: Check console for "[SaveProfile] Profile saved successfully"
STEP 11: Refresh page
STEP 12: Left panel still shows 11 years experience
STEP 13: Map still shows L-1B at Level 0

✅ PASS: Full end-to-end flow works
```

---

## Troubleshooting: If Tests Fail

### Symptom: "Save Changes" button shows error
**Check**:
1. Open DevTools → Network tab
2. Click "Save Changes"
3. Look for requests to Supabase API
4. Check if request failed with 403 (permission) or 401 (auth)
5. **Fix**: Make sure you're logged in and Supabase RLS allows updates

### Symptom: Onboarding answers don't appear
**Check**:
1. Console should show "[Supabase] Mapped..." messages
2. If missing, onboarding data wasn't saved
3. **Fix**: Check Supabase user_profiles table directly:
   ```sql
   SELECT current_visa, education_level, years_of_experience 
   FROM user_profiles WHERE id = 'your-user-id';
   ```

### Symptom: Map shows generic START instead of H-1B
**Check**:
1. Console should show "[VisaMapRedesigned] ✓ Current visa is eligible..."
2. If it says "not found" or "not eligible", visa lookup failed
3. **Fix**: Check if visa exists in VISA_KNOWLEDGE_BASE (correct spelling/case)

### Symptom: Values disappear on refresh
**Check**:
1. Check Supabase directly to see if data is actually saved
2. Check localStorage: Open DevTools → Application → localStorage
3. Look for `user_profile` or `onboarding_[userId]` keys
4. **Fix**: If localStorage is empty, database save failed

---

## Console Logging Cheat Sheet

### Filter by issue:

**Persistence errors**: Search `[SaveProfile]` or `[QualificationsPanel]`
```
[QualificationsPanel] Saving profile changes: {...}
[SaveProfile] Data being sent to Supabase: {...}
[SaveProfile] Error saving user profile: ...
```

**Onboarding errors**: Search `[Supabase] Mapped` or `[Onboarding]`
```
[Onboarding] Completing onboarding...
[Supabase] Mapped onboarding currentVisa...
[Supabase] Successfully saved onboarding data...
```

**Map errors**: Search `[VisaMapRedesigned]` or `[Home]`
```
[VisaMapRedesigned] Building visa tier structure...
[VisaMapRedesigned] Final tier structure: {...}
[Home] Profile loaded successfully: {...}
```

**Profile load errors**: Search `[UseVisaNavigatorProfile]`
```
[UseVisaNavigatorProfile] Loading profile from Supabase...
[UseVisaNavigatorProfile] ✓ Profile loaded from Supabase
[UseVisaNavigatorProfile] Error loading profile: ...
```

---

## Expected Console Patterns

### All working ✅
```
[ProfileHook] Loading profile...
[SaveProfile] Data being sent: {...}
[SaveProfile] Profile saved successfully
[VisaMapRedesigned] Final tier structure: {...}
```

### Profile not loading ❌
```
[ProfileHook] Error loading profile: ...
[UseVisaNavigatorProfile] Error loading profile: ...
```

### Save failing ❌
```
[SaveProfile] Error saving user profile: ...
[SaveProfile] Error details: Policy violation
```

### Onboarding not mapping ❌
```
[Supabase] Mapped... (messages missing)
[Supabase] Could not save onboarding data...
```

### Map not using current visa ❌
```
[VisaMapRedesigned] Final tier structure: {current: ["start"], ...}
(instead of showing your actual visa)
```

---

## Browser DevTools Quick Access

**Open Console**: 
- Windows/Linux: `Ctrl + Shift + J` or `F12` → Console tab
- Mac: `Cmd + Option + J` or `Cmd + Option + I` → Console tab

**Find messages**:
- Windows/Linux: `Ctrl + F` in console
- Mac: `Cmd + F` in console
- Type search term, e.g., `[SaveProfile]`

**Clear console**:
- Type `clear()` and press Enter
- Or click trash icon

**Copy console logs**:
- Right-click → Save as...
- Or select all → copy → paste into notepad

---

## Success Indicators

### After Persistence fix ✅
- [ ] Editing field updates UI immediately
- [ ] "Save Changes" shows "💾 Saving..." then success
- [ ] Console shows "[SaveProfile] Profile saved successfully"
- [ ] Refresh page → value persists

### After Onboarding fix ✅
- [ ] Complete onboarding with visa selection
- [ ] Console shows "[Supabase] Mapped onboarding..."
- [ ] Home page left panel shows visa, education, experience
- [ ] Refresh page → values still there

### After Map fix ✅
- [ ] Set currentVisa to any value (H-1B, F-1, etc.)
- [ ] Console shows "[VisaMapRedesigned] Final tier structure:"
- [ ] Map shows current visa at Level 0 (leftmost)
- [ ] Current visa has ⭐ "You are here" label
- [ ] Generic entry visas (F-1, J-1) NOT in current tier

---

## Questions?

If tests fail and console logs don't match expected patterns:

1. **Record the console logs** you see (copy them)
2. **Note the error messages** (if any)
3. **Check Supabase** directly:
   - Go to Supabase dashboard
   - Tables → user_profiles
   - Find your row, check if columns have correct values
4. **Verify authentication**:
   - Is user logged in?
   - Does auth session persist?
5. **Check RLS policies**:
   - Settings → Authentication → Policies
   - Verify user can read/update their own rows

The extensive logging added to the code means every step should be visible in the console. If a step is missing, that's where the issue is.
