import { supabase } from './supabase/client';

export interface AuthResponse {
  error: Error | null;
  success: boolean;
}

export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('This function must be called from the client side');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes: 'email profile',
      },
    });
    
    if (error) {
      console.error('Error signing in with Google:', error);
      return { 
        error: new Error(error.message || 'Failed to sign in with Google'), 
        success: false 
      };
    }
    
    return { error: null, success: true };
  } catch (error) {
    console.error('Unexpected error during Google sign in:', error);
    return { 
      error: error instanceof Error ? error : new Error('An unexpected error occurred'), 
      success: false 
    };
  }
};
