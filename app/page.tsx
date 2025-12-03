'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { hasCompletedOnboarding } from '@/lib/supabase/client';
import { Header } from '@/components/Header';
import { SkillTreeEditable, type SkillLevels } from "@/components/SkillTreeEditable";
import VisaMapRedesigned from "@/components/VisaMapRedesigned";
import { VisaDetailPanel } from "@/components/VisaDetailPanel";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { visaPaths } from '@/lib/mapData';
import { UserProfile } from '@/lib/visa-matching-engine';

/**
 * Home Page / Visa Map - PHASE 4 REDESIGN
 * 
 * PHASE 4 UPDATE:
 * - Editable skill tree (left sidebar) - all 6 skills
 * - Hierarchical visa map (redesigned) - 4-level layout
 * - Fixed detail panel (right side) - click to view visa info
 * - Real-time updates - skill changes recalculate visa availability
 * 
 * STATE MANAGEMENT:
 * - Loads user's onboarding data on first render
 * - Skills state separate from onboarding (allows editing)
 * - Real-time updates between skill tree and visa map
 * 
 * FIRST-TIME USER CHECK (Line 28-42):
 * - After login, checks if user has completed onboarding via Supabase
 * - If onboarding not found → redirect to /onboarding
 * - If onboarding exists → show the visa map and skill tree
 * - Returns user directly on subsequent logins
 */

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [skills, setSkills] = useState<SkillLevels | null>(null);
  const [selectedVisa, setSelectedVisa] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [visaProfile, setVisaProfile] = useState<UserProfile | null>(null);
  
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

  // Initialize skills from onboarding data on load
  useEffect(() => {
    if (userProfile.onboardingData && !skills) {
      setSkills({
        education: userProfile.onboardingData.educationLevel,
        workExperience: userProfile.onboardingData.yearsOfExperience || 0,
        fieldOfWork: 'tech', // TODO: Add to onboarding if needed
        citizenship: 'unrestricted', // TODO: Add to onboarding if needed
        englishProficiency: 3, // TODO: Add to onboarding if needed
        investmentAmount: 0, // TODO: Add to onboarding if needed
      });

      // Build UserProfile for matching engine
      const newVisaProfile: UserProfile = {
        educationLevel: userProfile.onboardingData.educationLevel || 'bachelors',
        yearsOfExperience: userProfile.onboardingData.yearsOfExperience || 0,
        fieldOfWork: userProfile.onboardingData.fieldOfWork || 'other',
        countryOfCitizenship: userProfile.onboardingData.countryOfCitizenship || 'US',
        englishProficiency: userProfile.onboardingData.englishProficiency || 3,
        investmentAmount: userProfile.onboardingData.investmentAmount || 0,
        currentVisa: userProfile.onboardingData.currentVisa || null,
        immigrationGoal: (userProfile.onboardingData.immigrationGoal as any) || 'explore',
      };
      setVisaProfile(newVisaProfile);
    }
  }, [userProfile.onboardingData, skills]);

  const handleSkillsChange = (newSkills: SkillLevels) => {
    setSkills(newSkills);
    // TODO: Persist to Supabase if needed
  };

  const handleVisaSelect = (visaCode: string) => {
    setSelectedVisa(visaCode);
    setIsPanelOpen(true);
  };

  if (authLoading || !onboardingChecked || userProfile.loading || !skills || !visaProfile) {
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
        <main className="flex h-screen bg-white overflow-hidden relative">
          {/* Left Sidebar: Editable Skill Tree */}
          <div className="w-80 border-r border-gray-200 overflow-y-auto">
            <SkillTreeEditable 
              onboardingData={userProfile.onboardingData}
              initialSkills={skills}
              onSkillsChange={handleSkillsChange}
            />
          </div>

          {/* Right Main Area: Hierarchical Visa Map */}
          <div className="flex-1 relative">
            <VisaMapRedesigned 
              userProfile={visaProfile}
              selectedVisa={selectedVisa}
              onVisaSelect={handleVisaSelect}
            />
          </div>

          {/* Fixed Right Side: Visa Detail Panel */}
          {isPanelOpen && selectedVisa && (() => {
            const visaData = visaPaths.find(v => v.id === selectedVisa);
            const educationLevel = typeof skills.education === 'string' 
              ? (skills.education === 'high_school' ? 1 : skills.education === 'bachelors' ? 2 : 3)
              : skills.education;

            return visaData ? (
              <VisaDetailPanel
                isOpen={isPanelOpen}
                visa={{
                  id: visaData.id,
                  name: visaData.name,
                  emoji: visaData.emoji,
                  description: visaData.description,
                  fullDescription: visaData.fullDescription,
                  category: visaData.category,
                  status: 'recommended', // TODO: Calculate from skills
                }}
                userMeets={{
                  education: (visaData.requirements.education?.min || 0) <= educationLevel,
                  experience: (visaData.requirements.workExperience?.min || 0) <= skills.workExperience,
                }}
                onClose={() => setIsPanelOpen(false)}
              />
            ) : null;
          })()}
        </main>
      </>
    </ProtectedRoute>
  );
}
