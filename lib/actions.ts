"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
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
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
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
      return { error: "Invalid email or password" };
    }

    if (data?.session && data?.user) {
      // Ensure profile exists - create it immediately if it doesn't
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("user_id", data.user.id)
          .single();

        if (profileError && profileError.code === "PGRST116") {
          // Profile doesn't exist, create it immediately
          console.log("Creating profile for user:", data.user.id);
          const { error: createProfileError } = await supabase
            .from("profiles")
            .insert({
              user_id: data.user.id,
              role: "patient",
              full_name: data.user.user_metadata?.full_name || data.user.email,
              onboarding_completed: false,
            });

          if (createProfileError) {
            console.error("Profile creation error:", createProfileError);
            return { error: "Failed to initialize user profile" };
          }
        } else if (profileError) {
          console.error("Profile check error:", profileError);
          // Continue anyway as the profile might exist
        }
      } catch (profileCheckError) {
        console.error("Unexpected error checking profile:", profileCheckError);
        // Continue anyway
      }

      revalidatePath("/", "layout");
      redirect("/home");
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
    // Use admin client to create user without email confirmation
    const adminClient = createAdminClient();

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        full_name: name,
      },
    });

    if (error) {
      // Check if it's a duplicate user error
      if (
        error.message.includes("already registered") ||
        error.message.includes("already in use")
      ) {
        return { error: "This email is already registered. Please sign in." };
      }
      return { error: "Failed to create account" };
    }

    // Redirect to login page with success message
    revalidatePath("/", "layout");
    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
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
    const profileData: any = {
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
    if (diagnosis_date) profileData.diagnosis_date = diagnosis_date;
    if (footwear_type) profileData.footwear_type = footwear_type;
    if (prior_injuries) profileData.prior_injuries = prior_injuries;
    if (blood_sugar_levels) {
      const bloodSugarNum = parseFloat(blood_sugar_levels);
      if (bloodSugarNum > 0) {
        profileData.blood_sugar_mgdl = bloodSugarNum;
      }
    }
    if (foot_symptoms.length > 0) profileData.foot_symptoms = foot_symptoms;
    if (pre_existing_conditions.length > 0)
      profileData.pre_existing_conditions = pre_existing_conditions;

    // Prepare onboarding data for the dedicated onboarding table
    const onboardingData: any = {
      user_id: user.id,
      name,
      age,
      weight_kg: weight,
      height_cm: height,
      gender,
      profession,
      diabetes_type,
      activity_level,
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
    const { data: profileDataResult, error: profileError } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (profileError) {
      console.error("Profile update error:", profileError);
      // Return a more detailed error message
      return {
        error: `Failed to update profile data: ${profileError.message}`,
      };
    }

    // Check if onboarding record already exists
    const { data: existingOnboarding, error: existingError } = await supabase
      .from("onboarding")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error("Error checking existing onboarding data:", existingError);
      return {
        error: `Failed to check onboarding data: ${existingError.message}`,
      };
    }

    let onboardingResult;
    let onboardingError;

    if (existingOnboarding) {
      // Update existing onboarding record
      const { data, error } = await supabase
        .from("onboarding")
        .update(onboardingData)
        .eq("user_id", user.id)
        .select("*")
        .single();

      onboardingError = error;
      onboardingResult = data;
    } else {
      // Insert new onboarding record
      const { data, error } = await supabase
        .from("onboarding")
        .insert(onboardingData)
        .select("*")
        .single();

      onboardingError = error;
      onboardingResult = data;
    }

    if (onboardingError) {
      console.error("Onboarding operation error:", onboardingError);
      return {
        error: `Failed to save onboarding data: ${onboardingError.message}`,
      };
    }

    console.log("Successfully saved profile data:", profileDataResult);
    console.log("Successfully saved onboarding data:", onboardingResult);

    revalidatePath("/", "layout");
    redirect("/home");
  } catch (error: any) {
    console.error("Onboarding completion error:", error);
    return {
      error: `Unexpected error completing onboarding: ${
        error.message || "Unknown error"
      }`,
    };
  }
}
