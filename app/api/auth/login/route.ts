import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const cookieStore = cookies();

  const supabase = createServerClient(
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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Check if profile exists, create if not
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", data.user.id)
    .single();

  if (profileError && profileError.code === "PGRST116") {
    // Profile doesn't exist, create it
    const { error: createProfileError } = await supabase
      .from("profiles")
      .insert({
        user_id: data.user.id,
        role: "patient",
        full_name: data.user.user_metadata?.full_name || data.user.email,
        onboarding_completed: false,
      });

    if (createProfileError) {
      console.error("Profile creation error:", createProfileError);
    }
  }

  // Return the response - the createRouteHandlerClient should automatically set the auth cookies
  return NextResponse.json({
    success: true,
    user: data.user,
  });
}
