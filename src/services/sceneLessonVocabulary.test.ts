// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { LESSON_U2L1_SCENES } from '@/content/playground-library/unit1/scenes';
import { extractTaughtVocabulary, extractTaughtLetters } from './sceneLessonCompletionService';
import { LESSON_GRAMMAR } from '@/content/playground-library/lessonGrammar';
import { questForLesson } from '@/content/homework-quests/registry';

describe('scene lesson → student tabs wiring (Pre-A1 U2L1)', () => {
  it('collects the lesson vocabulary for the Vocabulary Vault', () => {
    const words = extractTaughtVocabulary(LESSON_U2L1_SCENES as never).map((v) => v.word);
    for (const w of ['red', 'ring', 'ribbon', 'yellow', 'blue', 'ball', 'bear', 'balloon', 'popcorn']) {
      expect(words, w).toContain(w);
    }
    expect(words.every((w) => !/[.!?]/.test(w))).toBe(true); // no sentences
  });
  it('collects the R / Y / B sounds for the Map of Sounds', () => {
    expect(extractTaughtLetters(LESSON_U2L1_SCENES as never)).toEqual(['R', 'Y', 'B']);
  });
  it('has grammar (Grammar Journal) and a homework quest (Homework) under the same lesson key', () => {
    expect(LESSON_GRAMMAR['lep1-rich-2-1'].pattern).toBe("It's + color");
    expect(questForLesson('lep1-rich-2-1')?.id).toBe('color-carnival-u2l1');
  });
});
