import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";

export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0;

// Admin client for bypassing email confirmation
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
      "Supabase environment variables are not set. Using dummy client."
    );
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
  return createServerComponentClient({ cookies: () => cookieStore });
});
