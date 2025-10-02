import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

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

    // Get the user directly
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

    // Since we can't directly create sessions, we'll mark the user as confirmed
    // and then try to sign in again
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      user.id,
      {
        email_confirm: true,
      }
    );

    if (updateError) {
      console.error("Update user error:", updateError);
      return NextResponse.json(
        { error: "Authentication failed." },
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

    return NextResponse.json({ user: data.user });
  } catch (error: any) {
    console.error("Unexpected error in bypass-confirm route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
