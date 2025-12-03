'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';

interface QualificationsPanelProps {
  userProfile: UserProfile | null;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  onSaveProfile: () => Promise<boolean>;
  isSaving?: boolean;
  error?: string | null;
}

/**
 * QualificationsPanel
 * 
 * Left sidebar component for editing user profile qualifications.
 * Features:
 * - Manual save via "Save Changes" button
 * - Shows loading state during save
 * - Shows success message after save
 * - Error handling with user feedback
 * - Props-based integration (not self-contained)
 */

export function QualificationsPanel({
  userProfile,
  onUpdateProfile,
  onSaveProfile,
  isSaving = false,
  error: externalError = null,
}: QualificationsPanelProps) {
  const [localChanges, setLocalChanges] = useState<Partial<UserProfile>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(externalError);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!userProfile) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  // Combine base profile with local changes for display
  const displayProfile = { ...userProfile, ...localChanges };

  const handleFieldChange = (field: keyof UserProfile, value: any) => {
    setLocalChanges(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      setError(null);
      console.info('[QualificationsPanel] Saving profile changes:', localChanges);
      
      // Apply local changes to profile
      const updateSuccess = await onUpdateProfile(localChanges);
      if (!updateSuccess) {
        console.warn('[QualificationsPanel] Failed to update profile in local state');
        setError('Failed to update profile');
        return;
      }
      
      // Save to Supabase
      console.info('[QualificationsPanel] Persisting to Supabase...');
      const success = await onSaveProfile();
      if (success) {
        console.info('[QualificationsPanel] Profile saved to Supabase successfully');
        setSaveSuccess(true);
        setLocalChanges({}); // Clear local changes after successful save
      } else {
        console.error('[QualificationsPanel] Failed to save profile to Supabase');
        setError('Failed to save profile to Supabase');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      console.error('[QualificationsPanel] Error saving profile:', message);
      setError(message);
    }
  };

  const hasChanges = Object.keys(localChanges).length > 0;

  return (
    <div className="w-80 border-r border-gray-200 overflow-y-auto bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
        <p className="text-xs text-gray-600 mt-1">
          {hasChanges && '✏️ You have unsaved changes'}
          {!hasChanges && '✓ Profile saved'}
        </p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded text-xs text-green-700 flex items-center gap-2">
          <span>✓</span>
          <span>Changes saved successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Current Visa */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Current Visa Status
          </label>
          <input
            type="text"
            value={displayProfile.currentVisa || ''}
            onChange={(e) => handleFieldChange('currentVisa', e.target.value || null)}
            placeholder="e.g., F-1, H-1B"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank if you don't have a current visa
          </p>
        </div>

        {/* Education Level */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Education Level
          </label>
          <select
            value={displayProfile.educationLevel || 'other'}
            onChange={(e) => handleFieldChange('educationLevel', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="other">Select...</option>
            <option value="high_school">High School</option>
            <option value="bachelors">Bachelor's Degree</option>
            <option value="masters">Master's Degree</option>
            <option value="phd">Ph.D.</option>
          </select>
        </div>

        {/* Years of Experience */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Work Experience (Years)
          </label>
          <input
            type="number"
            min="0"
            max="60"
            value={displayProfile.yearsOfExperience || 0}
            onChange={(e) => handleFieldChange('yearsOfExperience', parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Field of Work */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Field of Work
          </label>
          <input
            type="text"
            value={displayProfile.fieldOfWork || ''}
            onChange={(e) => handleFieldChange('fieldOfWork', e.target.value)}
            placeholder="e.g., Technology, Finance"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Country of Citizenship */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Country of Citizenship
          </label>
          <input
            type="text"
            value={displayProfile.countryOfCitizenship || 'US'}
            onChange={(e) => handleFieldChange('countryOfCitizenship', e.target.value)}
            placeholder="e.g., India, Canada"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Citizenship may affect visa eligibility
          </p>
        </div>

        {/* English Proficiency */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            English Proficiency
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="5"
              value={displayProfile.englishProficiency || 0}
              onChange={(e) => handleFieldChange('englishProficiency', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>0: None</span>
              <span>3: Intermediate</span>
              <span>5: Fluent</span>
            </div>
            <p className="text-xs bg-blue-50 p-2 rounded text-blue-700">
              Current: {['None', 'Basic', 'Limited', 'Intermediate', 'Advanced', 'Fluent'][displayProfile.englishProficiency || 0]}
            </p>
          </div>
        </div>

        {/* Investment Amount */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Investment Capacity (USD)
          </label>
          <div className="relative">
            <span className="absolute left-2 top-1 text-sm text-gray-600">$</span>
            <input
              type="number"
              min="0"
              value={displayProfile.investmentAmount || 0}
              onChange={(e) => handleFieldChange('investmentAmount', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full pl-6 pr-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Important for EB-5, E-2 and investor visas
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="border-t border-gray-200 bg-white p-4 space-y-3">
        <button
          onClick={handleSaveChanges}
          disabled={!hasChanges || isSaving}
          className={`w-full py-2 px-3 rounded font-medium text-sm transition ${
            hasChanges && !isSaving
              ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSaving ? '💾 Saving...' : 'Save Changes'}
        </button>
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="font-semibold">💡 Tip:</span> Click "Save Changes" to update your profile and see personalized visa recommendations on the map.
        </p>
      </div>
    </div>
  );
}
