# Onboarding Implementation

This document explains the onboarding system implementation for the application.

## Database Schema

The onboarding system uses two tables:

1. **profiles** - Stores basic user information and onboarding status
2. **onboarding** - Stores detailed health information collected during onboarding

### Profiles Table

The profiles table has been extended with additional fields to store onboarding data:

- `user_id` (UUID) - References auth.users
- `role` (TEXT) - User role (patient/admin)
- `onboarding_completed` (BOOLEAN) - Whether onboarding is completed
- `full_name` (TEXT) - User's full name
- `age` (INTEGER) - User's age
- `weight_kg` (NUMERIC) - User's weight in kilograms
- `height_cm` (NUMERIC) - User's height in centimeters
- `gender` (TEXT) - User's gender
- `profession` (TEXT) - User's profession
- `diabetes_type` (TEXT) - Type of diabetes
- `diagnosis_date` (DATE) - Diabetes diagnosis date
- `foot_symptoms` (TEXT[]) - Array of foot symptoms
- `pre_existing_conditions` (TEXT[]) - Array of pre-existing conditions
- `activity_level` (TEXT) - User's activity level
- `footwear_type` (TEXT) - User's primary footwear type
- `prior_injuries` (TEXT) - Description of prior injuries
- `blood_sugar_mgdl` (NUMERIC) - Recent blood sugar level
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record update timestamp

### Onboarding Table

The dedicated onboarding table stores the same detailed information:

- `id` (UUID) - Primary key
- `user_id` (UUID) - References auth.users (unique)
- `name` (TEXT) - User's name
- `age` (INTEGER) - User's age
- `weight_kg` (NUMERIC) - User's weight in kilograms
- `height_cm` (NUMERIC) - User's height in centimeters
- `gender` (TEXT) - User's gender
- `profession` (TEXT) - User's profession
- `diabetes_type` (TEXT) - Type of diabetes
- `diagnosis_date` (DATE) - Diabetes diagnosis date
- `foot_symptoms` (TEXT[]) - Array of foot symptoms
- `pre_existing_conditions` (TEXT[]) - Array of pre-existing conditions
- `activity_level` (TEXT) - User's activity level
- `footwear_type` (TEXT) - User's primary footwear type
- `prior_injuries` (TEXT) - Description of prior injuries
- `blood_sugar_mgdl` (NUMERIC) - Recent blood sugar level
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record update timestamp

## Implementation Details

### Frontend

The onboarding form is implemented as a multi-step process in [components/patient/onboarding-form.tsx](file:///c:/Users/Manus/OneDrive/Desktop/projecs/ss-V3/components/patient/onboarding-form.tsx). It collects the following information:

1. Personal Information (name, age, weight, height, gender)
2. Health Profile (profession, activity level, footwear type)
3. Medical History (diabetes type, diagnosis date, pre-existing conditions, blood sugar levels)
4. Foot Health (foot symptoms, prior injuries)

### Backend

The backend implementation consists of:

1. **Server Actions** - The [completeOnboarding](file:///c:/Users/Manus/OneDrive/Desktop/projecs/ss-V3/lib/actions.ts#L242-L306) function in [lib/actions.ts](file:///c:/Users/Manus/OneDrive/Desktop/projecs/ss-V3/lib/actions.ts) handles form submission and saves data to both tables.

2. **API Routes** - The [app/api/onboarding/route.ts](file:///c:/Users/Manus/OneDrive/Desktop/projecs/ss-V3/app/api/onboarding/route.ts) file provides REST endpoints for:
   - GET - Retrieve onboarding data for the current user
   - POST - Create/update onboarding data
   - PUT - Update onboarding data

### Data Flow

1. User completes the onboarding form
2. Form data is submitted to the [completeOnboarding](file:///c:/Users/Manus/OneDrive/Desktop/projecs/ss-V3/lib/actions.ts#L242-L306) server action
3. Server action validates and processes the data
4. Data is saved to both the profiles and onboarding tables
5. User is redirected to the home page
6. The [onboarding_completed](file:///c:/Users/Manus/OneDrive/Desktop/projecs/ss-V3/scripts/auth-schema.sql#L75-L75) flag in the profiles table is set to true

## Testing

A test endpoint is available at `/api/onboarding/test` with:

- GET - Retrieve current user's profile and onboarding data
- POST - Insert sample onboarding data for testing

## Security

Row Level Security (RLS) policies ensure that users can only access their own data:

- Users can view their own profile/onboarding data
- Users can update their own profile/onboarding data
- Users can insert their own profile/onboarding data

## Database Setup

To set up the database schema, run the SQL script in [scripts/auth-schema.sql](file:///c:/Users/Manus/OneDrive/Desktop/projecs/ss-V3/scripts/auth-schema.sql):

```bash
# Run this script in your Supabase SQL editor
scripts/auth-schema.sql
```
