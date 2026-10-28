/**
 * StatusDot
 * Visual indicator dot for active status.
 */

import React from "react";
import { cn } from "@/lib/utils";

export type StatusDotVariant = "filling" | "starting" | "online" | "offline" | "away";

export interface StatusDotProps {
  status?: StatusDotVariant;
  variant?: StatusDotVariant;
  className?: string;
}

const statusClasses: Record<StatusDotVariant, string> = {
  filling: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
  starting: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
  online: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
  offline: "bg-slate-300",
  away: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
};

export const StatusDot: React.FC<StatusDotProps> = ({ status, variant, className }) => {
  const currentStatus = status || variant || "online";

  return (
    <span
      className={cn(
        "inline-block w-2.5 h-2.5 rounded-full border border-white",
        statusClasses[currentStatus],
        className
      )}
      aria-hidden="true"
    />
  );
};

export default StatusDot;
