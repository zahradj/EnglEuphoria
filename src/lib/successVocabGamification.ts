/**
 * Success Vocab Gamification (Skills: senior-ai-edtech-architect + esl-game-studio)
 *
 * Adult / Business English variant of the Academy arc. Applies at A2 / B1 / B2
 * (Success caps at C1 — proficient learners rely on retrieval alone, so C1 is
 * intentionally skipped). Professional copy, editorial flat illustration
 * prompts (green/teal accents), no emojis.
 *
 * Injection contract mirrors academyVocabGamification:
 *   - `image_url` stays "" for bulk-image tools
 *   - Skips if AI already gamified vocab
 *   - Requires ≥3 target words
 *   - Stamps `source: SUCCESS_VOCAB_GAMIFICATION_SOURCE` for telemetry
 */

type AnySlide = Record<string, any>;

export const SUCCESS_VOCAB_GAMIFICATION_SOURCE = 'success_vocab_gamification' as const;

const SUCCESS_CEFR = new Set(['A2', 'B1', 'B2']);

function normalize(cefr?: string | null): string {
  return (cefr ?? '').toString().trim();
}
function isSuccessCefr(cefr?: string | null): boolean {
  return SUCCESS_CEFR.has(normalize(cefr));
}
function findLastIndex<T>(arr: T[], pred: (x: T) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) if (pred(arr[i])) return i;
  return -1;
}
function alreadyHasGamifiedVocab(slides: AnySlide[]): boolean {
  return slides.some((s) => {
    if (!s || typeof s !== 'object') return false;
    if (s.type === 'vocab_image_match') return true;
    if (s.type === 'matching' && s.block === 'vocab' && s.mode === 'memory') return true;
    return false;
  });
}
function collectVocabMeta(slides: AnySlide[]): {
  definitions: Record<string, string>;
} {
  const definitions: Record<string, string> = {};
  const capture = (word: unknown, def: unknown) => {
    if (typeof word !== 'string') return;
    const key = word.trim().toLowerCase();
    if (!key) return;
    if (typeof def === 'string' && def.trim()) definitions[key] = def.trim();
  };
  for (const s of slides) {
    if (!s || typeof s !== 'object') continue;
    if (s.type === 'vocab') capture(s.word, s.definition);
    if (s.type === 'vocab_deck' && Array.isArray(s.cards)) {
      for (const c of s.cards) capture(c?.word, c?.definition);
    }
  }
  return { definitions };
}

const SUCCESS_STYLE_TAIL =
  'STYLE: Success — editorial flat illustration, muted professional palette, green/teal accents. ' +
  'SINGLE PANEL, no diptych, no grid, no collage. NO TEXT, NO SPEECH BUBBLES, NO LETTERS, NO WATERMARK, ' +
  'NO UI CHROME, NO SOFTWARE EDITING BACKGROUND, NO CHECKERBOARD, NO COLOR PICKER, NO TOOLBAR, ' +
  'NO PHOTOSHOP/CANVA ARTIFACTS. Clean illustrated background only.';

export function buildSuccessVocabGamificationArc(
  words: string[],
  definitions: Record<string, string> = {},
): AnySlide[] {
  const clean = (words || [])
    .map((w) => (typeof w === 'string' ? w.trim() : ''))
    .filter((w) => w.length > 0);
  if (clean.length < 3) return [];
  const pool = clean.slice(0, 6);
  const SRC = SUCCESS_VOCAB_GAMIFICATION_SOURCE;

  const imageMatch: AnySlide = {
    type: 'vocab_image_match',
    block: 'vocab',
    prompt: 'Match each term to the corresponding visual.',
    pairs: pool.map((w) => ({
      word: w,
      image_url: '',
      image_prompt: `A concise editorial illustration representing "${w}" in a professional business context, centered on a clean muted background. ${SUCCESS_STYLE_TAIL}`,
    })),
    source: SRC,
    telemetry_tag: 'vocab_arc_image_match',
    reinforcement_target: { skill_key: 'vocab_recognition', target_words: pool },
  };

  const memory: AnySlide = {
    type: 'matching',
    block: 'vocab',
    prompt: 'Card-flip recall: pair each term with its match.',
    mode: 'memory',
    pairs: pool.slice(0, 4).map((w, i) => ({ left: w, right: `Item ${i + 1}` })),
    source: SRC,
    telemetry_tag: 'vocab_arc_memory',
    reinforcement_target: { skill_key: 'vocab_retrieval', target_words: pool.slice(0, 4) },
  };

  const defPairs = pool
    .map((w) => ({ left: w, right: (definitions[w.toLowerCase()] || '').trim() }))
    .filter((p) => p.right.length > 0);
  const definitionMatch: AnySlide | null =
    defPairs.length >= 3
      ? {
          type: 'matching',
          block: 'vocab',
          prompt: 'Match each term to its professional definition.',
          pairs: defPairs,
          source: SRC,
          telemetry_tag: 'vocab_arc_definition',
          reinforcement_target: {
            skill_key: 'vocab_form_meaning',
            target_words: defPairs.map((p) => p.left),
          },
        }
      : null;

  return definitionMatch ? [imageMatch, memory, definitionMatch] : [imageMatch, memory];
}

export function isSuccessVocabGamificationSlide(slide: unknown): boolean {
  return (
    !!slide &&
    typeof slide === 'object' &&
    (slide as AnySlide).source === SUCCESS_VOCAB_GAMIFICATION_SOURCE
  );
}

import { applyVocabGamesForLesson } from './vocabGamesSlotInjector';
import { applyLanguageEngineForLesson } from './engineSlotInjector';
import { getPinnedEngine } from './engineSlotOverrides';
import type { VocabTarget } from '@/vocab-games';

export function injectSuccessVocabGamification(
  slides: AnySlide[],
  targetWords: string[],
  cefr?: string | null,
  opts?: { lessonNumber?: number; isQuiz?: boolean },
): { slides: AnySlide[]; injected: number } {
  if (!Array.isArray(slides) || slides.length === 0) return { slides, injected: 0 };
  if (!isSuccessCefr(cefr)) return { slides, injected: 0 };

  let out = slides;
  let injected = 0;

  if (!alreadyHasGamifiedVocab(out)) {
    const { definitions } = collectVocabMeta(out);
    const words = (targetWords || []).length > 0 ? targetWords : Object.keys(definitions);
    const arc = buildSuccessVocabGamificationArc(words, definitions);
    if (arc.length > 0) {
      const lastVocabIdx = findLastIndex(
        out,
        (s) => s?.type === 'vocab' || s?.type === 'vocab_deck',
      );
      const insertAt = lastVocabIdx >= 0 ? lastVocabIdx + 1 : out.length;
      out = [...out.slice(0, insertAt), ...arc, ...out.slice(insertAt)];
      injected += arc.length;
    }
  }

  // Append the mode-aware games slot (lesson / review / quiz).
  const { definitions } = collectVocabMeta(out);
  const words = (targetWords || []).length > 0 ? targetWords : Object.keys(definitions);
  const targets: VocabTarget[] = words.map((w) => ({
    word: w,
    definition: definitions[w.toLowerCase()],
  }));
  const slot = applyVocabGamesForLesson(out, {
    hub: 'success',
    cefr: (cefr || 'B1') as any,
    targets,
    lessonNumber: opts?.lessonNumber,
    isQuiz: opts?.isQuiz,
  });
  out = slot.slides;
  injected += slot.injected;

  // Add one objective-led immersive language engine after the standard vocab
  // slot so Success lessons get professional, structured practice rather than
  // loose mini-games.
  const pinnedEngine =
    getPinnedEngine(`success:l${opts?.lessonNumber ?? ''}`) ??
    getPinnedEngine('success') ??
    undefined;
  const engine = applyLanguageEngineForLesson(out, {
    hub: 'success',
    cefr: (cefr || 'B1') as any,
    targets,
    lessonNumber: opts?.lessonNumber,
    mode: opts?.isQuiz ? 'quiz' : opts?.lessonNumber === 6 ? 'review' : 'lesson',
    engineType: pinnedEngine,
  });
  out = engine.slides;
  injected += engine.injected;

  return { slides: out, injected };
}
