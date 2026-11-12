"use client";

import React from "react";

import { Badge, Card } from "@/components/theme";
import type { AdminNavItem } from "../utils/navigation";

interface ModulePlaceholderViewProps {
  item: AdminNavItem;
}

export function ModulePlaceholderView({ item }: ModulePlaceholderViewProps) {
  const Icon = item.icon;

  return (
    <Card className="px-8 py-20 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-900">
        <Icon size={32} />
      </div>
      <Badge variant="neutral" size="sm">
        Phase 3 module
      </Badge>
      <h2 className="mt-3 text-xl font-black text-text-primary">
        {item.title}
      </h2>
      <p className="mt-1 text-sm text-text-secondary">{item.subtitle}</p>
      <p className="mt-6 text-xs text-text-tertiary">
        The shell, routing, and RBAC guards are ready. This module&rsquo;s data
        tables, forms, and API hooks will be implemented in Phase 3.
      </p>
    </Card>
  );
}
