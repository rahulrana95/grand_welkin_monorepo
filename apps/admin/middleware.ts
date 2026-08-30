import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

/** Gate every route behind a session cookie; /login is the only public page. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = Boolean(request.cookies.get(AUTH_COOKIE)?.value);

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
