import { redirect } from "next/navigation";

import { buildLoginModalRedirectHref } from "@/lib/authRedirect";
import { AUTH_SESSION_COOKIE, isAuthenticatedFromCookieValue } from "@/lib/authSession";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : undefined;
}

export async function requireAuthenticated(nextPath?: string): Promise<void> {
  const cookieValue = getCookie(AUTH_SESSION_COOKIE);
  const isAuthenticated = isAuthenticatedFromCookieValue(cookieValue);
  if (!isAuthenticated) {
    redirect(buildLoginModalRedirectHref(nextPath));
  }
}
