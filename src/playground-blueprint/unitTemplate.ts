/**
 * Playground Unit Blueprint — ACE-aligned 7-lesson structure.
 *
 * Pedagogical contract (locked):
 *   ACE = Activate · Connect · Express
 *     • Activate — wake prior knowledge, prime affect, set the goal.
 *     • Connect  — present form/meaning/sound; build noticing.
 *     • Express  — produce language (controlled → guided → freer).
 *
 * Activities and games are unchanged — every lesson is still composed
 * from the same `phase_ids` registry. What this refactor adds:
 *   • each phase id is tagged with its ACE band (PHASE_ACE_MAP)
 *   • each lesson declares an `ace_role`, `objective`, and `ace_arc`
 *     ratio so the player can render pedagogical intent and the
 *     generator can balance time-on-task.
 *
 * Unit arc across 7 lessons:
 *   L1 Discover    — Activate-heavy intro to the topic & first words.
 *   L2 Build       — Connect-heavy: grammar form + sentence frame.
 *   L3 Apply       — Express-heavy: guided use of L1+L2 language.
 *   L4 Storybook   — Connect+Express through a narrative arc.
 *   L5 Consolidate — Activate+Connect: spaced review of all 12 items.
 *   L6 Show        — Express: mastery quiz (4 formats).
 *   L7 Stretch     — Express: free-er, game-based booster.
 */

export type AcePhase = "activate" | "connect" | "express";

/** Canonical ACE band for every phase id in the registry. */
export const PHASE_ACE_MAP: Record<string, AcePhase> = {
  // Activate
  warmup: "activate",
  vocab_refresher: "activate",
  flashcards: "activate",
  vocabulary: "activate",
  cooldown: "activate",
  all_done: "activate",
  // Connect
  modeling: "connect",
  phonics: "connect",
  phonics_review: "connect",
  spelling: "connect",
  sentence: "connect",
  describe: "connect",
  look_and_say: "connect",
  story_video: "connect",
  listen_and_cage: "connect",
  listen_and_point: "connect",
  match_word: "connect",
  memory_match: "connect",
  colors: "connect",
  // Express
  practice: "express",
  sequence: "express",
  qa: "express",
  retell: "express",
  story_vocab: "express",
  story_review: "express",
  sort_by_home: "express",
  odd_one_out: "express",
  sentence_mixer: "express",
  sentence_scramble: "express",
  spell_it: "express",
  listening_sprint: "express",
  build_frame: "express",
  coloring: "express",
  quiz: "express",
};

export const PLAYGROUND_UNIT_LESSONS = [
  {
    lesson_number: 1,
    slug: "discover",
    title: "Lesson 1 · Discover",
    ace_role: "Activate" as const,
    objective: "Warm up, meet the target words/chunks, watch a natural model, hear one sound, say one sentence, and spell/trace one focus item.",
    ace_arc: { activate: 0.5, connect: 0.4, express: 0.1 },
    vocab_budget: 6,
    vocab_min: 3,
    vocab_max: 6,
    sentence_frame: "It is a ___.",
    phase_ids: [
      "warmup",
      "vocabulary",
      "flashcards",
      "listen_and_point",
      "modeling",
      "match_word",
      "practice",
      "memory_match",
      "phonics",
      "sentence",
      "spelling",
      "cooldown",
    ] as const,
  },
  {
    lesson_number: 2,
    slug: "build",
    title: "Lesson 2 · Build",
    ace_role: "Connect" as const,
    objective: "Recycle Lesson 1 language, notice the next pattern, and build short supported responses.",
    ace_arc: { activate: 0.2, connect: 0.55, express: 0.25 },
    vocab_budget: 3,
    vocab_min: 2,
    vocab_max: 4,
    sentence_frame: "It is a ___.",
    phase_ids: [
      "warmup",
      "vocab_refresher",
      "flashcards",
      "modeling",
      "listen_and_cage",
      "phonics",
      "match_word",
      "sentence",
      "practice",
      "memory_match",
      "spelling",
      "cooldown",
    ] as const,
  },
  {
    lesson_number: 3,
    slug: "apply",
    title: "Lesson 3 · Apply",
    ace_role: "Express" as const,
    objective: "Use recycled language in a guided conversation/game, then produce a short independent response.",
    ace_arc: { activate: 0.15, connect: 0.35, express: 0.5 },
    vocab_budget: 3,
    vocab_min: 2,
    vocab_max: 5,
    sentence_frame: "___",
    phase_ids: [
      "warmup",
      "vocab_refresher",
      "flashcards",
      "modeling",
      "describe",
      "phonics",
      "sentence",
      "sentence_mixer",
      "practice",
      "qa",
      "build_frame",
      "spelling",
      "cooldown",
    ] as const,
  },
  {
    lesson_number: 4,
    slug: "storybook",
    title: "Lesson 4 · Storybook",
    ace_role: "Connect+Express" as const,
    objective: "Experience a story first, then work on its vocabulary, phonics, story video, comprehension, and retell.",
    ace_arc: { activate: 0.2, connect: 0.45, express: 0.35 },
    vocab_budget: 0, // reuses L1–L3 vocab only
    sentence_frame: null,
    phase_ids: [
      "warmup",
      "sequence",
      "story_vocab",
      "phonics_review",
      "story_video",
      "look_and_say",
      "listen_and_point",
      "match_word",
      "retell",
      "memory_match",
      "story_review",
      "cooldown",
    ] as const,
  },
  {
    lesson_number: 5,
    slug: "consolidate",
    title: "Lesson 5 · Consolidate",
    ace_role: "Activate+Connect" as const,
    objective: "Review everything from Lessons 1–4 through spaced recall, phonics review, matching, sorting, listening, and sentence games.",
    ace_arc: { activate: 0.35, connect: 0.4, express: 0.25 },
    vocab_budget: 0,
    sentence_frame: null,
    phase_ids: [
      "flashcards",
      "colors",
      "phonics_review",
      "memory_match",
      "sort_by_home",
      "odd_one_out",
      "sentence_mixer",
      "sentence_scramble",
      "spell_it",
      "listening_sprint",
      "cooldown",
    ] as const,
  },
  {
    lesson_number: 6,
    slug: "show",
    title: "Lesson 6 · Show what you know",
    ace_role: "Express" as const,
    objective: "Mastery check across picture, text, audio, speaking, and spelling formats; 80% unlocks the next unit.",
    ace_arc: { activate: 0.1, connect: 0.1, express: 0.8 },
    vocab_budget: 0,
    sentence_frame: null,
    phase_ids: ["quiz"] as const,
    quiz: { total_questions: 24, formats: ["picture", "text", "audio", "spell"] as const },
  },
  {
    lesson_number: 7,
    slug: "stretch",
    title: "Lesson 7 · Stretch",
    ace_role: "Express" as const,
    objective: "Extra practice assigned after a failed quiz: reteach weak words, sounds, sentences, and confidence through games.",
    ace_arc: { activate: 0.2, connect: 0.2, express: 0.6 },
    vocab_budget: 0,
    sentence_frame: null,
    phase_ids: [
      "warmup",
      "flashcards",
      "phonics_review",
      "listen_and_point",
      "match_word",
      "memory_match",
      "sentence_scramble",
      "build_frame",
      "spell_it",
      "listening_sprint",
      "all_done",
    ] as const,
  },
] as const;

export type PlaygroundLessonNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Resolve a human, curriculum-aware lesson title.
 * Priority: title_override → DB title (master library) → ACE-arc default.
 */
export function resolveLessonTitle(
  unitTopic: string | undefined | null,
  lesson:
    | {
        lesson_number: number;
        story?: { title?: string } | null;
        title?: string | null;
        title_override?: string | null;
        vocab?: string[];
        phonic?: { letter?: string } | null;
        communication_goal?: string | null;
        focus_label?: string | null;
      }
    | undefined,
  lessonNumber: number,
): string {
  const override = (lesson as any)?.title_override;
  if (override && typeof override === "string" && override.trim()) return override;
  const dbTitle = (lesson as any)?.title;
  if (dbTitle && typeof dbTitle === "string" && dbTitle.trim()) return dbTitle.trim();

  const topic = (unitTopic || "").trim();
  const goal =
    (lesson as any)?.focus_label?.trim?.() ||
    (lesson as any)?.communication_goal?.split(/[.:—-]/)[0]?.trim?.() ||
    "";

  const tpl = PLAYGROUND_UNIT_LESSONS.find((l) => l.lesson_number === lessonNumber);
  const base = tpl?.title ?? `Lesson ${lessonNumber}`;

  switch (lessonNumber) {
    case 1: {
      const letter = lesson?.phonic?.letter?.toUpperCase();
      const focus = goal || (letter ? `Sound “${letter}”` : topic || "Meet the words");
      return `${base} · ${focus}`;
    }
    case 2:
      return `${base} · ${goal || (topic ? `${topic} sentences` : "Sentences")}`;
    case 3:
      return `${base} · ${goal || (topic ? `Use ${topic}` : "Use the words")}`;
    case 4: {
      const story = lesson?.story?.title?.trim();
      return `${base} · ${story || topic || "Story time"}`;
    }
    case 5:
      return `${base} · ${topic ? `Review ${topic}` : "Big review"}`;
    case 6:
      return `${base} · ${topic ? `${topic} quiz` : "Unit quiz"}`;
    case 7:
      return `${base} · ${topic ? `${topic} game time` : "Game time"}`;
    default:
      return base;
  }
}

export const UNIT_STAR_THRESHOLDS = {
  threeStars: (score: number, total: number) => score >= total - 1,
  twoStars: (score: number, total: number) => score >= total / 2,
} as const;

export const PEDAGOGY_NONNEGOTIABLES = [
  "ACE arc — every lesson balances Activate · Connect · Express per its declared ratio.",
  "Reading first — one phonic per L1–L3; L5 and L7 revisit all three.",
  "Minimised vocabulary — stack frames, not words. L1=6, L2=3, L3=3.",
  "Rotate, never repeat — scrambled letters must never match the original word.",
  "Topic-themed drop containers always visually larger than the items above.",
  "Cartoon art only — never silhouettes.",
  "Supportive tone — no 'wrong!' audio. Gentle shake + re-model on mistakes.",
] as const;
