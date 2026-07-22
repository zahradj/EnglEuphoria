// Connected-speech targets — linking, weak forms, chunking.
// CEFR-scaled. Inherits phoneme focus from pronunciation engine.

import type { Cefr } from '@/governance/types';

const BASE_TARGETS: Record<Cefr, string[]> = {
  'Pre-A1': [],
  A1: ['linking_C+V'],
  A2: ['linking_C+V', 'weak_to', 'weak_for'],
  B1: ['linking_C+V', 'weak_forms', 'sentence_stress'],
  B2: ['linking_C+V', 'weak_forms', 'sentence_stress', 'thought_groups'],
  C1: ['weak_forms', 'sentence_stress', 'thought_groups', 'elision'],
  
};

export function connectedSpeechTargetsFor(cefr: Cefr, pronunciationFocus: string[] = []): string[] {
  const base = BASE_TARGETS[cefr] ?? [];
  const phonemeBoosts = pronunciationFocus.map((p) => `phoneme_${p}`);
  return Array.from(new Set([...base, ...phonemeBoosts]));
}
