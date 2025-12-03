/**
 * SUPABASE MIGRATION: Add Onboarding Data Column
 * 
 * Run this in Supabase SQL Editor to add onboarding support
 * to existing user_profiles table
 */

-- Add onboarding_data column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN onboarding_data JSONB DEFAULT NULL;

-- Add index for faster queries
CREATE INDEX idx_user_profiles_onboarding ON user_profiles(onboarding_data);

-- Verify the column was added
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'onboarding_data';
