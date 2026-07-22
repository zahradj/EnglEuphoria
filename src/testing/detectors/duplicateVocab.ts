// Detector: duplicated vocabulary across slides beyond recycling threshold.
// Spiral memory expects ≥3 exposures; >7 in same lesson = overload.
import type { DetectorFailure } from '../types';
import { normalizeLesson, fail } from './_shared';

const OVEREXPOSURE_THRESHOLD = 7;

export function detectDuplicateVocab(lesson: any): DetectorFailure[] {
  const { slides } = normalizeLesson(lesson);
  const counts = new Map<string, number[]>();
  for (const s of slides) {
    for (const word of s.vocabulary ?? []) {
      const key = word.toLowerCase().trim();
      if (!key) continue;
      const arr = counts.get(key) ?? [];
      arr.push(s.index);
      counts.set(key, arr);
    }
  }
  const failures: DetectorFailure[] = [];
  for (const [word, indices] of counts) {
    if (indices.length > OVEREXPOSURE_THRESHOLD) {
      failures.push(
        fail('duplicateVocab', 'duplicate_vocab', `"${word}" appears in ${indices.length} slides (>${OVEREXPOSURE_THRESHOLD})`, {
          severity: 'warn',
          evidence: { word, indices },
        }),
      );
    }
  }
  return failures;
}
