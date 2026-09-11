// Pins that skillTag round-trips through every normalizer — these are
// allow-list mappers (only known fields survive), so a new optional field
// added to the interface but forgotten in the mapper would silently vanish
// with no type error and no visible symptom until Extra Practice's domain
// aggregation quietly saw nothing for tagged content.
import { describe, test, expect } from 'vitest';
import {
  getMultipleItems,
  getTrueFalseItems,
  getSentenceBuilderItems,
  getErrorDetectionItems,
  getCorrectionItems,
  getFillBlankItems,
} from './practiceItemNormalize';

describe('practiceItemNormalize skillTag round-trip', () => {
  test('getMultipleItems keeps skillTag from items[] and single-item legacy shape', () => {
    expect(getMultipleItems({ items: [{ question: 'Q', options: ['a', 'b'], answer: 'a', skillTag: 'grammar:present_simple' }] })[0].skillTag)
      .toBe('grammar:present_simple');
    expect(getMultipleItems({ question: 'Q', options: ['a'], answer: 'a', skillTag: 'grammar:x' })[0].skillTag).toBe('grammar:x');
    expect(getMultipleItems({ items: [{ question: 'Q', options: [], answer: '' }] })[0].skillTag).toBeUndefined();
  });

  test('getTrueFalseItems keeps skillTag', () => {
    expect(getTrueFalseItems({ items: [{ statement: 'S', answer: true, skillTag: 'grammar:y' }] })[0].skillTag).toBe('grammar:y');
  });

  test('getSentenceBuilderItems keeps skillTag', () => {
    expect(getSentenceBuilderItems({ items: [{ words: ['a'], answer: ['a'], skillTag: 'grammar:z' }] })[0].skillTag).toBe('grammar:z');
  });

  test('getErrorDetectionItems keeps skillTag', () => {
    expect(getErrorDetectionItems({ items: [{ sentence: 'S', wrongIndex: 0, skillTag: 'grammar:a' }] })[0].skillTag).toBe('grammar:a');
  });

  test('getCorrectionItems keeps skillTag', () => {
    expect(getCorrectionItems({ items: [{ wrong: 'W', answer: 'A', skillTag: 'grammar:b' }] })[0].skillTag).toBe('grammar:b');
  });

  test('getFillBlankItems keeps skillTag', () => {
    expect(getFillBlankItems({ items: [{ before: 'B', answer: 'A', after: 'A', skillTag: 'reading:c' }] })[0].skillTag).toBe('reading:c');
  });
});
