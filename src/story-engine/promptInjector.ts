import type { Hub, Cefr } from './types';
import { STORY_HUB_PROFILES } from './hubProfiles';

export interface StoryPromptArgs {
  hub: Hub;
  cefr: Cefr;
  target_skill: string;
  target_ref_ids: string[];
  topic: string;
  characters: string[];
}

/**
 * Prompt chained AFTER buildArcadeSystemPrompt(), BEFORE per-node copy generation.
 * Returns a full JSON contract the model must satisfy.
 */
export function buildStoryEnginePrompt(args: StoryPromptArgs): string {
  const p = STORY_HUB_PROFILES[args.hub];
  return `
STORY ENGINE — CHOOSE YOUR ADVENTURE

Hub: ${args.hub} | CEFR: ${args.cefr} | Topic: ${args.topic}
Cast: ${args.characters.join(', ') || 'narrator only'}
Target skill: ${args.target_skill}
Target refs: ${args.target_ref_ids.join(', ')}

CONSTRAINTS
- Exactly ${p.max_nodes} nodes (branching tree; every path ≤${p.max_nodes} steps).
- Every node has exactly ${p.choices_per_node} choices.
- Exactly one choice per node is pedagogically CORRECT — the others are plausible distractors that practice the same target.
- Narration ≤${p.narration_max_sentences} sentences per node, CEFR ${args.cefr} register.
- Each choice.label MUST use the target skill (a vocab item OR the target grammar form). No generic "yes/no/go left".
- Each choice.target_ref MUST be one of: ${args.target_ref_ids.join(', ')}.
- Correct choices lead to node progression or "end_success". Wrong choices route to "end_retry" (compassionate).
- feedback: 1 short sentence. Compassionate on wrong; celebratory on correct.
- image_prompt per node: single panel, hub style, guard tail (NO TEXT, NO BUBBLES, NO UI), name the cast member.
- image_url MUST be null.

OUTPUT: JSON matching StoryGraph { hub, cefr, title, target_skill, target_ref_ids, start_node, nodes }.
`.trim();
}
