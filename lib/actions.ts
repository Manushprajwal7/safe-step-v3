"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { supabaseUrl, supabaseKey };
}

function makeServerActionClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  const cookieStore = cookies();
  return createServerActionClient(
    { cookies: () => cookieStore },
    { supabaseUrl, supabaseKey }
  );
}

/* ---------------- SIGN IN ---------------- */
export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Email and password are required" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "Please enter a valid email address" };

  let supabase;
  try {
    supabase = makeServerActionClient();
  } catch (e: any) {
    console.error("Supabase init error:", e);
    return { error: "Authentication service unavailable." };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error);
      if (error.message.includes("Invalid login credentials"))
        return { error: "Invalid email or password. Please try again." };
      return { error: error.message || "Failed to sign in." };
    }

    if (!data.session || !data.user) {
      return { error: "Authentication failed. No session created." };
    }

    // Ensure profile exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (!profile) {
      const userEmail = data.user.email || "";
      const fullName =
        data.user.user_metadata?.name ||
        data.user.user_metadata?.full_name ||
        userEmail.split("@")[0] ||
        "User";

      const { error: insertError } = await supabase.from("profiles").insert({
        user_id: data.user.id,
        full_name: fullName,
        role: "patient",
      });

      if (insertError) console.error("Profile insert failed:", insertError);
    }

    revalidatePath("/", "layout");
    redirect("/home"); // 👈 redirect users where you want after login
  } catch (error) {
    console.error("Unexpected sign in error:", error);
    return { error: "Unexpected error. Please try again." };
  }
}

/* ---------------- SIGN UP ---------------- */
export async function signUp(prevState: any, formData: FormData) {
  const name = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) return { error: "All fields are required" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "Please enter a valid email address" };
  if (password.length < 6)
    return { error: "Password must be at least 6 characters long" };

  let supabase;
  try {
    supabase = makeServerActionClient();
  } catch (e: any) {
    return { error: "Authentication service unavailable." };
  }

  try {
    // Create user (email confirmation must be disabled in dashboard)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      console.error("Sign up error:", error);
      if (
        error.message.includes("already registered") ||
        error.message.includes("already in use")
      ) {
        return { error: "This email is already registered. Please sign in." };
      }
      return { error: error.message || "Failed to sign up." };
    }

    // Ensure profile exists
    if (data.user) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from("profiles").insert({
          user_id: data.user.id,
          full_name: name,
          role: "patient",
        });
      }
    }

    // Auto-login immediately
    const { data: signinData, error: signinError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signinError) {
      console.error("Auto sign-in error:", signinError);
      return { error: "Account created but login failed." };
    }

    if (signinData?.session) {
      revalidatePath("/", "layout");
      redirect("/onboard"); // 👈 first page after signup
    }

    return { error: "Unexpected error after signup." };
  } catch (error) {
    console.error("Unexpected sign up error:", error);
    return { error: "Unexpected error. Please try again." };
  }
}

/* ---------------- SIGN OUT ---------------- */
export async function signOut() {
  let supabase;
  try {
    supabase = makeServerActionClient();
  } catch {
    redirect("/auth/login");
  }

  await supabase!.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

/* ---------------- UPDATE PROFILE ---------------- */
export async function updateProfile(prevState: any, formData: FormData) {
  let supabase;
  try {
    supabase = makeServerActionClient();
  } catch (e: any) {
    return { error: e?.message || "Supabase not configured" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  try {
    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      full_name: formData.get("full_name")?.toString() || null,
      role: "patient",
    });

    if (error) {
      console.error("Profile update error:", error);
      return { error: "Failed to update profile." };
    }

    revalidatePath("/", "layout");
    redirect("/home");
  } catch (error) {
    console.error("Profile update unexpected error:", error);
    return { error: "Unexpected error updating profile." };
  }
}
