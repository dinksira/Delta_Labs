export const ADMIN_PERMISSIONS = [
  "users:manage",
  "orgs:manage",
  "schools:manage",
  "courses:manage",
  "qa:moderate",
  "competitions:manage",
  "media:manage",
  "analytics:read",
  "finance:manage",
  "rbac:manage",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export const ADMIN_ROLES = [
  "super_admin",
  "org_admin",
  "school_principal",
  "moderator",
  "auditor",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  org_admin: "Org Admin",
  school_principal: "School Principal",
  moderator: "Content Moderator",
  auditor: "Auditor / Finance",
};

const ALL_PERMISSIONS: readonly AdminPermission[] = ADMIN_PERMISSIONS;

export const ADMIN_ROLE_PERMISSIONS: Record<
  AdminRole,
  readonly AdminPermission[]
> = {
  super_admin: ALL_PERMISSIONS,
  org_admin: ALL_PERMISSIONS,
  school_principal: [
    "schools:manage",
    "courses:manage",
    "qa:moderate",
    "analytics:read",
  ],
  moderator: ["courses:manage", "qa:moderate", "media:manage"],
  auditor: ["analytics:read", "finance:manage"],
};

export interface AdminAccessProfile {
  orgId: string;
  roleKeys: readonly string[];
  permissions: readonly string[];
  membershipState: string;
}
