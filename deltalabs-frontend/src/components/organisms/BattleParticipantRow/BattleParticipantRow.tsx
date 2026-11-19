"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Clock, HelpCircle, Trophy, User, XCircle } from "lucide-react";

import type { ParticipantDetail } from "@/modules/Competition/types/topicBattle";
import { Typography } from "@/components/theme/Typography";
import { cn } from "@/lib/utils";

export interface BattleParticipantRowProps {
  participant: ParticipantDetail;
  index: number;
}

function formatJoinDate(dateStr: string | null): string {
  if (!dateStr) return "Just now";
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return dateStr;
  }
}

export function BattleParticipantRow({ participant, index }: Readonly<BattleParticipantRowProps>) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border-default bg-surface-default transition-all hover:border-primary-300 dark:hover:border-primary-700">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
        className="flex cursor-pointer items-center justify-between gap-3 p-4 select-none"
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="text-text-tertiary transition-transform duration-200"
            aria-label={expanded ? "Collapse details" : "Expand details"}
          >
            {expanded ? (
              <ChevronDown className="size-5 text-primary-500" />
            ) : (
              <ChevronRight className="size-5" />
            )}
          </button>

          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
            {participant.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={participant.avatarUrl}
                alt={participant.name}
                className="size-10 rounded-full object-cover"
              />
            ) : (
              <User className="size-5" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Typography className="truncate font-semibold text-text-primary">
                {participant.name}
              </Typography>
              {index === 0 && participant.totalPoints > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                  <Trophy className="size-3" /> #1
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Clock className="size-3" />
              <span>Joined at {formatJoinDate(participant.joinedAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex",
              participant.hasCompleted
                ? "bg-success-100 text-success-800 dark:bg-success-900/40 dark:text-success-300"
                : "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
            )}
          >
            {participant.hasCompleted ? "Finished" : "In Progress"}
          </span>

          <div className="flex items-center gap-1.5 rounded-lg bg-surface-muted px-3 py-1.5 text-sm font-bold text-primary-600 dark:text-primary-400">
            <span>{participant.totalPoints}</span>
            <span className="text-xs font-normal text-text-secondary">PTS</span>
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-border-default bg-surface-muted/30 p-4">
          <Typography variant="small" className="mb-3 font-semibold text-text-secondary">
            Question Submissions ({participant.answers.length} answered)
          </Typography>

          {participant.answers.length === 0 ? (
            <p className="py-2 text-sm text-text-tertiary">No answers submitted yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
              {participant.answers.map((ans) => (
                <div
                  key={ans.questionId}
                  className="flex items-center justify-between rounded-lg border border-border-default bg-surface-default p-3 text-sm shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {ans.correct === true ? (
                      <CheckCircle2 className="size-4 shrink-0 text-success-600" />
                    ) : ans.correct === false ? (
                      <XCircle className="size-4 shrink-0 text-error-600" />
                    ) : (
                      <HelpCircle className="size-4 shrink-0 text-warning-500" />
                    )}
                    <span className="truncate font-medium text-text-primary">{ans.questionTitle}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-xs">
                    {ans.latencyMs ? (
                      <span className="text-text-tertiary">
                        {(ans.latencyMs / 1000).toFixed(1)}s
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 font-semibold",
                        ans.correct === true
                          ? "bg-success-100 text-success-800 dark:bg-success-900/40 dark:text-success-300"
                          : "bg-surface-muted text-text-secondary",
                      )}
                    >
                      +{ans.earnedPoints} PTS
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default BattleParticipantRow;

