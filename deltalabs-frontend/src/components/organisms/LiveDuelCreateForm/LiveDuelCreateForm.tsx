/**
 * LiveDuelCreateForm
 * Atomic Level: Organism
 *
 * Host setup form for creating a new Live Duel, rendered inside
 * `LiveDuelCreateTemplate`. Collects the headline room details:
 * title, subject, difficulty, duration, entry fee, prize pool, player cap.
 * Displays a live reactive preview of the resulting lobby card and the
 * Host Arena Toolkit panel.
 */

"use client";

import { useMemo, useState } from "react";
import { Check, Coins, Radio, Sparkles, Swords, Trophy, Users } from "lucide-react";

import { Avatar } from "@/components/atoms/Avatar";
import { LiveDuelCard } from "@/components/organisms/LiveDuelCard/LiveDuelCard";
import { LiveDuelHostTips } from "@/components/organisms/LiveDuelCreateForm/LiveDuelHostTips";
import { Button } from "@/components/theme/Button";
import { Field } from "@/components/theme/Field";
import { Input } from "@/components/theme/Input";
import { StatusBanner } from "@/components/theme/StatusBanner";
import { Typography } from "@/components/theme/Typography";
import type { CreateLiveDuelInput } from "@/modules/Competition/data/liveDuelsCatalog";
import type { LiveDuelEntry } from "@/modules/Competition/types/liveDuel";
import { cn } from "@/lib/utils";

// ===== CONSTANTS =====

export const LIVE_DUEL_SUBJECTS = [
  "General",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Programming",
  "Literature",
  "Sports",
] as const;

export const LIVE_DUEL_DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export const LIVE_DUEL_DURATIONS = ["30 min", "45 min", "60 min", "10 rounds"] as const;
export const LIVE_DUEL_ENTRY_FEES = ["Free", "50 ETB", "100 ETB", "200 ETB"] as const;

const SUBJECT_ICONS: Record<string, string> = {
  General: "🎯",
  Mathematics: "📐",
  Physics: "⚡",
  Chemistry: "🧪",
  Biology: "🧬",
  History: "📜",
  Geography: "🌍",
  Programming: "💻",
  Literature: "📖",
  Sports: "⚽",
};

const DIFFICULTY_CONFIG = [
  {
    level: "Easy",
    subtitle: "Casual & Friendly",
    badge: "100 PTS",
    activeClass:
      "border-success-500 bg-success-50/70 dark:bg-success-950/30 text-success-900 ring-2 ring-success-500/20",
    dotClass: "bg-success-500",
  },
  {
    level: "Medium",
    subtitle: "Standard Arena",
    badge: "150 PTS",
    activeClass:
      "border-warning-500 bg-warning-50/70 dark:bg-warning-950/30 text-warning-900 ring-2 ring-warning-500/20",
    dotClass: "bg-warning-500",
  },
  {
    level: "Hard",
    subtitle: "Expert Showdown",
    badge: "200 PTS",
    activeClass:
      "border-error-500 bg-error-50/70 dark:bg-error-950/30 text-error-900 ring-2 ring-error-500/20",
    dotClass: "bg-error-500",
  },
] as const;

const PLAYER_PRESETS = [
  { label: "1v1", count: 2 },
  { label: "Squad", count: 8 },
  { label: "Arena", count: 20 },
  { label: "Grand", count: 50 },
];

const TITLE_SUGGESTIONS = [
  "⚡ Rapid Fire Arena",
  "🏆 Championship Showdown",
  "🧠 Brain Sprint Duel",
  "🔥 1v1 Sudden Death",
];

// ===== COMPONENT =====

export interface LiveDuelCreateFormProps {
  hostName: string;
  hostAvatarUrl?: string | null;
  onSubmit: (input: CreateLiveDuelInput) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
  className?: string;
}

export function LiveDuelCreateForm({
  hostName,
  hostAvatarUrl,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError = null,
  className,
}: Readonly<LiveDuelCreateFormProps>) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<string>(LIVE_DUEL_SUBJECTS[0]);
  const [difficulty, setDifficulty] = useState<string>(LIVE_DUEL_DIFFICULTIES[1]);
  const [durationLabel, setDurationLabel] = useState<string>(LIVE_DUEL_DURATIONS[0]);
  const [entryFee, setEntryFee] = useState<string>(LIVE_DUEL_ENTRY_FEES[0]);
  const [prizePool, setPrizePool] = useState("");
  const [playersMax, setPlayersMax] = useState("20");

  const playersMaxParsed = Number.parseInt(playersMax, 10);
  const playersMaxValid =
    Number.isInteger(playersMaxParsed) && playersMaxParsed >= 2 && playersMaxParsed <= 100;
  const titleValid = title.trim().length > 0;
  const canSubmit = titleValid && playersMaxValid && !isSubmitting;

  const previewEntry = useMemo<LiveDuelEntry>(
    () => ({
      id: "preview",
      title: title.trim() || "Untitled Live Duel",
      subject,
      difficulty,
      status: "live",
      hostName,
      hostAvatarUrl: hostAvatarUrl ?? null,
      viewers: 0,
      playersJoined: 1,
      playersMax: playersMaxValid ? playersMaxParsed : 20,
      entryFee,
      prizePool: prizePool.trim() || "0 ETB",
      durationLabel,
    }),
    [
      title,
      subject,
      difficulty,
      durationLabel,
      entryFee,
      prizePool,
      playersMaxValid,
      playersMaxParsed,
      hostName,
      hostAvatarUrl,
    ],
  );

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      title: title.trim(),
      subject,
      difficulty,
      durationLabel,
      entryFee,
      prizePool: prizePool.trim() || "0 ETB",
      playersMax: playersMaxParsed,
      hostName,
      hostAvatarUrl: hostAvatarUrl ?? null,
    });
  };

  return (
    <div className={cn("grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_360px]", className)}>
      {/* Form Column */}
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        noValidate
      >
        {/* Host persona pill */}
        <div className="flex items-center justify-between rounded-xl border border-border-default bg-surface-default p-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={hostName} src={hostAvatarUrl} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-text-primary">{hostName}</p>
              <p className="text-xs text-text-secondary">Arena Host & Moderator</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700 dark:bg-success-950/40 dark:text-success-300">
            <span className="size-2 rounded-full bg-success-500 animate-pulse" />
            Ready to Broadcast
          </span>
        </div>

        {/* 1. Duel Title & Topic */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border-default bg-surface-default p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary-700">
            <Swords className="size-4" aria-hidden />
            <Typography as="h2" className="text-sm font-bold text-text-primary">
              Arena Identity
            </Typography>
          </div>

          <Field id="live-duel-title" label="Duel Title">
            <Input
              id="live-duel-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. World History Rapid Fire"
              maxLength={80}
              required
            />
          </Field>

          {/* Quick title suggestions */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-text-secondary">Suggestions:</span>
            {TITLE_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => setTitle(sug)}
                className="rounded-full border border-border-default bg-surface-muted px-2.5 py-0.5 text-xs text-text-secondary transition-colors hover:border-primary-400 hover:text-text-primary"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Subject Pills */}
          <div className="flex flex-col gap-2 pt-2">
            <Typography as="span" className="text-xs font-semibold text-text-secondary">
              Subject & Category
            </Typography>
            <div className="flex flex-wrap gap-2">
              {LIVE_DUEL_SUBJECTS.map((opt) => {
                const selected = opt === subject;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSubject(opt)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all",
                      selected
                        ? "border-primary-600 bg-primary-600 text-white shadow-xs"
                        : "border-border-default bg-surface-default text-text-secondary hover:border-primary-300 hover:text-text-primary",
                    )}
                  >
                    <span>{SUBJECT_ICONS[opt] ?? "📚"}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Format & Rules */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border-default bg-surface-default p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary-700">
            <Sparkles className="size-4" aria-hidden />
            <Typography as="h2" className="text-sm font-bold text-text-primary">
              Rules of Engagement
            </Typography>
          </div>

          {/* Difficulty Cards */}
          <div className="flex flex-col gap-2">
            <Typography as="span" className="text-xs font-semibold text-text-secondary">
              Difficulty Tier
            </Typography>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {DIFFICULTY_CONFIG.map((diff) => {
                const isSelected = diff.level === difficulty;
                return (
                  <button
                    key={diff.level}
                    type="button"
                    onClick={() => setDifficulty(diff.level)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all",
                      isSelected
                        ? diff.activeClass
                        : "border-border-default bg-surface-default hover:border-primary-300",
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-sm">
                        <span className={cn("size-2 rounded-full", diff.dotClass)} />
                        {diff.level}
                      </span>
                      {isSelected ? <Check className="size-4 shrink-0 text-current" /> : null}
                    </div>
                    <span className="text-[11px] text-text-secondary">{diff.subtitle}</span>
                    <span className="mt-1 rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-bold">
                      {diff.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Pills */}
          <div className="flex flex-col gap-2 pt-2">
            <Typography as="span" className="text-xs font-semibold text-text-secondary">
              Round Duration / Target
            </Typography>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {LIVE_DUEL_DURATIONS.map((dur) => {
                const isSelected = dur === durationLabel;
                return (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDurationLabel(dur)}
                    className={cn(
                      "rounded-xl border py-2.5 text-center text-xs font-semibold transition-all",
                      isSelected
                        ? "border-primary-600 bg-primary-50 font-bold text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 ring-2 ring-primary-500/20"
                        : "border-border-default bg-surface-default text-text-secondary hover:border-primary-300 hover:text-text-primary",
                    )}
                  >
                    {dur}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Stakes & Arena Capacity */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border-default bg-surface-default p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary-700">
            <Trophy className="size-4" aria-hidden />
            <Typography as="h2" className="text-sm font-bold text-text-primary">
              Stakes & Arena Capacity
            </Typography>
          </div>

          {/* Max Players */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Typography as="span" className="text-xs font-semibold text-text-secondary">
                Max Players (2 - 100)
              </Typography>
              <span className="text-xs font-bold text-primary-700">{playersMax} Competitors</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {PLAYER_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setPlayersMax(String(preset.count))}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all",
                    playersMax === String(preset.count)
                      ? "border-primary-600 bg-primary-600 text-white shadow-xs"
                      : "border-border-default bg-surface-default text-text-secondary hover:border-primary-300 hover:text-text-primary",
                  )}
                >
                  {preset.label} ({preset.count})
                </button>
              ))}
              <div className="ml-auto w-24">
                <Input
                  id="live-duel-players-max"
                  type="number"
                  min={2}
                  max={100}
                  value={playersMax}
                  onChange={(e) => setPlayersMax(e.target.value)}
                  className="text-center"
                />
              </div>
            </div>
          </div>

          {/* Entry Fee & Prize Pool */}
          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Typography as="span" className="text-xs font-semibold text-text-secondary">
                Entry Fee
              </Typography>
              <div className="grid grid-cols-2 gap-2">
                {LIVE_DUEL_ENTRY_FEES.map((fee) => {
                  const isSelected = fee === entryFee;
                  return (
                    <button
                      key={fee}
                      type="button"
                      onClick={() => setEntryFee(fee)}
                      className={cn(
                        "rounded-xl border py-2 text-center text-xs font-semibold transition-all",
                        isSelected
                          ? "border-primary-600 bg-primary-50 font-bold text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 ring-2 ring-primary-500/20"
                          : "border-border-default bg-surface-default text-text-secondary hover:border-primary-300 hover:text-text-primary",
                      )}
                    >
                      {fee}
                    </button>
                  );
                })}
              </div>
            </div>

            <Field id="live-duel-prize" label="Prize Pool">
              <Input
                id="live-duel-prize"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
                placeholder="e.g. 5,000 ETB (or Free)"
                maxLength={40}
              />
            </Field>
          </div>
        </div>

        {submitError ? (
          <StatusBanner
            type="error"
            message={submitError}
            typeStyles={{
              success: "rounded-lg border border-success-500 bg-success-50 text-success-700",
              error: "rounded-lg border border-error-500 bg-error-50 text-error-700",
              info: "rounded-lg border border-info-500 bg-info-50 text-info-700",
            }}
          />
        ) : null}

        {/* Action Row */}
        <div className="flex items-center justify-end gap-3 border-t border-border-default pt-4">
          {onCancel ? (
            <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          ) : null}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!canSubmit}
            className="min-w-52 gap-2 shadow-md hover:shadow-lg"
          >
            <Radio className="size-4 animate-pulse" aria-hidden />
            {isSubmitting ? "Launching Arena…" : "Go Live Now"}
          </Button>
        </div>
      </form>

      {/* Preview & Tips Sticky Column */}
      <aside className="sticky top-6 flex flex-col gap-5">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
            Lobby Card Preview
          </p>
          <LiveDuelCard duel={previewEntry} />
        </div>

        <LiveDuelHostTips />
      </aside>
    </div>
  );
}

export default LiveDuelCreateForm;
