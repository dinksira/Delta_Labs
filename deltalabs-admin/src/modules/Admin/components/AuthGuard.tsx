"use client";

import React, { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "../context/AuthContext";
import { AccessDenied } from "./AccessDenied";

function FullScreenLoader({ label }: Readonly<{ label: string }>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface-canvas">
      <span className="size-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      <p className="text-xs font-bold text-text-secondary">{label}</p>
    </div>
  );
}

export function AuthGuard({ children }: Readonly<{ children: ReactNode }>) {
  const { isAuthenticated, isInitializing, roles } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${next}`);
    }
  }, [isInitializing, isAuthenticated, pathname, router]);

  if (isInitializing) {
    return <FullScreenLoader label="Restoring secure session..." />;
  }

  if (!isAuthenticated) {
    return <FullScreenLoader label="Redirecting to sign in..." />;
  }

  if (roles.length === 0) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
