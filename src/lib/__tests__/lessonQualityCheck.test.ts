// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { runLessonQualityCheck } from '../lessonQualityCheck';

const baseBlueprint = {
  vocabulary: ['apple', 'banana', 'cherry', 'date'],
  learning_objective: 'Students will describe fruit using new vocabulary and the present simple.',
};

function bookend(slides: any[]) {
  return [{ type: 'intro', block: 'warmup', title: 'Welcome' }, ...slides, { type: 'lesson_summary', title: 'Great job!' }];
}

describe('runLessonQualityCheck — Academy pedagogy checks', () => {
  it('flags low vocab activity variety when only flat vocab cards are used', () => {
    const slides = bookend([
      { type: 'vocab', block: 'vocab', word: 'apple', definition: 'a fruit', example: 'I eat an apple.' },
      { type: 'vocab', block: 'vocab', word: 'banana', definition: 'a fruit', example: 'I eat a banana.' },
      { type: 'vocab', block: 'vocab', word: 'cherry', definition: 'a fruit', example: 'I eat a cherry.' },
      { type: 'vocab', block: 'vocab', word: 'date', definition: 'a fruit', example: 'I eat a date.' },
      { type: 'reading_passage', block: 'reading', passage: 'Lena likes fruit. She eats an apple every day.' },
    ]);
    const report = runLessonQualityCheck({ slides, hub: 'academy', cefr: 'a2', blueprint: baseBlueprint });
    const codes = report.issues.map((i) => i.code);
    expect(codes).toContain('VOCAB_ACTIVITY_LOW_VARIETY');
    const issue = report.issues.find((i) => i.code === 'VOCAB_ACTIVITY_LOW_VARIETY');
    expect(issue?.severity).toBe('warn');
  });

  it('does not flag vocab variety when multiple vocab slide types are present', () => {
    const slides = bookend([
      { type: 'vocab', block: 'vocab', word: 'apple', definition: 'a fruit', example: 'I eat an apple.' },
      { type: 'vocab_image_match', block: 'vocab', pairs: [{ word: 'banana', left: 'banana', right: 'img' }] },
      { type: 'reading_passage', block: 'reading', passage: 'Lena likes fruit. She eats an apple every day.' },
    ]);
    const report = runLessonQualityCheck({ slides, hub: 'academy', cefr: 'a2', blueprint: baseBlueprint });
    expect(report.issues.map((i) => i.code)).not.toContain('VOCAB_ACTIVITY_LOW_VARIETY');
  });

  it('flags shallow grammar practice (too few slides / one activity type)', () => {
    const slides = bookend([
      { type: 'grammar_pattern', block: 'grammar', rule: 'Present simple: subject + verb + s' },
    ]);
    const report = runLessonQualityCheck({ slides, hub: 'academy', cefr: 'a2', blueprint: baseBlueprint });
    expect(report.issues.map((i) => i.code)).toContain('GRAMMAR_PRACTICE_SHALLOW');
  });

  it('does not flag grammar depth when 3+ slides across 2+ types are present', () => {
    const slides = bookend([
      { type: 'grammar_pattern', block: 'grammar', rule: 'Present simple: subject + verb + s' },
      { type: 'controlled_drill', block: 'grammar', prompt: 'Complete the sentence.' },
      { type: 'error_detection', block: 'grammar', sentence: 'She eat an apple.' },
    ]);
    const report = runLessonQualityCheck({ slides, hub: 'academy', cefr: 'a2', blueprint: baseBlueprint });
    expect(report.issues.map((i) => i.code)).not.toContain('GRAMMAR_PRACTICE_SHALLOW');
  });

  it('flags a comprehension question that does not reference the passage it follows', () => {
    const slides = bookend([
      { type: 'reading_passage', block: 'reading', passage: 'Lena walked to the market and bought fresh oranges.' },
      { type: 'multiple', block: 'reading', question: 'What is the capital of France?', options: ['Paris', 'Rome'], answer: 'Paris' },
    ]);
    const report = runLessonQualityCheck({ slides, hub: 'academy', cefr: 'a2', blueprint: baseBlueprint });
    expect(report.issues.map((i) => i.code)).toContain('COMPREHENSION_OFF_SOURCE');
  });

  it('flags a listening comprehension question not grounded in the transcript', () => {
    const slides = bookend([
      { type: 'listening', block: 'reading', transcript: 'Tom called his friend to ask about the weekend trip.' },
      { type: 'truefalse', block: 'reading', statement: 'The sky is blue.' },
    ]);
    const report = runLessonQualityCheck({ slides, hub: 'academy', cefr: 'a2', blueprint: baseBlueprint });
    expect(report.issues.map((i) => i.code)).toContain('COMPREHENSION_OFF_SOURCE');
  });

  it('does not flag comprehension grounding when the question overlaps the source text', () => {
    const slides = bookend([
      { type: 'reading_passage', block: 'reading', passage: 'Lena walked to the market and bought fresh oranges.' },
      { type: 'multiple', block: 'reading', question: 'What did Lena buy at the market?', options: ['Oranges', 'Bread'], answer: 'Oranges' },
    ]);
    const report = runLessonQualityCheck({ slides, hub: 'academy', cefr: 'a2', blueprint: baseBlueprint });
    expect(report.issues.map((i) => i.code)).not.toContain('COMPREHENSION_OFF_SOURCE');
  });

  it('flags activity-type over-cap for more than 2 "multiple" slides', () => {
    const slides = bookend([
      { type: 'multiple', block: 'practice', question: 'Pick the fruit.', options: ['Apple', 'Car'], answer: 'Apple' },
      { type: 'multiple', block: 'practice', question: 'Pick the fruit.', options: ['Banana', 'Car'], answer: 'Banana' },
      { type: 'multiple', block: 'practice', question: 'Pick the fruit.', options: ['Cherry', 'Car'], answer: 'Cherry' },
    ]);
    const report = runLessonQualityCheck({ slides, hub: 'academy', cefr: 'a2', blueprint: baseBlueprint });
    expect(report.issues.map((i) => i.code)).toContain('ACTIVITY_TYPE_OVER_CAP');
  });

  it('a well-formed lesson triggers none of the 4 new checks', () => {
    const slides = bookend([
      { type: 'vocab', block: 'vocab', word: 'apple', definition: 'a fruit', example: 'I eat an apple.' },
      { type: 'vocab_deck', block: 'vocab', cards: [{ word: 'banana', definition: 'a fruit', example: 'I eat a banana.' }] },
      { type: 'vocab_image_match', block: 'vocab', pairs: [{ word: 'cherry', left: 'cherry', right: 'img' }] },
      { type: 'reading_passage', block: 'reading', passage: 'Lena walked to the market and bought fresh oranges and a banana.' },
      { type: 'multiple', block: 'reading', question: 'What did Lena buy at the market?', options: ['Oranges', 'Bread'], answer: 'Oranges' },
      { type: 'listening', block: 'reading', transcript: 'Tom called his friend to ask about the weekend trip to the mountains.' },
      { type: 'truefalse', block: 'reading', statement: 'Tom asked about a trip to the mountains.' },
      { type: 'grammar_pattern', block: 'grammar', rule: 'Present simple: subject + verb + s' },
      { type: 'controlled_drill', block: 'grammar', prompt: 'Complete the sentence.' },
      { type: 'error_detection', block: 'grammar', sentence: 'She eat an apple.' },
      { type: 'fill_blank', block: 'practice', before: 'She ', after: ' an apple.', answer: 'eats' },
      { type: 'fill_blank', block: 'practice', before: 'He ', after: ' a banana.', answer: 'eats' },
      { type: 'speaking_task', block: 'speaking', prompt: 'Describe your favourite fruit.' },
    ]);
    const report = runLessonQualityCheck({ slides, hub: 'academy', cefr: 'a2', blueprint: baseBlueprint });
    const codes = report.issues.map((i) => i.code);
    expect(codes).not.toContain('VOCAB_ACTIVITY_LOW_VARIETY');
    expect(codes).not.toContain('GRAMMAR_PRACTICE_SHALLOW');
    expect(codes).not.toContain('COMPREHENSION_OFF_SOURCE');
    expect(codes).not.toContain('ACTIVITY_TYPE_OVER_CAP');
  });

  it('never blocks publish from the 4 new checks alone (all are warn severity)', () => {
    const slides = bookend([
      { type: 'vocab', block: 'vocab', word: 'apple', definition: 'a fruit', example: 'I eat an apple.' },
      { type: 'grammar_pattern', block: 'grammar', rule: 'x' },
    ]);
    const report = runLessonQualityCheck({ slides, hub: 'academy', cefr: 'a2', blueprint: baseBlueprint });
    const newCodes = ['VOCAB_ACTIVITY_LOW_VARIETY', 'GRAMMAR_PRACTICE_SHALLOW', 'COMPREHENSION_OFF_SOURCE', 'ACTIVITY_TYPE_OVER_CAP'];
    const newIssues = report.issues.filter((i) => newCodes.includes(i.code));
    expect(newIssues.every((i) => i.severity === 'warn')).toBe(true);
  });
});
