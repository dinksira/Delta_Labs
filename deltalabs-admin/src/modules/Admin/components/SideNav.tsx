"use client";

/**
 * @file SideNav.tsx
 * @description Expandable administrative navigation sidebar with official Delta Labs branding,
 * section groupings, floating hover tooltips, and Super Admin access indicators.
 * @example
 * <SideNav
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   isExpanded={isExpanded}
 *   onToggleExpand={() => setIsExpanded(!isExpanded)}
 * />
 */

// ===== IMPORTS =====
import React from "react";
import Image from "next/image";
import {
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { useAuth } from "../context/AuthContext";
import {
  ADMIN_NAV_ITEMS,
  ADMIN_NAV_SECTION_LABELS,
  type AdminNavSection,
  type AdminNavTabId,
} from "../utils/navigation";

export type { AdminNavTabId } from "../utils/navigation";

// ===== TYPES =====
export interface SideNavProps {
  activeTab: AdminNavTabId;
  onTabChange: (tab: AdminNavTabId) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

// ===== COMPONENT =====
export function SideNav({
  activeTab,
  onTabChange,
  isExpanded,
  onToggleExpand,
}: SideNavProps) {
  const { hasPermission, hasRole } = useAuth();
  const isSuperAdmin = hasRole("super_admin");

  const visibleItems = ADMIN_NAV_ITEMS.filter(
    (item) => item.permission === null || hasPermission(item.permission)
  );

  const sections: AdminNavSection[] = ["overview", "governance", "content", "system"];

  return (
    <aside
      aria-label="Admin Navigation Sidebar"
      aria-expanded={isExpanded}
      className={cn(
        "fixed left-0 top-0 z-50 flex h-full flex-col border-r border-white/10 bg-primary-950 text-white transition-all duration-300 ease-in-out shadow-2xl",
        isExpanded ? "w-64" : "w-[76px]"
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-white/10 px-4 transition-all duration-300",
          isExpanded ? "justify-between" : "justify-center"
        )}
      >
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-3 outline-none text-left focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl"
          title={isExpanded ? "Click to collapse" : "Click to expand"}
          aria-label={isExpanded ? "Collapse navigation" : "Expand navigation"}
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 p-1.5 transition-transform hover:scale-105 shadow-inner">
            <Image
              src="/delta-logo.svg"
              alt="Delta Labs"
              width={34}
              height={34}
              className="size-8 object-contain drop-shadow"
            />
          </div>

          {isExpanded && (
            <div className="min-w-0 transition-opacity duration-200">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-bold tracking-wider text-white">
                  DELTA LABS
                </span>
                <span className="rounded bg-primary-500/20 px-1 py-0.5 text-[9px] font-bold text-primary-300">
                  ADMIN
                </span>
              </div>
              <p className="truncate text-[10px] font-medium text-white/60">
                Command Center v2.0
              </p>
            </div>
          )}
        </button>

        {isExpanded && (
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label="Collapse sidebar"
            className="flex size-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {/* Navigation Groups List */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 scrollbar-thin scrollbar-thumb-white/10">
        {sections.map((sectionKey, sIdx) => {
          const sectionItems = visibleItems.filter((item) => item.section === sectionKey);
          if (sectionItems.length === 0) return null;

          return (
            <div key={sectionKey} className={cn("space-y-1", sIdx > 0 && "mt-4")}>
              {/* Section Header */}
              {isExpanded ? (
                <div className="px-3 pb-1 pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                    {ADMIN_NAV_SECTION_LABELS[sectionKey]}
                  </p>
                </div>
              ) : (
                sIdx > 0 && <div className="my-2 border-t border-white/10 mx-2" />
              )}

              {/* Items in Section */}
              {sectionItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <div key={item.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => onTabChange(item.id)}
                      aria-label={item.label}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex w-full items-center rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary-400",
                        isExpanded
                          ? "gap-3 px-3.5 py-2.5 text-left text-xs font-semibold"
                          : "size-12 justify-center mx-auto",
                        isActive
                          ? "bg-white text-primary-950 font-bold shadow-lg"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <IconComponent
                        size={20}
                        className={cn(
                          "shrink-0 transition-transform group-hover:scale-105",
                          isActive ? "text-primary-900" : "text-white/80"
                        )}
                      />

                      {isExpanded && (
                        <div className="flex min-w-0 flex-1 items-center justify-between">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                "ml-2 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
                                isActive
                                  ? "bg-primary-950 text-white"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>

                    {/* Floating Hover Tooltip (Shown when sidebar is collapsed) */}
                    {!isExpanded && (
                      <div
                        role="tooltip"
                        className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 z-[100] -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/15 bg-primary-950/95 px-3.5 py-2 text-white shadow-2xl backdrop-blur-md opacity-0 -translate-x-2 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="rounded bg-emerald-500/25 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/40">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] text-white/60">
                          {item.subtitle}
                        </p>
                        <span className="absolute -left-1 top-1/2 size-2 -translate-y-1/2 rotate-45 border-b border-l border-white/15 bg-primary-950" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Super Admin & Collapse Toggle Footer */}
      <div className="shrink-0 border-t border-white/10 p-3 bg-primary-950/60">
        {isExpanded ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white flex items-center gap-1.5">
                  {isSuperAdmin ? "Super Admin" : "Admin Session"}
                  <Sparkles size={11} className="text-amber-300" />
                </p>
                <p className="truncate text-[10px] text-white/60">
                  {isSuperAdmin ? "Full Platform Governance" : "Delegated RBAC Scope"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleExpand}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span>Collapse Sidebar</span>
              <ChevronLeft size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {/* Collapsed Super Admin Indicator */}
            <div className="relative group">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck size={20} />
              </div>

              <div
                role="tooltip"
                className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 z-[100] -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/15 bg-primary-950/95 px-3 py-1.5 text-white shadow-2xl backdrop-blur-md opacity-0 -translate-x-2 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
              >
                <p className="text-xs font-bold text-white">
                  {isSuperAdmin ? "Super Admin" : "Active Admin Session"}
                </p>
                <p className="text-[10px] text-white/60">
                  {isSuperAdmin ? "Full Platform Governance" : "RBAC Guarded"}
                </p>
                <span className="absolute -left-1 top-1/2 size-2 -translate-y-1/2 rotate-45 border-b border-l border-white/15 bg-primary-950" />
              </div>
            </div>

            {/* Collapsed Expand Toggle */}
            <button
              type="button"
              onClick={onToggleExpand}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className="flex size-10 items-center justify-center rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <PanelLeftOpen size={18} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

// ===== EXPORTS =====
export default SideNav;
