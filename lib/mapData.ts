/**
 * DUMMY DATA FOR SKILL TREE AND VISA MAP
 * 
 * Edit this file to:
 * - Change user profile and skill levels
 * - Add/remove skill nodes
 * - Adjust visa requirements
 * - Customize visa descriptions and metadata
 */

// ============================================================================
// USER PROFILE & SKILL TREE DATA
// ============================================================================
// Customize the user's skills, education level, work experience, etc.
// Locked nodes will restrict visa availability

export const userProfile = {
  name: "Alex Johnson",
  currentStatus: "international_student",
  skills: {
    education: {
      name: "Education Level",
      level: 3, // 0-5 scale: 0=locked, 1=HS, 2=Bachelor's, 3=Master's, 4=PhD, 5=Advanced
      unlocked: true,
      icon: "🎓",
    },
    workExperience: {
      name: "Work Experience",
      level: 2, // 0-5 scale: years of experience
      unlocked: true,
      icon: "💼",
    },
    fieldOfWork: {
      name: "Field of Work",
      level: 3, // 0=locked, 1=common, 2=specialized, 3=highly specialized
      unlocked: true,
      icon: "🔧",
    },
    citizenship: {
      name: "Country of Citizenship",
      level: 1, // 0=locked, 1=restricted countries, 2=most countries, 3=priority countries
      unlocked: true,
      icon: "🌍",
    },
    investment: {
      name: "Investment Amount",
      level: 2, // 0=locked, 1=$50k-$100k, 2=$100k-$500k, 3=$500k+
      unlocked: false, // Currently locked
      icon: "💰",
    },
    language: {
      name: "English Proficiency",
      level: 4, // 0-5 scale
      unlocked: true,
      icon: "🗣️",
    },
  },
};

// ============================================================================
// VISA PATHS DATA
// ============================================================================
// Define all visa types, their requirements, and visual position on the map
// Requirements map to skill levels above

export const visaPaths = [
  {
    id: "f1",
    name: "F-1 Student",
    emoji: "🎓",
    description: "Study at a U.S. university",
    fullDescription:
      "The F-1 visa is for international students pursuing academic degrees at accredited U.S. institutions.",
    category: "Education",
    // CUSTOMIZE: Adjust requirements to match your visa logic
    requirements: {
      education: { min: 1 }, // Requires at least high school
      citizenship: { min: 0 }, // No citizenship restrictions
      language: { min: 2 }, // Requires some English proficiency
    },
    // Visual position on abstract map (0-100 scale)
    position: { x: 20, y: 30 },
    // Color for this visa path
    color: "from-blue-400 to-blue-600",
    // Badge style
    badge: "bg-blue-100 text-blue-700",
    relatedVisas: ["h1b", "o1"], // Possible transitions
  },
  {
    id: "h1b",
    name: "H-1B Work",
    emoji: "💼",
    description: "Specialized worker visa",
    fullDescription:
      "Allows U.S. employers to temporarily employ foreign workers in specialty occupations.",
    category: "Work",
    requirements: {
      education: { min: 2 }, // Requires Bachelor's degree
      workExperience: { min: 1 },
      fieldOfWork: { min: 1 },
      citizenship: { min: 0 },
    },
    position: { x: 70, y: 25 },
    color: "from-purple-400 to-purple-600",
    badge: "bg-purple-100 text-purple-700",
    relatedVisas: ["l1", "eb1"],
  },
  {
    id: "o1",
    name: "O-1 Talent",
    emoji: "⭐",
    description: "For individuals with extraordinary ability",
    fullDescription:
      "For individuals who possess extraordinary ability in sciences, arts, education, business, or athletics.",
    category: "Achievement",
    requirements: {
      education: { min: 2 },
      workExperience: { min: 2 },
      fieldOfWork: { min: 2 }, // Requires specialized field
      citizenship: { min: 0 },
    },
    position: { x: 50, y: 65 },
    color: "from-yellow-400 to-orange-500",
    badge: "bg-yellow-100 text-yellow-700",
    relatedVisas: ["eb1"],
  },
  {
    id: "l1",
    name: "L-1 Transfer",
    emoji: "🚀",
    description: "Intracompany transfer visa",
    fullDescription:
      "For managers and specialized knowledge workers transferring within the same company to a U.S. office.",
    category: "Work",
    requirements: {
      workExperience: { min: 2 },
      fieldOfWork: { min: 1 },
      citizenship: { min: 0 },
    },
    position: { x: 75, y: 50 },
    color: "from-green-400 to-green-600",
    badge: "bg-green-100 text-green-700",
    relatedVisas: ["h1b", "eb1"],
  },
  {
    id: "eb1",
    name: "EB-1 Green Card",
    emoji: "🏆",
    description: "Employment-based green card",
    fullDescription:
      "Permanent residency for individuals with extraordinary ability or advanced degree holders.",
    category: "Permanent",
    requirements: {
      education: { min: 2 },
      workExperience: { min: 3 },
      fieldOfWork: { min: 2 },
      citizenship: { min: 0 },
    },
    position: { x: 50, y: 80 },
    color: "from-red-400 to-red-600",
    badge: "bg-red-100 text-red-700",
    relatedVisas: [],
  },
  {
    id: "e2",
    name: "E-2 Investor",
    emoji: "💎",
    description: "Investor visa for treaty countries",
    fullDescription:
      "For investors and treaty traders from designated countries making significant U.S. investments.",
    category: "Investment",
    requirements: {
      investment: { min: 1 }, // Requires investment capital
      citizenship: { min: 1 }, // Must be from eligible country
    },
    position: { x: 25, y: 70 },
    color: "from-pink-400 to-pink-600",
    badge: "bg-pink-100 text-pink-700",
    relatedVisas: ["l1"],
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
