import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";

export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_actual_supabase_project_url" &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0 &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your_actual_supabase_anon_key";

// Admin client for bypassing email confirmation
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("Creating admin client with:", {
    supabaseUrl: supabaseUrl ? "SET" : "NOT SET",
    supabaseServiceRoleKey: supabaseServiceRoleKey ? "SET" : "NOT SET",
    supabaseUrlLength: supabaseUrl?.length,
    supabaseServiceRoleKeyLength: supabaseServiceRoleKey?.length,
  });

  // Check if environment variables are properly set
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables for admin client. Please check your .env.local file."
    );
  }

  if (supabaseUrl.length === 0 || supabaseServiceRoleKey.length === 0) {
    throw new Error(
      "Supabase environment variables are empty. Please check your .env.local file."
    );
  }

  // Check if using placeholder values
  if (
    supabaseUrl === "your_actual_supabase_project_url" ||
    supabaseServiceRoleKey === "your_actual_supabase_service_role_key"
  ) {
    throw new Error(
      "Supabase environment variables are using placeholder values. Please update your .env.local file with actual values."
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export const createClient = cache(() => {
  // Check if Supabase is properly configured
  if (!isSupabaseConfigured) {
    console.warn(
      "Supabase environment variables are not set or are using placeholder values. Using dummy client."
    );
    console.log("Current env values:", {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10) + "..."
        : "NOT SET",
    });
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () =>
          Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () =>
          Promise.resolve({
            data: { user: null, session: null },
            error: { message: "Supabase not configured" },
          }),
        signUp: () =>
          Promise.resolve({
            data: { user: null, session: null },
            error: { message: "Supabase not configured" },
          }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () =>
          Promise.resolve({
            data: null,
            error: { message: "Supabase not configured" },
          }),
        update: () =>
          Promise.resolve({
            data: null,
            error: { message: "Supabase not configured" },
          }),
        delete: () =>
          Promise.resolve({
            data: null,
            error: { message: "Supabase not configured" },
          }),
        upsert: () =>
          Promise.resolve({
            data: null,
            error: { message: "Supabase not configured" },
          }),
      }),
    } as any;
  }

  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
});
