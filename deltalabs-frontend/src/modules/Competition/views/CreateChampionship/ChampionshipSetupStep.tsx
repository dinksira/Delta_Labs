"use client";

import { Coins, Flame, Layers, Settings2, Sparkles, Trophy } from "lucide-react";

import { FeeSelector } from "@/components/molecules/FeeSelector/FeeSelector";
import { Button } from "@/components/theme/Button";
import { Typography } from "@/components/theme/Typography";
import { cn } from "@/lib/utils";
import { ENTRY_FEE_OPTIONS } from "@/modules/Competition/data";
import { StepHeader } from "./ChampionshipDetailsStep";
import {
  STAGE_OPTIONS,
  stagePrizes,
  type ChampionshipDraft,
} from "./types";

const PRIZE_PRESET_CHIPS = [25, 50, 100, 250, 500];

export interface ChampionshipSetupStepProps {
  draft: ChampionshipDraft;
  updateDraft: (updates: Partial<ChampionshipDraft>) => void;
  onStageCountChange: (count: number) => void;
}

export function ChampionshipSetupStep({
  draft,
  updateDraft,
  onStageCountChange,
}: Readonly<ChampionshipSetupStepProps>) {
  const prizes = stagePrizes(draft.prizeBaseEtb, draft.stageCount);
  const totalPrize = prizes.reduce((sum, prize) => sum + prize, 0);
  const currentOption =
    STAGE_OPTIONS.find((option) => option.count === draft.stageCount) ?? STAGE_OPTIONS[1];

  return (
    <div className="flex flex-col gap-8">
      <StepHeader
        icon={<Settings2 className="size-7" />}
        title="Tournament Setup"
        subtitle="Configure bracket size, base prizes, and entry requirements"
      />

      {/* Bracket Size Selection */}
      <div className="flex flex-col gap-3">
        <Typography as="h3" className="flex items-center gap-2 text-sm font-bold text-text-primary">
          <Layers className="size-4 text-primary-600" aria-hidden />
          Knockout Bracket Format
        </Typography>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {STAGE_OPTIONS.map((option) => {
            const selected = draft.stageCount === option.count;
            return (
              <button
                key={option.count}
                type="button"
                onClick={() => onStageCountChange(option.count)}
                aria-pressed={selected}
                className={cn(
                  "flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-all duration-200",
                  selected
                    ? "border-primary-600 bg-primary-50/60 shadow-sm dark:bg-primary-950/20"
                    : "border-border-default bg-surface-default hover:border-primary-300",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-text-primary">{option.title}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-bold",
                      selected
                        ? "bg-primary-600 text-white"
                        : "bg-surface-muted text-text-secondary",
                    )}
                  >
                    {option.count} Stages
                  </span>
                </div>
                <p className="text-xs text-text-secondary">{option.description}</p>
                <span className="text-[11px] font-medium text-primary-700 dark:text-primary-300">
                  {option.runs[0]} → {option.runs[option.runs.length - 1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Base Prize & Entry Fee */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Base Prize Section */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border-default bg-surface-default p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <Typography as="h3" className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <Flame className="size-4 text-warning-500" aria-hidden />
              Base Prize per Round
            </Typography>
            <span className="text-xs text-text-secondary">Multiplies each stage</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                min={1}
                max={10000}
                value={draft.prizeBaseEtb}
                onChange={(e) => {
                  const val = Number.parseInt(e.target.value, 10);
                  updateDraft({ prizeBaseEtb: Number.isNaN(val) ? 1 : Math.max(1, Math.min(10000, val)) });
                }}
                className="w-full rounded-xl border border-border-default bg-surface-default py-2.5 pl-3.5 pr-14 text-base font-bold text-text-primary tabular-nums shadow-xs focus:border-primary-500 focus:outline-hidden"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs font-bold text-text-tertiary">
                ETB
              </span>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-text-tertiary">Presets:</span>
            {PRIZE_PRESET_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => updateDraft({ prizeBaseEtb: chip })}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                  draft.prizeBaseEtb === chip
                    ? "bg-primary-600 text-white"
                    : "bg-surface-muted text-text-secondary hover:bg-border-default",
                )}
              >
                {chip} ETB
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-xl bg-surface-muted/60 px-3.5 py-2.5">
            <span className="text-xs font-medium text-text-secondary">Total Projected Purse</span>
            <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
              {totalPrize.toLocaleString()} ETB
            </span>
          </div>
        </div>

        {/* Entry Fee Section */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border-default bg-surface-default p-5 shadow-xs">
          <FeeSelector
            options={ENTRY_FEE_OPTIONS}
            value={draft.entryFee}
            customFee={draft.customFee}
            onChange={(fee, customFee) =>
              updateDraft({ entryFee: fee, customFee: customFee ?? draft.customFee })
            }
          />
        </div>
      </div>

      {/* Prize Ladder Breakdown */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border-default bg-surface-muted/50 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-warning-500" aria-hidden />
            <Typography as="h3" className="text-sm font-bold text-text-primary">
              Escalating Stage Ladder · {currentOption.title}
            </Typography>
          </div>
          <span className="text-xs font-bold text-primary-700 dark:text-primary-300">
            {totalPrize.toLocaleString()} ETB Total Pool
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {currentOption.runs.map((run, index) => {
            const isFinal = index === currentOption.runs.length - 1;
            return (
              <div
                key={run}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border p-3",
                  isFinal
                    ? "border-warning-500/40 bg-warning-50/50 dark:bg-warning-950/20"
                    : "border-border-default bg-surface-default",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-text-primary">
                    {index + 1}. {run}
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    {isFinal ? "Championship Round" : `Ladder Step ${index + 1}`}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-xs font-bold tabular-nums",
                    isFinal ? "text-warning-600 dark:text-warning-400" : "text-primary-700 dark:text-primary-300",
                  )}
                >
                  ETB {prizes[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

