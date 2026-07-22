// Derives the per-lesson PronunciationFocus from planner+governance state.
// This is the engine that powers Layer 1 (integrated support).

import type { LessonPlan } from '@/planning/types';
import type { LessonState } from '@/governance/types';
import { CEFR_PRON_PROFILES } from './data/cefrPronProfiles';
import { focusFromGrammarTargets } from './data/grammarPronPatterns';
import type { PronunciationFocus } from './types';

export function derivePronunciationFocus(
  plan: LessonPlan,
  state: LessonState = plan.lesson_state,
): PronunciationFocus {
  const cefrProfile = CEFR_PRON_PROFILES[state.cefr];
  const fromGrammar = focusFromGrammarTargets(state.grammar.target_grammar);

  const base: PronunciationFocus = fromGrammar ?? {
    pronunciation_focus: `Clarity and rhythm for "${plan.blueprint.theme}"`,
    target_sounds: [],
    stress_patterns: [],
    intonation_patterns: [],
    connected_speech_targets: [],
    common_pronunciation_errors: [],
  };

  // Vocab-driven stress hints — multi-syllable target words get a stress mark.
  const stressFromVocab = plan.blueprint.target_vocab
    .filter((w) => syllableCount(w) >= 3)
    .slice(0, cefrProfile.max_target_sounds_per_lesson)
    .map((w) => stressMark(w));

  // Connected speech only if CEFR allows.
  const connected = cefrProfile.allow_connected_speech
    ? base.connected_speech_targets
    : [];

  // Intonation only if CEFR allows.
  const intonation = cefrProfile.allow_advanced_intonation
    ? base.intonation_patterns
    : base.intonation_patterns.filter((p) => /rising|falling/i.test(p));

  return {
    ...base,
    stress_patterns: [...new Set([...base.stress_patterns, ...stressFromVocab])],
    connected_speech_targets: connected,
    intonation_patterns: intonation,
    target_sounds: base.target_sounds.slice(0, cefrProfile.max_target_sounds_per_lesson),
  };
}

function syllableCount(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  const groups = w.match(/[aeiouy]+/g);
  let n = groups ? groups.length : 1;
  if (w.endsWith('e') && n > 1) n--;
  return Math.max(1, n);
}

/** Capitalize the heuristic stressed syllable (rough vowel-group split). */
function stressMark(word: string): string {
  const w = word.toLowerCase();
  const groups = [...w.matchAll(/[aeiouy]+/g)];
  if (groups.length <= 1) return w.toUpperCase();
  // Penultimate stress as default heuristic.
  const stressIdx = Math.max(0, groups.length - 2);
  const target = groups[stressIdx];
  if (!target || target.index === undefined) return w;
  const start = target.index;
  const end = start + target[0].length;
  // Expand to nearest consonant boundary on both sides for syllable feel.
  let s = start;
  while (s > 0 && !/[aeiouy]/.test(w[s - 1])) s--;
  let e = end;
  while (e < w.length && !/[aeiouy]/.test(w[e])) e++;
  return w.slice(0, s) + w.slice(s, e).toUpperCase() + w.slice(e);
}
