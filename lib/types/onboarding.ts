/**
 * Onboarding Types
 * 
 * Defines the structure for user onboarding questionnaire responses.
 * This data is stored in user_profiles.onboarding_data JSON field.
 */

export type VisaStatusOption = 'no_visa' | 'has_visa';
export type CurrentVisaType = 'F-1' | 'J-1' | 'B-1/B-2' | 'H-1B' | 'O-1' | 'L-1' | 'other';
export type ImmigrationGoal = 'study' | 'work' | 'visit' | 'invest' | 'immigrate_longterm';
export type EducationLevel = 'high_school' | 'bachelors' | 'masters' | 'phd' | 'other';

/**
 * SINGLE SOURCE OF TRUTH FOR USER PROFILE
 * 
 * This data structure is stored in:
 * - Supabase: user_profiles.onboarding_data (JSON field)
 * - App State: UserProfile object (matches visa matching engine)
 * 
 * When user completes onboarding:
 * 1. Save to Supabase via saveOnboardingData()
 * 2. Load into app state on mount
 * 3. Pass to matching engine for visa recommendations
 * 4. Components read from app state for UI updates
 * 
 * CITIZENSHIP HANDLING:
 * - countryOfCitizenship: ISO country code (e.g., 'IN', 'BR', 'CN')
 * - Internally mapped to restriction category by matching engine
 * - Users select actual country name via dropdown
 * 
 * CURRENT VISA:
 * - If null: User has no visa, map shows START node
 * - If string: User has visa, map shows it as Level 0 node
 * - Updated when user changes their visa status
 */
export interface OnboardingData {
  // Step 1: Current visa status
  currentVisaStatus: VisaStatusOption;
  
  // Step 2a: If has visa - which visa
  currentVisa?: CurrentVisaType;
  
  // Step 2b: If no visa - immigration goal
  immigrationGoal?: ImmigrationGoal;
  
  // Step 3: Education level
  educationLevel: EducationLevel;
  
  // Step 4: Work experience
  yearsOfExperience: number;
  
  // Step 4+: Additional qualifications (filled in by SkillTreeEditable)
  countryOfCitizenship?: string; // ISO country code (e.g., 'IN', 'BR')
  fieldOfWork?: string; // e.g., 'tech', 'engineering', 'finance'
  englishProficiency?: number; // 0-5 scale
  investmentAmount?: number; // in USD
  
  // Metadata
  completedAt: string; // ISO timestamp
  completedStep: number; // Which step was last completed (0-3)
}

export interface UserVisaProfile {
  userId: string;
  onboarding: OnboardingData;
  onboardingCompleted: boolean;
  skillTree: {
    educationLevel: number; // 0-5 scale
    workExperience: number; // 0-5 scale
    fieldOfWork: number; // 0-5 scale
    citizenshipLevel: number; // 0-5 scale
    investmentLevel: number; // 0-5 scale
    languageLevel: number; // 0-5 scale
  };
}

/**
 * Onboarding Question Options
 * 
 * These are the predefined options users can select from.
 * UPDATE HERE: Add more options as needed.
 */

export const ONBOARDING_OPTIONS = {
  visaStatus: [
    { value: 'no_visa', label: "No, I don't have a U.S. visa yet" },
    { value: 'has_visa', label: 'Yes, I currently hold a U.S. visa' },
  ] as const,

  currentVisa: [
    { value: 'F-1', label: 'F-1 (Student Visa)' },
    { value: 'J-1', label: 'J-1 (Exchange Visitor)' },
    { value: 'B-1/B-2', label: 'B-1/B-2 (Tourist/Business)' },
    { value: 'H-1B', label: 'H-1B (Specialty Occupation Worker)' },
    { value: 'O-1', label: 'O-1 (Individual of Extraordinary Ability)' },
    { value: 'L-1', label: 'L-1 (Intracompany Transferee)' },
    { value: 'other', label: 'Other (please specify)' },
  ] as const,

  immigrationGoal: [
    { value: 'study', label: '🎓 Study in the U.S.' },
    { value: 'work', label: '💼 Work in the U.S.' },
    { value: 'visit', label: '✈️ Visit the U.S.' },
    { value: 'invest', label: '💰 Invest or start a business' },
    { value: 'immigrate_longterm', label: '🏠 Immigrate long-term (Green Card/Citizenship)' },
  ] as const,

  educationLevel: [
    { value: 'high_school', label: 'High School Diploma' },
    { value: 'bachelors', label: "Bachelor's Degree" },
    { value: 'masters', label: "Master's Degree" },
    { value: 'phd', label: 'PhD or Doctorate' },
    { value: 'other', label: 'Other' },
  ] as const,
};
