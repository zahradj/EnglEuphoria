// Playground definition concreteness validator.
// HARD-blocks: definition > 6 words OR contains a forbidden abstract word.
// Only runs for hub === 'Playground'.

import type { QAIssue, QALesson } from '@/qa/types';
import { PLAYGROUND_REGISTER } from '../types';

const ABSTRACT_SET = new Set(PLAYGROUND_REGISTER.forbiddenAbstractWords.map((w) => w.toLowerCase()));

export function validateDefinitionConcreteness(lesson: QALesson): QAIssue[] {
  if (lesson.hub !== 'Playground') return [];
  const issues: QAIssue[] = [];

  for (const slide of lesson.slides ?? []) {
    for (const a of slide.activities ?? []) {
      for (const card of collectVocabCards(a.content)) {
        const def = (card.definition ?? '').trim();
        if (!def) continue;
        const wordCount = def.split(/\s+/).filter(Boolean).length;
        if (wordCount > PLAYGROUND_REGISTER.maxDefinitionWords) {
          issues.push({
            code: 'PG_DEFINITION_TOO_LONG',
            domain: 'language',
            severity: 'block',
            message: `Playground definition for "${card.word ?? '?'}" is ${wordCount} words (max ${PLAYGROUND_REGISTER.maxDefinitionWords}): "${def.slice(0, 80)}"`,
            locator: { slideId: slide.id, activityId: a.id },
            suggestion: 'Rewrite as a concrete kid-grade phrase ≤ 6 words.',
            auto_repairable: true,
          });
        }
        const lower = def.toLowerCase();
        for (const w of def.toLowerCase().split(/[^a-z]+/)) {
          if (ABSTRACT_SET.has(w)) {
            issues.push({
              code: 'PG_DEFINITION_ABSTRACT_WORD',
              domain: 'language',
              severity: 'block',
              message: `Playground definition uses abstract word "${w}" for "${card.word ?? '?'}".`,
              locator: { slideId: slide.id, activityId: a.id },
              suggestion: 'Replace with a concrete, sensory description.',
              auto_repairable: true,
            });
            break;
          }
        }
        // silence unused warning if no scan needed
        void lower;
      }
    }
  }
  return issues;
}

function collectVocabCards(content: any): Array<{ word?: string; definition?: string }> {
  const out: Array<{ word?: string; definition?: string }> = [];
  const visit = (n: any) => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) return n.forEach(visit);
    if (typeof n.definition === 'string' && (typeof n.word === 'string' || typeof n.headword === 'string')) {
      out.push({ word: n.word ?? n.headword, definition: n.definition });
    }
    for (const v of Object.values(n)) visit(v);
  };
  visit(content);
  return out;
}
