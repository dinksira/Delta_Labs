"use client";

import { useCallback } from "react";

import { useRouter } from "next/navigation";

import { GamesPageTemplate } from "@/components/templates/GamesPageTemplate";
import { FALLBACK_GAMES, useGames } from "@/modules/Competition/hooks";
import type { CompetitionGame } from "@/modules/Competition/types/games";

export function GamesPage() {
  const router = useRouter();
  const query = useGames();

  const data = query.data;

  const handleBack = useCallback(() => {
    router.push("/features/competitions");
  }, [router]);

  const handleCreateNew = useCallback(() => {
    router.push("/features/competitions/championship/host");
  }, [router]);

  const handlePlayGame = useCallback(
    (game: CompetitionGame) => {
      if (game.isChampionship) {
        router.push("/features/competitions/championship");
        return;
      }
      router.push(`/features/competitions/games/${game.id}`);
    },
    [router],
  );

  const gamesList = data?.games ?? (query.isError ? FALLBACK_GAMES.games : []);

  const statusSlot = query.isLoading ? (
    <div className="flex items-center justify-center rounded-2xl border border-border-default bg-surface-default p-8 text-text-secondary">
      Loading games...
    </div>
  ) : query.isError ? (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-warning-500/40 bg-warning-50/70 p-4 text-xs text-warning-800 dark:bg-warning-950/20 dark:text-warning-300">
      <span>Reconnecting to tournament server... Showing offline catalog in the meantime.</span>
      <button
        type="button"
        onClick={() => query.refetch()}
        className="shrink-0 rounded-lg bg-warning-600 px-3 py-1 font-semibold text-white hover:bg-warning-700"
      >
        Retry
      </button>
    </div>
  ) : null;

  return (
    <GamesPageTemplate
      games={gamesList}
      onBack={handleBack}
      onPlayGame={handlePlayGame}
      onCreateNew={handleCreateNew}
      statusSlot={statusSlot}
    />
  );
}

export default GamesPage;