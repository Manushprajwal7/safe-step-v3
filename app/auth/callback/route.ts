import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  console.log("Starting OAuth callback");

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboard";
  const error = searchParams.get("error");

  console.log("OAuth callback params:", { hasCode: !!code, next, error });

  // Handle OAuth errors
  if (error) {
    const errorDescription = searchParams.get("error_description");
    console.error("OAuth error:", { error, errorDescription });
    const errorMessage = `Authentication failed: ${error}${
      errorDescription ? ` - ${errorDescription}` : ""
    }`;
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(errorMessage)}`
    );
  }

  // If we have a code, exchange it for a session
  if (!code) {
    console.error("No code provided in OAuth callback");
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(
        "Authentication failed: No code provided"
      )}`
    );
  }

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

  try {
    console.log("Exchanging code for session");
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (authError) {
      console.error("Error exchanging code for session:", authError);
      throw authError;
    }

    if (!session?.user) {
      console.error("No user returned from OAuth");
      throw new Error("No user returned from OAuth");
    }

    console.log("User authenticated:", {
      userId: session.user.id,
      email: session.user.email,
    });

    // The profile should be automatically created by the trigger
    // We don't need to manually create it here
    // If there's an issue with the trigger, the auth context will handle it

    console.log(
      "Authentication successful, redirecting to:",
      `${origin}${next}`
    );
    return NextResponse.redirect(`${origin}${next}`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Auth callback error:", errorMessage);

    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(
        `Authentication failed: ${errorMessage}`
      )}`
    );
  }
}
