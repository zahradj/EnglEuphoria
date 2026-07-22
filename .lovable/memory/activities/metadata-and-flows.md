---
name: Activity Metadata & ESA Flows (Cycle 4)
description: Every activity carries cognitive_class/esa_phases/target_skills/pedagogy_rule via src/activities/catalog/activityAnnotations.ts. Hard analytical lockout at Pre-A1/A1 in fitScorer + QA. ESA flow router in src/activities/flows/. SRS triggers in src/memory/triggers.ts.
type: feature
---

# Activity Metadata Framework (Cycle 4)

Side-table at `src/activities/catalog/activityAnnotations.ts` annotates EVERY `ActivityType` with:

- `cognitive_class`: `input_based` | `guided_output` | `output_based` | `analytical`
- `esa_phases`: subset of `engage | study | activate`
- `target_skills`: phonics/vocabulary/syntax/grammar/listening/speaking/reading/writing/pragmatics/discourse
- `pedagogy_rule`: `here_and_now` | `ssp` | `substitution_table` | `output_practice` | `explicit_rule` | `communicative` | `spaced_retrieval` | `hook` | `reflective_practice`
- `ai_triggers`: optional, e.g. `high_speaking_anxiety`, `boomerang_study`, `boomerang_activate`, `srs_overdue`

## Hard lockout rule

`isAnalyticalLocked(type, cefr)` → true for any analytical activity at Pre-A1 / A1.
Enforced in two places:
1. `src/activities/selection/fitScorer.ts` — reject before scoring (`reason: 'analytical_locked_below_a2'`).
2. `src/qa/validators/activityMetadata.ts` — HARD QA gate `ACTIVITY_ANALYTICAL_AT_PREA1` (defense-in-depth).

## ESA flows

`src/activities/flows/esaFlows.ts` exposes three flow descriptors: `STRAIGHT_ARROW` (Pre-A1/A1), `BOOMERANG` (A2/B1 — speak→study→speak), `PATCHWORK` (B2/C1 or unit consolidation).
`src/activities/flows/selectFlow.ts` is the deterministic router.

## Prompt injection

`activityPromptBuilder.ts` emits an `## ACTIVITY METADATA` block per activity with cognitive_class / esa_phases / target_skills / pedagogy_rule and a class-specific guidance line (silent period vs scaffold vs explicit rule vs free production).

## SRS triggers

`src/memory/triggers.ts` — pure `onActivityFailure(ctx) → ScheduledReview[]` with the SM-2+ ladder (2/4/8/16 days). Re-deploy recipes:
- `sentence_builder`/`chunk_builder` fail → `matching` + `pronunciation` per vocab item
- analytical fail at ≥A2 → `substitution_drill` + `grammar_sort`
- analytical fail at ≤A1 → promote to `substitution_drill` + `sentence_builder` (no analytical redeploy)
- phonics fail → `rhyme_match` + `decode_the_word`
- speaking fail → `echo_repetition` + `chunk_builder`
- recognition fail → `matching`

Exported from `@/memory` as `onActivityFailure`. Persistence happens in the caller (intelligence-observer / runMemoryOptimization). Module is pure.
