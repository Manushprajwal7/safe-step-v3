import { requireUser } from "../_lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { supabase, user } = await requireUser()
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
