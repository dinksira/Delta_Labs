"use client";

import { Award, Clock, Code2, FileText, HelpCircle, Layout } from "lucide-react";

import type { TopicBattleQuestion } from "@/modules/Competition/types/topicBattle";
import { Typography } from "@/components/theme/Typography";
import { cn } from "@/lib/utils";

export interface BattleQuestionsPanelProps {
  questions: TopicBattleQuestion[];
}

function getKindIcon(kind: string) {
  switch (kind) {
    case "coding":
      return Code2;
    case "design":
      return Layout;
    case "markdown":
    case "writing":
      return FileText;
    default:
      return HelpCircle;
  }
}

function formatKindLabel(kind: string): string {
  return kind.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function BattleQuestionsPanel({ questions }: Readonly<BattleQuestionsPanelProps>) {
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-surface-default p-8 text-center">
        <HelpCircle className="size-10 text-text-tertiary" />
        <Typography className="mt-2 font-medium text-text-primary">
          No questions configured
        </Typography>
        <Typography variant="small" className="text-text-secondary">
          This battle has no questions authored yet.
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Typography as="h3" className="text-base font-semibold text-text-primary">
        Battle Questions ({questions.length})
      </Typography>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {questions.map((q, idx) => {
          const Icon = getKindIcon(q.kind);
          return (
            <div
              key={q.id || idx}
              className="flex flex-col justify-between gap-3 rounded-xl border border-border-default bg-surface-default p-4 shadow-sm transition-all hover:border-primary-300 dark:hover:border-primary-700"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-xs font-bold text-text-secondary">
                      #{idx + 1}
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="size-4 shrink-0 text-primary-500" />
                      <Typography className="truncate font-semibold text-text-primary">
                        {q.title || `Question ${idx + 1}`}
                      </Typography>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                      {formatKindLabel(q.kind)}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        q.difficulty === "Easy"
                          ? "bg-success-100 text-success-800 dark:bg-success-900/40 dark:text-success-300"
                          : q.difficulty === "Hard"
                            ? "bg-error-100 text-error-800 dark:bg-error-900/40 dark:text-error-300"
                            : "bg-warning-100 text-warning-800 dark:bg-warning-900/40 dark:text-warning-300",
                      )}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                </div>

                {q.description ? (
                  <p className="line-clamp-2 text-sm text-text-secondary">{q.description}</p>
                ) : null}
              </div>

              <div className="flex items-center justify-between border-t border-border-default pt-2.5 text-xs text-text-secondary">
                <div className="flex items-center gap-1">
                  <Clock className="size-3.5 text-primary-500" />
                  <span>{q.timeLimitMinutes} min limit</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400">
                  <Award className="size-3.5 text-yellow-500" />
                  <span>{q.points || 10} pts</span>
                </div>
                {q.language ? (
                  <span className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[11px]">
                    {q.language}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BattleQuestionsPanel;

