import type { ComponentProps } from "react";

import { CheckCircle2, ChevronRight, Lock, Play } from "lucide-react";

import { Button } from "@/components/theme/Button";
import type { ChampionshipStage } from "@/modules/Competition/types/championship";
import { cn } from "@/lib/utils";

const statusStyles: Record<ChampionshipStage["status"], string> = {
  completed: "border-success-500/40 bg-success-50 text-success-700 dark:bg-success-900/20",
  unlocked: "border-primary-500/40 bg-primary-50 text-primary-700 dark:bg-primary-900/20",
  locked: "border-border-subtle bg-surface-muted text-text-tertiary",
};

const statusLabel: Record<ChampionshipStage["status"], string> = {
  completed: "Completed",
  unlocked: "Play now",
  locked: "Locked",
};

export interface ChampionshipStageCardProps extends Omit<ComponentProps<"div">, "onPlay"> {
  stage: ChampionshipStage;
  hasJoined?: boolean;
  onPlay?: (stage: ChampionshipStage) => void;
}

export function ChampionshipStageCard({
  stage,
  hasJoined = true,
  onPlay,
  className,
}: Readonly<ChampionshipStageCardProps>) {
  const isCompleted = stage.status === "completed";
  const isUnlocked = stage.status === "unlocked";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-4 shadow-sm transition-colors",
        statusStyles[stage.status],
        isUnlocked && "hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              isUnlocked
                ? "bg-primary-600 text-white"
                : isCompleted
                  ? "bg-success-600 text-white"
                  : "bg-surface-default text-text-tertiary",
            )}
          >
            {stage.shortLabel}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-text-primary">{stage.name}</h3>
            <p className="truncate text-xs text-text-secondary">
              {isCompleted
                ? `+${stage.pointsEarned} pts collected`
                : isUnlocked
                  ? `${stage.pointsToEarn} pts at stake`
                  : "Finish the previous stage"}
            </p>
          </div>
        </div>
        {isCompleted ? (
          <CheckCircle2 className="size-5 shrink-0 text-success-600" aria-hidden />
        ) : isUnlocked ? (
          <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[11px] font-bold text-white">
            {statusLabel.unlocked}
          </span>
        ) : (
          <Lock className="size-5 shrink-0 text-text-tertiary" aria-hidden />
        )}
      </div>

      {isUnlocked && (
        hasJoined ? (
          onPlay && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => onPlay(stage)}
              className="mt-auto w-full"
            >
              <Play className="size-4" />
              Play stage
              <ChevronRight className="size-4" />
            </Button>
          )
        ) : (
          <div className="mt-auto flex items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-surface-muted/80 py-2 text-xs font-semibold text-text-secondary">
            <Lock className="size-3.5" aria-hidden />
            Join tournament to play
          </div>
        )
      )}
    </div>
  );
}

export default ChampionshipStageCard;