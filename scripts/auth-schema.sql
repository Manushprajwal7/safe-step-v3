-- Clean Authentication Schema for Supabase
-- This script sets up a minimal authentication system with email/password only

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  role TEXT DEFAULT 'patient' CHECK (role IN ('patient', 'admin')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  full_name TEXT,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create onboarding table for detailed health data
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

-- Create assessments table for health assessments
CREATE TABLE IF NOT EXISTS assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  check_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  symptoms TEXT[],
  feeling TEXT CHECK (feeling IN ('good', 'okay', 'bad')),
  notes TEXT,
  score INTEGER,
  duration INTEGER, -- in minutes
  assessment_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop triggers if they exist and create trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Drop triggers if they exist and create trigger for onboarding table
DROP TRIGGER IF EXISTS update_onboarding_updated_at ON onboarding;
CREATE TRIGGER update_onboarding_updated_at 
    BEFORE UPDATE ON onboarding 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Drop triggers if they exist and create trigger for assessments table
DROP TRIGGER IF EXISTS update_assessments_updated_at ON assessments;
CREATE TRIGGER update_assessments_updated_at 
    BEFORE UPDATE ON assessments 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Create profile creation trigger function
-- This function automatically creates a profile when a new user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile for new user
  INSERT INTO public.profiles (user_id, role, full_name, onboarding_completed)
  VALUES (
    NEW.id, 
    'patient', 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, ''),
    FALSE
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create RLS policies
-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Onboarding policies
DROP POLICY IF EXISTS "Users can view their own onboarding data" ON onboarding;
DROP POLICY IF EXISTS "Users can update their own onboarding data" ON onboarding;
DROP POLICY IF EXISTS "Users can insert their own onboarding data" ON onboarding;

CREATE POLICY "Users can view their own onboarding data" 
ON onboarding FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own onboarding data" 
ON onboarding FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own onboarding data" 
ON onboarding FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Assessments policies
DROP POLICY IF EXISTS "Users can view their own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can insert their own assessments" ON assessments;

CREATE POLICY "Users can view their own assessments" 
ON assessments FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own assessments" 
ON assessments FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own assessments" 
ON assessments FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_check_date ON assessments(check_date);

-- Disable email confirmation requirement
-- This is configured in Supabase Auth settings, not in SQL
-- But we can ensure users are automatically confirmed by setting email_confirm: true 
-- when creating users via the admin API

-- Verify setup
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'profiles';
  
  IF table_count > 0 THEN
    RAISE NOTICE '✅ Authentication schema setup completed successfully!';
  ELSE
    RAISE NOTICE '❌ Authentication schema setup failed!';
  END IF;
END $$;