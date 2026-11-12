import {
  ADMIN_ROLE_LABELS,
  ADMIN_ROLE_PERMISSIONS,
  type AdminAccessProfile,
  type AdminPermission,
  type AdminRole,
} from "../types/rbac";

const ROLE_KEY_MAP: Record<string, AdminRole> = {
  system_admin: "super_admin",
  org_owner: "org_admin",
  org_admin: "org_admin",
  school_admin: "school_principal",
  teacher: "moderator",
  finance_admin: "auditor",
};

export function deriveAdminRoles(
  roleKeys: readonly string[],
  permissions: readonly string[]
): AdminRole[] {
  const roles = new Set<AdminRole>();

  for (const key of roleKeys) {
    const mapped = ROLE_KEY_MAP[key];
    if (mapped) roles.add(mapped);
  }

  if (
    permissions.includes("system:manage_features") ||
    permissions.includes("*")
  ) {
    roles.add("super_admin");
  }

  return Array.from(roles);
}

export function deriveAdminPermissions(
  roles: readonly AdminRole[]
): AdminPermission[] {
  const permissions = new Set<AdminPermission>();

  for (const role of roles) {
    for (const permission of ADMIN_ROLE_PERMISSIONS[role]) {
      permissions.add(permission);
    }
  }

  return Array.from(permissions);
}

export function hasAdminRole(
  roles: readonly AdminRole[],
  role: AdminRole
): boolean {
  return roles.includes(role);
}

export function hasAdminPermission(
  roles: readonly AdminRole[],
  permission: AdminPermission
): boolean {
  if (roles.includes("super_admin")) return true;
  return roles.some((role) =>
    ADMIN_ROLE_PERMISSIONS[role].includes(permission)
  );
}

export function getPrimaryRoleLabel(roles: readonly AdminRole[]): string {
  const first = roles[0];
  return first ? ADMIN_ROLE_LABELS[first] : "No admin role";
}

const ADMIN_ROLE_PRIORITY: Record<AdminRole, number> = {
  super_admin: 5,
  org_admin: 4,
  school_principal: 3,
  moderator: 2,
  auditor: 1,
};

export function getAdminRoleRank(roles: readonly AdminRole[]): number {
  return roles.reduce(
    (rank, role) => Math.max(rank, ADMIN_ROLE_PRIORITY[role]),
    0
  );
}

export function selectPrimaryAccessProfile(
  profiles: readonly AdminAccessProfile[]
): AdminAccessProfile | null {
  let selected: AdminAccessProfile | null = null;
  let selectedRank = -1;

  for (const profile of profiles) {
    const rank = getAdminRoleRank(
      deriveAdminRoles(profile.roleKeys, profile.permissions)
    );
    if (rank > selectedRank) {
      selected = profile;
      selectedRank = rank;
    }
  }

  return selected;
}
