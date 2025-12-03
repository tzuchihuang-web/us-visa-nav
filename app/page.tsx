'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useVisaNavigatorProfile } from '@/lib/hooks/useVisaNavigatorProfile';
import { hasCompletedOnboarding } from '@/lib/supabase/client';
import { Header } from '@/components/Header';
import { QualificationsPanel } from '@/components/QualificationsPanel';
import VisaMapRedesigned from "@/components/VisaMapRedesigned";
import { VisaDetailPanel } from "@/components/VisaDetailPanel";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";
import { VISA_KNOWLEDGE_BASE, Visa } from '@/src/data/visaKnowledgeBase';
import { getVisaRecommendations } from '@/lib/visa-matching-engine';
import { UserProfile } from '@/lib/types';

/**
 * Home Page / Visa Map - UNIFIED PROFILE INTEGRATION
 * 
 * This page now uses the unified UserProfile loaded directly from Supabase:
 * - Profile loads on mount via useVisaNavigatorProfile hook
 * - Profile is passed directly to visa map for matching
 * - Left panel can edit profile fields with auto-save
 * - All changes persisted to Supabase in real-time
 */

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [selectedVisa, setSelectedVisa] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [refreshMapKey, setRefreshMapKey] = useState(0); // Key to force map re-render on save

  // Load user profile directly from Supabase
  const {
    profile: visaProfile,
    loading: profileLoading,
    isSaving,
    error: profileError,
    updateProfile,
    saveProfile,
  } = useVisaNavigatorProfile(user?.id);

  // Log profile state changes for debugging
  useEffect(() => {
    if (visaProfile) {
      console.info('[Home] Profile loaded successfully:', {
        userId: visaProfile.id,
        currentVisa: visaProfile.currentVisa,
        educationLevel: visaProfile.educationLevel,
        yearsOfExperience: visaProfile.yearsOfExperience,
      });
    }
  }, [visaProfile]);

  // Create visaById lookup from VISA_KNOWLEDGE_BASE
  const visaById = useMemo(() => {
    const map = new Map<string, Visa>();
    VISA_KNOWLEDGE_BASE.forEach((visa) => {
      map.set(visa.id.toLowerCase(), visa);
    });
    return map;
  }, []);

  // Get visa recommendations for matching engine
  const visaRecommendations = useMemo(
    () => visaProfile ? getVisaRecommendations(visaProfile) : {},
    [visaProfile]
  );

  // Derive selected visa from visaKnowledgeBase
  const selectedVisaData = useMemo(() => {
    if (!selectedVisa) return null;
    const visa = visaById.get(selectedVisa.toLowerCase());
    if (!visa) return null;

    // Get matching status from recommendations
    const matchResult = visaRecommendations[visa.id];
    const status = matchResult?.status || 'locked';

    return {
      visa,
      status,
      matchResult,
    };
  }, [selectedVisa, visaById, visaRecommendations]);

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

  const handleVisaSelect = (visaCode: string) => {
    setSelectedVisa(visaCode);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setSelectedVisa(null);
    setIsPanelOpen(false);
  };

  const handleSaveProfile = async (): Promise<boolean> => {
    const success = await saveProfile();
    if (success) {
      // Force map re-render by changing key
      setRefreshMapKey(prev => prev + 1);
    }
    return success;
  };

  if (authLoading || !onboardingChecked || profileLoading || !visaProfile) {
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
        <main className="flex flex-col h-screen bg-white overflow-hidden relative">
          {/* Map Container */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar: Profile Qualifications Editor */}
            <QualificationsPanel
              userProfile={visaProfile}
              onUpdateProfile={updateProfile}
              onSaveProfile={handleSaveProfile}
              isSaving={isSaving}
              error={profileError}
            />

            {/* Right Main Area: Hierarchical Visa Map */}
            <div className="flex-1 relative">
              <VisaMapRedesigned
                key={`visa-map-${refreshMapKey}`}
                userProfile={visaProfile}
                selectedVisa={selectedVisa}
                onVisaSelect={handleVisaSelect}
              />
            </div>

            {/* Fixed Right Side: Visa Detail Panel */}
            {isPanelOpen && selectedVisaData && (
              <VisaDetailPanel
                isOpen={isPanelOpen}
                visa={{
                  id: selectedVisaData.visa.id,
                  name: selectedVisaData.visa.name,
                  emoji: selectedVisaData.visa.iconEmoji || '📄',
                  description: selectedVisaData.visa.officialDescription,
                  fullDescription: selectedVisaData.visa.officialDescription,
                  category: selectedVisaData.visa.category,
                  status: selectedVisaData.status,
                  timeHorizon: selectedVisaData.visa.timeHorizon,
                  difficulty: selectedVisaData.visa.difficulty 
                    ? (selectedVisaData.visa.difficulty === 'low' ? 1 : selectedVisaData.visa.difficulty === 'medium' ? 2 : 3)
                    : undefined,
                  requirements: {
                    education: selectedVisaData.visa.eligibilityCriteria
                      .filter(c => c.toLowerCase().includes('education') || c.toLowerCase().includes('degree'))
                      .join(', ') || 'See eligibility criteria',
                    experience: selectedVisaData.visa.eligibilityCriteria
                      .filter(c => c.toLowerCase().includes('experience') || c.toLowerCase().includes('year'))
                      .join(', ') || 'See eligibility criteria',
                  },
                }}
                userMeets={{
                  education: selectedVisaData.matchResult 
                    ? !selectedVisaData.matchResult.failedRules.some(r => r.includes('education'))
                    : false,
                  experience: selectedVisaData.matchResult
                    ? !selectedVisaData.matchResult.failedRules.some(r => r.includes('experience'))
                    : false,
                }}
                onClose={handleClosePanel}
              />
            )}
          </div>

          {/* Legal Disclaimer Footer */}
          <LegalDisclaimer />
        </main>
      </>
    </ProtectedRoute>
  );
}
