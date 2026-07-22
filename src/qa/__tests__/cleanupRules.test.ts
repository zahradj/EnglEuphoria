import { describe, it, expect } from 'vitest';
import { validateVocabConsistency } from '../validators/vocabConsistency';
import { validateReportedSpeechBackshift } from '../validators/reportedSpeechBackshift';
import { validatePollShape } from '../validators/pollShape';
import { validateEdPronunciation, classifyEd } from '../validators/edPronunciation';
import { validateImagePromptComplexity, countStyleTokens } from '../validators/imagePromptComplexity';
import type { QALesson } from '../types';

const base = (slides: any[]): QALesson => ({
  hub: 'Academy', cefr: 'B1', slides,
});

describe('vocabConsistency', () => {
  it('flags duplicate vocab entries (case-insensitive)', () => {
    const lesson = base([
      { id: 's1', kind: 'vocab', activities: [{ id: 'a', type: 'vocab_card', content: { cards: [
        { word: 'Witness', definition: 'x', example: 'witness x' },
        { word: 'witness', definition: 'y', example: 'witness y' },
      ] } }] },
    ]);
    const issues = validateVocabConsistency(lesson);
    expect(issues.find((i) => i.code === 'VOCAB_DUPLICATE')).toBeTruthy();
  });
});

describe('reportedSpeechBackshift', () => {
  it('blocks will → will (must become would)', () => {
    const lesson = base([{ id: 's1', kind: 'practice', activities: [{ id: 'a', type: 'reported_speech', content: { pairs: [
      { original: 'I will go.', reported: 'He said he will go.' },
    ] } }] }]);
    expect(validateReportedSpeechBackshift(lesson).some(i => i.code === 'REPORTED_SPEECH_BACKSHIFT_INVALID')).toBe(true);
  });
  it('passes when backshift is correct', () => {
    const lesson = base([{ id: 's1', kind: 'practice', activities: [{ id: 'a', type: 'reported_speech', content: { pairs: [
      { original: 'I will go.', reported: 'He said he would go.' },
    ] } }] }]);
    expect(validateReportedSpeechBackshift(lesson)).toEqual([]);
  });
});

describe('pollShape', () => {
  it('blocks pct without real-data source', () => {
    const lesson = base([{ id: 's1', kind: 'warmup', activities: [{ id: 'p', type: 'poll', content: { options: [{ label: 'A', pct: 60 }, { label: 'B', pct: 40 }] } }] }]);
    expect(validatePollShape(lesson).some(i => i.code === 'POLL_PCT_WITHOUT_SOURCE')).toBe(true);
  });
});

describe('edPronunciation', () => {
  it('classifies walked /t/, played /d/, wanted /ɪd/', () => {
    expect(classifyEd('walked')).toBe('t');
    expect(classifyEd('played')).toBe('d');
    expect(classifyEd('wanted')).toBe('ɪd');
  });
  it('flags a mismatch and missing student rule', () => {
    const lesson = base([{ id: 's1', kind: 'phonics', activities: [{ id: 'p', type: 'phonics_drill', content: {
      pattern: 'ed_ending',
      groups: { 't': ['played'], 'd': ['walked'], 'ɪd': ['wanted'] },
    } }] }]);
    const issues = validateEdPronunciation(lesson);
    expect(issues.some(i => i.code === 'PHONICS_ED_RULE_MISSING')).toBe(true);
    expect(issues.some(i => i.code === 'PHONICS_ED_CATEGORY_MISMATCH')).toBe(true);
  });
});

describe('imagePromptComplexity', () => {
  it('counts style tokens and blocks overspec', () => {
    expect(countStyleTokens('slice-of-life webcomic realistic anime cel shading')).toBeGreaterThan(2);
    const lesson = base([{ id: 's1', kind: 'vocab', activities: [{ id: 'a', type: 'vocab_card', content: { cards: [
      { word: 'fox', definition: 'an animal', example: 'a red fox', image_prompt: 'a fox running, slice-of-life webcomic realistic anime cel shading white background flat vector' },
    ] } }] }]);
    expect(validateImagePromptComplexity(lesson).some(i => i.code === 'IMAGE_PROMPT_OVER_SPECIFIED')).toBe(true);
  });
});
