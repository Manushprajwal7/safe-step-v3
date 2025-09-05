import { z } from "zod"
import { NextResponse } from "next/server"
import { requireUser } from "../_lib/supabase"

const CreateSession = z.object({ note: z.string().optional() })

export async function GET() {
  try {
    const { supabase, user } = await requireUser()
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { note } = CreateSession.parse(await req.json())
    const { supabase, user } = await requireUser()
    const { data, error } = await supabase.from("sessions").insert({ user_id: user.id, note }).select("*").single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
