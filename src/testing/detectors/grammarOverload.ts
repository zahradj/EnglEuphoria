// Detector: grammar overload — more than 1 new grammar structure introduced.
import type { DetectorFailure } from '../types';
import { normalizeLesson, fail } from './_shared';

export function detectGrammarOverload(lesson: any): DetectorFailure[] {
  const { slides } = normalizeLesson(lesson);
  const introduced = new Set<string>();
  for (const s of slides) for (const g of s.grammar ?? []) introduced.add(g.toLowerCase().trim());
  if (introduced.size > 1) {
    return [
      fail('grammarOverload', 'grammar_overload', `Lesson introduces ${introduced.size} grammar structures (max 1)`, {
        severity: 'error',
        evidence: { structures: Array.from(introduced) },
      }),
    ];
  }
  return [];
}
