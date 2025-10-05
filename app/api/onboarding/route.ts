import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "../_lib/supabase";

const OnboardSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().int().min(1).max(120),
  weight_kg: z.number().positive(),
  height_cm: z.number().positive(),
  gender: z.string().min(1, "Gender is required"),
  profession: z.string().min(1, "Profession is required"),
  diabetes_type: z.enum(["type1", "type2", "prediabetic", "none"]),
  diagnosis_date: z.string().optional(), // ISO date
  foot_symptoms: z.array(z.string()).optional().default([]),
  pre_existing_conditions: z.array(z.string()).optional().default([]),
  activity_level: z.string().min(1, "Activity level is required"),
  footwear_type: z.string().optional().default(""),
  prior_injuries: z.string().optional().default(""),
  blood_sugar_mgdl: z.number().optional(),
});

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("onboarding")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return NextResponse.json({ data: data ?? null });
  } catch (e: any) {
    console.error("Onboarding GET error:", e);
    return NextResponse.json(
      { error: e.message ?? "Error" },
      { status: e.status ?? 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received onboarding data:", JSON.stringify(body, null, 2));

    // Validate the data
    const parsed = OnboardSchema.parse(body);
    console.log("Parsed onboarding data:", JSON.stringify(parsed, null, 2));

    const { supabase, user } = await requireUser();
    console.log("User ID:", user.id);

    // Check if user already has onboarding data
    const { data: existingData, error: existingError } = await supabase
      .from("onboarding")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error("Error checking existing onboarding data:", existingError);
      throw existingError;
    }

    let data, error;

    if (existingData) {
      // Update existing record
      console.log("Updating existing onboarding record for user:", user.id);
      const result = await supabase
        .from("onboarding")
        .update({ ...parsed, updated_at: new Date().toISOString() })
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
        .insert({ ...parsed, user_id: user.id })
        .select("*")
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    // Also update the profiles table
    const profileUpdate = await supabase
      .from("profiles")
      .update({
        full_name: parsed.name,
        age: parsed.age,
        weight_kg: parsed.weight_kg,
        height_cm: parsed.height_cm,
        gender: parsed.gender,
        profession: parsed.profession,
        diabetes_type: parsed.diabetes_type,
        activity_level: parsed.activity_level,
        diagnosis_date: parsed.diagnosis_date,
        footwear_type: parsed.footwear_type,
        prior_injuries: parsed.prior_injuries,
        blood_sugar_mgdl: parsed.blood_sugar_mgdl,
        foot_symptoms: parsed.foot_symptoms,
        pre_existing_conditions: parsed.pre_existing_conditions,
        onboarding_completed: true,
      })
      .eq("user_id", user.id);

    if (profileUpdate.error) {
      console.error("Profile update error:", profileUpdate.error);
      // Don't throw here as the main onboarding data was saved successfully
      // But log it for debugging
    }

    console.log(
      "Successfully saved onboarding data:",
      JSON.stringify(data, null, 2)
    );
    return NextResponse.json({ data });
  } catch (e: any) {
    console.error("Onboarding POST error:", e);
    if (e instanceof z.ZodError) {
      console.error("Validation errors:", e.errors);
      return NextResponse.json(
        { error: "Validation failed", issues: e.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: e.message ?? "Error saving onboarding data" },
      { status: e.status ?? 400 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const parsed = OnboardSchema.partial().parse(body);
    const { supabase, user } = await requireUser();

    const { data, error } = await supabase
      .from("onboarding")
      .update({ ...parsed, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) throw error;

    // Also update the profiles table
    const profileUpdate = await supabase
      .from("profiles")
      .update({
        full_name: parsed.name,
        age: parsed.age,
        weight_kg: parsed.weight_kg,
        height_cm: parsed.height_cm,
        gender: parsed.gender,
        profession: parsed.profession,
        diabetes_type: parsed.diabetes_type,
        activity_level: parsed.activity_level,
        diagnosis_date: parsed.diagnosis_date,
        footwear_type: parsed.footwear_type,
        prior_injuries: parsed.prior_injuries,
        blood_sugar_mgdl: parsed.blood_sugar_mgdl,
        foot_symptoms: parsed.foot_symptoms,
        pre_existing_conditions: parsed.pre_existing_conditions,
        onboarding_completed: true,
      })
      .eq("user_id", user.id);

    if (profileUpdate.error) {
      console.error("Profile update error:", profileUpdate.error);
      // Don't throw here as the main onboarding data was saved successfully
      // But log it for debugging
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    console.error("Onboarding PUT error:", e);
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: e.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: e.message ?? "Error" },
      { status: e.status ?? 400 }
    );
  }
}
