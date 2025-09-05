import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log('Starting OAuth callback');
  
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboard";
  const error = searchParams.get("error");
  
  console.log('OAuth callback params:', { hasCode: !!code, next, error });

  // Handle OAuth errors
  if (error) {
    const errorDescription = searchParams.get('error_description');
    console.error('OAuth error:', { error, errorDescription });
    const errorMessage = `Authentication failed: ${error}${errorDescription ? ` - ${errorDescription}` : ''}`;
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(errorMessage)}`
    );
  }

  // If we have a code, exchange it for a session
  if (!code) {
    console.error('No code provided in OAuth callback');
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent('Authentication failed: No code provided')}`
    );
  }

  const supabase = createClient();
  
  try {
    console.log('Exchanging code for session');
    const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (authError) {
      console.error('Error exchanging code for session:', authError);
      throw authError;
    }
    
    if (!session?.user) {
      console.error('No user returned from OAuth');
      throw new Error('No user returned from OAuth');
    }
    
    console.log('User authenticated:', { userId: session.user.id, email: session.user.email });

    // Get user data
    const userEmail = session.user.email || '';
    const userName = session.user.user_metadata?.name || 
                   session.user.user_metadata?.full_name || 
                   userEmail.split('@')[0] || 'User';
    
    // Check if profile exists - using the correct column name 'user_id' from 004 schema
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error checking profile:', profileError);
      throw profileError;
    }

    // Create profile if it doesn't exist - using the correct schema from 004
    if (!existingProfile) {
      console.log('Creating profile for user:', { id: session.user.id, email: userEmail, name: userName });
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: session.user.id, // Changed from 'id' to 'user_id'
          full_name: userName,      // Changed from 'name' to 'full_name'
          role: 'patient',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
          // Removed onboarding_completed as it doesn't exist in 004 schema
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        throw new Error(`Failed to create user profile: ${insertError.message}`);
      }
      
      console.log('Profile created successfully');
    }

    console.log('Authentication successful, redirecting to:', `${origin}${next}`);
    return NextResponse.redirect(`${origin}${next}`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Auth callback error:', errorMessage);
    
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(`Authentication failed: ${errorMessage}`)}`
    );
  }
}