import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  onboarding_completed: boolean;
}

export async function getCurrentUser() {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Get user profile using the correct column name from the new schema
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, onboarding_completed")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      // If profile doesn't exist, return basic user info
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
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") {
    redirect("/home");
  }
  return user;
}

export async function requireOnboardingCompleted() {
  const user = await requireAuth();
  if (!user.onboarding_completed) {
    redirect("/onboard");
  }
  return user;
}
