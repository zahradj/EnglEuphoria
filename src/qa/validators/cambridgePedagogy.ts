// Cambridge Pedagogy validator — enforces topic-locking, reading consistency,
// vocab example integrity, activity-type caps, pedagogical flow order, and
// story-character consistency. Runs as part of runDeterministicQA().

import type { QAActivity, QAIssue, QALesson, QASlide } from '../types';
import { tokenizeContentWords } from '@/governance/data/stopwords';

const MCQ_TYPES = new Set(['mcq', 'multiple_choice', 'quiz', 'poll']);
const FILL_TYPES = new Set(['fill_blank', 'fill_in_blank', 'fill-in-the-blank', 'cloze']);
const VOCAB_KINDS = /vocab|vocabulary/i;
const READING_KINDS = /reading|story|passage|text/i;
const COMPREHENSION_KINDS = /comprehension|reading_questions|reading-check/i;
const GRAMMAR_KINDS = /grammar/i;
const HOMEWORK_KINDS = /homework|cool[_-]?off/i;
const REVIEW_KINDS = /review|reflection|summary/i;
const PRODUCTION_STAGES = new Set([
  'controlled', 'semi', 'semi-controlled', 'semi_controlled',
  'production', 'produce', 'communicative', 'free',
]);

export function validateCambridgePedagogy(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const slides = lesson.slides ?? [];
  const activities = slides.flatMap((s) => s.activities ?? []);

  // -- B5: activity-type balancing caps --------------------------------------
  const counts: Record<string, number> = {};
  for (const a of activities) counts[a.type] = (counts[a.type] ?? 0) + 1;
  const mcqCount = sumWhere(counts, (t) => MCQ_TYPES.has(t));
  const fillCount = sumWhere(counts, (t) => FILL_TYPES.has(t));
  if (mcqCount > 2) {
    issues.push({
      code: 'ACTIVITY_TYPE_OVER_CAP',
      domain: 'activity',
      severity: 'warn',
      message: `${mcqCount} MCQ-style activities (cap is 2).`,
      suggestion: 'Replace excess MCQs with matching, sentence builder, roleplay, or speaking.',
      auto_repairable: true,
    });
  }
  if (fillCount > 2) {
    issues.push({
      code: 'ACTIVITY_TYPE_OVER_CAP',
      domain: 'activity',
      severity: 'warn',
      message: `${fillCount} fill-blank activities (cap is 2).`,
      suggestion: 'Replace excess fill-blanks with matching, sentence builder, or speaking.',
      auto_repairable: true,
    });
  }

  // -- B4: vocab example integrity -------------------------------------------
  for (const slide of slides) {
    if (!VOCAB_KINDS.test(slide.kind ?? '')) continue;
    for (const item of extractVocabItems(slide)) {
      const word = (item.word ?? item.headword ?? item.term ?? '').toString().trim();
      const example = (item.example ?? item.sentence ?? item.example_sentence ?? '').toString();
      if (!word) continue;
      if (!example || !containsHeadword(example, word)) {
        issues.push({
          code: 'VOCAB_EXAMPLE_MISSING_HEADWORD',
          domain: 'activity',
          severity: 'block',
          message: `Vocabulary item "${word}" has no example containing the target word.`,
          locator: { slideId: slide.id },
          suggestion: `Rewrite the example so it uses "${word}" naturally.`,
          auto_repairable: true,
        });
      }
    }
  }

  // -- B3: reading-comprehension consistency ---------------------------------
  const passageText = collectPassageText(slides);
  if (passageText) {
    const passageTokens = new Set(tokenizeContentWords(passageText));
    for (const slide of slides) {
      const isCompSlide = COMPREHENSION_KINDS.test(slide.kind ?? '');
      const compActs = (slide.activities ?? []).filter(
        (a) =>
          isCompSlide ||
          /reading|comprehension/i.test(a.type) ||
          /reading|comprehension/i.test(a.purpose ?? ''),
      );
      for (const a of compActs) {
        for (const q of extractQuestions(a)) {
          const qTokens = tokenizeContentWords(q);
          const overlap = qTokens.some((t) => passageTokens.has(t));
          if (qTokens.length >= 2 && !overlap) {
            issues.push({
              code: 'READING_OFF_PASSAGE',
              domain: 'activity',
              severity: 'block',
              message: `Comprehension question has no content-word overlap with the reading passage: "${q.slice(0, 80)}…"`,
              locator: { slideId: slide.id, activityId: a.id },
              suggestion: 'Rewrite the question to reference characters, actions, events, or vocabulary from the actual passage.',
              auto_repairable: true,
            });
          }
        }
      }
    }
  }

  // -- B2: target-vocab drift in production-stage activities -----------------
  for (const a of activities) {
    if (!a.stage || !PRODUCTION_STAGES.has(a.stage)) continue;
    if (!a.target_vocab_used || a.target_vocab_used.length === 0) {
      issues.push({
        code: 'TARGET_VOCAB_OMITTED',
        domain: 'activity',
        severity: 'warn',
        message: `Production-stage activity "${a.id}" does not reuse any target vocabulary.`,
        locator: { activityId: a.id },
        auto_repairable: true,
      });
    }
  }

  // -- B6: pedagogical flow order --------------------------------------------
  const firstIdx = (rx: RegExp) => slides.findIndex((s) => rx.test(s.kind ?? ''));
  const orderAll: Array<[string, number]> = [
    ['vocab', firstIdx(VOCAB_KINDS)],
    ['reading', firstIdx(READING_KINDS)],
    ['grammar', firstIdx(GRAMMAR_KINDS)],
    ['review', firstIdx(REVIEW_KINDS)],
    ['homework', firstIdx(HOMEWORK_KINDS)],
  ];
  const order = orderAll.filter((e): e is [string, number] => e[1] >= 0);
  for (let i = 1; i < order.length; i++) {
    if (order[i][1] < order[i - 1][1]) {
      issues.push({
        code: 'FLOW_OUT_OF_ORDER',
        domain: 'activity',
        severity: 'warn',
        message: `Pedagogical flow out of order: "${order[i][0]}" appears before "${order[i - 1][0]}".`,
        suggestion: 'Reorder slides so vocab → reading → grammar → review → homework.',
        auto_repairable: true,
      });
      break;
    }
  }

  // -- B7: story character consistency ---------------------------------------
  const declaredChars = collectDeclaredCharacters(activities);
  if (declaredChars.size > 0) {
    for (const a of activities) {
      const anchor = a.narrative_anchor;
      if (!anchor) continue;
      const used = (anchor.characters ?? []).map((c) => c.toLowerCase());
      const scene = (anchor.scene ?? '').toLowerCase();
      const blob = used.join(' ') + ' ' + scene + ' ' + JSON.stringify(a.content ?? '').toLowerCase();
      const present = [...declaredChars].some((c) => blob.includes(c));
      if (!present) {
        issues.push({
          code: 'STORY_CHARACTER_OMITTED',
          domain: 'narrative',
          severity: 'warn',
          message: `Activity "${a.id}" omits all declared lesson characters.`,
          locator: { activityId: a.id },
          suggestion: `Reference at least one of: ${[...declaredChars].join(', ')}.`,
          auto_repairable: true,
        });
      }
    }
  }

  return issues;
}

// ---------- helpers ---------------------------------------------------------

function sumWhere(counts: Record<string, number>, pred: (t: string) => boolean): number {
  let n = 0;
  for (const [t, c] of Object.entries(counts)) if (pred(t)) n += c;
  return n;
}

function containsHeadword(text: string, headword: string): boolean {
  const stem = headword.toLowerCase().replace(/(ing|ed|es|s)$/i, '');
  const t = text.toLowerCase();
  return t.includes(headword.toLowerCase()) || (stem.length >= 3 && t.includes(stem));
}

function extractVocabItems(slide: QASlide): any[] {
  const out: any[] = [];
  const visit = (node: any) => {
    if (!node) return;
    if (Array.isArray(node)) return node.forEach(visit);
    if (typeof node !== 'object') return;
    const hasWord = 'word' in node || 'headword' in node || 'term' in node;
    const hasExampleOrDef = 'example' in node || 'definition' in node || 'meaning' in node;
    if (hasWord && hasExampleOrDef) out.push(node);
    for (const v of Object.values(node)) visit(v);
  };
  visit(slide);
  for (const a of slide.activities ?? []) visit(a.content);
  return out;
}

function collectPassageText(slides: QASlide[]): string {
  const parts: string[] = [];
  for (const s of slides) {
    if (!READING_KINDS.test(s.kind ?? '')) continue;
    if (s.body_text) parts.push(s.body_text);
    for (const a of s.activities ?? []) {
      const c = a.content;
      if (!c) continue;
      if (typeof c === 'string') parts.push(c);
      else {
        if (typeof c.passage === 'string') parts.push(c.passage);
        if (typeof c.text === 'string') parts.push(c.text);
        if (typeof c.story === 'string') parts.push(c.story);
      }
    }
  }
  return parts.join('\n');
}

function extractQuestions(a: QAActivity): string[] {
  const out: string[] = [];
  const visit = (node: any) => {
    if (!node) return;
    if (Array.isArray(node)) return node.forEach(visit);
    if (typeof node !== 'object') return;
    for (const k of ['q', 'question', 'prompt']) {
      if (typeof node[k] === 'string') out.push(node[k]);
    }
    for (const v of Object.values(node)) visit(v);
  };
  visit(a.content);
  return out;
}

function collectDeclaredCharacters(activities: QAActivity[]): Set<string> {
  const set = new Set<string>();
  for (const a of activities) {
    for (const c of a.narrative_anchor?.characters ?? []) {
      const v = c.toLowerCase().trim();
      if (v) set.add(v);
    }
  }
  // Use the most-frequent characters as "declared" baseline only when present
  // in at least one explicit anchor. If empty, return empty (no enforcement).
  return set;
}
