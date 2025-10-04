import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the user from the session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the user's profile using the correct column name from the new schema
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, onboarding_completed")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      // If profile doesn't exist, return default values
      return NextResponse.json({
        role: "patient",
        onboarding_completed: false,
      });
    }

    return NextResponse.json({
      role: profile.role || "patient",
      onboarding_completed: profile.onboarding_completed || false,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Not authenticated" },
      { status: 401 }
    );
  }
}
