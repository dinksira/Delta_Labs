"use client";

import type { ReactNode } from "react";
import { ShieldCheck, Trophy } from "lucide-react";

import { Field } from "@/components/theme/Field";
import { Input } from "@/components/theme/Input";
import { Textarea } from "@/components/theme/Textarea";
import { Typography } from "@/components/theme/Typography";
import { cn } from "@/lib/utils";
import {
  CHAMPIONSHIP_DIFFICULTIES,
  CHAMPIONSHIP_SUBJECTS,
  type ChampionshipDraft,
} from "./types";

export function StepHeader({
  icon,
  title,
  subtitle,
}: Readonly<{ icon: ReactNode; title: string; subtitle: string }>) {
  return (
    <div className="flex flex-col items-start gap-2 md:items-center md:text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary-600 text-white shadow-sm">
        <span className="size-7" aria-hidden>
          {icon}
        </span>
      </span>
      <Typography as="h2" className="text-[22px] font-bold leading-snug text-primary-700">
        {title}
      </Typography>
      <Typography className="text-sm text-text-secondary">{subtitle}</Typography>
    </div>
  );
}

export interface ChampionshipDetailsStepProps {
  draft: ChampionshipDraft;
  updateDraft: (updates: Partial<ChampionshipDraft>) => void;
}

export function ChampionshipDetailsStep({
  draft,
  updateDraft,
}: Readonly<ChampionshipDetailsStepProps>) {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <StepHeader
        icon={<Trophy className="size-7" />}
        title="Tournament Details"
        subtitle="Give your new championship a prestigious identity players will recognize"
      />

      {/* Host Fair Play Callout */}
      <div className="flex items-start gap-3 rounded-2xl border border-secondary-500/30 bg-secondary-50/70 p-4 dark:bg-secondary-950/20">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-secondary-600 dark:text-secondary-400" />
        <div className="text-xs text-text-secondary">
          <p className="font-semibold text-text-primary">Creator Oversight & Fair-Play Policy</p>
          <p className="mt-0.5">
            As the tournament creator, you oversee match schedules and track competitor submissions. Creators are barred from participating or collecting prize rewards from their own tournaments.
          </p>
        </div>
      </div>

      <Field id="championship-title" label="Tournament Title" required>
        <Input
          id="championship-title"
          value={draft.title}
          onChange={(event) => updateDraft({ title: event.target.value })}
          placeholder="e.g. Ethiopia Algorithmic Cup 2026"
          maxLength={80}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="championship-subject" label="Discipline / Subject">
          <select
            id="championship-subject"
            value={draft.subject}
            onChange={(event) => updateDraft({ subject: event.target.value })}
            className="w-full rounded-xl border border-border-default bg-surface-default px-3.5 py-2.5 text-sm font-medium text-text-primary shadow-xs focus:border-primary-500 focus:outline-hidden"
          >
            {CHAMPIONSHIP_SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </Field>

        <Field id="championship-difficulty" label="Skill Division">
          <select
            id="championship-difficulty"
            value={draft.difficulty}
            onChange={(event) => updateDraft({ difficulty: event.target.value })}
            className="w-full rounded-xl border border-border-default bg-surface-default px-3.5 py-2.5 text-sm font-medium text-text-primary shadow-xs focus:border-primary-500 focus:outline-hidden"
          >
            {CHAMPIONSHIP_DIFFICULTIES.map((diff) => (
              <option key={diff.id} value={diff.id}>
                {diff.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="championship-description" label="Tournament Overview & Rules">
        <Textarea
          id="championship-description"
          value={draft.description}
          onChange={(event) => updateDraft({ description: event.target.value })}
          placeholder="Describe the rules, who should enter, and what awaits the ultimate champion..."
          rows={4}
          maxLength={500}
        />
      </Field>

      <Field id="championship-creator" label="Tournament Director / Host Name">
        <Input
          id="championship-creator"
          value={draft.creatorName}
          onChange={(event) => updateDraft({ creatorName: event.target.value })}
          placeholder="e.g. Prof. Abebe or Delta Arena"
          maxLength={120}
        />
      </Field>
    </div>
  );
}

