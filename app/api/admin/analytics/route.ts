import { NextResponse } from "next/server"
import { requireAdmin } from "../../_lib/supabase"

export async function GET() {
  try {
    const { supabase } = await requireAdmin()

    const [patientsCount, avgHealthScore, highRiskPatients, sessionsToday] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "patient"),
      supabase
        .rpc("admin_avg_health_score")
        .single()
        .catch(() => ({ data: { value: null } })),
      supabase
        .rpc("admin_high_risk_count")
        .single()
        .catch(() => ({ data: { value: 0 } })),
      supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .gte("started_at", new Date(new Date().toDateString()).toISOString()),
    ])

    return NextResponse.json({
      totalPatients: patientsCount.count ?? 0,
      avgHealthScore: avgHealthScore.data?.value ?? null,
      highRiskPatients: highRiskPatients.data?.value ?? 0,
      sessionsToday: sessionsToday.count ?? 0,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 })
  }
}
