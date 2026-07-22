// Storybook Interactivity Validator — Phase 5.
// Requires ≥1 interactive page per 3 narrative pages and ≥1 comprehension
// page per chapter. Pure TS.

import type { Storybook, StorybookPageType } from '../types';

export type InteractivityVerdict = 'pass' | 'repair' | 'block';

export interface InteractivityIssue {
  code:
    | 'STORY_INTERACTIVITY_RATIO_LOW'
    | 'STORY_CHAPTER_NO_COMPREHENSION'
    | 'STORY_CHAPTER_NO_SPEAKING';
  severity: 'hard' | 'soft';
  message: string;
}

export interface InteractivityReport {
  verdict: InteractivityVerdict;
  issues: InteractivityIssue[];
  observed_ratio: number;          // interactive pages / narrative pages
}

const NARRATIVE_TYPES: StorybookPageType[] = ['narration', 'dialogue', 'illustration'];
const INTERACTIVE_TYPES: StorybookPageType[] = [
  'comprehension',
  'speaking_checkpoint',
  'interaction',
  'reflection',
  'vocab_spotlight',
];

export function validateStorybookInteractivity(book: Storybook): InteractivityReport {
  const issues: InteractivityIssue[] = [];

  let narrative = 0;
  let interactive = 0;

  for (const chapter of book.chapters ?? []) {
    let chapterComprehension = 0;
    let chapterSpeaking = 0;
    for (const page of chapter.pages ?? []) {
      if (NARRATIVE_TYPES.includes(page.page_type)) narrative++;
      if (INTERACTIVE_TYPES.includes(page.page_type)) interactive++;
      if (page.page_type === 'comprehension') chapterComprehension++;
      if (page.page_type === 'speaking_checkpoint') chapterSpeaking++;
    }
    if (chapterComprehension === 0 && (chapter.pages?.length ?? 0) >= 3) {
      issues.push({
        code: 'STORY_CHAPTER_NO_COMPREHENSION',
        severity: 'hard',
        message: `Chapter "${chapter.title}" has no comprehension page.`,
      });
    }
    if (chapterSpeaking === 0 && (chapter.pages?.length ?? 0) >= 4) {
      issues.push({
        code: 'STORY_CHAPTER_NO_SPEAKING',
        severity: 'soft',
        message: `Chapter "${chapter.title}" has no speaking checkpoint.`,
      });
    }
  }

  const required = Math.ceil(narrative / 3);
  const ratio = narrative > 0 ? interactive / narrative : 0;
  if (interactive < required) {
    issues.push({
      code: 'STORY_INTERACTIVITY_RATIO_LOW',
      severity: 'hard',
      message: `Storybook has ${interactive} interactive page(s) for ${narrative} narrative page(s); need at least ${required} (1 per 3).`,
    });
  }

  const hard = issues.some((i) => i.severity === 'hard');
  const soft = issues.some((i) => i.severity === 'soft');
  const verdict: InteractivityVerdict = hard ? 'block' : soft ? 'repair' : 'pass';

  return { verdict, issues, observed_ratio: Number(ratio.toFixed(2)) };
}
