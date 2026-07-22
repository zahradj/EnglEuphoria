// THEME_DRIFT — soft QA validator.
//
// When a lesson declares a backdrop `unit_theme` (e.g. "deep space",
// "underwater lab"), every slide `image_prompt`, storybook page prompt, and
// homework/game task prompt should stay inside that world. Off-world prompts
// (e.g. a generic park scene when the theme is "deep space") are flagged as
// warnings with a repair hint.
//
// IMPORTANT — Engleuphoria lessons are DELIVERED in a classroom, so the words
// "classroom" / "school" / "teacher" NEVER count as drift. They're the real
// world every student is sitting in.

import type { QAIssue, QALesson } from '../types';

const CLASSROOM_SAFE_RX = /\b(classroom|school|teacher|desk|whiteboard)\b/i;

export function validateThemeDrift(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const theme = (lesson.unit_theme ?? '').trim();
  const scene = (lesson.scene_phrase ?? '').trim();
  if (!theme && !scene) return issues;

  const anchors = Array.from(
    new Set(
      `${theme} ${scene}`
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length >= 4),
    ),
  );
  if (anchors.length === 0) return issues;

  // If the declared world already IS the classroom, nothing to check.
  if (anchors.some((a) => CLASSROOM_SAFE_RX.test(a))) return issues;

  const hasAnchor = (s: string): boolean => {
    const lower = s.toLowerCase();
    return anchors.some((a) => lower.includes(a));
  };

  for (const slide of lesson.slides ?? []) {
    for (const a of slide.activities ?? []) {
      for (const { field, value } of collectPrompts(a.content)) {
        const trimmed = value.trim();
        if (trimmed.length < 20) continue;
        if (CLASSROOM_SAFE_RX.test(trimmed)) continue; // real teaching setting is always fine
        if (hasAnchor(trimmed)) continue;
        issues.push({
          code: 'THEME_DRIFT',
          domain: 'narrative',
          severity: 'warn',
          message: `Off-world ${field} on slide ${slide.id} — lesson theme is "${theme || scene}" but content reads: "${trimmed.slice(0, 80)}"`,
          locator: { slideId: slide.id, activityId: a.id, path: field },
          suggestion: `Rewrite inside the theme world ("${scene || theme}") or reference an anchor from it. Classroom/school framing is always allowed.`,
          auto_repairable: true,
        });
      }
    }
  }
  return issues;
}

function collectPrompts(content: any): Array<{ field: string; value: string }> {
  const out: Array<{ field: string; value: string }> = [];
  const FIELDS = new Set(['image_prompt', 'illustration_prompt', 'prompt', 'scene', 'setting', 'backdrop']);
  const visit = (n: any) => {
    if (!n) return;
    if (Array.isArray(n)) return n.forEach(visit);
    if (typeof n !== 'object') return;
    for (const [k, v] of Object.entries(n)) {
      if (typeof v === 'string' && FIELDS.has(k)) out.push({ field: k, value: v });
      else visit(v);
    }
  };
  visit(content);
  return out;
}
