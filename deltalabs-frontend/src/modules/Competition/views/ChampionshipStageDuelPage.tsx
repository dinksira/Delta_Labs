/**
 * ChampionshipStageDuelPage — championship-flavored duel for a single stage.
 * Reads the stage (by route id) from the Championship snapshot, launches its
 * real seeded battle through the shared duel quiz engine, and on finish
 * completes the stage so the payout (points + ETB prize) is credited and the
 * next stage unlocks.
 *
 * @example
 * ```tsx
 * <ChampionshipStageDuelPage />
 * ```
 */

"use client";

import { useEffect, useMemo, useRef } from "react";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Coins, Loader2, Trophy } from "lucide-react";

import { Button } from "@/components/theme/Button";
import { QuizBattleTemplate } from "@/components/templates/QuizBattleTemplate";
import { useAuthSession } from "@/contexts/AuthSession_Context";
import { fetchTopicBattle } from "@/modules/Competition/api";
import { buildDuelQuiz } from "@/modules/Competition/data";
import {
  topicBattleQueryKeys,
  useChampionship,
  useCompleteChampionshipStage,
  useDuelQuiz,
  useTopicBattleLeaderboard,
} from "@/modules/Competition/hooks";

export function ChampionshipStageDuelPage() {
  const params = useParams();
  const router = useRouter();
  const stageId = params?.id as string;
  const { isAuthenticated, session } = useAuthSession();
  const currentUserId = session?.user?.id ?? null;
  const queryClient = useQueryClient();

  const championshipQuery = useChampionship();
  const completeStage = useCompleteChampionshipStage();

  const stage = useMemo(
    () => championshipQuery.data?.stages.find((entry) => entry.id === stageId) ?? null,
    [championshipQuery.data, stageId],
  );
  const battleId = stage?.battleId;

  const {
    data: battle,
    isPending,
    error,
  } = useQuery({
    queryKey: topicBattleQueryKeys.detail(battleId ?? "missing"),
    queryFn: () => fetchTopicBattle(battleId as string),
    enabled: Boolean(battleId),
  });

  const { entries: leaderboardEntries } = useTopicBattleLeaderboard(battleId, currentUserId);
  const quiz = useMemo(
    () => (battle ? buildDuelQuiz(battle, leaderboardEntries) : null),
    [battle, leaderboardEntries],
  );
  const durationSeconds = battle?.durationMinutes ? battle.durationMinutes * 60 : undefined;
  const duel = useDuelQuiz(quiz, durationSeconds);

  const finished =
    Boolean(quiz) &&
    duel.state.totalQuestions > 0 &&
    duel.state.currentQuestionIndex >= duel.state.totalQuestions;
  const completionSent = useRef(false);
  useEffect(() => {
    if (finished && stage && isAuthenticated && !completionSent.current) {
      completionSent.current = true;
      completeStage.mutate(stage.order);
    }
  }, [finished, stage, isAuthenticated, completeStage]);

  const handleGoToTournament = () => {
    queryClient.removeQueries({ queryKey: topicBattleQueryKeys.detail(battleId ?? "") });
    router.push("/features/competitions/championship");
  };

  const handleBack = () => {
    router.push("/features/competitions/championship");
  };

  if (championshipQuery.isPending) {
    return <LoadingNotice label="Opening the tournament..." />;
  }

  if (!stage) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-text-secondary">This stage does not exist in the current season.</p>
        <Button variant="secondary" size="sm" onClick={handleBack}>
          <ArrowLeft className="size-4" />
          Back to Championship
        </Button>
      </div>
    );
  }

  if (isPending) {
    return <LoadingNotice label={`Loading ${stage.name}...`} />;
  }

  if (error || !battle || !quiz) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-text-secondary">Failed to load this stage challenge.</p>
        <Button variant="secondary" size="sm" onClick={handleBack}>
          <ArrowLeft className="size-4" />
          Back to Championship
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border-default bg-surface-default px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <Trophy className="size-5 shrink-0 text-secondary-600" aria-hidden />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">
              {stage.name} · {stage.shortLabel}
            </p>
            <p className="truncate text-xs text-text-secondary">
              {stage.pointsToEarn} pts at stake · Prize {stage.prizePool}
            </p>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-bold text-success-700">
          <Coins className="size-3.5" aria-hidden />
          {stage.prizePool}
        </span>
      </div>
      {completeStage.isPending && (
        <div className="flex items-center justify-center gap-2 border-b border-primary-500/20 bg-primary-50 px-4 py-2 text-xs font-medium text-primary-700 dark:bg-primary-950/30 dark:text-primary-300">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          <span>Submitting stage results and unlocking next challenge...</span>
        </div>
      )}
      {completeStage.isSuccess && (
        <div className="flex items-center justify-between gap-3 border-b border-success-500/30 bg-success-50 px-4 py-2.5 text-xs font-semibold text-success-800 dark:bg-success-950/30 dark:text-success-200 md:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success-600 text-white">
              <CheckCircle2 className="size-3.5" aria-hidden />
            </span>
            <span>
              Stage complete! Earned <strong>+{stage.pointsToEarn} championship pts</strong>. Next stage unlocked!
            </span>
          </div>
          <Button variant="primary" size="sm" onClick={handleGoToTournament}>
            View Standings
          </Button>
        </div>
      )}
      {completeStage.isError && (
        <div className="flex items-center justify-between gap-3 border-b border-error-500/30 bg-error-50 px-4 py-2 text-xs text-error-700 dark:bg-error-950/30 dark:text-error-300 md:px-6">
          <span>Failed to record stage completion. Please return to the championship bracket.</span>
          <Button variant="ghost" size="sm" onClick={handleGoToTournament}>
            Return
          </Button>
        </div>
      )}
      <QuizBattleTemplate
        quiz={quiz}
        state={duel.state}
        timeLeft={duel.timeLeft}
        timeLeftSeconds={duel.timeLeftSeconds}
        timeTotalSeconds={duel.totalTimeSeconds}
        onSubmit={duel.submitAnswer}
        onAdvance={duel.advance}
        onPlayAgain={handleGoToTournament}
        onExit={handleGoToTournament}
      />
    </div>
  );
}

function LoadingNotice({ label }: Readonly<{ label: string }>) {
  return (
    <div className="flex h-full items-center justify-center gap-2 p-6 text-text-secondary">
      <Loader2 className="size-5 animate-spin" aria-hidden />
      {label}
    </div>
  );
}

export default ChampionshipStageDuelPage;
