import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0;

export async function updateSession(request: NextRequest) {
  // Check if Supabase is properly configured
  if (!isSupabaseConfigured) {
    console.warn(
      "Supabase environment variables are not set. Skipping session update."
    );
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

    await supabase.auth.getSession();

    const isPublicRoute =
      request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname.startsWith("/auth/") ||
      request.nextUrl.pathname.startsWith("/_next/") ||
      request.nextUrl.pathname.startsWith("/api/");

    if (!isPublicRoute) {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const redirectUrl = new URL("/auth/login", request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session && request.nextUrl.pathname.startsWith("/auth/")) {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    return response;
  } catch (error) {
    console.error("Error in updateSession middleware:", error);
    // Return the response even if there's an error
    return NextResponse.next({
      request,
    });
  }
}
