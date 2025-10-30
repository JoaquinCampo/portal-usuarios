import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE = "portal_session";
const PUBLIC_PATHS = new Set(["/login"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(AUTH_COOKIE);

  if (PUBLIC_PATHS.has(pathname)) {
    if (sessionCookie) {
      const redirectTo =
        request.nextUrl.searchParams.get("redirectTo") ?? "/home";
      const url = new URL(redirectTo, request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    if (pathname && pathname !== "/") {
      const target = `${pathname}${request.nextUrl.search}`;
      loginUrl.searchParams.set("redirectTo", target);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
