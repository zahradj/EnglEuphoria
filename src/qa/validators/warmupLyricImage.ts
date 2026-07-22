// Visual Architect §V2 — warm-up image must mirror the chant/song lyrics.
// Soft, auto-repairable: triggers prompt regeneration so the warm-up scene
// reflects what the learner is singing rather than the lesson title alone.

import type { QAIssue, QALesson, QASlide } from '../types';
import { tokenizeContentWords } from '@/governance/data/stopwords';

const WARMUP_KINDS = new Set(['warmup', 'warm_up', 'warm-up', 'song', 'chant']);

function extractLyrics(slide: QASlide): string | undefined {
  const c: any = (slide as any).content ?? {};
  const candidates = [
    slide.body_text,
    c.lyrics,
    c.chant,
    c.song?.lyrics,
    c.song?.text,
    c.text,
  ];
  const hit = candidates.find((x) => typeof x === 'string' && x.trim().length > 6);
  return typeof hit === 'string' ? hit : undefined;
}

function getImagePrompt(slide: QASlide): string | undefined {
  const direct = (slide as any).image_prompt;
  if (typeof direct === 'string' && direct.trim()) return direct;
  const nested = (slide as any).content?.image_prompt;
  if (typeof nested === 'string' && nested.trim()) return nested;
  return undefined;
}

export function validateWarmupLyricImage(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  for (const slide of lesson.slides ?? []) {
    if (!WARMUP_KINDS.has((slide.kind ?? '').toLowerCase())) continue;
    const lyrics = extractLyrics(slide);
    const prompt = getImagePrompt(slide);
    if (!lyrics || !prompt) continue;

    const lyricTokens = new Set(tokenizeContentWords(lyrics).map((t) => t.toLowerCase()));
    if (lyricTokens.size === 0) continue;
    const promptTokens = tokenizeContentWords(prompt).map((t) => t.toLowerCase());
    const overlap = promptTokens.some((t) => lyricTokens.has(t));
    if (overlap) continue;

    const anchors = [...lyricTokens].slice(0, 6);
    const anchorList = anchors.length ? anchors.join(', ') : 'the chant key words';
    issues.push({
      code: 'WARMUP_IMAGE_OFF_LYRICS',
      domain: 'structural',
      severity: 'warn',
      message: `Warm-up slide ${slide.id} image_prompt does not reference the chant lyrics.`,
      locator: { slideId: slide.id, path: 'image_prompt' },
      suggestion: `Rewrite the warm-up prompt to visibly depict at least one of these lyric content words: ${anchorList}. The character should be performing the lyric's action (e.g. "clapping while pointing at mom and dad").`,
      auto_repairable: true,
    });
  }
  return issues;
}
