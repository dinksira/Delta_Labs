import React from "react";
import Link from "next/link";
import { ChevronRight, LayoutDashboard } from "lucide-react";

import { cn } from "@/lib/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-1.5 text-[11px] font-medium text-text-tertiary",
        className
      )}
    >
      <Link
        href="/"
        className="flex items-center gap-1 transition-colors hover:text-text-secondary"
      >
        <LayoutDashboard size={12} />
        <span>Admin</span>
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          <ChevronRight size={12} className="text-border-default" />
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-text-secondary"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-secondary">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
