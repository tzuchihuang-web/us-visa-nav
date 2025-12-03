/**
 * useUserProfileFromSupabase Hook
 * ============================================================================
 * 
 * Loads user profile from Supabase on mount and handles loading states.
 * 
 * Usage in components:
 * const { profile, loading, error } = useUserProfileFromSupabase(userId);
 * 
 * PROFILE LOADING ON STARTUP:
 * This hook automatically fetches from Supabase when user ID is available.
 * If Supabase is unavailable, it falls back to localStorage.
 */

'use client';

import { useEffect, useState } from 'react';
import { loadUserProfile, UserProfileData } from '@/lib/supabase/userProfile';

interface UseUserProfileResult {
  profile: UserProfileData | null;
  loading: boolean;
  error: Error | null;
}

export function useUserProfileFromSupabase(userId: string | undefined): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    loadUserProfile(userId)
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [userId]);

  return { profile, loading, error };
}
