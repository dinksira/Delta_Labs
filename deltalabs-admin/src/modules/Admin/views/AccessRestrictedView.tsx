"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";

import { Card } from "@/components/theme";
import type { AdminNavItem } from "../utils/navigation";

interface AccessRestrictedViewProps {
  item: AdminNavItem;
}

export function AccessRestrictedView({ item }: AccessRestrictedViewProps) {
  return (
    <Card className="px-8 py-20 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
        <ShieldAlert size={32} />
      </div>
      <h2 className="text-xl font-black text-text-primary">
        Access restricted
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Your current role does not grant access to {item.title}.
      </p>
      <p className="mt-6 text-xs text-text-tertiary">
        Contact an Organization Admin if you believe you need this permission.
      </p>
    </Card>
  );
}
