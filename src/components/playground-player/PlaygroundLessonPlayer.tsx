/**
 * PlaygroundLessonPlayer — Animal Adventure Academy 7-lesson template.
 *
 * Renders one locked lesson at a time via `PHASE_REGISTRY`. Optional
 * AI-generated `PlaygroundUnit` (from PlaygroundCreator) is exposed to
 * every phase component through `PlaygroundUnitContext`.
 *
 * See: docs/reference/animal-adventure-academy/PLAYGROUND_BLUEPRINT.md
 */
import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useEngineVoice } from "@/hooks/useEngineVoice";
import { usePlaygroundAudio } from "@/hooks/usePlaygroundAudio";

import type { Slide } from "@/pages/PlaygroundDemo";
import { PHASE_REGISTRY } from "@/playground-blueprint/phaseRegistry";
import {
  PLAYGROUND_UNIT_LESSONS,
  type PlaygroundLessonNumber,
} from "@/playground-blueprint/unitTemplate";
import {
  PlaygroundUnitProvider,
} from "@/playground-blueprint/PlaygroundUnitContext";
import { EmbeddedProvider } from "@/playground-blueprint/EmbeddedContext";
import type { PlaygroundLessonContent, PlaygroundUnit } from "@/playground-blueprint/types";
import type { PlaygroundBlock, PlaygroundPage } from "@/playground-blueprint/types";
import { derivePages } from "@/playground-blueprint/derivePages";
import { LessonShell, type PhaseDef } from "@/playground-blueprint/components/LessonShell";
import SlideStage from "@/components/lesson-player/SlideStage";
import { topicToEnvironment } from "@/orchestrator/topicToEnvironment";
import { phasePreset } from "@/orchestrator/phaseMotionPresets";
import { renderPhaseExperience } from "./phaseAdapter";
import { StepDeck } from "./StepDeck";
import engleuphoriaLogo from "@/assets/engleuphoria-logo.png";

import { CastChatPanel } from "@/components/cast-chat/CastChatPanel";
import { MessageCircle, Gamepad2, BookOpenCheck } from "lucide-react";
import GameRunner from "@/components/lesson-player/GameRunner";
import HomeworkRunner from "@/components/lesson-player/HomeworkRunner";
import type { GamePack, ReinforcementTarget, GameRound, HomeworkPack } from "@/coherence/types";
import { adaptEnrichment } from "@/lib/enrichmentAdapter";
import { emitHomeworkEvents } from "@/coherence/homeworkObserver";
import { useAuth } from "@/contexts/AuthContext";
import { VocabGamesSlot } from "@/vocab-games";
import {
  HotspotGame,
  MemoryGame,
  MissingLetterGame,
  PhonicsHuntGame,
  SortGame,
  TapOrderGame,
  TrailChoiceGame,
  TrailDragMatchGame,
  TrailWordGapGame,
  WordBuilderGame,
} from "./playground-games";

interface PlaygroundLessonPlayerProps {
  /** Legacy — kept for API compat. Ignored by the new blueprint player. */
  slides?: Slide[];
  /** Optional explicit lesson number (1..7). Defaults to 1. */
  lessonNumber?: PlaygroundLessonNumber;
  /** AI-generated unit (from PlaygroundCreator). When null, phase pages fall back to bundled reference content. */
  unit?: PlaygroundUnit | null;
  title?: string;
  subtitle?: string;
  cefr?: string;
  /** Legacy — ignored by the blueprint player. */
  startIndex?: number;
  embedded?: boolean;
  skipIntro?: boolean;
  onExit?: () => void;
}

const KNOWN_PHASE_IDS = new Set<string>([
  "intro",
  ...PLAYGROUND_UNIT_LESSONS.flatMap((lesson) => [...lesson.phase_ids]),
]);

function blockKind(block: unknown): string {
  return String((block as any)?.kind || "").toLowerCase();
}

function inferPhaseId(page: PlaygroundPage | undefined | null): string | null {
  if (!page) return null;
  const declared = String((page as any).phase_id || "").toLowerCase().trim();
  const title = `${(page as any).title || ""} ${(page as any).notes || ""}`.toLowerCase();
  const blocks = ((page as any).blocks ?? []) as any[];
  const hasLyrics = blocks.some((block) => ["lyrics_card", "lyrics", "music"].includes(blockKind(block)));
  const hasWarmupLabel = /warm[-\s]?up|song|chant|sing/.test(title) || blocks.some((block) => {
    const label = `${block?.label || ""} ${block?.title || ""}`.toLowerCase();
    return /warm[-\s]?up|song|chant|sing/.test(label);
  });
  if (hasLyrics || hasWarmupLabel) return "warmup";

  if (declared && KNOWN_PHASE_IDS.has(declared)) return declared;

  const hasVocabCard = blocks.some((block) => {
    const kind = blockKind(block);
    const label = `${block?.label || ""} ${block?.subject || ""} ${block?.word || ""} ${block?.headword || ""}`.toLowerCase();
    return kind === "vocab_card" || Boolean(block?.word || block?.headword) || /vocab|word card|flashcard/.test(label);
  });
  if (/vocab|flashcard/.test(title) || hasVocabCard) return "vocabulary";

  return declared || null;
}

function normalizePagePhase(page: PlaygroundPage | null | undefined): PlaygroundPage | null {
  if (!page) return null;
  const phaseId = inferPhaseId(page);
  return phaseId && phaseId !== page.phase_id ? { ...page, phase_id: phaseId } : page;
}

function phaseLabel(page: PlaygroundPage | undefined | null): string {
  const phaseId = String(page?.phase_id || "").toLowerCase();
  if (phaseId === "warmup") return "Warm-up";
  if (phaseId === "vocabulary") return "Vocabulary";
  if (phaseId === "chat_quest") return "Chat Quest";
  if (phaseId === "game_pack") return "Game Pack";
  if (phaseId === "homework") return "Homework";
  return (page?.title || page?.phase_id || "Lesson page").replace(/_/g, " ");
}

const REINFORCEMENT_PHASE_IDS = ["chat_quest", "game_pack", "homework"] as const;

export function PlaygroundLessonPlayer({
  lessonNumber = 1,
  unit = null,
  embedded = false,
  skipIntro = false,
  onExit,
}: PlaygroundLessonPlayerProps) {
  const [current, setCurrent] = useState<PlaygroundLessonNumber>(lessonNumber);
  const [pageIndex, setPageIndex] = useState(0);
  useEffect(() => setCurrent(lessonNumber), [lessonNumber]);

  const LessonComponent = PHASE_REGISTRY[current];
  const tpl = PLAYGROUND_UNIT_LESSONS.find((l) => l.lesson_number === current);
  const aiLesson = unit?.lessons.find((l) => l.lesson_number === current);
  const dynamicPages = useMemo(() => {
    if (!aiLesson) return [] as PlaygroundPage[];
    // Coerce lesson_number so template lookup never fails on string payloads.
    const lessonNum = Number((aiLesson as any).lesson_number) || current;
    const normalized: PlaygroundLessonContent = {
      ...(aiLesson as any),
      lesson_number: lessonNum as PlaygroundLessonNumber,
    };
    // Canonical template order = source of truth for sequencing.
    const tpl = PLAYGROUND_UNIT_LESSONS.find((l) => l.lesson_number === lessonNum);
    const canonicalOrder: string[] = ["intro", ...((tpl?.phase_ids ?? []) as readonly string[])];

    const derived = derivePages(normalized).map((page) => normalizePagePhase(page) ?? page);
    const edited = (normalized as any).pages as PlaygroundPage[] | undefined;
    let pages: PlaygroundPage[] = derived;
    if (Array.isArray(edited) && edited.length > 0) {
      const editedByPhase = new Map<string, PlaygroundPage>();
      edited.map(normalizePagePhase).forEach((p) => {
        if (!p) return;
        const phaseId = inferPhaseId(p);
        if (phaseId) editedByPhase.set(phaseId, { ...p, phase_id: phaseId });
      });
      pages = derived.map((p) => editedByPhase.get(p.phase_id) ?? p);
      const derivedPhases = new Set(derived.map((p) => p.phase_id));
      edited.map(normalizePagePhase).forEach((p) => {
        if (!p) return;
        const phaseId = inferPhaseId(p);
        if (phaseId && !derivedPhases.has(phaseId)) pages.push({ ...p, phase_id: phaseId });
      });
    }
    // Hard-enforce canonical phase order — warmup ALWAYS precedes vocabulary,
    // regardless of how the lesson was materialized or edited in the DB.
    if (canonicalOrder.length > 1) {
      const rank = (phaseId: string) => {
        const idx = canonicalOrder.indexOf(phaseId);
        return idx === -1 ? canonicalOrder.length + 1 : idx;
      };
      pages = pages
        .map((page, index) => ({ page: normalizePagePhase(page) ?? page, index }))
        .sort((a, b) => rank(a.page.phase_id) - rank(b.page.phase_id) || a.index - b.index)
        .map(({ page }) => page);
    }
    pages = skipIntro ? pages.filter((p) => p.phase_id !== "intro") : pages;
    // Video Lesson Track — inject watch + check phases when the lesson has a
    // generated video_lesson payload (from `generate-lesson-video`).
    const videoLesson = (aiLesson as any)?.video_lesson;
    const videoPages: PlaygroundPage[] = [];
    if (videoLesson?.video_url) {
      videoPages.push({
        id: `video_watch-${lessonNum}`,
        phase_id: "video_watch",
        title: "Watch",
        video_url: videoLesson.video_url,
        poster_url: videoLesson.starting_frame_url,
        blocks: [],
      } as unknown as PlaygroundPage);
      if (Array.isArray(videoLesson.questions) && videoLesson.questions.length > 0) {
        videoPages.push({
          id: `video_check-${lessonNum}`,
          phase_id: "video_check",
          title: "Check",
          questions: videoLesson.questions,
          blocks: [],
        } as unknown as PlaygroundPage);
      }
    }
    // Append reinforcement phases as in-lesson pages (Chat Quest → Game Pack → Homework).
    const reinforcementPages: PlaygroundPage[] = REINFORCEMENT_PHASE_IDS.map((phaseId) => ({
      id: `${phaseId}-${lessonNum}`,
      phase_id: phaseId,
      title:
        phaseId === "chat_quest" ? "Chat Quest"
        : phaseId === "game_pack" ? "Game Pack"
        : "Homework",
      blocks: [],
    } as unknown as PlaygroundPage));
    // Alphabet Arcade — bonus end-of-lesson phonics/letter mini-games.
    const alphabetArcadePage: PlaygroundPage = {
      id: `alphabet_arcade-${lessonNum}`,
      phase_id: "alphabet_arcade",
      title: "Alphabet Arcade",
      blocks: [],
    } as unknown as PlaygroundPage;
    return [...pages, ...videoPages, ...reinforcementPages, alphabetArcadePage];
  }, [aiLesson, skipIntro, current]);
  useEffect(() => setPageIndex(0), [current, dynamicPages.length]);
  const chatTopic = aiLesson?.story?.title || tpl?.title || unit?.unit_topic || "everyday conversation";
  const chatVocab = aiLesson?.vocab ?? [];

  const { gamePack, gameTargets, homeworkPack } = (() => {
    // Prefer enrichment baked into the lesson by generate-ace-lesson.
    const raw = (aiLesson as any)?.gamified_elements;
    const adapted = adaptEnrichment(raw, {
      hub: "playground",
      lessonId: `lesson-${current}`,
      cast: (aiLesson as any)?.cast ?? (unit as any)?.cast ?? [],
    });
    if (adapted) return adapted;

    // Fallback: synthesize from lesson vocab.
    const words = (chatVocab.length ? chatVocab : ["hello", "friend", "play"]).slice(0, 6);
    const targets: ReinforcementTarget[] = words.map((w, i) => ({
      id: `t-${current}-${i}`,
      source: "lesson_target",
      skill_kind: "vocab",
      skill_key: w.toLowerCase(),
      label: w,
      priority: 0.6,
      cefr_ceiling: "A1",
    }));
    const types: GameRound["type"][] = ["WordRush", "MeaningMaze", "MemoryGrid", "SoundMatch"];
    const rounds: GameRound[] = targets.map((t, i) => ({
      id: `r-${current}-${i}`,
      type: types[i % types.length],
      reinforcement_target_id: t.id,
      scenario_key: `lesson_${current}`,
      difficulty_tier: 1,
      educational_value: 0.7,
      is_boss: i === targets.length - 1,
    }));
    const pack: GamePack = {
      lessonId: `lesson-${current}`,
      studentId: "preview",
      hub: "playground",
      rounds,
      educational_value_avg: 0.7,
    };
    const hw: HomeworkPack = {
      lessonId: `lesson-${current}`,
      studentId: "preview",
      hub: "playground",
      tasks: [],
      total_minutes: 0,
      coherence_score: 0.6,
      drill_plan: { direction_start: "receptive", cards: words.map((w) => ({ skill_key: w.toLowerCase(), label: w })) },
    };
    return { gamePack: pack, gameTargets: targets, homeworkPack: hw };
  })();

  // Pre-A1 audio + visual only track — flips a body class the CSS layer uses
  // to hide long text prompts / captions and to autoplay audio. A1+ lessons
  // are unaffected because the class is only applied for Pre-A1 CEFR.
  const cefrForMode: string = (unit as any)?.cefr || (aiLesson as any)?.cefr || (tpl as any)?.cefr || '';
  const preA1Mode = /^pre[\s_-]?a1$/i.test(String(cefrForMode).trim());

  // Pre-A1: speak the current page title on slide change via ElevenLabs Lily
  // (kid-friendly voice, cached blob URL) with graceful fallback + circuit
  // breaker inherited from usePlaygroundAudio. Native speechSynthesis is not
  // used because it sounds robotic to non-readers.
  const { playVoice, stop: stopVoice } = usePlaygroundAudio();
  const speakCurrentSlide = useMemo(() => () => {
    if (!preA1Mode) return;
    const page = dynamicPages[Math.min(pageIndex, dynamicPages.length - 1)];
    const text = String((page as any)?.title || (page as any)?.audio_word || "").trim();
    if (!text) return;
    void playVoice(text);
  }, [preA1Mode, pageIndex, dynamicPages, playVoice]);

  useEffect(() => {
    speakCurrentSlide();
    return () => stopVoice();
  }, [speakCurrentSlide, stopVoice]);





  return (
    <PlaygroundUnitProvider unit={unit}>
      <EmbeddedProvider embedded={embedded}>
      <div
        data-pre-a1={preA1Mode ? 'true' : 'false'}
        className={`${preA1Mode ? 'pre-a1-mode ' : ''}${embedded ? 'relative w-full bg-playground-mesh' : 'relative min-h-screen w-full bg-playground-mesh'}`}
      >
        {/* Top bar — lesson chooser */}
        <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 border-b border-[#FE6A2F]/20 bg-white/70 px-4 py-2 backdrop-blur">
          <div className="text-sm font-semibold text-[#3a1d0a] shrink-0">
            Lesson {current} ·{" "}
            {(aiLesson as any)?.focus_label ||
              (aiLesson as any)?.title ||
              aiLesson?.story?.title ||
              tpl?.title}
          </div>
          <div className="flex flex-wrap items-center gap-1 shrink-0">

            {PLAYGROUND_UNIT_LESSONS.map((l) => (
              <button
                key={l.lesson_number}
                onClick={() => setCurrent(l.lesson_number as PlaygroundLessonNumber)}
                className={`h-8 w-8 rounded-full text-xs font-bold transition ${
                  current === l.lesson_number
                    ? "bg-[#FE6A2F] text-white shadow"
                    : "bg-white/80 text-[#3a1d0a] hover:bg-[#FE6A2F]/15"
                }`}
                aria-label={`Open lesson ${l.lesson_number}`}
              >
                {l.lesson_number}
              </button>
            ))}
            {(["chat_quest", "game_pack", "homework"] as const).map((pid) => {
              const idx = dynamicPages.findIndex((p) => p.phase_id === pid);
              if (idx < 0) return null;
              const Icon = pid === "chat_quest" ? MessageCircle : pid === "game_pack" ? Gamepad2 : BookOpenCheck;
              const label = pid === "chat_quest" ? "Chat Quest" : pid === "game_pack" ? "Game Pack" : "Homework";
              return (
                <button
                  key={pid}
                  onClick={() => setPageIndex(idx)}
                  className="ml-1 flex items-center gap-1 rounded-full bg-[#FE6A2F]/15 px-3 py-1 text-xs font-semibold text-[#3a1d0a] hover:bg-[#FE6A2F]/25"
                  title={`Jump to ${label}`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              );
            })}
            {onExit && (
              <button
                onClick={onExit}
                className="ml-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#3a1d0a] hover:bg-[#FE6A2F]/15"
              >
                Exit
              </button>
            )}
          </div>
        </div>

        {/* AI banner removed — AAA-style player keeps chrome minimal so the LessonShell owns the frame. */}


        <Suspense
          fallback={
            <div className="grid min-h-[400px] place-items-center text-[#3a1d0a]">
              Loading lesson…
            </div>
          }
        >
          {/* When an AI-generated/edited unit is available, render the
              derived pages directly so vocab images, intro, and warm-up
              edits stay in sync with the teacher editor. Fall back to the
              bundled AAA reference lesson when no unit is present. */}
          {dynamicPages.length > 0 ? (
            <GeneratedLessonRuntime
              pages={dynamicPages}
              lesson={aiLesson}
              unit={unit}
              lessonNumber={current}
              pageIndex={Math.min(pageIndex, dynamicPages.length - 1)}
              onPrev={() => setPageIndex((i) => Math.max(0, i - 1))}
              onNext={() => setPageIndex((i) => Math.min(dynamicPages.length - 1, i + 1))}
              chatTopic={chatTopic}
              chatVocab={chatVocab}
              gamePack={gamePack}
              gameTargets={gameTargets}
              homeworkPack={homeworkPack}
            />
          ) : (
            <LessonComponent />
          )}

        </Suspense>
      </div>
      {preA1Mode && (
        <button
          type="button"
          onClick={speakCurrentSlide}
          aria-label="Play again"
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#FE6A2F] text-white shadow-2xl ring-4 ring-white transition hover:scale-105 active:scale-95"
          data-pre-a1-audio="true"
        >
          <span aria-hidden className="text-3xl">🔊</span>
        </button>
      )}
      </EmbeddedProvider>
    </PlaygroundUnitProvider>

  );
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function normalizeOptions(config: Record<string, unknown>): string[] {
  const options = [
    ...asStringArray(config.options),
    ...asStringArray(config.words),
    ...asStringArray(config.items),
    ...asStringArray(config.lines),
    ...asStringArray(config.answers),
  ];
  const pairWords = pairsToWords(config.pairs).concat(pairsToWords(config.matches));
  // Flashcard payloads: cards: [{ front, back }]
  const cardWords = Array.isArray(config.cards)
    ? (config.cards as any[]).flatMap((c) => [c?.front, c?.back, c?.word, c?.label])
        .filter((x: unknown): x is string => typeof x === "string" && x.trim().length > 0)
    : [];
  // Quiz payloads: questions: [{ q, options, answer }]
  const questionOptions = Array.isArray(config.questions)
    ? (config.questions as any[]).flatMap((q) => (Array.isArray(q?.options) ? q.options : []))
        .filter((x: unknown): x is string => typeof x === "string" && x.trim().length > 0)
    : [];
  // Listen/match payloads: items: [{ audio_word, image_prompt }]
  const itemObjectWords = Array.isArray(config.items)
    ? (config.items as any[]).flatMap((i) => [i?.audio_word, i?.word, i?.label, i?.text])
        .filter((x: unknown): x is string => typeof x === "string" && x.trim().length > 0)
    : [];
  const merged = [...options, ...pairWords, ...cardWords, ...questionOptions, ...itemObjectWords];
  if (merged.length) return Array.from(new Set(merged));
  const word = typeof config.word === "string" ? config.word : "";
  const answer = typeof config.answer === "string" ? config.answer : "";
  return [word, answer].filter(Boolean);
}

function pairsToWords(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((pair: any) => [pair?.word, pair?.label, pair?.left, pair?.right, pair?.text])
    .filter((value: unknown): value is string => typeof value === "string" && value.trim().length > 0);
}

function lessonImageFor(lesson: PlaygroundLessonContent | undefined | null, word: string): string {
  if (!lesson) return "";
  const key = String(word ?? "").toLowerCase().trim();
  if (!key) return "";
  const media = (lesson as any).vocab_media?.[word] || (lesson as any).vocab_media?.[key];
  if (media?.imageUrl) return media.imageUrl;
  if (media?.image_url) return media.image_url;
  // Fallback: scan vocab cards baked into the page blocks (the editor writes
  // generated images straight onto the vocab_card.image_url so changes appear
  // immediately in Play Lesson without a re-derive pass).
  for (const page of (lesson as any).pages ?? []) {
    for (const block of page.blocks ?? []) {
      const blockWord = String(block?.word ?? block?.headword ?? "").toLowerCase().trim();
      if (blockWord && blockWord === key) {
        const url = block?.image_url || block?.imageUrl || block?.url;
        if (typeof url === "string" && url.trim()) return url.trim();
      }
    }
  }
  return "";
}

function configText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function activityWords(config: Record<string, unknown>, lesson?: PlaygroundLessonContent | null): string[] {
  return Array.from(new Set([
    ...normalizeOptions(config),
    ...(lesson?.vocab ?? []),
    ...(((lesson as any)?.review_targets ?? []) as string[]),
  ].map((word) => String(word).trim()).filter(Boolean)));
}

function activityPairs(config: Record<string, unknown>, lesson?: PlaygroundLessonContent | null) {
  const explicit = Array.isArray(config.pairs) && config.pairs.length ? config.pairs : Array.isArray(config.matches) ? config.matches : [];
  const pairs = explicit
    .map((pair: any) => {
      const word = configText(pair?.word, pair?.label, pair?.left, pair?.text, pair?.right);
      if (!word) return null;
      return {
        word: word.toUpperCase(),
        image_url: configText(pair?.image_url, pair?.imageUrl, pair?.image, pair?.url, lessonImageFor(lesson, word), word),
      };
    })
    .filter(Boolean) as { word: string; image_url: string }[];
  if (pairs.length) return pairs;
  return activityWords(config, lesson).slice(0, 6).map((word) => ({
    word: word.toUpperCase(),
    image_url: lessonImageFor(lesson, word) || word,
  }));
}

function emojiFor(word: string) {
  const key = word.toLowerCase();
  if (/cat/.test(key)) return "🐱";
  if (/dog/.test(key)) return "🐶";
  if (/cow/.test(key)) return "🐮";
  if (/pig/.test(key)) return "🐷";
  if (/duck|hen|bird/.test(key)) return "🐤";
  if (/apple/.test(key)) return "🍎";
  if (/sun/.test(key)) return "☀️";
  if (/hello|hi/.test(key)) return "👋";
  return "⭐";
}

function shuffleList<T>(items: T[]): T[] {
  return items
    .map((item, index) => ({ item, score: Math.sin((index + 1) * 999) }))
    .sort((a, b) => a.score - b.score)
    .map(({ item }) => item);
}

function GeneratedLessonRuntime({
  pages,
  lesson,
  unit,
  lessonNumber,
  pageIndex,
  onPrev,
  onNext,
  chatTopic,
  chatVocab,
  gamePack,
  gameTargets,
  homeworkPack,
}: {
  pages: PlaygroundPage[];
  lesson?: PlaygroundLessonContent | null;
  unit?: PlaygroundUnit | null;
  lessonNumber: PlaygroundLessonNumber;
  pageIndex: number;
  onPrev: () => void;
  onNext: () => void;
  chatTopic: string;
  chatVocab: string[];
  gamePack: GamePack;
  gameTargets: ReinforcementTarget[];
  homeworkPack: HomeworkPack;
}) {
  const page = pages[Math.min(pageIndex, pages.length - 1)] ?? pages[0];
  const phases: PhaseDef[] = pages.map((p) => ({
    id: p.id,
    label: phaseLabel(p),
  }));

  const isIntro = page?.phase_id === "intro";
  const phaseId = page?.phase_id;
  const isReinforcement = phaseId === "chat_quest" || phaseId === "game_pack" || phaseId === "homework";
  const rich = isIntro || isReinforcement
    ? null
    : renderPhaseExperience(page, lesson, onNext);

  const themeStr =
    (unit as any)?.unit_theme ?? (unit as any)?.unit_topic ?? lesson?.story?.title ?? null;
  const _preset = phasePreset((page as any)?.phase_id, themeStr);
  const _authoredMascot = (page as any)?.mascot ?? {};
  const _authoredMotion = (page as any)?.motion;
  const stageMascot = {
    ..._preset.mascot,
    ..._authoredMascot,
    environment: _authoredMascot.environment ?? _preset.mascot.environment,
  };
  const stageMotion = _authoredMotion ?? _preset.motion;

  return (
    <LessonShell
      phases={phases}
      currentIndex={pageIndex}
      onPrev={onPrev}
      onNext={onNext}
      title={phaseLabel(page)}
      subtitle={page?.notes || page?.phase_id?.replace(/_/g, " ")}
      canAdvance={true}
      finishedCelebration={pageIndex === pages.length - 1}
    >
      <SlideStage
        key={page?.id ?? pageIndex}
        mascot={stageMascot}
        motion={stageMotion}
      >
      {(() => {
        // ─── Supplemental blocks helper ────────────────────────────────
        // Rich phase components (Vocabulary, Modeling, Phonics, Sentence,
        // Spelling, Chant) render curated content from lesson.vocab /
        // lesson.story. The teacher's authored `page.blocks` often carry
        // extras (poster images, warm-up music, story-scene comics,
        // custom audio, language-engine slots, activities). This helper
        // returns the authored blocks that the rich phase does NOT
        // already visualise, deduped by id, in authored order.
        const CONSUMED: Record<string, ReadonlySet<string>> = {
          intro:              new Set(["text"]), // IntroCard renders title/objective
          warmup:             new Set(["lyrics_card", "lyrics", "text"]),
          chant:              new Set(["lyrics_card", "lyrics", "text"]),
          song:               new Set(["lyrics_card", "lyrics", "text"]),
          vocabulary:         new Set(["image", "audio"]),
          vocab_refresher:    new Set(["image", "audio"]),
          flashcards:         new Set(["image", "audio"]),
          // Modeling/Sentence: keep the story-scene images + line audios
          // + dialogue text visible below the rich drill so what the
          // teacher authored actually appears. Only the echo/sequence
          // activity is already covered by the rich phase.
          modeling:           new Set(["activity"]),
          build_frame:        new Set(["activity"]),
          // Sentence phases: SentencePhase already builds the sentence from
          // lesson.vocab + story. The scene images/line audios/dialogue text
          // authored on the page duplicate the Modeling story strip, so we
          // consume them here and let the rich builder own the slide.
          sentence:           new Set(["activity", "image", "audio", "text"]),
          sentence_mixer:     new Set(["activity", "image", "audio", "text"]),
          sentence_scramble:  new Set(["activity", "image", "audio", "text"]),
          phonics:            new Set(["image", "audio", "text"]),
          phonics_review:     new Set(["image", "audio", "text"]),
          spelling:           new Set(["text", "audio", "activity"]),
          spell_it:           new Set(["text", "audio", "activity"]),
        };
        const lyricsSignature = ((page?.blocks ?? []) as any[])
          .filter((b) => b?.kind === "lyrics_card" || b?.kind === "lyrics")
          .map((b) => String(b?.value ?? "").replace(/\s+/g, " ").trim())
          .join(" | ");
        const consumed =
          CONSUMED[String(phaseId || "").toLowerCase()] ?? new Set<string>();
        const seenIds = new Set<string>();
        const supplemental = ((page?.blocks ?? []) as any[]).filter((b, i) => {
          const k = String(b?.kind || "").toLowerCase();
          if (!k) return false;
          if (consumed.has(k)) return false;
          // Skip empty / broken authored blocks.
          if (k === "video" && !(b?.url || b?.video_job_id)) return false;
          if (k === "activity") {
            const cfg = b?.config;
            if (!b?.type) return false;
            if (!cfg || (typeof cfg === "object" && Object.keys(cfg).length === 0)) return false;
          }
          // Warm-up: drop the full-song audio that duplicates the chant
          // (ChantPhase already narrates the lyrics).
          if ((phaseId === "warmup" || phaseId === "chant" || phaseId === "song") && k === "audio") {
            if (b?.fullSong) return false;
            const t = String(b?.text ?? "").replace(/\s+/g, " ").trim();
            if (t && lyricsSignature && lyricsSignature.includes(t)) return false;
          }
          // Dedupe by id so duplicate authored ids don't crash React keys.
          const id = b?.id || `${k}-${i}`;
          if (seenIds.has(id)) return false;
          seenIds.add(id);
          return true;
        });
        const renderSupplemental = () =>
          supplemental.length ? (
            supplemental.length === 1 ? (
              <div className="mt-6">
                <RuntimeBlock
                  key={(supplemental[0] as any).id ?? `${(supplemental[0] as any).kind}-0`}
                  block={supplemental[0] as any}
                  lesson={lesson}
                />
              </div>
            ) : (
              <div className="mt-6">
                <StepDeck
                  ariaLabel="Lesson activities"
                  label="activity"
                  onDone={onNext}
                  items={supplemental.map((block, i) => (
                    <RuntimeBlock
                      key={(block as any).id ?? `${(block as any).kind}-${i}`}
                      block={block as any}
                      lesson={lesson}
                    />
                  ))}
                />
              </div>
            )
          ) : null;

        if (isIntro) {
          return (
            <>
              <IntroCard
                page={page}
                lesson={lesson}
                unit={unit}
                lessonNumber={lessonNumber}
              />
              {renderSupplemental()}
            </>
          );
        }
        if (phaseId === "chat_quest") {
          return (
            <div className="rounded-2xl bg-white/80 p-4">
              <h3 className="mb-3 text-lg font-bold text-[#3a1d0a]">🎭 Practice with a Character</h3>
              <CastChatPanel hub="playground" topic={chatTopic} lessonVocab={chatVocab} compact />
            </div>
          );
        }
        if (phaseId === "game_pack") {
          return (
            <div className="rounded-2xl bg-white/80 p-2">
              <h3 className="mb-2 px-3 pt-2 text-lg font-bold text-[#3a1d0a]">🎮 Game Pack</h3>
              <GameRunner
                hub="playground"
                pack={gamePack}
                targets={gameTargets}
                onClose={onNext}
                vocabMedia={(lesson as any)?.vocab_media}
                allVocab={chatVocab}
              />
            </div>
          );
        }
        if (phaseId === "homework") {
          const authored = (lesson as any)?.homework?.tasks as
            | Array<{ id: string; type: string; label?: string; prompt?: string; payload?: any }>
            | undefined;
          if (authored && authored.length > 0) {
            return (
              <AuthoredHomeworkPhase
                lesson={lesson}
                tasks={authored}
                title={(lesson as any).homework?.title}
                onFinish={onNext}
              />
            );
          }
          return (
            <div className="rounded-2xl bg-white/80 p-2">
              <h3 className="mb-2 px-3 pt-2 text-lg font-bold text-[#3a1d0a]">📓 Homework</h3>
              <HomeworkRunner
                hub="playground"
                pack={homeworkPack}
                onClose={onNext}
                vocabMedia={(lesson as any)?.vocab_media}
                allVocab={chatVocab}
              />
            </div>
          );
        }
        if (rich) {
          // Modeling + Sentence: prepend a compact 3-panel scene strip built
          // from authored image blocks so what the teacher drew actually
          // appears above the rich drill.
          const showStrip = phaseId === "modeling" || phaseId === "sentence" || phaseId === "sentence_mixer" || phaseId === "sentence_scramble";
          const stripImages = showStrip
            ? ((page?.blocks ?? []) as any[])
                .filter((b) => String(b?.kind || "").toLowerCase() === "image" && typeof b?.url === "string" && b.url.trim())
                .slice(0, 3)
            : [];
          return (
            <>
              {stripImages.length > 0 && (
                <div className="mb-4">
                  <StepDeck
                    ariaLabel="Story scenes"
                    label="scene"
                    items={stripImages.map((img, i) => (
                      <figure
                        key={img.id ?? `scene-${i}`}
                        className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-[#FE6A2F]/20 bg-white shadow-sm"
                      >
                        <img
                          src={img.url}
                          alt={img.label || `Scene ${i + 1}`}
                          className="aspect-[4/3] w-full object-cover"
                        />
                        {(img.label || img.caption) && (
                          <figcaption className="px-4 py-3 text-center">
                            {img.label && (
                              <div className="text-sm font-extrabold text-[#3a1d0a]">
                                {img.label}
                              </div>
                            )}
                            {img.caption && (
                              <div className="mt-1 text-xs font-semibold text-[#3a1d0a]/70">
                                {img.caption}
                              </div>
                            )}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  />
                </div>
              )}
              {rich}
              {renderSupplemental()}
            </>
          );
        }
        // Fallback path (e.g. language_engine): step-through the sanitised
        // supplemental list so learners advance one activity at a time.
        if (supplemental.length <= 1) {
          return supplemental.length === 1 ? (
            <RuntimeBlock
              key={(supplemental[0] as any).id ?? `${(supplemental[0] as any).kind}-0`}
              block={supplemental[0] as any}
              lesson={lesson}
            />
          ) : null;
        }
        return (
          <StepDeck
            ariaLabel="Lesson activities"
            label="activity"
            onDone={onNext}
            items={supplemental.map((block, i) => (
              <RuntimeBlock
                key={(block as any).id ?? `${(block as any).kind}-${i}`}
                block={block as any}
                lesson={lesson}
              />
            ))}
          />
        );
      })()}
      </SlideStage>

    </LessonShell>
  );
}

/**
 * IntroCard — 50/50 lesson opener.
 * Left: hero theme image (first available image from the lesson).
 * Right: hub badge, level, unit, lesson title + glossy orange Engleuphoria logo.
 */
function IntroCard({
  page,
  lesson,
  unit,
  lessonNumber,
}: {
  page: PlaygroundPage;
  lesson?: PlaygroundLessonContent | null;
  unit?: PlaygroundUnit | null;
  lessonNumber: PlaygroundLessonNumber;
}) {
  const tpl = PLAYGROUND_UNIT_LESSONS.find((l) => l.lesson_number === lessonNumber);
  const hub = "Playground";
  const level = (unit as any)?.cefr || (lesson as any)?.cefr || "Pre-A1";
  const unitTopic = (unit as any)?.unit_topic || (unit as any)?.title || "Unit";
  const title =
    (lesson as any)?.focus_label ||
    (lesson as any)?.title ||
    lesson?.story?.title ||
    tpl?.title ||
    `Lesson ${lessonNumber}`;
  const objective =
    (lesson as any)?.objective || (tpl as any)?.objective || "";

  const heroImage = (() => {
    // 1) Explicit topic / cover images set by TopicImageGenerator.
    const cover =
      (lesson as any)?.cover_image ||
      (lesson as any)?.topic_image ||
      (unit as any)?.cover_image;
    if (typeof cover === "string" && cover.trim()) return cover;
    // 2) Any image block on the intro page itself.
    for (const b of (page.blocks ?? []) as any[]) {
      if (b?.url) return b.url as string;
    }
    // 3) Any image block across the whole lesson (e.g. warm-up scene).
    for (const p of ((lesson as any)?.pages ?? []) as any[]) {
      for (const b of (p?.blocks ?? []) as any[]) {
        if (b?.kind === "image" && b?.url) return b.url as string;
      }
    }
    // 4) Generated vocab media bag.
    const media = (lesson as any)?.vocab_media || {};
    for (const k of Object.keys(media)) {
      if (media[k]?.imageUrl) return media[k].imageUrl as string;
    }
    // 5) Story scene fallback.
    const scene = lesson?.story?.scenes?.[0] as any;
    return scene?.image_url || scene?.imageUrl || "";
  })();

  return (
    <div className="overflow-hidden rounded-3xl border border-[#FE6A2F]/20 bg-white shadow-xl">
      <div className="grid min-h-[26rem] grid-cols-1 md:grid-cols-2">
        {/* LEFT — theme image */}
        <div className="relative grid place-items-center bg-gradient-to-br from-amber-100 to-orange-200 p-4">
          {heroImage ? (
            <img
              src={heroImage}
              alt={title}
              className="h-full max-h-[28rem] w-full rounded-2xl object-cover shadow-md"
            />
          ) : (
            <div className="grid h-full min-h-[20rem] w-full place-items-center rounded-2xl bg-white/50 text-7xl">
              🦊
            </div>
          )}
        </div>

        {/* RIGHT — info panel */}
        <div className="relative flex flex-col justify-between gap-6 bg-gradient-to-br from-white to-amber-50 p-8">
          {/* Glossy orange Engleuphoria logo ball */}
          <div className="absolute right-6 top-6">
            <div
              className="relative grid h-16 w-16 place-items-center rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 25%, #FFD9B5 0%, #FE9A4E 35%, #FE6A2F 70%, #C7430F 100%)",
                boxShadow:
                  "0 10px 24px -6px rgba(254,106,47,0.55), inset -4px -6px 12px rgba(0,0,0,0.18), inset 4px 6px 10px rgba(255,255,255,0.45)",
              }}
            >
              <img
                src={engleuphoriaLogo}
                alt="Engleuphoria"
                className="h-10 w-10 object-contain drop-shadow"
              />
              {/* glossy highlight */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-2 top-1.5 h-4 w-6 rounded-full bg-white/70 blur-[2px]"
              />
            </div>
          </div>

          <div className="space-y-3 pr-20">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FE6A2F] px-3 py-1 text-xs font-black uppercase tracking-widest text-white shadow">
              🎈 {hub} Hub
            </span>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-bold text-[#3a1d0a]">
                Level · {level}
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-[#3a1d0a]">
                Unit · {unitTopic}
              </span>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-[#3a1d0a]">
                Lesson {lessonNumber}
              </span>
            </div>
            <h1 className="text-4xl font-black leading-tight text-[#3a1d0a]">
              {title}
            </h1>
            {objective ? (
              <p className="text-base font-medium leading-relaxed text-[#3a1d0a]/75">
                {objective}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 text-sm font-bold text-[#FE6A2F]">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#FE6A2F]" />
            Ready when you are — tap Next to begin →
          </div>
        </div>
      </div>
    </div>
  );
}

export function RuntimeBlock({ block, lesson }: { block: PlaygroundBlock; lesson?: PlaygroundLessonContent | null }) {
  const anyBlock = block as any;
  if (anyBlock.kind === "vocab_games_slot" || anyBlock.type === "vocab_games_slot") {
    const targets = anyBlock.targets ?? [];
    const mode = anyBlock.mode ?? "lesson";
    return (
      <VocabGamesSlot
        hub={anyBlock.hub ?? "playground"}
        cefr={anyBlock.cefr ?? "A1"}
        lessonId={String(lesson?.lesson_number ?? "")}
        targets={targets}
        mode={mode}
        passThreshold={anyBlock.passThreshold}
        onComplete={(summary) => {
          // Bridge to intelligence observer via the vocab-arc telemetry channel.
          // Fire-and-forget; observer no-ops for anonymous sessions.
          import("@/lib/vocabArcTelemetry")
            .then(({ emitVocabArcComplete, VOCAB_GAMES_ENGINE_SOURCE }) => {
              const total = summary.events.length;
              const correct = summary.events.filter((e) => e.correct).length;
              emitVocabArcComplete({
                telemetry_tag: `vocab_games_${summary.mode}`,
                skill_key: summary.mode === "quiz" ? "vocab_assessment" : "vocab_retrieval",
                target_words: targets.map((t: any) => t.word).filter(Boolean),
                attempts: total,
                correct,
                accuracy: Math.round(summary.accuracy * 100),
                duration_ms: summary.ms_elapsed,
                source: VOCAB_GAMES_ENGINE_SOURCE,
              });
            })
            .catch(() => {});
        }}
      />
    );
  }
  if (block.kind === "text") {
    const speak = () => {
      if (block.value && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(block.value));
      }
    };
    return (
      <div className="relative rounded-3xl border border-orange-100 bg-white/75 p-5 text-center shadow-sm">
        <button
          onClick={speak}
          title="Play"
          aria-label="Play"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[#FE6A2F] text-white shadow-md ring-2 ring-white transition hover:scale-110 active:scale-95"
        >
          <span className="text-base leading-none">🔊</span>
        </button>
        {block.label ? <p className="mb-2 pr-10 text-xs font-black uppercase tracking-widest text-[#FE6A2F]">{block.label}</p> : null}
        <p className="whitespace-pre-line pr-10 text-2xl font-extrabold leading-snug text-[#3a1d0a]">{block.value}</p>
      </div>
    );
  }

  if ((block as any).kind === "lyrics_card" || (block as any).kind === "lyrics") {
    const b: any = block;
    const lines: string[] = Array.isArray(b.lines)
      ? b.lines
      : String(b.value ?? b.text ?? "").split(/\n+/).filter(Boolean);
    return (
      <div className="rounded-3xl border-2 border-[#FE6A2F]/40 bg-gradient-to-br from-amber-50 to-orange-100 p-6 shadow-md">
        <p className="mb-3 text-center text-xs font-black uppercase tracking-widest text-[#FE6A2F]">
          🎵 {b.label || "Song lyrics"}
        </p>
        <div className="space-y-1 text-center">
          {lines.map((ln, i) => (
            <p key={i} className="text-xl font-extrabold leading-snug text-[#3a1d0a]">
              {ln}
            </p>
          ))}
        </div>
        {b.audio_url ? (
          <audio src={b.audio_url} controls className="mx-auto mt-4 w-full max-w-md" />
        ) : null}
      </div>
    );
  }

  if (block.kind === "image") {
    return (
      <div className="rounded-3xl border border-orange-100 bg-white/75 p-5 text-center shadow-sm">
        {block.url ? (
          <img src={block.url} alt={block.label || block.subject} className="mx-auto max-h-[28rem] w-full object-contain" />
        ) : (
          <div className="grid min-h-64 place-items-center rounded-3xl bg-gradient-to-br from-orange-100 to-amber-50 p-6">
            <div className="max-w-xl text-center">
              <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-[#FE6A2F] text-5xl shadow-xl">🦊</div>
              <p className="text-xl font-black text-[#3a1d0a]">{block.label || "Scene"}</p>
              <p className="mt-2 text-sm font-semibold text-[#3a1d0a]/70">{block.prompt || block.subject}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (block.kind === "audio") {
    // Audio playback is integrated as a 🔊 icon inside the story text bubble
    // (see `text` block above). Rendering nothing here removes the redundant
    // standalone play card that was taking half the story slide.
    return null;
  }

  if (block.kind === "video") {
    return (
      <div className="rounded-3xl border border-orange-100 bg-white/75 p-5 shadow-sm">
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#FE6A2F]">🎬 {block.label || "Video model"}</p>
        {block.url ? (
          <video src={block.url} controls className="w-full rounded-2xl" />
        ) : (
          <div className="grid min-h-56 place-items-center rounded-2xl bg-[#3a1d0a] text-center text-white">
            <div>
              <p className="text-5xl">▶️</p>
              <p className="mt-2 text-lg font-black">Quick teacher/cast model video slot</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (block.kind === "music") {
    return (
      <div className="rounded-3xl border border-orange-100 bg-amber-50 p-4 text-center shadow-sm">
        <p className="text-xs font-black uppercase tracking-widest text-[#FE6A2F]">🎵 {block.label || "Music"}</p>
        <p className="mt-1 text-lg font-bold text-[#3a1d0a]">{block.mood}</p>
      </div>
    );
  }

  if (block.kind === "language_engine_slot") {
    return <LanguageEngineRuntimeBlock block={block} />;
  }

  return <RuntimeActivity block={block} lesson={lesson} />;
}

function LanguageEngineRuntimeBlock({
  block,
}: {
  block: Extract<PlaygroundBlock, { kind: "language_engine_slot" }>;
}) {
  const hub = (block.hub || "playground") as "playground" | "academy" | "success";
  const cefr = (block.cefr || "A1") as any;
  const engineType = block.engineType || "";
  const targets = Array.isArray(block.target_words) ? block.target_words : [];
  const lessonId = String(block.id || "");
  const startedAtRef = useMemo(() => ({ t: Date.now() }), [block.id]);

  const handleComplete = (summary: { attempts?: number; correct?: number; accuracy?: number } = {}) => {
    try {
      const attempts = Number(summary.attempts ?? 0);
      const correct = Number(summary.correct ?? 0);
      const accuracy = Number(summary.accuracy ?? (attempts ? (correct / attempts) * 100 : 0));
      const duration_ms = Date.now() - startedAtRef.t;
      import("@/lib/engineTelemetry").then(({ emitLanguageEngineComplete }) => {
        emitLanguageEngineComplete({
          engineType: engineType as any,
          mode: (block.mode || "lesson") as any,
          target_words: targets,
          attempts,
          correct,
          accuracy,
          duration_ms,
          lessonId,
          hub,
          cefr: String(cefr),
        });
      }).catch(() => {});
      const unitId = String((block as any).unit_id || (block as any).unitId || "");
      if (unitId) {
        import("@/lib/unitProgressReport").then(({ recordEngineRunForUnit }) => {
          const kind = engineType.replace("_slot", "") as
            | "story"
            | "escape_room"
            | "detective_mystery"
            | "hidden_object";
          recordEngineRunForUnit(unitId, {
            engine: kind,
            accuracy: Math.max(0, Math.min(1, accuracy / 100)),
            durationMs: duration_ms,
            attempts,
            correct,
            ts: new Date().toISOString(),
          }, { hub: hub as any, cefr: cefr as any });
        }).catch(() => {});
      }
    } catch { /* noop */ }
  };

  const header = <LanguageEngineHeader block={block} engineType={engineType} />;


  const commonProps = { hub, cefr, lessonId, onComplete: handleComplete } as const;

  return (
    <Suspense fallback={<div className="rounded-3xl border border-purple-200 bg-purple-50 p-6 text-center text-sm font-bold text-purple-700">Loading engine…</div>}>
      <div>
        {header}
        <LanguageEngineMount block={block} commonProps={commonProps} />
      </div>
    </Suspense>
  );
}

function LanguageEngineHeader({
  block,
  engineType,
}: {
  block: Extract<PlaygroundBlock, { kind: "language_engine_slot" }>;
  engineType: string;
}) {
  const voice = useEngineVoice({ lang: "en-US" });
  const [lastScore, setLastScore] = useState<{ matchRatio: number; fluency: number } | null>(null);
  useEffect(() => {
    const onScored = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail.matchRatio === "number") {
        setLastScore({ matchRatio: detail.matchRatio, fluency: detail.fluency ?? 0 });
      }
    };
    window.addEventListener("engine:voice-scored", onScored as EventListener);
    return () => window.removeEventListener("engine:voice-scored", onScored as EventListener);
  }, []);
  const title = block.title || block.label || "Language Engine";
  const objective = block.objective || "";
  const narrate = () => {
    if (voice.speaking) { voice.stop(); return; }
    voice.speak([title, objective].filter(Boolean).join(". "));
  };
  const mic = () => {
    if (voice.listening) { voice.stopListening(); return; }
    voice.listen(async (text) => {
      try {
        const { scoreVoiceInput } = await import("@/lib/voiceInputScorer");
        // Engines that know the target answer set `data-expected` on
        // window.__engineVoiceExpected before mic press; falls back to header title.
        const expected = (window as any).__engineVoiceExpected || block.objective || undefined;
        const score = scoreVoiceInput(text, expected);
        window.dispatchEvent(new CustomEvent("engine:voice-input", { detail: { text } }));
        window.dispatchEvent(new CustomEvent("engine:voice-scored", { detail: score }));
        // Persist to speech_attempts (fire-and-forget)
        try {
          const { persistVoiceScore } = await import("@/lib/persistVoiceScore");
          await persistVoiceScore({
            transcript: text,
            expected,
            matchRatio: (score as any).matchRatio,
            fluency: (score as any).fluencyScore,
            engineType,
          });
        } catch { /* noop */ }
      } catch { /* noop */ }
    });
  };
  return (
    <div className="mb-3 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2 text-center relative">
      <p className="text-[10px] font-black uppercase tracking-widest text-purple-700">
        🧭 {engineType.replace(/_/g, " ")}
      </p>
      <p className="text-base font-extrabold text-[#3a1d0a]">{title}</p>
      {objective ? (
        <p className="text-xs font-semibold text-[#3a1d0a]/70">{objective}</p>
      ) : null}
      <div className="absolute right-2 top-2 flex gap-1">
        {voice.supported ? (
          <button
            type="button"
            onClick={narrate}
            aria-label={voice.speaking ? "Stop narration" : "Narrate scene"}
            className="rounded-full bg-white/80 hover:bg-white px-2 py-1 text-[10px] font-black text-purple-700 border border-purple-200"
          >
            {voice.speaking ? "◼ Stop" : "🔊 Narrate"}
          </button>
        ) : null}
        {voice.recognitionSupported ? (
          <button
            type="button"
            onClick={mic}
            aria-label={voice.listening ? "Stop listening" : "Speak your answer"}
            className={`rounded-full px-2 py-1 text-[10px] font-black border ${voice.listening ? "bg-red-500 text-white border-red-600 animate-pulse" : "bg-white/80 hover:bg-white text-purple-700 border-purple-200"}`}
          >
            {voice.listening ? "● Listening" : "🎤 Speak"}
          </button>
        ) : null}
      </div>
      {voice.transcript ? (
        <p className="mt-1 text-[11px] italic text-purple-800">"{voice.transcript}"</p>
      ) : null}
      {lastScore ? (
        <div className="mt-1 flex items-center justify-center gap-2 text-[10px] font-bold">
          <span className={`rounded-full px-2 py-0.5 ${lastScore.matchRatio >= 0.7 ? "bg-emerald-100 text-emerald-800" : lastScore.matchRatio >= 0.4 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>
            Match {Math.round(lastScore.matchRatio * 100)}%
          </span>
          <span className="rounded-full bg-purple-100 text-purple-800 px-2 py-0.5">
            Fluency {Math.round(lastScore.fluency * 100)}%
          </span>
        </div>
      ) : null}
    </div>
  );
}

function LanguageEngineMount({
  block,
  commonProps,
}: {
  block: Extract<PlaygroundBlock, { kind: "language_engine_slot" }>;
  commonProps: { hub: "playground" | "academy" | "success"; cefr: any; lessonId: string; onComplete: (s: any) => void };
}) {
  const [engines, setEngines] = useState<null | {
    Story: any; Escape: any; Detective: any; Hidden: any;
  }>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      import("@/story-engine"),
      import("@/escape-room"),
      import("@/detective"),
      import("@/hidden-object"),
    ]).then(([s, e, d, h]) => {
      if (cancelled) return;
      setEngines({
        Story: (s as any).StoryEngineSlot,
        Escape: (e as any).EscapeRoomSlot,
        Detective: (d as any).DetectiveSlot,
        Hidden: (h as any).HiddenObjectSlot,
      });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!engines) {
    return <div className="rounded-3xl border border-purple-200 bg-purple-50 p-6 text-center text-sm font-bold text-purple-700">Loading engine…</div>;
  }

  const { Story, Escape, Detective, Hidden } = engines;
  if (block.engineType === "story_engine_slot" && block.graph) {
    return <Story {...commonProps} graph={block.graph as any} />;
  }
  if (block.engineType === "escape_room_slot" && block.room) {
    return <Escape {...commonProps} room={block.room as any} />;
  }
  if (block.engineType === "detective_mystery_slot" && block.case) {
    return <Detective {...commonProps} case={block.case as any} />;
  }
  if (block.engineType === "hidden_object_slot" && block.scene) {
    return <Hidden scene={block.scene as any} onComplete={commonProps.onComplete} />;
  }
  return (
    <div className="rounded-3xl border-2 border-dashed border-purple-200 bg-purple-50 p-6 text-center text-sm font-bold text-purple-700">
      Engine payload not ready. Regenerate the lesson to attach the {String(block.engineType || "engine").replace(/_/g, " ")} scenario.
    </div>
  );
}



function RuntimeActivity({ block, lesson }: { block: Extract<PlaygroundBlock, { kind: "activity" }>; lesson?: PlaygroundLessonContent | null }) {
  const config = block.config ?? {};
  const prompt = String(config.prompt || block.label || block.type || "Try it!");
  const options = activityWords(config, lesson);
  const firstQuestion = Array.isArray((config as any).questions) ? (config as any).questions[0] : null;
  const answer = String(config.answer || config.word || firstQuestion?.answer || options[0] || "");
  const [selected, setSelected] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const [built, setBuilt] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);

  const resetFeedback = () => setChecked(null);
  const mark = (ok: boolean) => setChecked(ok);
  const feedback = checked === null ? null : (
    <div className={`mt-3 rounded-2xl px-4 py-3 text-sm font-black ${checked ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
      {checked ? "Great job!" : answer ? `Try again. Answer: ${answer}` : "Try again."}
    </div>
  );


  if (["multiple", "quiz", "odd_one_out", "quick_quiz"].includes(block.type)) {
    const questionPrompt = firstQuestion?.q ? String(firstQuestion.q) : prompt;
    const questionOptions = Array.isArray(firstQuestion?.options)
      ? (firstQuestion!.options as unknown[]).filter((x): x is string => typeof x === "string")
      : [];
    const baseChoices = questionOptions.length ? questionOptions : options;
    const choices = (baseChoices.length ? baseChoices : [answer, "friend", "hello"].filter(Boolean)).slice(0, 4);
    return (
      <ActivityCard label={block.label || block.type} prompt={questionPrompt}>
        <TrailChoiceGame
          slide={{
            type: "multiple",
            question: questionPrompt,
            options: choices,
            option_images: choices.map((choice) => lessonImageFor(lesson, choice) || choice),
            answer: answer || choices[0] || "",
          }}
        />
      </ActivityCard>
    );
  }

  if (["match", "match_pictures", "match_word", "listen_and_match", "listen_match"].includes(block.type)) {
    return (
      <ActivityCard label={block.label || block.type} prompt={prompt}>
        <TrailDragMatchGame slide={{ type: "match", instruction: prompt, pairs: activityPairs(config, lesson).slice(0, 6) }} />
      </ActivityCard>
    );
  }

  if (["drag_drop", "drag_word_to_picture", "word_to_picture"].includes(block.type)) {
    const pairs = activityPairs(config, lesson).slice(0, 6);
    return (
      <ActivityCard label={block.label || block.type} prompt={prompt}>
        <TrailDragMatchGame
          slide={pairs.length > 1
            ? { type: "drag", instruction: prompt, pairs }
            : {
                type: "drag",
                instruction: prompt,
                word: (answer || pairs[0]?.word || "CAT").toUpperCase(),
                image_url: pairs[0]?.image_url || lessonImageFor(lesson, answer) || answer,
                distractors: options.filter((option) => option.toLowerCase() !== answer.toLowerCase()).slice(0, 3),
              }}
        />
      </ActivityCard>
    );
  }

  if (["memory_match", "memory", "flashcard_review"].includes(block.type)) {
    const words = (options.length ? options : ["hello", "friend", "play"]).slice(0, 6);
    return (
      <ActivityCard label={block.label || block.type} prompt={prompt}>
        <MemoryGame slide={{ type: "memory", instruction: prompt, pairs: words.map((word) => ({ id: word.toLowerCase(), label: word, emoji: emojiFor(word), image_url: lessonImageFor(lesson, word) })) }} />
      </ActivityCard>
    );
  }

  if (["sort_by_home", "sort", "grammar_sort"].includes(block.type)) {
    const buckets = Array.isArray(config.buckets) && config.buckets.length
      ? (config.buckets as any[]).map((bucket, index) => ({ id: configText(bucket?.id, bucket?.label, `bucket-${index}`), label: configText(bucket?.label, bucket?.id, `Group ${index + 1}`), emoji: bucket?.emoji }))
      : [
          { id: "home-1", label: "Home 1", emoji: "🏠" },
          { id: "home-2", label: "Home 2", emoji: "🌳" },
        ];
    return (
      <ActivityCard label={block.label || block.type} prompt={prompt}>
        <SortGame slide={{
          type: "sort",
          instruction: prompt,
          buckets,
          items: options.slice(0, 8).map((word, index) => ({ label: word, emoji: emojiFor(word), image_url: lessonImageFor(lesson, word), bucket: buckets[index % buckets.length].id })),
        }} />
      </ActivityCard>
    );
  }

  if (["sentence_builder", "sentence_scramble", "sequence"].includes(block.type)) {
    const source = asStringArray(config.lines).length ? asStringArray(config.lines) : String(config.sentence || prompt).split(/\s+/).filter(Boolean);
    return (
      <ActivityCard label={block.label || block.type} prompt={prompt}>
        <TapOrderGame slide={{ type: "tap_order", instruction: prompt, items: source.map((word) => ({ label: word })) }} />
      </ActivityCard>
    );
  }

  if (["fill", "fill_blank"].includes(block.type)) {
    return (
      <ActivityCard label={block.label || block.type} prompt={prompt}>
        <TrailWordGapGame slide={{ type: "fill", text: String(config.sentence || config.text || prompt), answer, options: options.slice(0, 5), image_url: lessonImageFor(lesson, answer) || answer }} />
      </ActivityCard>
    );
  }

  if (["word_builder", "spell_it"].includes(block.type)) {
    const word = String(config.word || answer || (lesson?.vocab ?? [])[0] || "cat");
    return (
      <ActivityCard label={block.label || block.type} prompt={prompt}>
        <WordBuilderGame slide={{ type: "word_builder", instruction: prompt, word, extras: asStringArray(config.extras), image_url: lessonImageFor(lesson, word) || word, show_sounds: true }} />
      </ActivityCard>
    );
  }

  if (["listen_and_point", "hotspot"].includes(block.type)) {
    const words = (options.length ? options : ["hello", "friend", "play"]).slice(0, 6);
    return (
      <ActivityCard label={block.label || block.type} prompt={prompt}>
        <HotspotGame slide={{ type: "hotspot", instruction: prompt, parts: words.map((word) => ({ label: word, emoji: emojiFor(word) })), prompts: words.slice(0, 4) }} />
      </ActivityCard>
    );
  }

  if (["missing_letter", "trace_letter_choice"].includes(block.type)) {
    const word = String(config.word || answer || (lesson?.vocab ?? [])[0] || "cat");
    return (
      <ActivityCard label={block.label || block.type} prompt={prompt}>
        <MissingLetterGame slide={{ type: "missing_letter", instruction: prompt, word, image_url: lessonImageFor(lesson, word) || word, missing_letter: String(config.missing_letter || word[1] || word[0] || "a"), missing_position: Number(config.missing_position ?? 1) }} />
      </ActivityCard>
    );
  }

  if (block.type === "phonics_hunt") {
    const letter = String(config.letter || config.grapheme || lesson?.phonic?.letter || "c");
    const words = (options.length ? options : lesson?.phonic?.words ?? lesson?.vocab ?? ["cat", "dog"]).slice(0, 6);
    return (
      <ActivityCard label={block.label || block.type} prompt={prompt}>
        <PhonicsHuntGame slide={{ type: "phonics_hunt", instruction: prompt, letter, items: words.map((word) => ({ word, image_url: lessonImageFor(lesson, word) || word, has_letter: word.toLowerCase().includes(letter.toLowerCase()) })) }} />
      </ActivityCard>
    );
  }

  /* Legacy fallback stays below for unusual custom activity types. */
  if (["multiple", "quiz", "match_pictures", "listen_and_point", "odd_one_out"].includes(block.type)) {
    const choices = options.length ? options : [answer, "friend", "hello"].filter(Boolean);
    return (
      <ActivityCard label={block.label || block.type} prompt={prompt}>
        <div className="grid gap-2 sm:grid-cols-2">
          {choices.map((choice) => {
            const active = selected[0] === choice;
            return (
              <button
                key={choice}
                onClick={() => { setSelected([choice]); mark(!answer || choice.toLowerCase() === answer.toLowerCase()); }}
                className={`rounded-2xl border-2 px-4 py-4 text-lg font-black transition ${active ? "border-[#FE6A2F] bg-orange-50 text-[#3a1d0a]" : "border-orange-100 bg-white text-[#3a1d0a] hover:bg-orange-50"}`}
              >
                {choice}
              </button>
            );
          })}
        </div>
        {feedback}
      </ActivityCard>
    );
  }

  if (["fill", "word_builder", "spell_it"].includes(block.type)) {
    const letters = String(config.word || answer || "word").split("");
    const bank = shuffleList([...letters, ...asStringArray(config.extras)]).slice(0, 10);
    return (
      <ActivityCard label={block.label || block.type} prompt={prompt}>
        <div className="mb-3 min-h-14 rounded-2xl bg-orange-50 px-4 py-3 text-center text-2xl font-black text-[#3a1d0a]">
          {built.length ? built.join("") : "Tap letters"}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {bank.map((letter, index) => (
            <button
              key={`${letter}-${index}`}
              onClick={() => { resetFeedback(); setBuilt((current) => [...current, letter]); }}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl font-black text-[#3a1d0a] ring-2 ring-orange-100 hover:bg-orange-50"
            >
              {letter}
            </button>
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-2">
          <button onClick={() => { setBuilt([]); resetFeedback(); }} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-orange-900 ring-1 ring-orange-200">Clear</button>
          <button onClick={() => mark(!answer || built.join("").toLowerCase() === answer.toLowerCase())} className="rounded-full bg-[#FE6A2F] px-5 py-2 text-sm font-black text-white">Check</button>
        </div>
        {feedback}
      </ActivityCard>
    );
  }

  if (["sentence_builder", "sentence_scramble", "sequence"].includes(block.type)) {
    const source = asStringArray(config.lines).length ? asStringArray(config.lines) : String(config.sentence || prompt).split(/\s+/).filter(Boolean);
    const bank = shuffleList(source);
    return (
      <ActivityCard label={block.label || block.type} prompt={prompt}>
        <div className="mb-3 min-h-16 rounded-2xl bg-orange-50 p-3 text-center text-lg font-black text-[#3a1d0a]">
          {built.length ? built.join(" ") : "Tap words in order"}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {bank.map((word, index) => (
            <button
              key={`${word}-${index}`}
              onClick={() => { resetFeedback(); setBuilt((current) => [...current, word]); }}
              className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#3a1d0a] ring-2 ring-orange-100 hover:bg-orange-50"
            >
              {word}
            </button>
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-2">
          <button onClick={() => { setBuilt([]); resetFeedback(); }} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-orange-900 ring-1 ring-orange-200">Clear</button>
          <button onClick={() => mark(built.join(" ") === source.join(" "))} className="rounded-full bg-[#FE6A2F] px-5 py-2 text-sm font-black text-white">Check</button>
        </div>
        {feedback}
      </ActivityCard>
    );
  }

  if (["memory_match", "match", "drag_drop", "sort_by_home"].includes(block.type)) {
    const cards = options.length ? options.slice(0, 6) : ["hello", "friend", "play"];
    return (
      <ActivityCard label={block.label || block.type} prompt={prompt}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {cards.map((card, index) => {
            const open = revealed.includes(index);
            return (
              <button
                key={`${card}-${index}`}
                onClick={() => setRevealed((current) => current.includes(index) ? current : [...current, index])}
                className={`aspect-[4/3] rounded-2xl border-2 text-lg font-black transition ${open ? "border-[#FE6A2F] bg-orange-50 text-[#3a1d0a]" : "border-orange-100 bg-[#FE6A2F] text-white"}`}
              >
                {open ? card : "?"}
              </button>
            );
          })}
        </div>
        <button onClick={() => mark(revealed.length >= Math.min(2, cards.length))} className="mt-3 rounded-full bg-[#FE6A2F] px-5 py-2 text-sm font-black text-white">Done</button>
        {feedback}
      </ActivityCard>
    );
  }

  if (["echo", "roleplay", "look_and_say", "story_image"].includes(block.type)) {
    const lines = asStringArray(config.lines).length ? asStringArray(config.lines) : [prompt];
    return (
      <ActivityCard label={block.label || block.type} prompt={prompt}>
        <div className="space-y-2">
          {lines.map((line, index) => (
            <button
              key={`${line}-${index}`}
              onClick={() => {
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                  window.speechSynthesis.speak(new SpeechSynthesisUtterance(line));
                }
                setSelected((current) => current.includes(line) ? current : [...current, line]);
              }}
              className={`w-full rounded-2xl px-4 py-3 text-left text-lg font-black transition ${selected.includes(line) ? "bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100" : "bg-white text-[#3a1d0a] ring-2 ring-orange-100 hover:bg-orange-50"}`}
            >
              {line}
            </button>
          ))}
        </div>
        <button onClick={() => mark(selected.length >= lines.length)} className="mt-3 rounded-full bg-[#FE6A2F] px-5 py-2 text-sm font-black text-white">I said it</button>
        {feedback}
      </ActivityCard>
    );
  }

  return (
    <ActivityCard label={block.label || block.type} prompt={prompt}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={typed}
          onChange={(event) => { resetFeedback(); setTyped(event.target.value); }}
          className="min-h-12 flex-1 rounded-2xl border-2 border-orange-100 bg-white px-4 text-lg font-bold text-[#3a1d0a] outline-none focus:border-[#FE6A2F]"
          placeholder="Type your answer"
        />
        <button onClick={() => mark(!answer || typed.trim().toLowerCase() === answer.toLowerCase())} className="rounded-2xl bg-[#FE6A2F] px-5 py-3 text-sm font-black text-white">Check</button>
      </div>
      {feedback}
    </ActivityCard>
  );
}

function ActivityCard({ label, prompt, children }: { label: string; prompt: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border-2 border-orange-100 bg-white/85 p-5 shadow-sm">
      <p className="mb-2 text-xs font-black uppercase tracking-widest text-[#FE6A2F]">🎮 {label}</p>
      <p className="mb-4 text-xl font-extrabold text-[#3a1d0a]">{prompt}</p>
      {children}
    </div>
  );
}

export default PlaygroundLessonPlayer;

// Legacy slide-frame export — kept so older imports keep compiling.
export function PlaygroundTrailSlideFrame() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-playground-mesh">
      <div className="grid h-full place-items-center text-[#3a1d0a]">
        Single-slide preview is no longer supported in the blueprint player.
      </div>
    </div>
  );
}

// ─── Authored Home Mission phase ───────────────────────────────────────
// Renders teacher-authored gamified homework tasks and fires observer
// events (`homework_task_attempt` / `homework_completed`) so mastery,
// streaks and memory update per the coherence engine contract.
function AuthoredHomeworkPhase({
  lesson,
  tasks,
  title,
  onFinish,
}: {
  lesson: PlaygroundLessonContent | null;
  tasks: Array<{ id: string; type: string; label?: string; prompt?: string; payload?: any }>;
  title?: string;
  onFinish?: () => void;
}) {
  const { user } = useAuth();
  const studentId = user?.id || "preview";
  const lessonId = `lesson-${(lesson as any)?.lesson_number ?? "unknown"}`;

  // Fire an "attempt" for each task on mount so the observer records that
  // the learner saw + engaged with each authored home game.
  useEffect(() => {
    if (!tasks.length) return;
    emitHomeworkEvents(
      tasks.map((t) => ({
        type: "homework_task_attempt",
        studentId,
        hub: "playground",
        lessonId,
        payload: {
          task_id: t.id,
          activity_type: t.type,
          label: t.label ?? t.type,
          source: "authored_playground",
        },
      })),
    );
    // Only re-fire when the lesson changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const finish = () => {
    emitHomeworkEvents([
      {
        type: "homework_completed",
        studentId,
        hub: "playground",
        lessonId,
        payload: { task_count: tasks.length, source: "authored_playground" },
      },
    ]);
    onFinish?.();
  };

  return (
    <div className="rounded-2xl bg-white/80 p-2">
      <h3 className="mb-3 px-3 pt-2 text-lg font-bold text-[#3a1d0a]">
        📓 {title || "Home Mission"}
      </h3>
      <div className="space-y-5 px-2">
        {tasks.map((task) => (
          <RuntimeBlock
            key={task.id}
            block={{
              kind: "activity" as const,
              id: task.id,
              label: task.label ?? task.type,
              type: task.type,
              config: { ...(task.payload ?? {}), prompt: task.prompt ?? (task.payload as any)?.prompt },
            } as any}
            lesson={lesson}
          />
        ))}
      </div>
      <div className="mt-4 flex justify-end px-2 pb-2">
        <button
          onClick={finish}
          className="rounded-full bg-gradient-to-r from-[#FE6A2F] to-amber-500 px-5 py-2 text-sm font-bold text-white shadow hover:opacity-90"
        >
          ✓ Finish Home Mission
        </button>
      </div>
    </div>
  );
}
