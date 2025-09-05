import { z } from "zod"
import { NextResponse } from "next/server"
import { requireUser } from "../../../_lib/supabase"

const SampleSchema = z.object({
  pressure: z.any(), // expect 2D or 1D numeric arrays; stored as jsonb
  foot: z.enum(["left", "right", "both"]).optional().default("both"),
  captured_at: z.string().optional(),
})

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { supabase } = await requireUser()
    const { data, error } = await supabase
      .from("session_samples")
      .select("*")
      .eq("session_id", params.id)
      .order("captured_at", { ascending: false })
      .limit(500)
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const payload = SampleSchema.parse(await req.json())
    const { supabase } = await requireUser()

    const { data, error } = await supabase
      .from("session_samples")
      .insert({
        session_id: params.id,
        pressure: payload.pressure,
        foot: payload.foot,
        captured_at: payload.captured_at ?? new Date().toISOString(),
      })
      .select("*")
      .single()
    if (error) throw error

    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
