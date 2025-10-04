import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_actual_supabase_project_url" &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0 &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your_actual_supabase_anon_key";

// Log configuration status for debugging
if (typeof window !== "undefined") {
  console.log("Supabase Config Check:", {
    urlConfigured:
      typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
      process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !==
        "your_actual_supabase_project_url",
    keyConfigured:
      typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0 &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !==
        "your_actual_supabase_anon_key",
    url: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + "..."
      : "NOT SET",
  });
}

// Create a dummy client that mimics the Supabase client interface
const createDummyClient = () => {
  const createQueryBuilder = () => {
    return {
      select: function (columns: string = "*") {
        return this;
      },
      eq: function (column: string, value: any) {
        return this;
      },
      single: function () {
        return Promise.resolve({ data: null, error: null });
      },
      then: function (resolve: any) {
        return Promise.resolve(resolve({ data: [], error: null }));
      },
      insert: function (data: any) {
        return Promise.resolve({ data: null, error: null });
      },
    };
  };

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
      signInWithOAuth: () =>
        Promise.resolve({
          data: { user: null, session: null, provider: null },
          error: { message: "Supabase not configured" },
        }),
    },
    from: (table: string) => createQueryBuilder(),
  };
};

// Only create the client if environment variables are properly configured
export const supabase = isSupabaseConfigured
  ? createClientComponentClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  : createDummyClient();
