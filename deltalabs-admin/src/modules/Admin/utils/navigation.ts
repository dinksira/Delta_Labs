/**
 * @file navigation.ts
 * @description Centralized navigation definitions and metadata for Delta Labs Admin Portal.
 */

import {
  BarChart3,
  BookOpen,
  Building2,
  CircleDollarSign,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Trophy,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

import type { AdminPermission } from "../types/rbac";

export type AdminNavTabId =
  | "dashboard"
  | "users"
  | "orgs"
  | "schools"
  | "courses"
  | "qa"
  | "competitions"
  | "media"
  | "analytics"
  | "finance"
  | "rbac";

export type AdminNavSection = "overview" | "governance" | "content" | "system";

export interface AdminNavItem {
  id: AdminNavTabId;
  label: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  permission: AdminPermission | null;
  section: AdminNavSection;
  badge?: string;
}

export const ADMIN_NAV_SECTION_LABELS: Record<AdminNavSection, string> = {
  overview: "Overview",
  governance: "Tenancy & Users",
  content: "Content & Duels",
  system: "Platform & Security",
};

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    title: "Executive Dashboard",
    subtitle: "System-wide metrics and health overview",
    icon: LayoutDashboard,
    permission: null,
    section: "overview",
  },
  {
    id: "analytics",
    label: "Analytics & Streams",
    title: "Analytics & Streams",
    subtitle: "Real-time engagement streams and audit logs",
    icon: BarChart3,
    permission: "analytics:read",
    section: "overview",
  },
  {
    id: "orgs",
    label: "Organizations & Tenancy",
    title: "Organizations & Tenancy",
    subtitle: "Multi-tenant configuration and feature toggles",
    icon: Building2,
    permission: "orgs:manage",
    section: "governance",
  },
  {
    id: "schools",
    label: "Schools & Rosters",
    title: "Schools & Rosters",
    subtitle: "Tenant schools, classes, students, and attendance",
    icon: GraduationCap,
    permission: "schools:manage",
    section: "governance",
  },
  {
    id: "users",
    label: "User Management",
    title: "User Management",
    subtitle: "Directory, accounts, sessions, and moderation",
    icon: Users,
    permission: "users:manage",
    section: "governance",
  },
  {
    id: "courses",
    label: "Courses & Content",
    title: "Courses & Content",
    subtitle: "Curriculum catalog, modules, and exercise test banks",
    icon: BookOpen,
    permission: "courses:manage",
    section: "content",
  },
  {
    id: "qa",
    label: "Q&A Moderation",
    title: "Q&A Moderation",
    subtitle: "Question queue, answer review, and thread controls",
    icon: MessageSquare,
    permission: "qa:moderate",
    section: "content",
  },
  {
    id: "competitions",
    label: "Duels & Competitions",
    title: "Duels & Competitions",
    subtitle: "Game modes, championship stages, and code execution",
    icon: Trophy,
    permission: "competitions:manage",
    section: "content",
  },
  {
    id: "media",
    label: "Media & Storage",
    title: "Media & Storage",
    subtitle: "Upload intents, HLS renditions, and CDN quotas",
    icon: Video,
    permission: "media:manage",
    section: "system",
  },
  {
    id: "finance",
    label: "Finance & Payments",
    title: "Finance & Payments",
    subtitle: "Transaction ledger, payment methods, and rent lab rentals",
    icon: CircleDollarSign,
    permission: "finance:manage",
    section: "system",
  },
  {
    id: "rbac",
    label: "RBAC & Permissions",
    title: "RBAC & Permissions",
    subtitle: "Roles, permission scopes, and access control policies",
    icon: ShieldCheck,
    permission: "rbac:manage",
    section: "system",
    badge: "Super Admin",
  },
];

export function getNavItem(id: AdminNavTabId): AdminNavItem {
  return ADMIN_NAV_ITEMS.find((item) => item.id === id) ?? ADMIN_NAV_ITEMS[0]!;
}
