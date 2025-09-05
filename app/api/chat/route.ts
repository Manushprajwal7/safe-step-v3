import { z } from "zod"
import { NextResponse } from "next/server"
import { requireUser } from "../_lib/supabase"

const ChatSchema = z.object({
  role: z.enum(["user", "assistant", "system"]).default("user"),
  content: z.string().min(1),
})

export async function GET() {
  try {
    const { supabase, user } = await requireUser()
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const payload = ChatSchema.parse(await req.json())
    const { supabase, user } = await requireUser()

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({ ...payload, user_id: user.id })
      .select("*")
      .single()
    if (error) throw error

    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
