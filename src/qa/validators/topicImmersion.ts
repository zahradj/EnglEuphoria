// Topic-immersion lock — every example sentence, drill stem, roleplay line, and
// activity prompt must reference the lesson's theme (theme tokens + characters +
// setting) or a target vocab item. Flags off-theme filler like
// "Leo doesn't like broccoli" when the lesson theme is mystery/soccer.

import type { QAIssue, QALesson, QASlide } from '../types';
import { tokenizeContentWords } from '@/governance/data/stopwords';

const STAGE_RX = /vocab|grammar|reading|practice|roleplay|speaking|production|review/i;

export function validateTopicImmersion(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const themeTokens = collectThemeTokens(lesson);
  if (themeTokens.size === 0) return issues;

  for (const slide of lesson.slides ?? []) {
    if (!STAGE_RX.test(slide.kind ?? '')) continue;
    for (const a of slide.activities ?? []) {
      for (const sentence of extractExampleSentences(a.content)) {
        const trimmed = sentence.trim();
        if (trimmed.length < 12) continue; // ignore one-word answers
        const tokens = tokenizeContentWords(trimmed).map((t) => t.toLowerCase());
        if (tokens.length < 3) continue;
        const onTheme = tokens.some((t) => themeTokens.has(t));
        if (!onTheme) {
          issues.push({
            code: 'OFF_THEME_FILLER',
            domain: 'narrative',
            severity: 'warn',
            message: `Off-theme example on slide ${slide.id}: "${trimmed.slice(0, 80)}"`,
            locator: { slideId: slide.id, activityId: a.id },
            suggestion: 'Rewrite within the declared theme/characters/setting or use a target vocab word.',
            auto_repairable: true,
          });
        }
      }
    }
  }

  return issues;
}

function collectThemeTokens(lesson: QALesson): Set<string> {
  const set = new Set<string>();
  const add = (s?: string) => {
    if (!s) return;
    for (const t of tokenizeContentWords(s)) set.add(t.toLowerCase());
  };
  add(lesson.title);
  add(lesson.communication_objective);

  for (const slide of lesson.slides ?? []) {
    add(slide.title);
    for (const a of slide.activities ?? []) {
      for (const c of a.narrative_anchor?.characters ?? []) add(c);
      add(a.narrative_anchor?.setting);
      add(a.narrative_anchor?.scene);
      for (const v of a.target_vocab_used ?? []) add(v);
    }
  }
  return set;
}

function extractExampleSentences(content: any): string[] {
  const out: string[] = [];
  const visit = (n: any) => {
    if (!n) return;
    if (typeof n === 'string') {
      // Only treat sentence-like strings (contain a verb-ish space).
      if (/[A-Za-z].* .*[.!?]?$/.test(n) && n.length >= 12) out.push(n);
      return;
    }
    if (Array.isArray(n)) return n.forEach(visit);
    if (typeof n !== 'object') return;
    for (const k of ['example', 'sentence', 'prompt', 'text', 'cue', 'expected', 'line', 'starter']) {
      if (typeof n[k] === 'string') out.push(n[k]);
    }
    for (const v of Object.values(n)) visit(v);
  };
  visit(content);
  return out;
}
