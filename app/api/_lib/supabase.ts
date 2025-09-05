import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export function getServerSupabase() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase env vars missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or ANON).")
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}

// Re-export a named helper that other routes import.
// It returns the same client as getServerSupabase() for backwards compatibility.
export function createSupabaseServer() {
  return getServerSupabase()
}

export async function requireUser() {
  const supabase = getServerSupabase()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    throw new Response("Unauthorized", { status: 401 })
  }
  return { supabase, user: data.user }
}

// Provide an error-throwing variant that callers can catch and use e.status/e.message safely.
export async function getUserOrThrow() {
  try {
    const supabase = getServerSupabase()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
      const err: any = new Error("Unauthorized")
      err.status = 401
      throw err
    }
    return { supabase, user: data.user }
  } catch (e: any) {
    if (e?.status) throw e
    const err: any = new Error(e?.message || "Unauthorized")
    err.status = 401
    throw err
  }
}

export async function getProfileRole(userId: string) {
  const { supabase } = await requireUser()
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single()
  if (error) throw new Response("Failed to fetch role", { status: 500 })
  return data.role as "patient" | "doctor" | "admin"
}

export async function requireAdmin() {
  const { supabase, user } = await requireUser()
  const role = await getProfileRole(user.id)
  if (role !== "admin") throw new Response("Forbidden", { status: 403 })
  return { supabase, user }
}
