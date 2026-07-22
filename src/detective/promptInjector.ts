import type { Hub, Cefr } from './types';
import { DETECTIVE_HUB_PROFILES } from './hubProfiles';

export interface DetectivePromptArgs {
  hub: Hub;
  cefr: Cefr;
  target_skill: string;
  target_ref_ids: string[];
  topic: string;
  setting: string;
  characters?: string[];
}

/** Chained AFTER buildArcadeSystemPrompt(), BEFORE JSON generation. */
export function buildDetectivePrompt(args: DetectivePromptArgs): string {
  const p = DETECTIVE_HUB_PROFILES[args.hub];
  return `
DETECTIVE MYSTERY ENGINE — QUESTION-DRIVEN INFERENCE

Hub: ${args.hub} | CEFR: ${args.cefr} | Topic: ${args.topic}
Setting: ${args.setting}
Cast: ${(args.characters ?? []).join(', ') || 'suspects only'}
Target skill: ${args.target_skill}
Target refs: ${args.target_ref_ids.join(', ')}

CONSTRAINTS
- Exactly ${p.suspects} suspects. Exactly ONE has is_culprit=true (others innocent but suspicious).
- Every suspect: id, name, role, alibi (≤2 sentences), image_prompt, image_url=null, is_culprit.
- Exactly ${p.question_pool_size} pre-written questions in question_pool.
- Allowed question kinds: ${p.allowed_kinds.join(', ')}. Every question MUST end with '?'.
- Each question practices the target grammar/vocab form (target_ref ∈ ${args.target_ref_ids.join(', ')}).
- Each question.reveals = ONE useful clue. Together the clues MUST uniquely identify the culprit.
- question_budget = ${p.question_budget}.
- briefing ≤${p.briefing_max_sentences} sentences at CEFR ${args.cefr} register.
- All image_prompt: single panel, hub style, guard tail (NO TEXT, NO BUBBLES, NO UI). image_url=null.
- epilogue.win: celebratory 1 sentence. epilogue.lose: compassionate 1 sentence.

OUTPUT: JSON matching DetectiveCase.
`.trim();
}
