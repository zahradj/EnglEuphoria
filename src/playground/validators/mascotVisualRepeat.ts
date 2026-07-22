// Mascot Visual Repeat validator (Phase 6).
// SOFT warning when the same Pip pose (expression+environment) appears on
// consecutive slides. Looks for `pip_pose` metadata on each slide; if absent,
// the validator stays silent (back-compat with lessons that don't carry it).

import type { QAIssue, QALesson } from '@/qa/types';

interface PoseLike {
  expression?: string;
  environment?: string;
}

function poseKey(p?: PoseLike): string | null {
  if (!p) return null;
  const e = (p.expression ?? '').trim();
  const env = (p.environment ?? '').trim();
  if (!e && !env) return null;
  return `${e}|${env}`;
}

export function validateMascotVisualRepeat(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const slides = lesson.slides ?? [];
  let prevKey: string | null = null;
  let prevIdx = -1;

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i] as any;
    const pose: PoseLike | undefined = slide?.pip_pose ?? slide?.mascot?.pose;
    const key = poseKey(pose);
    if (!key) { prevKey = null; prevIdx = i; continue; }
    if (key === prevKey) {
      issues.push({
        code: 'MASCOT_VISUAL_REPEAT',
        domain: 'narrative',
        severity: 'warn',
        message: `Slides ${prevIdx + 1} and ${i + 1} use the same Pip pose (${key.replace('|', ' / ')}).`,
        suggestion: 'Vary the mascot expression or environment between consecutive slides.',
        auto_repairable: true,
      });
    }
    prevKey = key;
    prevIdx = i;
  }
  return issues;
}
