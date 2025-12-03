/**
 * SKILL TREE COMPONENT (Left Sidebar)
 * 
 * Displays user profile and skill nodes with lock/unlock states.
 * Shows the user's visa-related attributes that influence map availability.
 * 
 * PHASE 3 UPDATE:
 * - Now accepts skillLevels as props from onboarding data
 * - Falls back to default userProfile if no data provided
 * - Dynamically renders skills based on prop values
 */

'use client';

import { userProfile } from "@/lib/mapData";
import { UserProfileCard } from './UserProfileCard';
import { OnboardingData } from '@/lib/types/onboarding';

interface SkillNode {
  name: string;
  level: number;
  unlocked: boolean;
  icon: string;
}

interface SkillTreeProps {
  skillLevels?: {
    education: number;
    workExperience: number;
    fieldOfWork: number;
    citizenship: number;
    investment: number;
    language: number;
  };
  onboardingData?: OnboardingData;
  recommendedVisas?: string[];
  userName?: string;
}

function SkillTreeNode({ skillKey, skill }: { skillKey: string; skill: SkillNode }) {
  const maxLevel = 5;
  const progressPercentage = (skill.level / maxLevel) * 100;

  return (
    <div
      className="mb-6 p-4 rounded-lg border transition-all"
      style={{
        borderColor: skill.unlocked ? "#cbd5e1" : "#e5e7eb",
        backgroundColor: skill.unlocked ? "#ffffff" : "#f9fafb",
      }}
    >
      {/* Skill header with icon and lock indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{skill.icon}</span>
          <span className="font-semibold text-gray-900">{skill.name}</span>
        </div>
        {!skill.unlocked && (
          <span className="text-xl" title="Skill locked">
            🔒
          </span>
        )}
      </div>

      {/* Level indicator */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex gap-1">
          {Array.from({ length: maxLevel }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-colors"
              style={{
                backgroundColor:
                  i < skill.level
                    ? skill.unlocked
                      ? "#3b82f6" // Blue for unlocked
                      : "#d1d5db" // Gray for locked
                    : "#f3f4f6",
              }}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">
          {skill.level}/{maxLevel}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}

export function SkillTree(props: SkillTreeProps = {}) {
  const {
    skillLevels,
    onboardingData,
    recommendedVisas = [],
    userName,
  } = props;

  // Use provided skillLevels or default to userProfile
  const { name: defaultName, currentStatus, skills: defaultSkills } = userProfile;
  const displayName = userName || defaultName;

  // Map skillLevels prop to skills format for rendering
  const skillsToDisplay = skillLevels ? {
    education: {
      name: "Education Level",
      level: skillLevels.education,
      unlocked: true,
      icon: "🎓",
    },
    workExperience: {
      name: "Work Experience",
      level: skillLevels.workExperience,
      unlocked: true,
      icon: "💼",
    },
    fieldOfWork: {
      name: "Field of Work",
      level: skillLevels.fieldOfWork,
      unlocked: skillLevels.fieldOfWork > 0,
      icon: "🔧",
    },
    citizenship: {
      name: "Country of Citizenship",
      level: skillLevels.citizenship,
      unlocked: true,
      icon: "🌍",
    },
    investment: {
      name: "Investment Amount",
      level: skillLevels.investment,
      unlocked: skillLevels.investment > 0,
      icon: "💰",
    },
    language: {
      name: "English Proficiency",
      level: skillLevels.language,
      unlocked: true,
      icon: "🗣️",
    },
  } : defaultSkills;

  // CUSTOMIZE: Modify status labels here
  const statusLabels = {
    international_student: "📚 International Student",
    working_professional: "💼 Working Professional",
    entrepreneur: "🚀 Entrepreneur",
  };

  return (
    <div className="w-96 bg-white border-r border-gray-200 p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{displayName}</h1>
        <p className="text-sm text-gray-600">
          {statusLabels[currentStatus as keyof typeof statusLabels] || currentStatus}
        </p>
      </div>

      {/* User Profile Card from Onboarding */}
      {onboardingData && (
        <UserProfileCard
          onboardingData={onboardingData}
          recommendedVisas={recommendedVisas}
          name={displayName}
        />
      )}

      {/* Section divider */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Skill Tree
        </h2>
      </div>

      {/* Skill nodes */}
      <div>
        {Object.entries(skillsToDisplay).map(([skillKey, skill]) => (
          <SkillTreeNode key={skillKey} skillKey={skillKey} skill={skill as SkillNode} />
        ))}
      </div>

      {/* Footer info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-gray-600">
          <strong>💡 Tip:</strong> Unlock new skills to access more visa options on the map.
        </p>
      </div>

      {/* CUSTOMIZATION GUIDE */}
      {/* 
        To change skill tree data:
        1. Edit userProfile in lib/mapData.ts
        2. Add/remove skills in the skills object
        3. Adjust level values (0-5 scale) and unlock status
        4. Change icons and names as needed
        
        To change visual style:
        - Modify colors in the style props above (e.g., backgroundColor, borderColor)
        - Adjust padding/margins in className attributes
        - Customize maxLevel constant if using different scale
      */}
    </div>
  );
}
