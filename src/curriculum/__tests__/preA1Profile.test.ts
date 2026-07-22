import { describe, it, expect } from 'vitest';
import {
  isPreA1,
  isTypeAllowedAtPreA1,
  buildPreA1PromptAddendum,
  PRE_A1_SPEAKING_CEILING,
  PRE_A1_MAX_PROMPT_WORDS,
  PRE_A1_FORBIDDEN_TYPES,
  PRE_A1_ALLOWED_TYPES,
} from '@/curriculum/preA1Profile';

describe('preA1Profile — contract lock', () => {
  it('detects Pre-A1 across whitespace, dash, underscore, and case variants', () => {
    for (const v of ['Pre-A1', 'pre-a1', 'PRE_A1', 'pre a1', 'PreA1']) {
      expect(isPreA1(v)).toBe(true);
    }
    for (const v of ['A1', 'A2', 'B1', '', null, undefined]) {
      expect(isPreA1(v as any)).toBe(false);
    }
  });

  it('never allows a forbidden type', () => {
    for (const t of PRE_A1_FORBIDDEN_TYPES) {
      expect(isTypeAllowedAtPreA1(t)).toBe(false);
    }
  });

  it('allows every canonical audio/visual type', () => {
    for (const t of PRE_A1_ALLOWED_TYPES) {
      // allowed unless the same string appears in forbidden (shouldn't)
      if (!PRE_A1_FORBIDDEN_TYPES.includes(t)) {
        expect(isTypeAllowedAtPreA1(t)).toBe(true);
      }
    }
  });

  it('rejects text-heavy A1+ types by default', () => {
    for (const t of ['reading_comprehension', 'fill_blank', 'sentence_scramble', 'dictation_builder']) {
      expect(isTypeAllowedAtPreA1(t)).toBe(false);
    }
  });

  it('holds the speaking ceiling at repetition', () => {
    expect(PRE_A1_SPEAKING_CEILING).toBe('repetition');
  });

  it('caps prompt words to ≤5', () => {
    expect(PRE_A1_MAX_PROMPT_WORDS).toBeLessThanOrEqual(5);
  });

  it('prompt addendum binds every non-reader clause', () => {
    const p = buildPreA1PromptAddendum(1);
    expect(p).toMatch(/cannot read/i);
    expect(p).toMatch(/audio_word|audio_prompt/);
    expect(p).toMatch(/image_prompt/);
    expect(p).toMatch(/repetition/i);
    expect(p).toMatch(/NO reading passages/i);
    expect(p).toMatch(new RegExp(`≤ ${PRE_A1_MAX_PROMPT_WORDS} words`));
    for (const t of PRE_A1_FORBIDDEN_TYPES) {
      expect(p).toContain(t);
    }
  });
});
