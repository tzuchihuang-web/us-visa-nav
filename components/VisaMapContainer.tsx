/**
 * VISA MAP CONTAINER
 * 
 * Wrapper component that:
 * - Loads user profile from Supabase via hook
 * - Passes profile to VisaMap component
 * - Displays loading state while profile loads
 * - Handles errors gracefully
 */

"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useVisaNavigatorProfile } from "@/lib/hooks/useVisaNavigatorProfile";
import { VisaMap } from "@/components/VisaMap";

export function VisaMapContainer() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error } = useVisaNavigatorProfile(user?.id);

  // Show loading state
  if (authLoading || profileLoading) {
    return (
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your visa journey...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <p className="text-gray-900 font-semibold mb-2">Error Loading Profile</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <p className="text-gray-500 text-xs mt-4">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  // Profile not available - show default visa map
  if (!profile) {
    return (
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Initializing visa map...</p>
        </div>
      </div>
    );
  }

  // RENDER VISA MAP WITH PROFILE
  // The VisaMap component will:
  // - Use profile.currentVisa to determine starting node
  // - Use profile education/experience/etc for matching engine
  // - Compute matches and update accordingly
  return <VisaMap userProfile={profile} />;
}
