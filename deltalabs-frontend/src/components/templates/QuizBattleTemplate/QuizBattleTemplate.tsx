/**
 * QuizBattleTemplate — full duel quiz screen layout for a topic battle.
 * Composes the header, metrics strip, question card, and leaderboard sidebar
 * into a responsive two-column layout. Switches to the results panel when the
 * duel is finished.
 *
 * @example
 * ```tsx
 * <QuizBattleTemplate
 *   quiz={quiz}
 *   state={state}
 *   timeLeft="03:24"
 *   onSelect={selectAnswer}
 *   onAdvance={advance}
 *   onPlayAgain={reset}
 *   onExit={exit}
 * />
 * ```
 */

import { useMemo } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/theme/Button";
import { LeaderboardPanel } from "@/components/organisms/LeaderboardPanel";
import { QuizBattleHeader } from "@/components/organisms/QuizBattleHeader";
import { QuizMetricsRow } from "@/components/organisms/QuizMetricsRow";
import { QuizQuestionCard } from "@/components/organisms/QuizQuestionCard";
import { QuizResultsPanel } from "@/components/organisms/QuizResultsPanel";
import { mergeLiveLeaderboard } from "@/modules/Competition/data";
import type { DuelQuiz, DuelState, ParticipantAnswer } from "@/modules/Competition/types/duelQuiz";
import type { QuestionReviewItem } from "@/modules/Competition/hooks/useDuelQuiz";
import { cn } from "@/lib/utils";

export interface QuizBattleTemplateProps {
  quiz: DuelQuiz;
  state: DuelState;
  /** Countdown label such as "03:24". */
  timeLeft: string;
  /** Seconds remaining in the battle. */
  timeLeftSeconds: number;
  /** Total seconds allocated to the battle. */
  timeTotalSeconds: number;
  /** Whether the timer has expired for the current question. */
  timedOut?: boolean;
  /** Question review items with per-question correctness & points. */
  questionReviews?: QuestionReviewItem[];
  /** Locks in the participant answer for the current question. */
  onSubmit?: (answer: ParticipantAnswer) => void;
  /** Advances to the next question. */
  onAdvance?: () => void;
  /** Goes back to the previous question. */
  onGoBack?: () => void;
  onPlayAgain?: () => void;
  onExit?: () => void;
  onQuit?: () => void;
  className?: string;
}

export function QuizBattleTemplate({
  quiz,
  state,
  timeLeft,
  timeLeftSeconds,
  timeTotalSeconds,
  timedOut = false,
  questionReviews = [],
  onSubmit,
  onAdvance,
  onGoBack,
  onPlayAgain,
  onExit,
  onQuit,
  className,
}: Readonly<QuizBattleTemplateProps>) {
  const finished = state.totalQuestions > 0 && state.currentQuestionIndex >= state.totalQuestions;
  const question = quiz.questions[state.currentQuestionIndex];
  const submit = onSubmit ?? (() => undefined);
  const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 100), 0);
  const isLastQuestion = state.currentQuestionIndex === state.totalQuestions - 1;
  const timeProgress =
    timeTotalSeconds > 0
      ? Math.min(100, Math.max(0, Math.round((timeLeftSeconds / timeTotalSeconds) * 100)))
      : 0;
  // quiz.leaderboard is the real server standings (see buildDuelQuiz); the
  // participant's own row is overlaid with the live server score and re-ranked
  // as answers are graded, and appended if they have not finished yet. The rank
  // shown in the metrics strip and results panel is this derived rank, never a
  // fabricated number.
  const leaderboard = useMemo(
    () => mergeLiveLeaderboard(quiz.leaderboard, state.score),
    [quiz.leaderboard, state.score],
  );
  const rank = leaderboard.find((entry) => entry.isCurrentUser)?.rank ?? state.rank;

  if (finished) {
    return (
      <div className={cn("flex h-full flex-col gap-5 overflow-y-auto p-4 md:p-6", className)}>
        <QuizBattleHeader
          title={quiz.battleTitle}
          totalPoints={totalPoints}
          players={quiz.playerCount}
          timeProgress={timeProgress}
          timeLeft={timeLeft}
        />
        <QuizResultsPanel
          title={quiz.battleTitle}
          score={state.score}
          correctCount={state.correctCount}
          total={state.totalQuestions}
          rank={rank}
          questionReviews={questionReviews}
          onPlayAgain={onPlayAgain}
          onExit={onExit}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col gap-5 overflow-y-auto p-4 md:p-6", className)}>
      <QuizBattleHeader
        title={quiz.battleTitle}
        totalPoints={totalPoints}
        players={quiz.playerCount}
        timeProgress={timeProgress}
        timeLeft={timeLeft}
        onQuit={onQuit}
      />

      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <QuizQuestionCard
            question={question}
            index={state.currentQuestionIndex}
            total={state.totalQuestions}
            revealed={state.isAnswered}
            result={state.lastResult}
            answer={state.answer}
            onSubmit={timedOut ? undefined : submit}
          />

          {/* Navigation bar — always visible */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border-default bg-surface-default p-3 sm:p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoBack}
              disabled={state.currentQuestionIndex === 0 || state.isSubmitting}
              className="gap-1.5"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>

            <div className="flex flex-col items-center gap-0.5">
              <span className="text-sm font-bold text-text-primary">
                {state.currentQuestionIndex + 1}{" "}
                <span className="font-normal text-text-tertiary">/ {state.totalQuestions}</span>
              </span>
              {timedOut && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-error-500">
                  Time&apos;s Up
                </span>
              )}
            </div>

            {isLastQuestion ? (
              <Button
                variant="primary"
                size="sm"
                onClick={onAdvance}
                disabled={state.isSubmitting}
                className="gap-1.5"
              >
                See Results
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={onAdvance}
                disabled={state.isSubmitting}
                className="gap-1.5"
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
          <QuizMetricsRow
            score={state.score}
            rank={rank}
            correctCount={state.correctCount}
            total={state.totalQuestions}
          />
        </div>

        <div className="shrink-0 lg:w-80">
          <LeaderboardPanel entries={leaderboard} />
        </div>
      </div>
    </div>
  );
}

export default QuizBattleTemplate;
