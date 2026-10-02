/**
 * Pure helpers for the Academy lesson player's robustness layer (no React, unit-tested):
 *  - extractImageUrls: find every image URL inside a slide (so the player can preload what comes next)
 *  - resume storage: remember where a student stopped, across tabs and days, without ever throwing
 *  - slideLabel: a short human title for any slide (slide list, error messages)
 */

const IMG_RE = /^https?:\/\/[^\s]+\.(png|jpe?g|webp|gif|avif)(\?[^\s]*)?$/i;

/** Recursively collect image URLs from a slide's JSON (bounded depth so a weird slide can't hang the player). */
export function extractImageUrls(slide: unknown, max = 24): string[] {
  const out = new Set<string>();
  const walk = (v: unknown, depth: number) => {
    if (out.size >= max || depth > 7 || v == null) return;
    if (typeof v === 'string') {
      if (IMG_RE.test(v)) out.add(v);
      return;
    }
    if (Array.isArray(v)) {
      for (const x of v) walk(x, depth + 1);
      return;
    }
    if (typeof v === 'object') {
      for (const x of Object.values(v as Record<string, unknown>)) walk(x, depth + 1);
    }
  };
  walk(slide, 0);
  return [...out];
}

const TYPE_LABELS: Record<string, string> = {
  intro: 'Cover', poll: 'Poll', scene_dialogue: 'Dialogue', find_in_scene_game: 'Find it', question: 'Your answer',
  vocab_deck: 'New words', vocab_image_match: 'Match pictures', matching: 'Matching', story_page: 'Story',
  reading_passage: 'Reading', truefalse: 'True or false', multiple: 'Choose', listening: 'Listening',
  grammar_color_decode: 'Grammar', grammar_pattern: 'Grammar pattern', grammar_formula: 'Grammar formula',
  error_detection: 'Spot the mistake', correction: 'Fix it', fill_blank: 'Fill the gap', sentence_builder: 'Build the sentence',
  canvas_game: 'Drag game', conversation_fill: 'Chat', sound_challenge_game: 'Sound challenge', escape_room_slot: 'Escape room',
  expedition_game: 'Expedition', speaking_task: 'Speaking', role_play: 'Role-play', debate_scale: 'Opinion',
  reflection: 'Reflection', lesson_summary: 'Recap',
};

export function slideLabel(slide: any): string {
  if (!slide) return 'Slide';
  const raw = slide.title || slide.word || slide.prompt || slide.question || slide.statement;
  const text = typeof raw === 'string' ? raw.replace(/\s+/g, ' ').trim() : '';
  const kind = TYPE_LABELS[String(slide.type)] ?? String(slide.type ?? 'Slide');
  if (!text) return kind;
  return `${kind} · ${text.length > 46 ? text.slice(0, 45) + '…' : text}`;
}

// ───────────── resume storage ─────────────
export interface ResumeState { i: number; xp: number; max: number; at: number }
const resumeKey = (lessonId: string) => `academy-resume:${lessonId}`;

export function loadResume(lessonId: string, slideCount: number): ResumeState | null {
  try {
    const raw = localStorage.getItem(resumeKey(lessonId));
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<ResumeState>;
    if (typeof v.i !== 'number' || !Number.isFinite(v.i)) return null;
    // Ignore stale/invalid positions (lesson was edited and is now shorter, negative, etc).
    if (v.i < 0 || v.i >= slideCount) return null;
    return {
      i: Math.floor(v.i),
      xp: Number.isFinite(v.xp) ? Math.max(0, Math.floor(v.xp as number)) : 0,
      max: Number.isFinite(v.max) ? Math.min(slideCount - 1, Math.max(v.i, Math.floor(v.max as number))) : v.i,
      at: typeof v.at === 'number' ? v.at : 0,
    };
  } catch {
    return null;
  }
}

export function saveResume(lessonId: string, state: Omit<ResumeState, 'at'>) {
  try {
    localStorage.setItem(resumeKey(lessonId), JSON.stringify({ ...state, at: Date.now() }));
  } catch {
    /* storage can be blocked/full (private mode) — resume just won't persist */
  }
}

export function clearResume(lessonId: string) {
  try {
    localStorage.removeItem(resumeKey(lessonId));
  } catch {
    /* ignore */
  }
}

export function prefersReducedMotion(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
