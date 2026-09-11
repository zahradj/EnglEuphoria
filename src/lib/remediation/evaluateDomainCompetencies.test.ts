// Pins the exact Novakid-mirrored gating rule: Speaking assigns on ANY
// failed competency; Grammar/Reading (and any other domain) assign once
// at least 50% of that domain's distinct competencies failed this lesson.
// These are the specific boundary cases the automatic Extra Practice
// feature depends on — a future change to the thresholds/logic should have
// to deliberately break these, not accidentally.
import { describe, test, expect } from 'vitest';
import { evaluateDomainCompetencies, parseDomainTag } from './evaluateDomainCompetencies';

describe('parseDomainTag', () => {
  test('splits a domain-prefixed tag', () => {
    expect(parseDomainTag('grammar:present_perfect')).toEqual({ domain: 'grammar', competency: 'present_perfect' });
  });

  test('returns null for a tag with no colon', () => {
    expect(parseDomainTag('present_perfect')).toBeNull();
  });

  test('returns null for a tag that is only a colon prefix or suffix', () => {
    expect(parseDomainTag(':present_perfect')).toBeNull();
    expect(parseDomainTag('grammar:')).toBeNull();
  });
});

describe('evaluateDomainCompetencies', () => {
  test('speaking: a single failed competency triggers assignment', () => {
    const [result] = evaluateDomainCompetencies([
      { skillTag: 'speaking:fluency', isCorrect: false },
    ]);
    expect(result.domain).toBe('speaking');
    expect(result.shouldAssign).toBe(true);
    expect(result.failedTags).toEqual(['fluency']);
  });

  test('speaking: all-correct competencies never trigger', () => {
    const [result] = evaluateDomainCompetencies([
      { skillTag: 'speaking:fluency', isCorrect: true },
      { skillTag: 'speaking:pronunciation', isCorrect: true },
    ]);
    expect(result.shouldAssign).toBe(false);
    expect(result.failedTags).toEqual([]);
  });

  test('grammar: 1 of 3 competencies failed (33%) does NOT trigger', () => {
    const [result] = evaluateDomainCompetencies([
      { skillTag: 'grammar:present_simple', isCorrect: false },
      { skillTag: 'grammar:past_simple', isCorrect: true },
      { skillTag: 'grammar:future_simple', isCorrect: true },
    ]);
    expect(result.domain).toBe('grammar');
    expect(result.shouldAssign).toBe(false);
    expect(result.failedTags).toEqual(['present_simple']);
  });

  test('grammar: exactly 50% of competencies failed DOES trigger (boundary is inclusive)', () => {
    const [result] = evaluateDomainCompetencies([
      { skillTag: 'grammar:present_simple', isCorrect: false },
      { skillTag: 'grammar:past_simple', isCorrect: true },
    ]);
    expect(result.shouldAssign).toBe(true);
  });

  test('grammar: 2 of 3 competencies failed (67%) triggers', () => {
    const [result] = evaluateDomainCompetencies([
      { skillTag: 'grammar:present_simple', isCorrect: false },
      { skillTag: 'grammar:past_simple', isCorrect: false },
      { skillTag: 'grammar:future_simple', isCorrect: true },
    ]);
    expect(result.shouldAssign).toBe(true);
    expect(result.failedTags).toEqual(['past_simple', 'present_simple']);
  });

  test('a competency failed once stays failed even if answered correctly on a later question', () => {
    const [result] = evaluateDomainCompetencies([
      { skillTag: 'grammar:present_simple', isCorrect: false },
      { skillTag: 'grammar:present_simple', isCorrect: true },
      { skillTag: 'grammar:past_simple', isCorrect: true },
    ]);
    expect(result.failedTags).toEqual(['present_simple']);
    // 1 of 2 distinct competencies (50%) → triggers.
    expect(result.shouldAssign).toBe(true);
  });

  test('untagged and malformed answers are ignored, not miscounted', () => {
    const results = evaluateDomainCompetencies([
      { skillTag: null, isCorrect: false },
      { skillTag: undefined, isCorrect: false },
      { skillTag: 'no_domain_prefix', isCorrect: false },
      { skillTag: 'grammar:present_simple', isCorrect: true },
    ]);
    expect(results).toHaveLength(1);
    expect(results[0].domain).toBe('grammar');
    expect(results[0].shouldAssign).toBe(false);
  });

  test('multiple domains in the same lesson are evaluated independently, sorted by domain name', () => {
    const results = evaluateDomainCompetencies([
      { skillTag: 'speaking:fluency', isCorrect: false },
      { skillTag: 'reading:main_idea', isCorrect: false },
      { skillTag: 'reading:inference', isCorrect: false },
      { skillTag: 'reading:vocabulary_in_context', isCorrect: true },
      { skillTag: 'reading:tone', isCorrect: true },
    ]);
    expect(results.map((r) => r.domain)).toEqual(['reading', 'speaking']);
    const reading = results.find((r) => r.domain === 'reading')!;
    // 2 of 4 (50%) → triggers.
    expect(reading.shouldAssign).toBe(true);
    const speaking = results.find((r) => r.domain === 'speaking')!;
    expect(speaking.shouldAssign).toBe(true);
  });

  test('no answers at all → no domain results', () => {
    expect(evaluateDomainCompetencies([])).toEqual([]);
  });
});
