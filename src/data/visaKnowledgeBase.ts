export type Visa = {
  id: string;
  name: string;
  category: "student" | "work" | "exchange" | "immigrant" | "investment" | "other";
  officialDescription: string;
  officialLinks: string[];
  eligibilityCriteria: string[];
  requiredDocuments?: string[];
  typicalProcessSteps?: string[];
  timeHorizon?: "short" | "medium" | "long";
  difficulty?: "low" | "medium" | "high";
  notes?: string;
  commonNextSteps?: string[];
};

export const visaKnowledgeBase: Visa[] = [
  {
    id: "F1",
    name: "F-1 Student Visa",
    category: "student",
    officialDescription: "For full-time academic students enrolled at a SEVP-approved U.S. school.",
    officialLinks: [
      "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html"
    ],
    eligibilityCriteria: [
      "Accepted by a SEVP-approved academic institution",
      "Intention to study full-time",
      "Sufficient financial support",
      "Maintain residence abroad"
    ],
    requiredDocuments: [
      "Valid passport",
      "Form I-20",
      "DS-160 confirmation",
      "SEVIS I-901 fee receipt"
    ],
    typicalProcessSteps: [
      "Apply to SEVP-approved school",
      "Receive Form I-20",
      "Pay SEVIS fee",
      "Submit DS-160",
      "Attend visa interview"
    ],
    timeHorizon: "short",
    difficulty: "medium",
    notes: "F-1 students commonly transition into OPT for practical training.",
    commonNextSteps: ["OPT", "H1B", "O1", "EB2", "E2"]
  },
  {
    id: "OPT",
    name: "OPT – Optional Practical Training",
    category: "student",
    officialDescription: "Up to 12 months (or 36 months STEM) of work authorization for F-1 students after completing or during academic program.",
    officialLinks: [
      "https://www.uscis.gov/i-765"
    ],
    eligibilityCriteria: [
      "Currently in valid F-1 status",
      "Enrolled for at least one academic year",
      "Work must relate to academic field"
    ],
    requiredDocuments: [
      "Form I-765",
      "I-20 with OPT recommendation",
      "Passport",
      "I-94"
    ],
    typicalProcessSteps: [
      "Request OPT recommendation from DSO",
      "Submit Form I-765 to USCIS",
      "Receive EAD",
      "Begin employment upon EAD approval"
    ],
    timeHorizon: "short",
    difficulty: "low",
    notes: "Common gateway to H-1B, O-1 or green card pathways.",
    commonNextSteps: ["H1B", "O1", "EB2"]
  },
  {
    id: "H1B",
    name: "H-1B Specialty Occupation Visa",
    category: "work",
    officialDescription: "For workers in specialty occupations requiring specialized knowledge and a bachelor's degree or higher.",
    officialLinks: [
      "https://travel.state.gov/content/travel/en/us-visas/employment/temporary-worker-visas.html"
    ],
    eligibilityCriteria: [
      "Job offer in a specialty occupation",
      "Bachelor's degree or equivalent",
      "Employer files Form I-129"
    ],
    requiredDocuments: [
      "Approved I-129 petition",
      "Passport",
      "Degree documents",
      "DS-160"
    ],
    typicalProcessSteps: [
      "Employer obtains LCA",
      "Employer files I-129",
      "Petition approval",
      "Visa interview / change of status",
      "Begin work"
    ],
    timeHorizon: "medium",
    difficulty: "high",
    notes: "Often obtained after OPT; subject to annual cap lottery.",
    commonNextSteps: ["EB2", "EB1"]
  },
  {
    id: "O1",
    name: "O-1 Extraordinary Ability Visa",
    category: "work",
    officialDescription: "For individuals with extraordinary ability in science, arts, business, education, athletics or extraordinary achievements in film or TV.",
    officialLinks: [
      "https://travel.state.gov/content/travel/en/us-visas/employment/temporary-worker-visas.html"
    ],
    eligibilityCriteria: [
      "Demonstrate sustained national or international acclaim",
      "Qualifying evidence meeting O-1 criteria",
      "U.S. employer or agent sponsor"
    ],
    requiredDocuments: [
      "Approved O-1 petition",
      "Evidence of achievements",
      "Passport",
      "DS-160"
    ],
    typicalProcessSteps: [
      "Prepare evidence",
      "Employer files petition",
      "USCIS approval",
      "Visa interview"
    ],
    timeHorizon: "medium",
    difficulty: "high",
    notes: "Common alternative route to EB-1 for highly accomplished individuals.",
    commonNextSteps: ["EB1"]
  },
  {
    id: "L1",
    name: "L-1 Intracompany Transfer Visa",
    category: "work",
    officialDescription: "For managers, executives, or specialized knowledge employees transferring from a foreign company to a U.S. affiliate.",
    officialLinks: [
      "https://travel.state.gov/content/travel/en/us-visas/employment/temporary-worker-visas.html"
    ],
    eligibilityCriteria: [
      "Worked abroad for the company for 1 continuous year within the last 3 years",
      "Transfer to U.S. parent, branch, subsidiary or affiliate",
      "Role qualifies as manager/executive or specialized knowledge"
    ],
    requiredDocuments: [
      "Employer's petition",
      "Evidence of foreign employment",
      "Passport",
      "DS-160"
    ],
    typicalProcessSteps: [
      "Employer files L-1 petition",
      "USCIS approval",
      "Visa interview",
      "Enter U.S. and begin work"
    ],
    timeHorizon: "medium",
    difficulty: "medium",
    notes: "Strong pathway to EB-1C for multinational managers/executives.",
    commonNextSteps: ["EB1"]
  },
  {
    id: "E2",
    name: "E-2 Treaty Investor Visa",
    category: "investment",
    officialDescription: "For investors from treaty countries who make a substantial investment in a U.S. business.",
    officialLinks: [
      "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/treaty.html"
    ],
    eligibilityCriteria: [
      "Citizenship of an E-2 treaty country",
      "Substantial investment in a real U.S. business",
      "Business must be operational",
      "Applicant must direct and develop the enterprise"
    ],
    requiredDocuments: [
      "Proof of nationality",
      "Business formation documents",
      "Investment evidence",
      "DS-160 or DS-156E"
    ],
    typicalProcessSteps: [
      "Form U.S. business",
      "Make qualifying investment",
      "Prepare investor packet",
      "Visa interview"
    ],
    timeHorizon: "medium",
    difficulty: "medium",
    notes: "Only available to treaty-country nationals; does not directly lead to a green card.",
    commonNextSteps: ["EB2", "EB5"]
  },
  {
    id: "EB2",
    name: "EB-2 Immigrant Visa (Advanced Degree / Exceptional Ability)",
    category: "immigrant",
    officialDescription: "For individuals with advanced degrees or exceptional ability, often requiring PERM labor certification unless exempt.",
    officialLinks: [
      "https://travel.state.gov/content/travel/en/us-visas/immigrate/employment-based/eb-2.html"
    ],
    eligibilityCriteria: [
      "Advanced degree or exceptional ability",
      "Permanent job offer (unless NIW exempt)",
      "Labor certification (PERM) or National Interest Waiver"
    ],
    requiredDocuments: [
      "PERM certification or NIW evidence",
      "Approved I-140 petition",
      "Degree/professional evidence",
      "Passport"
    ],
    typicalProcessSteps: [
      "Employer obtains PERM or applicant files NIW",
      "Submit I-140",
      "Wait priority date",
      "Consular processing or adjustment of status"
    ],
    timeHorizon: "long",
    difficulty: "high",
    notes: "Pathway to permanent residency; NIW route allows self-petition.",
    commonNextSteps: ["Naturalization"]
  },
  {
    id: "EB1",
    name: "EB-1 Immigrant Visa",
    category: "immigrant",
    officialDescription: "For individuals with extraordinary ability, outstanding researchers/professors, or multinational managers/executives.",
    officialLinks: [
      "https://travel.state.gov/content/travel/en/us-visas/immigrate/employment-based/eb-1.html"
    ],
    eligibilityCriteria: [
      "Extraordinary ability OR",
      "Outstanding researcher/professor OR",
      "Multinational executive/manager with qualifying experience"
    ],
    requiredDocuments: [
      "I-140 petition",
      "Evidence of extraordinary ability / research achievements / qualifying managerial experience",
      "Passport"
    ],
    typicalProcessSteps: [
      "Prepare petition with evidence",
      "Submit I-140",
      "Wait priority date",
      "Consular processing or adjustment of status"
    ],
    timeHorizon: "long",
    difficulty: "high",
    notes: "Fast employment-based route to permanent residence for those who qualify.",
    commonNextSteps: ["Naturalization"]
  },
  {
    id: "NATURALIZATION",
    name: "U.S. Citizenship (Naturalization)",
    category: "immigrant",
    officialDescription: "Naturalization is the process by which a lawful permanent resident becomes a U.S. citizen.",
    officialLinks: [
      "https://www.uscis.gov/citizenship/learn-about-citizenship/naturalization"
    ],
    eligibilityCriteria: [
      "Must be a lawful permanent resident (green card holder)",
      "Typically must have maintained permanent residence for 3–5 years, depending on the category",
      "Must meet physical presence and continuous residence requirements",
      "Must demonstrate good moral character",
      "Must pass English and civics tests (with some exceptions)"
    ],
    requiredDocuments: [
      "Form N-400, Application for Naturalization",
      "Green card (Form I-551) copy",
      "Proof of residence and physical presence",
      "Marriage certificate (if applying based on marriage to a U.S. citizen)",
      "Tax records and supporting documents"
    ],
    typicalProcessSteps: [
      "Confirm eligibility (permanent residence duration, travel history, etc.)",
      "Prepare and file Form N-400 with USCIS",
      "Attend biometrics (fingerprints) appointment if required",
      "Attend naturalization interview and civics/English tests",
      "Receive decision on your application",
      "If approved, attend oath ceremony and receive Certificate of Naturalization"
    ],
    timeHorizon: "long",
    difficulty: "high",
    notes: "This is typically the final step after holding a green card (permanent residence) for several years.",
    commonNextSteps: []
  }

];
