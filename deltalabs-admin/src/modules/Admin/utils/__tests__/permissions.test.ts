import { describe, expect, it } from "vitest";

import { ADMIN_PERMISSIONS } from "../../types/rbac";
import {
  deriveAdminPermissions,
  deriveAdminRoles,
  getAdminRoleRank,
  getPrimaryRoleLabel,
  hasAdminPermission,
  hasAdminRole,
  selectPrimaryAccessProfile,
} from "../permissions";

describe("deriveAdminRoles", () => {
  it("maps backend role keys to admin roles", () => {
    expect(deriveAdminRoles(["system_admin"], [])).toEqual(["super_admin"]);
    expect(deriveAdminRoles(["org_owner"], [])).toEqual(["org_admin"]);
    expect(deriveAdminRoles(["org_admin"], [])).toEqual(["org_admin"]);
    expect(deriveAdminRoles(["school_admin"], [])).toEqual([
      "school_principal",
    ]);
    expect(deriveAdminRoles(["teacher"], [])).toEqual(["moderator"]);
    expect(deriveAdminRoles(["finance_admin"], [])).toEqual(["auditor"]);
  });

  it("elevates users with the system feature permission", () => {
    expect(deriveAdminRoles([], ["system:manage_features"])).toEqual([
      "super_admin",
    ]);
  });

  it("ignores unknown role keys", () => {
    expect(deriveAdminRoles(["student", "parent"], [])).toEqual([]);
  });
});

describe("hasAdminPermission", () => {
  it("grants every permission to super admins", () => {
    for (const permission of ADMIN_PERMISSIONS) {
      expect(hasAdminPermission(["super_admin"], permission)).toBe(true);
    }
  });

  it("grants org admins full administrative access", () => {
    expect(hasAdminPermission(["org_admin"], "users:manage")).toBe(true);
    expect(hasAdminPermission(["org_admin"], "rbac:manage")).toBe(true);
  });

  it("limits school principals to their domain", () => {
    expect(hasAdminPermission(["school_principal"], "schools:manage")).toBe(
      true
    );
    expect(hasAdminPermission(["school_principal"], "courses:manage")).toBe(
      true
    );
    expect(hasAdminPermission(["school_principal"], "finance:manage")).toBe(
      false
    );
    expect(hasAdminPermission(["school_principal"], "users:manage")).toBe(
      false
    );
  });

  it("limits moderators to content moderation", () => {
    expect(hasAdminPermission(["moderator"], "qa:moderate")).toBe(true);
    expect(hasAdminPermission(["moderator"], "media:manage")).toBe(true);
    expect(hasAdminPermission(["moderator"], "orgs:manage")).toBe(false);
  });

  it("limits auditors to read-only analytics and finance", () => {
    expect(hasAdminPermission(["auditor"], "analytics:read")).toBe(true);
    expect(hasAdminPermission(["auditor"], "finance:manage")).toBe(true);
    expect(hasAdminPermission(["auditor"], "schools:manage")).toBe(false);
  });

  it("denies users with no admin role", () => {
    expect(hasAdminPermission([], "analytics:read")).toBe(false);
  });
});

describe("role helpers", () => {
  it("reports role membership", () => {
    expect(hasAdminRole(["auditor"], "auditor")).toBe(true);
    expect(hasAdminRole(["auditor"], "super_admin")).toBe(false);
  });

  it("derives a de-duplicated permission set", () => {
    const permissions = deriveAdminPermissions(["auditor", "moderator"]);
    expect(permissions).toContain("analytics:read");
    expect(permissions).toContain("qa:moderate");
    expect(new Set(permissions).size).toBe(permissions.length);
  });

  it("returns a human-readable primary role label", () => {
    expect(getPrimaryRoleLabel(["super_admin"])).toBe("Super Admin");
    expect(getPrimaryRoleLabel(["school_principal"])).toBe(
      "School Principal"
    );
    expect(getPrimaryRoleLabel([])).toBe("No admin role");
  });

  it("ranks roles by administrative authority", () => {
    expect(getAdminRoleRank(["super_admin"])).toBeGreaterThan(
      getAdminRoleRank(["org_admin"])
    );
    expect(getAdminRoleRank(["auditor"])).toBeGreaterThan(
      getAdminRoleRank([])
    );
  });
});

describe("selectPrimaryAccessProfile", () => {
  const profile = (
    orgId: string,
    roleKeys: readonly string[]
  ): {
    orgId: string;
    roleKeys: readonly string[];
    permissions: readonly string[];
    membershipState: string;
  } => ({
    orgId,
    roleKeys,
    permissions: [],
    membershipState: "member",
  });

  it("selects the org where the user has the strongest admin role", () => {
    const selected = selectPrimaryAccessProfile([
      profile("org-student", ["student"]),
      profile("org-school", ["school_admin"]),
      profile("org-system", ["system_admin"]),
    ]);

    expect(selected?.orgId).toBe("org-system");
  });

  it("prefers any admin role over a non-admin membership", () => {
    const selected = selectPrimaryAccessProfile([
      profile("org-student", ["student"]),
      profile("org-auditor", ["finance_admin"]),
    ]);

    expect(selected?.orgId).toBe("org-auditor");
  });

  it("returns null when no profiles are available", () => {
    expect(selectPrimaryAccessProfile([])).toBeNull();
  });
});
