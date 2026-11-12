"use client";

import React from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/theme";
import { useAuth } from "../context/AuthContext";
import { ADMIN_ROLE_LABELS } from "../types/rbac";
import type { AdminNavTabId } from "../utils/navigation";

interface DashboardStat {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  valueClassName: string;
  captionClassName: string;
  iconClassName: string;
}

const STATS: readonly DashboardStat[] = [
  {
    label: "Total Users",
    value: "24,850",
    caption: "+12% this month",
    icon: Users,
    valueClassName: "text-text-primary",
    captionClassName: "text-emerald-600",
    iconClassName: "bg-primary-50 text-primary-900",
  },
  {
    label: "Active Schools",
    value: "142",
    caption: "+5 new tenants",
    icon: GraduationCap,
    valueClassName: "text-text-primary",
    captionClassName: "text-emerald-600",
    iconClassName: "bg-primary-50 text-primary-900",
  },
  {
    label: "Live Duels",
    value: "38",
    caption: "Real-time active",
    icon: Trophy,
    valueClassName: "text-text-primary",
    captionClassName: "text-primary-600",
    iconClassName: "bg-primary-50 text-primary-900",
  },
  {
    label: "System Health",
    value: "99.9%",
    caption: "All services online",
    icon: ShieldCheck,
    valueClassName: "text-emerald-600",
    captionClassName: "text-text-secondary",
    iconClassName: "bg-emerald-50 text-emerald-600",
  },
];

const AUDIT_LOG = [
  {
    action: "User role updated",
    actor: "Super Admin",
    time: "2 mins ago",
    status: "success",
  },
  {
    action: "HLS rendition completed (720p)",
    actor: "Media Pipeline",
    time: "14 mins ago",
    status: "success",
  },
  {
    action: "School tenant onboarded: Addis Ababa STEM",
    actor: "Org Admin",
    time: "1 hour ago",
    status: "success",
  },
  {
    action: "Q&A question flagged for review",
    actor: "Moderator",
    time: "3 hours ago",
    status: "warning",
  },
] as const;

interface DashboardViewProps {
  onNavigate: (tab: AdminNavTabId) => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const { session, roles, accessProfile, permissions } = useAuth();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center justify-between p-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  {stat.label}
                </p>
                <h3 className={`mt-1 text-2xl font-black ${stat.valueClassName}`}>
                  {stat.value}
                </h3>
                <p
                  className={`mt-1 flex items-center gap-1 text-xs font-bold ${stat.captionClassName}`}
                >
                  {stat.label === "System Health" ? (
                    <CheckCircle2 size={14} />
                  ) : stat.label === "Live Duels" ? (
                    <Activity size={14} />
                  ) : (
                    <TrendingUp size={14} />
                  )}
                  {stat.caption}
                </p>
              </div>
              <div
                className={`flex size-12 items-center justify-center rounded-xl ${stat.iconClassName}`}
              >
                <Icon size={24} />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent System Audit Log</CardTitle>
            <CardDescription>
              Administrative actions recorded across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {AUDIT_LOG.map((log) => (
              <div
                key={log.action}
                className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle/60 bg-surface-muted p-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  {log.status === "success" ? (
                    <CheckCircle2
                      size={16}
                      className="shrink-0 text-emerald-600"
                    />
                  ) : (
                    <AlertCircle
                      size={16}
                      className="shrink-0 text-amber-500"
                    />
                  )}
                  <div>
                    <p className="font-bold text-text-primary">{log.action}</p>
                    <p className="text-[11px] text-text-secondary">
                      Actor: {log.actor}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-medium text-text-tertiary">
                  {log.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Access</CardTitle>
              <CardDescription>
                Active RBAC scope for this session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Signed in as
                </p>
                <p className="mt-1 truncate text-sm font-bold text-text-primary">
                  {session?.user.fullName ?? session?.user.username}
                </p>
                <p className="truncate text-[11px] text-text-tertiary">
                  {session?.user.email ?? "No email on file"}
                </p>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Roles
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <Badge key={role} variant="primary" size="sm">
                        {ADMIN_ROLE_LABELS[role]}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="warning" size="sm">
                      No role
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border-subtle bg-surface-muted p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                    Permissions
                  </p>
                  <p className="mt-1 text-lg font-black text-text-primary">
                    {permissions.length}
                  </p>
                </div>
                <div className="rounded-xl border border-border-subtle bg-surface-muted p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                    Membership
                  </p>
                  <p className="mt-1 truncate text-sm font-bold capitalize text-text-primary">
                    {accessProfile?.membershipState ?? "Unknown"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Organization
                </p>
                <p className="mt-1 truncate text-xs font-medium text-text-primary">
                  {accessProfile?.orgId ?? "No organization linked"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Frequently used administrative shortcuts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="secondary"
                fullWidth
                className="justify-between"
                rightIcon={<span aria-hidden="true">→</span>}
                onClick={() => onNavigate("users")}
              >
                Manage Users &amp; Roles
              </Button>
              <Button
                variant="secondary"
                fullWidth
                className="justify-between"
                rightIcon={<span aria-hidden="true">→</span>}
                onClick={() => onNavigate("schools")}
              >
                Onboard New School Tenant
              </Button>
              <Button
                variant="secondary"
                fullWidth
                className="justify-between"
                rightIcon={<span aria-hidden="true">→</span>}
                onClick={() => onNavigate("qa")}
              >
                Review Q&amp;A Moderation Queue
              </Button>
            </CardContent>
            <div className="border-t border-border-subtle px-6 py-3 text-center">
              <p className="text-[11px] text-text-tertiary">
                Delta Labs Admin Portal v1.0.0
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
