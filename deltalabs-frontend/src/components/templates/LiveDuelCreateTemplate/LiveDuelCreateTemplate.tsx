/**
 * LiveDuelCreateTemplate — slim page layout for creating a Live Duel. Renders a
 * back + brand header with an optional subtitle, then a scrollable content
 * region for the host setup form and its lobby preview.
 *
 * @example
 * ```tsx
 * <LiveDuelCreateTemplate onBack={handleBack} subtitle="Host your own room">
 *   <LiveDuelCreateForm hostName="You" onSubmit={handleGoLive} />
 * </LiveDuelCreateTemplate>
 * ```
 */

import type { ReactNode } from "react";

import { Radio, Swords } from "lucide-react";

import { BackButton } from "@/components/theme/BackButton";
import { Typography } from "@/components/theme/Typography";
import { cn } from "@/lib/utils";

export interface LiveDuelCreateTemplateProps {
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function LiveDuelCreateTemplate({
  onBack,
  title = "Create Live Duel",
  subtitle,
  children,
  className,
}: Readonly<LiveDuelCreateTemplateProps>) {
  return (
    <div className={cn("flex h-full w-full flex-col gap-6 overflow-y-auto p-4 md:p-6 lg:p-8", className)}>
      {/* Header bar */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5 min-w-0">
          {onBack && <BackButton label="" onClick={onBack} />}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-error-100 px-2.5 py-0.5 text-xs font-bold text-error-700 dark:bg-error-950/40 dark:text-error-300">
                <Radio className="size-3 animate-pulse text-error-600" aria-hidden />
                LIVE ARENA
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">
                <Swords className="size-3" aria-hidden />
                Real-Time Duel
              </span>
            </div>
            <Typography as="h1" className="mt-1 truncate text-2xl font-bold text-text-primary sm:text-3xl">
              {title}
            </Typography>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto w-full max-w-6xl">{children}</main>
    </div>
  );
}

export default LiveDuelCreateTemplate;