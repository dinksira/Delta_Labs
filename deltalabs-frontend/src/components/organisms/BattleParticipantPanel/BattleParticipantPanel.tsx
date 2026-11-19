"use client";

import { CheckCircle2, Loader2, Sparkles, Users } from "lucide-react";

import type { ParticipantDetail } from "@/modules/Competition/types/topicBattle";
import { BattleParticipantRow } from "@/components/organisms/BattleParticipantRow";
import { Typography } from "@/components/theme/Typography";

export interface BattleParticipantPanelProps {
  participants: ParticipantDetail[];
  totalParticipants: number;
  totalCompleted: number;
  isLoading?: boolean;
}

export function BattleParticipantPanel({
  participants,
  totalParticipants,
  totalCompleted,
  isLoading = false,
}: Readonly<BattleParticipantPanelProps>) {
  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center gap-2 text-text-secondary">
        <Loader2 className="size-5 animate-spin" />
        <span>Loading participant data...</span>
      </div>
    );
  }

  const avgScore =
    participants.length > 0
      ? Math.round(participants.reduce((sum, p) => sum + p.totalPoints, 0) / participants.length)
      : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-default p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
            <Users className="size-5" />
          </div>
          <div>
            <Typography variant="small" className="text-text-secondary">
              Total Joined
            </Typography>
            <Typography className="text-xl font-bold text-text-primary">
              {totalParticipants}
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-default p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-300">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <Typography variant="small" className="text-text-secondary">
              Finished
            </Typography>
            <Typography className="text-xl font-bold text-text-primary">
              {totalCompleted}
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-default p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300">
            <Sparkles className="size-5" />
          </div>
          <div>
            <Typography variant="small" className="text-text-secondary">
              Average Score
            </Typography>
            <Typography className="text-xl font-bold text-text-primary">
              {avgScore} <span className="text-xs font-normal text-text-secondary">PTS</span>
            </Typography>
          </div>
        </div>
      </div>

      {/* Participants List */}
      <div className="flex flex-col gap-3">
        <Typography as="h3" className="text-base font-semibold text-text-primary">
          Participants ({participants.length})
        </Typography>

        {participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-surface-default p-8 text-center">
            <Users className="size-10 text-text-tertiary" />
            <Typography className="mt-2 font-medium text-text-primary">
              No participants have joined yet
            </Typography>
            <Typography variant="small" className="max-w-sm text-text-secondary">
              When participants join this topic battle, their live status, score, and answers will appear here in real-time.
            </Typography>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {participants.map((p, idx) => (
              <BattleParticipantRow key={p.userId} participant={p} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BattleParticipantPanel;

