import type { MissionNarrative } from '../types';

export interface MissionValidationIssue {
  code: string;
  severity: 'error' | 'warning';
  message: string;
}

const FORBIDDEN_TERMS = [
  'stupid', 'dumb', 'loser', 'failure', 'idiot',
  'better than your friends', 'beat your classmates',
];

const PLACEHOLDERS = ['{{', '}}', '[insert', 'lorem ipsum', 'TODO'];

/**
 * Validates the mission narrative:
 *  - Traces to lesson objective (substring or keyword overlap)
 *  - No humiliation / comparison language
 *  - No placeholder leaks
 *  - Has steps tied to activities
 */
export function validateMission(
  mission: MissionNarrative,
  planObjective: string,
): MissionValidationIssue[] {
  const issues: MissionValidationIssue[] = [];

  if (!mission.steps?.length) {
    issues.push({ code: 'no_steps', severity: 'error', message: 'Mission has no steps.' });
  }

  const corpus = [
    mission.title, mission.hook, mission.objectiveCopy,
    mission.successCopy, mission.encouragementCopy,
    ...mission.steps.map((s) => s.label),
  ].join(' ').toLowerCase();

  for (const term of FORBIDDEN_TERMS) {
    if (corpus.includes(term)) {
      issues.push({
        code: 'humiliation_or_comparison',
        severity: 'error',
        message: `Forbidden term: "${term}"`,
      });
    }
  }

  for (const p of PLACEHOLDERS) {
    if (corpus.includes(p.toLowerCase())) {
      issues.push({ code: 'placeholder_leak', severity: 'error', message: `Placeholder: "${p}"` });
    }
  }

  // Soft objective trace: at least one meaningful word overlap
  const objWords = planObjective.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const overlap = objWords.some((w) => corpus.includes(w));
  if (objWords.length > 0 && !overlap) {
    issues.push({
      code: 'objective_drift',
      severity: 'warning',
      message: 'Mission copy does not reference any keyword from the lesson objective.',
    });
  }

  return issues;
}

export function hasErrors(issues: MissionValidationIssue[]): boolean {
  return issues.some((i) => i.severity === 'error');
}
