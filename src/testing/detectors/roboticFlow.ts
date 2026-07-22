// Detector: robotic flow — measures lexical repetition between consecutive
// slides; very high cross-slide n-gram overlap signals templated output.
import type { DetectorFailure } from '../types';
import { normalizeLesson, fail } from './_shared';

function bigrams(text: string): Set<string> {
  const tokens = (text.toLowerCase().match(/[a-z']+/g) ?? []).slice(0, 200);
  const out = new Set<string>();
  for (let i = 0; i < tokens.length - 1; i++) out.add(`${tokens[i]} ${tokens[i + 1]}`);
  return out;
}

function overlap(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let n = 0;
  for (const x of a) if (b.has(x)) n++;
  return n / Math.min(a.size, b.size);
}

export function detectRoboticFlow(lesson: any): DetectorFailure[] {
  const { slides } = normalizeLesson(lesson);
  const failures: DetectorFailure[] = [];
  const grams = slides.map((s) => bigrams(`${s.title ?? ''} ${s.text ?? ''}`));
  let highCount = 0;
  for (let i = 1; i < grams.length; i++) {
    const o = overlap(grams[i], grams[i - 1]);
    if (o > 0.55) {
      highCount++;
      failures.push(
        fail('roboticFlow', 'robotic_flow', `Slide ${i} shares ${(o * 100).toFixed(0)}% bigrams with slide ${i - 1}`, {
          severity: 'info',
          slideIndex: i,
          evidence: { overlap: +o.toFixed(2) },
        }),
      );
    }
  }
  if (highCount >= 3) {
    failures.push(
      fail('roboticFlow', 'robotic_flow', `${highCount} adjacent slide pairs share >55% bigrams — flow feels templated`, {
        severity: 'warn',
        evidence: { highCount },
      }),
    );
  }
  return failures;
}
