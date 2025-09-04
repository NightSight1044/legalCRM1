import { NextResponse, type NextRequest } from "next/server";

/**
 * Lightweight session check for middleware.
 *
 * Middleware runs in the Edge runtime where Node-specific APIs used by
 * `@supabase/supabase-js` are not available. Instead of creating a
 * Supabase server client here, we perform a cookie-based existence check
 * for the Supabase access token. This is a best-effort check to gate
 * dashboard routes; for authoritative auth use, perform server-side checks
 * inside route handlers or server components.
 */
export function updateSession(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Supabase stores session info in cookies like `sb:token`.
  const hasSessionCookie = !!request.cookies.get("sb:token");

  if (
    !hasSessionCookie &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
