-- Script to verify that the schema has been correctly applied
-- Run this script to check if all required columns exist

-- Check profiles table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN (
  'user_id',
  'role',
  'onboarding_completed',
  'full_name',
  'age',
  'weight_kg',
  'height_cm',
  'gender',
  'profession',
  'diabetes_type',
  'diagnosis_date',
  'foot_symptoms',
  'pre_existing_conditions',
  'activity_level',
  'footwear_type',
  'prior_injuries',
  'blood_sugar_mgdl'
)
ORDER BY column_name;

-- Check onboarding table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'onboarding' 
ORDER BY column_name;

-- Check if tables exist
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'profiles'
) AS profiles_table_exists;

SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'onboarding'
) AS onboarding_table_exists;

-- Check if RLS is enabled
SELECT 
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname IN ('profiles', 'onboarding')
AND relkind = 'r';

-- Check if triggers exist
SELECT 
  tgname AS trigger_name,
  relname AS table_name
FROM pg_trigger
JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
WHERE relname IN ('profiles', 'onboarding', 'auth_users')
ORDER BY table_name, trigger_name;