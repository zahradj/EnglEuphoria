---
name: Pre-A1 Non-Reader Blueprint
description: Pre-A1 (any hub) enforces non-reader contract — forbidden reading/writing activities, per-lesson speaking floor + TPR minimum, mapped from 6-lesson unit blueprint
type: feature
---

# Pre-A1 Non-Reader Blueprint

Applies whenever `cefr === 'Pre-A1'` regardless of hub. Owned by `src/planning/prea1Blueprint.ts` (source of truth) + `src/qa/validators/prea1Blueprint.ts` (QA gate) + `src/activities/selection/fitScorer.ts` (selection guard) + prompt chain via `buildPrea1Directive()` in `src/orchestrator/promptChain.ts`.

## Contract

- **6-lesson unit arc** (`PREA1_UNIT_BLUEPRINT`): discovery → expansion → extension → practice → storybook → review/mastery. Each spec carries `speaking_floor`, `tpr_min`, `theme_anchor`.
- **Forbidden activities** (`PREA1_FORBIDDEN_ACTIVITIES`): `fill_blank`, `reading`, `dictation`, `dictation_builder`, `spelling`, `writing`, `error_correction`, `mcq_text_only`, `L1`, any text-first type.
- **Text-density rule:** every `content.{prompt,text,sentence,question,instruction}` string MUST be ≤5 words. Longer prose is a `PREA1_PRINTED_PROSE_LEAK` (non-readers cannot decode).
- **Speaking types counted:** echo, mimic, point_and_say, song_gesture, speaking_mission, shadowing, repeat_after_audio.
- **TPR types counted:** tpr_action, song_gesture, syllable_clap.
- **Lesson-kind → number map:** discovery=1, expansion=2, extension=3, practice=4, storybook=5, review/mastery_quiz=6.

## Enforcement layers (all HARD, auto_repairable)

| Layer | Where | Codes |
|---|---|---|
| Prompt | `buildPrea1Directive()` prepended in `composePromptChain()` | — |
| Selection | `fitScorer` returns `-Infinity` w/ `prea1_non_reader_forbidden` | — |
| QA | `validatePrea1BlueprintQA` | `PREA1_FORBIDDEN_ACTIVITY`, `PREA1_SPEAKING_FLOOR_UNMET`, `PREA1_TPR_MIN_UNMET`, `PREA1_PRINTED_PROSE_LEAK` |
| Repair | `repairDispatcher` ROUTING → `activity_repair`; `buildRepairPrompt` appends binding Pre-A1 contract when any `PREA1_*` code is present | (same codes) |

## Tests

- `src/qa/__tests__/prea1Blueprint.test.ts` — 12 tests (exports, directive, selector, QA no-op at A1+, forbidden block, speaking floor, TPR min, happy path, printed-prose block + happy).
- `src/qa/__tests__/prea1Pipeline.test.ts` — end-to-end `runQualityControl → decidePublish → dispatchRepairs` routing verified.
