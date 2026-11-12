"use client";

/**
 * @file AdminShell.tsx
 * @description Master administrative layout shell managing the expandable navigation sidebar,
 * top global header, dynamic breadcrumbs, and active module view routing.
 * @example
 * <AdminShell />
 */

// ===== IMPORTS =====
import React, { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/cn";
import { AdminHeader } from "../components/AdminHeader";
import { SideNav } from "../components/SideNav";
import { useAuth } from "../context/AuthContext";
import { getNavItem, type AdminNavTabId } from "../utils/navigation";
import { AccessRestrictedView } from "./AccessRestrictedView";
import { DashboardView } from "./DashboardView";
import { ModulePlaceholderView } from "./ModulePlaceholderView";
import { UsersView } from "../modules/Users/views/UsersView";

const SIDEBAR_STORAGE_KEY = "dl.admin.sidebar_expanded";

// ===== COMPONENT =====
export function AdminShell() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminNavTabId>("dashboard");
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Initialize sidebar preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored !== null) {
        setIsExpanded(stored === "true");
      }
    } catch {
      // Fallback to default expanded
    }
  }, []);

  const handleToggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const activeItem = getNavItem(activeTab);
  const isAllowed =
    activeItem.permission === null || hasPermission(activeItem.permission);

  useEffect(() => {
    if (!isAllowed) {
      setActiveTab("dashboard");
    }
  }, [isAllowed]);

  const breadcrumbs = useMemo(
    () => [{ label: activeItem.label }],
    [activeItem.label]
  );

  return (
    <div className="flex min-h-screen bg-surface-canvas selection:bg-primary-600 selection:text-white">
      <SideNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isExpanded={isExpanded}
        onToggleExpand={handleToggleExpand}
      />

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out",
          isExpanded ? "ml-64" : "ml-[76px]"
        )}
      >
        <AdminHeader
          title={activeItem.title}
          subtitle={activeItem.subtitle}
          breadcrumbs={breadcrumbs}
          onNavigate={setActiveTab}
        />

        <main className="mx-auto w-full max-w-[1400px] flex-1 p-8">
          {activeTab === "dashboard" ? (
            <DashboardView onNavigate={setActiveTab} />
          ) : !isAllowed ? (
            <AccessRestrictedView item={activeItem} />
          ) : activeTab === "users" ? (
            <UsersView />
          ) : (
            <ModulePlaceholderView item={activeItem} />
          )}
        </main>
      </div>
    </div>
  );
}

// ===== EXPORTS =====
export default AdminShell;
