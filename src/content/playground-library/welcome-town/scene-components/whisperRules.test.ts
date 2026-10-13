import { describe, expect, it } from 'vitest';
import { changedWord, fixChoices } from './whisperRules';
import { LESSON_4_SCENES } from '../scenes';
import { LESSON_A1U2L4_SCENES } from '../../jungle-adventure/scenes';

describe('whisper tube rules', () => {
  it('finds the one changed word, ignoring case and punctuation', () => {
    expect(changedWord('This is Mia. She is my friend.', 'This is Mia. She is my fish.')).toBe(6);
    expect(changedWord('Hello!', 'hello')).toBe(-1);
    expect(changedWord('I can swim.', 'I can fly fast.')).toBe(-1);
  });
  it('builds fix choices with the right answer in them', () => {
    const f = fixChoices('It’s got a long nose.', 'It’s got a long rose.', ['toes']);
    expect(f.choices[f.answer]).toBe('nose');
    expect(f.choices).toContain('rose');
  });
  it('every whisper-tube round in the lessons changes exactly one word', () => {
    const scenes = [...LESSON_4_SCENES, ...LESSON_A1U2L4_SCENES].filter((s) => s.kind === 'whisper-tube');
    expect(scenes.length).toBeGreaterThan(0);
    for (const s of scenes) if (s.kind === 'whisper-tube') for (const r of s.rounds) expect(changedWord(r.said, r.heard), `${s.id}: ${r.said}`).toBeGreaterThanOrEqual(0);
  });
});
