// Early-Reader Track gate.
// Decides whether a learner needs decoding-first phonics regardless of hub.
//
// Rule (auto, no opt-in):
//  • Playground → always early-reader (the spine of the hub).
//  • Academy   → early-reader at Pre-A1 / A1 only.
//  • Success   → early-reader at Pre-A1 / A1 only (adult absolute beginners).
//
// Consumed by:
//  • pronunciation/layerSelector — unlocks standalone phonics for Academy/Success early readers.
//  • lesson player              — picks the hub-native PhonicsCard skin.
//  • orchestrator/promptChain   — appends an "early reader" pedagogical addendum.

import type { Cefr, Hub } from '@/governance/types';

export interface EarlyReaderContext {
  hub: Hub;
  cefr: Cefr;
}

export function isEarlyReader({ hub, cefr }: EarlyReaderContext): boolean {
  if (hub === 'playground') return true;
  return cefr === 'Pre-A1' || cefr === 'A1';
}

export type PhonicsFraming = 'playful_chant' | 'codebreaker' | 'professional_clarity';

export function phonicsFramingFor(hub: Hub): PhonicsFraming {
  if (hub === 'academy') return 'codebreaker';
  if (hub === 'success') return 'professional_clarity';
  return 'playful_chant';
}

/**
 * Prompt addendum injected into the activity-generation chain so the model
 * respects the early-reader gate at generation time (not only at QA time).
 *
 * - Eligible early readers → activate the unified PhonicsCard suite.
 * - Non-eligible learners → forbid decoding-first activities; require
 *   intelligibility drills bound to the lesson's target vocabulary.
 */
export function buildPhonicsGatePromptAddendum(hub: Hub, cefr: Cefr): string {
  const eligible = isEarlyReader({ hub, cefr });
  if (eligible) {
    const framing = phonicsFramingFor(hub);
    return [
      `[PHONICS GATE — EARLY READER ELIGIBLE (${hub}/${cefr})]`,
      `Decoding-first phonics is ALLOWED. Prefer the unified PhonicsCard suite`,
      `(phonics_card, phoneme_isolation, blending_animation, minimal_pair_tap,`,
      `grapheme_hunt, decoding_probe). Framing: ${framing}.`,
      hub === 'playground'
        ? `Use claymorphic, chant-driven, mascot-led copy (Pip demonstrates mouth shape).`
        : hub === 'academy'
          ? `Frame as "decode like a code-breaker" — never nursery chants. IPA optional.`
          : `Frame as professional clarity (names, addresses, signs, emails). IPA expected.`,
    ].join(' ');
  }
  return [
    `[PHONICS GATE — DECODING FORBIDDEN (${hub}/${cefr})]`,
    `Do NOT emit phonics_card, phoneme_isolation, blending_animation, minimal_pair_tap,`,
    `grapheme_hunt, decoding_probe, phonics_bingo, blending, syllable_counting, or trace_letter.`,
    `If you need to work on pronunciation, use INTELLIGIBILITY drills bound to the lesson's`,
    `target vocabulary instead: minimal_pairs (≥2 lesson vocab words), shadowing/echo_repetition`,
    `of a lesson chunk, or pronunciation_tap on the stressed syllable of a target word.`,
    `Treating teens or adults as non-readers is age-inappropriate above A1.`,
  ].join(' ');
}

