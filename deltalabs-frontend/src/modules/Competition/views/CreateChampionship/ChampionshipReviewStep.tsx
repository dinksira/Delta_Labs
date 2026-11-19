"use client";

import { CheckCircle2, PenLine, Rocket, ShieldAlert, Trophy } from "lucide-react";

import { Button } from "@/components/theme/Button";
import { Typography } from "@/components/theme/Typography";
import type { CodingQuestion } from "@/modules/Competition/types/createBattle";
import { StepHeader } from "./ChampionshipDetailsStep";
import {
  STAGE_OPTIONS,
  entryFeeLabel,
  stagePrizes,
  type ChampionshipDraft,
  type StageQuestionMode,
} from "./types";

export interface ChampionshipReviewStepProps {
  draft: ChampionshipDraft;
  stageModes: StageQuestionMode[];
  stageQuestions: CodingQuestion[][];
  onEditStep: (step: number) => void;
}

export function ChampionshipReviewStep({
  draft,
  stageModes,
  stageQuestions,
  onEditStep,
}: Readonly<ChampionshipReviewStepProps>) {
  const entryFee = entryFeeLabel(draft.entryFee, draft.customFee);
  const option = STAGE_OPTIONS.find((stage) => stage.count === draft.stageCount) ?? STAGE_OPTIONS[1];
  const prizes = stagePrizes(draft.prizeBaseEtb, draft.stageCount);
  const totalPrize = prizes.reduce((sum, prize) => sum + prize, 0);

  const scheduleText =
    draft.timing === "schedule"
      ? `${draft.scheduleDate} ${draft.scheduleTime} (${draft.scheduleTimezone}) · ${draft.stageSpacingDays}d cadence`
      : `Instant Kickoff · ${draft.stageSpacingDays}d stage cadence`;

  const customCount = stageQuestions.reduce(
    (sum, questions) => sum + questions.filter((q) => q.title.trim().length > 0).length,
    0,
  );
  const customStages = stageModes.filter((mode) => mode === "custom").length;
  const poolText =
    customStages > 0
      ? `${customStages} custom round${customStages === 1 ? "" : "s"} (${customCount} challenge${customCount === 1 ? "" : "s"}) · ${draft.stageCount - customStages} auto-curated`
      : `All ${draft.stageCount} stages auto-curated`;

  const sections = [
    {
      title: "Tournament Identity",
      step: 1,
      items: [
        { label: "Title", value: draft.title.trim() || "—" },
        { label: "Discipline", value: draft.subject },
        { label: "Director / Host", value: draft.creatorName.trim() || "You (Host)" },
      ],
    },
    {
      title: "Bracket & Prizing",
      step: 2,
      items: [
        { label: "Format", value: `${option.title} (${option.count} Knockout Stages)` },
        { label: "Base Round Prize", value: `${draft.prizeBaseEtb} ETB` },
        { label: "Total Prize Purse", value: `${totalPrize.toLocaleString()} ETB` },
        { label: "Entry Fee", value: entryFee },
      ],
    },
    {
      title: "Challenges & Schedule",
      step: 3,
      items: [
        { label: "Stage Content", value: poolText },
        { label: "Kickoff & Timing", value: scheduleText },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <StepHeader
        icon={<Rocket className="size-7" />}
        title="Review & Launch Tournament"
        subtitle="Double-check every setting before publishing the championship ladder"
      />

      {/* Fair Play Host Confirmation Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-secondary-500/30 bg-secondary-50/80 p-4 dark:bg-secondary-950/20">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-secondary-600 dark:text-secondary-400" />
        <div className="text-xs text-text-secondary">
          <p className="font-semibold text-text-primary">Creator Competitive Integrity Confirmation</p>
          <p className="mt-0.5">
            By launching this championship, you are designated as the official Host. You can monitor participant registrations, stage completion rates, and leaderboard scores. Creators cannot join or win prizes in their own competitions.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sections.map((section) => (
          <div
            key={section.title}
            className="flex flex-col gap-3 rounded-2xl border border-border-default bg-surface-default p-4 shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
              <Typography as="h3" className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                {section.title}
              </Typography>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(section.step)}
                className="h-7 gap-1 px-2 text-xs"
              >
                <PenLine className="size-3.5" aria-hidden />
                Edit
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {section.items.map((item) => (
                <div key={item.label} className="min-w-0">
                  <p className="text-[11px] font-medium text-text-tertiary">{item.label}</p>
                  <p className="truncate text-sm font-semibold text-text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-900/40 dark:bg-primary-950/20">
        <Trophy className="mt-0.5 size-5 shrink-0 text-primary-600" aria-hidden />
        <Typography className="text-xs text-primary-800 dark:text-primary-200">
          Launching creates an active Championship season. Stage 1 unlocks immediately for all participants, with complete real-time tracking for the host.
        </Typography>
      </div>
    </div>
  );
}

