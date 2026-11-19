"use client";

import { Braces, CheckCircle, Code2, Sparkles, Wrench } from "lucide-react";

import { Button } from "@/components/theme/Button";
import { Typography } from "@/components/theme/Typography";
import { cn } from "@/lib/utils";
import type { CodingQuestion } from "@/modules/Competition/types/createBattle";
import { StepHeader } from "./ChampionshipDetailsStep";
import {
  stagePrizes,
  stageRunNames,
  type ChampionshipDraft,
  type StageQuestionMode,
} from "./types";

export interface ChampionshipQuestionsStepProps {
  draft: ChampionshipDraft;
  stageModes: StageQuestionMode[];
  stageQuestions: CodingQuestion[][];
  onOpenStageBuilder: (index: number) => void;
}

export function ChampionshipQuestionsStep({
  draft,
  stageModes,
  stageQuestions,
  onOpenStageBuilder,
}: Readonly<ChampionshipQuestionsStepProps>) {
  const runs = stageRunNames(draft.stageCount);
  const prizes = stagePrizes(draft.prizeBaseEtb, draft.stageCount);

  return (
    <div className="flex flex-col gap-6">
      <StepHeader
        icon={<Braces className="size-7" />}
        title="Stage Challenges & Questions"
        subtitle="Compile custom questions for each round, or let Delta's auto-pool populate real battles"
      />

      <div className="flex items-start gap-3 rounded-2xl border border-primary-500/30 bg-primary-50/60 p-4 dark:bg-primary-950/20">
        <Sparkles className="mt-0.5 size-5 shrink-0 text-primary-600 dark:text-primary-400" />
        <div className="text-xs text-text-secondary">
          <p className="font-semibold text-text-primary">Flexible Stage Compilation</p>
          <p className="mt-0.5">
            Stages configured with the auto-pool remain instantly playable with verified algorithmic challenges. If you compile custom questions, that stage is published as a dedicated seeded battle.
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {runs.map((run, index) => {
          const mode = stageModes[index] ?? "auto";
          const questions = stageQuestions[index] ?? [];
          const compiledCount = questions.filter((q) => q.title.trim().length > 0).length;
          const isCustom = mode === "custom" && compiledCount > 0;

          return (
            <li
              key={run}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border-default bg-surface-default p-4 shadow-xs transition-colors hover:border-primary-300"
            >
              <div className="flex items-center gap-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-xs font-bold text-text-primary">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-text-primary">{run}</p>
                    <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                      ETB {prizes[index]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {isCustom ? (
                      <span className="inline-flex items-center gap-1 font-medium text-success-600 dark:text-success-400">
                        <CheckCircle className="size-3.5" />
                        {compiledCount} authored challenge{compiledCount === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-text-tertiary">
                        <Sparkles className="size-3.5 text-primary-500" />
                        Auto-pool challenge
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <Button
                variant={isCustom ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onOpenStageBuilder(index)}
                className="shrink-0 gap-1.5"
              >
                {isCustom ? (
                  <>
                    <Wrench className="size-3.5" aria-hidden />
                    Edit Stage {index + 1}
                  </>
                ) : (
                  <>
                    <Code2 className="size-3.5" aria-hidden />
                    Compile Custom Questions
                  </>
                )}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

