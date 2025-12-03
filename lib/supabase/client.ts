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
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  try {
    const { data, error } = await client
      .from("user_profiles")
      .select("onboarding_data")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking onboarding status:", error);
      return false;
    }

    // Check if onboarding_data exists and is not null/empty
    return !!(data?.onboarding_data);
  } catch (err) {
    console.error("Error checking onboarding status:", err);
    return false;
  }
}

/**
 * Save onboarding data to user profile
 */
export async function saveOnboardingData(
  userId: string,
  onboardingData: any
): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from("user_profiles")
      .update({
        onboarding_data: onboardingData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error saving onboarding data:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error saving onboarding data:", err);
    return false;
  }
}
