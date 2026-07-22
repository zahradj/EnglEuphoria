/**
 * Vocab Gamification Arc validator (senior-ai-edtech-architect + esl-game-studio).
 *
 * At Academy & Success, Pre-A1 / A1 / A2 lessons MUST reinforce new lexis with
 * multi-modal retrieval: at minimum one visual (image_match) AND one retrieval
 * (memory-flip matching) activity bound to the lesson vocab.
 *
 * See mem://curriculum/cambridge-pedagogy-contract + academyVocabGamification.
 *
 * Severity: SOFT (warn) — the injector auto-fills the arc; this validator
 * catches lessons that came from external generators bypassing the injector.
 */

import type { QAIssue, QALesson, QASlide } from '../types';

const LOW_CEFR = new Set(['pre-a1', 'prea1', 'a1', 'a2']);

function normalizeCefr(c: string | undefined | null): string {
  return (c ?? '').toString().trim().toLowerCase();
}

function activityTypes(s: QASlide): string[] {
  const kinds = [String((s as any).kind ?? '').toLowerCase()];
  for (const a of s.activities ?? []) {
    kinds.push(String((a as any)?.type ?? '').toLowerCase());
  }
  return kinds;
}

function hasImageMatch(slides: QASlide[]): boolean {
  return slides.some((s) =>
    activityTypes(s).some((k) => k === 'vocab_image_match' || k === 'image_match'),
  );
}

function hasRetrievalGame(slides: QASlide[]): boolean {
  return slides.some((s) => {
    const kinds = activityTypes(s);
    // memory-flip matching, flashcard review, or any explicit `memory` game
    if (kinds.some((k) => k === 'memory' || k === 'flashcard_review')) return true;
    // matching slide with mode === 'memory' lives on the raw slide/activity content
    const contents: any[] = [s as any, ...(s.activities ?? []).map((a) => (a as any)?.content ?? {})];
    return contents.some((c) => c?.mode === 'memory' && (c?.type === 'matching' || kinds.includes('matching')));
  });
}

export function validateVocabGamificationArc(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const cefr = normalizeCefr(lesson.cefr);
  if (!LOW_CEFR.has(cefr)) return issues;

  // Playground uses a locked 7-lesson blueprint that already bakes gamified
  // vocab into every discovery/expansion lesson (playgroundUnitTemplates) —
  // skip to avoid duplicate warnings against blueprint-produced lessons.
  if (lesson.hub === 'Playground') return issues;

  const slides = lesson.slides ?? [];
  if (slides.length === 0) return issues;

  const targets = new Set<string>();
  for (const s of slides) {
    const usedFromSlide = (s as any).target_vocab_used;
    if (Array.isArray(usedFromSlide)) for (const w of usedFromSlide) targets.add(String(w).toLowerCase());
    for (const a of s.activities ?? []) {
      const used = (a as any)?.target_vocab_used;
      if (Array.isArray(used)) for (const w of used) targets.add(String(w).toLowerCase());
    }
  }
  // Arc only needed once the lesson has ≥3 target words (matches injector).
  if (targets.size < 3) return issues;

  if (!hasImageMatch(slides)) {
    issues.push({
      code: 'VOCAB_GAMIFICATION_IMAGE_MATCH_MISSING',
      domain: 'activity',
      severity: 'warn',
      message: `${lesson.hub}/${lesson.cefr}: low-CEFR lesson has ${targets.size} vocab targets but no vocab_image_match. Auto-inject via injectAcademyVocabGamification().`,
      auto_repairable: true,
    });
  }
  if (!hasRetrievalGame(slides)) {
    issues.push({
      code: 'VOCAB_GAMIFICATION_RETRIEVAL_MISSING',
      domain: 'activity',
      severity: 'warn',
      message: `${lesson.hub}/${lesson.cefr}: low-CEFR lesson lacks a retrieval game (memory-matching or flashcard_review). Learners need active recall, not only recognition.`,
      auto_repairable: true,
    });
  }
  return issues;
}
