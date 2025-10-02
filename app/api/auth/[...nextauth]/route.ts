import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Bypass email confirmation requirement
    // Try to get user data directly
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      // If we can't get user data, it's a real authentication error
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // If we can get user data, proceed with login regardless of email confirmation status
    return NextResponse.json({ user: user });
  }

  return NextResponse.json({ user: data.user });
}
