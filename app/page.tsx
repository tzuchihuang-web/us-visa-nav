'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { hasCompletedOnboarding } from '@/lib/supabase/client';
import { Header } from '@/components/Header';
import { SkillTree } from "@/components/SkillTree";
import { VisaMap } from "@/components/VisaMap";
import { ProtectedRoute } from "@/components/ProtectedRoute";

/**
 * Home Page / Visa Map
 * 
 * PHASE 3 UPDATE:
 * - Loads user's onboarding data
 * - Passes skill levels to SkillTree
 * - Highlights recommended visas on map
 * - Shows personalized profile card
 * 
 * FIRST-TIME USER CHECK (Line 28-42):
 * - After login, checks if user has completed onboarding via Supabase
 * - If onboarding not found → redirect to /onboarding
 * - If onboarding exists → show the visa map and skill tree
 * - Returns user directly on subsequent logins
 * 
 * CUSTOMIZATION:
 * - Uses hasCompletedOnboarding() from Supabase service
 * - Checks onboarding_data field in user_profiles table
 */

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  
  // Load user profile with onboarding data
  const userProfile = useUserProfile(user?.id);

  // FIRST-TIME USER CHECK: Verify onboarding completion via Supabase
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }

    if (user && !onboardingChecked) {
      // Check if user has completed onboarding in Supabase
      hasCompletedOnboarding(user.id).then((completed) => {
        if (!completed) {
          // REDIRECT TO ONBOARDING: First-time user, no onboarding data in Supabase
          router.push('/onboarding');
        }
        setOnboardingChecked(true);
      });
    }
  }, [user, authLoading, onboardingChecked, router]);

  if (authLoading || !onboardingChecked || userProfile.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p>Loading your visa journey...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <>
        <Header />
        <main className="flex h-screen bg-white overflow-hidden">
          {/* Left Sidebar: Skill Tree */}
          <SkillTree 
            skillLevels={userProfile.skillLevels}
            onboardingData={userProfile.onboardingData}
            recommendedVisas={userProfile.recommendedVisas}
            userName={userProfile.name}
          />

          {/* Right Main Area: Abstract Visa Map */}
          <VisaMap 
            recommendedVisas={userProfile.recommendedVisas}
          />
        </main>
      </>
    </ProtectedRoute>
  );
}
