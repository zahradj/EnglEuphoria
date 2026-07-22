import type { QAIssue, QALesson } from '../types';

export function validateNarrativeConsistency(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const anchors = lesson.slides
    .flatMap((s) => s.activities ?? [])
    .map((a) => a.narrative_anchor)
    .filter((n): n is NonNullable<typeof n> => !!n);

  if (anchors.length < 2) return issues;

  const characters = new Set<string>();
  const settings = new Set<string>();
  for (const a of anchors) {
    (a.characters ?? []).forEach((c) => characters.add(c.toLowerCase()));
    if (a.setting) settings.add(a.setting.toLowerCase());
  }

  // Establish baseline from first anchor; flag drift
  const first = anchors[0];
  const firstChars = new Set((first.characters ?? []).map((c) => c.toLowerCase()));

  let charsDropped = 0;
  for (let i = 1; i < anchors.length; i++) {
    const cur = new Set((anchors[i].characters ?? []).map((c) => c.toLowerCase()));
    const stillThere = [...firstChars].some((c) => cur.has(c));
    if (firstChars.size > 0 && !stillThere) charsDropped++;
  }
  if (charsDropped > anchors.length / 2) {
    issues.push({
      code: 'NARRATIVE_CHARACTER_DRIFT',
      domain: 'narrative',
      severity: 'warn',
      message: 'Opening characters disappear from more than half of subsequent activities.',
      suggestion: 'Keep at least one consistent character across the lesson, or explicitly close their arc.',
      auto_repairable: true,
    });
  }

  if (settings.size > 3) {
    issues.push({
      code: 'NARRATIVE_SETTING_DRIFT',
      domain: 'narrative',
      severity: 'info',
      message: `Lesson jumps across ${settings.size} distinct settings.`,
      auto_repairable: true,
    });
  }

  return issues;
}
