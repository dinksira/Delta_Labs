"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  Copy,
  Gift,
  HelpCircle,
  ListChecks,
  Settings,
  Share2,
  Swords,
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
import { useTopicBattleLeaderboard } from "@/modules/Competition/hooks";
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

  const { entries: leaderboardEntries, isPending: isLeaderboardLoading } =
    useTopicBattleLeaderboard(battle.id, null);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      void navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const participants = participantsResponse?.participants ?? [];
  const totalJoined = participantsResponse?.totalParticipants ?? battle.playersJoined;
  const totalCompleted = participantsResponse?.totalCompleted ?? 0;

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col gap-6 overflow-y-auto p-4 md:p-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex size-9 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
              aria-label="Back"
            >
              <ArrowLeft className="size-5" />
            </button>
          ) : null}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                <Settings className="size-3" /> Host Console
              </span>
              <span className="inline-flex rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-700 dark:bg-success-900/40 dark:text-success-300">
                {getStatusLabel(battle.status)}
              </span>
            </div>
            <Typography as="h1" className="truncate text-xl font-bold text-text-primary sm:text-2xl">
              {battle.title}
            </Typography>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5">
          {copied ? <Check className="size-4 text-success-600" /> : <Copy className="size-4" />}
          <span>{copied ? "Link Copied!" : "Share Link"}</span>
        </Button>
      </div>

      {/* Hero Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="size-6 text-yellow-400" />
              <Typography as="h2" className="text-2xl font-bold text-white">
                {battle.title}
              </Typography>
            </div>
            <p className="mt-1 text-sm text-primary-100">
              Subject: {battle.subject} · Difficulty: {battle.difficulty} · Duration:{" "}
              {battle.durationMinutes} min
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
              <Gift className="mr-1.5 inline size-3.5 text-yellow-300" />
              {battle.prizePool}
            </span>
            <span className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
              <Ticket className="mr-1.5 inline size-3.5 text-primary-200" />
              {battle.entryFee}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border-default pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("participants")}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
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
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
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
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
            activeTab === "leaderboard"
              ? "bg-primary-600 text-white shadow-sm"
              : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
          )}
        >
          <Trophy className="size-4" />
          <span>Standings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
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
            <div className="flex flex-col gap-2">
              {leaderboardEntries.map((row) => (
                <div
                  key={row.userId}
                  className="flex items-center justify-between rounded-xl border border-border-default bg-surface-default p-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full text-sm font-bold",
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
                    <Typography className="font-semibold text-text-primary">
                      {row.name}
                    </Typography>
                  </div>
                  <span className="font-bold text-primary-600 dark:text-primary-400">
                    {row.points} PTS
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {activeTab === "settings" ? (
        <div className="rounded-xl border border-border-default bg-surface-default p-4">
          <CompetitionManagementTableView battleId={battle.id} />
        </div>
      ) : null}
    </div>
  );
}

export default TopicBattleHostDashboardTemplate;

