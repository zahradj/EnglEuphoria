/**
 * castPicker — deterministic Playground cast selection for the media planner.
 *
 * - `pickLeadCharacter` locks ONE mascot per unit (stable hash of theme +
 *   lessonKind), so every storybook page, scene image, and action vocab card
 *   in the unit renders the same face.
 * - `pickCharacterForAction` round-robins per word inside a lesson, again
 *   deterministic, so action vocab varies but is reproducible.
 * - `characterStyleBlock` returns the locked visual descriptor to prepend to
 *   every image prompt so the model stays on-model.
 */

import {
  PLAYGROUND_CAST_PRESETS,
  type PlaygroundCastPreset,
} from '@/constants/playgroundCastPresets';

function hash(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export interface PickLeadArgs {
  unitTheme: string;
  lessonKind?: string | null;
  /** Optional extra seed (e.g. lesson id) to shift the pick. */
  seed?: string;
}

export function pickLeadCharacter(args: PickLeadArgs): PlaygroundCastPreset {
  const key = `${args.unitTheme || 'unit'}::${args.lessonKind ?? 'any'}::${args.seed ?? ''}`;
  const idx = hash(key) % PLAYGROUND_CAST_PRESETS.length;
  return PLAYGROUND_CAST_PRESETS[idx];
}

/** Deterministic per-word pick, biased so the lead character handles its own
 *  signature words and the rest of the cast covers the others. */
export function pickCharacterForAction(
  word: string,
  lead: PlaygroundCastPreset,
  seed = '',
): PlaygroundCastPreset {
  const idx = hash(`${word.toLowerCase()}::${seed}`) % PLAYGROUND_CAST_PRESETS.length;
  const pick = PLAYGROUND_CAST_PRESETS[idx];
  // Bias: 40% of the time use the lead so the unit feels character-driven.
  return hash(word + seed) % 5 < 2 ? lead : pick;
}

/** Age-stage descriptor — characters grow up with the learner's CEFR.
 *  Playground span: pre-A1 (toddler) → B1 (preteen). Same identity, older body. */
export function cefrAgeStage(cefr?: string | null): { label: string; descriptor: string } {
  const c = (cefr || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (c.startsWith('prea')) return {
    label: 'toddler',
    descriptor: 'AGE STAGE: toddler (~3–4 yrs). Extra-chubby chibi, head ~1.4× body, very short stubby limbs, baby-soft features, simplest outfit.',
  };
  if (c === 'a1') return {
    label: 'little kid',
    descriptor: 'AGE STAGE: little kid (~5–6 yrs). Chibi, head ~1.2× body, rounder cheeks, playful pose, classic signature outfit.',
  };
  if (c === 'a2') return {
    label: 'child',
    descriptor: 'AGE STAGE: school child (~7–8 yrs). Slightly taller, head and body more even, confident stance, signature outfit refined with a small accessory.',
  };
  if (c === 'b1') return {
    label: 'preteen',
    descriptor: 'AGE STAGE: preteen (~9–11 yrs). Slimmer, longer limbs, head ~0.9× body, mature confident expression, sportier upgraded outfit keeping iconic colors and accessory.',
  };
  return { label: 'kid', descriptor: 'AGE STAGE: kid. Standard chibi proportions, signature outfit.' };
}

/** Visual descriptor block — paste into every image prompt that includes the
 *  character. Pass `cefr` so the character ages up across the Playground ladder. */
export function characterStyleBlock(c: PlaygroundCastPreset, cefr?: string | null): string {
  const stage = cefrAgeStage(cefr);
  return `Character "${c.name}" — locked visual blueprint: ${c.visual_blueprint} ${stage.descriptor}`;
}

export type LeadCharacterRef = {
  name: string;
  visual_blueprint: string;
  voice_id: string;
  age_stage?: string;
};

export function toLeadRef(c: PlaygroundCastPreset, cefr?: string | null): LeadCharacterRef {
  return {
    name: c.name,
    visual_blueprint: c.visual_blueprint,
    voice_id: c.voice_id,
    age_stage: cefrAgeStage(cefr).label,
  };
}
