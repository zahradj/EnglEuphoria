// Story Continuity (Phase 7).
// Recurring characters, evolving setting, connected arc — not random questions.
// SOFT warnings unless egregious (then block via density threshold).

import type { QAIssue, QALesson, QASlide } from '../types';
import { allText } from '../util/text';

function slideText(s: QASlide): string {
  const parts: string[] = [];
  if (s.title) parts.push(s.title);
  if (s.body_text) parts.push(s.body_text);
  if (s.grammar_explanation) parts.push(s.grammar_explanation);
  (s.examples ?? []).forEach((e) => parts.push(e));
  for (const a of s.activities ?? []) {
    parts.push(JSON.stringify((a as any).content ?? {}));
  }
  return parts.join(' \n ').toLowerCase();
}

function extractCharacters(lesson: QALesson): string[] {
  const top: any = lesson as any;
  const cands: string[] =
    top?.characters ??
    top?.narrative?.characters ??
    top?.theme?.characters ??
    [];
  return cands
    .filter((c) => typeof c === 'string')
    .map((c) => c.toLowerCase().trim())
    .filter(Boolean);
}

export function validateStoryContinuity(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const slides = lesson.slides ?? [];
  if (slides.length < 3) return issues;

  const characters = extractCharacters(lesson);
  // Skip if the lesson didn't declare characters — narrativeConsistency handles that.
  if (characters.length === 0) return issues;

  const tasked = slides.filter((s) => (s.activities ?? []).length > 0);
  if (tasked.length === 0) return issues;

  const slidesWithChar = tasked.filter((s) => {
    const txt = slideText(s);
    return characters.some((c) => c && txt.includes(c));
  });

  const ratio = slidesWithChar.length / tasked.length;

  if (ratio < 0.4) {
    issues.push({
      code: 'STORY_CONTINUITY_LOW',
      domain: 'narrative',
      severity: 'block',
      message: `Recurring characters appear in only ${Math.round(
        ratio * 100,
      )}% of task slides (min 40%). Lesson feels disconnected.`,
      auto_repairable: true,
    });
  } else if (ratio < 0.6) {
    issues.push({
      code: 'STORY_CONTINUITY_WEAK',
      domain: 'narrative',
      severity: 'warn',
      message: `Character presence ${Math.round(
        ratio * 100,
      )}% — strengthen recurring cast across activities.`,
      auto_repairable: true,
    });
  }

  // Check that ≥1 mid/late slide references an earlier slide's scene/object
  // via shared content nouns (very light heuristic: shared 4+-letter token).
  if (slides.length >= 6) {
    const earlyTokens = new Set(
      tokens(slideText(slides[1] ?? slides[0])).filter((t) => t.length >= 5),
    );
    const latePart = slides.slice(Math.floor(slides.length / 2));
    const carriesOver = latePart.some((s) =>
      tokens(slideText(s)).some((t) => earlyTokens.has(t)),
    );
    if (!carriesOver) {
      issues.push({
        code: 'STORY_ARC_DISCONNECTED',
        domain: 'narrative',
        severity: 'warn',
        message:
          'Later slides do not echo objects/scenes from the opening — story arc feels broken.',
        auto_repairable: true,
      });
    }
  }

  return issues;
}

function tokens(s: string): string[] {
  return (s.toLowerCase().match(/[a-z]{3,}/g) ?? []) as string[];
}
