"use client";

/**
 * @file UserDetailPanel.tsx
 * @description Slide-out panel showing full user detail with moderation actions.
 * Fetches data from the backend via useUserDetailQuery.
 */

// ===== IMPORTS =====
import React, { useEffect, useRef, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  LogOut,
  Mail,
  Phone,
  ShieldOff,
  User,
  X,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { Badge } from "@/components/theme/Badge";
import { Button } from "@/components/theme/Button";
import { useUserDetailQuery } from "../hooks/useUserDetailQuery";
import {
  useRevokeSessionsMutation,
  useUpdateUserStatusMutation,
} from "../hooks/useUserMutations";
import type { AdminUserListItem } from "../types";

// ===== TYPES =====
interface UserDetailPanelProps {
  user: AdminUserListItem | null;
  onClose: () => void;
}

// ===== HELPERS =====
function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function getInitials(name: string | null, username: string): string {
  if (name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

// ===== COMPONENT =====
export function UserDetailPanel({ user, onClose }: UserDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [banReason, setBanReason] = useState("");
  const [confirmAction, setConfirmAction] = useState<
    "deactivate" | "activate" | "revoke" | null
  >(null);

  const { data: detail, isLoading, isError } = useUserDetailQuery(user?.userId ?? null);
  const updateStatus = useUpdateUserStatusMutation();
  const revokeSessions = useRevokeSessionsMutation();

  const isOpen = user !== null;

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // ===== ACTION HANDLERS =====
  const handleDeactivate = () => {
    if (!detail) return;
    updateStatus.mutate(
      { userId: detail.userId, payload: { isActive: false, reason: banReason || undefined } },
      {
        onSuccess: () => {
          setConfirmAction(null);
          setBanReason("");
        },
      }
    );
  };

  const handleActivate = () => {
    if (!detail) return;
    updateStatus.mutate(
      { userId: detail.userId, payload: { isActive: true } },
      { onSuccess: () => setConfirmAction(null) }
    );
  };

  const handleRevokeSessions = () => {
    if (!detail) return;
    revokeSessions.mutate(detail.userId, {
      onSuccess: () => setConfirmAction(null),
    });
  };

  // ===== RENDER =====
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="User Detail"
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[520px] flex-col bg-surface-secondary shadow-2xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <h2 className="text-base font-semibold text-text-primary">User Details</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-surface-muted hover:text-text-primary"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            </div>
          )}

          {isError && (
            <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load user details. Please try again.
            </div>
          )}

          {detail && (
            <div className="p-6 space-y-6">
              {/* ── Avatar + Identity ── */}
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl font-bold text-primary-700">
                  {detail.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={detail.avatarUrl}
                      alt={detail.username}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                  ) : (
                    getInitials(detail.fullName, detail.username)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold text-text-primary truncate">
                      {detail.fullName ?? detail.username}
                    </span>
                    <Badge variant={detail.isActive ? "success" : "danger"} size="sm">
                      {detail.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {detail.isVerified && (
                      <Badge variant="info" size="sm">Verified</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-text-secondary">@{detail.username}</p>
                  {detail.bio && (
                    <p className="mt-2 text-sm text-text-tertiary line-clamp-2">{detail.bio}</p>
                  )}
                </div>
              </div>

              {/* ── Contact Info ── */}
              <div className="rounded-xl border border-border-subtle bg-surface-muted p-4 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={14} className="shrink-0 text-text-tertiary" />
                    <span className="text-text-primary">{detail.email ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={14} className="shrink-0 text-text-tertiary" />
                    <span className="text-text-primary">{detail.phoneE164 ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User size={14} className="shrink-0 text-text-tertiary" />
                    <span className="font-mono text-xs text-text-tertiary break-all">{detail.userId}</span>
                  </div>
                </div>
              </div>

              {/* ── Account Timestamps ── */}
              <div className="rounded-xl border border-border-subtle bg-surface-muted p-4 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                  Account Timeline
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-text-tertiary">Joined</p>
                    <p className="mt-0.5 font-medium text-text-primary">{formatDate(detail.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">Last Updated</p>
                    <p className="mt-0.5 font-medium text-text-primary">{formatDate(detail.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">Last Session</p>
                    <p className="mt-0.5 font-medium text-text-primary">{formatDate(detail.lastSessionAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">Active Sessions</p>
                    <p className="mt-0.5 font-medium text-text-primary">
                      {detail.activeSessions === 0 ? "None" : detail.activeSessions}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Confirm Action Block ── */}
              {confirmAction === "deactivate" && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
                    <AlertTriangle size={15} />
                    Confirm Account Deactivation
                  </div>
                  <p className="text-xs text-red-600">
                    This will deactivate the account and revoke all active sessions immediately.
                  </p>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Reason (optional)"
                    className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                    rows={2}
                    maxLength={500}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={handleDeactivate}
                      isLoading={updateStatus.isPending}
                    >
                      Deactivate
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setConfirmAction(null); setBanReason(""); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {confirmAction === "activate" && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <CheckCircle2 size={15} />
                    Confirm Account Activation
                  </div>
                  <p className="text-xs text-emerald-600">
                    This will re-enable the account so the user can sign in again.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleActivate}
                      isLoading={updateStatus.isPending}
                    >
                      Activate
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmAction(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {confirmAction === "revoke" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                    <AlertTriangle size={15} />
                    Revoke All Sessions
                  </div>
                  <p className="text-xs text-amber-600">
                    The user will be signed out of all devices immediately. Their account stays active.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleRevokeSessions}
                      isLoading={revokeSessions.isPending}
                    >
                      Revoke Sessions
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmAction(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Mutation feedback ── */}
              {(updateStatus.isSuccess || revokeSessions.isSuccess) && !confirmAction && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle2 size={15} />
                  Action completed successfully.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — Moderation Actions */}
        {detail && !isLoading && (
          <div className="border-t border-border-subtle px-6 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">
              Moderation Actions
            </p>
            <div className="flex flex-wrap gap-2">
              {detail.isActive ? (
                <Button
                  size="sm"
                  variant="danger"
                  leftIcon={<XCircle size={14} />}
                  onClick={() => setConfirmAction("deactivate")}
                  disabled={confirmAction !== null}
                >
                  Deactivate Account
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<CheckCircle2 size={14} />}
                  onClick={() => setConfirmAction("activate")}
                  disabled={confirmAction !== null}
                >
                  Activate Account
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<LogOut size={14} />}
                onClick={() => setConfirmAction("revoke")}
                disabled={confirmAction !== null || detail.activeSessions === 0}
              >
                Revoke Sessions
                {detail.activeSessions > 0 && (
                  <span className="ml-1 rounded-full bg-amber-200 px-1.5 py-px text-xs font-bold text-amber-800">
                    {detail.activeSessions}
                  </span>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<ShieldOff size={14} />}
                disabled
                title="Coming soon"
              >
                Force Password Reset
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
