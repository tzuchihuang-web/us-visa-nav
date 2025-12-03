/**
 * VISA MATCHING ENGINE
 * ============================================================================
 * 
 * Deterministic, rules-based system for matching user profiles to visa eligibility.
 * 
 * INPUT: UserProfile object containing:
 * - educationLevel: string (high_school | bachelors | masters | phd)
 * - yearsOfExperience: number
 * - fieldOfWork: string
 * - countryOfCitizenship: string (ISO country code like 'IN', 'BR', etc.)
 * - englishProficiency: number (0-5 scale)
 * - investmentAmount: number (in USD)
 * - currentVisa: string | null (e.g., 'F-1', 'H-1B', null)
 * 
 * OUTPUT: VisaEligibilityScore object:
 * - status: 'recommended' | 'available' | 'locked'
 * - matchedRules: number (how many eligibility rules passed)
 * - totalRules: number (total rules for this visa)
 * - matchPercentage: number (0-100%)
 * - failedRules: array of rule descriptions that didn't pass
 * 
 * LOGIC:
 * - "recommended": 90%+ rules pass
 * - "available": 50%+ rules pass
 * - "locked": <50% rules pass
 * 
 * NO LEGAL GUARANTEES: This engine provides estimates only.
 * It does not guarantee visa approval or eligibility.
 * ============================================================================
 */

import {
  VISA_KNOWLEDGE_BASE,
  VisaDefinition,
  VisaEligibilityRule,
  getCitizenshipRestrictionCategory,
} from './visa-knowledge-base';

/**
 * User profile for matching
 * 
 * DATA OWNERSHIP NOTE:
 * This profile is the single source of truth and should be:
 * 1. Stored in Supabase user_profiles.onboarding_data (persisted)
 * 2. Loaded into app state on component mount
 * 3. Passed to matching engine for real-time recalculation
 * 4. Updated when user edits qualifications or onboarding data
 * 
 * CURRENT VISA:
 * - If null: User has no current visa, show START node
 * - If string (e.g., 'F-1'): User currently holds that visa, show it as Level 0
 */
export interface UserProfile {
  // Education & Qualifications
  educationLevel: 'high_school' | 'bachelors' | 'masters' | 'phd' | 'other';
  yearsOfExperience: number;
  fieldOfWork: string; // e.g., 'tech', 'engineering', 'finance', 'healthcare'
  englishProficiency: number; // 0-5 scale

  // Immigration Status & Country
  currentVisa: string | null; // e.g., 'F-1', 'H-1B', null for no visa
  countryOfCitizenship: string; // ISO country code, e.g., 'IN', 'BR', 'CN'

  // Financial
  investmentAmount: number; // in USD

  // Optional metadata
  immigrationGoal?: 'study' | 'work' | 'visit' | 'invest' | 'immigrate_longterm';
}

export interface VisaEligibilityScore {
  visaId: string;
  status: 'recommended' | 'available' | 'locked';
  matchedRules: number;
  totalRules: number;
  matchPercentage: number;
  failedRules: string[];
}

/**
 * Evaluate a single eligibility rule against user profile
 * 
 * Returns true if rule passes, false otherwise
 */
function evaluateRule(rule: VisaEligibilityRule, profile: UserProfile): boolean {
  let fieldValue: any;

  // Map rule field to user profile
  switch (rule.field) {
    case 'educationLevel':
      const educationLevels = { high_school: 1, bachelors: 2, masters: 3, phd: 4 };
      fieldValue = educationLevels[profile.educationLevel as keyof typeof educationLevels] || 0;
      break;

    case 'yearsOfExperience':
      fieldValue = profile.yearsOfExperience;
      break;

    case 'fieldOfWork':
      fieldValue = profile.fieldOfWork;
      break;

    case 'englishProficiency':
      fieldValue = profile.englishProficiency;
      break;

    case 'investmentAmount':
      fieldValue = profile.investmentAmount;
      break;

    case 'citizenshipRestrictionCategory':
      fieldValue = getCitizenshipRestrictionCategory(profile.countryOfCitizenship);
      break;

    case 'previousVisa':
      fieldValue = profile.currentVisa;
      break;

    default:
      console.warn(`Unknown rule field: ${rule.field}`);
      return true; // Don't fail on unknown fields
  }

  // Apply operator logic
  switch (rule.operator) {
    case 'gte':
      return fieldValue >= rule.value;

    case 'lte':
      return fieldValue <= rule.value;

    case 'eq':
      return fieldValue === rule.value;

    case 'includes':
      // For arrays: check if fieldValue is in the rule.value array
      return (rule.value as string[]).includes(fieldValue);

    case 'excludes':
      // For arrays: check if fieldValue is NOT in the rule.value array
      return !(rule.value as string[]).includes(fieldValue);

    default:
      console.warn(`Unknown operator: ${rule.operator}`);
      return true;
  }
}

/**
 * Score a single visa against user profile
 * 
 * Returns:
 * - matched/total rules count
 * - status (recommended/available/locked)
 * - list of failed rules
 */
function scoreVisa(visaId: string, profile: UserProfile): VisaEligibilityScore | null {
  const visa = VISA_KNOWLEDGE_BASE[visaId];

  if (!visa) {
    return null;
  }

  const rules = visa.eligibilityRules;
  const failedRules: string[] = [];
  let matchedRules = 0;

  // Evaluate each rule
  rules.forEach((rule) => {
    if (evaluateRule(rule, profile)) {
      matchedRules++;
    } else {
      failedRules.push(rule.description);
    }
  });

  const totalRules = rules.length;
  const matchPercentage = totalRules > 0 ? Math.round((matchedRules / totalRules) * 100) : 100;

  // Determine status based on match percentage
  let status: 'recommended' | 'available' | 'locked';
  if (matchPercentage >= 90) {
    status = 'recommended';
  } else if (matchPercentage >= 50) {
    status = 'available';
  } else {
    status = 'locked';
  }

  return {
    visaId,
    status,
    matchedRules,
    totalRules,
    matchPercentage,
    failedRules,
  };
}

/**
 * MAIN MATCHING ENGINE
 * 
 * Input: User profile
 * Output: Map of visaId -> VisaEligibilityScore
 * 
 * Usage:
 * const scores = getVisaRecommendations(userProfile);
 * const recommendedVisas = Object.entries(scores)
 *   .filter(([_, score]) => score.status === 'recommended')
 *   .map(([visaId]) => visaId);
 * 
 * PERFORMANCE NOTE:
 * This engine is fast (O(n*m) where n=visas, m=rules).
 * Safe to call on every profile change or component render.
 * Consider memoization in components for large lists.
 */
export function getVisaRecommendations(profile: UserProfile): Record<string, VisaEligibilityScore> {
  const recommendations: Record<string, VisaEligibilityScore> = {};

  // Score every visa in knowledge base
  Object.keys(VISA_KNOWLEDGE_BASE).forEach((visaId) => {
    const score = scoreVisa(visaId, profile);
    if (score) {
      recommendations[visaId] = score;
    }
  });

  return recommendations;
}

/**
 * Get filtered list of visa IDs by status
 * 
 * Usage:
 * const recommended = getVisasByStatus(recommendations, 'recommended');
 * const available = getVisasByStatus(recommendations, 'available');
 * const locked = getVisasByStatus(recommendations, 'locked');
 */
export function getVisasByStatus(
  recommendations: Record<string, VisaEligibilityScore>,
  status: 'recommended' | 'available' | 'locked'
): string[] {
  return Object.entries(recommendations)
    .filter(([_, score]) => score.status === status)
    .map(([visaId]) => visaId)
    .sort(); // Consistent ordering
}

/**
 * Get detailed eligibility report for a single visa
 * 
 * Useful for detail panels showing "why" user qualifies or doesn't
 */
export function getVisaEligibilityReport(
  visaId: string,
  profile: UserProfile
): {
  visa: VisaDefinition;
  score: VisaEligibilityScore;
  message: string;
} | null {
  const visa = VISA_KNOWLEDGE_BASE[visaId];
  const score = scoreVisa(visaId, profile);

  if (!visa || !score) {
    return null;
  }

  // Generate human-readable message
  let message = '';
  if (score.status === 'recommended') {
    message = `Your profile matches ${score.matchPercentage}% of requirements for ${visa.name}. This may be a strong match.`;
  } else if (score.status === 'available') {
    message = `Your profile matches ${score.matchPercentage}% of requirements for ${visa.name}. This could be a possible path.`;
  } else {
    message = `Your profile matches ${score.matchPercentage}% of requirements for ${visa.name}. You may need to strengthen: ${score.failedRules.slice(0, 2).join(', ')}.`;
  }

  return { visa, score, message };
}

/**
 * Get next recommended visas after current visa
 * 
 * Useful for showing "typical next steps" on map
 */
export function getNextVisaOptions(
  currentVisaId: string | null,
  profile: UserProfile
): Array<{ visaId: string; reason: string; status: 'recommended' | 'available' | 'locked' }> {
  if (!currentVisaId) {
    // If no current visa, return all entry-level visas
    return ['f1', 'j1', 'b2']
      .map((id) => ({
        visaId: id,
        reason: 'Entry-level visa option',
        status: (scoreVisa(id, profile)?.status || 'locked') as 'recommended' | 'available' | 'locked',
      }));
  }

  const currentVisa = VISA_KNOWLEDGE_BASE[currentVisaId];
  if (!currentVisa) {
    return [];
  }

  // Return common next steps
  return currentVisa.commonNextSteps.map((next) => ({
    visaId: next.visaId,
    reason: next.reason,
    status: (scoreVisa(next.visaId, profile)?.status || 'locked') as 'recommended' | 'available' | 'locked',
  }));
}
