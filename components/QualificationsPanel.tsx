'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import { useDebouncedProfileSave } from '@/lib/hooks/useVisaNavigatorProfile';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * QualificationsPanel
 * 
 * Left sidebar component for editing user profile qualifications.
 * Features:
 * - Auto-saves changes to Supabase with 1 second debounce
 * - Real-time visa map updates as profile changes
 * - Clean, simple form layout
 * - Error handling with user feedback
 */

export function QualificationsPanel() {
  const { user } = useAuth();
  const { profile, updateProfile } = useDebouncedProfileSave(user?.id, 1000);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!profile) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  const handleFieldChange = async (field: keyof UserProfile, value: any) => {
    try {
      setSaveStatus('saving');
      await updateProfile({ [field]: value });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      setError(message);
      setSaveStatus('idle');
    }
  };

  return (
    <div className="w-80 border-r border-gray-200 overflow-y-auto bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
        <p className="text-xs text-gray-600 mt-1">
          {saveStatus === 'saving' && '💾 Saving...'}
          {saveStatus === 'saved' && '✓ Saved'}
          {saveStatus === 'idle' && 'Changes auto-save'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="flex-1 p-4 space-y-4">
        {/* Current Visa */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Current Visa Status
          </label>
          <input
            type="text"
            value={profile.currentVisa || 'None'}
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
            value={profile.educationLevel || 'other'}
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
            value={profile.yearsOfExperience || 0}
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
            value={profile.fieldOfWork || ''}
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
            value={profile.countryOfCitizenship || 'US'}
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
              value={profile.englishProficiency || 0}
              onChange={(e) => handleFieldChange('englishProficiency', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>0: None</span>
              <span>3: Intermediate</span>
              <span>5: Fluent</span>
            </div>
            <p className="text-xs bg-blue-50 p-2 rounded text-blue-700">
              Current: {['None', 'Basic', 'Limited', 'Intermediate', 'Advanced', 'Fluent'][profile.englishProficiency || 0]}
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
              value={profile.investmentAmount || 0}
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

      {/* Footer Info */}
      <div className="border-t border-gray-200 bg-white p-4">
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="font-semibold">💡 Tip:</span> Update your profile to see personalized visa recommendations on the map.
        </p>
      </div>
    </div>
  );
}
