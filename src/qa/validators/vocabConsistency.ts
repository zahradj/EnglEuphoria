// Vocab deduplication + canonical capitalization (Rule 2).
// HARD-blocks duplicate vocab cards (same headword case-insensitively)
// and inconsistent casing of the same word across slides/activities.

import type { QAIssue, QALesson } from '../types';

const VOCAB_KINDS = /vocab|vocabulary/i;

// Words always title-cased even when they are headwords (proper nouns etc).
const PROPER_NOUN_WHITELIST = new Set(['english', 'london', 'paris', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

export function validateVocabConsistency(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];

  // Collect headwords per slide.
  const seen = new Map<string, { word: string; slideId: string }>();
  for (const slide of lesson.slides ?? []) {
    if (!VOCAB_KINDS.test(slide.kind ?? '')) continue;
    const cards = extractCards(slide);
    for (const c of cards) {
      const raw = pickStr(c.word ?? c.headword ?? c.term);
      if (!raw) continue;
      const key = raw.toLowerCase().trim();
      if (seen.has(key)) {
        const first = seen.get(key)!;
        issues.push({
          code: 'VOCAB_DUPLICATE',
          domain: 'duplicate',
          severity: 'block',
          message: `Duplicate vocab card "${raw}" (already defined on slide ${first.slideId} as "${first.word}").`,
          locator: { slideId: slide.id },
          suggestion: 'Keep one canonical entry per headword; merge or drop the duplicate.',
          auto_repairable: true,
        });
      } else {
        seen.set(key, { word: raw, slideId: slide.id });
      }
    }
  }

  // Case-consistency: collect every textual usage of every headword.
  for (const [key, canonical] of seen.entries()) {
    const variants = new Set<string>();
    const visit = (s: string | undefined) => {
      if (!s || typeof s !== 'string') return;
      const re = new RegExp(`\\b(${escape(key)})\\b`, 'gi');
      const matches = s.match(re);
      if (!matches) return;
      for (const m of matches) variants.add(m);
    };
    for (const slide of lesson.slides ?? []) {
      visit(slide.title);
      visit(slide.body_text);
      visit(slide.grammar_explanation);
      for (const ex of slide.examples ?? []) visit(ex);
      for (const act of slide.activities ?? []) visitContent(act.content, visit);
    }
    if (variants.size <= 1) continue;
    // Allow case difference only if canonical word is a proper noun (always title-cased).
    if (PROPER_NOUN_WHITELIST.has(key)) continue;
    issues.push({
      code: 'VOCAB_CAPITALIZATION_INCONSISTENT',
      domain: 'language',
      severity: 'block',
      message: `Headword "${canonical.word}" appears with inconsistent capitalization: ${Array.from(variants).join(', ')}.`,
      suggestion: 'Use one canonical casing across the lesson (typically lowercase, unless proper noun).',
      auto_repairable: true,
    });
  }

  return issues;
}

function pickStr(v: any): string {
  return typeof v === 'string' ? v.trim() : '';
}
function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function extractCards(slide: any): any[] {
  const out: any[] = [];
  const visit = (n: any) => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) return n.forEach(visit);
    if ('word' in n || 'headword' in n || 'term' in n) out.push(n);
    for (const v of Object.values(n)) visit(v);
  };
  visit(slide);
  for (const a of slide.activities ?? []) visit(a.content);
  return out;
}
function visitContent(node: any, fn: (s: string | undefined) => void) {
  if (!node) return;
  if (typeof node === 'string') return fn(node);
  if (Array.isArray(node)) return node.forEach((v) => visitContent(v, fn));
  if (typeof node === 'object') for (const v of Object.values(node)) visitContent(v, fn);
}
