/**
 * VISA MATCHING ENGINE
 * 
 * Rules-based, deterministic matching system that evaluates user profiles
 * against visa requirements and assigns:
 * - A match score (0-100)
 * - A status (recommended / available / locked)
 * - Human-readable reasons for the match
 * 
 * CUSTOMIZATION GUIDE:
 * 1. Score Thresholds (line ~30): Adjust what counts as "recommended" vs "available"
 * 2. Score Weights (lines ~60+): Adjust how much each factor contributes
 * 3. Education Mapping (line ~90): Map education levels to numeric scores
 * 4. Rules (line ~150+): Add new matching rules or modify existing ones
 */

import { UserProfile, VisaMatchResult, VisaMatchStatus } from "@/lib/types";
import { Visa } from "@/src/data/visaKnowledgeBase";

// ============================================================================
// SCORE THRESHOLDS - CUSTOMIZE HERE
// ============================================================================
// These thresholds determine how user profile scores map to match status

const SCORE_THRESHOLDS = {
  RECOMMENDED_MIN: 70,  // Score >= 70 → "recommended"
  AVAILABLE_MIN: 40,    // Score >= 40 and < 70 → "available"
  LOCKED_MAX: 39,       // Score < 40 → "locked"
};

// ============================================================================
// SCORING WEIGHTS - CUSTOMIZE HERE
// ============================================================================
// Adjust these to change how much each factor influences the final score
// Higher weight = more influence on the score

const WEIGHTS = {
  // Current visa progression: if this visa is a natural next step
  currentVisaProgression: 25,
  
  // Education alignment: does the user have the right education?
  educationFit: 20,
  
  // Work experience: does the user have enough experience?
  experienceFit: 20,
  
  // Investment alignment: for E-2, EB-5 type visas
  investmentFit: 15,
  
  // Language proficiency: English level required
  languageFit: 10,
  
  // Citizenship: any restrictions or bonuses
  citizenshipFit: 10,
};

// ============================================================================
// EDUCATION LEVEL MAPPING - CUSTOMIZE HERE
// ============================================================================
// Map education levels to numeric scores (0-100) for comparison

function educationToScore(level?: string): number {
  switch (level) {
    case "phd":
      return 100;
    case "master":
      return 85;
    case "bachelor":
      return 70;
    case "highSchool":
      return 50;
    default:
      return 0;
  }
}

// ============================================================================
// ENGLISH LEVEL MAPPING
// ============================================================================

function englishToScore(level?: string): number {
  switch (level) {
    case "fluent":
      return 100;
    case "advanced":
      return 85;
    case "intermediate":
      return 60;
    case "basic":
      return 30;
    default:
      return 0;
  }
}

// ============================================================================
// WORK EXPERIENCE SCORING
// ============================================================================
// Convert years of experience to a score

function experienceToScore(years?: number): number {
  if (!years) return 0;
  if (years >= 10) return 100;
  if (years >= 7) return 85;
  if (years >= 5) return 75;
  if (years >= 3) return 60;
  if (years >= 1) return 40;
  return 20;
}

// ============================================================================
// INVESTMENT SCORING
// ============================================================================

function investmentToScore(amountUSD?: number): number {
  if (!amountUSD) return 0;
  if (amountUSD >= 500000) return 100; // EB-5 threshold
  if (amountUSD >= 250000) return 90;
  if (amountUSD >= 100000) return 80;
  if (amountUSD >= 50000) return 70;   // E-2 modest threshold
  if (amountUSD >= 10000) return 50;
  return 20;
}

// ============================================================================
// MAIN MATCHING ENGINE
// ============================================================================

/**
 * Matches a user profile to an array of visas using rules-based scoring.
 * 
 * @param user - User profile with qualifications
 * @param visas - Array of visas to evaluate
 * @returns Array of VisaMatchResult sorted by score (highest first)
 */
export function matchUserToVisas(
  user: UserProfile,
  visas: Visa[]
): VisaMatchResult[] {
  return visas
    .map((visa) => scoreVisaForUser(user, visa))
    .sort((a, b) => b.score - a.score);
}

/**
 * Scores a single visa for a user.
 * Returns the visa's match result with score and reasons.
 */
function scoreVisaForUser(user: UserProfile, visa: Visa): VisaMatchResult {
  let totalScore = 0;
  const reasons: string[] = [];

  // ====== CURRENT VISA PROGRESSION ======
  // If user has a current visa and this visa is in its commonNextSteps, boost score
  const progressionScore = evaluateCurrentVisaProgression(user, visa);
  totalScore += progressionScore * WEIGHTS.currentVisaProgression;
  if (progressionScore > 0) {
    reasons.push(
      `Your current visa (${user.currentVisa?.toUpperCase()}) typically progresses to this path.`
    );
  }

  // ====== EDUCATION FIT ======
  // Score based on education requirements (inferred from visa category/name)
  const educationScore = evaluateEducationFit(user, visa);
  totalScore += educationScore * WEIGHTS.educationFit;
  
  if (user.educationLevel) {
    const eduValue = educationToScore(user.educationLevel);
    if (eduValue >= 85) {
      reasons.push("Your advanced education aligns well with this visa.");
    } else if (eduValue >= 70) {
      reasons.push("Your education level fits this visa category.");
    } else if (eduValue < 50) {
      reasons.push("Higher education would strengthen your application.");
    }
  }

  // ====== WORK EXPERIENCE FIT ======
  const experienceScore = evaluateExperienceFit(user, visa);
  totalScore += experienceScore * WEIGHTS.experienceFit;
  
  if (user.yearsOfExperience !== undefined) {
    if (user.yearsOfExperience < 1) {
      reasons.push("Limited work experience may restrict this option.");
    } else if (user.yearsOfExperience >= 3) {
      reasons.push("Your work experience supports this visa path.");
    }
  }

  // ====== INVESTMENT FIT ======
  const investmentScore = evaluateInvestmentFit(user, visa);
  totalScore += investmentScore * WEIGHTS.investmentFit;
  
  if (investmentScore > 0.7) {
    reasons.push("Your investment capacity aligns with this visa.");
  }

  // ====== LANGUAGE FIT ======
  const languageScore = evaluateLanguageFit(user, visa);
  totalScore += languageScore * WEIGHTS.languageFit;
  
  if (user.englishProficiency >= 4) {
    reasons.push("Your English proficiency meets requirements.");
  }

  // ====== CITIZENSHIP CONSIDERATIONS ======
  const citizenshipScore = evaluateCitizenshipFit(user, visa);
  totalScore += citizenshipScore * WEIGHTS.citizenshipFit;

  // ====== CAP SCORE BETWEEN 0 AND 100 ======
  totalScore = Math.min(100, Math.max(0, totalScore));

  // ====== DETERMINE STATUS BASED ON SCORE ======
  const status = determineStatus(totalScore);

  return {
    visaId: visa.id,
    status,
    score: Math.round(totalScore),
    reasons:
      reasons.length > 0
        ? reasons
        : [
            `This visa is currently ${status === "locked" ? "not eligible" : "available"} for your profile.`,
          ],
  };
}

// ============================================================================
// INDIVIDUAL SCORING FUNCTIONS
// ============================================================================

/**
 * Evaluates if current visa naturally leads to this visa.
 * Returns 0-1 score.
 */
function evaluateCurrentVisaProgression(
  user: UserProfile,
  visa: Visa
): number {
  if (!user.currentVisa) {
    // User has no current visa, they're starting fresh
    // Only entry-level visas (F-1, J-1, etc.) should get full points
    if (visa.category === "student") return 0.8;
    if (visa.category === "work" && visa.id !== "h1b") return 0.5;
    return 0.2;
  }

  // User has a current visa - check if this is a natural next step
  const currentVisa = user.currentVisa.toUpperCase();
  const commonNextSteps = (visa as any).commonNextSteps || [];

  // Direct progression match
  if (commonNextSteps.includes(currentVisa)) {
    return 1.0;
  }

  // Category-based progression rules
  const progressionRules: Record<string, string[]> = {
    F1: ["OPT", "H1B", "O1", "EB2"],
    OPT: ["H1B", "O1", "EB2", "L1"],
    H1B: ["EB2", "EB1", "O1", "L1"],
    O1: ["EB1", "EB2"],
    L1: ["EB1"],
    E2: ["EB2", "EB5"],
  };

  const naturalNextSteps = progressionRules[currentVisa] || [];
  if (naturalNextSteps.includes(visa.id.toUpperCase())) {
    return 0.8;
  }

  // Same or higher category is usually OK
  if (isHigherOrSameCategory(user.currentVisa, visa.id)) {
    return 0.4;
  }

  return 0.1;
}

/**
 * Determines if visaB is a higher or same category than visaA
 */
function isHigherOrSameCategory(visaA: string, visaB: string): boolean {
  const categoryRank: Record<string, number> = {
    f1: 1,
    opt: 1.5,
    j1: 1,
    h1b: 2,
    o1: 2.5,
    l1: 2.5,
    e2: 2,
    eb5: 3,
    eb2: 3,
    eb1: 3,
  };

  const rankA = categoryRank[visaA.toLowerCase()] || 0;
  const rankB = categoryRank[visaB.toLowerCase()] || 0;

  return rankB >= rankA;
}

/**
 * Evaluates if user's education matches visa requirements.
 * Returns 0-1 score.
 */
function evaluateEducationFit(user: UserProfile, visa: Visa): number {
  // Infer education requirements from visa category
  const educationReq: Record<string, number> = {
    // Student visas: Bachelor's minimum
    f1: 70,
    j1: 70,

    // Work visas: Bachelor's is usually OK
    h1b: 70,
    o1: 85, // O-1 often requires advanced/specialized
    l1: 70,

    // Investor visas: Generally flexible
    e2: 50,

    // Immigrant visas: Advanced degree preferred/required
    eb1: 85,
    eb2: 85,
    eb5: 50,

    // Default
    opt: 70,
  };

  const requiredScore =
    educationReq[visa.id.toLowerCase()] || educationReq["h1b"];
  const userScore = educationToScore(user.educationLevel);

  if (userScore >= requiredScore) {
    return 1.0;
  } else if (userScore >= requiredScore * 0.7) {
    return 0.6;
  } else if (userScore > 0) {
    return 0.3;
  } else {
    return 0.0;
  }
}

/**
 * Evaluates if user's work experience matches visa requirements.
 * Returns 0-1 score.
 */
function evaluateExperienceFit(user: UserProfile, visa: any): number {
  const years = user.yearsOfExperience || 0;

  // Experience requirements by visa
  const experienceReq: Record<string, number> = {
    f1: 0, // No work exp required
    j1: 0,
    opt: 0,

    h1b: 1, // At least 1 year
    o1: 3, // 3+ years typical
    l1: 2, // 2+ years (manager/specialized knowledge)
    e2: 2, // 2+ years running business typical

    eb1: 5, // 5+ years for researcher/executive
    eb2: 3, // 3+ years typical
    eb5: 0, // No work exp required

    default: 1,
  };

  const required = experienceReq[visa.id.toLowerCase()] || 1;

  if (years >= required) {
    return 1.0;
  } else if (years > 0) {
    return Math.min(0.9, years / required);
  } else if (required === 0) {
    return 0.8; // No experience required, user just getting started
  } else {
    return 0.0; // No experience and visa requires it
  }
}

/**
 * Evaluates if user's investment capacity matches visa.
 * Returns 0-1 score.
 */
function evaluateInvestmentFit(user: UserProfile, visa: any): number {
  const amountUSD = user.investmentAmount || 0;

  // Investment requirements by visa
  const investmentReq: Record<string, number> = {
    e2: 50000, // E-2: ~$50k minimum
    eb5: 500000, // EB-5: $500k (or $250k rural)
    // All others: no investment required
  };

  const required = investmentReq[visa.id.toLowerCase()] || 0;

  if (required === 0) {
    // Visa doesn't require investment, user can proceed
    return 1.0;
  }

  if (amountUSD >= required) {
    return 1.0;
  } else if (amountUSD > required * 0.5) {
    return 0.7;
  } else if (amountUSD > 0) {
    return 0.3;
  } else {
    return 0.0;
  }
}

/**
 * Evaluates if user's language meets visa requirements.
 * Returns 0-1 score.
 */
function evaluateLanguageFit(user: UserProfile, visa: any): number {
  const englishScore = user.englishProficiency;

  // Most visas require "intermediate" English minimum (score 60)
  const minimumRequired = 60;

  if (englishScore >= minimumRequired) {
    return 1.0;
  } else if (englishScore >= minimumRequired * 0.7) {
    return 0.6;
  } else if (englishScore > 0) {
    return 0.3;
  } else {
    return 0.0;
  }
}

/**
 * Evaluates citizenship-based restrictions or bonuses.
 * Returns 0-1 score.
 */
function evaluateCitizenshipFit(user: UserProfile, visa: Visa): number {
  const citizenship = user.countryOfCitizenship?.toLowerCase() || "";

  // E-2 requires treaty country citizenship - penalize if unknown
  if (visa.id.toLowerCase() === "e2" && !citizenship) {
    return 0.5; // Uncertain if treaty country
  }

  // Generally neutral unless we have specific rules
  return 1.0;
}

/**
 * Determines match status based on score.
 * Can be customized in the SCORE_THRESHOLDS section above.
 */
function determineStatus(score: number): VisaMatchStatus {
  if (score >= SCORE_THRESHOLDS.RECOMMENDED_MIN) {
    return "recommended";
  } else if (score >= SCORE_THRESHOLDS.AVAILABLE_MIN) {
    return "available";
  } else {
    return "locked";
  }
}
