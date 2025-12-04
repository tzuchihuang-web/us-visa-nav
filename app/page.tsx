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
import { RecommendedPathPanel } from "@/components/RecommendedPathPanel";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";
import { VISA_KNOWLEDGE_BASE, VisaDefinition, getVisaById } from '@/lib/visa-knowledge-base';
import { getVisaRecommendations, getVisaRequirementStatus } from '@/lib/visa-matching-engine';
import { getRecommendedPath } from '@/lib/path-recommendation';
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
  const [isRecommendedPathVisible, setIsRecommendedPathVisible] = useState(true);
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

  // VISA_KNOWLEDGE_BASE is already a Record<string, VisaDefinition>
  // Convert to Map for easier lookup
  const visaById = useMemo(() => {
    const map = new Map<string, VisaDefinition>();
    Object.entries(VISA_KNOWLEDGE_BASE).forEach(([id, visa]) => {
      map.set(id.toLowerCase(), visa);
    });
    return map;
  }, []);

  // Get visa recommendations for matching engine
  const visaRecommendations = useMemo(
    () => visaProfile ? getVisaRecommendations(visaProfile) : {},
    [visaProfile]
  );

  // Get recommended path for user
  const recommendedPath = useMemo(
    () => visaProfile ? getRecommendedPath(visaProfile) : null,
    [visaProfile]
  );

  // Extract visa IDs from recommended path for highlighting
  const recommendedPathIds = useMemo(
    () => recommendedPath ? recommendedPath.steps.map(step => step.visaId) : [],
    [recommendedPath]
  );

  // Derive selected visa from visaKnowledgeBase with requirement status
  const selectedVisaData = useMemo(() => {
    if (!selectedVisa || !visaProfile) return null;
    const visa = visaById.get(selectedVisa.toLowerCase());
    if (!visa) return null;

    // Get matching status from recommendations
    const matchResult = visaRecommendations[visa.id];
    const status = matchResult?.status || 'locked';

    // Get detailed requirement status using new helper
    const requirementStatus = getVisaRequirementStatus(visa.id, visaProfile);

    return {
      visa,
      status,
      matchResult,
      requirementStatus,
    };
  }, [selectedVisa, visaById, visaRecommendations, visaProfile]);

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
          {/* Top Section: Sidebar + Map */}
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
            <div className="flex-1 relative overflow-hidden">
              <VisaMapRedesigned
                key={`visa-map-${refreshMapKey}`}
                userProfile={visaProfile}
                selectedVisa={selectedVisa}
                onVisaSelect={handleVisaSelect}
                recommendedPathIds={recommendedPathIds}
              />
              
              {/* Show Recommended Path Button - appears when path is hidden (left bottom) */}
              {!isPanelOpen && recommendedPath && !isRecommendedPathVisible && (
                <button
                  onClick={() => setIsRecommendedPathVisible(true)}
                  className="absolute bottom-6 left-6 z-30 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                >
                  <span className="text-lg">🎯</span>
                  <span>Show Recommended Path</span>
                </button>
              )}

              {/* Recommended Path Panel - inside Map area (bottom) */}
              {!isPanelOpen && recommendedPath && isRecommendedPathVisible && (
                <RecommendedPathPanel
                  path={recommendedPath}
                  onVisaSelect={handleVisaSelect}
                  onClose={() => setIsRecommendedPathVisible(false)}
                />
              )}

              {/* Visa Detail Panel - inside Map area (bottom) */}
              {isPanelOpen && selectedVisaData && selectedVisaData.requirementStatus && (
            <VisaDetailPanel
              isOpen={isPanelOpen}
              visa={{
                id: selectedVisaData.visa.id,
                name: selectedVisaData.visa.name,
                emoji: selectedVisaData.visa.emoji || '📄',
                description: selectedVisaData.visa.shortDescription,
                fullDescription: selectedVisaData.visa.officialDescription,
                category: selectedVisaData.visa.category,
                status: selectedVisaData.status,
                timeHorizon: selectedVisaData.visa.timeHorizon,
                difficulty: selectedVisaData.visa.difficulty,
                requirements: {
                  // Generate human-readable descriptions from eligibility rules
                  education: selectedVisaData.requirementStatus.educationMet !== null
                    ? selectedVisaData.visa.eligibilityRules
                        .filter(r => r.field === 'educationLevel')
                        .map(r => r.description)
                        .join('. ') || "Bachelor's degree or equivalent"
                    : undefined,
                  experience: selectedVisaData.requirementStatus.experienceMet !== null
                    ? selectedVisaData.visa.eligibilityRules
                        .filter(r => r.field === 'yearsOfExperience')
                        .map(r => r.description)
                        .join('. ') || 'Work experience required'
                    : undefined,
                  english: selectedVisaData.requirementStatus.englishMet !== null
                    ? selectedVisaData.visa.eligibilityRules
                        .filter(r => r.field === 'englishProficiency')
                        .map(r => r.description)
                        .join('. ') || 'English proficiency required'
                    : undefined,
                  investment: selectedVisaData.requirementStatus.investmentMet !== null
                    ? selectedVisaData.visa.eligibilityRules
                        .filter(r => r.field === 'investmentAmount')
                        .map(r => r.description)
                        .join('. ') || 'Investment amount required'
                    : undefined,
                  citizenship: selectedVisaData.requirementStatus.citizenshipOk !== null
                    ? selectedVisaData.visa.eligibilityRules
                        .filter(r => r.field === 'citizenshipRestrictionCategory')
                        .map(r => r.description)
                        .join('. ') || 'Must be foreign national (non-U.S. citizen)'
                    : undefined,
                  previousVisa: selectedVisaData.requirementStatus.previousVisaMet !== null
                    ? selectedVisaData.visa.eligibilityRules
                        .filter(r => r.field === 'previousVisa')
                        .map(r => r.description)
                        .join('. ') || 'Previous visa required'
                    : undefined,
                },
              }}
              userMeets={{
                education: selectedVisaData.requirementStatus.educationMet ?? undefined,
                experience: selectedVisaData.requirementStatus.experienceMet ?? undefined,
                english: selectedVisaData.requirementStatus.englishMet ?? undefined,
                investment: selectedVisaData.requirementStatus.investmentMet ?? undefined,
                citizenship: selectedVisaData.requirementStatus.citizenshipOk ?? undefined,
                previousVisa: selectedVisaData.requirementStatus.previousVisaMet ?? undefined,
              }}
              onClose={handleClosePanel}
            />
              )}
            </div>
          </div>

          {/* Legal Disclaimer Footer */}
          <LegalDisclaimer />
        </main>
      </>
    </ProtectedRoute>
  );
}
