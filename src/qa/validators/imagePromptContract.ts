// Visual Architect contract validator (V7 checklist enforcement).
// - Intro card image_prompt MUST mention the lesson topic or a target vocab item
//   (topic-mirror rule — kills generic "kids at school" fallback).
// - Any image_prompt that mentions forbidden software-UI / checkerboard / text
//   chrome is flagged so the repair loop rewrites it.
//
// Designed to be cheap, deterministic, and complementary to existing
// imageIntegrity + topicImmersion + introSlide validators.

import type { QAIssue, QALesson, QASlide } from '../types';
import { tokenizeContentWords } from '@/governance/data/stopwords';

const FORBIDDEN_PHRASES = [
  'checkerboard',
  'photoshop',
  'canva',
  'color picker',
  'toolbar',
  'software ui',
  'editing background',
  'transparent background grid',
];

const INTRO_KINDS = new Set(['intro', 'lesson_intro', 'opening']);

function collectThemeTokens(lesson: QALesson): Set<string> {
  const set = new Set<string>();
  const add = (s?: string) => {
    if (!s) return;
    for (const t of tokenizeContentWords(s)) set.add(t.toLowerCase());
  };
  add(lesson.title);
  add(lesson.communication_objective);
  for (const slide of lesson.slides ?? []) {
    for (const a of slide.activities ?? []) {
      for (const v of a.target_vocab_used ?? []) add(v);
      for (const c of a.narrative_anchor?.characters ?? []) add(c);
      add(a.narrative_anchor?.setting);
    }
  }
  return set;
}

function getImagePrompt(slide: QASlide): string | undefined {
  const direct = (slide as any).image_prompt;
  if (typeof direct === 'string' && direct.trim()) return direct;
  const nested = (slide as any).content?.image_prompt;
  if (typeof nested === 'string' && nested.trim()) return nested;
  return undefined;
}

function* allImagePrompts(lesson: QALesson): Generator<{ slide: QASlide; prompt: string; path: string }> {
  for (const slide of lesson.slides ?? []) {
    const p = getImagePrompt(slide);
    if (p) yield { slide, prompt: p, path: `slide:${slide.id}.image_prompt` };
    for (const a of slide.activities ?? []) {
      const ap = (a as any)?.image_prompt ?? (a as any)?.content?.image_prompt;
      if (typeof ap === 'string' && ap.trim()) {
        yield { slide, prompt: ap, path: `slide:${slide.id}.activity:${a.id}.image_prompt` };
      }
    }
  }
}

export function validateImagePromptContract(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const theme = collectThemeTokens(lesson);

  // 1) Intro topic-mirror — HARD block.
  const intro = (lesson.slides ?? []).find((s) => INTRO_KINDS.has((s.kind ?? '').toLowerCase()));
  if (intro && theme.size > 0) {
    const prompt = getImagePrompt(intro);
    if (prompt) {
      const tokens = tokenizeContentWords(prompt).map((t) => t.toLowerCase());
      const onTopic = tokens.some((t) => theme.has(t));
      if (!onTopic) {
        const anchors = [...theme].slice(0, 6);
        const anchorList = anchors.length ? anchors.join(', ') : 'the lesson topic';
        issues.push({
          code: 'INTRO_IMAGE_OFF_TOPIC',
          domain: 'structural',
          severity: 'block',
          message: `Intro slide ${intro.id} image_prompt does not reference the lesson topic or any target vocab. Got: "${prompt.slice(0, 100)}…".`,
          locator: { slideId: intro.id, path: 'image_prompt' },
          suggestion: `Rewrite the intro image_prompt to visibly include at least one of these anchor nouns: ${anchorList}. The lead character should be holding, pointing at, or surrounded by the topic anchor (e.g. Family→family group; Food→market stall with target foods).`,
          auto_repairable: true,
        });
      }
    }
  }

  // 2) Forbidden software-UI / chrome phrases in any image_prompt — soft warn,
  // auto-repair (the prompt builder should strip them and append the guard tail).
  for (const { slide, prompt, path } of allImagePrompts(lesson)) {
    const lower = prompt.toLowerCase();
    const hit = FORBIDDEN_PHRASES.find((p) => lower.includes(p));
    if (hit) {
      issues.push({
        code: 'IMAGE_PROMPT_FORBIDDEN_CHROME',
        domain: 'activity',
        severity: 'warn',
        message: `image_prompt mentions forbidden chrome term "${hit}" at ${path}.`,
        locator: { slideId: slide.id, path: 'image_prompt' },
        suggestion: 'Remove software/editor UI references; rely on the Visual Architect guard tail.',
        auto_repairable: true,
      });
    }
  }

  return issues;
}
