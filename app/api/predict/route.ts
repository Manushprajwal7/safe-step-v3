import { NextResponse } from "next/server"
import { z } from "zod"
import { requireUser } from "../_lib/supabase"

const PredictSchema = z.object({
  session_id: z.string().uuid().optional(),
  metadata: z.record(z.any()),
  pressure: z.any(), // 2D/1D arrays
})

export async function POST(req: Request) {
  try {
    const body = PredictSchema.parse(await req.json())
    const { supabase, user } = await requireUser()

    let condition = "unknown"
    let confidence = 0
    let model_version = "n/a"
    const mlUrl = process.env.ML_URL

    if (mlUrl) {
      const res = await fetch(`${mlUrl.replace(/\/$/, "")}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      })
      if (!res.ok) throw new Error(`ML server error ${res.status}`)
      const ml = await res.json()
      condition = ml.condition ?? condition
      confidence = ml.confidence ?? confidence
      model_version = ml.model_version ?? model_version
    } else {
      // Fallback heuristic
      condition = "normal"
      confidence = 50
      model_version = "fallback"
    }

    const { data, error } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        session_id: body.session_id ?? null,
        condition,
        confidence,
        model_version,
        recommendation: condition === "normal" ? "Maintain routine checks." : "Consult a clinician.",
      })
      .select("*")
      .single()
    if (error) throw error

    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
