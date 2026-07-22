import type { QAIssue, QALesson } from '../types';

export function validateAcademicQuality(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const activities = lesson.slides.flatMap((s) => s.activities ?? []);

  if (activities.length === 0) {
    issues.push({
      code: 'ACADEMIC_NO_ACTIVITIES',
      domain: 'academic',
      severity: 'block',
      message: 'Lesson has no activities.',
      auto_repairable: false,
    });
    return issues;
  }

  const withoutPurpose = activities.filter((a) => !a.purpose);
  if (withoutPurpose.length > 0) {
    issues.push({
      code: 'ACADEMIC_PURPOSE_MISSING',
      domain: 'academic',
      severity: 'warn',
      message: `${withoutPurpose.length} activity/activities missing pedagogical purpose.`,
      suggestion: 'Tag each activity with a `purpose` (hook/input/discovery/controlled/communicative/production/reflection/review).',
      auto_repairable: true,
    });
  }

  const communicative = activities.filter((a) =>
    ['communicative', 'production', 'speaking_mission', 'roleplay', 'debate'].includes(a.purpose ?? a.type),
  ).length;
  const ratio = communicative / activities.length;
  if (ratio < 0.2) {
    issues.push({
      code: 'ACADEMIC_LOW_COMMUNICATION',
      domain: 'academic',
      severity: 'block',
      message: `Only ${(ratio * 100).toFixed(0)}% of activities are communicative; ≥20% required.`,
      suggestion: 'Add at least one roleplay/speaking_mission/production task.',
      auto_repairable: true,
    });
  }

  const controlled = activities.filter((a) =>
    ['controlled', 'fill_blank', 'matching', 'drag_drop'].includes(a.purpose ?? a.type),
  ).length;
  if (controlled / activities.length > 0.6) {
    issues.push({
      code: 'ACADEMIC_WORKSHEET_BIAS',
      domain: 'academic',
      severity: 'warn',
      message: 'More than 60% controlled-practice activities (worksheet bias).',
      suggestion: 'Replace some controlled drills with communicative or production tasks.',
      auto_repairable: true,
    });
  }

  if (!lesson.communication_objective || lesson.communication_objective.length < 8) {
    issues.push({
      code: 'ACADEMIC_NO_COMMUNICATION_OBJECTIVE',
      domain: 'academic',
      severity: 'block',
      message: 'Lesson is missing a clear communication_objective.',
      auto_repairable: true,
    });
  }

  return issues;
}
