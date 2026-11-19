/**
 * useDuelQuiz — client state machine for a duel quiz run.
 *
 * Owns the current question index, the in-flight/locked answer for the current
 * question, and a per-question countdown timer. Answers are graded by the backend.
 * Once answered, the participant can immediately advance to the next question
 * without waiting for the timer to expire. If the timer expires before an answer
 * is submitted, it automatically moves to the next question.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  DuelQuiz,
  DuelState,
  ParticipantAnswer,
} from "@/modules/Competition/types/duelQuiz";
import type { TopicBattleAnswerResult } from "@/modules/Competition/types/integrity";

const DEFAULT_QUESTION_SECONDS = 60;

/**
 * Submits one answer and resolves with the server's verdict.
 */
export type SubmitAnswerFn = (
  questionId: string,
  answer: ParticipantAnswer,
  latencyMs: number,
) => Promise<TopicBattleAnswerResult>;

function formatTimeLeft(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export interface QuestionSubmissionRecord {
  questionId: string;
  answer: ParticipantAnswer;
  isAnswered: boolean;
  result: boolean | null;
  earnedPoints: number;
}

export interface QuestionReviewItem {
  id: string;
  index: number;
  title: string;
  kind: string;
  points: number;
  isAnswered: boolean;
  result: boolean | null;
  earnedPoints: number;
  answer: ParticipantAnswer | null;
}

function emptyState(totalQuestions: number): DuelState {
  return {
    currentQuestionIndex: 0,
    answer: null,
    isAnswered: false,
    isSubmitting: false,
    lastResult: null,
    score: 0,
    rank: 1,
    correctCount: 0,
    totalQuestions,
  };
}

export function useDuelQuiz(
  quiz: DuelQuiz | null,
  durationSeconds?: number,
  submitAnswer?: SubmitAnswerFn,
) {
  const totalQuestions = quiz?.questions.length ?? 0;
  const [state, setState] = useState<DuelState>(() => emptyState(totalQuestions));
  const [submissions, setSubmissions] = useState<Record<string, QuestionSubmissionRecord>>({});

  const currentQuestion = quiz?.questions[state.currentQuestionIndex];

  // Each question respects the host's configured timeLimitSeconds, falling back
  // to durationSeconds (if small) or DEFAULT_QUESTION_SECONDS.
  const questionTotalSeconds = useMemo(() => {
    if (currentQuestion?.timeLimitSeconds && currentQuestion.timeLimitSeconds > 0) {
      return currentQuestion.timeLimitSeconds;
    }
    if (durationSeconds && durationSeconds > 0 && durationSeconds <= 300) {
      return durationSeconds;
    }
    return DEFAULT_QUESTION_SECONDS;
  }, [currentQuestion?.timeLimitSeconds, durationSeconds]);

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(questionTotalSeconds);

  // When the current question was first shown.
  const questionShownAt = useRef<number>(Date.now());
  const submissionToken = useRef(0);
  const inFlight = useRef(false);

  const finished = totalQuestions > 0 && state.currentQuestionIndex >= totalQuestions;

  // Reset when quiz changes
  useEffect(() => {
    setState(emptyState(totalQuestions));
    setSubmissions({});
  }, [totalQuestions]);

  // Reset question timer and shown timestamp when question index changes
  useEffect(() => {
    setTimeLeftSeconds(questionTotalSeconds);
    questionShownAt.current = Date.now();
  }, [state.currentQuestionIndex, questionTotalSeconds]);

  const advance = useCallback(() => {
    inFlight.current = false;
    submissionToken.current += 1;
    setState((prev) => {
      const nextIndex = prev.currentQuestionIndex + 1;
      const targetQ = quiz?.questions[nextIndex];
      const saved = targetQ ? submissions[targetQ.id] : undefined;
      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        answer: saved ? saved.answer : null,
        isAnswered: Boolean(saved?.isAnswered),
        isSubmitting: false,
        lastResult: saved ? saved.result : null,
      };
    });
    questionShownAt.current = Date.now();
  }, [quiz?.questions, submissions]);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.currentQuestionIndex <= 0) return prev;
      const prevIndex = prev.currentQuestionIndex - 1;
      const targetQ = quiz?.questions[prevIndex];
      const saved = targetQ ? submissions[targetQ.id] : undefined;
      return {
        ...prev,
        currentQuestionIndex: prevIndex,
        answer: saved ? saved.answer : null,
        isAnswered: Boolean(saved?.isAnswered),
        isSubmitting: false,
        lastResult: saved ? saved.result : null,
      };
    });
    submissionToken.current += 1;
    inFlight.current = false;
    questionShownAt.current = Date.now();
  }, [quiz?.questions, submissions]);

  // Per-question countdown timer
  useEffect(() => {
    if (!quiz || finished) {
      return;
    }
    const timer = setInterval(() => {
      setTimeLeftSeconds((seconds) => {
        if (seconds <= 1) {
          clearInterval(timer);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz, finished, state.currentQuestionIndex]);

  // When question timer expires, lock the question (no auto-advance).
  // The participant navigates manually via Next / Previous buttons.
  // timeLeftSeconds === 0 is surfaced to the UI to disable the submit button.
  const timedOut = !finished && timeLeftSeconds <= 0;

  const doSubmit = useCallback(
    async (answer: ParticipantAnswer) => {
      if (!quiz || !submitAnswer || inFlight.current) {
        return;
      }
      const question = quiz.questions[state.currentQuestionIndex];
      if (!question) {
        return;
      }

      inFlight.current = true;
      const token = ++submissionToken.current;
      const latencyMs = Date.now() - questionShownAt.current;

      setState((prev) => ({ ...prev, answer, isSubmitting: true }));

      try {
        const result = await submitAnswer(question.id, answer, latencyMs);
        if (token !== submissionToken.current) {
          return;
        }

        // Store into per-question records for review & persistence across navigation
        const record: QuestionSubmissionRecord = {
          questionId: question.id,
          answer,
          isAnswered: true,
          result: result.correct,
          earnedPoints: result.earnedPoints,
        };
        setSubmissions((prev) => ({ ...prev, [question.id]: record }));

        setState((prev) => {
          if (prev.currentQuestionIndex !== state.currentQuestionIndex) {
            return prev;
          }
          return {
            ...prev,
            isAnswered: true,
            isSubmitting: false,
            lastResult: result.correct,
            score: result.totalPoints,
            correctCount: result.correctCount,
          };
        });
      } catch {
        if (token !== submissionToken.current) {
          return;
        }
        setState((prev) => ({ ...prev, isSubmitting: false }));
      } finally {
        if (token === submissionToken.current) {
          inFlight.current = false;
        }
      }
    },
    [quiz, submitAnswer, state.currentQuestionIndex],
  );

  const submit = useCallback(
    (answer: ParticipantAnswer) => {
      void doSubmit(answer);
    },
    [doSubmit],
  );

  const reset = useCallback(() => {
    submissionToken.current += 1;
    setState(emptyState(totalQuestions));
    setSubmissions({});
    setTimeLeftSeconds(questionTotalSeconds);
    questionShownAt.current = Date.now();
  }, [totalQuestions, questionTotalSeconds]);

  const timeLeft = useMemo(() => formatTimeLeft(timeLeftSeconds), [timeLeftSeconds]);

  const questionReviews = useMemo<QuestionReviewItem[]>(() => {
    if (!quiz) return [];
    return quiz.questions.map((q, idx) => {
      const sub = submissions[q.id];
      return {
        id: q.id,
        index: idx,
        title: q.text,
        kind: q.kind,
        points: q.points || 100,
        isAnswered: Boolean(sub?.isAnswered),
        result: sub?.result ?? null,
        earnedPoints: sub?.earnedPoints ?? 0,
        answer: sub?.answer ?? null,
      };
    });
  }, [quiz, submissions]);

  return {
    state,
    timeLeft,
    timeLeftSeconds,
    totalTimeSeconds: questionTotalSeconds,
    timedOut,
    submissions,
    questionReviews,
    submitAnswer: submit,
    advance,
    goBack,
    reset,
  };
}
