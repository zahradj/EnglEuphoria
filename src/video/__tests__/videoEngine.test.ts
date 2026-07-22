import { describe, it, expect } from 'vitest';
import { buildVideoQuestions } from '../questionBuilder';
import { buildVideoDirective } from '../videoDirective';
import { runVideoLesson } from '../runVideoLesson';
import type { ReinforcementTarget } from '@/coherence/types';

const mkTarget = (label: string, i: number): ReinforcementTarget => ({
  id: `t-${i}`,
  source: 'lesson_target',
  skill_kind: 'vocab',
  skill_key: label,
  label,
  priority: 0.5,
  cefr_ceiling: 'Pre-A1',
});

describe('video/questionBuilder', () => {
  const vocab = ['cat', 'dog', 'ball'];
  const targets = [mkTarget('cat', 1), mkTarget('dog', 2), mkTarget('ball', 3)];

  it('produces the requested count', () => {
    expect(buildVideoQuestions({ targets, vocab, hub: 'playground', count: 2 })).toHaveLength(2);
    expect(buildVideoQuestions({ targets, vocab, hub: 'playground', count: 3 })).toHaveLength(3);
  });

  it('alternates tap_picture and yes_no deterministically', () => {
    const qs = buildVideoQuestions({ targets, vocab, hub: 'playground', count: 3 });
    expect(qs[0].kind).toBe('tap_picture');
    expect(qs[1].kind).toBe('yes_no');
    expect(qs[2].kind).toBe('tap_picture');
  });

  it('binds every correct answer to a target', () => {
    const qs = buildVideoQuestions({ targets, vocab, hub: 'playground', count: 3 });
    for (const q of qs) {
      expect(targets.some((t) => t.id === q.target_id)).toBe(true);
    }
  });

  it('tap_picture correct option matches the target label', () => {
    const qs = buildVideoQuestions({ targets, vocab, hub: 'playground', count: 2 });
    const tap = qs[0];
    expect(tap.kind).toBe('tap_picture');
    const opts = tap.options as { label: string }[];
    expect(opts[tap.correct_index].label).toBe('cat');
  });

  it('returns empty on no usable targets', () => {
    expect(buildVideoQuestions({ targets: [], vocab, hub: 'playground' })).toEqual([]);
  });
});

describe('video/videoDirective', () => {
  const targets = [mkTarget('cat', 1), mkTarget('dog', 2)];
  const input = {
    cefr: 'Pre-A1' as const,
    hub: 'playground' as const,
    topic: 'pets',
    characters: ['Pip', 'Luna'],
    vocab: ['cat', 'dog'],
    targets,
  };

  it('applies playground hub style + guard tail', () => {
    const d = buildVideoDirective(input);
    expect(d.prompt).toMatch(/Kawaii Comic Cartoon/);
    expect(d.prompt).toMatch(/NO TEXT/);
    expect(d.prompt).toMatch(/SINGLE PANEL/);
  });

  it('names cast and topic in prompt', () => {
    const d = buildVideoDirective(input);
    expect(d.prompt).toMatch(/Pip and Luna/);
    expect(d.prompt).toMatch(/pets/);
  });

  it('caps Pre-A1 duration at 5s', () => {
    expect(buildVideoDirective(input).duration_seconds).toBe(5);
  });

  it('B1 duration is 10s', () => {
    expect(buildVideoDirective({ ...input, cefr: 'B1' }).duration_seconds).toBe(10);
  });

  it('cache key is deterministic', () => {
    const a = buildVideoDirective(input);
    const b = buildVideoDirective(input);
    expect(a.cache_key_input).toBe(b.cache_key_input);
  });
});

describe('video/runVideoLesson', () => {
  it('blocks when no targets', () => {
    const r = runVideoLesson({
      cefr: 'Pre-A1',
      hub: 'playground',
      topic: 'pets',
      characters: ['Pip'],
      vocab: ['cat'],
      targets: [],
    });
    expect(r.verdict).toBe('blocked');
    expect(r.reasons).toContain('VIDEO_MISSING_TARGET_BINDING');
  });

  it('returns ok with spec when targets present', () => {
    const r = runVideoLesson({
      cefr: 'Pre-A1',
      hub: 'playground',
      topic: 'pets',
      characters: ['Pip'],
      vocab: ['cat', 'dog'],
      targets: [mkTarget('cat', 1), mkTarget('dog', 2)],
    });
    expect(r.verdict).toBe('ok');
    expect(r.spec.questions.length).toBe(2);
    expect(r.spec.directive.target_ids).toEqual(['t-1', 't-2']);
  });
});
