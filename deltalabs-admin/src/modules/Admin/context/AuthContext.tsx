"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  ApiError,
  setAdminAccessTokenGetter,
  setAdminUnauthorizedHandler,
} from "@/lib/apiClient";
import { syncAdminSessionCookie } from "@/lib/authSession";
import { authApi } from "../api/authApi";
import { rbacApi } from "../api/rbacApi";
import type {
  AdminAccessProfile,
  AdminPermission,
  AdminRole,
  AdminSession,
} from "../types";
import {
  deriveAdminPermissions,
  deriveAdminRoles,
  hasAdminPermission,
  hasAdminRole,
  selectPrimaryAccessProfile,
} from "../utils/permissions";
import {
  clearStoredAuth,
  readStoredAuth,
  writeStoredAuth,
} from "../utils/sessionStorage";

const EMPTY_STRINGS: readonly string[] = [];

export interface AuthContextValue {
  session: AdminSession | null;
  accessProfile: AdminAccessProfile | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  roles: readonly AdminRole[];
  permissions: readonly AdminPermission[];
  backendPermissions: readonly string[];
  establishSession: (session: AdminSession) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: AdminPermission) => boolean;
  hasRole: (role: AdminRole) => boolean;
  hasAnyRole: (roles: readonly AdminRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const queryClient = useQueryClient();

  const [session, setSession] = useState<AdminSession | null>(null);
  const [accessProfile, setAccessProfile] =
    useState<AdminAccessProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const sessionRef = useRef<AdminSession | null>(null);
  const accessRef = useRef<AdminAccessProfile | null>(null);
  const tokenRef = useRef<string | null>(null);

  const applySession = useCallback((next: AdminSession | null) => {
    sessionRef.current = next;
    tokenRef.current = next?.accessToken ?? null;
    setSession(next);
  }, []);

  const applyAccess = useCallback((next: AdminAccessProfile | null) => {
    accessRef.current = next;
    setAccessProfile(next);

    const current = sessionRef.current;
    if (current) {
      writeStoredAuth({ session: current, accessProfile: next });
    }
  }, []);

  const clearAuth = useCallback(() => {
    applySession(null);
    accessRef.current = null;
    setAccessProfile(null);
    clearStoredAuth();
    syncAdminSessionCookie(null);
  }, [applySession]);

  const loadAccessProfile = useCallback(async (): Promise<void> => {
    try {
      const orgs = await rbacApi.listMyOrgs();

      if (orgs.length === 0) {
        applyAccess(null);
        return;
      }

      const profiles = await Promise.all(
        orgs.map(async (org) => {
          try {
            return await rbacApi.getOrgAccess(org.id);
          } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
              throw error;
            }
            return null;
          }
        })
      );

      const available = profiles.filter(
        (profile): profile is AdminAccessProfile => profile !== null
      );

      if (available.length === 0) {
        // Keep the cached profile when every org request fails transiently.
        if (!accessRef.current) applyAccess(null);
        return;
      }

      applyAccess(selectPrimaryAccessProfile(available));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return;
      }
      // Keep the cached profile on transient/network errors.
    }
  }, [applyAccess]);

  const establishSession = useCallback(
    async (next: AdminSession): Promise<void> => {
      applySession(next);
      syncAdminSessionCookie(next.expiresAt);
      writeStoredAuth({ session: next, accessProfile: null });
      applyAccess(null);
      await loadAccessProfile();
    },
    [applySession, applyAccess, loadAccessProfile]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      if (sessionRef.current) {
        await authApi.logout();
      }
    } catch {
      // Best-effort server-side session revocation.
    }

    clearAuth();
    queryClient.clear();
  }, [clearAuth, queryClient]);

  useEffect(() => {
    setAdminAccessTokenGetter(() => tokenRef.current);
    return () => setAdminAccessTokenGetter(null);
  }, []);

  useEffect(() => {
    setAdminUnauthorizedHandler(() => {
      clearAuth();
      queryClient.clear();
    });
    return () => setAdminUnauthorizedHandler(null);
  }, [clearAuth, queryClient]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async (): Promise<void> => {
      const stored = readStoredAuth();

      if (!stored) {
        setIsInitializing(false);
        return;
      }

      applySession(stored.session);
      applyAccess(stored.accessProfile);
      syncAdminSessionCookie(stored.session.expiresAt);

      try {
        const info = await authApi.getSession();
        if (cancelled) return;

        const next: AdminSession = {
          accessToken: stored.session.accessToken,
          expiresAt: info.expiresAt,
          user: info.user,
        };

        applySession(next);
        syncAdminSessionCookie(next.expiresAt);
        writeStoredAuth({ session: next, accessProfile: accessRef.current });
        await loadAccessProfile();
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError && error.status === 401) {
          clearAuth();
        }
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [applySession, applyAccess, loadAccessProfile, clearAuth]);

  const roleKeys = accessProfile?.roleKeys ?? EMPTY_STRINGS;
  const backendPermissions = accessProfile?.permissions ?? EMPTY_STRINGS;

  const roles = useMemo(
    () => deriveAdminRoles(roleKeys, backendPermissions),
    [roleKeys, backendPermissions]
  );

  const permissions = useMemo(
    () => deriveAdminPermissions(roles),
    [roles]
  );

  const hasPermission = useCallback(
    (permission: AdminPermission): boolean =>
      hasAdminPermission(roles, permission),
    [roles]
  );

  const hasRole = useCallback(
    (role: AdminRole): boolean => hasAdminRole(roles, role),
    [roles]
  );

  const hasAnyRole = useCallback(
    (candidates: readonly AdminRole[]): boolean =>
      candidates.some((role) => roles.includes(role)),
    [roles]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      accessProfile,
      isAuthenticated: session !== null && session.expiresAt > Date.now(),
      isInitializing,
      roles,
      permissions,
      backendPermissions,
      establishSession,
      logout,
      hasPermission,
      hasRole,
      hasAnyRole,
    }),
    [
      session,
      accessProfile,
      isInitializing,
      roles,
      permissions,
      backendPermissions,
      establishSession,
      logout,
      hasPermission,
      hasRole,
      hasAnyRole,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
