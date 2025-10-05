import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_actual_supabase_project_url" &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0 &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your_actual_supabase_anon_key";

export async function updateSession(request: NextRequest) {
  // Check if Supabase is properly configured
  if (!isSupabaseConfigured) {
    return NextResponse.next({
      request,
    });
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get the user (more secure than getSession)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Debug logging
  console.log("Middleware check:", {
    pathname: request.nextUrl.pathname,
    hasSession: !!user,
    sessionId: user?.id,
  });

  // Define public routes that don't require authentication
  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/auth/") ||
    request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.startsWith("/api/");

  // If the route requires authentication and there's no user, redirect to login
  if (!isPublicRoute && !user) {
    console.log("No session, redirecting to login");
    const redirectUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If the user is logged in and trying to access auth pages, redirect to appropriate dashboard
  if (user && request.nextUrl.pathname.startsWith("/auth/")) {
    // Special case: Don't redirect if user is on login page - let the page handle it
    if (request.nextUrl.pathname === "/auth/login") {
      console.log("User on login page, allowing access");
      return response;
    }

    console.log("Authenticated user:", user.id);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, onboarding_completed")
      .eq("user_id", user.id)
      .single();

    console.log("Profile check:", { profile, profileError });

    if (!profileError && profile) {
      if (!profile.onboarding_completed) {
        console.log("Profile not completed, redirecting to onboard");
        const redirectUrl = new URL("/onboard", request.url);
        return NextResponse.redirect(redirectUrl);
      } else if (profile.role === "admin") {
        console.log("Admin user, redirecting to admin dashboard");
        const redirectUrl = new URL("/admin/dashboard", request.url);
        return NextResponse.redirect(redirectUrl);
      } else {
        console.log("Regular user, redirecting to home");
        const redirectUrl = new URL("/home", request.url);
        return NextResponse.redirect(redirectUrl);
      }
    } else if (profileError && profileError.code === "PGRST116") {
      // No profile found, redirect to onboard
      console.log("No profile found, redirecting to onboard");
      const redirectUrl = new URL("/onboard", request.url);
      return NextResponse.redirect(redirectUrl);
    } else {
      // Default redirect if profile not found
      console.log("Profile error, redirecting to onboard");
      const redirectUrl = new URL("/onboard", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Also handle protected routes for logged in users
  if (user && !request.nextUrl.pathname.startsWith("/auth/")) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, onboarding_completed")
      .eq("user_id", user.id)
      .single();

    if (!profileError && profile) {
      // If user is trying to access protected routes but hasn't completed onboarding
      if (
        !profile.onboarding_completed &&
        request.nextUrl.pathname !== "/onboard"
      ) {
        const redirectUrl = new URL("/onboard", request.url);
        return NextResponse.redirect(redirectUrl);
      }
      // If user has completed onboarding but is trying to access onboard page
      if (
        profile.onboarding_completed &&
        request.nextUrl.pathname === "/onboard"
      ) {
        const redirectUrl = new URL("/home", request.url);
        return NextResponse.redirect(redirectUrl);
      }
    } else if (profileError && profileError.code === "PGRST116") {
      // No profile found, redirect to onboard
      const redirectUrl = new URL("/onboard", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}
