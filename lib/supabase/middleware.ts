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

  try {
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
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: "",
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value: "",
              ...options,
            });
          },
        },
      }
    );

    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
      return NextResponse.redirect(new URL("/onboard", request.url));
    }

    // Get the session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Define public routes that don't require authentication
    const isPublicRoute =
      request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname.startsWith("/auth/") ||
      request.nextUrl.pathname.startsWith("/_next/") ||
      request.nextUrl.pathname.startsWith("/api/");

    // If the route requires authentication and there's no session, redirect to login
    if (!isPublicRoute && !session) {
      const redirectUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If the user is logged in and trying to access auth pages, redirect to appropriate dashboard
    if (session && request.nextUrl.pathname.startsWith("/auth/")) {
      // Get user profile to determine where to redirect
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, onboarding_completed")
          .eq("user_id", user.id)
          .single();

        if (!profileError && profile) {
          if (!profile.onboarding_completed) {
            const redirectUrl = new URL("/onboard", request.url);
            return NextResponse.redirect(redirectUrl);
          } else if (profile.role === "admin") {
            const redirectUrl = new URL("/admin/dashboard", request.url);
            return NextResponse.redirect(redirectUrl);
          } else {
            const redirectUrl = new URL("/home", request.url);
            return NextResponse.redirect(redirectUrl);
          }
        } else if (profileError && profileError.code === "PGRST116") {
          // No profile found, redirect to onboard
          const redirectUrl = new URL("/onboard", request.url);
          return NextResponse.redirect(redirectUrl);
        } else {
          // Default redirect if profile not found
          const redirectUrl = new URL("/onboard", request.url);
          return NextResponse.redirect(redirectUrl);
        }
      }
    }

    // Also handle protected routes for logged in users
    if (session && !request.nextUrl.pathname.startsWith("/auth/")) {
      // Get user profile to determine where to redirect
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
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
    }

    return response;
  } catch (error) {
    // Return the response even if there's an error
    return NextResponse.next({
      request,
    });
  }
}
