/**
 * Runtime validator for Little Explorers Playground scenes.
 *
 * Ported from the reference "Little Explorers Phonics" authoring framework
 * (lessonValidator.ts / lessonSchema.ts) and adapted to this repo's actual
 * Scene union (`./scenes.ts`) and SceneRenderer.tsx switch — the kind list,
 * cast, and the song-field rule below were verified against our real
 * content rather than copied blind (our lessons legitimately ship both
 * songUrl AND songPrompt together, so that check is OR here, not XOR).
 */
import { z } from 'zod';

/** Every `who` a scene can name — must match SceneRenderer.tsx + audio.ts's Character type. */
export const CANONICAL_CAST = ['pip', 'mia', 'bella', 'willow', 'leo', 'teacher', 'narrator'] as const;
export type CanonicalCast = (typeof CANONICAL_CAST)[number];

/** join-stage `turns[].who` is allowed to be the literal 'student' in addition to cast. */
const CAST_PLUS_STUDENT = new Set<string>([...CANONICAL_CAST, 'student']);

/** Every kind SceneRenderer.tsx actually has a `case` for. Keep in sync with that switch. */
export const SCENE_KINDS = [
  'title-card', 'cinematic', 'meet', 'sound-model', 'echo', 'basket', 'trace',
  'sound-sort', 'word-build', 'who-said-it', 'gather', 'memory', 'dash',
  'feelings', 'puzzle', 'roleplay', 'join-stage', 'hello-doors', 'color-friends',
  'alphabet-blocks', 'alphabet-order', 'song', 'finale', 'name-gate',
  'meet-group', 'voice-stage', 'sound-pop', 'brick-crush', 'friend-pop',
  'feelings-tap', 'feelings-wheel', 'x-is-feeling', 'feelings-dice',
  'feed-monsters', 'he-she-model', 'he-she-sort', 'he-she-say',
  'feeling-quiz', 'i-am-feeling', 'feelings-bingo',
  'numbers-learn', 'numbers-review', 'candle-cake', 'count-balloons',
  'age-balloons', 'age-sentence-match', 'meet-greet', 'age-quiz',
  'trophy-chest', 'flipbook', 'color-model', 'color-sort', 'color-quiz', 'listen-repeat-cards',
  'color-spot', 'shape-model', 'shape-sort', 'color-spy', 'color-simon', 'color-mix', 'shape-builder', 'secret-card', 'listen-colour', 'shape-fishing', 'pattern-train', 'tick-cross', 'story-order', 'story-video', 'odd-one-out', 'shape-torch', 'mystery-bag', 'tpr-actions', 'rapid-recall', 'sticker-reward', 'home-mission', 'lift-flap', 'draw-path', 'tile-reveal', 'tidy-up', 'color-monsters', 'peek-pop', 'claw-machine', 'ring-toss', 'simon-touch', 'body-stack', 'face-builder', 'sound-pick', 'sand-prints', 'shape-magic', 'shape-peek', 'shape-sorter', 'shape-bubbles', 'monster-maker', 'count-parts', 'robo-copy', 'move-match', 'part-peek', 'family-photo', 'size-line', 'shadow-match', 'stepping-stones', 'catch-sort', 'spin-wheel', 'toy-model',
  'plural-sort', 'train-recall',
  'first-sound', 'letter-match', 'letter-blocks', 'whats-missing', 'sort-basket', 'grammar-gap',
  'sentence-build', 'word-picture-match', 'jigsaw-puzzle',
] as const;
export type SceneKindName = (typeof SCENE_KINDS)[number];

export const SceneSchema = z.object({
  id: z.string().min(1),
  kind: z.string().min(1),
}).passthrough();

export type SceneLike = z.infer<typeof SceneSchema>;

export type ValidationIssue = {
  level: 'error' | 'warning';
  code: string;
  message: string;
  sceneId?: string;
};

export type ValidationResult = {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
};

export type ValidationContext = {
  lessonNumber: number | string;
  targetLetters?: string[]; // e.g. ["S", "A"] — recycling checks
  targetVocab?: string[];   // words expected to appear >=3x
  minScenes?: number;       // default 15
  maxScenes?: number;       // default 32
};

const BANNED_PLACEHOLDERS = ['lorem', 'ipsum', 'TODO:', 'say something', 'placeholder'];

export function validateLesson(scenes: unknown[], ctx: ValidationContext): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // ---- Basic shape parse -------------------------------------------------
  const parsed: SceneLike[] = [];
  scenes.forEach((raw, i) => {
    const result = SceneSchema.safeParse(raw);
    if (!result.success) {
      errors.push({
        level: 'error',
        code: 'shape',
        message: `Scene at index ${i} failed schema: ${result.error.issues.map((x) => x.message).join(', ')}`,
      });
      return;
    }
    parsed.push(result.data);
  });

  // ---- Unique IDs ---------------------------------------------------------
  const seen = new Map<string, number>();
  parsed.forEach((s) => seen.set(s.id, (seen.get(s.id) ?? 0) + 1));
  for (const [id, count] of seen) {
    if (count > 1) errors.push({ level: 'error', code: 'dup-id', message: `Duplicate scene id "${id}" (${count}x)`, sceneId: id });
  }

  // ---- Kind whitelist -------------------------------------------------------
  const knownKinds = new Set<string>(SCENE_KINDS);
  parsed.forEach((s) => {
    if (!knownKinds.has(s.kind)) {
      errors.push({ level: 'error', code: 'unknown-kind', message: `Unknown scene kind "${s.kind}" — SceneRenderer.tsx has no case for it`, sceneId: s.id });
    }
  });

  // ---- Cast membership ------------------------------------------------------
  const checkCast = (val: unknown, sceneId: string, field: string, allowStudent = false) => {
    if (typeof val !== 'string' || val.length === 0) return;
    const isKnown = allowStudent
      ? CAST_PLUS_STUDENT.has(val)
      : (CANONICAL_CAST as readonly string[]).includes(val);
    if (!isKnown) {
      errors.push({ level: 'error', code: 'cast', message: `Non-canonical character "${val}" in ${field}`, sceneId });
    }
  };
  parsed.forEach((s) => {
    checkCast((s as { who?: unknown }).who, s.id, 'who');
    checkCast((s as { narrator?: unknown }).narrator, s.id, 'narrator');
    const cast = (s as { cast?: unknown }).cast;
    if (Array.isArray(cast)) cast.forEach((c) => checkCast(c, s.id, 'cast[]'));
    const turns = (s as { turns?: { who?: unknown }[] }).turns;
    if (Array.isArray(turns)) turns.forEach((t) => checkCast(t?.who, s.id, 'turns[].who', true));
    const script = (s as { script?: { who?: unknown }[] }).script;
    if (Array.isArray(script)) script.forEach((t) => checkCast(t?.who, s.id, 'script[].who'));
  });

  // ---- Basket / dash: target letter integrity --------------------------------
  parsed.forEach((s) => {
    const items = (s as { items?: { word?: string; letter?: string; hit?: boolean }[] }).items;
    const letter = (s as { letter?: string; targetLetter?: string }).letter ?? (s as { targetLetter?: string }).targetLetter;
    if (!items || !letter || (s.kind !== 'basket' && s.kind !== 'dash')) return;
    items.forEach((it) => {
      if (!it?.word) return;

      // If the target is a multi-character word (like a color 'RED', 'BLUE', 'YELLOW'),
      // skip single-character startsWith checks as colors are vocabulary, not phonics.
      if (letter.length > 1) {
        return;
      }

      const startsWith = it.word[0]?.toUpperCase() === letter.toUpperCase();
      const shouldMatch = s.kind === 'basket' ? Boolean(it.hit) : it.letter?.toUpperCase() === letter.toUpperCase();
      if (shouldMatch && !startsWith) {
        errors.push({ level: 'error', code: 'target-mismatch', message: `Item "${it.word}" is marked target but doesn't start with ${letter}`, sceneId: s.id });
      }
      if (!shouldMatch && startsWith) {
        errors.push({ level: 'error', code: 'distractor-mismatch', message: `Item "${it.word}" is a distractor but starts with target letter ${letter}`, sceneId: s.id });
      }
    });
  });

  // ---- Song must have songUrl and/or songPrompt --------------------------
  // (OR, not XOR: real lessons here intentionally ship both — songUrl as the
  // playable asset, songPrompt as the generation brief that produced it.)
  parsed.forEach((s) => {
    if (s.kind !== 'song') return;
    const hasUrl = Boolean((s as { songUrl?: string }).songUrl);
    const hasPrompt = Boolean((s as { songPrompt?: string }).songPrompt);
    if (!hasUrl && !hasPrompt) errors.push({ level: 'error', code: 'song', message: 'Song scene needs songUrl or songPrompt', sceneId: s.id });
  });

  // ---- Length --------------------------------------------------------------
  const min = ctx.minScenes ?? 15;
  const max = ctx.maxScenes ?? 32;
  if (parsed.length < min) warnings.push({ level: 'warning', code: 'length-short', message: `Lesson has ${parsed.length} scenes (<${min})` });
  if (parsed.length > max) warnings.push({ level: 'warning', code: 'length-long', message: `Lesson has ${parsed.length} scenes (>${max} — cognitive overload risk)` });

  // ---- Banned placeholders ---------------------------------------------------
  parsed.forEach((s) => {
    const blob = JSON.stringify(s).toLowerCase();
    BANNED_PLACEHOLDERS.forEach((needle) => {
      if (blob.includes(needle.toLowerCase())) {
        warnings.push({ level: 'warning', code: 'placeholder', message: `Scene contains placeholder text "${needle}"`, sceneId: s.id });
      }
    });
  });

  // ---- Recycling -------------------------------------------------------------
  if (ctx.targetLetters?.length) {
    ctx.targetLetters.forEach((letter) => {
      const bag = JSON.stringify(parsed).toUpperCase();
      const hits = (bag.match(new RegExp(`"${letter.toUpperCase()}"`, 'g')) ?? []).length;
      if (hits < 6) warnings.push({ level: 'warning', code: 'recycle-letter', message: `Target letter "${letter}" appears only ${hits}x (expected >=6)` });
    });
  }
  if (ctx.targetVocab?.length) {
    ctx.targetVocab.forEach((word) => {
      const bag = JSON.stringify(parsed).toLowerCase();
      const hits = (bag.match(new RegExp(word.toLowerCase(), 'g')) ?? []).length;
      if (hits < 3) warnings.push({ level: 'warning', code: 'recycle-vocab', message: `Vocab "${word}" appears only ${hits}x (expected >=3)` });
    });
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function formatValidationResult(ctx: ValidationContext, r: ValidationResult): string {
  const lines: string[] = [];
  lines.push(`Lesson ${ctx.lessonNumber}: ${r.ok ? 'OK' : 'ERRORS'} (${r.errors.length} error(s), ${r.warnings.length} warning(s))`);
  r.errors.forEach((e) => lines.push(`  ERROR ${e.code}: ${e.message}${e.sceneId ? ` (${e.sceneId})` : ''}`));
  r.warnings.forEach((w) => lines.push(`  warn  ${w.code}: ${w.message}${w.sceneId ? ` (${w.sceneId})` : ''}`));
  return lines.join('\n');
}

/**
 * Games by lesson slot (docs/playground-lesson-blueprint.md §3d, owner's rule
 * 2026-10-03): each lesson NUMBER owns its signature games, so inside one unit
 * a child never meets the same game twice. Kinds not listed here are shared
 * routine or topic kinds and may appear in any slot.
 */
export const SLOT_GAMES: Record<1 | 2 | 3 | 4 | 5 | 6, readonly string[]> = {
  1: ['mystery-bag', 'picture-match', 'memory', 'sound-pop', 'rapid-recall', 'hello-doors', 'simon-touch', 'body-stack'],
  2: ['listen-colour', 'catch-sort', 'feed-monsters', 'color-monsters', 'dash', 'train-recall', 'friend-pop', 'face-builder', 'sound-pick', 'family-photo', 'size-line'],
  3: ['puzzle', 'basket', 'jigsaw-puzzle', 'brick-crush', 'pattern-train', 'word-build', 'sand-prints', 'shape-magic', 'shape-peek', 'shape-sorter', 'shape-bubbles'],
  4: ['secret-card', 'sound-sort', 'color-simon', 'gather', 'shape-fishing', 'alphabet-order', 'monster-maker', 'count-parts'],
  5: ['lift-flap', 'tick-cross', 'who-said-it', 'alphabet-blocks', 'tidy-up', 'peek-pop', 'move-match', 'part-peek'],
  6: ['shape-torch', 'shadow-match', 'draw-path', 'trophy-chest', 'tile-reveal', 'stepping-stones', 'odd-one-out', 'claw-machine', 'ring-toss', 'robo-copy'],
};

/** Games in `scenes` that belong to another lesson slot (empty = the lesson keeps to its own set). */
export function checkSlotGames(slot: 1 | 2 | 3 | 4 | 5 | 6, scenes: readonly { id: string; kind: string }[]): ValidationIssue[] {
  const owner = new Map<string, number>();
  for (const [n, kinds] of Object.entries(SLOT_GAMES)) for (const k of kinds) owner.set(k, Number(n));
  return scenes
    .filter((s) => owner.has(s.kind) && owner.get(s.kind) !== slot)
    .map((s) => ({ level: 'warning' as const, code: 'slot-game', sceneId: s.id, message: `"${s.kind}" is a Lesson ${owner.get(s.kind)} game (blueprint §3d); Lesson ${slot} should use its own set.` }));
}
