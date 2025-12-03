/**
 * DUMMY DATA FOR SKILL TREE AND VISA MAP
 * 
 * Edit this file to:
 * - Change user profile and skill levels
 * - Add/remove skill nodes
 * - Adjust visa requirements
 * - Customize visa descriptions and metadata
 * 
 * USER PROFILES:
 * To test different scenarios, uncomment a different profile below:
 * 1. FRESH_START - No visa, beginner skills
 * 2. F1_STUDENT - Current F-1, ready for work visa
 * 3. H1B_PROFESSIONAL - Experienced H-1B worker
 * 4. ADVANCED_SEEKER - EB-2 green card path
 */

// ============================================================================
// PREDEFINED USER PROFILES FOR TESTING
// ============================================================================

const PROFILES = {
  // Scenario 1: Fresh start, exploring options
  FRESH_START: {
    name: "Jordan Smith",
    currentStatus: "none",
    currentVisa: null, // No visa - shows "Start" node
    skills: {
      education: {
        name: "Education Level",
        level: 2, // Bachelor's degree
        unlocked: true,
        icon: "🎓",
      },
      workExperience: {
        name: "Work Experience",
        level: 1, // 1-2 years
        unlocked: true,
        icon: "💼",
      },
      fieldOfWork: {
        name: "Field of Work",
        level: 1, // Common field
        unlocked: true,
        icon: "🔧",
      },
      citizenship: {
        name: "Country of Citizenship",
        level: 1, // Restricted countries
        unlocked: true,
        icon: "🌍",
      },
      investment: {
        name: "Investment Amount",
        level: 0, // Locked
        unlocked: false,
        icon: "💰",
      },
      language: {
        name: "English Proficiency",
        level: 3,
        unlocked: true,
        icon: "🗣️",
      },
    },
  },

  // Scenario 2: F-1 student with good prospects for H-1B
  F1_STUDENT: {
    name: "Alex Johnson",
    currentStatus: "international_student",
    currentVisa: "f1", // Starting from F-1
    skills: {
      education: {
        name: "Education Level",
        level: 3, // Master's degree
        unlocked: true,
        icon: "🎓",
      },
      workExperience: {
        name: "Work Experience",
        level: 2, // 2-3 years internship + OPT
        unlocked: true,
        icon: "💼",
      },
      fieldOfWork: {
        name: "Field of Work",
        level: 3, // Highly specialized (tech/engineering)
        unlocked: true,
        icon: "🔧",
      },
      citizenship: {
        name: "Country of Citizenship",
        level: 1,
        unlocked: true,
        icon: "🌍",
      },
      investment: {
        name: "Investment Amount",
        level: 1, // $50k-$100k
        unlocked: true,
        icon: "💰",
      },
      language: {
        name: "English Proficiency",
        level: 4,
        unlocked: true,
        icon: "🗣️",
      },
    },
  },

  // Scenario 3: H-1B professional exploring advanced options
  H1B_PROFESSIONAL: {
    name: "Priya Sharma",
    currentStatus: "work_visa_holder",
    currentVisa: "h1b", // Starting from H-1B
    skills: {
      education: {
        name: "Education Level",
        level: 4, // Advanced degree
        unlocked: true,
        icon: "🎓",
      },
      workExperience: {
        name: "Work Experience",
        level: 4, // 5+ years
        unlocked: true,
        icon: "💼",
      },
      fieldOfWork: {
        name: "Field of Work",
        level: 4, // Highly specialized professional
        unlocked: true,
        icon: "🔧",
      },
      citizenship: {
        name: "Country of Citizenship",
        level: 2, // Most countries
        unlocked: true,
        icon: "🌍",
      },
      investment: {
        name: "Investment Amount",
        level: 2, // $100k-$500k
        unlocked: true,
        icon: "💰",
      },
      language: {
        name: "English Proficiency",
        level: 5, // Native/fluent
        unlocked: true,
        icon: "🗣️",
      },
    },
  },

  // Scenario 4: EB-2 green card applicant
  ADVANCED_SEEKER: {
    name: "Chen Wei",
    currentStatus: "employment_based",
    currentVisa: "eb2", // Starting from EB-2
    skills: {
      education: {
        name: "Education Level",
        level: 5, // PhD
        unlocked: true,
        icon: "🎓",
      },
      workExperience: {
        name: "Work Experience",
        level: 5, // 7+ years
        unlocked: true,
        icon: "💼",
      },
      fieldOfWork: {
        name: "Field of Work",
        level: 5, // Leading expert
        unlocked: true,
        icon: "🔧",
      },
      citizenship: {
        name: "Country of Citizenship",
        level: 3, // Priority country
        unlocked: true,
        icon: "🌍",
      },
      investment: {
        name: "Investment Amount",
        level: 3, // $500k+
        unlocked: true,
        icon: "💰",
      },
      language: {
        name: "English Proficiency",
        level: 5,
        unlocked: true,
        icon: "🗣️",
      },
    },
  },
};

// ============================================================================
// ACTIVE USER PROFILE (Change this to test different scenarios)
// ============================================================================
// Options: PROFILES.FRESH_START, PROFILES.F1_STUDENT, PROFILES.H1B_PROFESSIONAL, PROFILES.ADVANCED_SEEKER
export const userProfile = PROFILES.F1_STUDENT;

// ============================================================================
// VISA PATHS DATA - HIERARCHICAL STRUCTURE
// ============================================================================
// Visa nodes organized by category and hierarchy level
// Each visa defines:
//   - id, name, emoji, descriptions
//   - tier: "start", "entry", "intermediate", "advanced"
//   - requirements: skill level requirements
//   - previousVisas: which visas can lead to this one
//   - category: for grouping

export const visaPaths = [
  // ========== START NODE ==========
  // Special "no visa" starting point
  {
    id: "start",
    name: "Start Your Journey",
    emoji: "🚀",
    description: "Begin exploring U.S. visa options",
    fullDescription:
      "You are starting your U.S. visa journey. Explore various visa categories based on your qualifications and goals.",
    category: "Start",
    tier: "start",
    requirements: {},
    previousVisas: [] as string[],
    color: "from-blue-400 to-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },

  // ========== ENTRY-LEVEL VISAS (Direct from start or from F-1) ==========
  {
    id: "f1",
    name: "F-1 Student",
    emoji: "🎓",
    description: "Study at a U.S. university",
    fullDescription:
      "The F-1 visa is for international students pursuing academic degrees at accredited U.S. institutions.",
    category: "Education",
    tier: "entry",
    requirements: {
      education: { min: 1 },
      citizenship: { min: 0 },
      language: { min: 2 },
    },
    previousVisas: ["start"], // Can reach from start
    color: "from-blue-400 to-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    id: "j1",
    name: "J-1 Exchange",
    emoji: "🌍",
    description: "Exchange visitor programs",
    fullDescription:
      "The J-1 visa is for exchange visitors, scholars, professors, researchers, and students.",
    category: "Exchange",
    tier: "entry",
    requirements: {
      education: { min: 0 },
      citizenship: { min: 0 },
      language: { min: 1 },
    },
    previousVisas: ["start"],
    color: "from-green-400 to-green-600",
    badge: "bg-green-100 text-green-700",
  },
  {
    id: "b2",
    name: "B-2 Tourist",
    emoji: "✈️",
    description: "Tourist or visitor visa",
    fullDescription:
      "The B-2 visa is for tourism, visiting family, or other temporary visits to the U.S.",
    category: "Visitor",
    tier: "entry",
    requirements: {
      citizenship: { min: 0 },
    },
    previousVisas: ["start"],
    color: "from-purple-400 to-purple-600",
    badge: "bg-purple-100 text-purple-700",
  },

  // ========== INTERMEDIATE VISAS (From F-1 or other entry visas) ==========
  {
    id: "opt",
    name: "OPT - Work Experience",
    emoji: "💼",
    description: "Optional Practical Training after F-1",
    fullDescription:
      "OPT allows F-1 students to work in the U.S. for up to 12 months (or 36 months for STEM) after graduation.",
    category: "Work",
    tier: "intermediate",
    requirements: {
      education: { min: 2 },
      workExperience: { min: 0 },
    },
    previousVisas: ["f1"], // Only from F-1
    color: "from-yellow-400 to-orange-500",
    badge: "bg-yellow-100 text-yellow-700",
  },
  {
    id: "h1b",
    name: "H-1B Work",
    emoji: "💼",
    description: "Specialized worker visa",
    fullDescription:
      "Allows U.S. employers to temporarily employ foreign workers in specialty occupations.",
    category: "Work",
    tier: "intermediate",
    requirements: {
      education: { min: 2 },
      workExperience: { min: 1 },
      fieldOfWork: { min: 1 },
      citizenship: { min: 0 },
    },
    previousVisas: ["f1", "opt", "start"], // From F-1, OPT, or direct from start
    color: "from-purple-400 to-purple-600",
    badge: "bg-purple-100 text-purple-700",
  },
  {
    id: "l1",
    name: "L-1 Transfer",
    emoji: "🚀",
    description: "Intracompany transfer visa",
    fullDescription:
      "For managers and specialized knowledge workers transferring within the same company to a U.S. office.",
    category: "Work",
    tier: "intermediate",
    requirements: {
      workExperience: { min: 2 },
      fieldOfWork: { min: 1 },
      citizenship: { min: 0 },
    },
    previousVisas: ["start"], // Direct path
    color: "from-green-400 to-green-600",
    badge: "bg-green-100 text-green-700",
  },
  {
    id: "o1",
    name: "O-1 Talent",
    emoji: "⭐",
    description: "For individuals with extraordinary ability",
    fullDescription:
      "For individuals who possess extraordinary ability in sciences, arts, education, business, or athletics.",
    category: "Achievement",
    tier: "intermediate",
    requirements: {
      education: { min: 2 },
      workExperience: { min: 2 },
      fieldOfWork: { min: 2 },
      citizenship: { min: 0 },
    },
    previousVisas: ["f1", "h1b", "start"],
    color: "from-yellow-400 to-orange-500",
    badge: "bg-yellow-100 text-yellow-700",
  },
  {
    id: "e2",
    name: "E-2 Investor",
    emoji: "💎",
    description: "Investor visa for treaty countries",
    fullDescription:
      "For investors and treaty traders from designated countries making significant U.S. investments.",
    category: "Investment",
    tier: "intermediate",
    requirements: {
      investment: { min: 1 },
      citizenship: { min: 1 },
    },
    previousVisas: ["start"],
    color: "from-pink-400 to-pink-600",
    badge: "bg-pink-100 text-pink-700",
  },

  // ========== ADVANCED VISAS (Long-term, green cards) ==========
  {
    id: "eb1",
    name: "EB-1 Green Card",
    emoji: "🏆",
    description: "Employment-based green card",
    fullDescription:
      "Permanent residency for individuals with extraordinary ability or advanced degree holders.",
    category: "Permanent",
    tier: "advanced",
    requirements: {
      education: { min: 2 },
      workExperience: { min: 3 },
      fieldOfWork: { min: 2 },
      citizenship: { min: 0 },
    },
    previousVisas: ["h1b", "l1", "o1"],
    color: "from-red-400 to-red-600",
    badge: "bg-red-100 text-red-700",
  },
  {
    id: "eb2",
    name: "EB-2 Advanced Degree",
    emoji: "📚",
    description: "Green card for advanced degree holders",
    fullDescription:
      "Employment-based green card for professionals with advanced degrees.",
    category: "Permanent",
    tier: "advanced",
    requirements: {
      education: { min: 3 },
      workExperience: { min: 2 },
      citizenship: { min: 0 },
    },
    previousVisas: ["h1b", "opt"],
    color: "from-red-400 to-red-600",
    badge: "bg-red-100 text-red-700",
  },
];

// ============================================================================
// MAP STYLE CONFIGURATION
// ============================================================================
// Customize the visual appearance of the abstract map here

export const mapConfig = {
  // Background and grid
  backgroundColor: "#fafafa",
  gridColor: "#e0e0e0",
  gridOpacity: 0.3,
  gridSpacing: 40, // pixels
  
  // Node styles
  nodeRadius: 50,
  nodeHoverScale: 1.15,
  nodeUnlockedOpacity: 1,
  nodeLockedOpacity: 0.4,
  
  // Path/connection lines
  pathColor: "#cbd5e1",
  pathOpacity: 0.5,
  pathHoverOpacity: 1,
  pathWidth: 2,
  
  // Text
  fontFamily: "system-ui, -apple-system, sans-serif",
  
  // Status badge colors (used for locked/unlocked/recommended indicators)
  statusColors: {
    locked: { bg: "#fca5a5", text: "#7f1d1d" }, // Red
    unlocked: { bg: "#86efac", text: "#166534" }, // Green
    recommended: { bg: "#fbbf24", text: "#92400e" }, // Amber
    available: { bg: "#93c5fd", text: "#1e40af" }, // Blue
  },
};

// ============================================================================
// HELPER FUNCTION: Determine visa state based on user skills
// ============================================================================
// This function checks if a visa should be locked/unlocked/recommended
// based on the user's skill tree

export function getVisaState(
  visa: (typeof visaPaths)[0],
  userSkills: typeof userProfile.skills
): "locked" | "available" | "recommended" {
  /**
   * Returns: "locked", "available", "recommended"
   * 
   * CUSTOMIZE: Adjust the logic here to match your visa eligibility rules
   */
  
  for (const [skillKey, requirement] of Object.entries(visa.requirements)) {
    const userSkill = userSkills[skillKey as keyof typeof userSkills];
    
    // If skill is locked, visa is locked
    if (!userSkill?.unlocked) {
      return "locked";
    }
    
    // If user doesn't meet minimum level, visa is locked
    if (userSkill.level < (requirement as any).min) {
      return "locked";
    }
  }
  
  // Check if visa is "recommended" (user exceeds requirements significantly)
  const meetsAllRequirementsWell = Object.entries(
    visa.requirements
  ).every(([skillKey, requirement]) => {
    const userSkill = userSkills[skillKey as keyof typeof userSkills];
    return userSkill.level >= (requirement as any).min + 1;
  });
  
  return meetsAllRequirementsWell ? "recommended" : "available";
}

// ============================================================================
// JOURNEY-BASED MAP FUNCTIONS
// ============================================================================
// These functions determine the starting point and branching paths
// PLACEHOLDER: Can be replaced with backend logic

/**
 * Determines the starting visa/node based on user's current visa status
 * 
 * CUSTOMIZE: Replace with backend call to get user's actual current visa
 * or modify logic based on your business rules
 */
export function getStartingVisa(user: typeof userProfile): string {
  // PLACEHOLDER LOGIC:
  // If user has currentVisa set, return that
  // Otherwise return "start" (no visa)
  if (user.currentVisa) {
    return user.currentVisa;
  }
  return "start";
}

/**
 * Gets all visa nodes that should appear in the journey map
 * Filters based on:
 *   1. Starting visa
 *   2. User's skill tree
 *   3. Reachability from starting visa
 * 
 * CUSTOMIZE: Adjust filtering logic based on your requirements
 */
export function getEligiblePaths(
  startingVisaId: string,
  user: typeof userProfile
): (typeof visaPaths)[0][] {
  /**
   * Strategy:
   * 1. Find the starting visa
   * 2. Include all visas reachable from it (via previousVisas)
   * 3. Check skill availability
   * 4. Build a connected graph for display
   */

  const result: Array<(typeof visaPaths)[0]> = [];
  const visited = new Set<string>();

  function traverse(visaId: string) {
    if (visited.has(visaId)) return;
    visited.add(visaId);

    const visa = visaPaths.find((v) => v.id === visaId);
    if (!visa) return;

    result.push(visa);

    // Find all visas that list this visa as previousVisa
    visaPaths.forEach((v) => {
      if (v.previousVisas.includes(visaId) && !visited.has(v.id)) {
        traverse(v.id);
      }
    });
  }

  // Start traversal from the starting visa
  traverse(startingVisaId);

  return result;
}

/**
 * Calculates tree layout positions for nodes
 * Arranges nodes hierarchically:
 * - Left to right flow (x-axis)
 * - Grouped by tier (entry, intermediate, advanced)
 * 
 * Returns object with visa id -> position mapping
 */
export function calculateTreePositions(
  visasToShow: (typeof visaPaths)[0][]
): Record<string, { x: number; y: number }> {
  /**
   * Layout strategy:
   * - Group visas by tier
   * - Position x based on tier: start=0, entry=20%, intermediate=50%, advanced=80%
   * - Position y based on count within tier (distribute vertically)
   */

  const positions: Record<string, { x: number; y: number }> = {};

  // Group by tier
  const byTier = {
    start: visasToShow.filter((v) => v.tier === "start"),
    entry: visasToShow.filter((v) => v.tier === "entry"),
    intermediate: visasToShow.filter((v) => v.tier === "intermediate"),
    advanced: visasToShow.filter((v) => v.tier === "advanced"),
  };

  // X positions for each tier (percentage)
  const tierXPositions = {
    start: 10,
    entry: 25,
    intermediate: 50,
    advanced: 75,
  };

  // Assign positions with vertical distribution
  let totalNodes = visasToShow.length;

  Object.entries(byTier).forEach(([tier, visas]) => {
    const x = tierXPositions[tier as keyof typeof tierXPositions];

    // Distribute y positions evenly across the canvas height
    visas.forEach((visa, index) => {
      const ySpacing = 80 / Math.max(visas.length, 1); // Spread across 80% of height
      const y = 10 + index * ySpacing; // Start at 10%, distribute downward

      positions[visa.id] = { x, y };
    });
  });

  return positions;
}
