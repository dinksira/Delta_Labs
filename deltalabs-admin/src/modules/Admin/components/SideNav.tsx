"use client";

/**
 * @file SideNav.tsx
 * @description Expandable admin navigation with rounded edges, searchable sections, light nav rows, and collapsed icon tooltips.
 * @example
 * <SideNav
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   isExpanded={isExpanded}
 *   onToggleExpand={() => setIsExpanded(!isExpanded)}
 * />
 */

// ===== IMPORTS =====
import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { Input } from "@/components/theme";
import { useAuth } from "../context/AuthContext";
import {
  ADMIN_NAV_ITEMS,
  ADMIN_NAV_SECTION_LABELS,
  type AdminNavSection,
  type AdminNavTabId,
} from "../utils/navigation";

export type { AdminNavTabId } from "../utils/navigation";

// ===== CONSTANTS =====
const NAV_SECTIONS: readonly AdminNavSection[] = [
  "overview",
  "governance",
  "content",
  "system",
];

const TOOLTIP_CLASSES =
  "pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 -translate-x-2 whitespace-nowrap rounded-xl border border-white/10 bg-primary-950 px-3 py-2 text-xs font-bold text-white opacity-0 shadow-xl transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100";

const TOOLTIP_ARROW_CLASSES =
  "absolute -left-1 top-1/2 size-2 -translate-y-1/2 rotate-45 border-b border-l border-white/10 bg-primary-950";

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
  const [searchQuery, setSearchQuery] = useState("");
  const isSuperAdmin = hasRole("super_admin");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleItems = useMemo(() => {
    const allowedItems = ADMIN_NAV_ITEMS.filter(
      (item) => item.permission === null || hasPermission(item.permission)
    );

    if (!normalizedQuery) return allowedItems;

    return allowedItems.filter((item) =>
      `${item.label} ${item.title} ${item.subtitle}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [hasPermission, normalizedQuery]);

  return (
    <aside
      aria-label="Admin Navigation Sidebar"
      className={cn(
        "fixed left-0 top-0 z-50 flex h-full flex-col rounded-r-3xl border-r border-white/10 bg-primary-950 text-white shadow-2xl transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-white/10",
          isExpanded ? "justify-between px-5" : "justify-center px-0"
        )}
      >
        <button
          type="button"
          onClick={onToggleExpand}
          title={isExpanded ? "Collapse navigation" : "Expand navigation"}
          aria-label={isExpanded ? "Collapse navigation" : "Expand navigation"}
          aria-expanded={isExpanded}
          className="flex min-w-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        >
          <Image
            src="/delta-logo.svg"
            alt="Delta Labs"
            width={36}
            height={36}
            className="size-9 shrink-0 object-contain drop-shadow"
          />

          {isExpanded && (
            <div className="min-w-0">
              <p className="truncate text-xs font-black tracking-widest text-white">
                DELTA LABS
              </p>
              <p className="truncate text-xs font-medium text-white/50">
                Admin Console
              </p>
            </div>
          )}
        </button>

        {isExpanded && (
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label="Collapse sidebar"
            aria-expanded={isExpanded}
            className="flex size-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      <nav
        aria-label="Admin modules"
        className={cn(
          "flex-1 px-3 py-4",
          isExpanded ? "overflow-y-auto" : "overflow-visible"
        )}
      >
        {isExpanded ? (
          <div className="relative mb-4">
            <Input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search modules..."
              aria-label="Search admin modules"
              className="border-white/10 bg-white/10 text-white placeholder:text-white/40 focus:border-white/40"
              leftIcon={<Search size={15} />}
              rightIcon={
                searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear sidebar search"
                    className="pointer-events-auto rounded-md p-1 text-white/50 transition-colors hover:text-white"
                  >
                    <X size={14} />
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="group relative mb-4 flex justify-center">
            <button
              type="button"
              onClick={onToggleExpand}
              aria-label="Search admin modules"
              aria-expanded={isExpanded}
              className="flex size-11 items-center justify-center rounded-xl bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Search size={18} />
            </button>
            <div role="tooltip" className={TOOLTIP_CLASSES}>
              Search modules
              <span className={TOOLTIP_ARROW_CLASSES} />
            </div>
          </div>
        )}

        {isExpanded && normalizedQuery && visibleItems.length === 0 && (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3 text-center">
            <p className="text-xs font-semibold text-white/70">No modules found</p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-1 text-xs font-bold text-primary-300 transition-colors hover:text-white"
            >
              Clear search
            </button>
          </div>
        )}

        {NAV_SECTIONS.map((sectionKey, sectionIndex) => {
          const sectionItems = visibleItems.filter(
            (item) => item.section === sectionKey
          );

          if (sectionItems.length === 0) return null;

          return (
            <div
              key={sectionKey}
              className={cn("space-y-1", sectionIndex > 0 && "mt-4")}
            >
              {isExpanded ? (
                <div className="px-3 pb-1 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                    {ADMIN_NAV_SECTION_LABELS[sectionKey]}
                  </p>
                </div>
              ) : (
                sectionIndex > 0 && (
                  <div className="mx-2 my-2 border-t border-white/10" />
                )
              )}

              {sectionItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                const tooltipId = `nav-tooltip-${item.id}`;

                return (
                  <div key={item.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => onTabChange(item.id)}
                      aria-label={item.label}
                      aria-current={isActive ? "page" : undefined}
                      aria-describedby={!isExpanded ? tooltipId : undefined}
                      className={cn(
                        "flex w-full items-center rounded-xl outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary-400",
                        isExpanded
                          ? "gap-3 px-3 py-2.5 text-left text-xs font-semibold"
                          : "mx-auto size-12 justify-center",
                        isActive
                          ? "bg-white text-primary-950 shadow-lg"
                          : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
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
                        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-xs font-bold uppercase text-emerald-300">
                              {item.badge}
                            </span>
                          )}
                        </span>
                      )}
                    </button>

                    {!isExpanded && (
                      <div id={tooltipId} role="tooltip" className={TOOLTIP_CLASSES}>
                        <span className="flex items-center gap-2">
                          {item.label}
                          {item.badge && (
                            <span className="rounded border border-emerald-500/40 bg-emerald-500/25 px-1.5 py-0.5 text-xs font-bold text-emerald-300">
                              {item.badge}
                            </span>
                          )}
                        </span>
                        <span className={TOOLTIP_ARROW_CLASSES} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div
        className={cn(
          "shrink-0 border-t border-white/10 p-3",
          !isExpanded && "rounded-br-3xl"
        )}
      >
        {isExpanded ? (
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label="Collapse sidebar"
            aria-expanded={isExpanded}
            className="flex w-full items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-emerald-400" />
              {isSuperAdmin ? "Super Admin" : "Admin Session"}
            </span>
            <PanelLeftClose size={16} />
          </button>
        ) : (
          <div className="group relative flex justify-center">
            <button
              type="button"
              onClick={onToggleExpand}
              aria-label="Expand navigation"
              aria-expanded={isExpanded}
              className="flex size-11 items-center justify-center rounded-xl bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <PanelLeftOpen size={18} />
            </button>
            <div role="tooltip" className={TOOLTIP_CLASSES}>
              {isSuperAdmin ? "Super Admin" : "Admin Session"}
              <span className={TOOLTIP_ARROW_CLASSES} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ===== EXPORTS =====
export default SideNav;
