import type { CodingQuestion } from "@/modules/Competition/types/createBattle";

export interface StageOption {
  count: number;
  title: string;
  runs: string[];
  description: string;
}

export const STAGE_OPTIONS: StageOption[] = [
  {
    count: 3,
    title: "Quick Knockout",
    runs: ["Qualifier Round", "Semifinals", "Grand Final"],
    description: "High-intensity 3-round bracket ideal for quick weekend cups.",
  },
  {
    count: 5,
    title: "Classic Bracket",
    runs: ["Qualifier Round", "Round of 32", "Round of 16", "Quarterfinals", "Grand Final"],
    description: "Balanced 5-stage progression with expanding challenges and prize pools.",
  },
  {
    count: 8,
    title: "Full Bracket",
    runs: [
      "Qualifier Round",
      "Round of 64",
      "Round of 32",
      "Round of 16",
      "Quarterfinals",
      "Semifinals",
      "Finals",
      "Grand Final",
    ],
    description: "Premier 8-stage tournament marathon culminating in the Grand Final.",
  },
];

export const CHAMPIONSHIP_SUBJECTS = [
  "Computer Science",
  "Mathematics",
  "Science & Physics",
  "Logic & Algorithms",
  "General Engineering",
  "Competitive Programming",
] as const;

export const CHAMPIONSHIP_DIFFICULTIES = [
  { id: "all", label: "Open Bracket (All Levels)" },
  { id: "intermediate", label: "Intermediate Division" },
  { id: "master", label: "Master Division (Advanced)" },
] as const;

export const DEFAULT_TIMEZONE = "UTC+3 (EAT)";

export interface ChampionshipDraft {
  title: string;
  description: string;
  subject: string;
  difficulty: string;
  creatorName: string;
  stageCount: number;
  entryFee: number | "Free" | "Custom";
  customFee: number;
  prizeBaseEtb: number;
  timing: "instant" | "schedule";
  stageSpacingDays: number;
  scheduleDate: string;
  scheduleTime: string;
  scheduleTimezone: string;
}

export const INITIAL_DRAFT: ChampionshipDraft = {
  title: "",
  description: "",
  subject: "Computer Science",
  difficulty: "all",
  creatorName: "",
  stageCount: 5,
  entryFee: "Free",
  customFee: 25,
  prizeBaseEtb: 50,
  timing: "instant",
  stageSpacingDays: 7,
  scheduleDate: "",
  scheduleTime: "",
  scheduleTimezone: DEFAULT_TIMEZONE,
};

export type StageQuestionMode = "auto" | "custom";

export function stagePrizes(base: number, count: number): number[] {
  return Array.from({ length: count }, (_, index) => {
    const prize = base * 2 ** index;
    return index === count - 1 ? prize + base * count : prize;
  });
}

export function entryFeeLabel(fee: number | "Free" | "Custom", customFee: number): string {
  if (fee === "Free") return "Free";
  if (fee === "Custom") return `ETB ${customFee}`;
  return `ETB ${fee}`;
}

export function stageRunNames(count: number): string[] {
  return (STAGE_OPTIONS.find((option) => option.count === count) ?? STAGE_OPTIONS[1]).runs;
}

export function stageLabel(count: number, index: number): string {
  return stageRunNames(count)[index] ?? `Stage ${index + 1}`;
}

