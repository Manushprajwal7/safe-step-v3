"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "./supabase/server";

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
    // First, try normal sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If it's an email confirmation error, bypass it using admin client
    if (error && error.message.includes("Email not confirmed")) {
      const adminClient = createAdminClient();

      // Get the user directly
      const {
        data: { users },
        error: listUsersError,
      } = await adminClient.auth.admin.listUsers();

      if (listUsersError) {
        console.error("List users error:", listUsersError);
        return { error: "Authentication failed." };
      }

      // Find the user with the matching email
      const user = users.find((u) => u.email === email);

      if (!user) {
        return {
          error: "No account found with this email. Please sign up first.",
        };
      }

      // Since we can't directly create sessions, we'll mark the user as confirmed
      // and then try to sign in again
      const { error: updateError } =
        await adminClient.auth.admin.updateUserById(user.id, {
          email_confirm: true,
        });

      if (updateError) {
        console.error("Update user error:", updateError);
        return { error: "Authentication failed." };
      }

      // Now try to sign in again
      const { data: retryData, error: retryError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (retryError) {
        console.error("Retry sign in error:", retryError);
        if (retryError.message.includes("Invalid login credentials"))
          return { error: "Invalid email or password. Please try again." };
        return { error: retryError.message || "Failed to sign in." };
      }

      // Use the retry data for the rest of the flow
      if (retryData?.session && retryData?.user) {
        // Continue with the successful authentication
        // Profile should be created by trigger or handled by auth context
        revalidatePath("/", "layout");
        redirect("/home"); // 👈 redirect users where you want after login
      } else {
        return { error: "Authentication failed." };
      }
    } else if (error) {
      // For other errors, check if it's because the user doesn't exist
      if (error.message.includes("Invalid login credentials")) {
        return {
          error: "No account found with this email. Please sign up first.",
        };
      }
      // For other errors
      console.error("Sign in error:", error);
      if (error.message.includes("Invalid login credentials"))
        return { error: "Invalid email or password. Please try again." };
      return { error: error.message || "Failed to sign in." };
    }

    // If we have data, proceed with normal flow
    if (data?.session && data?.user) {
      // Profile should be created by trigger or handled by auth context
      revalidatePath("/", "layout");
      redirect("/home"); // 👈 redirect users where you want after login
    }
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
    console.error("Supabase client initialization error:", e);
    return { error: "Authentication service unavailable." };
  }

  try {
    // Use admin client to bypass email confirmation
    const adminClient = createAdminClient();

    console.log("Attempting to create user with email:", email);

    // Create user with email confirmation disabled
    const { data: userData, error: signUpError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Mark as confirmed immediately
        user_metadata: { full_name: name },
      });

    if (signUpError) {
      console.error("Sign up error details:", {
        message: signUpError.message,
        status: signUpError.status,
        code: signUpError.code,
        error: signUpError,
      });
      // Check if it's a duplicate user error
      if (
        signUpError.message.includes("already registered") ||
        signUpError.message.includes("already in use") ||
        signUpError.message.includes("duplicate") ||
        signUpError.message.includes("unique constraint")
      ) {
        return { error: "This email is already registered. Please sign in." };
      }
      return { error: signUpError.message || "Failed to sign up." };
    }

    console.log("User created successfully:", userData?.user?.id);

    // Since we're using admin client, the profile creation trigger won't fire
    // Manually create the profile with only the columns that exist
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: userData.user.id,
      role: "patient",
      onboarding_completed: false,
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Don't fail the signup if profile creation fails, but log it
    } else {
      console.log("Profile created successfully for user:", userData.user.id);
    }

    // Instead of auto-login, redirect to login page with success message
    revalidatePath("/", "layout");
    return {
      success: true,
      message:
        "Your account has been created successfully. Please login to proceed.",
    };
  } catch (error: any) {
    console.error("Unexpected sign up error:", {
      message: error.message,
      stack: error.stack,
      error: error,
    });
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
    // Use update instead of upsert to avoid conflicts
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.get("full_name")?.toString() || null,
      })
      .eq("user_id", user.id);

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

/* ---------------- COMPLETE ONBOARDING ---------------- */
export async function completeOnboarding(prevState: any, formData: FormData) {
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
    // Extract form data
    const name = formData.get("name") as string;
    const age = parseInt(formData.get("age") as string);
    const weight = parseFloat(formData.get("weight") as string);
    const height = parseFloat(formData.get("height") as string);
    const gender = formData.get("gender") as string;
    const profession = formData.get("profession") as string;
    const diabetes_type = formData.get("diabetes_type") as string;
    const activity_level = formData.get("activity_level") as string;
    const diagnosis_date =
      (formData.get("diagnosis_date") as string) || undefined;
    const footwear_type =
      (formData.get("footwear_type") as string) || undefined;
    const prior_injuries =
      (formData.get("prior_injuries") as string) || undefined;
    const blood_sugar_levels =
      (formData.get("blood_sugar_levels") as string) || undefined;

    // Handle arrays
    const foot_symptoms_str = formData.get("foot_symptoms") as string;
    const foot_symptoms = foot_symptoms_str ? foot_symptoms_str.split(",") : [];

    const pre_existing_conditions_str = formData.get(
      "pre_existing_conditions"
    ) as string;
    const pre_existing_conditions = pre_existing_conditions_str
      ? pre_existing_conditions_str.split(",")
      : [];

    // Prepare onboarding data to store in profiles table
    const onboardingData: any = {
      full_name: name,
      age,
      weight_kg: weight,
      height_cm: height,
      gender,
      profession,
      diabetes_type,
      activity_level,
      onboarding_completed: true, // Mark onboarding as completed
    };

    // Add optional fields if they exist
    if (diagnosis_date) onboardingData.diagnosis_date = diagnosis_date;
    if (footwear_type) onboardingData.footwear_type = footwear_type;
    if (prior_injuries) onboardingData.prior_injuries = prior_injuries;
    if (blood_sugar_levels) {
      const bloodSugarNum = parseFloat(blood_sugar_levels);
      if (bloodSugarNum > 0) {
        onboardingData.blood_sugar_mgdl = bloodSugarNum;
      }
    }
    if (foot_symptoms.length > 0) onboardingData.foot_symptoms = foot_symptoms;
    if (pre_existing_conditions.length > 0)
      onboardingData.pre_existing_conditions = pre_existing_conditions;

    // Update the user's profile with onboarding data and mark as completed
    const { data, error } = await supabase
      .from("profiles")
      .update(onboardingData)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      console.error("Database error:", error);
      return { error: "Failed to save onboarding data." };
    }

    console.log("Successfully saved onboarding data:", data);

    revalidatePath("/", "layout");
    redirect("/home");
  } catch (error) {
    console.error("Onboarding completion error:", error);
    return { error: "Unexpected error completing onboarding." };
  }
}
