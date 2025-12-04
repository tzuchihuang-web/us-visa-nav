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
 * - IMPORTANT: Normalizes currentVisa to knowledge base IDs (f1, h1b, etc.)
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
    // currentVisa now comes from dropdown with correct knowledge base ID (f1, h1b, etc.)
    // No normalization needed since dropdown values are already in correct format
    console.info(`[QualificationsPanel] Field changed: ${field} = ${value}`);
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
    <div className="w-80 border-r border-gray-100 overflow-y-auto bg-white flex flex-col shadow-sm">
      {/* Header */}
      <div className="sticky top-0 glass-panel border-b border-gray-100 p-6 z-10">
        <h2 className="text-xl font-black text-black">YOUR PROFILE</h2>
        <p className="text-xs text-gray-600 mt-2 font-semibold">
          {hasChanges && 'UNSAVED CHANGES'}
          {!hasChanges && 'PROFILE SAVED'}
        </p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="mx-4 mt-4 p-3 glass-panel border-green-200 text-xs text-green-700 flex items-center gap-2 font-semibold">
          <span>Changes saved successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 glass-panel border-red-200 text-xs text-red-700 font-semibold">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Current Visa */}
        <div>
          <label className="block text-xs font-black text-gray-900 mb-2 uppercase tracking-wide">
            Current Visa Status
          </label>
          <select
            value={displayProfile.currentVisa || ''}
            onChange={(e) => handleFieldChange('currentVisa', e.target.value || null)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-semibold"
          >
            <option value="">None (select if no current visa)</option>
            <option value="f1">F-1 Student Visa</option>
            <option value="opt">OPT (Optional Practical Training)</option>
            <option value="h1b">H-1B Work Visa</option>
            <option value="o1">O-1 Extraordinary Ability</option>
            <option value="l1">L-1 Intracompany Transfer</option>
            <option value="e2">E-2 Investor Visa</option>
            <option value="eb1">EB-1 Green Card</option>
            <option value="eb2">EB-2 Green Card</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Select your current U.S. visa type
          </p>
        </div>

        {/* Education Level */}
        <div>
          <label className="block text-xs font-black text-gray-900 mb-2 uppercase tracking-wide">
            Education Level
          </label>
          <select
            value={displayProfile.educationLevel || 'other'}
            onChange={(e) => handleFieldChange('educationLevel', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-semibold"
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
          <label className="block text-xs font-black text-gray-900 mb-2 uppercase tracking-wide">
            Work Experience (Years)
          </label>
          <input
            type="number"
            min="0"
            max="60"
            value={displayProfile.yearsOfExperience || 0}
            onChange={(e) => handleFieldChange('yearsOfExperience', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-semibold"
          />
        </div>

        {/* Field of Work */}
        <div>
          <label className="block text-xs font-black text-gray-900 mb-2 uppercase tracking-wide">
            Field of Work
          </label>
          <input
            type="text"
            value={displayProfile.fieldOfWork || ''}
            onChange={(e) => handleFieldChange('fieldOfWork', e.target.value)}
            placeholder="e.g., Technology, Finance"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-semibold"
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
          <label className="block text-xs font-black text-gray-900 mb-2 uppercase tracking-wide">
            English Proficiency
          </label>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="5"
              value={displayProfile.englishProficiency || 0}
              onChange={(e) => handleFieldChange('englishProficiency', parseInt(e.target.value))}
              className="w-full accent-black"
            />
            <div className="flex justify-between text-xs text-gray-500 font-semibold">
              <span>NONE</span>
              <span>INTERMEDIATE</span>
              <span>FLUENT</span>
            </div>
            <p className="text-xs glass-panel p-3 text-black font-bold">
              CURRENT: {['NONE', 'BASIC', 'LIMITED', 'INTERMEDIATE', 'ADVANCED', 'FLUENT'][displayProfile.englishProficiency || 0]}
            </p>
          </div>
        </div>

        {/* Investment Amount */}
        <div>
          <label className="block text-xs font-black text-gray-900 mb-2 uppercase tracking-wide">
            Investment Capacity (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm text-gray-600 font-bold">$</span>
            <input
              type="number"
              min="0"
              value={displayProfile.investmentAmount || 0}
              onChange={(e) => handleFieldChange('investmentAmount', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-semibold"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Important for EB-5, E-2 and investor visas
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="border-t border-gray-100 glass-panel p-6 space-y-3">
        <button
          onClick={handleSaveChanges}
          disabled={!hasChanges || isSaving}
          className={`w-full py-3 px-4 rounded-xl font-black text-sm transition ${
            hasChanges && !isSaving
              ? 'bg-black text-white hover:bg-gray-800 cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
        <p className="text-xs text-gray-600 leading-relaxed font-semibold">
          <span className="font-black">TIP:</span> Click "SAVE CHANGES" to update your profile and see personalized visa recommendations on the map.
        </p>
      </div>
    </div>
  );
}
