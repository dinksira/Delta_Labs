"use client";

import React, { type ReactNode } from "react";

import { useAuth } from "../context/AuthContext";
import type { AdminPermission, AdminRole } from "../types";

interface PermissionGateProps {
  permission: AdminPermission;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  permission,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RoleGateProps {
  roles: readonly AdminRole[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function RoleGate({
  roles,
  fallback = null,
  children,
}: RoleGateProps) {
  const { hasAnyRole } = useAuth();

  if (!hasAnyRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
