import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ADMIN_AUTH_SESSION_COOKIE,
  hasAuthCookieValue,
} from "@/lib/authSession";

export function middleware(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const isAuthenticated = hasAuthCookieValue(
    request.cookies.get(ADMIN_AUTH_SESSION_COOKIE)?.value
  );

  if (pathname === "/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
