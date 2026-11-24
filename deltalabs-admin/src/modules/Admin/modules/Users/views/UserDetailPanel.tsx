"use client";

/**
 * @file UserDetailPanel.tsx
 * @description Centered modal showing full user detail with moderation actions.
 * Fetches data from the backend via useUserDetailQuery.
 */

// ===== IMPORTS =====
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock3,
  LogOut,
  Mail,
  Shield,
  ShieldOff,
  X,
  XCircle,
} from "lucide-react";
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
  const [mounted, setMounted] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [confirmAction, setConfirmAction] = useState<
    "deactivate" | "activate" | "revoke" | null
  >(null);

  const { data: detail, isLoading, isError } = useUserDetailQuery(
    user?.userId ?? null
  );
  const updateStatus = useUpdateUserStatusMutation();
  const revokeSessions = useRevokeSessionsMutation();

  const isOpen = user !== null;
  const displayUser = detail ?? user;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setConfirmAction(null);
    setBanReason("");
  }, [user?.userId]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  const handleDeactivate = () => {
    if (!detail) return;
    updateStatus.mutate(
      {
        userId: detail.userId,
        payload: { isActive: false, reason: banReason || undefined },
      },
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

  if (!mounted || !isOpen || !displayUser) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="User details"
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border-subtle bg-surface-secondary shadow-2xl"
      >
        <div className="relative border-b border-border-subtle bg-gradient-to-br from-primary-50 via-surface-secondary to-surface-muted px-6 py-6 sm:px-8">
          <div className="absolute -right-10 -top-10 size-32 rounded-full bg-primary-100/70 blur-2xl" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl p-2 text-text-tertiary transition-colors hover:bg-white/80 hover:text-text-primary"
            aria-label="Close user details"
          >
            <X size={18} />
          </button>

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-900 text-xl font-black text-white shadow-lg ring-4 ring-white">
              {detail?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={detail.avatarUrl}
                  alt={displayUser.username}
                  className="size-full object-cover"
                />
              ) : (
                getInitials(displayUser.fullName, displayUser.username)
              )}
            </div>

            <div className="min-w-0 flex-1 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-black tracking-tight text-text-primary sm:text-2xl">
                  {displayUser.fullName ?? displayUser.username}
                </h2>
                <Badge
                  variant={displayUser.isActive ? "success" : "danger"}
                  size="sm"
                >
                  {displayUser.isActive ? "Active" : "Inactive"}
                </Badge>
                {displayUser.isVerified && (
                  <Badge variant="info" size="sm">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm font-medium text-text-secondary">
                @{displayUser.username}
              </p>
              <p className="mt-3 max-w-2xl text-sm text-text-tertiary">
                {detail?.bio || "Review account details, session activity, and moderation actions."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {isLoading && (
            <div className="flex h-52 items-center justify-center">
              <div className="size-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-700" />
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              Failed to load user details. Please try again.
            </div>
          )}

          {!isLoading && !isError && detail && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border-subtle bg-surface-muted/60 p-4">
                  <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
                    <Mail size={14} />
                    Contact
                  </p>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-text-tertiary">Email</p>
                      <p className="mt-0.5 break-all font-medium text-text-primary">
                        {detail.email ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary">Phone</p>
                      <p className="mt-0.5 font-medium text-text-primary">
                        {detail.phoneE164 ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-surface-muted/60 p-4">
                  <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
                    <Shield size={14} />
                    Account
                  </p>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-text-tertiary">User ID</p>
                      <p className="mt-0.5 break-all font-mono text-xs text-text-primary">
                        {detail.userId}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary">Active Sessions</p>
                      <p className="mt-0.5 font-medium text-text-primary">
                        {detail.activeSessions === 0 ? "None" : detail.activeSessions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border-subtle bg-surface-muted/60 p-4">
                <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
                  <Calendar size={14} />
                  Timeline
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-text-tertiary">Joined</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">
                      {formatDate(detail.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">Last Updated</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">
                      {formatDate(detail.updatedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-xs text-text-tertiary">
                      <Clock3 size={12} />
                      Last Session
                    </p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">
                      {formatDate(detail.lastSessionAt)}
                    </p>
                  </div>
                </div>
              </div>

              {confirmAction === "deactivate" && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-red-700">
                    <AlertTriangle size={15} />
                    Confirm Account Deactivation
                  </div>
                  <p className="mt-2 text-xs text-red-600">
                    This will deactivate the account and revoke all active sessions immediately.
                  </p>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Reason (optional)"
                    className="mt-3 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-red-200"
                    rows={2}
                    maxLength={500}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
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
                      onClick={() => {
                        setConfirmAction(null);
                        setBanReason("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {confirmAction === "activate" && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                    <CheckCircle2 size={15} />
                    Confirm Account Activation
                  </div>
                  <p className="mt-2 text-xs text-emerald-600">
                    This will re-enable the account so the user can sign in again.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleActivate}
                      isLoading={updateStatus.isPending}
                    >
                      Activate
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmAction(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {confirmAction === "revoke" && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
                    <AlertTriangle size={15} />
                    Revoke All Sessions
                  </div>
                  <p className="mt-2 text-xs text-amber-600">
                    The user will be signed out of all devices immediately. Their account stays active.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleRevokeSessions}
                      isLoading={revokeSessions.isPending}
                    >
                      Revoke Sessions
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmAction(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {(updateStatus.isSuccess || revokeSessions.isSuccess) &&
                !confirmAction && (
                  <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    <CheckCircle2 size={15} />
                    Action completed successfully.
                  </div>
                )}
            </div>
          )}
        </div>

        {detail && !isLoading && (
          <div className="border-t border-border-subtle bg-surface-muted/30 px-6 py-4 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
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
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<CheckCircle2 size={14} />}
                    onClick={() => setConfirmAction("activate")}
                    disabled={confirmAction !== null}
                  >
                    Activate
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
                    <span className="ml-1 rounded-full bg-amber-200 px-1.5 py-px text-xs font-bold text-amber-900">
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
                  Reset Password
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
