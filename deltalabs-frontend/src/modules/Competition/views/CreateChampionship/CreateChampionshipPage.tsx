"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Braces,
  CalendarClock,
  PenLine,
  Rocket,
  Settings2,
} from "lucide-react";

import { CreateBattleWizardTemplate } from "@/components/templates/CreateBattleWizardTemplate/CreateBattleWizardTemplate";
import type { ProgressStepperStep } from "@/components/molecules/ProgressStepper/ProgressStepper.types";
import { useAuthSession } from "@/contexts/AuthSession_Context";
import { useCreateChampionship } from "@/modules/Competition/hooks/useCreateChampionship";
import type { CreateChampionshipPayload } from "@/modules/Competition/types/championship";
import type { CodingQuestion } from "@/modules/Competition/types/createBattle";

import { ChampionshipDetailsStep } from "./ChampionshipDetailsStep";
import { ChampionshipSetupStep } from "./ChampionshipSetupStep";
import { ChampionshipQuestionsStep } from "./ChampionshipQuestionsStep";
import { ChampionshipScheduleStep } from "./ChampionshipScheduleStep";
import { ChampionshipReviewStep } from "./ChampionshipReviewStep";
import { StageQuestionBuilder } from "./StageQuestionBuilder";
import {
  INITIAL_DRAFT,
  entryFeeLabel,
  stageLabel,
  type ChampionshipDraft,
  type StageQuestionMode,
} from "./types";

const WIZARD_STEPS: ProgressStepperStep[] = [
  { id: "details", label: "Details", icon: <PenLine className="size-5" /> },
  { id: "setup", label: "Setup", icon: <Settings2 className="size-5" /> },
  { id: "questions", label: "Questions", icon: <Braces className="size-5" /> },
  { id: "schedule", label: "Schedule", icon: <CalendarClock className="size-5" /> },
  { id: "launch", label: "Launch", icon: <Rocket className="size-5" /> },
];

const TOTAL_STEPS = WIZARD_STEPS.length;

function resizeTo<T>(array: T[], size: number, create: () => T): T[] {
  const next = [...array];
  while (next.length < size) {
    next.push(create());
  }
  return next.slice(0, size);
}

export function CreateChampionshipPage() {
  const router = useRouter();
  const { session } = useAuthSession();
  const createChampionship = useCreateChampionship();

  const [currentStep, setCurrentStep] = useState(1);
  const [draft, setDraft] = useState<ChampionshipDraft>(() => ({
    ...INITIAL_DRAFT,
    creatorName: session?.user?.name || session?.user?.email?.split("@")[0] || "",
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [stageModes, setStageModes] = useState<StageQuestionMode[]>(() =>
    Array.from({ length: INITIAL_DRAFT.stageCount }, () => "auto"),
  );
  const [stageQuestions, setStageQuestions] = useState<CodingQuestion[][]>(() =>
    Array.from({ length: INITIAL_DRAFT.stageCount }, () => []),
  );
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null);

  // Sync session user name if it loads asynchronously
  useEffect(() => {
    if (session?.user?.name && !draft.creatorName) {
      setDraft((prev) => ({ ...prev, creatorName: session.user.name ?? "" }));
    }
  }, [session, draft.creatorName]);

  const handleBack = useCallback(() => {
    router.push("/features/competitions/championship");
  }, [router]);

  const updateDraft = useCallback((updates: Partial<ChampionshipDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleStageCountChange = useCallback(
    (count: number) => {
      updateDraft({ stageCount: count });
      setStageModes((prev) => resizeTo(prev, count, () => "auto"));
      setStageQuestions((prev) => resizeTo(prev, count, () => []));
    },
    [updateDraft],
  );

  const handleStageQuestionsDone = useCallback(
    (stageIndex: number, questions: CodingQuestion[]) => {
      setStageQuestions((prev) => {
        const next = [...prev];
        next[stageIndex] = questions;
        return next;
      });
      setStageModes((prev) => {
        const next = [...prev];
        next[stageIndex] = questions.length > 0 ? "custom" : "auto";
        return next;
      });
      setEditingStageIndex(null);
    },
    [],
  );

  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case 1:
        return draft.title.trim().length >= 3;
      case 4:
        return draft.timing === "instant" || Boolean(draft.scheduleDate && draft.scheduleTime);
      default:
        return true;
    }
  }, [currentStep, draft]);

  const goNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS && canGoNext) {
      setCurrentStep((step) => step + 1);
    }
  }, [currentStep, canGoNext]);

  const goPrevious = useCallback(() => {
    setCurrentStep((step) => Math.max(1, step - 1));
  }, []);

  const handleLaunch = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    const payload: CreateChampionshipPayload = {
      title: draft.title.trim(),
      description: draft.description.trim()
        ? `${draft.description.trim()}\n\nDiscipline: ${draft.subject} · Division: ${draft.difficulty}`
        : `Discipline: ${draft.subject} · Division: ${draft.difficulty}`,
      stageCount: draft.stageCount,
      entryFee: entryFeeLabel(draft.entryFee, draft.customFee),
      prizeBaseEtb: draft.prizeBaseEtb,
      timing: draft.timing,
      creatorName: draft.creatorName.trim() || undefined,
      stageQuestions: stageModes.map((mode, index) =>
        mode === "custom" ? (stageQuestions[index] ?? []) : [],
      ),
      ...(draft.timing === "schedule"
        ? {
            scheduleDate: draft.scheduleDate,
            scheduleTime: draft.scheduleTime,
            scheduleTimezone: draft.scheduleTimezone,
          }
        : {}),
    };

    try {
      await createChampionship.mutateAsync(payload);
      router.push("/features/competitions/championship");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to launch the championship tournament.",
      );
      setIsSubmitting(false);
    }
  }, [createChampionship, draft, router, stageModes, stageQuestions]);

  if (editingStageIndex !== null) {
    const stage = stageLabel(draft.stageCount, editingStageIndex);
    return (
      <StageQuestionBuilder
        stageLabel={stage}
        stageIndex={editingStageIndex}
        initial={stageQuestions[editingStageIndex] ?? []}
        onBack={() => setEditingStageIndex(null)}
        onDone={handleStageQuestionsDone}
      />
    );
  }

  return (
    <CreateBattleWizardTemplate
      title="Create Championship"
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      steps={WIZARD_STEPS}
      onBack={handleBack}
      onPrevious={goPrevious}
      previousDisabled={currentStep <= 1 || isSubmitting}
      onNext={currentStep === TOTAL_STEPS ? handleLaunch : goNext}
      nextDisabled={!canGoNext || isSubmitting}
      nextLabel={
        currentStep === TOTAL_STEPS
          ? isSubmitting
            ? "Launching Tournament…"
            : "Launch Tournament"
          : "Next"
      }
      submitError={submitError}
    >
      {currentStep === 1 && (
        <ChampionshipDetailsStep draft={draft} updateDraft={updateDraft} />
      )}
      {currentStep === 2 && (
        <ChampionshipSetupStep
          draft={draft}
          updateDraft={updateDraft}
          onStageCountChange={handleStageCountChange}
        />
      )}
      {currentStep === 3 && (
        <ChampionshipQuestionsStep
          draft={draft}
          stageModes={stageModes}
          stageQuestions={stageQuestions}
          onOpenStageBuilder={(index) => setEditingStageIndex(index)}
        />
      )}
      {currentStep === 4 && (
        <ChampionshipScheduleStep draft={draft} updateDraft={updateDraft} />
      )}
      {currentStep === 5 && (
        <ChampionshipReviewStep
          draft={draft}
          stageModes={stageModes}
          stageQuestions={stageQuestions}
          onEditStep={setCurrentStep}
        />
      )}
    </CreateBattleWizardTemplate>
  );
}

export default CreateChampionshipPage;

