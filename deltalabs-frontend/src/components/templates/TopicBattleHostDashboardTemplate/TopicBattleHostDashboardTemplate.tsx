"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  Copy,
  Gift,
  ListChecks,
  Settings,
  StopCircle,
  Table2,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";

import type { BattleParticipantsResponse, TopicBattle } from "@/modules/Competition/types/topicBattle";
import { BattleParticipantPanel } from "@/components/organisms/BattleParticipantPanel";
import { BattleQuestionsPanel } from "@/components/organisms/BattleQuestionsPanel";
import { Button } from "@/components/theme/Button";
import { Typography } from "@/components/theme/Typography";
import { CompetitionManagementTableView } from "@/modules/Competition/managementTable/CompetitionManagementTableView";
import { EndTopicBattleModal } from "@/components/organisms/EndTopicBattleModal";
import { useTopicBattleLeaderboard, useEndTopicBattle } from "@/modules/Competition/hooks";
import { getStatusLabel } from "@/modules/Competition/utils";
import { cn } from "@/lib/utils";

export interface TopicBattleHostDashboardTemplateProps {
  battle: TopicBattle;
  participantsResponse?: BattleParticipantsResponse;
  isParticipantsLoading?: boolean;
  onBack?: () => void;
}

type TabType = "participants" | "questions" | "leaderboard" | "settings";

export function TopicBattleHostDashboardTemplate({
  battle,
  participantsResponse,
  isParticipantsLoading = false,
  onBack,
}: Readonly<TopicBattleHostDashboardTemplateProps>) {
  const [activeTab, setActiveTab] = useState<TabType>("participants");
  const [copied, setCopied] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  const { entries: leaderboardEntries, isPending: isLeaderboardLoading } =
    useTopicBattleLeaderboard(battle.id, null);
  const endMutation = useEndTopicBattle();

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      void navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmEnd = () => {
    endMutation.mutate(battle.id, {
      onSuccess: () => setIsEndOpen(false),
      onError: () => setIsEndOpen(false),
    });
  };

  const participants = participantsResponse?.participants ?? [];
  const totalJoined = participantsResponse?.totalParticipants ?? battle.playersJoined;
  const totalCompleted = participantsResponse?.totalCompleted ?? 0;

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-border-default bg-surface-default text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
              aria-label="Back"
            >
              <ArrowLeft className="size-5" />
            </button>
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                <Settings className="size-3.5" /> Host Console
              </span>
              <span className="inline-flex rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-semibold text-success-700 dark:bg-success-900/40 dark:text-success-300">
                {getStatusLabel(battle.status)}
              </span>
            </div>
            <Typography as="h1" className="truncate text-xl font-bold text-text-primary sm:text-2xl lg:text-3xl">
              {battle.title}
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-2">
            {copied ? <Check className="size-4 text-success-600" /> : <Copy className="size-4" />}
            <span>{copied ? "Link Copied!" : "Share Battle Link"}</span>
          </Button>
          {battle.status !== "finished" && battle.status !== "cancelled" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEndOpen(true)}
              className="gap-2 border-error-300 text-error-600 hover:border-error-500 hover:bg-error-50 dark:border-error-700 dark:text-error-400 dark:hover:bg-error-950"
            >
              <StopCircle className="size-4" />
              End Competition
            </Button>
          ) : null}
        </div>
      </div>

      {/* Hero Overview Banner - Full Width & Responsive */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Trophy className="size-6 text-yellow-400" />
              </div>
              <div className="min-w-0">
                <Typography as="h2" className="truncate text-2xl font-bold text-white sm:text-3xl">
                  {battle.title}
                </Typography>
                <p className="text-xs text-primary-200 sm:text-sm">
                  Created by You · Subject: <span className="font-semibold text-white">{battle.subject}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm">
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 font-medium backdrop-blur-sm">
                Difficulty: {battle.difficulty}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-medium backdrop-blur-sm">
                <Clock className="size-3.5" /> {battle.durationMinutes} min round
              </span>
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 font-medium backdrop-blur-sm">
                {battle.questions.length} questions
              </span>
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 font-medium backdrop-blur-sm">
                Format: {battle.format}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 shrink-0">
            <div className="flex flex-col items-center rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm sm:px-5 sm:py-3 text-center">
              <span className="text-[10px] font-medium uppercase tracking-wider text-primary-200 sm:text-xs">Prize Pool</span>
              <span className="text-base font-bold text-yellow-300 sm:text-xl lg:text-2xl">{battle.prizePool}</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm sm:px-5 sm:py-3 text-center">
              <span className="text-[10px] font-medium uppercase tracking-wider text-primary-200 sm:text-xs">Entry Fee</span>
              <span className="text-base font-bold text-white sm:text-xl lg:text-2xl">{battle.entryFee}</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm sm:px-5 sm:py-3 text-center">
              <span className="text-[10px] font-medium uppercase tracking-wider text-primary-200 sm:text-xs">Capacity</span>
              <span className="text-base font-bold text-white sm:text-xl lg:text-2xl">{totalJoined} / {battle.playersMax}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border-default pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("participants")}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
            activeTab === "participants"
              ? "bg-primary-600 text-white shadow-sm"
              : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
          )}
        >
          <Users className="size-4" />
          <span>Participants ({totalJoined})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
            activeTab === "questions"
              ? "bg-primary-600 text-white shadow-sm"
              : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
          )}
        >
          <ListChecks className="size-4" />
          <span>Questions ({battle.questions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("leaderboard")}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
            activeTab === "leaderboard"
              ? "bg-primary-600 text-white shadow-sm"
              : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
          )}
        >
          <Trophy className="size-4" />
          <span>Live Standings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
            activeTab === "settings"
              ? "bg-primary-600 text-white shadow-sm"
              : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
          )}
        >
          <Table2 className="size-4" />
          <span>Table View</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "participants" ? (
        <BattleParticipantPanel
          participants={participants}
          totalParticipants={totalJoined}
          totalCompleted={totalCompleted}
          isLoading={isParticipantsLoading}
        />
      ) : null}

      {activeTab === "questions" ? (
        <BattleQuestionsPanel questions={battle.questions} />
      ) : null}

      {activeTab === "leaderboard" ? (
        <div className="flex flex-col gap-4">
          <Typography as="h3" className="text-base font-semibold text-text-primary">
            Live Standings ({leaderboardEntries.length})
          </Typography>

          {isLeaderboardLoading ? (
            <div className="flex h-36 items-center justify-center text-text-secondary">
              Loading standings...
            </div>
          ) : leaderboardEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-default bg-surface-default p-8 text-center">
              <Trophy className="mx-auto size-10 text-text-tertiary" />
              <Typography className="mt-2 font-medium text-text-primary">
                No scores recorded yet
              </Typography>
              <Typography variant="small" className="text-text-secondary">
                Leaderboard will populate as participants complete their quiz attempts.
              </Typography>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {leaderboardEntries.map((row) => (
                <div
                  key={row.userId}
                  className="flex items-center justify-between rounded-xl border border-border-default bg-surface-default p-4 shadow-sm transition-all hover:border-primary-300 dark:hover:border-primary-700"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                        row.rank === 1
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                          : row.rank === 2
                            ? "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                            : row.rank === 3
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-surface-muted text-text-secondary",
                      )}
                    >
                      {row.rank}
                    </span>
                    <div className="min-w-0">
                      <Typography className="truncate font-semibold text-text-primary">
                        {row.name}
                      </Typography>
                      <span className="text-xs text-text-secondary">Rank #{row.rank}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-surface-muted px-3 py-1.5 font-bold text-primary-600 dark:text-primary-400">
                    <span>{row.points}</span>
                    <span className="text-xs font-normal text-text-secondary">PTS</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {activeTab === "settings" ? (
        <div className="w-full overflow-hidden rounded-xl border border-border-default bg-surface-default p-4">
          <CompetitionManagementTableView battleId={battle.id} />
        </div>
      ) : null}

      <EndTopicBattleModal
        open={isEndOpen}
        title={battle.title}
        isPending={endMutation.isPending}
        onClose={() => setIsEndOpen(false)}
        onConfirm={handleConfirmEnd}
      />
    </div>
  );
}

export default TopicBattleHostDashboardTemplate;

