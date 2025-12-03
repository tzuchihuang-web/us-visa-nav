// Mock visa data for the MVP prototype

export const visaCategories = [
  {
    id: "f1",
    name: "F-1 Student Visa",
    description: "For international students pursuing academic studies",
    requirements: [
      "Acceptance from US school",
      "Financial proof",
      "I-20 form",
      "English language proficiency",
    ],
    timeline: "4-6 weeks",
    successRate: 92,
  },
  {
    id: "h1b",
    name: "H-1B Work Visa",
    description: "For specialized workers in temporary employment",
    requirements: [
      "Job offer from US employer",
      "Labor certification",
      "Passport valid for 6+ months",
      "Bachelor's degree or equivalent",
    ],
    timeline: "2-3 months",
    successRate: 85,
  },
  {
    id: "o1",
    name: "O-1 Extraordinary Ability Visa",
    description: "For individuals with extraordinary ability in sciences, arts, education, business, or athletics",
    requirements: [
      "National or international acclaim",
      "Documentation of extraordinary ability",
      "US sponsorship",
      "Passport",
    ],
    timeline: "2-4 months",
    successRate: 78,
  },
  {
    id: "l1",
    name: "L-1 Intracompany Transfer Visa",
    description: "For managers and specialized knowledge workers transferring within a company",
    requirements: [
      "Employment with company abroad for 1+ year",
      "Transfer to US office",
      "Managerial or specialized role",
      "Company documentation",
    ],
    timeline: "2-3 months",
    successRate: 88,
  },
];

export const applicationSteps = [
  {
    id: "1",
    title: "Gather Documents",
    description: "Collect all required documentation for your visa application",
    completed: false,
  },
  {
    id: "2",
    title: "Complete Forms",
    description: "Fill out visa application forms (DS-160 or equivalent)",
    completed: false,
  },
  {
    id: "3",
    title: "Schedule Interview",
    description: "Book your visa interview appointment",
    completed: false,
  },
  {
    id: "4",
    title: "Prepare for Interview",
    description: "Review answers and prepare supporting materials",
    completed: false,
  },
  {
    id: "5",
    title: "Attend Interview",
    description: "Attend your visa interview at the consulate",
    completed: false,
  },
  {
    id: "6",
    title: "Await Decision",
    description: "Wait for visa decision and passport processing",
    completed: false,
  },
];
