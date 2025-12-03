// Core domain models for visa navigation

export interface Visa {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  timeline: string;
  successRate: number;
}

/**
 * Unified UserProfile type used across:
 * - Onboarding flow
 * - Skill tree / qualifications panel
 * - Matching engine
 * - Visa map recommendations
 * 
 * This extends with qualification fields to support the matching engine.
 */
export interface UserProfile {
  id: string;
  email: string;
  currentStatus: string;
  visaInterests: string[];
  
  // Visa Journey
  currentVisa?: string | null;
  
  // Education
  educationLevel?: "highSchool" | "bachelor" | "master" | "phd";
  
  // Work Experience
  workExperienceYears?: number;
  fieldOfWork?: string;
  
  // Geography
  countryOfCitizenship?: string;
  
  // Language
  englishLevel?: "basic" | "intermediate" | "advanced" | "fluent";
  
  // Financial
  investmentAmountUSD?: number;
}

export interface ProgressStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
}

/**
 * Result of matching a user profile to a visa
 * Used by the matching engine to determine eligibility and score
 */
export type VisaMatchStatus = "recommended" | "available" | "locked";

export interface VisaMatchResult {
  visaId: string;
  status: VisaMatchStatus;
  score: number;              // 0-100
  reasons: string[];          // Human-readable explanations
}
