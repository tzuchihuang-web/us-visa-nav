// Core domain models for visa navigation

export interface Visa {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  timeline: string;
  successRate: number;
}

export interface UserProfile {
  id: string;
  email: string;
  currentStatus: string;
  visaInterests: string[];
}

export interface ProgressStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
}
