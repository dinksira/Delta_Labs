"use client";

import { useCallback, useState } from "react";
import { Braces, Code2, Palette, Plus, ScrollText } from "lucide-react";

import { CodeEditorModule } from "@/components/organisms/CodeEditorModule/CodeEditorModule";
import { DesignCanvasModule } from "@/components/organisms/DesignCanvasModule/DesignCanvasModule";
import { MarkdownPadModule } from "@/components/organisms/MarkdownPadModule/MarkdownPadModule";
import { ModuleRail } from "@/components/organisms/ModuleRail/ModuleRail";
import { ModuleSettingsPanel } from "@/components/organisms/ModuleSettingsPanel/ModuleSettingsPanel";
import { QuestionAuthoringEditor } from "@/components/organisms/QuestionAuthoringEditor/QuestionAuthoringEditor";
import { QuestionBuilderHeader } from "@/components/organisms/QuestionBuilderHeader/QuestionBuilderHeader";
import { QuestionModuleSettings } from "@/components/molecules/QuestionModuleSettings/QuestionModuleSettings";
import { QuestionTabBar } from "@/components/organisms/QuestionTabBar/QuestionTabBar";
import { QuestionTypeMenu } from "@/components/organisms/QuestionTypeMenu/QuestionTypeMenu";
import { CompetitionWorkspaceTemplate } from "@/components/templates/CompetitionWorkspaceTemplate/CompetitionWorkspaceTemplate";
import { Button } from "@/components/theme/Button";
import { Typography } from "@/components/theme/Typography";
import {
  createEmptyQuestion,
  type CodingQuestion,
  type QuestionKind,
} from "@/modules/Competition/types/createBattle";
import {
  MAX_QUESTIONS,
  ModuleSwitchPrompt,
  QUESTION_KIND_LABELS,
  QUESTION_LANGUAGES,
  QUESTION_TYPE_KINDS,
  WORKSPACE_MODULES,
} from "@/modules/Competition/views/CreateBattleTopicPage";

export interface StageQuestionBuilderProps {
  stageLabel: string;
  stageIndex: number;
  initial: CodingQuestion[];
  onBack: () => void;
  onDone: (stageIndex: number, questions: CodingQuestion[]) => void;
}

export function StageQuestionBuilder({
  stageLabel: label,
  stageIndex,
  initial,
  onBack,
  onDone,
}: Readonly<StageQuestionBuilderProps>) {
  const [questions, setQuestions] = useState<CodingQuestion[]>(initial);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    initial[initial.length - 1]?.id ?? null,
  );
  const [activeModule, setActiveModule] = useState<string>("code");

  const activeQuestion =
    questions.find((q) => q.id === activeQuestionId) ?? questions[questions.length - 1];

  const addQuestion = useCallback(() => {
    const question = createEmptyQuestion();
    setQuestions((prev) => (prev.length >= MAX_QUESTIONS ? prev : [...prev, question]));
    setActiveQuestionId(question.id);
  }, []);

  const updateQuestion = useCallback(
    (id: string, updates: Partial<CodingQuestion>) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...updates } : q)),
      );
    },
    [],
  );

  const removeQuestion = useCallback((id: string) => {
    setQuestions((prev) => {
      const next = prev.filter((q) => q.id !== id);
      setActiveQuestionId((current) =>
        current === id ? (next[next.length - 1]?.id ?? null) : current,
      );
      return next;
    });
  }, []);

  const selectModule = useCallback((moduleId: string) => {
    setActiveModule(moduleId);
  }, []);

  const finish = useCallback(() => {
    onDone(stageIndex, questions);
  }, [onDone, questions, stageIndex]);

  const active = activeQuestion ?? null;

  const renderActiveModule = () => {
    if (!active) return null;
    const kindLabel = QUESTION_KIND_LABELS[active.kind] ?? "question";

    switch (activeModule) {
      case "code":
        return active.kind === "coding" ? (
          <CodeEditorModule
            question={active}
            onChange={(updates) => updateQuestion(active.id, updates)}
            onRemove={() => removeQuestion(active.id)}
            languages={QUESTION_LANGUAGES}
          />
        ) : (
          <ModuleSwitchPrompt
            icon={<Code2 className="size-6" />}
            title={`This is a ${kindLabel} question`}
            description="The Code Editor module composes coding questions. Open the Question Builder module to author this question type."
            actionLabel="Open Question Builder"
            onAction={() => setActiveModule("question")}
          />
        );
      case "question":
        return active.kind === "coding" ? (
          <ModuleSwitchPrompt
            icon={<Braces className="size-6" />}
            title="Coding question detected"
            description="This question is authored in the Code Editor module with problem statement, constraints, code template, and test cases."
            actionLabel="Open Code Editor"
            onAction={() => setActiveModule("code")}
          />
        ) : (
          <QuestionAuthoringEditor
            question={active}
            onChange={(updates) => updateQuestion(active.id, updates)}
            onRemove={() => removeQuestion(active.id)}
          />
        );
      case "markdown":
        return active.kind === "markdown" ? (
          <MarkdownPadModule
            question={active}
            onChange={(updates) => updateQuestion(active.id, updates)}
            onRemove={() => removeQuestion(active.id)}
          />
        ) : (
          <ModuleSwitchPrompt
            icon={<ScrollText className="size-6" />}
            title={`This is a ${kindLabel} question`}
            description="The Markdown Pad module composes markdown challenges with source editor and live preview."
            actionLabel="Convert to Markdown"
            onAction={() => {
              updateQuestion(active.id, { kind: "markdown" });
              setActiveModule("markdown");
            }}
          />
        );
      case "design":
        return active.kind === "design" ? (
          <DesignCanvasModule
            question={active}
            onChange={(updates) => updateQuestion(active.id, updates)}
            onRemove={() => removeQuestion(active.id)}
          />
        ) : (
          <ModuleSwitchPrompt
            icon={<Palette className="size-6" />}
            title={`This is a ${kindLabel} question`}
            description="The Design Canvas module composes UI challenges with brief, deliverables, and specs."
            actionLabel="Convert to Design"
            onAction={() => {
              updateQuestion(active.id, { kind: "design" });
              setActiveModule("design");
            }}
          />
        );
      default:
        return null;
    }
  };

  const canFinish = active != null && questions.every((q) => q.title.trim().length > 0);

  if (!questions.length) {
    return (
      <CompetitionWorkspaceTemplate
        title="Question Builder"
        subtitle={`Compile questions for ${label}`}
        headerIcon={Braces}
        onBack={onBack}
        onPrevious={onBack}
        onNext={onBack}
      >
        <div className="flex h-full min-h-[24rem] flex-col items-center justify-center gap-4 text-center">
          <Braces className="size-10 text-primary-600" aria-hidden />
          <Typography as="h3" className="text-lg font-semibold text-text-primary">
            Build the first challenge for {label}
          </Typography>
          <Typography className="max-w-sm text-sm text-text-secondary">
            Add a coding, quiz, markdown, or design challenge to compile into this stage ladder.
          </Typography>
          <Button onClick={addQuestion}>
            <Plus className="size-4" aria-hidden />
            Add challenge
          </Button>
        </div>
      </CompetitionWorkspaceTemplate>
    );
  }

  return (
    <CompetitionWorkspaceTemplate
      title="Question Builder"
      subtitle={`Compile questions for ${label}`}
      headerIcon={Braces}
      onBack={onBack}
      onPrevious={onBack}
      onNext={finish}
      nextDisabled={!canFinish}
      canvasKey={active.id}
      leftRail={
        <ModuleRail modules={WORKSPACE_MODULES} activeId={activeModule} onSelect={selectModule} />
      }
      rightPanel={
        <ModuleSettingsPanel>
          <QuestionModuleSettings
            question={active}
            onChange={(updates) => updateQuestion(active.id, updates)}
          />
        </ModuleSettingsPanel>
      }
    >
      <div className="flex flex-col gap-3">
        <QuestionBuilderHeader
          currentIndex={questions.findIndex((q) => q.id === active.id)}
          total={questions.length}
          maxQuestions={MAX_QUESTIONS}
          activeId={active.id}
          questions={questions}
          onSelect={setActiveQuestionId}
          onAdd={addQuestion}
          onBack={onBack}
          onDone={finish}
        />
        <div className="flex flex-wrap items-center gap-3">
          <QuestionTabBar
            questions={questions}
            activeId={active.id}
            maxQuestions={MAX_QUESTIONS}
            onSelect={(id) => setActiveQuestionId(id)}
            onAdd={addQuestion}
          />
          <QuestionTypeMenu
            value={QUESTION_KIND_LABELS[active.kind] ?? "coding"}
            onSelect={(label) =>
              updateQuestion(active.id, {
                kind: QUESTION_TYPE_KINDS[label] ?? ("coding" as QuestionKind),
              })
            }
          />
        </div>
        {renderActiveModule()}
      </div>
    </CompetitionWorkspaceTemplate>
  );
}

