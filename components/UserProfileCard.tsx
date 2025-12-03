/**
 * UserProfileCard Component
 * 
 * Displays onboarding information in a beautiful card format
 * Shows visa goal, education, experience, and recommended visas
 */

'use client';

import { OnboardingData } from '@/lib/types/onboarding';
import { ONBOARDING_OPTIONS } from '@/lib/types/onboarding';

interface UserProfileCardProps {
  onboardingData?: OnboardingData;
  recommendedVisas: string[];
  name: string;
}

export function UserProfileCard({
  onboardingData,
  recommendedVisas,
  name,
}: UserProfileCardProps) {
  if (!onboardingData) {
    return null;
  }

  // Get labels for enum values
  const getLabel = (value: string, options: readonly any[]): string => {
    return options.find(opt => opt.value === value)?.label || value;
  };

  const statusLabel = getLabel(
    onboardingData.currentVisaStatus || '',
    ONBOARDING_OPTIONS.visaStatus
  );

  const visaLabel = onboardingData.currentVisa
    ? getLabel(onboardingData.currentVisa, ONBOARDING_OPTIONS.currentVisa)
    : null;

  const goalLabel = onboardingData.immigrationGoal
    ? getLabel(onboardingData.immigrationGoal, ONBOARDING_OPTIONS.immigrationGoal)
    : null;

  const educationLabel = onboardingData.educationLevel
    ? getLabel(onboardingData.educationLevel, ONBOARDING_OPTIONS.educationLevel)
    : null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 mb-6">
      {/* Header */}
      <div className="mb-4 pb-4 border-b border-blue-200">
        <h3 className="font-bold text-gray-900 mb-1">Your Profile</h3>
        <p className="text-sm text-gray-600">Based on your onboarding</p>
      </div>

      {/* Profile Details Grid */}
      <div className="space-y-3 text-sm">
        {/* Current Visa Status */}
        <div>
          <p className="text-gray-600 font-medium">Current Visa Status</p>
          <p className="text-gray-900">{statusLabel}</p>
        </div>

        {/* Current Visa Type (if has visa) */}
        {visaLabel && (
          <div>
            <p className="text-gray-600 font-medium">Current Visa</p>
            <p className="text-gray-900">{visaLabel}</p>
          </div>
        )}

        {/* Immigration Goal (if no visa) */}
        {goalLabel && (
          <div>
            <p className="text-gray-600 font-medium">Goal</p>
            <p className="text-gray-900">{goalLabel}</p>
          </div>
        )}

        {/* Education Level */}
        {educationLabel && (
          <div>
            <p className="text-gray-600 font-medium">Education</p>
            <p className="text-gray-900">{educationLabel}</p>
          </div>
        )}

        {/* Years of Experience */}
        {onboardingData.yearsOfExperience !== undefined && (
          <div>
            <p className="text-gray-600 font-medium">Work Experience</p>
            <p className="text-gray-900">{onboardingData.yearsOfExperience} years</p>
          </div>
        )}
      </div>

      {/* Recommended Visas */}
      {recommendedVisas.length > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-gray-600 font-medium text-sm mb-2">Recommended Visas</p>
          <div className="flex flex-wrap gap-2">
            {recommendedVisas.map(visa => (
              <span
                key={visa}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
              >
                {visa.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-200">
        <p className="text-xs text-blue-800">
          💡 <strong>Tip:</strong> Explore the recommended visas on the map below to see your options!
        </p>
      </div>
    </div>
  );
}
