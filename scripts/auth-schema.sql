-- Authentication Schema and Policies for Supabase
-- This script creates the necessary tables, relationships, and Row Level Security (RLS) policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table to store user metadata
CREATE TABLE IF NOT EXISTS profiles (
  -- Reference to the user ID in auth.users table
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  
  -- User role (patient, admin, etc.)
  role TEXT DEFAULT 'patient' CHECK (role IN ('patient', 'admin')),
  
  -- Onboarding completion status
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  -- Onboarding data fields
  full_name TEXT,
  age INTEGER,
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,2),
  gender TEXT,
  profession TEXT,
  diabetes_type TEXT,
  activity_level TEXT,
  diagnosis_date DATE,
  footwear_type TEXT,
  prior_injuries TEXT,
  blood_sugar_mgdl NUMERIC(5,2),
  foot_symptoms TEXT[],  -- Array of symptoms
  pre_existing_conditions TEXT[],  -- Array of conditions
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Create sessions table for user sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  device_info TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessments table for user assessments
CREATE TABLE IF NOT EXISTS assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  score NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS update_assessments_updated_at ON assessments;

-- Create a trigger to update the updated_at timestamp for assessments
CREATE TRIGGER update_assessments_updated_at 
    BEFORE UPDATE ON assessments 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Create reports table for user reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES assessments ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table for user chat functionality
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_from_user BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (user_id = auth.uid());

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (user_id = auth.uid());

-- Users can insert their own profile (when signing up)
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Admins can view all profiles
-- Fixed to avoid infinite recursion by using a SECURITY DEFINER function
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Use SECURITY DEFINER to avoid RLS restrictions when checking admin status
  SELECT p.role INTO user_role
  FROM public.profiles p
  WHERE p.user_id = auth.uid()
  LIMIT 1;
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN FALSE;
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (is_admin_user());

-- Sessions RLS Policies
-- Users can view their own sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
CREATE POLICY "Users can view their own sessions" 
ON sessions FOR SELECT 
USING (user_id = auth.uid());

-- Users can insert their own sessions
DROP POLICY IF EXISTS "Users can insert their own sessions" ON sessions;
CREATE POLICY "Users can insert their own sessions" 
ON sessions FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Users can update their own sessions
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;
CREATE POLICY "Users can update their own sessions" 
ON sessions FOR UPDATE 
USING (user_id = auth.uid());

-- Admins can view all sessions
DROP POLICY IF EXISTS "Admins can view all sessions" ON sessions;
CREATE POLICY "Admins can view all sessions" 
ON sessions FOR SELECT 
USING (is_admin_user());

-- Assessments RLS Policies
-- Users can view their own assessments
DROP POLICY IF EXISTS "Users can view their own assessments" ON assessments;
CREATE POLICY "Users can view their own assessments" 
ON assessments FOR SELECT 
USING (user_id = auth.uid());

-- Users can insert their own assessments
DROP POLICY IF EXISTS "Users can insert their own assessments" ON assessments;
CREATE POLICY "Users can insert their own assessments" 
ON assessments FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Users can update their own assessments
DROP POLICY IF EXISTS "Users can update their own assessments" ON assessments;
CREATE POLICY "Users can update their own assessments" 
ON assessments FOR UPDATE 
USING (user_id = auth.uid());

-- Admins can view all assessments
DROP POLICY IF EXISTS "Admins can view all assessments" ON assessments;
CREATE POLICY "Admins can view all assessments" 
ON assessments FOR SELECT 
USING (is_admin_user());

-- Reports RLS Policies
-- Users can view their own reports
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
CREATE POLICY "Users can view their own reports" 
ON reports FOR SELECT 
USING (user_id = auth.uid());

-- Users can insert their own reports
DROP POLICY IF EXISTS "Users can insert their own reports" ON reports;
CREATE POLICY "Users can insert their own reports" 
ON reports FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Admins can view all reports
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
CREATE POLICY "Admins can view all reports" 
ON reports FOR SELECT 
USING (is_admin_user());

-- Chat Messages RLS Policies
-- Users can view their own chat messages
DROP POLICY IF EXISTS "Users can view their own chat messages" ON chat_messages;
CREATE POLICY "Users can view their own chat messages" 
ON chat_messages FOR SELECT 
USING (user_id = auth.uid());

-- Users can insert their own chat messages
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON chat_messages;
CREATE POLICY "Users can insert their own chat messages" 
ON chat_messages FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Admins can view all chat messages
DROP POLICY IF EXISTS "Admins can view all chat messages" ON chat_messages;
CREATE POLICY "Admins can view all chat messages" 
ON chat_messages FOR SELECT 
USING (is_admin_user());

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name_value TEXT;
BEGIN
  -- Log that the trigger is being executed
  RAISE LOG 'handle_new_user trigger executed for user %', NEW.id;
  
  -- Extract full name from user metadata if available
  full_name_value := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    ''
  );
  
  BEGIN
    -- Use INSERT ... ON CONFLICT to avoid errors if profile already exists
    INSERT INTO public.profiles (user_id, role, full_name)
    VALUES (NEW.id, 'patient', full_name_value)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Log successful insertion
    RAISE LOG 'Profile created/updated for user % with full_name %', NEW.id, full_name_value;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log any errors that occur during profile creation
      RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
      -- Don't raise the error to avoid blocking user creation
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create a profile when a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON TABLE profiles TO postgres, anon, authenticated;
GRANT ALL ON TABLE sessions TO postgres, anon, authenticated;
GRANT ALL ON TABLE assessments TO postgres, anon, authenticated;
GRANT ALL ON TABLE reports TO postgres, anon, authenticated;
GRANT ALL ON TABLE chat_messages TO postgres, anon, authenticated;

-- Grant necessary permissions to service role (for server-side operations)
GRANT ALL ON TABLE profiles TO authenticator;
GRANT ALL ON TABLE sessions TO authenticator;
GRANT ALL ON TABLE assessments TO authenticator;
GRANT ALL ON TABLE reports TO authenticator;
GRANT ALL ON TABLE chat_messages TO authenticator;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);