import { hasSupabase } from "@welkinbliss/db";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

/**
 * Gate every route behind a session; /login is the only public page. This is a
 * cheap presence check (edge) — the real role check lives in `getSession()` used by
 * the protected layout. Works in both auth modes: the mock cookie, or a Supabase
 * Auth cookie (`sb-<ref>-auth-token`, possibly chunked).
 */
const SUPABASE_AUTH_COOKIE = /^sb-.*-auth-token(\.\d+)?$/;

function isSignedIn(request: NextRequest): boolean {
  if (hasSupabase()) {
    return request.cookies.getAll().some((c) => SUPABASE_AUTH_COOKIE.test(c.name) && Boolean(c.value));
  }
  return Boolean(request.cookies.get(AUTH_COOKIE)?.value);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = isSignedIn(request);

  if (pathname === "/login") {
    if (signedIn) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }
  if (!signedIn) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
