"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/cn";
import { Badge } from "@/components/theme";
import { useAuth } from "../context/AuthContext";
import { useClickOutside } from "../hooks/useClickOutside";
import { ADMIN_ROLE_LABELS } from "../types/rbac";
import { getPrimaryRoleLabel } from "../utils/permissions";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AD";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
}

export function UserMenu() {
  const { session, roles, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  const displayName =
    session?.user.fullName ?? session?.user.username ?? "Administrator";
  const email = session?.user.email ?? "No email on file";
  const roleLabel = getPrimaryRoleLabel(roles);

  const handleLogout = async (): Promise<void> => {
    setOpen(false);
    await logout();
    router.replace("/login");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-muted py-1.5 pl-1.5 pr-3 transition-colors hover:border-border-default"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary-100 text-[11px] font-black text-primary-900">
          {getInitials(displayName)}
        </span>
        <span className="hidden text-left md:block">
          <span className="block max-w-[140px] truncate text-xs font-bold text-text-primary">
            {displayName}
          </span>
          <span className="block text-[11px] text-text-secondary">
            {roleLabel}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-text-tertiary transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-72 overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-xl"
        >
          <div className="border-b border-border-subtle px-4 py-3">
            <p className="text-xs font-black text-text-primary">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-text-secondary">{email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {roles.length > 0 ? (
                roles.map((role) => (
                  <Badge key={role} variant="primary" size="sm">
                    {ADMIN_ROLE_LABELS[role]}
                  </Badge>
                ))
              ) : (
                <Badge variant="warning" size="sm">
                  No role assigned
                </Badge>
              )}
            </div>
          </div>

          <div className="px-2 py-2">
            <div className="flex items-center gap-2 rounded-xl px-2 py-2 text-[11px] text-text-secondary">
              <ShieldCheck size={14} className="text-primary-600" />
              <span>RBAC session active</span>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
