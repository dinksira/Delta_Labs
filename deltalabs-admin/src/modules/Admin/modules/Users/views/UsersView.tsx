"use client";

/**
 * @file UsersView.tsx
 * @description Main User Management view — searchable, filterable, paginated user directory
 * with real data from the backend. Clicking a row opens a centered UserDetailPanel modal.
 */

// ===== IMPORTS =====
import React, { useCallback, useDeferredValue, useState } from "react";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { Badge } from "@/components/theme/Badge";
import { Button } from "@/components/theme/Button";
import { Input } from "@/components/theme/Input";
import { useUsersQuery } from "../hooks/useUsersQuery";
import type { AdminUserListItem, UserListParams, UserStatusFilter } from "../types";
import { CreateUserModal } from "./CreateUserModal";
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
function UserAvatar({
  name,
  username,
}: {
  name: string | null;
  username: string;
}) {
  return (
    <div className="flex size-10 items-center justify-center rounded-xl bg-primary-100 text-xs font-black text-primary-700 ring-1 ring-primary-200/60">
      {getInitials(name, username)}
    </div>
  );
}

function EmptyState({
  query,
  status,
}: {
  query: string;
  status: UserStatusFilter;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-surface-muted">
        <Users size={28} className="text-text-tertiary" />
      </div>
      <p className="text-base font-semibold text-text-primary">No users found</p>
      <p className="mt-1 max-w-sm text-sm text-text-secondary">
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const params: UserListParams = {
    q: deferredSearch || undefined,
    status: statusFilter,
    page,
    pageSize: PAGE_SIZE,
  };

  const { data, isLoading, isError, isFetching, refetch } = useUsersQuery(params);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
      setPage(1);
    },
    []
  );

  const handleStatusChange = useCallback((value: UserStatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Governance
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-text-primary sm:text-3xl">
            User Directory
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {total > 0
              ? `${total.toLocaleString()} registered account${total !== 1 ? "s" : ""}`
              : "Browse and manage all platform accounts"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
            <UserCheck size={13} />
            Active
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 sm:flex">
            <UserX size={13} />
            Inactive
          </div>
          <Button
            size="sm"
            leftIcon={<Plus size={15} />}
            onClick={() => setIsCreateOpen(true)}
          >
            Add User
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            {successMessage}
          </span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="rounded-md p-1 text-emerald-600 transition-colors hover:bg-emerald-100"
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="rounded-3xl border border-border-subtle bg-surface-secondary p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[260px] flex-1">
            <Input
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search by name, email, or username..."
              aria-label="Search users"
              leftIcon={<Search size={16} />}
              className="bg-surface-muted/40"
            />
          </div>

          <div className="flex rounded-xl border border-border-subtle bg-surface-muted/50 p-1">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleStatusChange(filter.value)}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs font-bold transition-all",
                  statusFilter === filter.value
                    ? "bg-white text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => void refetch()}
            disabled={isFetching}
            className="flex size-10 items-center justify-center rounded-xl border border-border-subtle bg-white text-text-tertiary transition-colors hover:border-primary-200 hover:text-primary-700 disabled:opacity-50"
            aria-label="Refresh users"
          >
            <RefreshCw size={15} className={cn(isFetching && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border-subtle bg-surface-secondary shadow-sm">
        {isLoading && (
          <div className="divide-y divide-border-subtle">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="size-10 animate-pulse rounded-xl bg-surface-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-40 animate-pulse rounded bg-surface-muted" />
                  <div className="h-3 w-56 animate-pulse rounded bg-surface-muted" />
                </div>
                <div className="h-6 w-16 animate-pulse rounded-full bg-surface-muted" />
              </div>
            ))}
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-3 py-16">
            <p className="text-sm font-medium text-red-600">Failed to load users.</p>
            <Button size="sm" variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-muted/60">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-text-tertiary">
                      User
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-text-tertiary">
                      Contact
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-text-tertiary">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-text-tertiary">
                      Joined
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
                      <td colSpan={4}>
                        <EmptyState query={deferredSearch} status={statusFilter} />
                      </td>
                    </tr>
                  )}

                  {data?.items.map((user) => (
                    <tr
                      key={user.userId}
                      onClick={() => setSelectedUser(user)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedUser(user);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Open details for ${user.fullName ?? user.username}`}
                      className="group cursor-pointer transition-colors hover:bg-primary-50/50 focus-visible:bg-primary-50/50 focus-visible:outline-none"
                    >
                      <td className="px-6 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <UserAvatar name={user.fullName} username={user.username} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-text-primary transition-colors group-hover:text-primary-700">
                              {user.fullName ?? user.username}
                            </p>
                            <p className="truncate text-xs text-text-tertiary">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <p className="truncate font-medium text-text-secondary">
                          {user.email ?? "—"}
                        </p>
                        {user.phoneE164 && (
                          <p className="truncate text-xs text-text-tertiary">
                            {user.phoneE164}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge
                            variant={user.isActive ? "success" : "danger"}
                            size="sm"
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {user.isVerified && (
                            <Badge variant="info" size="sm">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-text-secondary">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle px-6 py-4">
                <p className="text-xs font-medium text-text-tertiary">
                  Page {page} of {totalPages} &bull; {total.toLocaleString()} total
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex size-9 items-center justify-center rounded-lg border border-border-subtle bg-white text-text-secondary transition-colors hover:border-primary-200 hover:text-primary-700 disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={15} />
                  </button>

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
                          "flex size-9 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                          pageNum === page
                            ? "bg-primary-900 text-white shadow-sm"
                            : "border border-border-subtle bg-white text-text-secondary hover:border-primary-200 hover:text-primary-700"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex size-9 items-center justify-center rounded-lg border border-border-subtle bg-white text-text-secondary transition-colors hover:border-primary-200 hover:text-primary-700 disabled:opacity-40"
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

      <UserDetailPanel
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
      <CreateUserModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(message) => {
          setSuccessMessage(message);
          setPage(1);
        }}
      />
    </div>
  );
}
