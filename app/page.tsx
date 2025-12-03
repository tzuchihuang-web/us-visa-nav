'use client';

import { useEffect, useState } from 'react';
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
import { visaPaths } from '@/lib/mapData';
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

  // Load user profile directly from Supabase
  const { profile: visaProfile, loading: profileLoading } = useVisaNavigatorProfile(user?.id);

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
            <QualificationsPanel />

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
                    status: 'recommended',
                  }}
                  userMeets={{
                    education: true,
                    experience: true,
                  }}
                  onClose={() => setIsPanelOpen(false)}
                />
              ) : null;
            })()}
          </div>

          {/* Legal Disclaimer Footer */}
          <LegalDisclaimer />
        </main>
      </>
    </ProtectedRoute>
  );
}
