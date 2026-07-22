// Quiz/Homework Pedagogy validator — enforces the contract authored in
// quizPedagogyContract.ts at validation time (soft warnings, repairable).
import type { CoherenceIssue, HomeworkPack, GamePack } from './types';

const HINT_PHRASES = [
  '(recommended)', 'recommended', 'correct answer', 'best answer',
  'the right one', 'obviously', 'definitely', 'always pick',
];

interface TaskLike {
  id: string;
  prompt?: string;
  options?: Array<{ label?: string; description?: string; is_correct?: boolean }>;
}

export function validateQuizPedagogy(
  homework: HomeworkPack,
  game: GamePack,
): CoherenceIssue[] {
  const issues: CoherenceIssue[] = [];
  const all: TaskLike[] = [
    ...(homework.tasks as unknown as TaskLike[]),
    ...(game.rounds as unknown as TaskLike[]),
  ];

  for (const t of all) {
    if (!t.options || t.options.length < 2) continue;

    // Zero-hint: option text MUST NOT contain hint phrases.
    for (const opt of t.options) {
      const text = `${opt.label ?? ''} ${opt.description ?? ''}`.toLowerCase();
      if (HINT_PHRASES.some(p => text.includes(p))) {
        issues.push({
          code: 'quiz_hint_leak',
          severity: 'soft',
          message: `Item "${t.id}" leaks correctness hint in an option.`,
        });
        break;
      }
    }

    // Correct option position diversity — flag if always first.
    const correctIdx = t.options.findIndex(o => o.is_correct);
    if (correctIdx === 0 && t.options.length >= 3) {
      // single-item signal; aggregated below.
      (t as any).__correctFirst = true;
    }

    // Distractor uniqueness — reject options differing only by case/punct.
    const norm = t.options.map(o => (o.label ?? '').replace(/[^a-z0-9]/gi, '').toLowerCase());
    if (new Set(norm).size < norm.length) {
      issues.push({
        code: 'quiz_distractor_duplicate',
        severity: 'soft',
        message: `Item "${t.id}" has near-duplicate options.`,
      });
    }
  }

  // Aggregate: if >70% of items put correct first, flag bias.
  const withOpts = all.filter(t => t.options && t.options.length >= 3);
  const firstBias = withOpts.filter(t => (t as any).__correctFirst).length;
  if (withOpts.length >= 4 && firstBias / withOpts.length > 0.7) {
    issues.push({
      code: 'quiz_correct_position_bias',
      severity: 'soft',
      message: `Correct answer is first in ${firstBias}/${withOpts.length} items — randomize.`,
    });
  }

  return issues;
}
