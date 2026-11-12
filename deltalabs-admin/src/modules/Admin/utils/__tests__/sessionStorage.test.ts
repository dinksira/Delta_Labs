import { beforeEach, describe, expect, it } from "vitest";

import type { AdminSession } from "../../types";
import {
  clearStoredAuth,
  readStoredAuth,
  writeStoredAuth,
} from "../sessionStorage";

const session: AdminSession = {
  accessToken: "token-123",
  expiresAt: Date.now() + 60 * 60 * 1000,
  user: {
    id: "user-1",
    username: "admin",
    fullName: "Admin User",
    email: "admin@deltalabs.io",
    phone: null,
    bio: null,
    avatarUrl: null,
    followersCount: 0,
    followingCount: 0,
    isVerified: true,
  },
};

describe("admin session storage", () => {
  beforeEach(() => {
    clearStoredAuth();
  });

  it("round-trips a session and access profile", () => {
    writeStoredAuth({
      session,
      accessProfile: {
        orgId: "org-1",
        roleKeys: ["org_admin"],
        permissions: ["org:manage"],
        membershipState: "admin",
      },
    });

    const stored = readStoredAuth();
    expect(stored?.session.accessToken).toBe("token-123");
    expect(stored?.accessProfile?.orgId).toBe("org-1");
  });

  it("rejects expired sessions", () => {
    writeStoredAuth({
      session: { ...session, expiresAt: Date.now() - 1000 },
      accessProfile: null,
    });

    expect(readStoredAuth()).toBeNull();
  });

  it("returns null when nothing is stored", () => {
    expect(readStoredAuth()).toBeNull();
  });
});
