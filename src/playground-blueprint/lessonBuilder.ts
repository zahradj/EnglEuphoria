/**
 * Playground Unit Builder — assembles the locked 7-lesson unit from
 * AI-emitted content. Pure function, deterministic.
 */
import { PLAYGROUND_UNIT_LESSONS } from "./unitTemplate";
import type {
  PlaygroundUnit,
  PlaygroundUnitContent,
  PlaygroundLessonContent,
} from "./types";

export function buildPlaygroundUnit(input: PlaygroundUnitContent): PlaygroundUnit {
  // Ensure every locked lesson_number is present; fill missing with a minimal
  // structural placeholder so the editor can still render validation errors.
  const byNumber = new Map<number, PlaygroundLessonContent>();
  for (const l of input.lessons ?? []) byNumber.set(l.lesson_number, l);

  const lessons: PlaygroundLessonContent[] = PLAYGROUND_UNIT_LESSONS.map((tpl) => {
    const existing = byNumber.get(tpl.lesson_number);
    if (!existing) {
      return { lesson_number: tpl.lesson_number as PlaygroundLessonContent["lesson_number"] };
    }
    // Clamp L1–L3 vocab to template max so the AI overshooting the budget
    // (e.g. 6 words on L2 when max is 4) doesn't hard-block publish.
    const max = (tpl as any).vocab_max ?? (tpl as any).vocab_budget;
    if (tpl.lesson_number <= 3 && typeof max === "number" && existing.vocab && existing.vocab.length > max) {
      return { ...existing, vocab: existing.vocab.slice(0, max) };
    }
    return existing;
  });

  const vocab_pool: string[] = [];
  const phonics_pool = [] as PlaygroundUnit["phonics_pool"];
  for (const l of lessons) {
    if (l.vocab) vocab_pool.push(...l.vocab);
    if (l.phonic) phonics_pool.push(l.phonic);
  }

  const uniqueVocab = Array.from(new Set(vocab_pool));
  const enrichedLessons = lessons.map((lesson) => {
    if (lesson.lesson_number >= 4) {
      return {
        ...lesson,
        review_targets: Array.from(new Set([...(lesson.vocab ?? []), ...uniqueVocab])),
        phonic: lesson.phonic ?? phonics_pool[(lesson.lesson_number - 1) % Math.max(phonics_pool.length, 1)],
      } as PlaygroundLessonContent;
    }
    return lesson;
  });

  return {
    unit_topic: input.unit_topic,
    unit_theme: input.unit_theme,
    unit_topics: input.unit_topics,
    lessons: enrichedLessons,
    vocab_pool: uniqueVocab,
    phonics_pool,
  };
}
