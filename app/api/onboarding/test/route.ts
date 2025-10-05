import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();

  const supabase = createServerClient(
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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Get onboarding data
  const { data: onboarding, error: onboardingError } = await supabase
    .from("onboarding")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    profileError,
    onboarding,
    onboardingError,
  });
}

export async function POST(req: Request) {
  const cookieStore = cookies();

  const supabase = createServerClient(
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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Sample onboarding data for testing
  const sampleData = {
    name: "John Doe",
    age: 45,
    weight_kg: 75.5,
    height_cm: 180,
    gender: "male",
    profession: "sedentary",
    diabetes_type: "type2",
    diagnosis_date: "2020-05-15",
    foot_symptoms: ["Numbness", "Tingling"],
    pre_existing_conditions: ["Hypertension", "Obesity"],
    activity_level: "light",
    footwear_type: "Athletic shoes",
    prior_injuries: "None",
    blood_sugar_mgdl: 145,
  };

  // Save to onboarding table
  const { data: onboardingData, error: onboardingError } = await supabase
    .from("onboarding")
    .upsert({ ...sampleData, user_id: user.id })
    .select()
    .single();

  // Also update profile
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: sampleData.name,
      age: sampleData.age,
      weight_kg: sampleData.weight_kg,
      height_cm: sampleData.height_cm,
      gender: sampleData.gender,
      profession: sampleData.profession,
      diabetes_type: sampleData.diabetes_type,
      activity_level: sampleData.activity_level,
      diagnosis_date: sampleData.diagnosis_date,
      footwear_type: sampleData.footwear_type,
      prior_injuries: sampleData.prior_injuries,
      blood_sugar_mgdl: sampleData.blood_sugar_mgdl,
      foot_symptoms: sampleData.foot_symptoms,
      pre_existing_conditions: sampleData.pre_existing_conditions,
      onboarding_completed: true,
    })
    .eq("user_id", user.id)
    .select()
    .single();

  return NextResponse.json({
    success: true,
    onboardingData,
    profileData,
    onboardingError,
    profileError,
  });
}
