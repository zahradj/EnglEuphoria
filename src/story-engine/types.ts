/**
 * Story Engine — Choose Your Adventure.
 *
 * Reusable AI-native slot mounted by any hub. Bound to a ReinforcementTarget
 * (vocab/grammar) so branching choices are LINGUISTIC decisions, not cosmetic.
 *
 * Non-negotiable bindings (senior-ai-edtech-architect + esl-game-studio):
 *   - Every node's `choices` MUST practice the target skill (vocab pick,
 *     grammar-form pick, function pick).
 *   - Deterministic node ordering; AI generates copy, engine wires the graph.
 *   - Hub caps: Playground 4 nodes, Academy 6, Success 6.
 *   - image_url is null at generation time; visuals via image_prompt only.
 */

export type Hub = 'playground' | 'academy' | 'success';
export type Cefr = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface StoryChoice {
  id: string;
  /** Learner-facing label — the linguistic pick. */
  label: string;
  /** Which target this choice practices (vocab word or grammar form). */
  target_ref: string;
  /** Next node id, or 'end_success' | 'end_retry'. */
  next: string;
  /** True = pedagogically correct pick; false = plausible distractor. */
  correct: boolean;
  /** Compassionate micro-feedback shown after selection. */
  feedback: string;
}

export interface StoryNode {
  id: string;
  /** Scene narration (2–4 sentences, CEFR-appropriate). */
  narration: string;
  /** Cast member name from CAST_ROSTER (empty = narrator only). */
  character?: string;
  /** Image prompt following V0 guard tail. */
  image_prompt: string;
  /** null at generation; populated post-image-gen. */
  image_url: string | null;
  choices: StoryChoice[];
}

export interface StoryGraph {
  hub: Hub;
  cefr: Cefr;
  title: string;
  /** Anchor target driving branching (e.g. past-simple, food-vocab). */
  target_skill: string;
  target_ref_ids: string[];
  start_node: string;
  nodes: Record<string, StoryNode>;
}

export interface StoryEvent {
  node_id: string;
  choice_id: string;
  correct: boolean;
  ms_elapsed: number;
}

export interface StoryEngineSlotProps {
  hub: Hub;
  cefr: Cefr;
  lessonId?: string;
  graph: StoryGraph;
  onEvent?: (e: StoryEvent) => void;
  onComplete?: (summary: {
    correct: number;
    total: number;
    ms_elapsed: number;
    events: StoryEvent[];
    ending: 'success' | 'retry';
  }) => void;
}
