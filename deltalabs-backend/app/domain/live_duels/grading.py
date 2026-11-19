"""Server-side grading for Live Duel answers.

Mirrors `gradeQuestion` / `normalizeText` in
`deltalabs-frontend/src/modules/Competition/types/duelQuiz.ts` so a participant's
objective answer (MCQ, True/False, fill-blank, matching, ordering) is scored on
the authoritative authored payload. Subjective kinds (writing / coding /
markdown / design) are recorded for review, never auto-scored.
"""

from __future__ import annotations

import re
from typing import Any

_NOT_GRADED = None


def _normalize(value: str) -> str:
    """Forgiving text normalization (`normalizeText` in the duel quiz types)."""
    return re.sub(r"\s+", " ", value.strip().lower())


def _to_bool(val: Any) -> bool | None:
    """Safely convert any representation of boolean to bool."""
    if val is None:
        return None
    if isinstance(val, bool):
        return val
    s = str(val).strip().lower()
    if s in ("true", "1", "yes", "t"):
        return True
    if s in ("false", "0", "no", "f"):
        return False
    return bool(val)


def grade_live_duel_answer(question: dict[str, Any], answer: dict[str, Any]) -> bool | None:
    """Grade an objective-kind answer.

    Matches the client duel-quiz semantics:

    - `multiple_choice` grants when the chosen `optionId` equals `mcqCorrectId`
      and a correct answer was authored (empty correct id never scores).
    - `true_false` compares the boolean `value` to `tfAnswer`.
    - `fill_blank` compares every blank (multi-blank `fillAnswers`) in order, or
      falls back to the legacy whole-sentence `fillExpected`; a question with no
      authored answer key is not auto-graded.
    - `matching` requires every pair to map to its authored `answerId`.
    - `ordering` requires the exact authored item order.
    - writing / coding / markdown / design return `None` (recorded for review).

    Returns `True`/`False` when graded, `None` when not auto-graded.
    """
    kind = question.get("kind", "multiple_choice")

    if kind == "multiple_choice":
        correct_id = str(question.get("mcqCorrectId") or question.get("mcq_correct_id") or "").strip()
        opts = question.get("mcqOptions") or question.get("mcq_options") or []
        if not correct_id and opts:
            for opt in opts:
                if isinstance(opt, dict) and (opt.get("is_correct") or opt.get("isCorrect") or opt.get("correct")):
                    correct_id = str(opt.get("id") or "").strip()
                    break

        if not correct_id:
            return _NOT_GRADED

        submitted_id = str(answer.get("optionId") or answer.get("option_id") or "").strip()
        if not submitted_id:
            return _NOT_GRADED

        # Direct ID match
        if submitted_id == correct_id:
            return True

        # Fallback: check if the chosen option matches the correct option's label or text
        if opts:
            chosen_opt = next((o for o in opts if isinstance(o, dict) and str(o.get("id", "")).strip() == submitted_id), None)
            target_opt = next((o for o in opts if isinstance(o, dict) and str(o.get("id", "")).strip() == correct_id), None)
            if chosen_opt and target_opt:
                chosen_text = _normalize(str(chosen_opt.get("text") or ""))
                target_text = _normalize(str(target_opt.get("text") or ""))
                if chosen_text and target_text and chosen_text == target_text:
                    return True
                chosen_label = str(chosen_opt.get("label") or "").strip().lower()
                target_label = str(target_opt.get("label") or "").strip().lower()
                if chosen_label and target_label and chosen_label == target_label:
                    return True

        return False

    if kind == "true_false":
        raw_expected = question.get("tfAnswer") if "tfAnswer" in question else question.get("tf_answer")
        expected_bool = _to_bool(raw_expected)
        submitted_bool = _to_bool(answer.get("value"))

        if expected_bool is None or submitted_bool is None:
            return _NOT_GRADED

        return submitted_bool == expected_bool

    if kind == "fill_blank":
        answers = question.get("fillAnswers") or question.get("fill_answers") or []
        if answers:
            submitted = answer.get("answers")
            if not isinstance(submitted, list) or len(submitted) != len(answers):
                return _NOT_GRADED
            return all(
                _normalize(str(value or "")) == _normalize(str(expected or ""))
                for value, expected in zip(submitted, answers)
            )
        expected = _normalize(str(question.get("fillExpected") or question.get("fill_expected") or ""))
        if not expected:
            return _NOT_GRADED
        return _normalize(str(answer.get("text") or "")) == expected

    if kind == "matching":
        mapping = answer.get("map")
        if not isinstance(mapping, dict):
            return _NOT_GRADED
        pairs = question.get("matchingPairs") or question.get("matching_pairs") or []
        if not pairs:
            return _NOT_GRADED
        return all(
            str(mapping.get(str(pair.get("id") or ""))) == str(pair.get("answerId") or pair.get("answer_id") or "")
            for pair in pairs
        )

    if kind == "ordering":
        items = question.get("orderingItems") or question.get("ordering_items") or []
        authored = [str(item.get("id")) for item in items if isinstance(item, dict) and item.get("id")]
        proposed = [str(x) for x in (answer.get("itemIds") or answer.get("item_ids") or []) if x]
        if not proposed or not authored:
            return _NOT_GRADED
        return authored == proposed

    return _NOT_GRADED