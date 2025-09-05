import { z } from "zod"
import { NextResponse } from "next/server"
import { requireUser } from "../_lib/supabase"

const AssessmentSchema = z.object({
  check_date: z.string().optional(), // ISO
  symptoms: z.array(z.string()).optional().default([]),
  feeling: z.enum(["good", "okay", "bad"]),
  notes: z.string().optional(),
})

export async function GET() {
  try {
    const { supabase, user } = await requireUser()
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", user.id)
      .order("check_date", { ascending: false })
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const payload = AssessmentSchema.parse(await req.json())
    const { supabase, user } = await requireUser()

    const { data, error } = await supabase
      .from("assessments")
      .insert({
        ...payload,
        user_id: user.id,
        check_date: payload.check_date ?? new Date().toISOString(),
      })
      .select("*")
      .single()
    if (error) throw error

    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
