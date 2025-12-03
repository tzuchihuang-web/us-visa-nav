/**
 * Editable Skill Tree Component (Left Sidebar)
 * 
 * PHASE 4: Redesign for editability
 * - Displays user's qualifications as editable skill nodes
 * - Syncs with onboarding data on first load
 * - Becomes single source of truth for user qualifications
 * - Real-time updates trigger visa map recalculation
 */

'use client';

import { useState, useEffect } from 'react';
import { OnboardingData, ONBOARDING_OPTIONS } from '@/lib/types/onboarding';

export interface SkillLevels {
  education: string;
  workExperience: number;
  fieldOfWork: string;
  citizenship: string;
  englishProficiency: number;
  investmentAmount: number;
}

interface SkillTreeEditableProps {
  onboardingData?: OnboardingData;
  initialSkills?: Partial<SkillLevels>;
  onSkillsChange: (skills: SkillLevels) => void;
}

const DEFAULT_SKILLS: SkillLevels = {
  education: 'bachelors',
  workExperience: 2,
  fieldOfWork: 'tech',
  citizenship: 'unrestricted',
  englishProficiency: 3,
  investmentAmount: 0,
};

export function SkillTreeEditable({
  onboardingData,
  initialSkills = {},
  onSkillsChange,
}: SkillTreeEditableProps) {
  const [skills, setSkills] = useState<SkillLevels>(() => {
    let base = { ...DEFAULT_SKILLS, ...initialSkills };

    if (onboardingData) {
      return {
        education: onboardingData.educationLevel,
        workExperience: onboardingData.yearsOfExperience,
        fieldOfWork: 'tech',
        citizenship: 'unrestricted',
        englishProficiency: 3,
        investmentAmount: 0,
      };
    }

    return base;
  });

  useEffect(() => {
    onSkillsChange(skills);
  }, [skills, onSkillsChange]);

  const handleEducationChange = (value: string) => {
    setSkills(prev => ({ ...prev, education: value }));
  };

  const handleWorkExperienceChange = (value: number) => {
    setSkills(prev => ({ ...prev, workExperience: value }));
  };

  const handleFieldOfWorkChange = (value: string) => {
    setSkills(prev => ({ ...prev, fieldOfWork: value }));
  };

  const handleCitizenshipChange = (value: string) => {
    setSkills(prev => ({ ...prev, citizenship: value }));
  };

  const handleEnglishProficiencyChange = (value: number) => {
    setSkills(prev => ({ ...prev, englishProficiency: value }));
  };

  const handleInvestmentAmountChange = (value: number) => {
    setSkills(prev => ({ ...prev, investmentAmount: value }));
  };

  return (
    <div className="w-96 bg-white border-r border-gray-200 p-8 overflow-y-auto h-screen flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Profile</h1>
        <p className="text-sm text-gray-600">Edit your qualifications to see matching visas</p>
      </div>

      {/* Onboarding Summary */}
      {onboardingData && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 font-medium">
            ✓ Onboarding completed - Values loaded below
          </p>
        </div>
      )}

      {/* Section Title */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Qualifications
        </h2>
        <p className="text-xs text-gray-500 mt-1">Edit to update visa recommendations</p>
      </div>

      {/* Skills Container */}
      <div className="space-y-6 flex-1 overflow-y-auto">
        {/* Education Level */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            🎓 Education Level
          </label>
          <select
            value={skills.education}
            onChange={(e) => handleEducationChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {ONBOARDING_OPTIONS.educationLevel.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Work Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            💼 Work Experience
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="number"
              min="0"
              max="50"
              value={skills.workExperience}
              onChange={(e) => handleWorkExperienceChange(Math.max(0, parseInt(e.target.value) || 0))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-600">years</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={skills.workExperience}
            onChange={(e) => handleWorkExperienceChange(parseInt(e.target.value))}
            className="w-full mt-2"
          />
        </div>

        {/* Field of Work */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            🔧 Field of Work
          </label>
          <select
            value={skills.fieldOfWork}
            onChange={(e) => handleFieldOfWorkChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="tech">Technology / IT</option>
            <option value="business">Business / Finance</option>
            <option value="healthcare">Healthcare / Medicine</option>
            <option value="education">Education / Academia</option>
            <option value="engineering">Engineering</option>
            <option value="arts">Arts / Media</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Citizenship */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            🌍 Citizenship Status
          </label>
          <select
            value={skills.citizenship}
            onChange={(e) => handleCitizenshipChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="unrestricted">Unrestricted (Western countries)</option>
            <option value="restricted">Restricted countries</option>
            <option value="us_national">U.S. National</option>
          </select>
        </div>

        {/* English Proficiency */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            🗣️ English Proficiency
          </label>
          <div className="flex gap-2 items-center mb-2">
            <div className="flex-1 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleEnglishProficiencyChange(i + 1)}
                  className={`h-8 w-8 rounded-full transition-all ${
                    i < skills.englishProficiency
                      ? 'bg-blue-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 w-12 text-right">
              {skills.englishProficiency}/5
            </span>
          </div>
        </div>

        {/* Investment Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            💰 Investment Amount
          </label>
          <select
            value={skills.investmentAmount}
            onChange={(e) => handleInvestmentAmountChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="0">None / Not applicable</option>
            <option value="50">$50,000+</option>
            <option value="100">$100,000+</option>
            <option value="500">$500,000+</option>
            <option value="1000">$1,000,000+</option>
          </select>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-600 leading-relaxed">
          <strong>💡 Tip:</strong> Edit your qualifications to see visa recommendations update in real-time on the map.
        </p>
      </div>
    </div>
  );
}
