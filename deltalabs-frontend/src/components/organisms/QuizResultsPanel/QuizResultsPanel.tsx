/**
 * QuizResultsPanel — post-battle summary card shown when a duel quiz ends.
 * Shows a success/neutral hero, final score, correct count, and rank, plus
 * optional primary and secondary actions.
 *
 * @example
 * ```tsx
 * <QuizResultsPanel
 *   title="Calculus Showdown"
 *   score={1200}
 *   correctCount={4}
 *   total={5}
 *   rank={2}
 *   onPlayAgain={reset}
 *   onExit={exit}
 * />
 * ```
 */

import { CheckCircle2, Hash, MinusCircle, Sparkles, Target, Trophy, XCircle } from "lucide-react";

import { Button } from "@/components/theme/Button";
import { Typography } from "@/components/theme/Typography";
import { cn } from "@/lib/utils";
import type { QuestionReviewItem } from "@/modules/Competition/hooks/useDuelQuiz";

export interface QuizResultsPanelProps {
  title: string;
  score: number;
  correctCount: number;
  total: number;
  rank: number;
  questionReviews?: QuestionReviewItem[];
  onPlayAgain?: () => void;
  onExit?: () => void;
  className?: string;
}

function getPerformanceNotice(correctCount: number, total: number) {
  if (total === 0) return { title: "Challenge Finished", subtitle: "Thanks for participating!" };
  const ratio = correctCount / total;
  if (ratio === 1) {
    return {
      title: "Flawless Victory!",
      subtitle: "You scored 100% on every single question!",
    };
  }
  if (ratio >= 0.7) {
    return {
      title: "Great Job!",
      subtitle: "You demonstrated solid mastery of this topic.",
    };
  }
  if (ratio >= 0.4) {
    return {
      title: "Good Effort!",
      subtitle: "Review your answers below to sharpen your skills.",
    };
  }
  return {
    title: "Battle Completed",
    subtitle: "Every challenge makes you stronger. Review below and try again!",
  };
}

export function QuizResultsPanel({
  title,
  score,
  correctCount,
  total,
  rank,
  questionReviews = [],
  onPlayAgain,
  onExit,
  className,
}: Readonly<QuizResultsPanelProps>) {
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const performance = getPerformanceNotice(correctCount, total);

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-6 rounded-2xl border border-border-default bg-surface-default p-6 shadow-sm",
        className,
      )}
    >
      {/* Hero Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/30 text-primary-600">
          <Trophy className="size-8" aria-hidden />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800 dark:bg-primary-900/40 dark:text-primary-300">
            <Sparkles className="size-3.5" /> Battle Complete
          </span>
          <Typography as="h2" className="mt-2 text-2xl font-bold text-text-primary sm:text-3xl">
            {title}
          </Typography>
          <p className="mt-1 text-sm font-medium text-text-secondary">
            {performance.title} — {performance.subtitle}
          </p>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-3 gap-3 rounded-xl border border-border-default bg-surface-muted p-4 text-center sm:gap-6">
        <div className="flex flex-col items-center">
          <Trophy className="size-5 text-primary-600" aria-hidden />
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-text-primary sm:text-3xl">
            {score.toLocaleString()}
          </p>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary sm:text-xs">
            Points Earned
          </span>
        </div>

        <div className="flex flex-col items-center border-x border-border-default px-2">
          <Target className="size-5 text-success-600" aria-hidden />
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-text-primary sm:text-3xl">
            {correctCount}/{total}
          </p>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary sm:text-xs">
            Correct ({accuracy}%)
          </span>
        </div>

        <div className="flex flex-col items-center">
          <Hash className="size-5 text-info-600" aria-hidden />
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-text-primary sm:text-3xl">
            #{rank}
          </p>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary sm:text-xs">
            Final Rank
          </span>
        </div>
      </div>

      {/* Per-Question Breakdown */}
      {questionReviews.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border-default pb-2">
            <Typography as="h3" className="text-sm font-bold text-text-primary">
              Question Breakdown
            </Typography>
            <span className="text-xs text-text-secondary">
              {correctCount} of {total} answered correctly
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {questionReviews.map((qr) => {
              const isCorrect = qr.result === true;
              const isIncorrect = qr.result === false;
              const isSkipped = !qr.isAnswered;

              return (
                <div
                  key={qr.id}
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border p-3.5 transition-colors sm:flex-row sm:items-center sm:justify-between",
                    isCorrect
                      ? "border-success-200 bg-success-50/50 dark:border-success-900/50 dark:bg-success-950/20"
                      : isIncorrect
                        ? "border-error-200 bg-error-50/40 dark:border-error-900/50 dark:bg-error-950/20"
                        : "border-border-default bg-surface-default",
                  )}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        isCorrect
                          ? "bg-success-600 text-white"
                          : isIncorrect
                            ? "bg-error-600 text-white"
                            : "bg-surface-muted text-text-tertiary",
                      )}
                    >
                      {qr.index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                          {qr.kind.replace("_", " ")}
                        </span>
                        <Typography className="truncate text-sm font-semibold text-text-primary">
                          {qr.title || `Question ${qr.index + 1}`}
                        </Typography>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-100 px-2.5 py-1 text-xs font-bold text-success-800 dark:bg-success-900/40 dark:text-success-300">
                        <CheckCircle2 className="size-3.5" />
                        +{qr.earnedPoints || qr.points} PTS
                      </span>
                    ) : isIncorrect ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-error-100 px-2.5 py-1 text-xs font-bold text-error-800 dark:bg-error-900/40 dark:text-error-300">
                        <XCircle className="size-3.5" />
                        0 PTS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-text-secondary">
                        <MinusCircle className="size-3.5" />
                        Skipped
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-2 flex w-full flex-col-reverse items-stretch gap-3 sm:flex-row sm:justify-center">
        <Button variant="ghost" onClick={onExit}>
          Back to Battles
        </Button>
        {onPlayAgain && (
          <Button variant="primary" onClick={onPlayAgain}>
            Play Again
          </Button>
        )}
      </div>
    </div>
  );
}

export default QuizResultsPanel;
