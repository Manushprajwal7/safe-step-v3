import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  onboarding_completed: boolean;
}

export class AuthService {
  private static instance: AuthService;
  private supabase: ReturnType<typeof createClient>;

  private constructor() {
    this.supabase = createClient();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signUp(email: string, password: string, fullName: string) {
    // Create user with Supabase Auth
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Immediately confirm the user (bypass email confirmation)
    if (data.user && !data.user.email_confirmed_at) {
      const adminClient = this.supabase; // In production, use service role key
      // Update user to be confirmed
      await adminClient.auth.admin.updateUserById(data.user.id, {
        email_confirm: true,
      });
    }

    return data;
  }

  async signIn(email: string, password: string) {
    // Sign in with email and password
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle specific error cases
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Invalid email or password");
      }
      throw new Error(error.message);
    }

    return data;
  }

  async signInWithGoogle() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    redirect("/auth/login");
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Get user profile using the correct column name
    const { data: profile, error: profileError } = await this.supabase
      .from("profiles")
      .select("role, onboarding_completed")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      // Return basic user info if profile not found
      return {
        id: user.id,
        email: user.email || "",
        role: "patient",
        onboarding_completed: false,
      };
    }

    return {
      id: user.id,
      email: user.email || "",
      role: profile.role || "patient",
      onboarding_completed: profile.onboarding_completed || false,
    };
  }

  async requireAuth(): Promise<AuthUser> {
    const user = await this.getCurrentUser();
    if (!user) {
      redirect("/auth/login");
    }
    return user;
  }

  async requireAdmin(): Promise<AuthUser> {
    const user = await this.requireAuth();
    if (user.role !== "admin") {
      redirect("/home");
    }
    return user;
  }
}
