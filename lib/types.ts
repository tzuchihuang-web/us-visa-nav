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
 * Unified UserProfile type - SINGLE SOURCE OF TRUTH
 * 
 * Used across:
 * - Onboarding flow
 * - Skill tree / qualifications panel
 * - Matching engine (visa eligibility scoring)
 * - Visa map recommendations
 * - Profile editor (left panel)
 * - Supabase persistence layer
 * 
 * This type has all fields needed for the deterministic matching engine.
 * All fields are stored in Supabase user_profiles table.
 */
export interface UserProfile {
  // Database metadata
  id?: string;              // User ID from auth
  email?: string;           // User email from auth
  
  // Immigration Status & Current Visa
  currentVisa: string | null; // e.g., 'F-1', 'H-1B', null for no visa

  // Education & Qualifications
  educationLevel: 'high_school' | 'bachelors' | 'masters' | 'phd' | 'other';
  yearsOfExperience: number;
  fieldOfWork: string; // e.g., 'tech', 'engineering', 'finance', 'healthcare'

  // Language
  englishProficiency: number; // 0-5 scale

  // Geography
  countryOfCitizenship: string; // ISO country code, e.g., 'IN', 'BR', 'CN'

  // Financial
  investmentAmount: number; // in USD

  // Optional metadata
  immigrationGoal?: 'study' | 'work' | 'visit' | 'invest' | 'immigrate_longterm';
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
