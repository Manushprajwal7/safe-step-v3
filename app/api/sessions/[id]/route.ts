import { NextResponse } from "next/server"
import { z } from "zod"
import { requireUser } from "../../_lib/supabase"

const SessionUpdate = z.object({
  status: z.enum(["active", "paused", "ended"]).optional(),
  note: z.string().optional(),
})

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { supabase } = await requireUser()
    const { data, error } = await supabase.from("sessions").select("*").eq("id", params.id).single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const updates = SessionUpdate.parse(await req.json())
    const { supabase } = await requireUser()

    const patch = { ...updates } as any
    if (updates.status === "ended") patch.ended_at = new Date().toISOString()

    const { data, error } = await supabase.from("sessions").update(patch).eq("id", params.id).select("*").single()
    if (error) throw error

    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
