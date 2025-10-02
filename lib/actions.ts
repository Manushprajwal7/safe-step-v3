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
        // Ensure profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("user_id", retryData.user.id)
          .maybeSingle();

        if (!profile) {
          const userEmail = retryData.user.email || "";
          const fullName =
            retryData.user.user_metadata?.name ||
            retryData.user.user_metadata?.full_name ||
            userEmail.split("@")[0] ||
            "User";

          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              user_id: retryData.user.id,
              full_name: fullName,
              role: "patient",
            });

          if (insertError) console.error("Profile insert failed:", insertError);
        }

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
    return { error: "Authentication service unavailable." };
  }

  try {
    // Use admin client to bypass email confirmation
    const adminClient = createAdminClient();

    // Create user with email confirmation disabled
    const { data: userData, error: signUpError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Mark as confirmed immediately
        user_metadata: { full_name: name },
      });

    if (signUpError) {
      console.error("Sign up error:", signUpError);
      if (
        signUpError.message.includes("already registered") ||
        signUpError.message.includes("already in use")
      ) {
        return { error: "This email is already registered. Please sign in." };
      }
      return { error: signUpError.message || "Failed to sign up." };
    }

    // Ensure profile exists
    if (userData.user) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from("profiles").insert({
          user_id: userData.user.id,
          full_name: name,
          role: "patient",
        });
      }
    }

    // Auto-login immediately using regular client since user is confirmed
    const { data: signinData, error: signinError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signinError) {
      console.error("Auto-login error:", signinError);
      // Even if sign-in fails, redirect to onboarding since account was created
      revalidatePath("/", "layout");
      redirect("/onboard"); // 👈 first page after signup
    }

    if (signinData?.session) {
      revalidatePath("/", "layout");
      redirect("/onboard"); // 👈 first page after signup
    }

    // If we get here, redirect to onboarding anyway
    revalidatePath("/", "layout");
    redirect("/onboard");
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

    // Prepare payload
    const payload: any = {
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
    if (diagnosis_date) payload.diagnosis_date = diagnosis_date;
    if (footwear_type) payload.footwear_type = footwear_type;
    if (prior_injuries) payload.prior_injuries = prior_injuries;
    if (blood_sugar_levels) {
      const bloodSugarNum = parseFloat(blood_sugar_levels);
      if (bloodSugarNum > 0) {
        payload.blood_sugar_mgdl = bloodSugarNum;
      }
    }
    if (foot_symptoms.length > 0) payload.foot_symptoms = foot_symptoms;
    if (pre_existing_conditions.length > 0)
      payload.pre_existing_conditions = pre_existing_conditions;

    console.log("Saving onboarding data:", payload);

    // Check if user already has onboarding data
    const { data: existingData, error: existingError } = await supabase
      .from("onboarding")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error("Error checking existing onboarding data:", existingError);
      return { error: "Failed to check existing onboarding data." };
    }

    let data, error;

    if (existingData) {
      // Update existing record
      console.log("Updating existing onboarding record for user:", user.id);
      const result = await supabase
        .from("onboarding")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .select("*")
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new record
      console.log("Creating new onboarding record for user:", user.id);
      const result = await supabase
        .from("onboarding")
        .insert({ ...payload, user_id: user.id })
        .select("*")
        .single();
      data = result.data;
      error = result.error;
    }

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
