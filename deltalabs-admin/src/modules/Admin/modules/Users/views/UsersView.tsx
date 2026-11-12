"use client";

/**
 * @file UsersView.tsx
 * @description Main User Management view — searchable, filterable, paginated user directory
 * with real data from the backend. Clicking a row opens UserDetailPanel.
 */

// ===== IMPORTS =====
import React, { useCallback, useDeferredValue, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { Badge } from "@/components/theme/Badge";
import { Button } from "@/components/theme/Button";
import { Input } from "@/components/theme/Input";
import { useUsersQuery } from "../hooks/useUsersQuery";
import type { AdminUserListItem, UserListParams, UserStatusFilter } from "../types";
import { UserDetailPanel } from "./UserDetailPanel";

// ===== CONSTANTS =====
const PAGE_SIZE = 20;

const STATUS_FILTERS: { label: string; value: UserStatusFilter }[] = [
  { label: "All Users", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

// ===== HELPERS =====
function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function getInitials(name: string | null, username: string): string {
  if (name) {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

// ===== SUB-COMPONENTS =====
function UserAvatar({ name, username, avatarUrl }: {
  name: string | null;
  username: string;
  avatarUrl?: string | null;
}) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt={username} className="h-8 w-8 rounded-full object-cover" />;
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
      {getInitials(name, username)}
    </div>
  );
}

function EmptyState({ query, status }: { query: string; status: UserStatusFilter }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-muted">
        <Users size={28} className="text-text-tertiary" />
      </div>
      <p className="text-base font-semibold text-text-primary">No users found</p>
      <p className="mt-1 text-sm text-text-secondary">
        {query
          ? `No results for "${query}"${status !== "all" ? ` with status "${status}"` : ""}.`
          : status !== "all"
          ? `No ${status} users in the directory.`
          : "The user directory is empty."}
      </p>
    </div>
  );
}

// ===== MAIN COMPONENT =====
export function UsersView() {
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput);
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);

  const params: UserListParams = {
    q: deferredSearch || undefined,
    status: statusFilter,
    page,
    pageSize: PAGE_SIZE,
  };

  const { data, isLoading, isError, isFetching, refetch } = useUsersQuery(params);

  // Reset to page 1 when filters change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: UserStatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;

  // ===== RENDER =====
  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Directory</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            {total > 0
              ? `${total.toLocaleString()} registered account${total !== 1 ? "s" : ""}`
              : "Browse and manage all platform accounts"}
          </p>
        </div>

        {/* Stats pills */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-secondary">
            <UserCheck size={12} className="text-emerald-500" />
            Active users
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-secondary">
            <UserX size={12} className="text-red-400" />
            Inactive users
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[260px] flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
          <Input
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search by name, email, or username…"
            className="pl-9"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex overflow-hidden rounded-xl border border-border-subtle bg-surface-muted p-0.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleStatusChange(filter.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                statusFilter === filter.value
                  ? "bg-surface-secondary text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={() => void refetch()}
          disabled={isFetching}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-surface-secondary text-text-tertiary transition-colors hover:border-primary-200 hover:text-primary-600 disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw size={14} className={cn(isFetching && "animate-spin")} />
        </button>
      </div>

      {/* ── Table Card ── */}
      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-secondary shadow-sm">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="divide-y divide-border-subtle">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-8 w-8 animate-pulse rounded-full bg-surface-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-40 animate-pulse rounded bg-surface-muted" />
                  <div className="h-3 w-56 animate-pulse rounded bg-surface-muted" />
                </div>
                <div className="h-6 w-16 animate-pulse rounded-full bg-surface-muted" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-3 py-16">
            <p className="text-sm text-red-600 font-medium">Failed to load users.</p>
            <Button size="sm" variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && (
          <>
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[27%]" />
                <col className="w-[16%]" />
                <col className="w-[14%]" />
                <col className="w-[13%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border-subtle bg-surface-muted">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={cn(
                  "divide-y divide-border-subtle transition-opacity duration-150",
                  isFetching && "opacity-60"
                )}
              >
                {data?.items.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState query={deferredSearch} status={statusFilter} />
                    </td>
                  </tr>
                )}
                {data?.items.map((user) => (
                  <tr
                    key={user.userId}
                    onClick={() => setSelectedUser(user)}
                    className="cursor-pointer transition-colors hover:bg-primary-50/60"
                  >
                    {/* User identity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          name={user.fullName}
                          username={user.username}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-text-primary">
                            {user.fullName ?? user.username}
                          </p>
                          <p className="truncate text-xs text-text-tertiary">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-4">
                      <p className="truncate text-text-secondary">
                        {user.email ?? "—"}
                      </p>
                      {user.phoneE164 && (
                        <p className="truncate text-xs text-text-tertiary">
                          {user.phoneE164}
                        </p>
                      )}
                    </td>

                    {/* Status + verified */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={user.isActive ? "success" : "danger"}
                          size="sm"
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {user.isVerified && (
                          <Badge variant="info" size="sm">Verified</Badge>
                        )}
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-4 text-xs text-text-secondary">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                        }}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-50"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border-subtle px-6 py-4">
                <p className="text-xs text-text-tertiary">
                  Page {page} of {totalPages} &bull; {total.toLocaleString()} total
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition-colors hover:border-primary-200 hover:text-primary-600 disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={15} />
                  </button>

                  {/* Page number pills */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum =
                      totalPages <= 5
                        ? i + 1
                        : page <= 3
                        ? i + 1
                        : page >= totalPages - 2
                        ? totalPages - 4 + i
                        : page - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors",
                          pageNum === page
                            ? "bg-primary-900 text-white"
                            : "border border-border-subtle text-text-secondary hover:border-primary-200 hover:text-primary-600"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition-colors hover:border-primary-200 hover:text-primary-600 disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail Panel ── */}
      <UserDetailPanel
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}

