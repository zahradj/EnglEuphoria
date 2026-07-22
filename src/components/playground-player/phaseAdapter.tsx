/**
 * phaseAdapter — Deterministic Lesson Experience Adapter (Refactored).
 *
 * Maps EVERY derived PlaygroundPage's `phase_id` to a matching rich
 * Animal-Adventure-Academy phase component so AI-generated lessons render
 * as a real interactive app (tap, drag, chant, story, mini-games) — not as
 * static block cards.
 *
 * Key guarantees:
 *  1. Lessons 1..7 all hydrate. Hard-coded `useLessonVocab(1|2|3)` hooks
 *     inside phase components resolve to the ACTIVE lesson via `LessonScope`.
 *  2. If `lesson.vocab` is empty, we synthesize a vocab list from the page's
 *     own blocks (matching pairs, image blocks, vocab cards) so phases never
 *     crash or fall back to flat text.
 *  3. Every templated phase_id is mapped — including `warmup`, `quiz`,
 *     `look_and_say`, `story_video`, `intro`, `build_frame`, etc.
 *  4. Unknown phase_ids run a content-aware inference pass (matching →
 *     MemoryMatch, scramble → Sentence, etc.) before falling back to blocks.
 */
import { useMemo, type ReactNode } from "react";
import {
  PlaygroundUnitProvider,
  usePlaygroundUnit,
} from "@/playground-blueprint/PlaygroundUnitContext";
import type {
  PlaygroundBlock,
  PlaygroundLessonContent,
  PlaygroundPage,
  PlaygroundUnit,
} from "@/playground-blueprint/types";

import { VocabularyPhase } from "@/playground-blueprint/components/phases/Vocabulary";
import { ModelingPhase, type ModelingFrame } from "@/playground-blueprint/components/phases/Modeling";
import { PhonicsPhase } from "@/playground-blueprint/components/phases/Phonics";
import { PhonicsReviewPhase } from "@/playground-blueprint/components/phases/PhonicsReview";
import { SentencePhase } from "@/playground-blueprint/components/phases/Sentence";
import { SpellingPhase } from "@/playground-blueprint/components/phases/Spelling";
import { PracticePhase } from "@/playground-blueprint/components/phases/Practice";
import { MemoryMatchPhase } from "@/playground-blueprint/components/phases/MemoryMatch";
import { CoolDownPhase } from "@/playground-blueprint/components/phases/CoolDown";
import { SignedStoryPhase } from "@/playground-blueprint/components/phases/SignedStory";
import { ChantPhase } from "@/playground-blueprint/components/phases/Chant";
import { VideoLessonPhase } from "./VideoLessonPhase";
import { VideoCheckPhase } from "./VideoCheckPhase";
import { AlphabetArcadePhase } from "./AlphabetArcadePhase";
import type { VideoQuestion } from "@/video/types";

// ─── LessonScope ─────────────────────────────────────────────────────────
// Phase components hard-code `useLessonVocab(1|2|3)`. Without remapping,
// opening Lesson 5 would read Lesson 1's vocab from the unit. We nest a
// provider that exposes the ACTIVE lesson under lesson_number 1 (and
// synthesizes vocab from page blocks when the lesson has none).
function LessonScope({
  lessonNumber,
  page,
  children,
}: {
  lessonNumber: number;
  page?: PlaygroundPage;
  children: ReactNode;
}) {
  const unit = usePlaygroundUnit();
  const scoped = useMemo<PlaygroundUnit | null>(() => {
    if (!unit) return null;
    const real = unit.lessons.find((l) => l.lesson_number === lessonNumber);
    if (!real) return unit;
    const synthVocab = synthesizeVocab(real, page);
    const remapped: PlaygroundLessonContent = {
      ...real,
      lesson_number: 1,
      vocab: real.vocab?.length ? real.vocab : synthVocab,
    } as PlaygroundLessonContent;
    return {
      ...unit,
      lessons: [
        remapped,
        ...unit.lessons.filter((l) => l.lesson_number !== lessonNumber),
      ],
    };
  }, [unit, lessonNumber, page]);
  return <PlaygroundUnitProvider unit={scoped}>{children}</PlaygroundUnitProvider>;
}

// ─── Vocab synthesis from page blocks ────────────────────────────────────
function synthesizeVocab(
  lesson: PlaygroundLessonContent,
  page?: PlaygroundPage,
): string[] {
  if (!page) return [];
  const set = new Set<string>();
  for (const b of (page.blocks ?? []) as any[]) {
    const w =
      b?.word || b?.headword || b?.subject || b?.label || b?.value;
    if (typeof w === "string" && w.trim() && w.trim().length < 24) {
      set.add(w.trim().toLowerCase());
    }
    if (Array.isArray(b?.pairs)) {
      for (const p of b.pairs) {
        const pw = p?.word || p?.label || p?.left || p?.text;
        if (typeof pw === "string" && pw.trim()) set.add(pw.trim().toLowerCase());
      }
    }
    if (Array.isArray(b?.options)) {
      for (const o of b.options) {
        if (typeof o === "string" && o.trim() && o.trim().length < 24) {
          set.add(o.trim().toLowerCase());
        }
      }
    }
  }
  return Array.from(set).slice(0, 6);
}

// ─── Phase id → component mapping ────────────────────────────────────────
const VOCAB_PHASES = new Set([
  "vocabulary",
  "vocab_refresher",
  "flashcards",
  "story_vocab",
  "look_and_say",
  "match_word",
  "listen_and_point",
  "listen_and_cage",
]);
const MODELING_PHASES = new Set(["modeling", "build_frame"]);
const PHONICS_PHASES = new Set(["phonics"]);
const PHONICS_REVIEW_PHASES = new Set(["phonics_review"]);
const SENTENCE_PHASES = new Set([
  "sentence",
  "sentence_mixer",
  "sentence_scramble",
]);
const SPELLING_PHASES = new Set(["spelling", "spell_it"]);
const PRACTICE_PHASES = new Set([
  "practice",
  "odd_one_out",
  "sort_by_home",
  "colors",
  "listening_sprint",
]);
const MEMORY_PHASES = new Set(["memory_match", "quiz", "match_pictures"]);
const COOLDOWN_PHASES = new Set(["cooldown", "all_done"]);
const STORY_PHASES = new Set([
  "sequence",
  "retell",
  "story_review",
  "story_video",
]);
const CHANT_PHASES = new Set(["warmup", "chant", "song"]);
const LANGUAGE_ENGINE_PHASES = new Set([
  "language_engine",
  "story_quest",
  "language_engine_slot",
]);
const VIDEO_WATCH_PHASES = new Set(["video_watch", "video_lesson"]);
const VIDEO_CHECK_PHASES = new Set(["video_check", "video_comprehension"]);
const ALPHABET_ARCADE_PHASES = new Set(["alphabet_arcade", "phonics_arcade", "letter_arcade"]);

// ─── Frame derivation for Modeling ───────────────────────────────────────
function deriveFrame(
  lesson?: PlaygroundLessonContent | null,
): ModelingFrame | undefined {
  if (!lesson) return undefined;
  // Sync with whatever field the generator populated. Priority: explicit
  // sentence_frame → grammar_target → grammar_focus → grammar. Any of these
  // may hold the pedagogical frame (e.g. "It is a ___.", "I have got ___").
  const raw =
    (lesson as any).sentence_frame ||
    (lesson as any).grammar_target ||
    (lesson as any).grammar_focus ||
    (lesson as any).grammar;
  const frame = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  if (!frame || typeof frame !== "string") return undefined;
  // Accept ___, X, ..., or a trailing bare slot at end of string.
  const match = frame.match(/^(.*?)(?:_+|\bX\b|\.\.\.|$)/);
  if (!match) return undefined;
  const before = match[1].trim();
  if (!before) return undefined;
  const parts = before.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return undefined;
  // Detect trailing article (a / an / the / some).
  const last = parts[parts.length - 1]?.toLowerCase();
  const hasArticle = parts.length >= 3 && ["a", "an", "the", "some"].includes(last);
  const article = hasArticle ? parts[parts.length - 1] : "";
  const verbIdx = parts.length - (hasArticle ? 2 : 1);
  const verb = parts[verbIdx] || "is";
  const subject = parts.slice(0, verbIdx).join(" ") || "It";
  return { subject, verb, article, slotLabel: "word" };
}

function MemoryMatchWithVocab({ onComplete }: { onComplete: () => void }) {
  const unit = usePlaygroundUnit();
  const lesson = unit?.lessons.find((l) => l.lesson_number === 1);
  const items = useMemo(() => {
    const words = (lesson?.vocab ?? []).slice(0, 6);
    const media = (lesson as any)?.vocab_media || {};
    return words.map((w) => ({
      name: w,
      image: media[w]?.imageUrl || media[w.toLowerCase()]?.imageUrl || "",
    }));
  }, [lesson]);
  if (!items.length) return null;
  return (
    <MemoryMatchPhase
      items={items}
      onComplete={onComplete}
      pairs={Math.min(4, items.length)}
    />
  );
}

// ─── Chant lines extraction ──────────────────────────────────────────────
function extractChantLines(page?: PlaygroundPage): string[] {
  if (!page) return [];
  const lines: string[] = [];
  for (const b of (page.blocks ?? []) as any[]) {
    if (Array.isArray(b?.lines)) {
      for (const l of b.lines) {
        if (typeof l === "string" && l.trim()) lines.push(l.trim());
        if (l && typeof l === "object" && typeof l.text === "string" && l.text.trim()) {
          lines.push(l.text.trim());
        }
      }
    }
    if ((b?.kind === "lyrics_card" || b?.kind === "lyrics") && typeof b.value === "string") {
      const split = b.value.split(/\n+/).map((s: string) => s.trim()).filter(Boolean);
      lines.push(...split);
    }
    if (b?.kind === "text" && typeof b.value === "string") {
      const split = b.value.split(/\n+/).map((s: string) => s.trim()).filter(Boolean);
      if (split.length >= 2) lines.push(...split);
    }
  }
  return lines.slice(0, 6);
}

// ─── Content-aware inference for unknown phase_ids ──────────────────────
function inferRichKind(
  page: PlaygroundPage,
): "memory" | "sentence" | "vocab" | "chant" | null {
  const id = String(page.phase_id || "").toLowerCase();
  if (/match|pair/.test(id)) return "memory";
  if (/scramble|mixer|sentence/.test(id)) return "sentence";
  if (/song|chant|warm|sing/.test(id)) return "chant";
  for (const b of (page.blocks ?? []) as any[]) {
    if (Array.isArray(b?.pairs) && b.pairs.length) return "memory";
    if (b?.kind === "lyrics_card" || b?.kind === "lyrics") return "chant";
    if (b?.word || b?.headword) return "vocab";
  }
  return null;
}

// ─── Main entry point ────────────────────────────────────────────────────
export function renderPhaseExperience(
  page: PlaygroundPage | undefined,
  lesson: PlaygroundLessonContent | null | undefined,
  onComplete: () => void,
): ReactNode | null {
  if (!page) return null;
  const id = String(page.phase_id || "").toLowerCase();
  const rawLesson = (lesson?.lesson_number ?? 1) as number;

  const wrap = (node: ReactNode) => (
    <LessonScope lessonNumber={rawLesson} page={page}>
      {node}
    </LessonScope>
  );

  // Language-engine slides carry their own runtime block(s). Returning null
  // lets the player's fallback iterate `page.blocks` via <RuntimeBlock/>,
  // which already knows how to render `language_engine_slot`.
  if (LANGUAGE_ENGINE_PHASES.has(id)) return null;

  // Video Lesson track — reads video_url/questions from the page or lesson.
  if (VIDEO_WATCH_PHASES.has(id)) {
    const videoUrl =
      ((page as any).video_url as string | undefined) ||
      (((page.blocks ?? []) as any[]).find((b) => b?.kind === "video")?.url as string | undefined) ||
      ((lesson as any)?.video_lesson?.video_url as string | undefined) ||
      "";
    const posterUrl =
      ((page as any).poster_url as string | undefined) ||
      ((lesson as any)?.video_lesson?.starting_frame_url as string | undefined);
    return <VideoLessonPhase videoUrl={videoUrl} posterUrl={posterUrl} onComplete={onComplete} />;
  }
  if (VIDEO_CHECK_PHASES.has(id)) {
    const questions =
      (((page as any).questions ?? []) as VideoQuestion[]) ||
      (((lesson as any)?.video_lesson?.questions ?? []) as VideoQuestion[]);
    return <VideoCheckPhase questions={questions ?? []} onComplete={onComplete} />;
  }
  if (ALPHABET_ARCADE_PHASES.has(id)) {
    return (
      <AlphabetArcadePhase
        lessonNumber={rawLesson}
        vocab={(lesson?.vocab as string[] | undefined) ?? []}
        phonicsFocus={
          ((lesson as any)?.phonics_focus as string | undefined) ||
          ((lesson as any)?.phonic as string | undefined)
        }
        onComplete={onComplete}
      />
    );
  }

  // Direct phase mappings.
  if (VOCAB_PHASES.has(id)) return wrap(<VocabularyPhase onComplete={onComplete} />);
  if (MODELING_PHASES.has(id))
    return wrap(<ModelingPhase onComplete={onComplete} frame={deriveFrame(lesson)} />);
  if (PHONICS_PHASES.has(id)) return wrap(<PhonicsPhase onComplete={onComplete} />);
  if (PHONICS_REVIEW_PHASES.has(id))
    return wrap(<PhonicsReviewPhase onComplete={onComplete} />);
  if (SENTENCE_PHASES.has(id)) return wrap(<SentencePhase onComplete={onComplete} />);
  if (SPELLING_PHASES.has(id)) return wrap(<SpellingPhase onComplete={onComplete} />);
  if (PRACTICE_PHASES.has(id)) return wrap(<PracticePhase onComplete={onComplete} />);
  if (MEMORY_PHASES.has(id))
    return wrap(<MemoryMatchWithVocab onComplete={onComplete} />);
  if (COOLDOWN_PHASES.has(id)) return <CoolDownPhase />;

  if (CHANT_PHASES.has(id)) {
    const lines = extractChantLines(page);
    if (lines.length) return wrap(<ChantPhase lines={lines} onComplete={onComplete} />);
    // No lyrics → let the runtime block renderer show the warm-up page itself.
    // Never recast warm-up as vocabulary, even when old/malformed payloads lack lyrics.
    return null;
  }

  if (STORY_PHASES.has(id)) {
    const story = lesson?.story;
    const scenes = story?.scenes ?? [];
    // Sync: story scene images the user generates in the creator land on
    // page.blocks as `image` blocks with `.url`. Hydrate scenes from those
    // URLs (in order) whenever the scene itself has no image_url so the
    // Play-Lesson view mirrors what the teacher authored.
    const blockImageUrls = ((page.blocks ?? []) as any[])
      .filter((b) => b?.kind === "image" && typeof b?.url === "string" && b.url.trim())
      .map((b) => b.url as string);
    if (scenes.length > 0) {
      const pages = scenes.map((s, i) => ({
        id: s.id || `scene-${i}`,
        image:
          (s as any).image_url ||
          (s as any).imageUrl ||
          blockImageUrls[i] ||
          "",
        text: [s.text],
        gaps: [],
      }));
      return (
        <SignedStoryPhase
          pages={pages}
          title={story?.title || page.title || "Story"}
          onComplete={onComplete}
        />
      );
    }
  }

  // Inference pass — unknown phase_id but page content tells us the kind.
  const inferred = inferRichKind(page);
  if (inferred === "memory") return wrap(<MemoryMatchWithVocab onComplete={onComplete} />);
  if (inferred === "sentence") return wrap(<SentencePhase onComplete={onComplete} />);
  if (inferred === "vocab") return wrap(<VocabularyPhase onComplete={onComplete} />);
  if (inferred === "chant") {
    const lines = extractChantLines(page);
    if (lines.length) return wrap(<ChantPhase lines={lines} onComplete={onComplete} />);
  }

  return null;
}

export function hasRichExperience(phaseId: string | undefined | null): boolean {
  const id = String(phaseId || "").toLowerCase();
  return (
    VOCAB_PHASES.has(id) ||
    MODELING_PHASES.has(id) ||
    PHONICS_PHASES.has(id) ||
    PHONICS_REVIEW_PHASES.has(id) ||
    SENTENCE_PHASES.has(id) ||
    SPELLING_PHASES.has(id) ||
    PRACTICE_PHASES.has(id) ||
    MEMORY_PHASES.has(id) ||
    COOLDOWN_PHASES.has(id) ||
    STORY_PHASES.has(id) ||
    CHANT_PHASES.has(id) ||
    VIDEO_WATCH_PHASES.has(id) ||
    VIDEO_CHECK_PHASES.has(id) ||
    ALPHABET_ARCADE_PHASES.has(id)
  );
}

// Re-export for back-compat (used by adjacent helpers).
export type { PlaygroundBlock };
