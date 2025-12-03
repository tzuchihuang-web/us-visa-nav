/**
 * SUPABASE SETUP GUIDE
 * 
 * This file contains SQL queries to set up the database schema.
 * Copy and paste these into your Supabase SQL Editor to create the tables.
 * 
 * Steps:
 * 1. Go to https://supabase.com and create a free project
 * 2. Go to SQL Editor in your Supabase dashboard
 * 3. Copy the SQL queries below and run them
 * 4. Update .env.local with your Supabase credentials
 */

/**
 * SQL: Create user_profiles table
 * Stores additional user information beyond Supabase auth
 */
const CREATE_USER_PROFILES_TABLE = `
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  current_visa VARCHAR(50),
  visa_interests TEXT[], -- Array of visa IDs
  education_level INTEGER DEFAULT 0,
  work_experience INTEGER DEFAULT 0,
  field_of_work INTEGER DEFAULT 0,
  citizenship_level INTEGER DEFAULT 0,
  investment_level INTEGER DEFAULT 0,
  language_level INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view/edit their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
`;

/**
 * SQL: Create visa_applications table
 * Tracks user's visa applications and progress
 */
const CREATE_VISA_APPLICATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS visa_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  visa_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'planning', -- planning, in_progress, approved, denied
  current_step INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  documents_uploaded TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE visa_applications ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only view/edit their own applications
CREATE POLICY "Users can view own applications" ON visa_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications" ON visa_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON visa_applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications" ON visa_applications
  FOR DELETE USING (auth.uid() = user_id);
`;

/**
 * SQL: Create trigger to auto-create user_profiles on signup
 */
const CREATE_AUTO_PROFILE_TRIGGER = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

/**
 * MANUAL SETUP INSTRUCTIONS
 * 
 * 1. Create Supabase Project:
 *    - Go to https://supabase.com
 *    - Click "New Project"
 *    - Choose a name (e.g., "us-visa-nav")
 *    - Create a strong password
 *    - Select a region close to you
 *    - Wait for project to initialize
 * 
 * 2. Get Your Credentials:
 *    - Go to Settings → API → Project URL (copy this)
 *    - Go to Settings → API → Project API keys → anon public (copy this)
 * 
 * 3. Update .env.local:
 *    NEXT_PUBLIC_SUPABASE_URL=<your_project_url>
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
 * 
 * 4. Set Up Database Tables:
 *    - Go to SQL Editor
 *    - Run CREATE_USER_PROFILES_TABLE query
 *    - Run CREATE_VISA_APPLICATIONS_TABLE query
 *    - Run CREATE_AUTO_PROFILE_TRIGGER query
 * 
 * 5. Enable Email Authentication:
 *    - Go to Authentication → Providers
 *    - Make sure "Email" is enabled
 *    - Disable "Confirm email" for development (optional)
 * 
 * 6. Test:
 *    - Go to http://localhost:3000/auth
 *    - Sign up with a test email
 *    - Check Supabase dashboard for new user
 */

export {
  CREATE_USER_PROFILES_TABLE,
  CREATE_VISA_APPLICATIONS_TABLE,
  CREATE_AUTO_PROFILE_TRIGGER,
};
