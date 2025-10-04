# Authentication System

## Overview

This document explains the authentication system implementation for the Safe Step application. The system supports email/password authentication and Google OAuth, with automatic user profile creation and role management.

## Features

1. **Email/Password Authentication**

   - Users can register with email and password
   - Users can log in with email and password
   - No email confirmation required (bypassed by default)

2. **Google OAuth**

   - Users can sign in/sign up with Google
   - Automatic profile creation for new Google users

3. **Role-Based Access Control**

   - Supports `patient`, `doctor`, and `admin` roles
   - Automatic redirection based on user role

4. **Session Management**
   - Secure session handling with Supabase Auth
   - Middleware protection for routes
   - Automatic redirection for authenticated/unauthenticated users

## Implementation Details

### Database Schema

The authentication system uses the following tables:

1. **auth.users** - Supabase Auth managed table for user accounts
2. **public.profiles** - Custom table for user profiles with additional information

Profiles table structure:

```sql
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'patient',
  full_name text,
  age smallint check (age is null or age between 1 and 120),
  weight_kg numeric(5,2) check (weight_kg is null or weight_kg between 0 and 500),
  height_cm numeric(5,2) check (height_cm is null or height_cm between 0 and 300),
  gender text check (gender in ('male','female','other') or gender is null),
  profession text,
  diabetes public.diabetes_type default 'unspecified',
  diagnosis_date date,
  symptoms text[],
  conditions text[],
  activity_level text,
  footwear_type text,
  prior_injuries text,
  blood_sugar_mg_dl numeric(6,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### Key Files

1. **`/app/auth/login/page.tsx`** - Login page with email/password and Google OAuth
2. **`/app/auth/register/page.tsx`** - Registration page with email/password and Google OAuth
3. **`/app/auth/callback/route.ts`** - OAuth callback handler
4. **`/lib/supabase/middleware.ts`** - Middleware for route protection
5. **`/lib/auth-server.ts`** - Server-side authentication utilities
6. **`/hooks/use-auth.ts`** - Client-side authentication hook
7. **`/context/auth-context.tsx`** - Authentication context provider
8. **`/app/api/auth/bypass-confirm/route.ts`** - API route to bypass email confirmation
9. **`/lib/auth-utils.ts`** - Utility functions for user confirmation

### Authentication Flow

1. **Registration**

   - User fills registration form or uses Google OAuth
   - User account created in `auth.users`
   - Profile automatically created in `public.profiles`
   - User automatically confirmed (no email confirmation required)
   - User redirected to onboarding

2. **Login**

   - User provides credentials or uses Google OAuth
   - Session created and stored
   - User redirected based on role and onboarding status

3. **Session Management**
   - Middleware checks session on protected routes
   - Automatic redirection for authenticated/unauthenticated users
   - Profile data fetched on login to determine role and onboarding status

### Role-Based Redirection

- **Unauthenticated users**: Redirected to `/auth/login`
- **Authenticated users with incomplete onboarding**: Redirected to `/onboard`
- **Authenticated patients**: Redirected to `/home`
- **Authenticated admins**: Redirected to `/admin/dashboard`

### Bypassing Email Confirmation

The system is configured to bypass email confirmation for all users. This is achieved by:

1. **Automatic confirmation at signup**: Database trigger automatically confirms users when they sign up
2. **Server-side confirmation**: Utility functions can confirm users programmatically
3. **Client-side bypass**: Login page automatically handles unconfirmed users by confirming them
4. **Admin client confirmation**: Server actions use admin privileges to confirm users immediately

## Usage Examples

### Protecting a Page Server-Side

```typescript
import { requireAuth } from "@/lib/auth-server";

export default async function ProtectedPage() {
  const user = await requireAuth();

  return <div>Protected content for {user.email}</div>;
}
```

### Protecting a Page Client-Side

```typescript
"use client";

import { useAuth } from "@/hooks/use-auth";

export default function ProtectedPage() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  return <div>Protected content for {user.email}</div>;
}
```

### Checking for Admin Role

```typescript
import { requireAdmin } from "@/lib/auth-server";

export default async function AdminPage() {
  const user = await requireAdmin();

  return <div>Admin only content</div>;
}
```

## Environment Variables

The authentication system requires the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=your_site_url
```

## Security Considerations

1. **Session Security**: Uses secure, HTTP-only cookies for session management
2. **Route Protection**: Middleware ensures only authenticated users can access protected routes
3. **Role-Based Access**: Server-side validation of user roles for sensitive operations
4. **Password Security**: Passwords are hashed and stored securely by Supabase Auth
5. **OAuth Security**: Uses Supabase's secure OAuth implementation with proper redirect handling

## Troubleshooting

### Common Issues

1. **Redirect Loops**: Ensure middleware is properly configured and environment variables are set
2. **Profile Creation Failures**: Check database schema matches implementation
3. **OAuth Failures**: Verify Google OAuth configuration in Supabase dashboard
4. **Session Issues**: Clear browser cookies and try again
5. **Email Confirmation Errors**: System automatically bypasses confirmation but logs errors

### Debugging

Enable debug logging by setting `DEBUG=1` in your environment variables to see detailed authentication logs.

### Database Scripts

To fix existing unconfirmed users, run the script at `scripts/fix-unconfirmed-users.sql`.

To automatically confirm new users at signup, ensure the trigger in `scripts/005-auto-confirm-users.sql` is applied to your database.
