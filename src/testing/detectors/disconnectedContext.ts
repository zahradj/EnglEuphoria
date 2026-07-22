// Detector: disconnected context — slides whose text has near-zero token
// overlap with the lesson theme / sibling slides.
import type { DetectorFailure } from '../types';
import { normalizeLesson, fail } from './_shared';

const STOP = new Set([
  'the','a','an','is','are','was','were','to','of','in','on','for','and','or',
  'but','it','this','that','with','as','at','by','from','be','i','you','he','she',
  'we','they','do','does','did','have','has','had','can','will','would','my','your',
]);

function tokenize(s: string): string[] {
  return (s ?? '').toLowerCase().match(/[a-z]+/g)?.filter((t) => t.length > 2 && !STOP.has(t)) ?? [];
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

export function detectDisconnectedContext(lesson: any): DetectorFailure[] {
  const norm = normalizeLesson(lesson);
  const theme = String(lesson?.theme ?? lesson?.blueprint?.theme ?? '');
  const themeTokens = new Set(tokenize(theme));
  const failures: DetectorFailure[] = [];

  // Build per-slide token sets
  const slideSets = norm.slides.map((s) => new Set(tokenize(`${s.title ?? ''} ${s.text ?? ''}`)));

  norm.slides.forEach((s, i) => {
    const set = slideSets[i];
    if (set.size < 4) return; // too short to judge
    const themeOverlap = themeTokens.size ? jaccard(set, themeTokens) : 1;
    const neighbors = [slideSets[i - 1], slideSets[i + 1]].filter(Boolean) as Set<string>[];
    const avgNeighbor = neighbors.length
      ? neighbors.reduce((acc, n) => acc + jaccard(set, n), 0) / neighbors.length
      : 1;
    if (themeOverlap < 0.04 && avgNeighbor < 0.04) {
      failures.push(
        fail('disconnectedContext', 'disconnected_context', `Slide ${i} appears disconnected from theme and neighbors`, {
          severity: 'warn',
          slideIndex: i,
          evidence: { themeOverlap: +themeOverlap.toFixed(3), avgNeighborOverlap: +avgNeighbor.toFixed(3) },
        }),
      );
    }
  });
  return failures;
}
