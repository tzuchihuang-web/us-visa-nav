/**
 * Visa Eligibility & Scoring
 * 
 * This file contains the logic to:
 * 1. Convert onboarding answers to skill scores
 * 2. Determine visa eligibility based on skills
 * 3. Calculate which visas are locked/available/recommended
 * 
 * WHERE TO CUSTOMIZE:
 * - educationToSkillScore() → Adjust how education maps to scores
 * - experienceToSkillScore() → Adjust experience scoring
 * - getVisaRequirements() → Add/modify visa eligibility rules
 * - getRecommendedVisas() → Change recommendation logic
 */

import { OnboardingData, EducationLevel, ImmigrationGoal } from '@/lib/types/onboarding';

/**
 * Convert education level to skill score (0-5)
 */
export function educationToSkillScore(level: EducationLevel): number {
  const map: Record<EducationLevel, number> = {
    high_school: 1,
    bachelors: 3,
    masters: 4,
    phd: 5,
    other: 2,
  };
  return map[level] || 2;
}

/**
 * Convert years of experience to skill score (0-5)
 * Formula: years / 6 (capped at 5)
 */
export function experienceToSkillScore(years: number): number {
  return Math.min(Math.ceil(years / 6), 5) || 0;
}

/**
 * Get initial skill tree from onboarding data
 * 
 * CUSTOMIZE HERE: Adjust how onboarding questions map to skill scores
 */
export function onboardingToSkillTree(data: OnboardingData) {
  const educationScore = educationToSkillScore(data.educationLevel);
  const experienceScore = experienceToSkillScore(data.yearsOfExperience || 0);

  return {
    educationLevel: educationScore,
    workExperience: experienceScore,
    fieldOfWork: data.immigrationGoal === 'work' ? 2 : 1,
    citizenshipLevel: 1, // Placeholder - could be based on nationality
    investmentLevel: data.immigrationGoal === 'invest' ? 3 : 0,
    languageLevel: 2, // Placeholder - not asked in initial onboarding
  };
}

/**
 * Determine which visa the user should start from
 * 
 * STARTING NODE LOGIC:
 * - If user has a visa → Use that as starting point
 * - If user has no visa → Use "Start" as beginning node
 */
export function getStartingVisaFromOnboarding(
  data: OnboardingData
): string | null {
  if (data.currentVisaStatus === 'has_visa' && data.currentVisa) {
    return data.currentVisa;
  }
  return null; // Will show "Start" node instead
}

/**
 * Get visa eligibility requirements
 * 
 * CUSTOMIZE HERE: Add or modify visa requirements
 * Each visa lists minimum skill thresholds for eligibility
 */
export interface VisaRequirement {
  visa: string;
  minEducation: number;
  minExperience: number;
  goalMatch?: ImmigrationGoal[]; // If specified, recommend for these goals
  description: string;
}

export const VISA_REQUIREMENTS: VisaRequirement[] = [
  {
    visa: 'F-1',
    minEducation: 1, // High school minimum
    minExperience: 0,
    goalMatch: ['study'],
    description: 'Student visa - requires university acceptance',
  },
  {
    visa: 'J-1',
    minEducation: 1,
    minExperience: 0,
    goalMatch: ['study', 'visit'],
    description: 'Exchange visitor visa',
  },
  {
    visa: 'B-1/B-2',
    minEducation: 0,
    minExperience: 0,
    goalMatch: ['visit'],
    description: 'Tourist/Business visitor visa',
  },
  {
    visa: 'H-1B',
    minEducation: 3, // Bachelor's degree
    minExperience: 1,
    goalMatch: ['work'],
    description: 'Specialty occupation worker',
  },
  {
    visa: 'O-1',
    minEducation: 2,
    minExperience: 2,
    goalMatch: ['work'],
    description: 'Individual of extraordinary ability',
  },
  {
    visa: 'L-1',
    minEducation: 2,
    minExperience: 2,
    goalMatch: ['work'],
    description: 'Intracompany transferee',
  },
  {
    visa: 'E-2',
    minEducation: 1,
    minExperience: 0,
    goalMatch: ['invest'],
    description: 'Treaty investor',
  },
  {
    visa: 'EB-1',
    minEducation: 4, // Master's
    minExperience: 3,
    goalMatch: ['immigrate_longterm'],
    description: 'Employment-based first preference',
  },
  {
    visa: 'EB-2',
    minEducation: 3,
    minExperience: 2,
    goalMatch: ['immigrate_longterm'],
    description: 'Employment-based second preference',
  },
];

/**
 * Check if user is eligible for a visa
 */
export function isVisaEligible(
  visa: string,
  skillTree: ReturnType<typeof onboardingToSkillTree>
): boolean {
  const req = VISA_REQUIREMENTS.find((r) => r.visa === visa);
  if (!req) return false;

  return (
    skillTree.educationLevel >= req.minEducation &&
    skillTree.workExperience >= req.minExperience
  );
}

/**
 * Get all available visas for a user
 */
export function getAvailableVisas(
  skillTree: ReturnType<typeof onboardingToSkillTree>,
  goalMatch?: ImmigrationGoal
): string[] {
  return VISA_REQUIREMENTS.filter((req) => {
    const meetsEducation = skillTree.educationLevel >= req.minEducation;
    const meetsExperience = skillTree.workExperience >= req.minExperience;
    const meetsGoal = !goalMatch || !req.goalMatch || req.goalMatch.includes(goalMatch);
    return meetsEducation && meetsExperience && meetsGoal;
  }).map((req) => req.visa);
}

/**
 * Get recommended visas for user's goal
 */
export function getRecommendedVisas(
  onboarding: OnboardingData,
  skillTree: ReturnType<typeof onboardingToSkillTree>
): string[] {
  let goal: ImmigrationGoal | undefined;

  if (onboarding.currentVisaStatus === 'no_visa') {
    goal = onboarding.immigrationGoal;
  }

  // Find all visas that match the goal and user qualifies for
  return VISA_REQUIREMENTS.filter((req) => {
    const meetsEducation = skillTree.educationLevel >= req.minEducation;
    const meetsExperience = skillTree.workExperience >= req.minExperience;
    const matchesGoal = goal && req.goalMatch?.includes(goal);
    return meetsEducation && meetsExperience && matchesGoal;
  }).map((req) => req.visa);
}
