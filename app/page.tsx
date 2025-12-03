'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Header } from '@/components/Header';
import { SkillTree } from "@/components/SkillTree";
import { VisaMap } from "@/components/VisaMap";
import { ProtectedRoute } from "@/components/ProtectedRoute";

/**
 * Home Page / Visa Map
 * 
 * FIRST-TIME USER CHECK (Line 15-31):
 * - After login, checks if user has completed onboarding
 * - If onboarding not found in localStorage → redirect to /onboarding
 * - If onboarding exists → show the visa map and skill tree
 * 
 * CUSTOMIZATION:
 * - Change redirect logic in useEffect
 * - Update where onboarding data is stored (line 28: localStorage)
 * - Add backend call to fetch onboarding from Supabase when ready
 */

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // FIRST-TIME USER CHECK: Verify onboarding completion
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      // TODO: When connected to backend, fetch from Supabase:
      // const { data } = await supabase
      //   .from('user_profiles')
      //   .select('onboarding_completed')
      //   .eq('id', user.id)
      //   .single();
      
      // For now: Check localStorage for demo
      const onboardingData = localStorage.getItem(`onboarding_${user.id}`);
      
      if (!onboardingData) {
        // REDIRECT TO ONBOARDING: First-time user, no answers saved
        router.push('/onboarding');
      }
    }
  }, [user, authLoading, router]);

  if (authLoading) {
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
          <SkillTree />

          {/* Right Main Area: Abstract Visa Map */}
          <VisaMap />
        </main>
      </>
    </ProtectedRoute>
  );
}
