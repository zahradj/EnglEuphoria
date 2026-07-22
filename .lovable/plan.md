## Diagnosis

You already have the scaffolding for exactly this — `src/architect/` ships an "Expert Lesson Architect" with `buildBrainPrompt` (constitution + methodologies + CEFR + Novakid map) and a `runExpertArchitect()` edge-function call. But it is **off by default** (`ARCHITECT_DEFAULT_ENABLED = false`) and it only emits blueprint overrides — it doesn't enforce the 9-step "Chief Curriculum Designer" workflow you described (identity → learning stages → thinking workflow → theme brain → activity/grammar/story rules → self-QA → specialized agents).

That's why lessons feel generic: the deterministic planner runs on a raw seed with no upstream reasoning brain.

## Plan — turn `src/architect/` into the Curriculum Brain

Execute in this order. Each step is a small, isolated change to the existing architect module — no new subsystems, no schema migrations.

### 1. Promote the Architect from optional to default-on
- `src/architect/index.ts`: `ARCHITECT_DEFAULT_ENABLED = true`.
- `src/orchestrator/pipeline.ts`: before `runPlanning()`, always call `runExpertArchitect()` and merge its `BlueprintOverrides` into the seed. On failure, log and fall back — never block generation.

### 2. Rewrite `ARCHITECT_CONSTITUTION` as the Chief Curriculum Designer identity
File: `src/architect/brain/constitution.ts`. Replace with the identity block from your message ("You are the Chief Curriculum Designer for Engleuphoria… your first responsibility is NOT to generate…"). Add explicit "never copy activities from previous lessons; every lesson feels new inside the same structure."

### 3. Add a Learning-Stage Purpose Map
New file: `src/architect/brain/stagePurposes.ts` — exports a `buildStagePurposePrompt(hub)` that lists each stage (Warm-Up → Vocab → Flashcards → Story → Games → Sentence → Homework) with its **purpose sentence**, not its output. Include in `buildBrainPrompt()`.

### 4. Add the Thinking Workflow (chain-of-thought scaffold)
New file: `src/architect/brain/thinkingWorkflow.ts` — a prompt block that forces the architect to answer, silently, the 6 questions before emitting anything:
1. What can children naturally do with this topic?
2. What places fit this topic?
3. What problem could the characters solve?
4. What grammar naturally appears?
5. Which games make sense?
6. How should the lesson end?

Result: `architect-lesson-plan` edge function returns a `reasoning_trace` object stored on `plan.blueprint.reasoning` (not shown to students; usable in QA logs).

### 5. Build the Theme Brain (reusable ingredients)
New file: `src/architect/brain/themeBrain.ts` — a typed registry:
```ts
type ThemeCard = {
  theme: string;
  characters: string[];
  settings: string[];
  objects: string[];
  actions: string[];
  rewards: string[];
};
export const THEME_BRAIN: Record<string, ThemeCard> = { colors: {...}, animals: {...}, food: {...}, space: {...}, school: {...}, family: {...}, weather: {...} };
```
Seed with the 7 themes you listed. `buildBrainPrompt()` injects the matching card so the architect stops inventing settings/objects from scratch.

### 6. Activity Selection Rules
New file: `src/architect/brain/activitySelectionRules.ts`. Encodes:
- Never repeat the same game twice inside a lesson.
- Progression: Recognition → Identification → Decision → Speaking → Communication.
- Prefer physical movement (TPR) when hub=playground.
- Per-theme suggested game names (Color Hunt, Feed the Lion, etc.).

This block chains into `buildBrainPrompt()` and is also mirrored as a HARD validator in `src/activities/validation/activityValidator.ts` (`ACTIVITY_LADDER_VIOLATED`).

### 7. Grammar-from-Communication-Goal Table
New file: `src/architect/brain/grammarFromGoal.ts`. Maps communication goal families → grammar frames:
- `identify` → `It is ___.` / `What is it?`
- `describe` → `It is big/small.`
- `preference` → `I like ___.` / `I don't like ___.`
- `location` → `It is on/under ___.` / `Where is ___?`

The architect MUST pick grammar from this table, not invent. Passed as overrides to the planner.

### 8. Story Design Formula
New file: `src/architect/brain/storyFormula.ts` — the fixed 5-beat arc (Goal → Problem → Adventure → Success → Celebration). Extends the existing `src/agents/storyArchitect/personas/playground.ts` MEET/TRY/WIN by binding beat count = 5 and requiring an explicit `problem` field on every StoryPlan.

### 9. Self-Review QA gate inside the Architect
Extend the edge function `architect-lesson-plan` to run a final `reviewChecklist` pass on its own output before returning:
- Every activity relates to the topic (topic tokens present)
- Story supports the lesson goal (goal phrase appears in ≥1 beat)
- Grammar matches communication goal (from step 7 table)
- Vocab repeated naturally (≥3 exposures per target word)
- Enough speaking opportunities (hub floor)
- Age-appropriate register
- Differs from previous lesson (compare activity-type multiset)

On any NO: the architect regenerates once (max 1 retry). Persisted to `plan.blueprint.reasoning.review`.

### 10. Specialized-agent pipeline (already partially exists — wire it)
The 6-agent pipeline in your message maps to existing modules. Wire the chain explicitly in `src/orchestrator/pipeline.ts`:

```
runExpertArchitect            → Curriculum Agent + Theme Agent
runPlanning                   → learning-goal blueprint
runStoryArchitect (per hub)   → Story Agent
runActivities                 → Game Agent
runVocabImageArchitect        → Image Agent
runQualityControl + runStabilization → QA Agent
```

No new agents needed — just enforce single-responsibility by gating each stage on the previous stage's verdict.

## What the user sees after this ships

- Lesson generation logs show a `reasoning_trace` block (the internal Q&A) for every lesson.
- `plan.blueprint.reasoning.review.pass = true` before publish.
- Playground L1 "Colors" now:
  - Uses `THEME_BRAIN.colors` → Pip + Bella, rainbow hill setting, balloons/kites/crayons as concrete anchors.
  - Grammar locked to `It is ___.` / `What is it?` via step 7.
  - Story has an explicit `problem: "Pip lost the rainbow card"` and a Rainbow Badge reward.
  - Game ladder: Color Hunt (recognition) → Paint the Balloon (identification) → Find the Missing Color (decision) → speaking round.

## Files to create

- `src/architect/brain/stagePurposes.ts`
- `src/architect/brain/thinkingWorkflow.ts`
- `src/architect/brain/themeBrain.ts`
- `src/architect/brain/activitySelectionRules.ts`
- `src/architect/brain/grammarFromGoal.ts`
- `src/architect/brain/storyFormula.ts`

## Files to edit

- `src/architect/brain/constitution.ts` (rewrite identity)
- `src/architect/brain/index.ts` (include new blocks in `buildBrainPrompt`)
- `src/architect/index.ts` (`ARCHITECT_DEFAULT_ENABLED = true`)
- `src/orchestrator/pipeline.ts` (always run architect + gate stages)
- `src/agents/storyArchitect/personas/playground.ts` (bind 5-beat + problem field)
- `src/activities/validation/activityValidator.ts` (`ACTIVITY_LADDER_VIOLATED`)
- edge function `supabase/functions/architect-lesson-plan/index.ts` (self-review + retry)

## Verification

1. Regenerate Playground L1 Colors. Check `plan.blueprint.reasoning.review.pass === true`.
2. Confirm all activities pull from `THEME_BRAIN.colors` (balloon/kite/crayon, not bare "red").
3. Confirm grammar frame is `It is ___.` on every dialogue line.
4. Regenerate the same lesson twice — architect must produce different activity-type multisets (novelty guard).
5. Run existing QA + stabilization: both must still pass.

Approve and I'll implement in the order above, one file per step, verifying at each stage.
