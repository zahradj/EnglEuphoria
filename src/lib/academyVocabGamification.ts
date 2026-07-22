/**
 * Academy Vocab Gamification (Skills: senior-ai-edtech-architect + esl-game-studio)
 *
 * Pedagogical rationale (CELTA/Cambridge):
 *   Pre-A1 / A1 / A2 learners need multi-modal exposure to memorize new lexis:
 *   see → match → recall. A single vocab card is not enough — we auto-inject a
 *   3-slide reinforcement mini-arc after the vocab block:
 *
 *     A) vocab_image_match  — visual anchor (drag word ↔ image)
 *     B) matching (memory)  — retrieval via card-flip
 *     C) matching           — form binding (word ↔ definition)
 *
 * Every injected slide is bound to the lesson's `target_vocabulary`
 * (ReinforcementTarget, per G0 of esl-game-studio contract). No target → no games.
 *
 * Contract:
 *   - `image_url` stays "" so the existing image pipelines / bulk-image tools
 *     can fill them later (per Visual Architect V0: no fake URLs at gen time).
 *   - Only fires for Pre-A1 / A1 / A2 (hub × CEFR aware).
 *   - Skips if a vocab_image_match or memory-mode matching slide already exists
 *     in the lesson (avoids duplication when the AI already gamified).
 *   - Requires ≥3 target words. Below that, retrieval games are noisy.
 */

type AnySlide = Record<string, any>;

const LOW_CEFR = new Set(['Pre-A1', 'PreA1', 'pre-a1', 'A0', 'A1', 'A2']);

function normalizeCefr(cefr?: string | null): string {
  if (!cefr) return '';
  return cefr.trim();
}

function isLowCefr(cefr?: string | null): boolean {
  const c = normalizeCefr(cefr);
  return LOW_CEFR.has(c);
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
  examples: Record<string, string>;
} {
  const definitions: Record<string, string> = {};
  const examples: Record<string, string> = {};
  const capture = (word: unknown, def: unknown, ex: unknown) => {
    if (typeof word !== 'string') return;
    const key = word.trim().toLowerCase();
    if (!key) return;
    if (typeof def === 'string' && def.trim()) definitions[key] = def.trim();
    if (typeof ex === 'string' && ex.trim()) examples[key] = ex.trim();
  };
  for (const s of slides) {
    if (!s || typeof s !== 'object') continue;
    if (s.type === 'vocab') capture(s.word, s.definition, s.example);
    if (s.type === 'vocab_deck' && Array.isArray(s.cards)) {
      for (const c of s.cards) capture(c?.word, c?.definition, c?.example);
    }
  }
  return { definitions, examples };
}

// Backwards-compat alias for prior callers.
function collectVocabDefinitions(slides: AnySlide[]): Record<string, string> {
  return collectVocabMeta(slides).definitions;
}

/**
 * Build the 3-slide reinforcement arc, bound to `words`.
 * Returns [] if the target list is too small or empty.
 */
export function buildAcademyVocabGamificationArc(
  words: string[],
  definitions: Record<string, string> = {},
  examples: Record<string, string> = {},
): AnySlide[] {
  const clean = (words || [])
    .map((w) => (typeof w === 'string' ? w.trim() : ''))
    .filter((w) => w.length > 0);
  if (clean.length < 3) return [];

  const pool = clean.slice(0, 6); // cap: 6 words per game keeps UX tight (~60s each)

  // Telemetry tags let the Intelligence + Memory observers credit retrieval to
  // the injected arc (memory_review_history / learner_signals). Downstream
  // renderers can key on `source === ACADEMY_VOCAB_GAMIFICATION_SOURCE` to
  // emit `review_attempt` / `recall_success|fail` events per G0 bindings.
  const SRC = ACADEMY_VOCAB_GAMIFICATION_SOURCE;

  const imageMatch: AnySlide = {
    type: 'vocab_image_match',
    block: 'vocab',
    prompt: 'Drag each word onto the matching picture.',
    objective: {
      title: 'Bind the word to its image',
      skill: 'Receptive vocabulary',
      how: 'Tap a word, then tap the picture that shows it.',
    },
    pairs: pool.map((w) => ({
      word: w,
      image_url: '', // filled later by bulk-image tools (Visual Architect V3)
      image_prompt: `A single ${w} on a soft pastel illustrated background, centered, semi-realistic anime style, soft cel-shading, blue/purple accents, thick outlines. STYLE: Academy — semi-realistic anime. SINGLE PANEL, no diptych, no grid, no collage. NO TEXT, NO SPEECH BUBBLES, NO LETTERS, NO WATERMARK, NO UI CHROME, NO SOFTWARE EDITING BACKGROUND, NO CHECKERBOARD, NO COLOR PICKER, NO TOOLBAR, NO PHOTOSHOP/CANVA ARTIFACTS. Clean illustrated background only.`,
    })),
    source: SRC,
    telemetry_tag: 'vocab_arc_image_match',
    reinforcement_target: {
      skill_key: 'vocab_recognition',
      target_words: pool,
    },
  };

  // Contextual retrieval: pair each word with an example sentence that has the
  // headword blanked. Falls back to the definition when no example exists.
  // This is pedagogically meaningful — unlike arbitrary index tokens.
  const cloze = (word: string, sentence: string): string => {
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'ig');
    const blanked = sentence.replace(re, '_____');
    return blanked === sentence ? sentence : blanked;
  };
  const memoryPool = pool.slice(0, 4);
  const memoryPairs = memoryPool
    .map((w) => {
      const key = w.toLowerCase();
      const ex = examples[key] ?? '';
      const right = ex ? cloze(w, ex) : (definitions[key] || '').trim();
      return { left: w, right };
    })
    .filter((p) => p.right && p.right.length > 0);
  const memory: AnySlide | null =
    memoryPairs.length >= 3
      ? {
          type: 'matching',
          block: 'vocab',
          prompt: 'Match each word to the sentence it belongs in.',
          objective: {
            title: 'Recall the word in context',
            skill: 'Word ↔ context retrieval',
            how: 'Read the sentence with a blank, tap the word that fits.',
          },
          pairs: memoryPairs,
          source: SRC,
          telemetry_tag: 'vocab_arc_context',
          reinforcement_target: {
            skill_key: 'vocab_retrieval',
            target_words: memoryPairs.map((p) => p.left),
          },
        }
      : null;

  const defPairs = pool
    .map((w) => ({
      left: w,
      right: (definitions[w.toLowerCase()] || '').trim(),
    }))
    .filter((p) => p.right.length > 0);
  const definitionMatch: AnySlide | null =
    defPairs.length >= 3
      ? {
          type: 'matching',
          block: 'vocab',
          prompt: 'Match each word to its meaning.',
          objective: {
            title: 'Bind form to meaning',
            skill: 'Productive vocabulary',
            how: 'Tap a word, then tap the definition that matches.',
          },
          pairs: defPairs,
          source: SRC,
          telemetry_tag: 'vocab_arc_definition',
          reinforcement_target: {
            skill_key: 'vocab_form_meaning',
            target_words: defPairs.map((p) => p.left),
          },
        }
      : null;

  return [imageMatch, memory, definitionMatch].filter(Boolean) as AnySlide[];
}

/**
 * Canonical `source` tag stamped on every injected slide. Renderers and
 * observers key on this to route retrieval events into `memory_review_history`
 * and `learner_signals` for the "Vocab arc lift" KPI.
 */
export const ACADEMY_VOCAB_GAMIFICATION_SOURCE = 'academy_vocab_gamification' as const;

/**
 * Type guard: does this slide belong to the injected reinforcement arc?
 * Use in vocab_image_match / matching renderers to emit observer events.
 */
export function isAcademyVocabGamificationSlide(slide: unknown): boolean {
  return (
    !!slide &&
    typeof slide === 'object' &&
    (slide as AnySlide).source === ACADEMY_VOCAB_GAMIFICATION_SOURCE
  );
}

/**
 * Inject the reinforcement arc into an Academy slide array.
 * No-op unless:
 *   - CEFR ∈ {Pre-A1, A1, A2}
 *   - ≥3 target words provided
 *   - lesson doesn't already contain a gamified vocab slide
 */
import { applyVocabGamesForLesson } from './vocabGamesSlotInjector';
import { applyLanguageEngineForLesson } from './engineSlotInjector';
import { getPinnedEngine } from './engineSlotOverrides';
import type { VocabTarget } from '@/vocab-games';

export function injectAcademyVocabGamification(
  slides: AnySlide[],
  targetWords: string[],
  cefr?: string | null,
  opts?: { lessonNumber?: number; isQuiz?: boolean },
): { slides: AnySlide[]; injected: number } {
  if (!Array.isArray(slides) || slides.length === 0) return { slides, injected: 0 };
  if (!isLowCefr(cefr)) return { slides, injected: 0 };

  let out = slides;
  let injected = 0;

  if (!alreadyHasGamifiedVocab(out)) {
    const meta = collectVocabMeta(out);
    const words =
      (targetWords || []).length > 0
        ? targetWords
        : Object.keys(meta.definitions);
    const arc = buildAcademyVocabGamificationArc(words, meta.definitions, meta.examples);
    if (arc.length > 0) {
      const lastVocabIdx = findLastIndex(out, (s) => s?.type === 'vocab' || s?.type === 'vocab_deck');
      const insertAt = lastVocabIdx >= 0 ? lastVocabIdx + 1 : out.length;
      out = [...out.slice(0, insertAt), ...arc, ...out.slice(insertAt)];
      injected += arc.length;
    }
  }

  // Append the mode-aware games slot (lesson / review / quiz).
  const { definitions, examples } = collectVocabMeta(out);
  const words = (targetWords || []).length > 0 ? targetWords : Object.keys(definitions);
  const targets: VocabTarget[] = words.map((w) => ({
    word: w,
    definition: definitions[w.toLowerCase()],
    example: examples[w.toLowerCase()],
  }));
  const slot = applyVocabGamesForLesson(out, {
    hub: 'academy',
    cefr: (cefr || 'A1') as any,
    targets,
    lessonNumber: opts?.lessonNumber,
    isQuiz: opts?.isQuiz,
  });
  out = slot.slides;
  injected += slot.injected;

  // Append one richer immersive engine slot (Story / Escape / Detective / Hidden)
  // after the core vocab games. This keeps the lesson objective-led while giving
  // Academy lessons a structured, game-like practice experience.
  const pinnedEngine =
    getPinnedEngine(`academy:l${opts?.lessonNumber ?? ''}`) ??
    getPinnedEngine('academy') ??
    undefined;
  const engine = applyLanguageEngineForLesson(out, {
    hub: 'academy',
    cefr: (cefr || 'A1') as any,
    targets,
    lessonNumber: opts?.lessonNumber,
    mode: opts?.isQuiz ? 'quiz' : opts?.lessonNumber === 6 ? 'review' : 'lesson',
    engineType: pinnedEngine,
  });
  out = engine.slides;
  injected += engine.injected;

  return { slides: out, injected };
}
