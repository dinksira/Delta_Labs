"use client";

import React, { useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";

import { cn } from "@/lib/cn";
import { Badge, type BadgeVariant } from "@/components/theme";
import { useClickOutside } from "../hooks/useClickOutside";

interface AdminNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: BadgeVariant;
}

const INITIAL_NOTIFICATIONS: readonly AdminNotification[] = [
  {
    id: "n1",
    title: "HLS rendition completed",
    description: "720p master playlist is ready for course media.",
    time: "14 min ago",
    tone: "success",
  },
  {
    id: "n2",
    title: "Q&A question flagged",
    description: "A moderator review is pending in the question queue.",
    time: "3 hours ago",
    tone: "warning",
  },
  {
    id: "n3",
    title: "School tenant onboarded",
    description: "Addis Ababa STEM has been added to the platform.",
    time: "1 hour ago",
    tone: "info",
  },
];

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(INITIAL_NOTIFICATIONS.length);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  const markAllRead = () => setUnread(0);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative flex size-10 items-center justify-center rounded-xl border border-border-subtle bg-surface-muted text-text-secondary transition-colors hover:text-text-primary"
      >
        <Bell size={18} />
        {unread > 0 ? (
          <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-80 overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
            <div>
              <p className="text-xs font-black text-text-primary">
                Notifications
              </p>
              <p className="text-[11px] text-text-tertiary">
                {unread > 0 ? `${unread} unread` : "All caught up"}
              </p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="flex items-center gap-1 text-[11px] font-bold text-primary-900 transition-colors hover:text-primary-600"
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {INITIAL_NOTIFICATIONS.map((notification) => (
              <div
                key={notification.id}
                className="border-b border-border-subtle/60 px-4 py-3 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-text-primary">
                    {notification.title}
                  </p>
                  <Badge variant={notification.tone} size="sm">
                    {notification.tone}
                  </Badge>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
                  {notification.description}
                </p>
                <p className="mt-1 text-[10px] font-medium text-text-tertiary">
                  {notification.time}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-border-subtle px-4 py-2 text-center">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={cn(
                "text-[11px] font-bold text-text-secondary transition-colors hover:text-text-primary"
              )}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
