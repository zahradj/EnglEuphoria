import type { Hub, Cefr } from './types';
import { ESCAPE_HUB_PROFILES } from './hubProfiles';

export interface EscapePromptArgs {
  hub: Hub;
  cefr: Cefr;
  target_skill: string;
  target_ref_ids: string[];
  topic: string;
  setting: string;
  characters: string[];
}

/** Chained AFTER buildArcadeSystemPrompt(), BEFORE JSON generation. */
export function buildEscapeRoomPrompt(args: EscapePromptArgs): string {
  const p = ESCAPE_HUB_PROFILES[args.hub];
  return `
ESCAPE ROOM ENGINE — LANGUAGE PUZZLES

Hub: ${args.hub} | CEFR: ${args.cefr} | Topic: ${args.topic}
Setting: ${args.setting} | Cast: ${args.characters.join(', ') || 'narrator only'}
Target skill: ${args.target_skill}
Target refs: ${args.target_ref_ids.join(', ')}

CONSTRAINTS
- Exactly ${p.doors} doors. Each door practices the target skill.
- Allowed puzzle kinds: ${p.allowed_kinds.join(', ')}.
- Max ${p.max_tokens_per_puzzle} tokens/letters per puzzle (CEFR ${args.cefr}).
- Every puzzle.target_ref MUST be one of: ${args.target_ref_ids.join(', ')}.
- hint: compassionate, 1 sentence, points at the rule/pattern (NOT the answer).
- solve_feedback: 1 celebratory sentence.
- door_label + door_narration: immersive, thematically consistent with "${args.setting}".
- image_prompt: single panel, hub style, guard tail (NO TEXT, NO BUBBLES, NO UI). Name any cast used.
- image_url MUST be null.
- Kind-specific:
    unscramble: scrambled letters MUST be a permutation of answer.
    cloze:      answer MUST appear in options; sentence contains exactly one "___".
    order:      tokens = permutation of answer (array).
    odd_one_out:answer MUST be in items; reason explains linguistically.
    riddle:     3–4 clues, answer MUST be in options.
- final_reward: 1 celebratory sentence + image_prompt of the reward scene; image_url null.

OUTPUT: JSON matching EscapeRoom { hub, cefr, title, target_skill, target_ref_ids, doors[], final_reward }.
`.trim();
}
