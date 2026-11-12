"use client";

import React, { useRef, useState } from "react";
import { Search } from "lucide-react";

import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";
import { NotificationCenter } from "./NotificationCenter";
import { UserMenu } from "./UserMenu";
import { useAuth } from "../context/AuthContext";
import { useClickOutside } from "../hooks/useClickOutside";
import {
  ADMIN_NAV_ITEMS,
  type AdminNavTabId,
} from "../utils/navigation";

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  breadcrumbs: readonly BreadcrumbItem[];
  onNavigate: (tab: AdminNavTabId) => void;
}

export function AdminHeader({
  title,
  subtitle,
  breadcrumbs,
  onNavigate,
}: AdminHeaderProps) {
  const { hasPermission } = useAuth();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useClickOutside(searchRef, () => setSearchOpen(false), searchOpen);

  const allowedItems = ADMIN_NAV_ITEMS.filter(
    (item) => item.permission === null || hasPermission(item.permission)
  );

  const normalizedQuery = query.trim().toLowerCase();
  const results = normalizedQuery
    ? allowedItems.filter((item) =>
        `${item.label} ${item.title} ${item.subtitle}`
          .toLowerCase()
          .includes(normalizedQuery)
      )
    : [];

  const navigateTo = (tab: AdminNavTabId): void => {
    onNavigate(tab);
    setQuery("");
    setSearchOpen(false);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (event.key === "Escape") {
      setSearchOpen(false);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const first = results[0];
      if (first) navigateTo(first.id);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-6 border-b border-border-subtle bg-white/80 px-8 py-4 backdrop-blur-md">
      <div className="min-w-0">
        <Breadcrumbs items={breadcrumbs} className="mb-1" />
        <h1 className="truncate text-xl font-black text-text-primary">
          {title}
        </h1>
        <p className="truncate text-xs text-text-secondary">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div ref={searchRef} className="relative hidden w-72 lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search admin modules..."
            aria-label="Search admin modules"
            className="h-10 w-full rounded-xl border border-border-subtle bg-surface-muted pl-10 pr-4 text-xs text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-primary-600"
          />

          {searchOpen && normalizedQuery ? (
            <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-xl">
              {results.length > 0 ? (
                <ul className="max-h-72 overflow-y-auto py-1">
                  {results.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => navigateTo(item.id)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-surface-muted"
                        >
                          <span className="flex size-8 items-center justify-center rounded-lg bg-primary-50 text-primary-900">
                            <Icon size={15} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-bold text-text-primary">
                              {item.label}
                            </span>
                            <span className="block truncate text-[11px] text-text-tertiary">
                              {item.subtitle}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="px-3 py-4 text-center text-[11px] text-text-tertiary">
                  No modules match &ldquo;{query.trim()}&rdquo;
                </p>
              )}
            </div>
          ) : null}
        </div>

        <NotificationCenter />
        <UserMenu />
      </div>
    </header>
  );
}
