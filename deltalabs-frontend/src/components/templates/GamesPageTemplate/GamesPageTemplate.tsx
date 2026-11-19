import type { ReactNode } from "react";

import { Gamepad2, Trophy } from "lucide-react";

import { BackButton } from "@/components/theme/BackButton";
import { Button } from "@/components/theme/Button";
import { Typography } from "@/components/theme/Typography";
import { GameCard } from "@/components/molecules/GameCard";
import type { CompetitionGame } from "@/modules/Competition/types/games";
import { cn } from "@/lib/utils";

export interface GamesPageTemplateProps {
  games: CompetitionGame[];
  onBack?: () => void;
  onPlayGame?: (game: CompetitionGame) => void;
  onCreateNew?: () => void;
  statusSlot?: ReactNode;
  className?: string;
}

export function GamesPageTemplate({
  games,
  onBack,
  onPlayGame,
  onCreateNew,
  statusSlot,
  className,
}: Readonly<GamesPageTemplateProps>) {
  const tournaments = games.filter((game) => game.isChampionship);
  const openGames = games.filter((game) => !game.isChampionship && game.status === "open");
  const upcomingGames = games.filter((game) => !game.isChampionship && game.status !== "open");

  return (
    <div className={cn("flex h-full flex-col gap-5 overflow-y-auto p-4 md:p-6", className)}>
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && <BackButton label="" onClick={onBack} />}
          <Gamepad2 className="size-6 shrink-0 text-secondary-600" />
          <div className="min-w-0">
            <Typography as="h1" className="text-2xl font-semibold text-primary-600">
              Games &amp; Tournaments
            </Typography>
            <p className="text-sm text-text-secondary">
              Pick a tournament or challenge game, compete in staged duels, and claim prizes.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onCreateNew && (
            <Button variant="primary" size="sm" onClick={onCreateNew}>
              <Trophy className="size-4" />
              Create Tournament
            </Button>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1.5 text-xs font-semibold text-success-700">
            <span className="size-1.5 rounded-full bg-success-500" aria-hidden />
            {openGames.length + tournaments.length} open now
          </span>
        </div>
      </div>

      {statusSlot}

      {/* Championship Tournaments Section */}
      {tournaments.length > 0 && (
        <section aria-labelledby="tournaments-heading">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-secondary-600" aria-hidden />
              <Typography
                as="h2"
                id="tournaments-heading"
                className="text-lg font-semibold text-text-primary"
              >
                Championship Tournaments
              </Typography>
            </div>
            <span className="text-sm tabular-nums text-text-secondary">
              {tournaments.length} active
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((game) => (
              <GameCard key={game.id} game={game} onPlay={onPlayGame} />
            ))}
          </div>
        </section>
      )}

      {/* Open games */}
      {openGames.length > 0 && (
        <section aria-labelledby="games-open-heading">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Typography
              as="h2"
              id="games-open-heading"
              className="text-lg font-semibold text-text-primary"
            >
              Open Games &amp; Arena Battles
            </Typography>
            <span className="text-sm tabular-nums text-text-secondary">
              {openGames.length} games
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {openGames.map((game) => (
              <GameCard key={game.id} game={game} onPlay={onPlayGame} />
            ))}
          </div>
        </section>
      )}

      {/* Locked & upcoming */}
      {upcomingGames.length > 0 && (
        <section aria-labelledby="games-upcoming-heading">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Typography
              as="h2"
              id="games-upcoming-heading"
              className="text-lg font-semibold text-text-primary"
            >
              Locked &amp; Upcoming
            </Typography>
            <span className="text-sm tabular-nums text-text-secondary">
              {upcomingGames.length} games
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingGames.map((game) => (
              <GameCard key={game.id} game={game} onPlay={onPlayGame} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default GamesPageTemplate;