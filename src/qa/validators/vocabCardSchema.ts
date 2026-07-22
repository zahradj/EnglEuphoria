// Vocab card completeness — every vocabulary entry MUST carry
// definition + example (containing headword) + image_prompt.
// Bare-word cards ("cleat", "practice", "hide" with no body) hard-block.

import type { QAIssue, QALesson, QASlide } from '../types';

const VOCAB_KINDS = /vocab|vocabulary/i;

export function validateVocabCardSchema(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];

  for (const slide of lesson.slides ?? []) {
    const isVocab = VOCAB_KINDS.test(slide.kind ?? '');
    if (!isVocab) continue;

    const cards = extractVocabCards(slide);
    if (cards.length === 0) {
      issues.push({
        code: 'VOCAB_CARDS_MISSING',
        domain: 'activity',
        severity: 'block',
        message: `Vocabulary slide "${slide.id}" has no vocab cards.`,
        locator: { slideId: slide.id },
        auto_repairable: true,
      });
      continue;
    }

    for (const c of cards) {
      const word = pickStr(c.word ?? c.headword ?? c.term);
      const def = pickStr(c.definition ?? c.meaning);
      const example = pickStr(c.example ?? c.example_sentence ?? c.sentence);
      const imagePrompt = pickStr(c.image_prompt ?? c.imagePrompt ?? c.image);

      if (!word) {
        issues.push(mkBlock('VOCAB_CARD_NO_HEADWORD', `Vocab card missing headword on slide ${slide.id}.`, slide));
        continue;
      }
      const missing: string[] = [];
      if (!def) missing.push('definition');
      if (!example) missing.push('example');
      if (example && !containsHeadword(example, word)) missing.push('example-contains-headword');
      if (!imagePrompt) missing.push('image_prompt');

      if (missing.length > 0) {
        issues.push({
          code: 'VOCAB_CARD_INCOMPLETE',
          domain: 'activity',
          severity: 'block',
          message: `Vocab card "${word}" is missing: ${missing.join(', ')}.`,
          locator: { slideId: slide.id },
          suggestion: 'Regenerate the card with definition, example containing the headword, and an image_prompt.',
          auto_repairable: true,
        });
      }
    }
  }

  return issues;
}

function pickStr(v: any): string {
  return typeof v === 'string' ? v.trim() : '';
}

function containsHeadword(text: string, word: string): boolean {
  const stem = word.toLowerCase().replace(/(ing|ed|es|s)$/i, '');
  const t = text.toLowerCase();
  return t.includes(word.toLowerCase()) || (stem.length >= 3 && t.includes(stem));
}

function mkBlock(code: string, message: string, slide: QASlide): QAIssue {
  return {
    code,
    domain: 'activity',
    severity: 'block',
    message,
    locator: { slideId: slide.id },
    auto_repairable: true,
  };
}

function extractVocabCards(slide: QASlide): any[] {
  const out: any[] = [];
  const visit = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(visit);
    const hasWord = 'word' in node || 'headword' in node || 'term' in node;
    if (hasWord) out.push(node);
    for (const v of Object.values(node)) visit(v);
  };
  visit(slide);
  for (const a of slide.activities ?? []) visit(a.content);
  return out;
}
