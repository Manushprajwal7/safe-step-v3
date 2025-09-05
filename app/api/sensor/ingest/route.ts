// Body should include session_id and SampleSchema payload.
import { NextResponse } from "next/server"
import { createSupabaseServer } from "../../_lib/supabase"
import { SampleSchema } from "../../_lib/schemas"

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || ""
  const secret = (auth.startsWith("Bearer ") && auth.split(" ")[1]) || ""
  if (!process.env.DEVICE_INGEST_SECRET || secret !== process.env.DEVICE_INGEST_SECRET) {
    return NextResponse.json({ error: "Unauthorized device" }, { status: 401 })
  }

  const supabase = createSupabaseServer()
  const body = await req.json().catch(() => ({}))
  const session_id = body.session_id as string | undefined
  const parsed = SampleSchema.safeParse(body)
  if (!session_id || !parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  // Direct insert bypasses per-user ownership, but RLS ensures only valid structure.
  const { data, error } = await supabase
    .from("session_samples")
    .insert({ session_id, ...parsed.data })
    .select("*")
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ sample: data }, { status: 201 })
}
