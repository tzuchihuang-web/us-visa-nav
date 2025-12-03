/**
 * Supabase Service Functions
 * 
 * Provides functions to interact with Supabase database
 * - User profile management
 * - Visa application tracking
 * - Skill progression
 */

"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseServiceClient: SupabaseClient | null = null;

// Get or create Supabase client
const getClient = () => {
  if (!supabaseServiceClient && typeof window !== "undefined") {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key) {
      supabaseServiceClient = createClient(url, key);
    }
  }
  return supabaseServiceClient;
};

/**
 * User Profile Types
 */
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  current_visa?: string;
  visa_interests?: string[];
  education_level?: number;
  work_experience?: number;
  field_of_work?: number;
  citizenship_level?: number;
  investment_level?: number;
  language_level?: number;
  onboarding_data?: any; // JSONB data from onboarding questionnaire
  created_at?: string;
  updated_at?: string;
}

export interface VisaApplication {
  id: string;
  user_id: string;
  visa_type: string;
  status: "planning" | "in_progress" | "approved" | "denied";
  current_step: number;
  progress_percentage: number;
  documents_uploaded?: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get user profile from database
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data as UserProfile;
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("user_profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return null;
    }

    return data as UserProfile;
  } catch (err) {
    console.error("Error updating user profile:", err);
    return null;
  }
}

/**
 * Update user skills/level
 */
export async function updateUserSkills(
  userId: string,
  skills: {
    education?: number;
    workExperience?: number;
    fieldOfWork?: number;
    citizenship?: number;
    investment?: number;
    language?: number;
  }
): Promise<UserProfile | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const updates: Record<string, number> = {};

    if (skills.education !== undefined)
      updates.education_level = skills.education;
    if (skills.workExperience !== undefined)
      updates.work_experience = skills.workExperience;
    if (skills.fieldOfWork !== undefined)
      updates.field_of_work = skills.fieldOfWork;
    if (skills.citizenship !== undefined)
      updates.citizenship_level = skills.citizenship;
    if (skills.investment !== undefined)
      updates.investment_level = skills.investment;
    if (skills.language !== undefined)
      updates.language_level = skills.language;

    updates.updated_at = new Date().toISOString() as any;

    const { data, error } = await client
      .from("user_profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user skills:", error);
      return null;
    }

    return data as UserProfile;
  } catch (err) {
    console.error("Error updating user skills:", err);
    return null;
  }
}

/**
 * Set current visa for user
 */
export async function setCurrentVisa(
  userId: string,
  visaId: string
): Promise<UserProfile | null> {
  return updateUserProfile(userId, { current_visa: visaId });
}

/**
 * Add visa to user's interests
 */
export async function addVisaInterest(
  userId: string,
  visaId: string
): Promise<UserProfile | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const profile = await getUserProfile(userId);
    if (!profile) return null;

    const interests = profile.visa_interests || [];
    if (!interests.includes(visaId)) {
      interests.push(visaId);
    }

    return updateUserProfile(userId, { visa_interests: interests });
  } catch (err) {
    console.error("Error adding visa interest:", err);
    return null;
  }
}

/**
 * Remove visa from user's interests
 */
export async function removeVisaInterest(
  userId: string,
  visaId: string
): Promise<UserProfile | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const profile = await getUserProfile(userId);
    if (!profile) return null;

    const interests = (profile.visa_interests || []).filter(
      (id) => id !== visaId
    );

    return updateUserProfile(userId, { visa_interests: interests });
  } catch (err) {
    console.error("Error removing visa interest:", err);
    return null;
  }
}

/**
 * Get user's visa applications
 */
export async function getVisaApplications(
  userId: string
): Promise<VisaApplication[]> {
  const client = getClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from("visa_applications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching visa applications:", error);
      return [];
    }

    return (data as VisaApplication[]) || [];
  } catch (err) {
    console.error("Error fetching visa applications:", err);
    return [];
  }
}

/**
 * Create new visa application
 */
export async function createVisaApplication(
  userId: string,
  visaType: string
): Promise<VisaApplication | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("visa_applications")
      .insert({
        user_id: userId,
        visa_type: visaType,
        status: "planning",
        current_step: 0,
        progress_percentage: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating visa application:", error);
      return null;
    }

    return data as VisaApplication;
  } catch (err) {
    console.error("Error creating visa application:", err);
    return null;
  }
}

/**
 * Update visa application progress
 */
export async function updateApplicationProgress(
  applicationId: string,
  progress: {
    status?: "planning" | "in_progress" | "approved" | "denied";
    currentStep?: number;
    progressPercentage?: number;
    notes?: string;
  }
): Promise<VisaApplication | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (progress.status !== undefined) updates.status = progress.status;
    if (progress.currentStep !== undefined)
      updates.current_step = progress.currentStep;
    if (progress.progressPercentage !== undefined)
      updates.progress_percentage = progress.progressPercentage;
    if (progress.notes !== undefined) updates.notes = progress.notes;

    const { data, error } = await client
      .from("visa_applications")
      .update(updates)
      .eq("id", applicationId)
      .select()
      .single();

    if (error) {
      console.error("Error updating application progress:", error);
      return null;
    }

    return data as VisaApplication;
  } catch (err) {
    console.error("Error updating application progress:", err);
    return null;
  }
}

/**
 * Delete visa application
 */
export async function deleteVisaApplication(
  applicationId: string
): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from("visa_applications")
      .delete()
      .eq("id", applicationId);

    if (error) {
      console.error("Error deleting application:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error deleting application:", err);
    return false;
  }
}

/**
 * Check if user has completed onboarding
 * 
 * TODO: After running SUPABASE_ADD_ONBOARDING.ts migration,
 * this will check for onboarding_data in the database.
 * Until then, falls back to localStorage check.
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const client = getClient();
  if (!client) {
    // If no client, check localStorage as fallback
    return !!localStorage.getItem(`onboarding_${userId}`);
  }

  try {
    const { data, error } = await client
      .from("user_profiles")
      .select("onboarding_data")
      .eq("id", userId)
      .single();

    if (error) {
      // Column might not exist yet, fall back to localStorage
      console.warn("Could not check onboarding status from Supabase:", error.message);
      return !!localStorage.getItem(`onboarding_${userId}`);
    }

    // Check if onboarding_data exists and is not null/empty
    if (data?.onboarding_data) {
      return true;
    }

    // Also check localStorage as fallback
    return !!localStorage.getItem(`onboarding_${userId}`);
  } catch (err) {
    console.warn("Error checking onboarding status:", err);
    // Fallback to localStorage
    return !!localStorage.getItem(`onboarding_${userId}`);
  }
}

/**
 * Save onboarding data to user profile
 * 
 * IMPORTANT: Maps onboarding questionnaire answers to UserProfile fields:
 * - onboardingData.currentVisa → user_profiles.current_visa
 * - onboardingData.educationLevel → user_profiles.education_level
 * - onboardingData.yearsOfExperience → user_profiles.years_of_experience
 * 
 * This ensures the left panel shows onboarding answers after completion.
 * Also stores full onboarding_data JSON for reference.
 */
export async function saveOnboardingData(
  userId: string,
  onboardingData: any
): Promise<boolean> {
  const client = getClient();

  // Always save to localStorage as backup
  try {
    localStorage.setItem(`onboarding_${userId}`, JSON.stringify(onboardingData));
    console.info('[Supabase] Saved onboarding data to localStorage');
  } catch (err) {
    console.warn("Could not save to localStorage:", err);
  }

  if (!client) {
    console.warn("No Supabase client available, using localStorage only");
    return true; // Still consider it a success since localStorage worked
  }

  try {
    // MAP ONBOARDING DATA TO USER PROFILE FIELDS
    // This is the key step that connects onboarding answers to the user profile
    const updates: Record<string, any> = {
      onboarding_data: onboardingData,
      updated_at: new Date().toISOString(),
    };

    // Map onboarding visa status to profile
    // If user has a current visa, set it in user_profiles.current_visa
    // IMPORTANT: Use normalizeVisaId to convert UI label (F-1) to knowledge base ID (f1)
    if (onboardingData.currentVisaStatus === 'has_visa' && onboardingData.currentVisa) {
      // Import normalizeVisaId at top of file if not already imported
      // For now, create inline mapping to avoid circular dependencies
      const visaMap: Record<string, string> = {
        'F-1': 'f1', 'F1': 'f1', 'f-1': 'f1', 'f1': 'f1',
        'OPT': 'opt', 'opt': 'opt',
        'H-1B': 'h1b', 'H1B': 'h1b', 'h-1b': 'h1b', 'h1b': 'h1b',
        'O-1': 'o1', 'O1': 'o1', 'o-1': 'o1', 'o1': 'o1',
        'L-1': 'l1', 'L1': 'l1', 'l-1': 'l1', 'l1': 'l1',
        'E-2': 'e2', 'E2': 'e2', 'e-2': 'e2', 'e2': 'e2',
        'EB-1': 'eb1', 'EB1': 'eb1', 'eb-1': 'eb1', 'eb1': 'eb1',
        'EB-2': 'eb2', 'EB2': 'eb2', 'eb-2': 'eb2', 'eb2': 'eb2',
      };
      const normalizedVisa = visaMap[onboardingData.currentVisa.trim()] || null;
      updates.current_visa = normalizedVisa;
      console.info(`[Supabase] Mapped onboarding currentVisa "${onboardingData.currentVisa}" to profile: "${normalizedVisa}"`);
    } else {
      // User has no current visa
      updates.current_visa = null;
      console.info('[Supabase] User has no current visa (onboarding)');
    }

    // Map education level
    if (onboardingData.educationLevel) {
      updates.education_level = onboardingData.educationLevel;
      console.info(`[Supabase] Mapped education level: ${onboardingData.educationLevel}`);
    }

    // Map years of experience
    if (onboardingData.yearsOfExperience !== undefined) {
      updates.years_of_experience = onboardingData.yearsOfExperience;
      console.info(`[Supabase] Mapped years of experience: ${onboardingData.yearsOfExperience}`);
    }

    console.info('[Supabase] Saving onboarding data to user_profiles with mapped fields:', updates);

    const { error } = await client
      .from("user_profiles")
      .update(updates)
      .eq("id", userId);

    if (error) {
      console.error("Error saving onboarding data to Supabase:", error.message, error);
      console.warn("Falling back to localStorage only. Run SUPABASE_ADD_ONBOARDING.ts migration if needed.");
      return true; // Still return true since localStorage worked
    }

    console.info('[Supabase] Successfully saved onboarding data to user_profiles');
    return true;
  } catch (err) {
    console.error("Error saving onboarding data:", err);
    return true; // Still return true since localStorage worked
  }
}
