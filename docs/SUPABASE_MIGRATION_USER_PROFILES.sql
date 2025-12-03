-- ============================================================================
-- SUPABASE MIGRATION: USER PROFILES TABLE (FIXED VERSION)
-- ============================================================================

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT NOT NULL,
  
  -- Visa Journey
  current_visa TEXT,
  
  -- Education
  education_level TEXT,
  
  -- Work Experience
  work_experience_years INTEGER,
  
  -- Career
  field_of_work TEXT,
  
  -- Geography
  country_of_citizenship TEXT,
  
  -- Language
  english_level TEXT,
  
  -- Financial
  investment_amount_usd DECIMAL(12, 2),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Legacy fields (for backward compatibility)
  onboarding_data JSONB,
  visa_interests TEXT[]
);

-- Add missing columns if they don't exist (for existing tables)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS current_visa TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS work_experience_years INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS field_of_work TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS country_of_citizenship TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS english_level TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS investment_amount_usd DECIMAL(12, 2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_data JSONB;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS visa_interests TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index on updated_at for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at ON user_profiles(updated_at);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- VERIFICATION (optional, you can run this separately)
-- ============================================================================
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_profiles' 
-- ORDER BY ordinal_position;
-- ============================================================================
