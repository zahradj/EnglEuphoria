// End-to-end pipeline test: synthetic Pre-A1 lesson through
// runQualityControl -> decidePublish -> dispatchRepairs.

import { describe, it, expect } from 'vitest';
import { runQualityControl } from '../index';
import type { QALesson } from '../types';

const forbiddenLesson: QALesson = {
  hub: 'Playground',
  cefr: 'Pre-A1',
  lesson_kind: 'discovery',
  slides: [
    {
      id: 's1',
      kind: 'practice',
      activities: [
        { id: 'a1', type: 'fill_blank', content: { prompt: 'x', answers: ['y'] } } as any,
        { id: 'a2', type: 'echo', content: { prompt: 'say cat' } } as any,
      ],
    },
  ],
};

describe('Pre-A1 full QA pipeline', () => {
  it('blocks + routes to activity_repair for forbidden activity', async () => {
    const { report, decision, repairs } = await runQualityControl({
      lesson: forbiddenLesson,
    });

    const codes = report.issues.map((i) => i.code);
    expect(codes).toContain('PREA1_FORBIDDEN_ACTIVITY');

    // decidePublish must NOT allow publish. next_action is 'repair' when only
    // auto_repairable blocks exist, or 'block' if the sparse synthetic lesson
    // also trips a non-repairable structural validator — either way, the
    // Pre-A1 code must be surfaced in repair_codes for the generator.
    expect(decision.allowed).toBe(false);
    expect(['repair', 'block']).toContain(decision.next_action);
    expect(decision.repair_codes).toEqual(
      expect.arrayContaining(['PREA1_FORBIDDEN_ACTIVITY']),
    );

    // Repair dispatcher must bucket Pre-A1 codes into activity_repair.
    const targets = repairs.map((r) => r.target);
    expect(targets).toContain('activity_repair');
  });
});
