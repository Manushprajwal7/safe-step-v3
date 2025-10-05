# Authentication System

This document describes the new simplified authentication system for the Safe Step application.

## Overview

The authentication system uses Supabase Auth with email and password only, without email confirmation requirements. Users can sign up and immediately log in to the application.

## Key Features

1. **Email/Password Authentication Only**: No OAuth providers or email confirmation steps
2. **Immediate Access**: Users can log in immediately after registration
3. **Automatic Profile Creation**: User profiles are automatically created via database triggers
4. **Simple API**: Clean, minimal API endpoints for authentication operations
5. **Onboarding System**: Comprehensive health data collection for new users

## Database Schema

The authentication system uses the following tables:

### `profiles` Table

```sql
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
```

### `onboarding` Table

```sql
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
```

### Triggers

A database trigger automatically creates a profile when a new user is registered:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, full_name, onboarding_completed)
  VALUES (
    NEW.id,
    'patient',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, ''),
    FALSE
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## API Endpoints

### `/api/auth/register` (POST)

- Creates a new user account
- Requires: `full_name`, `email`, `password`
- Returns: Success message or error

### `/api/auth/login` (POST)

- Authenticates a user
- Requires: `email`, `password`
- Returns: User session data or error

### `/api/auth/logout` (POST)

- Signs out the current user
- Returns: Success confirmation

### `/api/auth/me` (GET)

- Gets the current user's profile information
- Returns: User data including role and onboarding status

### `/api/onboarding` (GET, POST, PUT)

- Manages detailed onboarding data
- GET: Retrieve onboarding data for current user
- POST: Create/update onboarding data
- PUT: Update onboarding data

## Implementation Details

### User Registration Flow

1. User submits registration form with name, email, and password
2. Server uses Supabase Admin client to create user with `email_confirm: true`
3. Database trigger automatically creates user profile
4. User is redirected to login page with success message

### User Login Flow

1. User submits login form with email and password
2. Server authenticates credentials using Supabase client
3. On success, user is redirected to their dashboard
4. User profile data is loaded into the application context

### Onboarding Flow

1. After login, users are redirected to `/onboard` if [onboarding_completed](file:///c:/Users/Manus/OneDrive/Desktop/projecs/ss-V3/scripts/auth-schema.sql#L75-L75) is false
2. Users complete a multi-step form collecting health information
3. Data is saved to both profiles and onboarding tables
4. [onboarding_completed](file:///c:/Users/Manus/OneDrive/Desktop/projecs/ss-V3/scripts/auth-schema.sql#L75-L75) flag is set to true
5. User is redirected to home page

### Profile Management

- Profiles are automatically created when users register
- Profile data includes role and onboarding status
- Additional profile fields are populated during onboarding
- Detailed health data is stored in the dedicated onboarding table

## Security Considerations

1. **Admin Client Usage**: The admin client is used only for user creation to bypass email confirmation
2. **Row Level Security**: Both profiles and onboarding tables use RLS to ensure users can only access their own data
3. **Password Policies**: Minimum 6-character password requirement
4. **Input Validation**: All inputs are validated on both client and server side

## Environment Variables

The authentication system requires the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Setup Instructions

1. Run the SQL schema script in `scripts/auth-schema.sql`
2. Configure the required environment variables
3. The authentication and onboarding system is ready to use

## Error Handling

All authentication and onboarding errors are handled gracefully with user-friendly error messages:

- Invalid credentials
- Duplicate email addresses
- Missing required fields
- Network/server errors
- Validation errors

## Testing

Use the `/api/auth/test` endpoint to verify authentication status.
Use the `/api/onboarding/test` endpoint to verify onboarding data.
