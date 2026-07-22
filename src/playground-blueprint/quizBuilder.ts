/**
 * Playground Unit Quiz — deterministic builder.
 *
 * Builds the 24 L6 quiz questions from L1–L3 vocab + phonics, in the four
 * canonical formats declared by `unitTemplate.lessons[5].quiz.formats`:
 *   picture (6) · audio (6) · text (6) · spell (6)
 *
 * No randomness, no AI calls — given the same PlaygroundUnitContent, the
 * same questions come back every time. Wire the L6 player to this instead
 * of the hard-coded "Animal Friends" bank when unit content is available.
 */

import type { PlaygroundUnitContent, PlaygroundLessonContent, PlaygroundVocabMedia } from "./types";

export type QuizQuestion =
  | { kind: "picture"; prompt: string; image: string; options: string[]; answer: string }
  | { kind: "audio";   prompt: string; word: string;  options: string[]; answer: string; audioUrl?: string }
  | { kind: "text";    prompt: string; options: string[];                 answer: string }
  | { kind: "spell";   prompt: string; word: string;  image?: string };

export interface BuiltQuiz {
  unit_topic: string;
  questions: QuizQuestion[];   // length === 24
  formats: ("picture" | "audio" | "text" | "spell")[];
}

// ── seeded helpers (mulberry32) ────────────────────────────────────────
function hash(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pickDistractors(pool: string[], answer: string, n: number, rnd: () => number): string[] {
  const others = pool.filter((w) => w.toLowerCase() !== answer.toLowerCase());
  const out: string[] = [];
  const used = new Set<string>();
  // deterministic shuffle
  const shuffled = [...others].sort((a, b) => (rnd() - 0.5));
  for (const w of shuffled) {
    if (out.length >= n) break;
    if (used.has(w.toLowerCase())) continue;
    used.add(w.toLowerCase());
    out.push(w);
  }
  // pad if pool is tiny
  while (out.length < n) out.push(answer); // safe fallback
  return out;
}
function shuffleOptions(answer: string, distractors: string[], rnd: () => number): string[] {
  const opts = [answer, ...distractors];
  return opts.sort(() => rnd() - 0.5);
}

// ── builder ────────────────────────────────────────────────────────────
export function buildQuizQuestions(unit: PlaygroundUnitContent): BuiltQuiz {
  const lessons = unit.lessons ?? [];
  const byNum = (n: number) => lessons.find((l) => l.lesson_number === n);
  const l1 = byNum(1), l2 = byNum(2), l3 = byNum(3);

  // vocab pool (deduped, lowercased, ordered L1→L3)
  const seen = new Set<string>();
  const pool: string[] = [];
  for (const l of [l1, l2, l3]) {
    for (const w of l?.vocab ?? []) {
      const k = (w ?? "").trim().toLowerCase();
      if (!k || seen.has(k)) continue;
      seen.add(k);
      pool.push(k);
    }
  }

  // media lookup across L1–L3
  const media: Record<string, PlaygroundVocabMedia> = {};
  for (const l of [l1, l2, l3] as PlaygroundLessonContent[] | undefined[]) {
    if (!l?.vocab_media) continue;
    for (const [k, v] of Object.entries(l.vocab_media)) {
      const key = k.toLowerCase();
      if (!media[key]) media[key] = v;
    }
  }

  const phonics = [l1, l2, l3]
    .map((l) => l?.phonic)
    .filter(Boolean) as NonNullable<PlaygroundLessonContent["phonic"]>[];

  const rnd = mulberry32(hash(unit.unit_topic || "playground-unit"));
  const questions: QuizQuestion[] = [];

  // helpers
  const wordsWithImage = pool.filter((w) => media[w]?.imageUrl);
  const wordsWithAudio = pool.filter((w) => media[w]?.audioUrl);

  // ── 6 picture questions ──
  for (let i = 0; i < 6; i++) {
    const ans = wordsWithImage[i % Math.max(1, wordsWithImage.length)] ?? pool[i % pool.length] ?? "word";
    const distractors = pickDistractors(pool, ans, 2, rnd);
    questions.push({
      kind: "picture",
      prompt: "What is this?",
      image: media[ans]?.imageUrl ?? "",
      options: shuffleOptions(ans, distractors, rnd),
      answer: ans,
    });
  }

  // ── 6 audio questions (listen → pick word) ──
  for (let i = 0; i < 6; i++) {
    const ans = wordsWithAudio[i % Math.max(1, wordsWithAudio.length)] ?? pool[i % pool.length] ?? "word";
    const distractors = pickDistractors(pool, ans, 2, rnd);
    questions.push({
      kind: "audio",
      prompt: "Listen — tap the word you hear",
      word: ans,
      audioUrl: media[ans]?.audioUrl,
      options: shuffleOptions(ans, distractors, rnd),
      answer: ans,
    });
  }

  // ── 6 text questions (phonics first, then vocab cloze) ──
  for (const ph of phonics.slice(0, 3)) {
    const ans = (ph.words?.[0] ?? "").toLowerCase();
    if (!ans) continue;
    const distractors = pickDistractors(pool.length ? pool : [ans, "dog", "fish"], ans, 2, rnd);
    questions.push({
      kind: "text",
      prompt: `Which word starts with the ${ph.sound} sound?`,
      options: shuffleOptions(ans, distractors, rnd),
      answer: ans,
    });
  }
  while (questions.filter((q) => q.kind === "text").length < 6) {
    const i = questions.filter((q) => q.kind === "text").length;
    const ans = pool[i % Math.max(1, pool.length)] ?? "word";
    const distractors = pickDistractors(pool, ans, 2, rnd);
    questions.push({
      kind: "text",
      prompt: `Choose the correct word for: "${unit.unit_topic}"`,
      options: shuffleOptions(ans, distractors, rnd),
      answer: ans,
    });
  }

  // ── 6 spell questions ──
  for (let i = 0; i < 6; i++) {
    const ans = pool[i % Math.max(1, pool.length)] ?? "word";
    questions.push({
      kind: "spell",
      prompt: "Spell this word",
      word: ans,
      image: media[ans]?.imageUrl,
    });
  }

  return {
    unit_topic: unit.unit_topic,
    questions: questions.slice(0, 24),
    formats: ["picture", "audio", "text", "spell"],
  };
}
