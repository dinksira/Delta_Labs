/**
 * LiveDuelHostTips
 * Atomic Level: Molecule / Helper
 *
 * Information panel shown beside the Live Duel creation form highlighting
 * what the host will be able to do once they go live (audio/video, live questions, chat).
 */

import { CheckCircle2, MessageSquare, Radio, Trophy, Users, Zap } from "lucide-react";

import { Typography } from "@/components/theme/Typography";
import { cn } from "@/lib/utils";

export interface LiveDuelHostTipsProps {
  className?: string;
}

const HIGHLIGHTS = [
  {
    icon: Zap,
    title: "Instant Live Grading",
    desc: "Post questions in real time; answers grade automatically on the server.",
  },
  {
    icon: Trophy,
    title: "Dynamic Leaderboard",
    desc: "Scores and ranks update in live sync after every round.",
  },
  {
    icon: MessageSquare,
    title: "Live Chat & Reactions",
    desc: "Engage your spectators and participants with live room chat.",
  },
  {
    icon: Users,
    title: "Host Moderation",
    desc: "Complete control over question pacing, round timers, and stage access.",
  },
];

export function LiveDuelHostTips({ className }: Readonly<LiveDuelHostTipsProps>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border-default bg-surface-default p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-primary-700">
        <Radio className="size-4 animate-pulse text-error-500" aria-hidden />
        <Typography as="h3" className="text-xs font-bold uppercase tracking-wider text-text-primary">
          Host Arena Toolkit
        </Typography>
      </div>

      <div className="flex flex-col gap-3">
        {HIGHLIGHTS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400">
                <Icon className="size-3.5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text-primary">{item.title}</p>
                <p className="text-[11px] leading-tight text-text-secondary">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-2.5 text-xs text-primary-800 dark:border-primary-900/50 dark:bg-primary-950/30 dark:text-primary-300">
        <div className="flex items-center gap-1.5 font-semibold">
          <CheckCircle2 className="size-3.5 text-primary-600 shrink-0" />
          <span>Fair Play Guaranteed</span>
        </div>
        <p className="mt-0.5 text-[11px] text-text-secondary">
          No participant holds an answer key — all answers are authenticated server-side.
        </p>
      </div>
    </div>
  );
}

export default LiveDuelHostTips;

