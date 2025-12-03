/**
 * USER PROFILE API
 * 
 * Bridge between the application UserProfile type and Supabase persistence.
 * 
 * This module:
 * - Loads user profile from Supabase database
 * - Saves profile changes back to Supabase
 * - Converts between database format and UserProfile type
 * - Handles errors gracefully
 */

import { UserProfile } from "@/lib/types";
import {
  getUserProfile,
  updateUserProfile as updateProfileInSupabase,
  setCurrentVisa,
} from "@/lib/supabase/client";

// ============================================================================
// TYPE MAPPING - SUPABASE <-> APPLICATION
// ============================================================================
// Maps between Supabase's database schema and our UserProfile type

/**
 * Database record format returned by Supabase
 * IMPORTANT: These are the ACTUAL column names in the user_profiles table
 */
interface SupabaseUserProfile {
  id: string;
  email: string;
  current_visa?: string | null;
  education_level?: string | null;
  work_experience_years?: number | null;  // NOT years_of_experience
  field_of_work?: string | null;
  country_of_citizenship?: string | null;
  english_level?: string | null;           // NOT english_proficiency
  investment_amount_usd?: number | null;    // Database column is investment_amount_usd
  created_at?: string;
  updated_at?: string;
}

/**
 * Converts Supabase record to application UserProfile type
 * Maps database column names to application field names
 */
function fromSupabaseProfile(dbRecord: SupabaseUserProfile): UserProfile {
  // Map english_level (TEXT) back to englishProficiency (number 0-5)
  let englishProficiency = 0;
  if (dbRecord.english_level) {
    switch (dbRecord.english_level.toLowerCase()) {
      case 'basic': englishProficiency = 1; break;
      case 'intermediate': englishProficiency = 2; break;
      case 'advanced': englishProficiency = 3; break;
      case 'fluent': englishProficiency = 4; break;
      default: englishProficiency = 0;
    }
  }

  return {
    id: dbRecord.id,
    email: dbRecord.email,
    currentVisa: dbRecord.current_visa || null,
    educationLevel: (dbRecord.education_level as any) || 'other',
    yearsOfExperience: dbRecord.work_experience_years || 0,
    fieldOfWork: dbRecord.field_of_work || '',
    countryOfCitizenship: dbRecord.country_of_citizenship || 'US',
    englishProficiency: englishProficiency,
    investmentAmount: dbRecord.investment_amount_usd || 0,
  };
}

/**
 * Converts application UserProfile to Supabase insert/update format
 * 
 * IMPORTANT: Maps application field names to database column names:
 * - englishProficiency (0-5) → english_level (TEXT: 'basic'/'intermediate'/'advanced'/'fluent')
 * - yearsOfExperience (number) → work_experience_years (INTEGER)
 */
function toSupabaseProfile(profile: UserProfile): Partial<SupabaseUserProfile> {
  // Map English proficiency number (0-5) to text level
  let englishLevel: string | null = null;
  if (profile.englishProficiency) {
    if (profile.englishProficiency <= 1) englishLevel = 'basic';
    else if (profile.englishProficiency === 2) englishLevel = 'intermediate';
    else if (profile.englishProficiency === 3) englishLevel = 'advanced';
    else if (profile.englishProficiency >= 4) englishLevel = 'fluent';
  }

  return {
    current_visa: profile.currentVisa || null,
    education_level: profile.educationLevel || null,
    work_experience_years: profile.yearsOfExperience || null, // Map to work_experience_years, NOT years_of_experience
    field_of_work: profile.fieldOfWork || null,
    country_of_citizenship: profile.countryOfCitizenship || null,
    english_level: englishLevel, // Map to english_level, NOT english_proficiency
    investment_amount_usd: profile.investmentAmount || null, // Database column is investment_amount_usd
  };
}

// ============================================================================
// LOAD PROFILE FROM SUPABASE
// ============================================================================

/**
 * Loads user profile from Supabase database
 * 
 * @param userId - The user's ID (typically from auth)
 * @returns UserProfile or null if not found or error
 * 
 * Called from: useVisaNavigatorProfile hook on mount
 */
export async function loadUserProfileFromSupabase(
  userId: string
): Promise<UserProfile | null> {
  if (!userId) {
    console.warn("loadUserProfileFromSupabase: No userId provided");
    return null;
  }

  try {
    const dbRecord = (await getUserProfile(userId)) as
      | SupabaseUserProfile
      | null;

    if (!dbRecord) {
      console.info(
        `[Supabase] Profile not found for user ${userId}, will use defaults`
      );
      return null;
    }

    const profile = fromSupabaseProfile(dbRecord);
    console.info(`[Supabase] Loaded profile for ${userId}:`, profile);
    return profile;
  } catch (error) {
    console.error("[Supabase] Error loading user profile:", error);
    return null;
  }
}

// ============================================================================
// SAVE PROFILE TO SUPABASE
// ============================================================================

/**
 * Saves user profile to Supabase database
 * 
 * @param userId - The user's ID
 * @param profile - The UserProfile to save
 * 
 * Called from: Left panel components when user edits qualifications
 * 
 * Note: Debouncing should be handled by the caller to avoid excessive writes
 * 
 * LOGGING: Logs all data being sent and any errors returned
 */
export async function saveUserProfileToSupabase(
  userId: string,
  profile: UserProfile
): Promise<boolean> {
  if (!userId || !profile) {
    console.warn("saveUserProfileToSupabase: Missing userId or profile");
    return false;
  }

  try {
    const updates = toSupabaseProfile(profile);
    console.info('[SaveProfile] Saving profile for userId:', userId);
    console.info('[SaveProfile] Data being sent to Supabase:', updates);
    
    const result = await updateProfileInSupabase(userId, updates as any);

    if (result) {
      console.info(`[SaveProfile] Profile saved successfully for ${userId}`, result);
      return true;
    } else {
      console.warn(`[SaveProfile] Profile update returned null for ${userId}`);
      return false;
    }
  } catch (error) {
    console.error("[SaveProfile] Error saving user profile:", error);
    if (error instanceof Error) {
      console.error("[SaveProfile] Error details:", error.message);
    }
    return false;
  }
}

// ============================================================================
// UPDATE SPECIFIC PROFILE FIELDS
// ============================================================================

/**
 * Updates just the current visa field
 * Useful for quick updates without modifying other fields
 */
export async function updateCurrentVisaInSupabase(
  userId: string,
  visaId: string | null
): Promise<boolean> {
  if (!userId) return false;

  try {
    if (visaId) {
      await setCurrentVisa(userId, visaId);
    } else {
      // Clear current visa
      await updateProfileInSupabase(userId, { current_visa: null } as any);
    }
    console.info(`[Supabase] Updated current visa for ${userId}: ${visaId}`);
    return true;
  } catch (error) {
    console.error("[Supabase] Error updating current visa:", error);
    return false;
  }
}

/**
 * Creates a default profile for a new user
 */
export async function initializeUserProfileInSupabase(
  userId: string,
  email: string
): Promise<UserProfile | null> {
  try {
    const defaultProfile: SupabaseUserProfile = {
      id: userId,
      email,
      current_visa: null,
      education_level: null,
      work_experience_years: null,
      field_of_work: null,
      country_of_citizenship: null,
      english_level: null,
      investment_amount_usd: null,
    };

    const result = await updateProfileInSupabase(
      userId,
      defaultProfile as any
    );

    if (result) {
      console.info(`[Supabase] Initialized profile for new user ${userId}`);
      return fromSupabaseProfile(result as SupabaseUserProfile);
    }
    return null;
  } catch (error) {
    console.error("[Supabase] Error initializing user profile:", error);
    return null;
  }
}

// ============================================================================
// HELPER: CREATE DEFAULT PROFILE FOR LOCAL TESTING
// ============================================================================

/**
 * Creates a default UserProfile for testing or local development
 * Used when Supabase is unavailable or during initialization
 */
export function createDefaultUserProfile(userId: string, email?: string): UserProfile {
  return {
    id: userId,
    email: email || `user-${userId}@visa-nav.local`,
    currentVisa: null,
    educationLevel: 'other',
    yearsOfExperience: 0,
    fieldOfWork: '',
    countryOfCitizenship: 'US',
    englishProficiency: 0,
    investmentAmount: 0,
  };
}
