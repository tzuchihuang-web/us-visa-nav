// src/data/visaKnowledgeBase.ts

// 高階分類：之後要新增類別，只要加在這裡就好
export type VisaCategory =
  | "student"
  | "work"
  | "exchange"
  | "immigrant"
  | "investment"
  | "other";

// 在地圖上想要用的階層 / 欄位
export type VisaStage =
  | "current"     // 目前簽證（起點）
  | "next"        // 下一步選項
  | "future"      // 中期 / 未來選項
  | "long_term";  // 最終長期目標（例如 Naturalization）

// UI / 資料用的小型結構
export type TimeHorizon = "short" | "medium" | "long";
export type DifficultyLevel = "low" | "medium" | "high";

export type VisaLink = {
  label: string;
  url: string;
};

export type Visa = {
  // 基本資訊
  id: string;                // 內部使用 ID（例如 "F1", "H1B"）
  name: string;              // 完整名稱
  shortName?: string;        // 圖上顯示的簡短名稱（例如 "F-1"）
  category: VisaCategory;
  stage: VisaStage;          // 用來算 Current / Next / Future / Long Term 欄位

  // UI 額外資訊（可選）
  iconEmoji?: string;        // 地圖上用的小 icon
  tags?: string[];           // "STEM", "Degree-based", "Company-sponsored"...

  // 官方資訊 / 說明
  officialDescription: string;
  officialLinks: VisaLink[];

  // 資格與文件（文字版，之後如果要做規則引擎可以再延伸）
  eligibilityCriteria: string[];
  requiredDocuments?: string[];
  typicalProcessSteps?: string[];

  // 視覺與推薦用屬性
  timeHorizon?: TimeHorizon;     // 大致時間軸
  difficulty?: DifficultyLevel;  // 取得難度 (粗略)
  notes?: string;

  // Graph 使用：從這個 visa 可以走到哪些下一步
  commonNextSteps?: string[];    // 存的是其他 visa 的 id，例如 ["OPT", "H1B"]
};


export const VISA_KNOWLEDGE_BASE: Visa[] = [
  // ---------------------------------------------------------------------------
  // Entry / Current
  // ---------------------------------------------------------------------------
  {
    id: "F1",
    shortName: "F-1",
    name: "F-1 Student Visa",
    category: "student",
    stage: "current",
    iconEmoji: "🎓",
    tags: ["student", "degree", "full-time study"],
    officialDescription:
      "The F-1 visa is for individuals who wish to study full-time at an accredited academic institution or language training program in the United States.",
    officialLinks: [
      {
        label: "U.S. Visas - Student (F1/M1)",
        url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
      },
    ],
    eligibilityCriteria: [
      "Accepted by a SEVP-approved U.S. school or university",
      "Enroll as a full-time student",
      "Show sufficient financial support for tuition and living expenses",
      "Maintain a residence abroad with no intent to abandon",
    ],
    requiredDocuments: [
      "Form I-20 issued by the school",
      "SEVIS fee payment receipt",
      "DS-160 confirmation page",
      "Passport valid for travel to the U.S.",
      "Financial documentation",
    ],
    typicalProcessSteps: [
      "Apply and get accepted by a SEVP-approved school",
      "Receive Form I-20 from the school",
      "Pay the SEVIS I-901 fee",
      "Complete DS-160 and schedule visa interview",
      "Attend interview at U.S. embassy or consulate",
    ],
    timeHorizon: "short",
    difficulty: "medium",
    notes:
      "F-1 can often lead to work authorization options such as OPT, and sometimes onward to H-1B, O-1, or employment-based green cards.",
    commonNextSteps: ["OPT", "H1B", "O1", "EB2"],
  },

  // ---------------------------------------------------------------------------
  // Work authorization after study
  // ---------------------------------------------------------------------------
  {
    id: "OPT",
    shortName: "OPT",
    name: "F-1 Optional Practical Training (OPT)",
    category: "work",
    stage: "next",
    iconEmoji: "💼",
    tags: ["work", "post-graduation", "F-1 benefit"],
    officialDescription:
      "Optional Practical Training (OPT) allows eligible F-1 students to work in the U.S. in a field related to their major for up to 12 months, with possible STEM extension.",
    officialLinks: [
      {
        label: "USCIS - F1 Students and OPT",
        url: "https://www.uscis.gov/i-765",
      },
    ],
    eligibilityCriteria: [
      "Maintain F-1 status and be in good academic standing",
      "Employment must be directly related to the major field of study",
      "Apply within USCIS filing windows (pre-completion or post-completion)",
    ],
    requiredDocuments: [
      "Updated Form I-20 with OPT recommendation",
      "Form I-765 (Application for Employment Authorization)",
      "Passport, I-94 record, previous EADs (if any)",
    ],
    typicalProcessSteps: [
      "Discuss OPT timing with designated school official (DSO)",
      "Request OPT recommendation and updated I-20",
      "File Form I-765 with USCIS",
      "Receive EAD card and begin authorized employment",
    ],
    timeHorizon: "short",
    difficulty: "medium",
    notes:
      "OPT is not a separate visa status but a benefit of F-1. It often serves as a bridge to H-1B, O-1, L-1, or employment-based green cards.",
    commonNextSteps: ["H1B", "O1", "L1B", "EB2"],
  },

  // ---------------------------------------------------------------------------
  // H-1B Specialty Occupation
  // ---------------------------------------------------------------------------
  {
    id: "H1B",
    shortName: "H-1B",
    name: "H-1B Specialty Occupation Worker",
    category: "work",
    stage: "next",
    iconEmoji: "📦",
    tags: ["employer-sponsored", "specialty occupation"],
    officialDescription:
      "The H-1B visa allows U.S. employers to temporarily employ foreign workers in specialty occupations that require specialized knowledge and at least a bachelor's degree or equivalent.",
    officialLinks: [
      {
        label: "USCIS - H-1B Specialty Occupations",
        url: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations",
      },
    ],
    eligibilityCriteria: [
      "Job offer from a U.S. employer in a specialty occupation",
      "Position normally requires at least a bachelor's degree or equivalent",
      "Beneficiary has the required degree or equivalent experience",
      "Employer obtains certified Labor Condition Application (LCA)",
    ],
    requiredDocuments: [
      "Approved LCA (Form ETA-9035)",
      "Form I-129 with H classification supplement",
      "Evidence of degree and qualifications",
      "Detailed job offer and description",
    ],
    typicalProcessSteps: [
      "Employer determines H-1B eligibility",
      "Employer files and obtains certified LCA",
      "Employer files Form I-129 with USCIS",
      "If approved, beneficiary applies for visa stamp (if outside U.S.)",
      "Begin H-1B employment on approved start date",
    ],
    timeHorizon: "medium",
    difficulty: "high",
    notes:
      "H-1B is a common path from F-1/OPT to longer-term employment and can lead to employment-based green cards such as EB-2.",
    commonNextSteps: ["EB2", "EB1C"],
  },

  // ---------------------------------------------------------------------------
  // E-2 Treaty Investor
  // ---------------------------------------------------------------------------
  {
    id: "E2",
    shortName: "E-2",
    name: "E-2 Treaty Investor",
    category: "investment",
    stage: "future",
    iconEmoji: "💰",
    tags: ["investment", "treaty country", "business owner"],
    officialDescription:
      "The E-2 visa allows nationals of certain treaty countries to be admitted to the U.S. when investing a substantial amount of capital in a U.S. business.",
    officialLinks: [
      {
        label: "U.S. Visas - Treaty Traders and Investors (E)",
        url: "https://travel.state.gov/content/travel/en/us-visas/employment/treaty-trader-investor-visa-e.html",
      },
    ],
    eligibilityCriteria: [
      "Citizen of a country with which the U.S. maintains a treaty of commerce and navigation",
      "Making a substantial investment in a bona fide U.S. enterprise",
      "Intend to develop and direct the enterprise",
    ],
    requiredDocuments: [
      "Proof of nationality of treaty country",
      "Evidence of substantial investment",
      "Business plan and financial projections",
      "Corporate formation documents",
    ],
    typicalProcessSteps: [
      "Form or acquire a qualifying U.S. business",
      "Invest or be actively in the process of investing",
      "Compile detailed E-2 application package",
      "Apply at U.S. embassy/consulate or via change of status with USCIS",
    ],
    timeHorizon: "medium",
    difficulty: "medium",
    notes:
      "E-2 is not a direct immigrant visa but can be part of a long-term strategy that later transitions to an immigrant category such as EB-2 or EB-1 in some cases.",
    commonNextSteps: ["EB2"],
  },

  // ---------------------------------------------------------------------------
  // L-1B Intracompany Transferee
  // ---------------------------------------------------------------------------
  {
    id: "L1B",
    shortName: "L-1B",
    name: "L-1B Intracompany Transferee – Specialized Knowledge",
    category: "work",
    stage: "future",
    iconEmoji: "🚀",
    tags: ["multinational", "company transfer"],
    officialDescription:
      "The L-1B visa allows a U.S. employer to transfer a professional employee with specialized knowledge from one of its affiliated foreign offices to a U.S. office.",
    officialLinks: [
      {
        label: "USCIS - L-1B Specialized Knowledge",
        url: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/l-1b-specialized-knowledge",
      },
    ],
    eligibilityCriteria: [
      "Qualifying relationship between foreign and U.S. companies",
      "Employee has at least one continuous year of employment abroad with the qualifying organization within the last three years",
      "Employee has specialized knowledge of the organization’s products, services, or processes",
    ],
    requiredDocuments: [
      "Form I-129 with L supplement",
      "Evidence of qualifying corporate relationship",
      "Proof of prior employment and specialized knowledge",
    ],
    typicalProcessSteps: [
      "Employer prepares L-1B petition",
      "File Form I-129 with USCIS",
      "If approved, employee applies for visa stamp (if outside U.S.)",
      "Enter the U.S. and begin L-1B employment",
    ],
    timeHorizon: "medium",
    difficulty: "high",
    notes:
      "L-1B can sometimes be a bridge to multinational manager/executive green cards such as EB-1C, or to EB-2 depending on the profile.",
    commonNextSteps: ["EB1C", "EB2"],
  },

  // ---------------------------------------------------------------------------
  // O-1 Extraordinary Ability
  // ---------------------------------------------------------------------------
  {
    id: "O1",
    shortName: "O-1",
    name: "O-1 Individual with Extraordinary Ability or Achievement",
    category: "work",
    stage: "future",
    iconEmoji: "⭐",
    tags: ["extraordinary ability", "talent", "artist", "researcher"],
    officialDescription:
      "The O-1 visa is for individuals who possess extraordinary ability in the sciences, arts, education, business, or athletics, or who have a demonstrated record of extraordinary achievement in the motion picture or television industry.",
    officialLinks: [
      {
        label: "USCIS - O-1 Visa: Individuals with Extraordinary Ability",
        url: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa-individuals-with-extraordinary-ability-or-achievement",
      },
    ],
    eligibilityCriteria: [
      "Demonstrated extraordinary ability by sustained national or international acclaim",
      "Coming to the U.S. to work in the area of extraordinary ability or achievement",
      "Must have a U.S. employer or agent to file the petition",
    ],
    requiredDocuments: [
      "Form I-129 with O classification supplement",
      "Evidence of awards, publications, media coverage, or other acclaim",
      "Advisory opinion from peer group or labor organization (if required)",
    ],
    typicalProcessSteps: [
      "Gather evidence of extraordinary ability",
      "U.S. employer/agent files Form I-129 with supporting documentation",
      "If approved, apply for visa stamp (if outside U.S.)",
      "Enter and work in the U.S. under O-1 status",
    ],
    timeHorizon: "medium",
    difficulty: "high",
    notes:
      "O-1 status can sometimes be a stepping stone to immigrant categories such as EB-1A or EB-1C, and ultimately to permanent residence.",
    commonNextSteps: ["EB2", "EB1C"],
  },

  // ---------------------------------------------------------------------------
  // EB-2 – Employment-Based Second Preference
  // ---------------------------------------------------------------------------
  {
    id: "EB2",
    shortName: "EB-2",
    name: "EB-2 Employment-Based Immigrant Visa",
    category: "immigrant",
    stage: "future",
    iconEmoji: "🏆",
    tags: ["green card", "advanced degree", "exceptional ability"],
    officialDescription:
      "The EB-2 immigrant visa category is for members of the professions holding an advanced degree or persons of exceptional ability, including some National Interest Waiver (NIW) cases.",
    officialLinks: [
      {
        label: "USCIS - EB-2 Employment-Based Immigration",
        url: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2",
      },
    ],
    eligibilityCriteria: [
      "Job offer requiring an advanced degree or equivalent, or",
      "Evidence of exceptional ability in the sciences, arts, or business",
      "Approved PERM labor certification in most cases, unless NIW",
    ],
    requiredDocuments: [
      "Form I-140 Immigrant Petition",
      "Evidence of advanced degree or exceptional ability",
      "Labor certification (if required)",
    ],
    typicalProcessSteps: [
      "Employer or self-petitioner (for NIW) files Form I-140",
      "Wait for priority date to be current (if applicable)",
      "File Form I-485 (adjustment of status) or consular processing",
      "Receive green card upon approval",
    ],
    timeHorizon: "long",
    difficulty: "high",
    notes:
      "EB-2 is a common employment-based green card path from H-1B, L-1B, O-1, or E-2, depending on qualifications.",
    commonNextSteps: ["NATURALIZATION"],
  },

  // ---------------------------------------------------------------------------
  // EB-1C – Multinational Manager/Executive
  // ---------------------------------------------------------------------------
  {
    id: "EB1C",
    shortName: "EB-1C",
    name: "EB-1C Multinational Manager or Executive",
    category: "immigrant",
    stage: "future",
    iconEmoji: "🏢",
    tags: ["green card", "multinational manager", "executive"],
    officialDescription:
      "EB-1C is an immigrant visa category for multinational managers or executives who have been employed abroad by a qualifying organization and are coming to work in the U.S. in a managerial or executive capacity.",
    officialLinks: [
      {
        label: "USCIS - EB-1C Multinational Manager or Executive",
        url: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-first-preference-eb-1",
      },
    ],
    eligibilityCriteria: [
      "Qualifying relationship between foreign and U.S. companies",
      "At least one year of employment abroad as a manager or executive within the last three years",
      "Coming to the U.S. to work as a manager or executive for the same employer or affiliate",
    ],
    requiredDocuments: [
      "Form I-140 Immigrant Petition",
      "Evidence of managerial/executive role abroad and in U.S.",
      "Proof of qualifying corporate relationship",
    ],
    typicalProcessSteps: [
      "Employer files Form I-140 for EB-1C",
      "Wait for priority date to be current (if applicable)",
      "File Form I-485 or complete consular processing",
      "Receive green card upon approval",
    ],
    timeHorizon: "long",
    difficulty: "high",
    notes:
      "EB-1C is often a next step for L-1A/L-1B or multinational executives and can lead directly to permanent residence without PERM labor certification.",
    commonNextSteps: ["NATURALIZATION"],
  },

  // ---------------------------------------------------------------------------
  // NATURALIZATION – U.S. Citizenship (Final Stage)
  // ---------------------------------------------------------------------------
  {
    id: "NATURALIZATION",
    shortName: "Naturalization",
    name: "U.S. Citizenship (Naturalization)",
    category: "immigrant",
    stage: "long_term",
    iconEmoji: "🇺🇸",
    tags: ["citizenship", "long-term"],
    officialDescription:
      "Naturalization is the process by which a lawful permanent resident becomes a U.S. citizen.",
    officialLinks: [
      {
        label: "USCIS - Citizenship Through Naturalization",
        url: "https://www.uscis.gov/citizenship/learn-about-citizenship/citizenship-through-naturalization",
      },
      {
        label: "Form N-400",
        url: "https://www.uscis.gov/n-400",
      },
    ],
    eligibilityCriteria: [
      "Must be a lawful permanent resident (green card holder)",
      "Typically must have maintained permanent residence for 3–5 years",
      "Must meet physical presence and continuous residence requirements",
      "Must demonstrate good moral character",
      "Must pass English and civics tests (with some exceptions)",
    ],
    requiredDocuments: [
      "Form N-400, Application for Naturalization",
      "Green card (Form I-551) copy",
      "Proof of residence and physical presence",
      "Marriage certificate if applying based on marriage to a U.S. citizen",
      "Tax records and supporting documents",
    ],
    typicalProcessSteps: [
      "Confirm eligibility (residence, physical presence, etc.)",
      "Prepare and file Form N-400 with USCIS",
      "Attend biometrics appointment (if required)",
      "Attend naturalization interview and civics/English tests",
      "Receive decision on application",
      "If approved, attend oath ceremony and receive Certificate of Naturalization",
    ],
    timeHorizon: "long",
    difficulty: "high",
    notes:
      "This is typically the final step after holding a green card (such as through EB-2, EB-1C, or family-based categories) for several years.",
    commonNextSteps: [],
  },
];
