// Lesson Design Workflow — the 7 deterministic steps every lesson must follow.
// The Architect executes these in order; skipping or reordering = rejection.

export const DESIGN_WORKFLOW_STEPS = [
  'understand_topic',
  'determine_communication_goal',
  'choose_grammar',
  'design_mission',
  'design_story',
  'choose_games',
  'generate_lesson',
] as const;
export type DesignWorkflowStep = typeof DESIGN_WORKFLOW_STEPS[number];

export const DESIGN_WORKFLOW_PROMPT = `
## LESSON DESIGN WORKFLOW (binding — execute in this exact order)

You are NOT allowed to emit lesson JSON until steps 1–6 are complete. Each
step feeds the next. Expose your answers on \`blueprint.design_workflow\`
so downstream engines and QA can verify traceability.

**Step 1 — Understand today's topic.**
Name the topic in one concrete sentence. List the 4–6 core objects/actions
it contains (pull from the Theme Brain when available). No abstractions.

**Step 2 — Determine today's communication goal.**
Write ONE observable Can-Do micro-task the learner will perform by lesson end
(e.g. "Name four colors of objects in the room"). Must be testable in ≤30s.

**Step 3 — Choose today's grammar.**
Pick EXACTLY ONE sentence frame from the Grammar-from-Goal table that serves
the Step 2 goal AND respects the CEFR ceiling. Lock the frame verbatim; no
variants, no drift. All dialogue lines downstream must match it.

**Step 4 — Design today's mission.**
State the concrete mission the learner completes using the Step 3 frame with
the Step 1 objects. Include: the mission verb, the reward from the Theme
Brain, and the pass condition (what proves success).

**Step 5 — Design today's story.**
Apply the 5-beat Story Formula (Goal → Problem → Adventure → Success →
Celebration). The Problem must block the Step 4 mission. The Adventure must
use the Step 3 frame with the Step 1 objects. The Celebration = Step 4 reward.

**Step 6 — Choose today's games.**
Walk the Activity Ladder (Recognition → Identification → Decision → Speaking
→ Communication). Pick one mechanic per rung that reinforces the Step 3
frame + Step 1 objects. No repeats. Every target word must appear in ≥2 games.

**Step 7 — Generate lesson.**
ONLY NOW emit the blueprint JSON. Every slide must trace back to a step above
via \`blueprint.design_workflow.step_bindings\`. Any slide that does not bind
to a step is invalid.

Emit \`design_workflow\` with fields:
{ topic, communication_goal, grammar_frame, mission, story, games[], step_bindings }
`.trim();
