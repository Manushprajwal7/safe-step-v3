import { z } from "zod"
import { NextResponse } from "next/server"
import { requireUser } from "../_lib/supabase"

const OnboardSchema = z.object({
  age: z.number().int().min(1).max(120),
  weight_kg: z.number().positive(),
  height_cm: z.number().positive(),
  gender: z.string().optional().default(""),
  profession: z.string().optional().default(""),
  diabetes_type: z.enum(["type1", "type2", "prediabetic", "none"]).default("none"),
  diagnosis_date: z.string().optional(), // ISO date
  foot_symptoms: z.array(z.string()).optional().default([]),
  pre_existing_conditions: z.array(z.string()).optional().default([]),
  activity_level: z.string().optional().default(""),
  footwear_type: z.string().optional().default(""),
  prior_injuries: z.string().optional().default(""),
  blood_sugar_mgdl: z.number().optional(),
})

export async function GET() {
  try {
    const { supabase, user } = await requireUser()
    const { data, error } = await supabase
      .from("onboarding")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
    if (error && error.code !== "PGRST116") throw error
    return NextResponse.json({ data: data ?? null })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Error" }, { status: e.status ?? 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = OnboardSchema.parse(body)
    const { supabase, user } = await requireUser()
    const { data, error } = await supabase
      .from("onboarding")
      .insert({ ...parsed, user_id: user.id })
      .select("*")
      .single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Error" }, { status: e.status ?? 400 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const parsed = OnboardSchema.partial().parse(body)
    const { supabase, user } = await requireUser()

    const { data, error } = await supabase
      .from("onboarding")
      .update({ ...parsed })
      .eq("user_id", user.id)
      .select("*")
      .single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Error" }, { status: e.status ?? 400 })
  }
}
