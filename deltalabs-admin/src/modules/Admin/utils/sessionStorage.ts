import type { AdminAccessProfile, AdminSession } from "../types";

const STORAGE_KEY = "dl.admin.auth.v1";

export interface StoredAdminAuth {
  session: AdminSession;
  accessProfile: AdminAccessProfile | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAdminSession(value: unknown): value is AdminSession {
  if (!isRecord(value)) return false;
  if (typeof value.accessToken !== "string" || !value.accessToken) return false;
  if (typeof value.expiresAt !== "number") return false;
  if (!isRecord(value.user)) return false;
  return (
    typeof value.user.id === "string" && typeof value.user.username === "string"
  );
}

function isAccessProfile(value: unknown): value is AdminAccessProfile {
  if (!isRecord(value)) return false;
  return (
    typeof value.orgId === "string" &&
    Array.isArray(value.roleKeys) &&
    Array.isArray(value.permissions) &&
    typeof value.membershipState === "string"
  );
}

export function readStoredAuth(): StoredAdminAuth | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !isAdminSession(parsed.session)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    if (parsed.session.expiresAt <= Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return {
      session: parsed.session,
      accessProfile: isAccessProfile(parsed.accessProfile)
        ? parsed.accessProfile
        : null,
    };
  } catch {
    return null;
  }
}

export function writeStoredAuth(value: StoredAdminAuth): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // storage unavailable or full
  }
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
