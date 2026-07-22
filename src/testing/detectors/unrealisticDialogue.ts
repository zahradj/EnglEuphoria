// Detector: unrealistic dialogue — heuristic plausibility check.
// (AI judge upgrade is plugged via testing/index.ts when available.)
import type { DetectorFailure } from '../types';
import { normalizeLesson, fail } from './_shared';

const SUSPECT_PATTERNS: Array<{ re: RegExp; reason: string }> = [
  { re: /\b(lorem ipsum|placeholder|todo)\b/i, reason: 'placeholder text in dialogue' },
  { re: /\b(speaker [a-z]|character [0-9]+|person [0-9]+)\b/i, reason: 'generic speaker labels' },
  { re: /(.{2,40})\1{3,}/i, reason: 'repeated phrase loop' },
];

export function detectUnrealisticDialogue(lesson: any): DetectorFailure[] {
  const { slides } = normalizeLesson(lesson);
  const failures: DetectorFailure[] = [];
  slides.forEach((s) => {
    const isDialogue = /dialog|conversation|role[_-]?play|branching/i.test(`${s.type ?? ''} ${s.activityType ?? ''}`);
    if (!isDialogue) return;
    const text = `${s.title ?? ''} ${s.text ?? ''}`;
    if (text.length < 20) {
      failures.push(
        fail('unrealisticDialogue', 'unrealistic_dialogue', `Dialogue slide ${s.index} has <20 chars of content`, {
          severity: 'warn',
          slideIndex: s.index,
        }),
      );
      return;
    }
    for (const { re, reason } of SUSPECT_PATTERNS) {
      if (re.test(text)) {
        failures.push(
          fail('unrealisticDialogue', 'unrealistic_dialogue', `Slide ${s.index}: ${reason}`, {
            severity: 'warn',
            slideIndex: s.index,
            evidence: { reason },
          }),
        );
      }
    }
    // Turn balance: a dialogue should have ≥2 turns
    const turns = (text.match(/^[A-Z][a-z]+\s*:/gm) ?? []).length;
    if (turns < 2) {
      failures.push(
        fail('unrealisticDialogue', 'unrealistic_dialogue', `Slide ${s.index} has only ${turns} dialogue turn(s)`, {
          severity: 'warn',
          slideIndex: s.index,
          evidence: { turns },
        }),
      );
    }
  });
  return failures;
}
