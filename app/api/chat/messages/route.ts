import { NextResponse } from "next/server"
import { getUserOrThrow } from "../../_lib/supabase"
import { ChatMessageSchema } from "../../_lib/schemas"

export async function GET() {
  try {
    const { supabase, user } = await getUserOrThrow()
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ messages: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unauthorized" }, { status: e.status || 401 })
  }
}

export async function POST(req: Request) {
  try {
    const { supabase, user } = await getUserOrThrow()
    const body = await req.json().catch(() => ({}))
    const parsed = ChatMessageSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 })

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({ patient_id: user.id, sender: "patient", message: parsed.data.message })
      .select("*")
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ message: data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unauthorized" }, { status: e.status || 401 })
  }
}
