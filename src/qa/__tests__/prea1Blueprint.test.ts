import { describe, it, expect } from 'vitest';
import { validatePrea1BlueprintQA } from '../validators/prea1Blueprint';
import { dispatchRepairs, domainFromCode } from '../repairDispatcher';
import {
  PREA1_FORBIDDEN_ACTIVITIES,
  PREA1_UNIT_BLUEPRINT,
  buildPrea1Directive,
  validatePrea1Blueprint,
} from '@/planning/prea1Blueprint';
import type { QALesson, QAIssue } from '../types';

const lesson = (acts: { id: string; type: string }[]): QALesson => ({
  hub: 'Playground',
  cefr: 'Pre-A1',
  slides: [{ id: 's1', kind: 'practice', activities: acts as any }],
});

describe('Pre-A1 blueprint', () => {
  it('exports 6-lesson unit arc', () => {
    expect(PREA1_UNIT_BLUEPRINT).toHaveLength(6);
    expect(PREA1_UNIT_BLUEPRINT[0].lesson_number).toBe(1);
    expect(PREA1_UNIT_BLUEPRINT[5].lesson_number).toBe(6);
  });

  it('directive includes non-reader contract and forbidden list', () => {
    const d = buildPrea1Directive(1);
    expect(d).toMatch(/NON-READER/i);
    expect(d).toMatch(/fill_blank/);
    expect(d).toMatch(/L1/);
  });

  it('validatePrea1Blueprint returns violation codes for reading activities', () => {
    const v = validatePrea1Blueprint([{ type: 'fill_blank' }, { type: 'echo' }]);
    expect(v).toContain('PREA1_FORBIDDEN_ACTIVITY:fill_blank');
    expect(v).not.toContain('PREA1_FORBIDDEN_ACTIVITY:echo');
  });

  it('QA validator HARD-blocks forbidden activities at Pre-A1', () => {
    const issues = validatePrea1BlueprintQA(
      lesson([
        { id: 'a1', type: 'fill_blank' },
        { id: 'a2', type: 'listen_match' },
      ]),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('PREA1_FORBIDDEN_ACTIVITY');
    expect(issues[0].severity).toBe('block');
    expect(issues[0].auto_repairable).toBe(true);
    expect(issues[0].locator?.activityId).toBe('a1');
  });

  it('QA validator is a no-op for A1 and above', () => {
    const l: QALesson = { ...lesson([{ id: 'a1', type: 'fill_blank' }]), cefr: 'A1' };
    expect(validatePrea1BlueprintQA(l)).toEqual([]);
  });

  it('forbidden list covers reading + writing dependencies', () => {
    for (const t of ['fill_blank', 'reading', 'dictation', 'spelling', 'writing']) {
      expect(PREA1_FORBIDDEN_ACTIVITIES).toContain(t);
    }
  });

  it('HARD-blocks when speaking floor unmet for the mapped lesson number', () => {
    // L1 discovery requires speaking_floor=4. Provide only 1 echo → floor unmet.
    const l: QALesson = {
      hub: 'Playground',
      cefr: 'Pre-A1',
      lesson_kind: 'discovery',
      slides: [{ id: 's1', kind: 'practice', activities: [
        { id: 'a1', type: 'echo' },
        { id: 'a2', type: 'tpr_action' },
        { id: 'a3', type: 'tpr_action' },
      ] as any }],
    };
    const codes = validatePrea1BlueprintQA(l).map(i => i.code);
    expect(codes).toContain('PREA1_SPEAKING_FLOOR_UNMET');
  });

  it('HARD-blocks when TPR minimum unmet', () => {
    const l: QALesson = {
      hub: 'Playground',
      cefr: 'Pre-A1',
      lesson_kind: 'discovery',
      slides: [{ id: 's1', kind: 'practice', activities: [
        { id: 'a1', type: 'echo' },
        { id: 'a2', type: 'echo' },
        { id: 'a3', type: 'point_and_say' },
        { id: 'a4', type: 'mimic' },
      ] as any }],
    };
    const codes = validatePrea1BlueprintQA(l).map(i => i.code);
    expect(codes).toContain('PREA1_TPR_MIN_UNMET');
  });

  it('passes when speaking + TPR floors are met', () => {
    const l: QALesson = {
      hub: 'Playground',
      cefr: 'Pre-A1',
      lesson_kind: 'discovery',
      slides: [{ id: 's1', kind: 'practice', activities: [
        { id: 'a1', type: 'echo' },
        { id: 'a2', type: 'mimic' },
        { id: 'a3', type: 'point_and_say' },
        { id: 'a4', type: 'song_gesture' },
        { id: 'a5', type: 'tpr_action' },
        { id: 'a6', type: 'tpr_action' },
      ] as any }],
    };
    expect(validatePrea1BlueprintQA(l)).toEqual([]);
  });

  it('repair dispatcher routes Pre-A1 codes to activity_repair', () => {
    const issues: QAIssue[] = [
      { code: 'PREA1_FORBIDDEN_ACTIVITY', domain: 'age', severity: 'block', message: '', auto_repairable: true, suggestion: 'swap' },
      { code: 'PREA1_SPEAKING_FLOOR_UNMET', domain: 'age', severity: 'block', message: '', auto_repairable: true, suggestion: 'add echo' },
      { code: 'PREA1_TPR_MIN_UNMET', domain: 'age', severity: 'block', message: '', auto_repairable: true, suggestion: 'add tpr' },
    ];
    const dispatches = dispatchRepairs(issues);
    expect(dispatches).toHaveLength(1);
    expect(dispatches[0].target).toBe('activity_repair');
    expect(dispatches[0].issue_codes).toEqual(
      expect.arrayContaining(['PREA1_FORBIDDEN_ACTIVITY', 'PREA1_SPEAKING_FLOOR_UNMET', 'PREA1_TPR_MIN_UNMET']),
    );
    expect(domainFromCode('PREA1_FORBIDDEN_ACTIVITY')).toBe('age');
  });

  it('HARD-blocks printed prose leaks in content fields', () => {
    const l: QALesson = {
      hub: 'Playground',
      cefr: 'Pre-A1',
      lesson_kind: 'discovery',
      slides: [{ id: 's1', kind: 'practice', activities: [
        { id: 'a1', type: 'echo', content: { prompt: 'Please repeat this long sentence after me now' } },
        { id: 'a2', type: 'point_and_say', content: { prompt: 'cat' } },
      ] as any }],
    };
    const issues = validatePrea1BlueprintQA(l);
    const leak = issues.find(i => i.code === 'PREA1_PRINTED_PROSE_LEAK');
    expect(leak).toBeDefined();
    expect(leak?.severity).toBe('block');
    expect(leak?.auto_repairable).toBe(true);
    expect(leak?.locator?.activityId).toBe('a1');
    expect(leak?.locator?.path).toBe('content.prompt');
  });

  it('allows ≤5-word content prompts at Pre-A1', () => {
    const l: QALesson = {
      hub: 'Playground',
      cefr: 'Pre-A1',
      lesson_kind: 'discovery',
      slides: [{ id: 's1', kind: 'practice', activities: [
        { id: 'a1', type: 'echo', content: { prompt: 'say cat' } },
        { id: 'a2', type: 'mimic', content: { prompt: 'point at the cat' } },
        { id: 'a3', type: 'point_and_say', content: { prompt: 'dog' } },
        { id: 'a4', type: 'song_gesture', content: { prompt: 'clap now' } },
        { id: 'a5', type: 'tpr_action', content: { prompt: 'jump' } },
        { id: 'a6', type: 'tpr_action', content: { prompt: 'sit down' } },
      ] as any }],
    };
    expect(validatePrea1BlueprintQA(l).filter(i => i.code === 'PREA1_PRINTED_PROSE_LEAK')).toEqual([]);
  });
});
