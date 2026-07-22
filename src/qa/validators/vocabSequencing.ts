// Vocab sequencing — a target word must be INTRODUCED via its vocab card
// before it appears in reading passages, drills, or other activities.
// Fixes the "investigate appears before its card" issue.

import type { QAIssue, QALesson, QASlide } from '../types';
import { tokenizeContentWords } from '@/governance/data/stopwords';

const VOCAB_KINDS = /vocab|vocabulary/i;

export function validateVocabSequencing(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const slides = lesson.slides ?? [];

  // First-introduction index per target word (lowercase headword).
  const introIndex = new Map<string, number>();
  slides.forEach((slide, idx) => {
    if (!VOCAB_KINDS.test(slide.kind ?? '')) return;
    for (const w of extractHeadwords(slide)) {
      const key = w.toLowerCase();
      if (!introIndex.has(key)) introIndex.set(key, idx);
    }
  });

  if (introIndex.size === 0) return issues;

  // Scan every other slide for early uses.
  slides.forEach((slide, idx) => {
    if (VOCAB_KINDS.test(slide.kind ?? '')) return;
    const text = slideText(slide);
    if (!text) return;
    const tokens = new Set(tokenizeContentWords(text).map((t) => t.toLowerCase()));
    for (const [word, firstIdx] of introIndex) {
      if (idx >= firstIdx) continue;
      // Match exact token OR stemmed form
      const stem = word.replace(/(ing|ed|es|s)$/i, '');
      if (tokens.has(word) || (stem.length >= 4 && tokens.has(stem))) {
        issues.push({
          code: 'VOCAB_USED_BEFORE_INTRODUCTION',
          domain: 'activity',
          severity: 'block',
          message: `Target word "${word}" appears on slide ${slide.id} before its vocab card (introduced at slide index ${firstIdx}).`,
          locator: { slideId: slide.id },
          suggestion: `Move the vocab card for "${word}" before its first usage.`,
          auto_repairable: true,
        });
      }
    }
  });

  return issues;
}

function extractHeadwords(slide: QASlide): string[] {
  const out: string[] = [];
  const visit = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(visit);
    const w = node.word ?? node.headword ?? node.term;
    if (typeof w === 'string' && w.trim()) out.push(w.trim());
    for (const v of Object.values(node)) visit(v);
  };
  visit(slide);
  for (const a of slide.activities ?? []) visit(a.content);
  return out;
}

function slideText(slide: QASlide): string {
  const parts: string[] = [];
  if (slide.title) parts.push(slide.title);
  if (slide.body_text) parts.push(slide.body_text);
  for (const e of slide.examples ?? []) parts.push(e);
  for (const a of slide.activities ?? []) {
    const visit = (n: any) => {
      if (!n) return;
      if (typeof n === 'string') return parts.push(n);
      if (Array.isArray(n)) return n.forEach(visit);
      if (typeof n === 'object') for (const v of Object.values(n)) visit(v);
    };
    visit(a.content);
  }
  return parts.join(' ');
}
