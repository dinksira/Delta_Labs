/**
 * HostControlPanel — the host's live room dashboard and management console.
 * Features:
 * - Status header with viewer count, active players, and End Duel control.
 * - Tabbed workspace:
 *   1. "Question Studio" for on-air status, question composer, and question history.
 *   2. "Participants & Scores" for tracking live competitors, their scores, ranks, and media states.
 */

"use client";

import { useMemo, useState } from "react";
import { Eye, Flag, Mic, MicOff, Radio, Sparkles, Trophy, Users, Video, VideoOff } from "lucide-react";

import { Avatar } from "@/components/atoms/Avatar";
import { LiveBadge } from "@/components/atoms/LiveBadge";
import { RichText } from "@/components/atoms/RichText/RichText";
import { HostQuestionComposer } from "@/components/organisms/HostQuestionComposer";
import { Button } from "@/components/theme/Button";
import { Typography } from "@/components/theme/Typography";
import type { DuelLeaderboardEntry } from "@/modules/Competition/types/duelQuiz";
import type { LiveParticipant, LiveQuestion } from "@/modules/Competition/types/liveDuel";
import { cn } from "@/lib/utils";

// ===== COMPONENT =====

export interface HostControlPanelProps {
  viewers: number;
  liveQuestion: LiveQuestion | null;
  /** Host-posted questions, newest first. */
  postedQuestions: LiveQuestion[];
  onPostQuestion: (question: LiveQuestion) => void;
  participants?: LiveParticipant[];
  leaderboard?: DuelLeaderboardEntry[];
  onEndDuel?: () => void;
  isEnding?: boolean;
  className?: string;
}

type TabType = "questions" | "participants";

export function HostControlPanel({
  viewers,
  liveQuestion,
  postedQuestions,
  onPostQuestion,
  participants = [],
  leaderboard = [],
  onEndDuel,
  isEnding = false,
  className,
}: Readonly<HostControlPanelProps>) {
  const [activeTab, setActiveTab] = useState<TabType>("questions");
  const nextRound = postedQuestions.length + 1;

  // Build combined participant list with their live leaderboard score
  const competitorRows = useMemo(() => {
    const scoresMap = new Map<string, { points: number; rank: number }>();
    for (const row of leaderboard) {
      if (row.userId) {
        scoresMap.set(row.userId, { points: row.points, rank: row.rank });
      }
    }

    return participants
      .filter((p) => !p.isHost)
      .map((p) => {
        const scoreInfo = scoresMap.get(p.id) ?? { points: 0, rank: leaderboard.length + 1 };
        return {
          ...p,
          points: scoreInfo.points,
          rank: scoreInfo.rank,
        };
      })
      .sort((a, b) => b.points - a.points);
  }, [participants, leaderboard]);

  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border-default bg-surface-default p-4 shadow-sm",
        className,
      )}
      aria-label="Host control"
    >
      {/* Console Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default pb-3">
        <div className="flex items-center gap-2">
          <LiveBadge />
          <div>
            <div className="flex items-center gap-1.5">
              <Typography as="h2" className="text-base font-bold text-text-primary">
                Host Arena Console
              </Typography>
              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">
                Quizmaster
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Manage questions, monitor competitors & track live scores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold tabular-nums text-text-primary">
            <Eye className="size-3.5 text-text-tertiary" aria-hidden />
            {viewers.toLocaleString()} watching
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold tabular-nums text-text-primary">
            <Users className="size-3.5 text-text-tertiary" aria-hidden />
            {competitorRows.length} players
          </span>
          {onEndDuel && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onEndDuel}
              disabled={isEnding}
              className="gap-1.5 border-error-200 text-error-600 hover:bg-error-50 dark:border-error-900/40 dark:text-error-400"
            >
              <Flag className="size-3.5" />
              {isEnding ? "Ending…" : "End Duel"}
            </Button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border-default pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
            activeTab === "questions"
              ? "bg-primary-600 text-white shadow-xs"
              : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
          )}
        >
          <Sparkles className="size-3.5" />
          Question Studio ({postedQuestions.length} posted)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("participants")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
            activeTab === "participants"
              ? "bg-primary-600 text-white shadow-xs"
              : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
          )}
        >
          <Users className="size-3.5" />
          Competitors & Scores ({competitorRows.length})
        </button>
      </div>

      {/* Tab 1: Question Studio */}
      {activeTab === "questions" ? (
        <div className="flex flex-col gap-4">
          {liveQuestion ? (
            <div className="rounded-xl border border-primary-200 bg-primary-50 px-3.5 py-2.5 dark:border-primary-800/60 dark:bg-primary-900/30">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">
                  On air · Round {liveQuestion.round}
                </p>
                <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  Active Question
                </span>
              </div>
              <RichText html={liveQuestion.text} className="mt-1 text-sm font-semibold text-text-primary" />
              <p className="mt-1 text-xs tabular-nums text-text-secondary">
                {liveQuestion.points.toLocaleString()} pts · Time limit: {liveQuestion.timeLabel}
              </p>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border-default px-3 py-2 text-sm text-text-secondary">
              Nothing on air yet — compose and dispatch the first question below.
            </p>
          )}

          <HostQuestionComposer round={nextRound} onPost={onPostQuestion} />

          {postedQuestions.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                Round History · {postedQuestions.length}
              </p>
              <ul className="flex max-h-48 flex-col gap-1.5 overflow-y-auto pr-1">
                {postedQuestions.map((q) => {
                  const isOnAir = liveQuestion?.id === q.id;
                  return (
                    <li
                      key={q.id}
                      className={cn(
                        "flex items-start justify-between gap-3 rounded-xl border bg-surface-muted px-3 py-2",
                        isOnAir ? "border-primary-400 bg-primary-50/40 dark:bg-primary-950/20" : "border-border-default",
                      )}
                    >
                      <div className="min-w-0">
                        <RichText html={q.text} className="truncate text-sm font-medium text-text-primary" />
                        <p className="text-xs tabular-nums text-text-secondary">
                          Round {q.round} · {q.points.toLocaleString()} pts · {q.timeLabel}
                        </p>
                      </div>
                      {isOnAir ? (
                        <span className="shrink-0 rounded-full bg-primary-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          On air
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-surface-default px-2 py-0.5 text-[10px] font-semibold text-text-tertiary">
                          Finished
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Tab 2: Participants & Scores */}
      {activeTab === "participants" ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Competitor Standings</span>
            <span>Live Sync</span>
          </div>

          {competitorRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-default py-8 text-center text-text-secondary">
              <Users className="size-8 text-text-tertiary mb-2" />
              <p className="text-sm font-semibold">No participants on stage yet</p>
              <p className="text-xs">Players will appear here as they join the live duel.</p>
            </div>
          ) : (
            <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
              {competitorRows.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border-default bg-surface-muted p-2.5 transition-colors hover:bg-surface-default"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-default text-xs font-bold text-text-secondary shadow-xs">
                      #{player.rank}
                    </span>
                    <Avatar name={player.name} src={player.avatarUrl} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">{player.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                        <span className="flex items-center gap-1">
                          {player.micMuted ? (
                            <MicOff className="size-3 text-text-tertiary" />
                          ) : (
                            <Mic className="size-3 text-success-600" />
                          )}
                          {player.cameraOff ? (
                            <VideoOff className="size-3 text-text-tertiary" />
                          ) : (
                            <Video className="size-3 text-success-600" />
                          )}
                        </span>
                        {player.online && (
                          <span className="flex items-center gap-1 text-success-600 font-medium">
                            <span className="size-1.5 rounded-full bg-success-500" />
                            Online
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-lg bg-surface-default px-2.5 py-1 font-bold text-primary-700 dark:text-primary-300 shadow-xs">
                    <Trophy className="size-3.5 text-yellow-500" />
                    <span className="text-sm tabular-nums">{player.points.toLocaleString()}</span>
                    <span className="text-[10px] font-normal text-text-secondary">PTS</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

export default HostControlPanel;
