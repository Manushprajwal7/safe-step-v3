# Google OAuth Implementation Guide

This document explains how to properly configure and use Google OAuth in the Safe Step application.

## Overview

The Safe Step application supports Google OAuth for user authentication. This allows users to sign in or sign up using their Google accounts, providing a seamless authentication experience.

## Prerequisites

Before implementing Google OAuth, ensure you have:

1. A Google Cloud Project with OAuth 2.0 credentials
2. Properly configured environment variables
3. Supabase Auth configured with Google OAuth provider

## Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add the following authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://yourdomain.com/auth/callback` (for production)
7. Save the credentials and note the Client ID and Client Secret

## Supabase Configuration

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Enable the Google provider
4. Enter the Google Client ID and Client Secret from the Google Cloud Console
5. Set the redirect URL to `http://localhost:3000/auth/callback` (or your production URL)
6. Save the configuration

## Environment Variables

Ensure your `.env` file contains the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Implementation Details

### OAuth Flow

1. User clicks "Sign in with Google" or "Sign up with Google"
2. The application redirects the user to Google's OAuth consent screen
3. User grants permission to the application
4. Google redirects the user back to the application's callback URL (`/auth/callback`)
5. The application exchanges the authorization code for an access token
6. User session is created and user is redirected to the appropriate page

### Key Files

1. **`/app/auth/login/page.tsx`** - Login page with Google OAuth button
2. **`/app/auth/register/page.tsx`** - Registration page with Google OAuth button
3. **`/app/auth/callback/route.ts`** - OAuth callback handler
4. **`/lib/auth-service.ts`** - Authentication service with Google OAuth methods

### Code Implementation

#### Login Page Google OAuth

```typescript
const handleGoogleSignIn = async () => {
  try {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) throw error;

    if (data?.url) {
      window.location.href = data.url;
    }
  } catch (error: any) {
    console.error("Google Sign In Error:", error);
    toast.error(error.message || "Failed to sign in with Google");
  } finally {
    setIsLoading(false);
  }
};
```

#### Register Page Google OAuth

```typescript
const handleGoogleSignUp = async () => {
  try {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) throw error;

    if (data?.url) {
      window.location.href = data.url;
    }
  } catch (error: any) {
    console.error("Google Sign Up Error:", error);
    toast.error(error.message || "Failed to sign up with Google");
  } finally {
    setIsLoading(false);
  }
};
```

#### OAuth Callback Handler

```typescript
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboard";
  const error = searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    // ... error handling
  }

  // Exchange code for session
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.exchangeCodeForSession(code);

  // Ensure user profile exists
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", session.user.id)
    .single();

  // If no profile exists, create one
  if (profileError || !profileData) {
    await supabase.from("profiles").insert({
      user_id: session.user.id,
      role: "patient",
      full_name:
        session.user.user_metadata?.full_name || session.user.email || "",
      onboarding_completed: false,
    });
  }

  // Redirect user
  return NextResponse.redirect(`${origin}${next}`);
}
```

## Testing

To test the Google OAuth implementation:

1. Start your development server: `npm run dev`
2. Navigate to the login or registration page
3. Click the "Sign in with Google" or "Sign up with Google" button
4. Complete the Google authentication flow
5. Verify that you are redirected to the correct page after authentication

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**: Ensure the redirect URIs in Google Cloud Console match your application's callback URL
2. **Invalid Client ID/Secret**: Verify that the credentials entered in Supabase match those from Google Cloud Console
3. **Profile Creation Failures**: Check that the database trigger for profile creation is working correctly
4. **Session Issues**: Clear browser cookies and try again

### Debugging

Enable debug logging by setting `DEBUG=1` in your environment variables to see detailed authentication logs.

## Security Considerations

1. **Secure Redirect URLs**: Always use HTTPS in production
2. **Access Type**: Use `access_type: "offline"` to get refresh tokens
3. **Prompt Consent**: Use `prompt: "consent"` to ensure users see the consent screen
4. **Environment Variables**: Keep sensitive credentials in environment variables, not in code
