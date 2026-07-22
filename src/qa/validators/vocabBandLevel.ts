// CEFR band validator — blocks above-level vocabulary and warns when a lesson
// is flooded with words far below its declared CEFR.
//
// HARD `VOCAB_ABOVE_LEVEL`  — any target/support word classified above the
//                              lesson CEFR.
// HARD `VOCAB_COUNT_OVER`   — target word count exceeds the per-lesson budget.
// SOFT `VOCAB_COUNT_UNDER`  — target word count below the per-lesson minimum.
// SOFT `VOCAB_BELOW_LEVEL`  — > 50% of target words are ≥2 bands below the
//                              lesson CEFR (catches "baby words at A2").

import type { Cefr, Hub as GovHub } from '@/governance/types';
import {
  bandsBelow,
  classifyWord,
  getVocabBudget,
} from '@/governance/data/cefrVocab';
import type { QAIssue, QALesson, QASlide } from '../types';

const VOCAB_KINDS = /vocab|vocabulary/i;

export function validateVocabBandLevel(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const cefr = lesson.cefr as Cefr;
  const hub = (String(lesson.hub).toLowerCase() as GovHub);
  const budget = getVocabBudget(cefr, hub);

  const target = collectTargetWords(lesson);

  // 1. Above-level (HARD, per word)
  for (const { word, slideId } of target) {
    const c = classifyWord(word);
    if (c !== 'unknown' && rank(c) > rank(cefr)) {
      issues.push({
        code: 'VOCAB_ABOVE_LEVEL',
        domain: 'cefr',
        severity: 'block',
        message: `Vocabulary "${word}" is ${c} — above the lesson CEFR ${cefr}.`,
        locator: slideId ? { slideId } : undefined,
        suggestion: `Replace with a word at or below ${cefr}.`,
        auto_repairable: true,
      });
    }
  }

  // 2. Count budget
  const uniqueCount = new Set(target.map((t) => t.word.toLowerCase())).size;
  if (uniqueCount > budget.perLessonMax) {
    issues.push({
      code: 'VOCAB_COUNT_OVER',
      domain: 'cefr',
      severity: 'block',
      message: `Lesson introduces ${uniqueCount} target words — max ${budget.perLessonMax} at ${cefr} (${hub}).`,
      auto_repairable: true,
    });
  } else if (uniqueCount > 0 && uniqueCount < budget.perLessonMin) {
    issues.push({
      code: 'VOCAB_COUNT_UNDER',
      domain: 'cefr',
      severity: 'warn',
      message: `Lesson introduces ${uniqueCount} target words — min ${budget.perLessonMin} at ${cefr} (${hub}).`,
      auto_repairable: true,
    });
  }

  // 3. Far-below-level density (SOFT)
  if (uniqueCount >= 4) {
    const farBelow = [...new Set(target.map((t) => t.word.toLowerCase()))]
      .filter((w) => bandsBelow(w, cefr) >= 2).length;
    if (farBelow / uniqueCount > 0.5) {
      issues.push({
        code: 'VOCAB_BELOW_LEVEL',
        domain: 'cefr',
        severity: 'warn',
        message: `Over 50% of target words sit ≥2 CEFR bands below ${cefr}. Lesson reads babyish for its level.`,
        auto_repairable: true,
      });
    }
  }

  return issues;
}

function collectTargetWords(lesson: QALesson): Array<{ word: string; slideId?: string }> {
  const out: Array<{ word: string; slideId?: string }> = [];
  for (const slide of lesson.slides ?? []) {
    if (!VOCAB_KINDS.test(slide.kind ?? '')) continue;
    for (const c of extractCards(slide)) {
      const w = pickStr(c.word ?? c.headword ?? c.term);
      if (w) out.push({ word: w, slideId: slide.id });
    }
  }
  return out;
}

function extractCards(slide: QASlide): any[] {
  const acts = slide.activities ?? [];
  const cards: any[] = [];
  for (const a of acts) {
    const c = a.content ?? {};
    const list = c.cards ?? c.items ?? c.vocab ?? [];
    if (Array.isArray(list)) cards.push(...list);
  }
  return cards;
}

function pickStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

const ORDER: Cefr[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];
function rank(c: Cefr): number { return ORDER.indexOf(c); }
