// SUPABASE INTEGRATION GUIDE FOR VISA NAVIGATOR
// =============================================================================
//
// This guide explains how UserProfile is now connected to Supabase for
// persistence across sessions.
//
// =============================================================================
// 1. DATABASE SCHEMA
// =============================================================================
//
// The user_profiles table stores user qualifications:
//
//   id                    UUID (primary key, linked to auth.users)
//   email                 TEXT
//   current_visa          TEXT (nullable) - e.g., "F1", "H1B", "EB2"
//   education_level       TEXT (nullable) - e.g., "bachelor", "master", "phd"
//   work_experience_years INTEGER (nullable)
//   field_of_work         TEXT (nullable) - e.g., "Technology", "Finance"
//   country_of_citizenship TEXT (nullable) - e.g., "India", "Canada"
//   english_level         TEXT (nullable) - e.g., "basic", "intermediate", "advanced", "fluent"
//   investment_amount_usd DECIMAL - e.g., 50000.00 for E-2 visa
//   created_at            TIMESTAMP
//   updated_at            TIMESTAMP
//
// TO APPLY SCHEMA:
// - See docs/SUPABASE_MIGRATION_USER_PROFILES.sql
// - Run in Supabase Dashboard > SQL Editor
//
// =============================================================================
// 2. PROFILE LOADING FLOW
// =============================================================================
//
// app/page.tsx (or wherever VisaMap is rendered)
//   ↓
// useVisaNavigatorProfile(userId)  [lib/hooks/useVisaNavigatorProfile.ts]
//   ↓
// loadUserProfileFromSupabase()  [src/api/userProfile.ts]
//   ↓
// getUserProfile() [lib/supabase/client.ts]
//   ↓
// Supabase database query
//   ↓
// Returns UserProfile or null
//   ↓
// VisaMapContainer passes profile to VisaMap
//   ↓
// VisaMap computes matches using matchUserToVisas()
//   ↓
// Nodes styled based on match status
//
// =============================================================================
// 3. PROFILE SAVING FLOW (LEFT PANEL)
// =============================================================================
//
// User edits field in left panel (e.g., education level dropdown)
//   ↓
// onChange handler calls updateProfile(updates)  [useVisaNavigatorProfile hook]
//   ↓
// Local state updated immediately (responsive UI)
//   ↓
// On blur or Save button → saveProfile()
//   ↓
// saveUserProfileToSupabase(userId, profile)  [src/api/userProfile.ts]
//   ↓
// updateUserProfile() [lib/supabase/client.ts]
//   ↓
// Supabase database update
//   ↓
// User notified of success/error
//
// DEBOUNCING:
// - Use useDebouncedProfileSave() hook for auto-save after 1 second of no changes
// - Reduces unnecessary database writes
// - Still maintains local state responsiveness
//
// =============================================================================
// 4. USING THE PROFILE IN COMPONENTS
// =============================================================================
//
// EXAMPLE: Using useVisaNavigatorProfile in a component
//
// ```tsx
// import { useAuth } from '@/lib/hooks/useAuth';
// import { useVisaNavigatorProfile } from '@/lib/hooks/useVisaNavigatorProfile';
//
// export function MyComponent() {
//   const { user } = useAuth();
//   const { profile, updateProfile, saveProfile, error } = useVisaNavigatorProfile(user?.id);
//
//   if (!profile) return <div>Loading...</div>;
//
//   const handleEducationChange = async (level: string) => {
//     // Update local state immediately
//     await updateProfile({ educationLevel: level as any });
//     
//     // Save to Supabase
//     await saveProfile();
//   };
//
//   return (
//     <select value={profile.educationLevel} onChange={(e) => handleEducationChange(e.target.value)}>
//       <option value="bachelor">Bachelor's</option>
//       <option value="master">Master's</option>
//       <option value="phd">PhD</option>
//     </select>
//   );
// }
// ```
//
// EXAMPLE: Using debounced version (auto-save)
//
// ```tsx
// import { useDebouncedProfileSave } from '@/lib/hooks/useVisaNavigatorProfile';
//
// export function EditableField() {
//   const { user } = useAuth();
//   const { profile, updateProfile } = useDebouncedProfileSave(user?.id, 1000);
//
//   // Auto-saves to Supabase 1 second after user stops typing
//   return (
//     <input
//       value={profile?.fieldOfWork || ''}
//       onChange={(e) => updateProfile({ fieldOfWork: e.target.value })}
//       placeholder="Field of work"
//     />
//   );
// }
// ```
//
// =============================================================================
// 5. MATCHING ENGINE INTEGRATION
// =============================================================================
//
// The matching engine now uses Supabase-backed profile:
//
// VisaMapContainer loads profile from Supabase
//   ↓
// Passes profile to VisaMap component
//   ↓
// VisaMap calls matchUserToVisas(profile, visaKnowledgeBase)
//   ↓
// Matching engine scores visas based on:
//   - profile.currentVisa (progression bonus)
//   - profile.educationLevel (education fit)
//   - profile.workExperienceYears (experience fit)
//   - profile.investmentAmountUSD (investment requirements)
//   - profile.englishLevel (language requirements)
//   - profile.countryOfCitizenship (citizenship rules)
//   ↓
// Returns VisaMatchResult[] with score and status
//   ↓
// Map nodes styled: recommended (70+), available (40-69), locked (<40)
//   ↓
// Hover card shows score and reasons
//
// =============================================================================
// 6. SINGLE SOURCE OF TRUTH
// =============================================================================
//
// UserProfile is now used consistently across:
//
// ✓ Onboarding flow: Saves answers to user_profiles table
// ✓ Left panel (qualifications): Loads from and saves to Supabase
// ✓ Matching engine: Scores based on Supabase profile
// ✓ Visa map: Uses currentVisa from Supabase for starting node
// ✓ Recommendation cards: Display matches based on Supabase profile
//
// When user returns:
// 1. Log in → auth.user created
// 2. app/page mounts → useVisaNavigatorProfile loads from Supabase
// 3. VisaMap renders with same profile and recommendations
// 4. Same visa nodes highlighted, same scores displayed
//
// =============================================================================
// 7. ERROR HANDLING
// =============================================================================
//
// Loading errors:
// - If Supabase connection fails, fallback to createDefaultUserProfile()
// - Console warns but doesn't crash UI
// - User can still explore with empty profile (generic recommendations)
//
// Saving errors:
// - Error state shown in hook: { profile, error }
// - Component can display toast notification
// - Profile remains updated locally (user still sees changes)
// - Retry on next interaction
//
// Offline handling:
// - If offline, local state updates work fine
// - Save calls will fail but queue for retry
// - Can implement background sync later
//
// =============================================================================
// 8. EXTENDING THE SYSTEM
// =============================================================================
//
// To add a new profile field:
//
// 1. Add column to user_profiles table (SQL migration)
// 2. Update toSupabaseProfile() in src/api/userProfile.ts
// 3. Update fromSupabaseProfile() in src/api/userProfile.ts
// 4. Add field to UserProfile type in lib/types.ts
// 5. Update matching engine rules if needed
//
// To change scoring weights:
//
// - Edit WEIGHTS object in src/logic/matchingEngine.ts (top of file)
// - All thresholds and multipliers clearly marked
// - Re-deploy, no DB changes needed
//
// To add new matching rules:
//
// - Add new scoring functions in src/logic/matchingEngine.ts
// - Call from scoreVisaForUser()
// - Add to reasons array with human-readable explanation
//
// =============================================================================
// 9. TESTING THE INTEGRATION
// =============================================================================
//
// 1. Create a test Supabase project (or use existing dev database)
//
// 2. Run the migration:
//    - Go to Supabase Dashboard > SQL Editor
//    - Copy SQL from docs/SUPABASE_MIGRATION_USER_PROFILES.sql
//    - Execute
//
// 3. Test locally:
//    - npm run dev
//    - Log in with test account
//    - Edit profile fields
//    - Check browser console for [Supabase] and [Profile Hook] logs
//    - Refresh page - profile should reload
//
// 4. Test matching:
//    - Change education level → visa map should re-render
//    - Hover over visas → should see match scores and reasons
//    - Scores should update immediately when profile changes
//
// 5. Check Supabase:
//    - Go to Table Editor
//    - View user_profiles table
//    - Verify your changes appear in DB
//
// =============================================================================
// 10. PERFORMANCE CONSIDERATIONS
// =============================================================================
//
// Current optimizations:
// - useVisaNavigatorProfile loads profile once on mount
// - Debounced saves (1 second default) reduce DB writes
// - Matching engine runs only when profile changes (useMemo)
// - Visa nodes memoized to prevent unnecessary re-renders
//
// Potential improvements:
// - Implement background sync for offline changes
// - Cache match results with versioning
// - Lazy load visa details on scroll
// - Pre-fetch related visa information
//
// =============================================================================
