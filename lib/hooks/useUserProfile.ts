/**
 * useUserProfile Hook
 * 
 * Loads user's onboarding data and converts it to profile + skills for the map
 * - Fetches onboarding_data from Supabase
 * - Converts onboarding answers to skill tree levels
 * - Determines starting visa node
 * - Calculates recommended visas based on goal
 */

'use client';

import { useEffect, useState } from 'react';
import { getUserProfile } from '@/lib/supabase/client';
import { OnboardingData } from '@/lib/types/onboarding';
import { educationToSkillScore, experienceToSkillScore, getRecommendedVisas, onboardingToSkillTree } from '@/lib/visa-eligibility';

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  onboardingData?: OnboardingData;
  skillLevels: {
    education: number;
    workExperience: number;
    fieldOfWork: number;
    citizenship: number;
    investment: number;
    language: number;
  };
  currentVisa: string | null;
  recommendedVisas: string[];
  immigrationGoal?: string;
  loading: boolean;
  error: string | null;
}

export function useUserProfile(userId: string | undefined): UserProfileData {
  const [profile, setProfile] = useState<UserProfileData>({
    id: '',
    name: 'Visa Navigator',
    email: '',
    skillLevels: {
      education: 0,
      workExperience: 0,
      fieldOfWork: 0,
      citizenship: 0,
      investment: 0,
      language: 0,
    },
    currentVisa: null,
    recommendedVisas: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!userId) {
      setProfile(prev => ({ ...prev, loading: false }));
      return;
    }

    const loadProfile = async () => {
      try {
        const userProfile = await getUserProfile(userId);
        
        if (!userProfile) {
          setProfile(prev => ({
            ...prev,
            loading: false,
            error: 'Could not load user profile',
          }));
          return;
        }

        const onboardingData = userProfile.onboarding_data as OnboardingData | undefined;

        // Convert onboarding data to skill levels
        let skillLevels = {
          education: userProfile.education_level || 0,
          workExperience: userProfile.work_experience || 0,
          fieldOfWork: userProfile.field_of_work || 0,
          citizenship: userProfile.citizenship_level || 0,
          investment: userProfile.investment_level || 0,
          language: userProfile.language_level || 0,
        };

        // If we have onboarding data, use it to set initial skill levels
        if (onboardingData) {
          skillLevels = {
            education: educationToSkillScore(onboardingData.educationLevel as any),
            workExperience: experienceToSkillScore(onboardingData.yearsOfExperience || 0),
            fieldOfWork: 2, // Default mid-level for any field
            citizenship: 1, // Default
            investment: 0, // Not specified in onboarding
            language: 3, // Assume fluent if doing onboarding
          };
        }

        // Get recommended visas based on immigration goal
        const recommendedVisas = onboardingData
          ? getRecommendedVisas(
              onboardingData,
              onboardingToSkillTree(onboardingData)
            )
          : [];

        setProfile({
          id: userProfile.id,
          name: userProfile.name || 'Visa Navigator',
          email: userProfile.email || '',
          onboardingData,
          skillLevels,
          currentVisa: userProfile.current_visa || onboardingData?.currentVisa || null,
          recommendedVisas,
          immigrationGoal: onboardingData?.immigrationGoal,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error loading user profile:', err);
        setProfile(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        }));
      }
    };

    loadProfile();
  }, [userId]);

  return profile;
}
