/**
 * useDynamicVocab — bridges the AI-generated PlaygroundUnit into the
 * phase components so a new topic doesn't render the bundled animals.
 *
 * When a unit is provided via PlaygroundUnitContext we map its vocab
 * words into Animal-shaped items. Otherwise we fall back to the bundled
 * reference ANIMALS so the standalone /playground demo still works.
 */
import { useMemo } from "react";
import { usePlaygroundLesson } from "@/playground-blueprint/PlaygroundUnitContext";
import { ANIMALS, PHONIC_C_WORDS, type Animal } from "@/playground-blueprint/lib/animals";
import placeholder from "@/playground-blueprint/assets/animals/cat.png";

import cat from "@/playground-blueprint/assets/animals/cat.png";
import cow from "@/playground-blueprint/assets/animals/cow.png";
import dog from "@/playground-blueprint/assets/animals/dog.png";
import duck from "@/playground-blueprint/assets/animals/duck.png";
import pig from "@/playground-blueprint/assets/animals/pig.png";
import fish from "@/playground-blueprint/assets/animals/fish.png";
import monkey from "@/playground-blueprint/assets/animals/monkey.png";
import snake from "@/playground-blueprint/assets/animals/snake.png";
import tiger from "@/playground-blueprint/assets/animals/tiger.png";
import octopus from "@/playground-blueprint/assets/animals/octopus.png";
import crab from "@/playground-blueprint/assets/animals/crab.png";
import oceanFish from "@/playground-blueprint/assets/animals/ocean-fish.png";

const IMAGE_BY_WORD: Record<string, string> = {
  cat, cow, dog, duck, pig, fish, monkey, snake, tiger, octopus, crab,
  "ocean-fish": oceanFish,
};

// Common CSS color names — when the vocab word is a color we render a
// colored swatch instead of the cat placeholder, which was previously used
// for every word missing a bundled asset (e.g. "red" showed a cat).
const CSS_COLORS = new Set([
  "red", "orange", "yellow", "green", "blue", "purple", "pink", "brown",
  "black", "white", "gray", "grey", "gold", "silver", "cyan", "magenta",
  "violet", "indigo", "turquoise", "maroon", "navy", "teal", "lime",
]);

function colorSwatchDataUrl(word: string): string {
  const w = word.toLowerCase().trim();
  const fill = CSS_COLORS.has(w) ? w : "#F3E5D8";
  const stroke = CSS_COLORS.has(w) ? "#3a1d0a" : "#C9A57B";
  const textFill = w === "white" || w === "yellow" ? "#3a1d0a" : "#ffffff";
  const label = w.replace(/[^a-z]/g, "").slice(0, 12) || "?";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect width='512' height='512' rx='64' fill='#FFF8E7'/><circle cx='256' cy='230' r='170' fill='${fill}' stroke='${stroke}' stroke-width='10'/><text x='256' y='250' font-family='Nunito, system-ui, sans-serif' font-size='72' font-weight='900' text-anchor='middle' fill='${textFill}' style='text-transform:capitalize'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function wordToAnimal(word: string, mediaUrl?: string): Animal {
  const key = word.toLowerCase().trim();
  return {
    name: key,
    image: mediaUrl || IMAGE_BY_WORD[key] || colorSwatchDataUrl(key),
    letters: key.replace(/[^a-z]/g, "").split(""),
  };
}

/**
 * Scan a lesson's page blocks for an image whose `subject`/`label`/`word`
 * matches the given vocab word (case-insensitive). Mirrors the ladder
 * `PlaygroundLessonPlayer.lessonImageFor()` uses so vocab flashcards stay
 * in sync with images generated in the Content Creator — even when the
 * editor keyed `vocab_media` under a slightly different form (scene
 * phrase, punctuated label, capitalization).
 */
function blockImageForWord(lesson: any, word: string): string | undefined {
  const key = word.toLowerCase().trim();
  if (!key) return undefined;
  const pages = (lesson?.pages ?? []) as any[];
  for (const p of pages) {
    // Skip pages that are clearly NOT vocab (warm-up song, cool-down, etc.)
    // so a warm-up hero image can never leak into a vocab flashcard.
    const pageId = String(p?.id ?? "").toLowerCase();
    const pageKind = String(p?.kind ?? p?.type ?? "").toLowerCase();
    const nonVocabPage =
      /warm|song|cool|intro|storybook|retell/.test(pageId) ||
      /warm|song|cool|intro/.test(pageKind);
    if (nonVocabPage) continue;
    for (const b of (p?.blocks ?? []) as any[]) {
      if (b?.kind !== "image") continue;
      const url = typeof b?.url === "string" ? b.url.trim() : "";
      if (!url) continue;
      const bw = String(b?.subject ?? b?.word ?? b?.label ?? "").toLowerCase().trim();
      if (!bw) continue;
      // Exact match only — fuzzy `includes` was letting "hello song" bind
      // to vocab word "hello".
      if (bw === key) return url;
    }
  }
  return undefined;
}

function resolveVocabImage(lesson: any, word: string): string | undefined {
  const media = lesson?.vocab_media || {};
  const key = word.toLowerCase().trim();
  const entry = media[word] ?? media[key];
  // Respect an explicit clear: if the editor has a vocab_media entry with
  // imageUrl === "" or null, the user intentionally removed the image and
  // we must NOT fall back to a page image block.
  if (entry && "imageUrl" in entry && !entry.imageUrl) return undefined;
  return entry?.imageUrl || blockImageForWord(lesson, word);
}

/**
 * Returns the vocab items for a given lesson. If the AI unit supplies
 * words for that lesson they win; otherwise the bundled fallback is used.
 * Resolution order: vocab_media[word] → vocab_media[lowercased] →
 * matching image block on any page → bundled asset → color swatch.
 */
export function useLessonVocab(lessonNumber: 1 | 2 | 3, fallback: Animal[] = ANIMALS): Animal[] {
  const aiLesson = usePlaygroundLesson(lessonNumber);
  return useMemo(() => {
    const words = aiLesson?.vocab;
    if (words && words.length) {
      return words.map((w) => wordToAnimal(w, resolveVocabImage(aiLesson, w)));
    }
    return fallback;
  }, [aiLesson, fallback]);
}

/**
 * Returns the phonic example words. AI provides phonic.{letter,sound,words};
 * fallback is the bundled /c/ set.
 */
export function useLessonPhonicWords(
  lessonNumber: 1 | 2 | 3,
  fallback = PHONIC_C_WORDS,
): { name: string; image: string }[] {
  const aiLesson = usePlaygroundLesson(lessonNumber);
  return useMemo(() => {
    const words = aiLesson?.phonic?.words;
    if (words && words.length) {
      return words.map((w) => {
        const key = w.toLowerCase().trim();
        return {
          name: key,
          image:
            resolveVocabImage(aiLesson, w) ||
            IMAGE_BY_WORD[key] ||
            placeholder,
        };
      });
    }
    return fallback;
  }, [aiLesson, fallback]);
}

export function useLessonPhonicLetter(lessonNumber: 1 | 2 | 3, fallback = "c"): string {
  const aiLesson = usePlaygroundLesson(lessonNumber);
  return aiLesson?.phonic?.letter || fallback;
}
