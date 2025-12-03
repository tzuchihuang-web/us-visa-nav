/**
 * useVisaNavigatorProfile Hook
 * 
 * Loads and manages user profile from Supabase.
 * This is the single source of truth for user qualifications:
 * - Used by the visa map for current visa and highlighting
 * - Used by the matching engine for scoring
 * - Used by the left panel for editing
 * 
 * Flow:
 * 1. On mount, attempts to load from Supabase
 * 2. If not found, initializes with defaults
 * 3. Provides save function for the left panel to use
 * 4. Triggers re-matching when profile changes
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { UserProfile } from '@/lib/types';
import {
  loadUserProfileFromSupabase,
  saveUserProfileToSupabase,
  createDefaultUserProfile,
} from '@/src/api/userProfile';

export interface UseProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isSaving: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  saveProfile: () => Promise<boolean>;
}

/**
 * Hook to load and manage user profile from Supabase
 * 
 * @param userId - Current user's ID (from auth)
 * @returns Profile state and update functions
 * 
 * Usage in components:
 * ```tsx
 * const { profile, updateProfile, saveProfile } = useVisaNavigatorProfile(userId);
 * 
 * // In form onChange handler:
 * updateProfile({ educationLevel: 'master' });
 * 
 * // On blur or save button:
 * await saveProfile();
 * ```
 */
export function useVisaNavigatorProfile(
  userId: string | undefined
): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ========================================================================
  // LOAD PROFILE FROM SUPABASE ON MOUNT
  // ========================================================================
  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        console.warn('[UseVisaNavigatorProfile] No userId provided, skipping load');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.info(`[UseVisaNavigatorProfile] Loading profile from Supabase for user ${userId}`);

        // Try to load from Supabase
        const loadedProfile = await loadUserProfileFromSupabase(userId);

        if (loadedProfile) {
          console.info('[UseVisaNavigatorProfile] ✓ Profile loaded from Supabase:', loadedProfile);
          setProfile(loadedProfile);
        } else {
          // Initialize with defaults if not found
          console.info('[UseVisaNavigatorProfile] No profile found in Supabase, using defaults');
          const defaultProfile = createDefaultUserProfile(userId);
          setProfile(defaultProfile);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[UseVisaNavigatorProfile] Error loading profile:', message);
        setError(message);
        // Fall back to default profile even on error
        setProfile(createDefaultUserProfile(userId));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  // ========================================================================
  // UPDATE PROFILE IN LOCAL STATE
  // ========================================================================
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<boolean> => {
      if (!profile || !userId) {
        console.warn('[Profile Hook] Cannot update: missing profile or userId');
        return false;
      }

      try {
        // Update local state immediately for responsive UI
        const updatedProfile = { ...profile, ...updates };
        setProfile(updatedProfile);
        setPendingChanges(true);
        console.info('[Profile Hook] Profile updated locally:', updates);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[Profile Hook] Error updating profile:', message);
        setError(message);
        return false;
      }
    },
    [profile, userId]
  );

  // ========================================================================
  // SAVE PROFILE TO SUPABASE
  // ========================================================================
  const saveProfile = useCallback(async (): Promise<boolean> => {
    if (!profile || !userId) {
      console.warn('[UseVisaNavigatorProfile] Cannot save: missing profile or userId');
      return false;
    }

    if (!pendingChanges) {
      console.info('[UseVisaNavigatorProfile] No pending changes to save');
      return true;
    }

    setIsSaving(true);
    try {
      console.info('[UseVisaNavigatorProfile] Starting profile save to Supabase...');
      console.info('[UseVisaNavigatorProfile] Profile data to save:', profile);
      
      const success = await saveUserProfileToSupabase(userId, profile);

      if (success) {
        setPendingChanges(false);
        setError(null);
        console.info('[UseVisaNavigatorProfile] ✓ Profile saved successfully to Supabase');
        return true;
      } else {
        const msg = 'Failed to save profile to Supabase';
        console.error('[UseVisaNavigatorProfile] ' + msg);
        setError(msg);
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[UseVisaNavigatorProfile] Error saving profile:', message);
      setError(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [profile, userId, pendingChanges]);

  return {
    profile,
    loading,
    error,
    isSaving,
    updateProfile,
    saveProfile,
  };
}

// ============================================================================
// DEBOUNCED SAVE HOOK (OPTIONAL)
// ============================================================================

/**
 * Higher-order hook that adds debouncing to profile saves
 * Reduces Supabase writes when user is rapidly changing fields
 * 
 * Usage:
 * ```tsx
 * const { profile, updateProfile, debouncedSave } = useDebouncedProfileSave(userId, 1000);
 * 
 * // In onChange handler - updates local state immediately
 * updateProfile({ educationLevel: 'master' });
 * // Auto-saves after 1 second of no changes
 * ```
 */
export function useDebouncedProfileSave(
  userId: string | undefined,
  debounceMs: number = 1000
) {
  const baseHook = useVisaNavigatorProfile(userId);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Wrap updateProfile with debounced save
  const updateProfileWithDebounce = useCallback(
    async (updates: Partial<UserProfile>) => {
      // Clear existing timeout
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      // Update local state immediately
      const success = await baseHook.updateProfile(updates);

      // Schedule save after debounce period
      if (success) {
        const timeout = setTimeout(() => {
          baseHook.saveProfile();
        }, debounceMs);
        setSaveTimeout(timeout);
      }

      return success;
    },
    [baseHook, debounceMs, saveTimeout]
  );

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  return {
    ...baseHook,
    updateProfile: updateProfileWithDebounce,
  };
}
