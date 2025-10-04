import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ensureUserIsConfirmed } from "@/lib/auth-utils";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Use admin client to bypass email confirmation
    const adminClient = createAdminClient();

    // Get the user directly by listing users and filtering by email
    const {
      data: { users },
      error: listUsersError,
    } = await adminClient.auth.admin.listUsers();

    if (listUsersError) {
      console.error("List users error:", listUsersError);
      return NextResponse.json(
        { error: "Authentication failed." },
        { status: 401 }
      );
    }

    // Find the user with the matching email
    const user = users.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email. Please sign up first." },
        { status: 401 }
      );
    }

    // Ensure the user is confirmed
    const isConfirmed = await ensureUserIsConfirmed(user.id);

    if (!isConfirmed) {
      return NextResponse.json(
        { error: "Failed to confirm user account." },
        { status: 401 }
      );
    }

    // Now try to sign in again with the regular client
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error);
      // Check if it's invalid credentials
      if (error.message.includes("Invalid login credentials")) {
        return NextResponse.json(
          { error: "Invalid email or password. Please try again." },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: error.message || "Failed to sign in." },
        { status: 401 }
      );
    }

    // Return success with session data
    return NextResponse.json({
      user: data.user,
      session: data.session,
    });
  } catch (error: any) {
    console.error("Unexpected error in bypass-confirm route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
