export const ADMIN_AUTH_SESSION_COOKIE = "dl_admin_session";

export function hasAuthCookieValue(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function syncAdminSessionCookie(expiresAt: number | null): void {
  if (typeof document === "undefined") return;

  if (expiresAt === null) {
    document.cookie = `${ADMIN_AUTH_SESSION_COOKIE}=; Max-Age=0; path=/; SameSite=Lax`;
    return;
  }

  const maxAgeSeconds = Math.max(
    0,
    Math.floor((expiresAt - Date.now()) / 1000)
  );

  if (maxAgeSeconds <= 0) {
    document.cookie = `${ADMIN_AUTH_SESSION_COOKIE}=; Max-Age=0; path=/; SameSite=Lax`;
    return;
  }

  document.cookie = `${ADMIN_AUTH_SESSION_COOKIE}=1; Max-Age=${maxAgeSeconds}; path=/; SameSite=Lax`;
}
