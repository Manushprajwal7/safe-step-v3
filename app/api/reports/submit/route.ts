import { z } from "zod"
import { NextResponse } from "next/server"
import { requireUser } from "../../_lib/supabase"

const ReportSchema = z.object({
  session_id: z.string().uuid().optional(),
  condition: z.string(),
  confidence: z.number().min(0).max(100),
  model_version: z.string().optional(),
  recommendation: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const payload = ReportSchema.parse(await req.json())
    const { supabase, user } = await requireUser()

    const { data, error } = await supabase
      .from("reports")
      .insert({ ...payload, user_id: user.id })
      .select("*")
      .single()
    if (error) throw error

    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
