/**
 * VISA KNOWLEDGE BASE
 * 
 * ============================================================================
 * AUTHORITATIVE SOURCE OF TRUTH FOR U.S. VISA INFORMATION
 * ============================================================================
 * 
 * This file contains structured data for all major U.S. visa categories.
 * Each visa includes real-world eligibility criteria, requirements, and process steps.
 * 
 * DATA OWNERSHIP & UPDATE PROCESS:
 * - Source: USCIS.gov, State Department, actual visa regulations
 * - Manual updates required: Update this file whenever visa rules change
 * - No AI-generated claims: All information backed by official sources
 * - Version control: Track changes via git commits with "visa-kb:" prefix
 * 
 * STRUCTURE:
 * Each visa object contains:
 * - Identifier: id, code, emoji
 * - Metadata: name, category, tier, officialDescription
 * - Eligibility: rules (array of conditions users must meet)
 * - Requirements: documents, steps, timeline
 * - Connections: commonNextSteps (for map navigation)
 * - Links: officialLinks (to USCIS/State Dept)
 * - Guidance: typicalProfile (who uses this visa most)
 * 
 * ============================================================================
 */

/**
 * Citizenship Restriction Categories
 * Maps actual countries to internal restriction levels
 * Used by matching engine to check country-based restrictions
 */
export const CITIZENSHIP_RESTRICTIONS = {
  // Countries typically unrestricted (most visas available)
  unrestricted: [
    'CA', 'AU', 'NZ', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK',
    'JP', 'KR', 'SG', 'TH', 'MX', 'BR', 'AR', 'CL', 'CO', 'IN', 'UA', 'IL',
    'ZA', 'AE', 'SA', 'KZ', 'TR', 'GR', 'CZ', 'PL', 'HU', 'RO', 'PT', 'IE',
  ],
  // Countries with some restrictions (H-1B cap exempt, but others limited)
  restricted: [
    'CN', 'RU', 'IR', 'SY', 'KP', 'CU', // High restriction
    'VN', 'ID', 'PK', 'BD', 'NG', 'EG', // Medium restriction
  ],
  // U.S. Nationals (AS citizenship)
  usNational: ['AS'],
} as const;

/**
 * Get citizenship restriction category for a country code
 * Returns 'unrestricted' if country not explicitly listed in restricted categories
 */
export function getCitizenshipRestrictionCategory(
  countryCode: string
): 'unrestricted' | 'restricted' | 'usNational' {
  if (CITIZENSHIP_RESTRICTIONS.usNational.includes(countryCode as any)) {
    return 'usNational';
  }
  if (CITIZENSHIP_RESTRICTIONS.restricted.includes(countryCode as any)) {
    return 'restricted';
  }
  return 'unrestricted';
}

/**
 * ============================================================================
 * VISA DEFINITIONS - COMPREHENSIVE KNOWLEDGE BASE
 * ============================================================================
 * 
 * Each visa includes eligibility rules that the matching engine evaluates.
 * Rules are deterministic conditions (not AI).
 * 
 * RULE SYNTAX:
 * - Most rules reference user profile fields: educationLevel, yearsOfExperience, etc.
 * - Some rules reference computed properties like: citizenshipRestrictionCategory
 * - The matching engine evaluates ALL rules for each visa and reports:
 *   - "recommended" if most/all rules pass
 *   - "available" if many rules pass (but not all)
 *   - "locked" if few rules pass
 */

export interface VisaEligibilityRule {
  field: string; // e.g., "educationLevel", "yearsOfExperience", "citizenshipRestrictionCategory"
  operator: 'gte' | 'lte' | 'eq' | 'includes' | 'excludes';
  value: number | string | string[];
  description: string; // Human-readable explanation
}

export interface VisaRequirement {
  category: string; // e.g., "document", "processing", "financial"
  item: string;
  description?: string;
}

export interface VisaProcessStep {
  order: number;
  title: string;
  description: string;
  estimatedTime?: string;
}

export interface VisaDefinition {
  // IDENTIFIERS
  id: string; // lowercase, no spaces: "f1", "h1b", "eb2gc"
  code: string; // Official visa code: "F-1", "H-1B", "EB-2"
  name: string; // Full name: "F-1 Student Visa"
  emoji: string; // Visual identifier

  // CATEGORIZATION
  category: 'student' | 'worker' | 'visitor' | 'investor' | 'immigrant' | 'family' | 'special' | 'tourist';
  tier: 'start' | 'entry' | 'intermediate' | 'advanced';

  // DESCRIPTIONS
  officialDescription: string; // From USCIS/State Dept
  shortDescription: string; // One sentence for UI
  typicalProfile: string; // "International students pursuing degrees", etc.

  // ELIGIBILITY (Rules evaluated by matching engine)
  eligibilityRules: VisaEligibilityRule[];

  // REQUIREMENTS
  requirements: {
    documents: VisaRequirement[];
    processing: VisaRequirement[];
    financial: VisaRequirement[];
    medical?: VisaRequirement[];
    security?: VisaRequirement[];
  };

  // PROCESS
  processSteps: VisaProcessStep[];
  estimatedTotalTime: string; // e.g., "4-6 weeks"

  // CONNECTIONS (for map navigation)
  commonNextSteps: {
    visaId: string;
    reason: string; // e.g., "after graduation", "work authorization", "green card path"
  }[];
  commonPreviousVisas: string[]; // What visas commonly lead here

  // EXTERNAL RESOURCES
  officialLinks: {
    label: string;
    url: string;
  }[];

  // MAP POSITIONING & DIFFICULTY
  /** Time horizon: "short" (~6mo-1yr), "medium" (1-3yr), "long" (3+ yr / permanent) */
  timeHorizon: 'short' | 'medium' | 'long';
  
  /** Difficulty to obtain: 1=easy, 2=moderate, 3=hard */
  difficulty: 1 | 2 | 3;
  
  /** Profile match score required (0-100) to be "recommended" */
  requiredEligibilityScore: number;

  // METADATA
  notes: string; // Special considerations, exceptions, etc.
}

// ============================================================================
// VISA DEFINITIONS
// ============================================================================

export const VISA_KNOWLEDGE_BASE: Record<string, VisaDefinition> = {
  // ========================================================================
  // STARTING POINT (for users without a visa)
  // ========================================================================

  start: {
    id: 'start',
    code: 'START',
    name: 'Starting Point',
    emoji: '🚀',
    category: 'special',
    tier: 'start',
    officialDescription: 'Starting point for visa journey - explore your options',
    shortDescription: 'Begin your U.S. visa journey',
    typicalProfile: 'Individuals exploring U.S. visa options',
    eligibilityRules: [],
    requirements: {
      documents: [],
      processing: [],
      financial: [],
    },
    processSteps: [],
    estimatedTotalTime: 'N/A',
    commonNextSteps: [
      { visaId: 'f1', reason: 'Study at a U.S. university' },
      { visaId: 'j1', reason: 'Participate in exchange programs' },
    ],
    commonPreviousVisas: [],
    officialLinks: [],
    notes: 'This is a placeholder node for users who have not yet obtained a U.S. visa.',
    timeHorizon: 'short',
    difficulty: 1,
    requiredEligibilityScore: 0,
  },

  // ========================================================================
  // ENTRY-LEVEL: Student & Exchange Visitors
  // ========================================================================

  f1: {
    id: 'f1',
    code: 'F-1',
    name: 'F-1 Student Visa',
    emoji: '🎓',
    category: 'student',
    tier: 'entry',
    officialDescription:
      'The F-1 visa is for international students pursuing academic degrees at accredited U.S. institutions. Students may work on campus and, after graduation, complete Optional Practical Training (OPT) to gain work experience.',
    shortDescription: 'Study at a U.S. university or college',
    typicalProfile:
      'International students pursuing undergraduate, graduate, or professional degrees at accredited U.S. schools.',
    eligibilityRules: [
      {
        field: 'educationLevel',
        operator: 'gte',
        value: 1,
        description: 'High school diploma or equivalent required',
      },
      {
        field: 'englishProficiency',
        operator: 'gte',
        value: 2,
        description: 'English proficiency (TOEFL/IELTS) typically required',
      },
      {
        field: 'citizenshipRestrictionCategory',
        operator: 'excludes',
        value: ['usNational'],
        description: 'Must be a foreign national (not U.S. citizen/national)',
      },
    ],
    requirements: {
      documents: [
        { category: 'document', item: 'I-20 form', description: 'From school certifying admission' },
        {
          category: 'document',
          item: 'Valid passport',
          description: 'Valid for at least 6 months beyond intended stay',
        },
        {
          category: 'document',
          item: 'School acceptance letter',
          description: 'From an accredited U.S. institution',
        },
      ],
      processing: [
        { category: 'processing', item: 'SEVIS registration' },
        { category: 'processing', item: 'Visa interview at embassy' },
      ],
      financial: [
        {
          category: 'financial',
          item: 'Proof of financial support',
          description: 'Sufficient funds to cover tuition and living expenses',
        },
      ],
    },
    processSteps: [
      { order: 1, title: 'School Acceptance', description: 'Get admitted to accredited U.S. school' },
      {
        order: 2,
        title: 'I-20 Receipt',
        description: 'School issues I-20 form after financial verification',
      },
      {
        order: 3,
        title: 'SEVIS Registration',
        description: 'Register in SEVIS system (fee ~$350)',
        estimatedTime: '1-2 weeks',
      },
      {
        order: 4,
        title: 'Visa Application',
        description: 'Complete DS-160 form and schedule visa interview',
      },
      { order: 5, title: 'Visa Interview', description: 'Attend interview at U.S. embassy/consulate' },
    ],
    estimatedTotalTime: '4-8 weeks',
    commonNextSteps: [
      { visaId: 'opt', reason: 'After graduation to gain work experience' },
      { visaId: 'h1b', reason: 'After OPT to transition to permanent work visa' },
      { visaId: 'eb2gc', reason: 'Long-term: Through employer sponsorship for green card' },
    ],
    commonPreviousVisas: ['b2'],
    officialLinks: [
      { label: 'USCIS F-1 Information', url: 'https://www.uscis.gov/i-901' },
      {
        label: 'State Department Student Visa',
        url: 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html',
      },
    ],
    notes: 'F-1 students can work up to 20 hours/week on campus during school and full-time during breaks. After graduation, eligible for Optional Practical Training (OPT).',
    timeHorizon: 'short',
    difficulty: 1,
    requiredEligibilityScore: 40,
  },

  j1: {
    id: 'j1',
    code: 'J-1',
    name: 'J-1 Exchange Visitor Visa',
    emoji: '🌍',
    category: 'student',
    tier: 'entry',
    officialDescription:
      'The J-1 visa is for exchange visitors participating in U.S. exchange programs, including students, scholars, researchers, and professionals.',
    shortDescription: 'Participate in educational exchange programs',
    typicalProfile:
      'International students, scholars, and professionals participating in approved exchange visitor programs.',
    eligibilityRules: [
      {
        field: 'educationLevel',
        operator: 'gte',
        value: 1,
        description: 'High school diploma or equivalent',
      },
      {
        field: 'citizenshipRestrictionCategory',
        operator: 'excludes',
        value: ['usNational'],
        description: 'Must be a foreign national',
      },
    ],
    requirements: {
      documents: [
        { category: 'document', item: 'DS-2019 form', description: 'From sponsoring exchange organization' },
        { category: 'document', item: 'Valid passport', description: 'Valid for at least 6 months' },
      ],
      processing: [
        { category: 'processing', item: 'SEVIS registration (J-1)' },
        { category: 'processing', item: 'Visa interview at embassy' },
      ],
      financial: [
        {
          category: 'financial',
          item: 'Proof of financial support',
          description: 'For duration of program',
        },
      ],
    },
    processSteps: [
      { order: 1, title: 'Program Acceptance', description: 'Get accepted to approved J-1 program' },
      {
        order: 2,
        title: 'DS-2019 Receipt',
        description: 'Sponsor issues DS-2019 form',
        estimatedTime: '1-2 weeks',
      },
      { order: 3, title: 'Visa Application', description: 'Complete DS-160 form' },
      { order: 4, title: 'Visa Interview', description: 'Attend interview at U.S. embassy' },
    ],
    estimatedTotalTime: '4-8 weeks',
    commonNextSteps: [
      { visaId: 'h1b', reason: 'Transition to work visa after exchange program' },
    ],
    commonPreviousVisas: [],
    officialLinks: [
      {
        label: 'State Department Exchange Visitor Program',
        url: 'https://travel.state.gov/content/travel/en/us-visas/student/exchange-visitor-program.html',
      },
    ],
    notes: 'Some J-1 visas have a two-year home country residency requirement. Check before applying.',
    timeHorizon: 'short',
    difficulty: 1,
    requiredEligibilityScore: 40,
  },

  b2: {
    id: 'b2',
    code: 'B-2',
    name: 'B-2 Tourist Visa',
    emoji: '✈️',
    category: 'visitor',
    tier: 'entry',
    officialDescription:
      'The B-2 visa is for tourists, visitors, and those traveling to the U.S. for leisure, medical treatment, or visiting family.',
    shortDescription: 'Visit the U.S. as a tourist or for short-term purposes',
    typicalProfile: 'International tourists, vacation travelers, and short-term visitors.',
    eligibilityRules: [
      {
        field: 'citizenshipRestrictionCategory',
        operator: 'excludes',
        value: ['usNational'],
        description: 'Must be a foreign national',
      },
    ],
    requirements: {
      documents: [
        { category: 'document', item: 'Valid passport', description: 'Valid for at least 6 months' },
      ],
      processing: [{ category: 'processing', item: 'Visa interview at embassy (may be waived)' }],
      financial: [
        {
          category: 'financial',
          item: 'Proof of funds',
          description: 'For intended stay and return travel',
        },
      ],
    },
    processSteps: [
      { order: 1, title: 'Visa Application', description: 'Complete DS-160 form' },
      {
        order: 2,
        title: 'Visa Interview',
        description: 'Attend interview (if required based on country)',
      },
      { order: 3, title: 'Visa Issuance', description: 'Receive B-2 visa in passport' },
    ],
    estimatedTotalTime: '2-4 weeks',
    commonNextSteps: [],
    commonPreviousVisas: [],
    officialLinks: [
      {
        label: 'State Department Tourist Visa',
        url: 'https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html',
      },
    ],
    notes: 'B-2 visa holders cannot work in the U.S. Maximum initial stay is 6 months.',
    timeHorizon: 'short',
    difficulty: 1,
    requiredEligibilityScore: 30,
  },

  // ========================================================================
  // INTERMEDIATE: Work Experience & Training
  // ========================================================================

  opt: {
    id: 'opt',
    code: 'OPT',
    name: 'Optional Practical Training',
    emoji: '💼',
    category: 'worker',
    tier: 'intermediate',
    officialDescription:
      'Optional Practical Training (OPT) allows F-1 students to work in the U.S. for up to 12 months (or 36 months for STEM fields) after graduation to gain work experience related to their field of study.',
    shortDescription: 'Work experience after F-1 graduation',
    typicalProfile: 'F-1 students who have completed their degree and want to work in the U.S.',
    eligibilityRules: [
      {
        field: 'previousVisa',
        operator: 'eq',
        value: 'f1',
        description: 'Must be F-1 student who completed degree',
      },
      {
        field: 'educationLevel',
        operator: 'gte',
        value: 2,
        description: 'At least bachelors degree completed',
      },
    ],
    requirements: {
      documents: [
        { category: 'document', item: 'I-20 with OPT recommendation' },
        { category: 'document', item: 'EAD (Employment Authorization Document)' },
      ],
      processing: [
        { category: 'processing', item: 'File I-765 application' },
        { category: 'processing', item: 'EAD approval' },
      ],
      financial: [
        {
          category: 'financial',
          item: 'Job offer or self-employment',
          description: 'Must have authorized work lined up',
        },
      ],
    },
    processSteps: [
      { order: 1, title: 'Degree Completion', description: 'Complete F-1 studies' },
      { order: 2, title: 'School Certification', description: 'Get school to recommend OPT' },
      { order: 3, title: 'I-765 Filing', description: 'File Form I-765 for work authorization' },
      { order: 4, title: 'EAD Approval', description: 'Receive Employment Authorization Document' },
    ],
    estimatedTotalTime: '3-4 months',
    commonNextSteps: [
      { visaId: 'h1b', reason: 'Transition to H-1B work visa for continued employment' },
    ],
    commonPreviousVisas: ['f1'],
    officialLinks: [
      {
        label: 'USCIS OPT Information',
        url: 'https://www.uscis.gov/i-765',
      },
    ],
    notes: 'STEM graduates can extend OPT to 36 months total. Multiple OPT periods allowed.',
    timeHorizon: 'short',
    difficulty: 1,
    requiredEligibilityScore: 60,
  },

  h1b: {
    id: 'h1b',
    code: 'H-1B',
    name: 'H-1B Specialty Occupation Worker Visa',
    emoji: '💼',
    category: 'worker',
    tier: 'intermediate',
    officialDescription:
      'The H-1B visa is for foreign workers employed in specialty occupations that require at least a bachelor\'s degree. Common fields include IT, engineering, and healthcare.',
    shortDescription: 'Work in the U.S. in specialty occupation roles',
    typicalProfile: 'Software engineers, healthcare professionals, and other specialty workers with bachelor\'s degrees.',
    eligibilityRules: [
      {
        field: 'educationLevel',
        operator: 'gte',
        value: 2,
        description: 'Bachelor\'s degree or higher required',
      },
      {
        field: 'englishProficiency',
        operator: 'gte',
        value: 2,
        description: 'Good English proficiency required',
      },
      {
        field: 'citizenshipRestrictionCategory',
        operator: 'excludes',
        value: ['usNational'],
        description: 'Must be foreign national',
      },
    ],
    requirements: {
      documents: [
        { category: 'document', item: 'LCA (Labor Condition Application)', description: 'Employer files with DOL' },
        { category: 'document', item: 'I-129 petition', description: 'Employer files with USCIS' },
        { category: 'document', item: 'Bachelor\'s degree or equivalent', description: 'Verified transcripts' },
      ],
      processing: [
        { category: 'processing', item: 'LCA filing and approval' },
        { category: 'processing', item: 'I-129 petition filing' },
        { category: 'processing', item: 'RFE response (if needed)' },
        { category: 'processing', item: 'Visa stamping at embassy (if applicable)' },
      ],
      financial: [
        {
          category: 'financial',
          item: 'Prevailing wage requirement',
          description: 'Employer must pay prevailing wage for position',
        },
      ],
    },
    processSteps: [
      { order: 1, title: 'Job Offer', description: 'Receive job offer from U.S. employer' },
      { order: 2, title: 'LCA Filing', description: 'Employer files Labor Condition Application' },
      { order: 3, title: 'I-129 Petition', description: 'Employer files I-129 petition with USCIS' },
      { order: 4, title: 'Processing', description: 'USCIS reviews petition (can take 1-6 months)' },
      { order: 5, title: 'Visa Stamping', description: 'May need visa interview for stamping' },
    ],
    estimatedTotalTime: '3-6 months',
    commonNextSteps: [
      {
        visaId: 'l1b',
        reason: 'Alternative work visa for intracompany transfer',
      },
      {
        visaId: 'eb2gc',
        reason: 'Green card sponsorship after working 1-2 years',
      },
    ],
    commonPreviousVisas: ['f1', 'opt', 'j1'],
    officialLinks: [
      { label: 'USCIS H-1B Information', url: 'https://www.uscis.gov/h-1b' },
    ],
    notes: 'H-1B has annual cap (65,000 + 20,000 advanced degree exemption). Filing opens in March for October start. Lottery system used when applications exceed cap.',
    timeHorizon: 'medium',
    difficulty: 2,
    requiredEligibilityScore: 70,
  },

  l1b: {
    id: 'l1b',
    code: 'L-1B',
    name: 'L-1B Intracompany Transfer (Specialized Knowledge)',
    emoji: '🚀',
    category: 'worker',
    tier: 'intermediate',
    officialDescription:
      'The L-1B visa is for employees with specialized knowledge being transferred to a U.S. office of the same company.',
    shortDescription: 'Transfer to U.S. office with specialized company knowledge',
    typicalProfile:
      'Managers, specialized technical staff, and company experts transferring to U.S. operations.',
    eligibilityRules: [
      {
        field: 'yearsOfExperience',
        operator: 'gte',
        value: 1,
        description: 'At least 1 year with company abroad',
      },
      {
        field: 'englishProficiency',
        operator: 'gte',
        value: 2,
        description: 'Good English proficiency',
      },
    ],
    requirements: {
      documents: [
        { category: 'document', item: 'I-129 petition' },
        { category: 'document', item: 'Company documentation', description: 'Organizational charts, contracts' },
      ],
      processing: [
        { category: 'processing', item: 'I-129 petition filing' },
      ],
      financial: [],
    },
    processSteps: [
      { order: 1, title: 'Company Transfer Decision', description: 'Company decides to transfer employee' },
      { order: 2, title: 'I-129 Petition', description: 'Company files I-129 petition' },
      { order: 3, title: 'Processing', description: 'USCIS reviews petition' },
    ],
    estimatedTotalTime: '2-4 months',
    commonNextSteps: [
      { visaId: 'eb1c', reason: 'Green card sponsorship as intracompany transferee manager' },
    ],
    commonPreviousVisas: [],
    officialLinks: [
      { label: 'USCIS L-1 Information', url: 'https://www.uscis.gov/l-1' },
    ],
    notes: 'L-1B has no annual cap. Spouse can get L-2 and work with EAD. Valid for up to 7 years.',
    timeHorizon: 'medium',
    difficulty: 2,
    requiredEligibilityScore: 65,
  },

  o1: {
    id: 'o1',
    code: 'O-1',
    name: 'O-1 Individual of Extraordinary Ability',
    emoji: '⭐',
    category: 'worker',
    tier: 'advanced',
    officialDescription:
      'The O-1 visa is for individuals with extraordinary ability in the sciences, arts, education, business, or athletics.',
    shortDescription: 'Work visa for individuals with extraordinary ability',
    typicalProfile:
      'Renowned scientists, artists, athletes, executives, and other individuals with national/international recognition.',
    eligibilityRules: [
      {
        field: 'englishProficiency',
        operator: 'gte',
        value: 2,
        description: 'English proficiency required',
      },
    ],
    requirements: {
      documents: [
        { category: 'document', item: 'Evidence of extraordinary ability', description: 'National/international awards, recognition, publication' },
        { category: 'document', item: 'Petitioner support letter', description: 'From employer or agent' },
      ],
      processing: [
        { category: 'processing', item: 'I-129 petition filing' },
      ],
      financial: [],
    },
    processSteps: [
      { order: 1, title: 'Evidence Compilation', description: 'Gather evidence of extraordinary ability' },
      { order: 2, title: 'Petition Preparation', description: 'Prepare and file I-129 petition' },
      { order: 3, title: 'USCIS Review', description: 'USCIS reviews extraordinary ability criteria' },
    ],
    estimatedTotalTime: '2-4 months',
    commonNextSteps: [
      { visaId: 'eb1a', reason: 'Green card as extraordinary ability immigrant' },
    ],
    commonPreviousVisas: [],
    officialLinks: [
      { label: 'USCIS O-1 Information', url: 'https://www.uscis.gov/o-1' },
    ],
    notes: 'No numerical limitations. Requires substantial evidence of extraordinary ability (not just national success).',
    timeHorizon: 'long',
    difficulty: 3,
    requiredEligibilityScore: 80,
  },

  // ========================================================================
  // ADVANCED: Investment & Business
  // ========================================================================

  eb5: {
    id: 'eb5',
    code: 'EB-5',
    name: 'Employment-Based Fifth Preference (Investor)',
    emoji: '💰',
    category: 'investor',
    tier: 'advanced',
    officialDescription:
      'The EB-5 visa provides a path to permanent residency for investors who create jobs in the U.S. Requires investment of $1,050,000 (or $787,500 in Targeted Employment Areas).',
    shortDescription: 'Green card through U.S. investment and job creation',
    typicalProfile:
      'High-net-worth individuals seeking permanent residency through investment in U.S. businesses or projects.',
    eligibilityRules: [
      {
        field: 'investmentAmount',
        operator: 'gte',
        value: 787500,
        description: 'Investment of at least $787,500 (TEA) or $1,050,000',
      },
    ],
    requirements: {
      documents: [
        { category: 'document', item: 'I-526 petition' },
        { category: 'document', item: 'Proof of investment funds', description: 'Bank statements, financial statements' },
        { category: 'document', item: 'Job creation plan', description: 'How investment will create 10+ jobs' },
      ],
      processing: [
        { category: 'processing', item: 'I-526 petition filing' },
        { category: 'processing', item: 'Conditional green card issuance' },
        { category: 'processing', item: 'I-829 petition for permanent status' },
      ],
      financial: [
        {
          category: 'financial',
          item: 'Investment capital',
          description: '$787,500 - $1,050,000 depending on location',
        },
      ],
    },
    processSteps: [
      {
        order: 1,
        title: 'Investment Selection',
        description: 'Select EB-5 project (direct or regional center)',
      },
      { order: 2, title: 'I-526 Filing', description: 'File I-526 immigrant petition' },
      { order: 3, title: 'Conditional Green Card', description: 'Receive conditional green card (2 years)' },
      { order: 4, title: 'Job Verification', description: 'Verify job creation during conditional period' },
      { order: 5, title: 'I-829 Filing', description: 'File to remove conditions and gain permanent status' },
    ],
    estimatedTotalTime: '2-4 years',
    commonNextSteps: [
      { visaId: 'us_citizenship', reason: 'Path to U.S. citizenship after 5 years' },
    ],
    commonPreviousVisas: [],
    officialLinks: [
      { label: 'USCIS EB-5 Information', url: 'https://www.uscis.gov/eb-5' },
    ],
    notes: 'Requires significant capital and commitment. Processing times vary. Consider hiring immigration attorney.',
    timeHorizon: 'long',
    difficulty: 3,
    requiredEligibilityScore: 90,
  },

  // ========================================================================
  // ADVANCED: Employment-Based Green Cards
  // ========================================================================

  eb2gc: {
    id: 'eb2gc',
    code: 'EB-2',
    name: 'Employment-Based Second Preference Green Card',
    emoji: '🏆',
    category: 'immigrant',
    tier: 'advanced',
    officialDescription:
      'EB-2 green card for professionals with advanced degrees or exceptional ability. Requires employer sponsorship and labor certification.',
    shortDescription: 'Green card through employer sponsorship with advanced degree',
    typicalProfile:
      'Engineers, scientists, and IT professionals with master\'s degrees or advanced education sponsored by employers.',
    eligibilityRules: [
      {
        field: 'educationLevel',
        operator: 'gte',
        value: 3,
        description: 'Master\'s degree or equivalent work experience',
      },
      {
        field: 'yearsOfExperience',
        operator: 'gte',
        value: 2,
        description: 'At least 2 years relevant work experience',
      },
    ],
    requirements: {
      documents: [
        { category: 'document', item: 'Labor Certification', description: 'PERM from Department of Labor' },
        { category: 'document', item: 'I-140 petition', description: 'Immigrant petition' },
        { category: 'document', item: 'I-485 application', description: 'Green card application' },
      ],
      processing: [
        { category: 'processing', item: 'PERM labor certification' },
        { category: 'processing', item: 'I-140 petition' },
        { category: 'processing', item: 'I-485 application and interview' },
      ],
      financial: [],
    },
    processSteps: [
      { order: 1, title: 'Employer Sponsorship', description: 'Employer commits to sponsoring green card' },
      { order: 2, title: 'PERM Labor Cert', description: 'File PERM labor certification (6-24 months)' },
      { order: 3, title: 'I-140 Petition', description: 'File I-140 immigrant petition' },
      { order: 4, title: 'Priority Date', description: 'Wait for priority date to become current' },
      { order: 5, title: 'I-485 Application', description: 'File I-485 and attend interview' },
    ],
    estimatedTotalTime: '2-4 years',
    commonNextSteps: [
      { visaId: 'us_citizenship', reason: 'Path to U.S. citizenship after 5 years' },
    ],
    commonPreviousVisas: ['h1b', 'opt', 'l1b'],
    officialLinks: [
      { label: 'USCIS EB-2 Information', url: 'https://www.uscis.gov/eb-2' },
    ],
    notes: 'Currently retrogressed for most countries. Processing time varies significantly by country and preference category.',
    timeHorizon: 'long',
    difficulty: 2,
    requiredEligibilityScore: 70,
  },

  eb1a: {
    id: 'eb1a',
    code: 'EB-1A',
    name: 'Employment-Based First Preference (Extraordinary Ability)',
    emoji: '⭐',
    category: 'immigrant',
    tier: 'advanced',
    officialDescription:
      'EB-1A green card for individuals with extraordinary ability in sciences, arts, education, business, or athletics.',
    shortDescription: 'Green card as person of extraordinary ability',
    typicalProfile:
      'Renowned scientists, artists, athletes, and business leaders with national/international recognition.',
    eligibilityRules: [
      {
        field: 'englishProficiency',
        operator: 'gte',
        value: 2,
        description: 'English proficiency',
      },
    ],
    requirements: {
      documents: [
        { category: 'document', item: 'Evidence of extraordinary ability', description: 'Awards, publications, international recognition' },
        { category: 'document', item: 'I-140 petition', description: 'Immigrant petition' },
      ],
      processing: [
        { category: 'processing', item: 'I-140 filing and approval' },
        { category: 'processing', item: 'I-485 application (if not adjusted)' },
      ],
      financial: [],
    },
    processSteps: [
      { order: 1, title: 'Evidence Compilation', description: 'Gather evidence of extraordinary ability' },
      { order: 2, title: 'I-140 Petition', description: 'File I-140 immigrant petition' },
      { order: 3, title: 'Approval', description: 'USCIS approves I-140' },
      { order: 4, title: 'I-485 Application', description: 'File I-485 if needed or consular processing' },
    ],
    estimatedTotalTime: '1-2 years',
    commonNextSteps: [
      { visaId: 'us_citizenship', reason: 'Path to U.S. citizenship after 5 years' },
    ],
    commonPreviousVisas: ['o1'],
    officialLinks: [
      { label: 'USCIS EB-1A Information', url: 'https://www.uscis.gov/eb-1' },
    ],
    notes: 'No labor certification required. No numerical limitations. Faster processing than other employment-based categories.',
    timeHorizon: 'long',
    difficulty: 3,
    requiredEligibilityScore: 85,
  },

  eb1c: {
    id: 'eb1c',
    code: 'EB-1C',
    name: 'Employment-Based First Preference (Multinational Manager/Executive)',
    emoji: '🏢',
    category: 'immigrant',
    tier: 'advanced',
    officialDescription:
      'EB-1C green card for managers and executives with 1+ years of experience at the same company abroad being transferred to U.S. office.',
    shortDescription: 'Green card as manager/executive through intracompany transfer',
    typicalProfile:
      'Managers and executives from multinational companies transferring to U.S. operations.',
    eligibilityRules: [
      {
        field: 'yearsOfExperience',
        operator: 'gte',
        value: 1,
        description: 'At least 1 year as manager/executive abroad',
      },
    ],
    requirements: {
      documents: [
        { category: 'document', item: 'I-140 petition' },
        { category: 'document', item: 'Company documentation', description: 'Organizational structure, employment history' },
      ],
      processing: [
        { category: 'processing', item: 'I-140 filing' },
        { category: 'processing', item: 'I-485 application' },
      ],
      financial: [],
    },
    processSteps: [
      { order: 1, title: 'Company Documentation', description: 'Gather company records and proof of managerial role' },
      { order: 2, title: 'I-140 Filing', description: 'File I-140 immigrant petition' },
      { order: 3, title: 'I-485 Application', description: 'File I-485 green card application' },
      { order: 4, title: 'Interview', description: 'Attend green card interview' },
    ],
    estimatedTotalTime: '1-2 years',
    commonNextSteps: [
      { visaId: 'us_citizenship', reason: 'Path to U.S. citizenship after 5 years' },
    ],
    commonPreviousVisas: ['l1b'],
    officialLinks: [
      { label: 'USCIS EB-1C Information', url: 'https://www.uscis.gov/eb-1' },
    ],
    notes: 'No labor certification required. No numerical limitations. Requires continuous 1-year employment abroad within 3 years preceding petition.',
    timeHorizon: 'long',
    difficulty: 2,
    requiredEligibilityScore: 75,
  },

  // ========================================================================
  // ENDPOINT: Citizenship
  // ========================================================================

  us_citizenship: {
    id: 'us_citizenship',
    code: 'NATURALIZATION',
    name: 'U.S. Citizenship',
    emoji: '🇺🇸',
    category: 'immigrant',
    tier: 'advanced',
    officialDescription:
      'U.S. Citizenship can be obtained through naturalization after holding permanent residency (green card) for 5 years (or 3 years if married to U.S. citizen).',
    shortDescription: 'Become a U.S. citizen',
    typicalProfile:
      'Permanent residents (green card holders) seeking to become U.S. citizens.',
    eligibilityRules: [
      {
        field: 'yearsOfExperience',
        operator: 'gte',
        value: 5,
        description: 'At least 5 years as permanent resident (green card)',
      },
      {
        field: 'englishProficiency',
        operator: 'gte',
        value: 2,
        description: 'English proficiency required',
      },
    ],
    requirements: {
      documents: [
        { category: 'document', item: 'Form N-400', description: 'Application for Naturalization' },
        { category: 'document', item: 'Proof of permanent residency', description: 'Green card' },
        { category: 'document', item: 'Tax returns', description: 'Last 5 years' },
      ],
      processing: [
        { category: 'processing', item: 'N-400 filing' },
        { category: 'processing', item: 'Biometrics appointment' },
        { category: 'processing', item: 'Citizenship interview and test' },
        { category: 'processing', item: 'Oath of allegiance ceremony' },
      ],
      financial: [],
    },
    processSteps: [
      { order: 1, title: 'Eligibility Check', description: 'Ensure 5 years permanent residency requirement met' },
      { order: 2, title: 'N-400 Filing', description: 'File Application for Naturalization' },
      { order: 3, title: 'Biometrics', description: 'Attend biometrics appointment' },
      {
        order: 4,
        title: 'Citizenship Interview',
        description: 'Interview with USCIS officer',
        estimatedTime: '30 minutes',
      },
      { order: 5, title: 'Civics Test', description: 'Answer civics/history questions (100 possible, 60 required)' },
      { order: 6, title: 'Oath Ceremony', description: 'Take oath of allegiance and receive Certificate of Naturalization' },
    ],
    estimatedTotalTime: '8-12 months',
    commonNextSteps: [],
    commonPreviousVisas: ['eb2gc', 'eb1a', 'eb1c', 'eb5'],
    officialLinks: [
      { label: 'USCIS Naturalization', url: 'https://www.uscis.gov/naturalization' },
    ],
    notes: '3-year requirement available for those married to U.S. citizen. English test waived for those 50+ with 20 years residency or 55+ with 15 years residency.',
    timeHorizon: 'long',
    difficulty: 1,
    requiredEligibilityScore: 50,
  },
};

/**
 * Get all visa IDs in order of tier progression
 * Used by matching engine and map rendering
 */
export function getVisasByTier(tier: 'start' | 'entry' | 'intermediate' | 'advanced'): string[] {
  return Object.values(VISA_KNOWLEDGE_BASE)
    .filter((visa) => visa.tier === tier)
    .map((visa) => visa.id);
}

/**
 * Get a specific visa from knowledge base
 */
export function getVisaById(visaId: string): VisaDefinition | undefined {
  return VISA_KNOWLEDGE_BASE[visaId];
}
