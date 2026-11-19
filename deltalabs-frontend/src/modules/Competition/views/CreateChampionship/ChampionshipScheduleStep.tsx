"use client";

import { CalendarClock, FastForward, Hourglass, Sparkles } from "lucide-react";

import { SchedulePicker } from "@/components/organisms/SchedulePicker/SchedulePicker";
import { TimingOptionGrid } from "@/components/organisms/TimingOptionGrid/TimingOptionGrid";
import { Typography } from "@/components/theme/Typography";
import { cn } from "@/lib/utils";
import { BATTLE_TIMINGS, BATTLE_TIMEZONES } from "@/modules/Competition/data";
import { StepHeader } from "./ChampionshipDetailsStep";
import type { ChampionshipDraft } from "./types";

const STAGE_SPACING_OPTIONS = [
  { days: 1, label: "Daily Sprint", hint: "New stage unlocks every 24 hours" },
  { days: 3, label: "Accelerated", hint: "New stage unlocks every 3 days" },
  { days: 7, label: "Weekly Standard", hint: "New stage unlocks every 7 days" },
];

export interface ChampionshipScheduleStepProps {
  draft: ChampionshipDraft;
  updateDraft: (updates: Partial<ChampionshipDraft>) => void;
}

export function ChampionshipScheduleStep({
  draft,
  updateDraft,
}: Readonly<ChampionshipScheduleStepProps>) {
  return (
    <div className="flex flex-col gap-6">
      <StepHeader
        icon={<CalendarClock className="size-7" />}
        title="Tournament Schedule & Cadence"
        subtitle="Launch round 1 immediately or schedule a grand kickoff date"
      />

      {/* Instant vs Schedule */}
      <TimingOptionGrid
        options={BATTLE_TIMINGS}
        selectedId={draft.timing}
        onSelect={(timing) => updateDraft({ timing: timing as "instant" | "schedule" })}
      />

      {draft.timing === "schedule" && (
        <SchedulePicker
          date={draft.scheduleDate}
          time={draft.scheduleTime}
          timezone={draft.scheduleTimezone}
          onDateChange={(date) => updateDraft({ scheduleDate: date })}
          onTimeChange={(time) => updateDraft({ scheduleTime: time })}
          onTimezoneChange={(timezone) => updateDraft({ scheduleTimezone: timezone })}
          timezones={BATTLE_TIMEZONES}
        />
      )}

      {/* Stage Unlock Cadence */}
      <div className="flex flex-col gap-3">
        <Typography as="h3" className="flex items-center gap-2 text-sm font-bold text-text-primary">
          <FastForward className="size-4 text-primary-600" aria-hidden />
          Stage Unlock Interval
        </Typography>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STAGE_SPACING_OPTIONS.map((opt) => {
            const selected = draft.stageSpacingDays === opt.days;
            return (
              <button
                key={opt.days}
                type="button"
                onClick={() => updateDraft({ stageSpacingDays: opt.days })}
                className={cn(
                  "flex flex-col gap-1 rounded-2xl border-2 p-3.5 text-left transition-all",
                  selected
                    ? "border-primary-600 bg-primary-50/50 shadow-xs dark:bg-primary-950/20"
                    : "border-border-default bg-surface-default hover:border-primary-300",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary">{opt.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      selected ? "bg-primary-600 text-white" : "bg-surface-muted text-text-secondary",
                    )}
                  >
                    {opt.days}d
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary">{opt.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-border-default bg-surface-muted/60 p-4">
        <Hourglass className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden />
        <Typography className="text-xs text-text-secondary">
          Round 1 becomes active immediately upon launch. As participants complete each stage, subsequent stages unlock automatically according to your chosen interval.
        </Typography>
      </div>
    </div>
  );
}

