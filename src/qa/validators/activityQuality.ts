import type { QAIssue, QALesson } from '../types';

export function validateActivityQuality(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const activities = lesson.slides.flatMap((s) => s.activities ?? []);
  if (activities.length === 0) return issues;

  const distinctTypes = new Set(activities.map((a) => a.type));
  if (distinctTypes.size < 4 && activities.length >= 6) {
    issues.push({
      code: 'ACTIVITY_LOW_DIVERSITY',
      domain: 'activity',
      severity: 'warn',
      message: `Only ${distinctTypes.size} distinct activity types across ${activities.length} activities (need ≥4).`,
      suggestion: 'Introduce additional activity types (e.g., roleplay, storytelling, reflection).',
      auto_repairable: true,
    });
  }

  // Consecutive repetition cap
  let run = 1;
  for (let i = 1; i < activities.length; i++) {
    if (activities[i].type === activities[i - 1].type) {
      run++;
      if (run > 3) {
        issues.push({
          code: 'ACTIVITY_CONSECUTIVE_REPETITION',
          domain: 'activity',
          severity: 'warn',
          message: `Activity type "${activities[i].type}" repeats more than 3× consecutively.`,
          locator: { activityId: activities[i].id },
          auto_repairable: true,
        });
        break;
      }
    } else {
      run = 1;
    }
  }

  // Adjacent same modality+purpose
  for (let i = 1; i < activities.length; i++) {
    const a = activities[i];
    const p = activities[i - 1];
    const sameMod =
      JSON.stringify((a.modalities ?? []).sort()) ===
      JSON.stringify((p.modalities ?? []).sort());
    if (sameMod && a.purpose && a.purpose === p.purpose) {
      issues.push({
        code: 'ACTIVITY_ADJACENT_SAME_MODALITY_PURPOSE',
        domain: 'activity',
        severity: 'info',
        message: `Adjacent activities share the same modality+purpose ("${a.purpose}").`,
        locator: { activityId: a.id },
        auto_repairable: true,
      });
    }
  }

  return issues;
}
