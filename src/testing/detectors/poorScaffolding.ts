// Detector: poor scaffolding — checks the canonical 6-slide arc
// (Warm-Up → Prime → Mimic → Practice → Produce → Cool-Off) is present
// in order for standard lessons.
import type { DetectorFailure } from '../types';
import { normalizeLesson, fail } from './_shared';

const ARC = ['warm', 'prime', 'mimic', 'practice', 'produce', 'cool'];

function slideStage(s: { type?: string; title?: string }): string | null {
  const hay = `${s.type ?? ''} ${s.title ?? ''}`.toLowerCase();
  for (const stage of ARC) if (hay.includes(stage)) return stage;
  return null;
}

export function detectPoorScaffolding(lesson: any): DetectorFailure[] {
  const { slides } = normalizeLesson(lesson);
  if (slides.length < 6) {
    return [
      fail('poorScaffolding', 'poor_scaffolding', `Lesson has only ${slides.length} slides (<6 required for GRR arc)`, {
        severity: 'error',
        evidence: { slideCount: slides.length },
      }),
    ];
  }
  const seen: string[] = [];
  for (const s of slides) {
    const stage = slideStage(s);
    if (stage && !seen.includes(stage)) seen.push(stage);
  }
  const missing = ARC.filter((s) => !seen.includes(s));
  const failures: DetectorFailure[] = [];
  if (missing.length) {
    failures.push(
      fail('poorScaffolding', 'poor_scaffolding', `Missing GRR stages: ${missing.join(', ')}`, {
        severity: 'warn',
        evidence: { missing, found: seen },
      }),
    );
  }
  // Order check
  const expectedIdx = seen.map((s) => ARC.indexOf(s));
  for (let i = 1; i < expectedIdx.length; i++) {
    if (expectedIdx[i] < expectedIdx[i - 1]) {
      failures.push(
        fail('poorScaffolding', 'poor_scaffolding', `Out-of-order stage transition: ${seen[i - 1]} → ${seen[i]}`, {
          severity: 'warn',
          evidence: { sequence: seen },
        }),
      );
      break;
    }
  }
  return failures;
}
