/**
 * USER PROFILE SERVICE
 * ============================================================================
 * 
 * Persistence layer for user qualifications and profile data.
 * 
 * DATA FLOW:
 * 1. User edits profile in left panel (SkillTreeEditable)
 * 2. React state updates immediately (fast UI feedback)
 * 3. onChange callbacks trigger saveUserProfile()
 * 4. saveUserProfile() updates:
 *    - Supabase user_profiles table (persistent backend)
 *    - localStorage (offline fallback)
 * 5. On page load:
 *    - loadUserProfile() fetches from Supabase
 *    - Falls back to localStorage if Supabase unavailable
 *    - Falls back to defaults if no data exists
 * 
 * COMMENTS ADDED:
 * - Where profile is loaded on startup
 * - Where profile changes are persisted
 * - How Supabase is used vs localStorage
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * User profile data structure
 * Matches the user_profiles table schema in Supabase
 * 
 * SINGLE SOURCE OF TRUTH:
 * This object is the definitive user profile and is used by:
 * - Matching engine (visa recommendations)
 * - Left panel (Qualifications display)
 * - Visa map (node colors/statuses)
 * - Onboarding (initial setup)
 */
export interface UserProfileData {
  id: string; // user_id from auth
  current_visa: string | null; // e.g., "F-1", "H-1B", or null
  education_level: 'high_school' | 'bachelors' | 'masters' | 'phd' | 'other';
  work_experience: number; // years
  field_of_work: string; // e.g., "tech", "engineering"
  country_of_citizenship: string; // ISO country code, e.g., "IN", "BR"
  english_level: number; // 0-5 scale
  investment_amount_usd: number; // USD - Database column name
  updated_at: string; // ISO timestamp
}

/**
 * localStorage keys for offline fallback
 */
const STORAGE_KEY = 'user_profile';

/**
 * LOAD USER PROFILE ON STARTUP
 * ============================================================================
 * 
 * Called when:
 * - User loads the app for first time in session
 * - User refreshes the page
 * - Profile hook initializes
 * 
 * Flow:
 * 1. Fetch from Supabase (if available and user authenticated)
 * 2. Fall back to localStorage (if Supabase unavailable)
 * 3. Fall back to defaults (if no data exists)
 * 4. Return profile data to React component
 * 
 * This ensures profile persists across sessions.
 */
export async function loadUserProfile(userId: string): Promise<UserProfileData | null> {
  try {
    // Try to load from Supabase (persistent backend)
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      console.log('[UserProfile] Loaded from Supabase:', data);
      return data;
    }

    // Fall back to localStorage (offline)
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const profile = JSON.parse(cached);
      console.log('[UserProfile] Loaded from localStorage (Supabase unavailable):', profile);
      return profile;
    }

    console.log('[UserProfile] No cached profile found, returning null');
    return null;
  } catch (err) {
    console.error('[UserProfile] Error loading profile:', err);

    // Last-ditch effort: try localStorage
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    return null;
  }
}

/**
 * PERSIST PROFILE CHANGES
 * ============================================================================
 * 
 * Called when:
 * - User changes any qualification in left panel
 * - Any field in SkillTreeEditable changes (education, experience, etc.)
 * - User selects a new current_visa
 * 
 * Execution:
 * 1. Update local React state immediately (fast UI)
 * 2. Asynchronously update Supabase (backend persistence)
 * 3. Update localStorage as fallback
 * 
 * This function is called frequently so it must be fast.
 * Supabase upsert ensures no conflicts if table row doesn't exist yet.
 */
export async function saveUserProfile(
  userId: string,
  profile: Partial<UserProfileData>
): Promise<void> {
  try {
    const data = {
      ...profile,
      id: userId,
      updated_at: new Date().toISOString(),
    };

    // Save to Supabase (persistent backend)
    // Using upsert so we don't fail if row doesn't exist
    const { error } = await supabase
      .from('user_profiles')
      .upsert([data], { onConflict: 'id' });

    if (error) {
      console.error('[UserProfile] Error saving to Supabase:', error);
    } else {
      console.log('[UserProfile] Saved to Supabase:', data);
    }

    // Also save to localStorage as offline fallback
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('[UserProfile] Saved to localStorage:', data);
  } catch (err) {
    console.error('[UserProfile] Error persisting profile:', err);

    // If Supabase fails, at least save to localStorage
    try {
      const data = { ...profile, id: userId, updated_at: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('[UserProfile] Also failed to save to localStorage:', e);
    }
  }
}

/**
 * DELETE PROFILE (for logout or account deletion)
 */
export async function deleteUserProfile(userId: string): Promise<void> {
  try {
    await supabase.from('user_profiles').delete().eq('id', userId);
    localStorage.removeItem(STORAGE_KEY);
    console.log('[UserProfile] Profile deleted for user:', userId);
  } catch (err) {
    console.error('[UserProfile] Error deleting profile:', err);
  }
}

/**
 * Get current profile from localStorage (synchronous, for quick access)
 * Use this in React components for instant access during render
 */
export function getProfileFromCache(): UserProfileData | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.error('[UserProfile] Error reading from cache:', err);
    return null;
  }
}
