-- Migration script to add missing columns to existing profiles table
-- Run this if you already have a profiles table without the new columns

-- Add new columns to profiles table if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weight_kg NUMERIC;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height_cm NUMERIC;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profession TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS diabetes_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS diagnosis_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS foot_symptoms TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pre_existing_conditions TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS activity_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS footwear_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS prior_injuries TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blood_sugar_mgdl NUMERIC;

-- Create onboarding table if it doesn't exist
CREATE TABLE IF NOT EXISTS onboarding (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT,
  age INTEGER,
  weight_kg NUMERIC,
  height_cm NUMERIC,
  gender TEXT,
  profession TEXT,
  diabetes_type TEXT,
  diagnosis_date DATE,
  foot_symptoms TEXT[],
  pre_existing_conditions TEXT[],
  activity_level TEXT,
  footwear_type TEXT,
  prior_injuries TEXT,
  blood_sugar_mgdl NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Recreate policies for profiles
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Drop existing policies if they exist for onboarding
DROP POLICY IF EXISTS "Users can view their own onboarding data" ON onboarding;
DROP POLICY IF EXISTS "Users can update their own onboarding data" ON onboarding;
DROP POLICY IF EXISTS "Users can insert their own onboarding data" ON onboarding;

-- Create policies for onboarding
CREATE POLICY "Users can view their own onboarding data" 
ON onboarding FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own onboarding data" 
ON onboarding FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own onboarding data" 
ON onboarding FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_onboarding_updated_at ON onboarding;

-- Recreate triggers
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_onboarding_updated_at 
    BEFORE UPDATE ON onboarding 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON onboarding(user_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';