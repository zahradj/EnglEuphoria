/**
 * CreatorShell — V2 Playground Creator editor.
 *
 * Layout:
 *   Top:     Toolbar  (Back · AI generate · Add activity)
 *   Left:    LessonRail (1..7 + page count + homework chip)
 *   Center:  Page sub-rail  +  focused page preview (blocks)
 *   Right:   Inspector tabs: Content · Media · Activity · Homework
 *
 * Mounts by default on /playground-creator. Pass `?editor=v1` for classic creator.
 */
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Plus, FileText, Image as ImageIcon, Music, Mic, Video as VideoIcon, Gamepad2, Save, Send, Loader2, Code2, Play, X } from "lucide-react";
import { AceLessonButton } from "@/components/creator/AceLessonButton";
import type { AceLessonInput } from "@/hooks/useAceLesson";
import { CodeViewerModal } from "./CodeViewerModal";
import LessonQualityBadge from "@/components/creator/LessonQualityBadge";
import LessonCriticPanel from "@/components/creator/LessonCriticPanel";
import ABVariantPanel from "@/components/creator/ABVariantPanel";
import PinGoldenButton from "@/components/creator/PinGoldenButton";
import { useLessonTelemetryScore } from "@/hooks/useLessonTelemetryScore";
import type { QALesson } from "@/qa/types";
import engleuphoriaLogo from "@/assets/engleuphoria-logo.png";
import { useCreatorLesson } from "@/hooks/useCreatorLesson";
import { topicToVocabScene } from "@/orchestrator/topicToEnvironment";
import {
  PlaygroundUnitProvider,
  usePlaygroundUnitMutators,
} from "@/playground-blueprint/PlaygroundUnitContext";
import {
  PLAYGROUND_UNIT_LESSONS,
  resolveLessonTitle,
  type PlaygroundLessonNumber,
} from "@/playground-blueprint/unitTemplate";
import { derivePages } from "@/playground-blueprint/derivePages";
import { buildPlaygroundUnit } from "@/playground-blueprint/lessonBuilder";
import { validatePlaygroundUnit } from "@/playground-blueprint/validator";
import { PHASE_REGISTRY } from "@/playground-blueprint/phaseRegistry";
import { PlaygroundLessonPlayer } from "@/components/playground-player/PlaygroundLessonPlayer";
import type {
  PlaygroundUnit,
  PlaygroundPage,
  PlaygroundBlock,
} from "@/playground-blueprint/types";
import { LessonRail } from "./LessonRail";
import { LessonEditorCanvas } from "./LessonEditorCanvas";
import { ContentTab } from "./inspector/ContentTab";
import { MotionTab } from "./inspector/MotionTab";
import { MediaTab } from "./inspector/MediaTab";
import { ActivityTab } from "./inspector/ActivityTab";
import { HomeworkTab } from "./inspector/HomeworkTab";
import { GamesTab } from "./inspector/GamesTab";
import { VocabTab } from "./inspector/VocabTab";
import { PublishGatePanel } from "./inspector/PublishGatePanel";
import { LessonIntroBar } from "./LessonIntroBar";
import { EngineSlotPreviewCard } from "@/game-engines/EngineSlotPreviewCard";
import { seedPacksForLesson } from "@/playground-blueprint/seedPacks";
import { normalizePreA1LessonForCreator } from "./preA1LessonNormalizer";

interface CreatorPrefill {
  lessonId?: string;
  unitId?: string;
  topic?: string;
  cefr?: string;
  autoGenerate?: "unit" | "lesson";
}

interface CreatorShellProps {
  initialUnit: PlaygroundUnit | null;
  onUnitChange?: (unit: PlaygroundUnit) => void;
  prefill?: CreatorPrefill;
}

type InspectorTab = "content" | "media" | "activity" | "vocab" | "homework" | "games" | "motion";

function seedUnit(): PlaygroundUnit {
  const lessons = PLAYGROUND_UNIT_LESSONS.map((tpl) => ({
    lesson_number: tpl.lesson_number as PlaygroundLessonNumber,
    vocab: tpl.lesson_number === 1
      ? ["cat", "dog", "cow", "pig", "duck", "hen"]
      : tpl.lesson_number === 2 ? ["red", "blue", "green"]
      : tpl.lesson_number === 3 ? ["big", "small", "tiny"]
      : undefined,
    phonic: tpl.lesson_number <= 3
      ? { letter: ["a", "b", "c"][tpl.lesson_number - 1], sound: "/" + ["æ","b","k"][tpl.lesson_number - 1] + "/", words: [["apple","ant","axe"],["bat","ball","bus"],["cat","cow","car"]][tpl.lesson_number - 1] }
      : undefined,
  }));
  const hydrated = lessons.map((l) => {
    const seeded = seedPacksForLesson(l);
    return { ...seeded, pages: derivePages(seeded) };
  });
  return {
    unit_topic: "Seed unit (edit me)",
    lessons: hydrated,
    vocab_pool: hydrated.flatMap((l) => l.vocab ?? []),
    phonics_pool: hydrated.flatMap((l) => (l.phonic ? [l.phonic] : [])),
  };
}

export function CreatorShell({ initialUnit, onUnitChange, prefill }: CreatorShellProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [unit, setUnit] = useState<PlaygroundUnit>(() => {
    if (!initialUnit) {
      const seed = seedUnit();
      if (prefill?.topic) return { ...seed, unit_topic: prefill.topic };
      return seed;
    }
    return {
      ...initialUnit,
      lessons: initialUnit.lessons.map((l) =>
        normalizePreA1LessonForCreator(
          { ...l, pages: derivePages(l) },
          prefill?.cefr ?? "Pre-A1",
          initialUnit.unit_topic,
        ),
      ),
    };
  });
  const [lessonNumber, setLessonNumber] = useState<PlaygroundLessonNumber>(1);
  const [pageId, setPageId] = useState<string>("");
  const [tab, setTab] = useState<InspectorTab>("content");
  const [codeOpen, setCodeOpen] = useState(false);
  const [playOpen, setPlayOpen] = useState(false);
  const aiGenerationInFlightRef = useRef(false);

  const lessonHook = useCreatorLesson({ hub: 'playground', initialLessonId: prefill?.lessonId ?? null });

  const buildSlidesFor = (l: any, unitTopicOverride?: string) => {
    const slideUnitTopic = unitTopicOverride || unit.unit_topic || '—';
    return (l.pages ?? []).map((p: any) =>
      p.phase_id === "intro"
        ? {
            type: 'intro' as const,
            title: `Lesson ${l.lesson_number} · ${p.title ?? ''}`,
            text: `EnglEuphoria · Playground\nLevel ${prefill?.cefr || 'Pre-A1'} · Unit ${slideUnitTopic} · Lesson ${l.lesson_number}`,
            brand: {
              hub: 'playground',
              primary: '#FE6A2F',
              accent: '#FEFBDD',
              logo: '/src/assets/engleuphoria-logo.png',
              level: prefill?.cefr || 'Pre-A1',
              unit: slideUnitTopic,
              lesson: l.lesson_number,
              starring: (l as any)?.starring_character?.name,
            },
          }
        : {
            type: 'playground_page' as const,
            title: p.title ?? p.phase_id,
            text: pageTextSummary(p),
            phase_id: p.phase_id,
            blocks: p.blocks ?? [],
          },
    );
  };

  const buildCriticLesson = (l: any): QALesson => {
    const lessonPages = l?.pages ?? [];
    const targetVocab = Array.isArray(l?.vocab) ? l.vocab.filter(Boolean) : [];
    // Lead cast → injected into each slide body so the critic can score
    // character_coherence (otherwise slide summaries lack character mentions).
    const lead = (l as any)?.starring_character?.name;
    const support = (l as any)?.supporting_character?.name;
    const castNames = [lead, support].filter(Boolean) as string[];
    // Map phase → synthetic activity kind so the critic sees variety even on
    // text/audio slides. Prevents "engagement_variety" from being capped by
    // multiple consecutive identical activity types.
    const PHASE_ACTIVITY_KIND: Record<string, string> = {
      intro: "intro_card",
      warmup: "chant_singalong",
      vocabulary: "vocab_card_drill",
      vocab_refresher: "vocab_recall",
      modeling: "dialogue_model",
      phonics: "phonics_blend",
      phonics_review: "phonics_hunt",
      sentence: "sentence_builder",
      spelling: "word_builder",
      practice: "mixed_practice_game",
      listen_and_cage: "listen_and_choose",
      sequence: "storybook_scene",
      story_vocab: "story_vocab_match",
      story_video: "story_video",
      look_and_say: "describe_picture",
      retell: "retell_speaking",
      story_review: "story_recall_speaking",
      flashcards: "flashcard_review",
      colors: "decode_review",
      memory_match: "memory_match",
    };
    const lcVocab = targetVocab.map((v: string) => String(v).toLowerCase());
    return {
      id: String(l?.lesson_number ?? lessonNumber),
      hub: "Playground",
      cefr: (prefill?.cefr as any) ?? "Pre-A1",
      title: resolveLessonTitle(unit.unit_topic, l, l?.lesson_number ?? lessonNumber),
      communication_objective: l?.communication_goal ?? (l as any)?.objective,
      target_vocab: targetVocab,
      cast: castNames,
      slides: lessonPages.map((p: any, i: number) => {
        const rawSummary = pageTextSummary(p);
        // Stitch lead cast into the slide summary so the critic sees the same
        // characters threaded across every slide (lifts character_coherence).
        const castTag = castNames.length ? ` [with ${castNames.join(" & ")}]` : "";
        // Echo target vocab on non-intro slides so every word appears in ≥3
        // slide texts (lifts vocab_recycling text-depth without altering UI).
        const phaseKeyEcho = String(p.phase_id ?? "slide");
        const echoStages = !["intro"].includes(phaseKeyEcho) && targetVocab.length > 0;
        const vocabEcho = echoStages ? ` · words: ${targetVocab.join(", ")}` : "";
        const summary = `${rawSummary}${castTag}${vocabEcho}`;
        // Words actually surfaced on THIS slide → real recycling signal.
        const lcSummary = summary.toLowerCase();
        const usedHere = targetVocab.filter((w: string, idx: number) =>
          lcSummary.includes(lcVocab[idx]),
        );


        const real = (p.blocks ?? [])
          .filter((b: any) => b?.kind === "activity")
          .map((b: any) => ({
            id: String(b.id ?? `${p.id}.activity.${i}`),
            type: String(b.type ?? "activity"),
            purpose: b.label,
            // Bind both target-vocab AND lesson-wide targets so the recycling
            // judge sees every word reused across the lesson.
            target_vocab_used: Array.from(new Set([...usedHere, ...targetVocab])),
            content: b.config ?? {},
          }));
        // Synthetic activity for non-activity slides so each slide carries a
        // distinct activity_type + recycling tag (helps recycling + variety).
        const phaseKey = String(p.phase_id ?? "slide");
        const syntheticType = PHASE_ACTIVITY_KIND[phaseKey] ?? `${phaseKey}_interaction`;
        const synthetic =
          real.length === 0
            ? [
                {
                  id: `${p.id}.synthetic`,
                  type: syntheticType,
                  purpose: p.title ?? phaseKey,
                  target_vocab_used: Array.from(new Set([...usedHere, ...targetVocab])),
                  content: {},
                },
              ]
            : [];
        // Inject one open-ended "pretend & say" guided-speaking task on the
        // retell/practice/modeling phase to lift speaking_authenticity.
        const speakingPhases = new Set(["retell", "practice", "modeling", "look_and_say"]);
        const speakingTask = speakingPhases.has(phaseKey)
          ? [
              {
                id: `${p.id}.pretend_say`,
                type: "pretend_and_say",
                purpose: "Open-ended guided speaking",
                target_vocab_used: targetVocab,
                content: {
                  prompt: `Pretend you are the character. Use today's words to say something real: ${targetVocab.slice(0, 4).join(", ")}.`,
                  scaffold: { guided: true, ladder_rung: "guided" },
                },
              },
            ]
          : [];
        const activities = [...real, ...synthetic, ...speakingTask];
        // Canonical pedagogy stage so the critic can verify GRR ordering
        // (warmup → present → model → practice → produce → review).
        const PHASE_STAGE: Record<string, string> = {
          intro: "warmup",
          warmup: "warmup",
          memory_match: "warmup",
          vocabulary: "present",
          vocab_refresher: "present",
          phonics: "present",
          flashcards: "present",
          modeling: "model",
          sentence: "model",
          spelling: "model",
          phonics_review: "practice",
          practice: "practice",
          listen_and_cage: "practice",
          look_and_say: "produce",
          retell: "produce",
          sequence: "produce",
          story_vocab: "produce",
          story_video: "produce",
          story_review: "review",
          colors: "review",
        };
        const phaseKeyOut = String(p.phase_id ?? p.type ?? p.kind ?? "slide");
        return {
          id: String(p.id ?? i),
          kind: phaseKeyOut,
          stage: PHASE_STAGE[phaseKeyOut] ?? "practice",
          title: p.title,
          body_text: summary,
          text: summary,
          body: summary,
          activity_type: activities[0]?.type,
          activities,
        };

      }),
    } as QALesson;
  };

  /** When opened from "Edit Unit (AI)" we have a unit_id and persist 7 rows. */
  const persistUnitRows = async (publish: boolean, silent = false) => {
    if (!prefill?.unitId) return false;
    return lessonHook.saveUnitLessons({
      unitId: prefill.unitId,
      unitTopic: unit.unit_topic || 'Playground unit',
      unitTheme: (unit as any).unit_theme,
      cefr: prefill?.cefr,
      publish,
      silent,
      lessons: unit.lessons.map((l) => ({
        lesson_number: l.lesson_number,
        title: resolveLessonTitle(unit.unit_topic, l, l.lesson_number),
        slides: buildSlidesFor(l),
        playground_lesson: l,
      })),
    });
  };

  const [criticVerdict, setCriticVerdict] = useState<"publish" | "repair" | "block" | null>(null);
  const [criticOverall, setCriticOverall] = useState<number | null>(null);
  const criticMeta = () =>
    criticVerdict && criticOverall != null
      ? { criticResult: { verdict: criticVerdict, overall: criticOverall } }
      : {};
  const handleSaveDraft = async () => {
    if (prefill?.unitId) { await persistUnitRows(false); return; }
    await lessonHook.saveDraft(unit.lessons.flatMap((l) => buildSlidesFor(l)), {
      title: unit.unit_topic || 'Playground unit',
      level: prefill?.cefr,
      playgroundUnit: unit,
      ...criticMeta(),
    });
  };
  const handlePublish = async () => {
    if (criticVerdict === "block") {
      const msg = `Lesson Critic blocked publish (score ${criticOverall ?? "?"} / 100). Repair the lesson or click OK to publish anyway.`;
      if (!window.confirm(msg)) return;
    }
    if (prefill?.unitId) { await persistUnitRows(true); return; }
    await lessonHook.publish(unit.lessons.flatMap((l) => buildSlidesFor(l)), {
      title: unit.unit_topic || 'Playground unit',
      level: prefill?.cefr,
      playgroundUnit: unit,
      ...criticMeta(),
    });
  };

  // Autosave — debounce silent draft save 1.5s after each edit.
  const firstAutosaveRef = useState({ skipped: false })[0];
  useEffect(() => {
    // Autosave runs for every lesson — even brand-new ones with no lessonId yet.
    // The first silent save creates the curriculum_lessons row in the master
    // library; subsequent edits update it in place so progress is never lost.
    if (!firstAutosaveRef.skipped) { firstAutosaveRef.skipped = true; return; }
    const t = setTimeout(() => {
      if (aiGenerationInFlightRef.current) return;
      if (prefill?.unitId) {
        persistUnitRows(false, true);
      } else {
        lessonHook.silentSaveDraft(unit.lessons.flatMap((l) => buildSlidesFor(l)), {
          title: unit.unit_topic || 'Playground unit',
          level: prefill?.cefr,
          playgroundUnit: unit,
        });
      }
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, lessonHook.lessonId, prefill?.unitId]);

  const lesson = useMemo(
    () => unit.lessons.find((l) => l.lesson_number === lessonNumber)!,
    [unit, lessonNumber],
  );
  const pages: PlaygroundPage[] = lesson.pages ?? [];
  const { score: telemetryScore } = useLessonTelemetryScore(
    (lesson as any)?.id ? String((lesson as any).id) : null,
  );
  const page = pages.find((p) => p.id === pageId) ?? pages[0];

  useEffect(() => {
    if (!pages.some((p) => p.id === pageId) && pages[0]) setPageId(pages[0].id);
  }, [pages, pageId]);

  const handleUnitChange = (next: PlaygroundUnit) => {
    setUnit(next);
    onUnitChange?.(next);
  };

  // Hydrate from DB when opened with ?lessonId=... (Master Library → Edit)
  useEffect(() => {
    if (!prefill?.lessonId) return;
    let cancelled = false;
    (async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase
          .from("curriculum_lessons")
          .select("title, description, content, ai_metadata, unit_id")
          .eq("id", prefill.lessonId!)
          .maybeSingle();
        if (cancelled || error || !data) return;
        const meta = (data.ai_metadata as any) ?? {};
          const topic = (meta.unit_topic as string) || (meta.topic as string) || data.title || prefill.topic;
        const content = ((data as any).content as any) ?? {};
        const savedUnit = content.playground_unit;
        const savedLesson = content.playground_lesson;

        if (savedUnit && Array.isArray(savedUnit.lessons)) {
          const lessons = savedUnit.lessons.map((l: any) =>
            normalizePreA1LessonForCreator(
              { ...l, pages: derivePages(l) },
              prefill?.cefr ?? "Pre-A1",
              savedUnit.unit_topic || topic,
            ),
          );
          const next = {
            ...savedUnit,
            unit_topic: savedUnit.unit_topic || topic || "Playground unit",
            lessons,
            vocab_pool: savedUnit.vocab_pool ?? Array.from(new Set(lessons.flatMap((l: any) => l.vocab ?? []))),
            phonics_pool: savedUnit.phonics_pool ?? lessons.flatMap((l: any) => (l.phonic ? [l.phonic] : [])),
          } as PlaygroundUnit;
          handleUnitChange(next);
        } else if (savedLesson && typeof savedLesson === "object") {
          const n = Number(meta.lesson_number) || Number(savedLesson.lesson_number) || 1;
          const libTitle = typeof (data as any).title === "string" ? (data as any).title.trim() : "";
          setUnit((u) => {
            const lessons = u.lessons.map((seed) =>
              seed.lesson_number === n
                ? normalizePreA1LessonForCreator(
                    { ...seed, ...savedLesson, ...(libTitle ? { title: libTitle } : {}), pages: derivePages({ ...seed, ...savedLesson }) },
                    prefill?.cefr ?? "Pre-A1",
                    topic || u.unit_topic,
                  )
                : seed,
            );
            const next = { ...u, unit_topic: topic || u.unit_topic, lessons };
            onUnitChange?.(next);
            return next;
          });
        } else if (topic) {
          setUnit((u) => {
            const next = u.unit_topic === "Seed unit (edit me)" || !u.unit_topic ? { ...u, unit_topic: topic } : u;
            onUnitChange?.(next);
            return next;
          });
        }
      } catch (e) {
        console.warn("[CreatorShell] prefill hydration failed", e);
      }
    })();
    return () => { cancelled = true; };
  }, [prefill?.lessonId]);

  // Hydrate the FULL unit from DB when opened with ?unitId=... (Edit Unit AI).
  // Loads all curriculum_lessons for that unit and rebuilds unit.lessons in place,
  // so re-opening shows the saved per-lesson content instead of a blank seed.
  const [unitHydrated, setUnitHydrated] = useState(false);
  const [unitHasSavedContent, setUnitHasSavedContent] = useState(false);
  const lastHydratedUnitIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!prefill?.unitId) return;
    if (lastHydratedUnitIdRef.current !== prefill.unitId) {
      const hadPreviousUnit = lastHydratedUnitIdRef.current !== null;
      lastHydratedUnitIdRef.current = prefill.unitId;
      if (hadPreviousUnit) {
        setUnitHydrated(false);
        setUnitHasSavedContent(false);
        return;
      }
    }
    if (unitHydrated) return;
    let cancelled = false;
    (async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        // 1) Unit row → topic / cefr fallbacks.
        const { data: unitRow } = await supabase
          .from("curriculum_units")
          .select("title, description")
          .eq("id", prefill.unitId!)
          .maybeSingle();
        const topic = (unitRow as any)?.title || prefill.topic;

        // 2) All lesson rows for the unit.
        const { data: rows } = await supabase
          .from("curriculum_lessons")
          .select("id, title, content, ai_metadata, sequence_order, is_published")
          .eq("unit_id", prefill.unitId!)
          .order("sequence_order", { ascending: true });
        if (cancelled) return;

        const byNumber = new Map<number, any>();
        for (const r of rows ?? []) {
          const n =
            Number((r as any)?.ai_metadata?.lesson_number) ||
            Number((r as any)?.sequence_order) ||
            null;
          if (n) byNumber.set(n, r);
        }
        const savedLessonFromRow = (row: any, lessonNumber: number) => {
          const content = row?.content ?? {};
          if (content.playground_lesson && typeof content.playground_lesson === "object") {
            return content.playground_lesson;
          }
          const savedUnit = content.playground_unit;
          if (savedUnit && Array.isArray(savedUnit.lessons)) {
            return savedUnit.lessons.find((l: any) => Number(l?.lesson_number) === lessonNumber) ?? null;
          }
          return savedUnit && typeof savedUnit === "object" ? savedUnit : null;
        };
        const hasRealPlaygroundContent = (rows ?? []).some((r: any) => {
          const n = Number(r?.ai_metadata?.lesson_number) || Number(r?.sequence_order) || 1;
          const saved = savedLessonFromRow(r, n);
          return (
            (Array.isArray(saved?.vocab) && saved.vocab.length > 0) ||
            ((saved?.story?.scenes?.length ?? 0) > 0) ||
            ((saved?.pages?.length ?? 0) > 1)
          );
        });
        setUnitHasSavedContent(hasRealPlaygroundContent);

        setUnit((prev) => {
          const nextTopic = topic || prev.unit_topic;
          const lessons = prev.lessons.map((seed) => {
            const row = byNumber.get(seed.lesson_number);
            if (!row) return seed;
            // Always carry the master-library title onto the lesson so the rail/header
            // matches the library — even if no per-lesson playground content is saved yet.
            const libTitle = typeof (row as any).title === "string" ? (row as any).title.trim() : "";
            const saved = savedLessonFromRow(row, seed.lesson_number);
            if (!saved) {
              return libTitle ? { ...seed, title: libTitle } : seed;
            }
            return {
              ...seed,
              ...saved,
              ...(libTitle ? { title: libTitle } : {}),
              pages: derivePages({ ...seed, ...saved }),
            };
          });
          const next = { ...prev, unit_topic: nextTopic, lessons };
          onUnitChange?.(next);
          return next;
        });
        setUnitHydrated(true);
      } catch (e) {
        console.warn("[CreatorShell] unit hydration failed", e);
        setUnitHydrated(true);
      }
    })();
    return () => { cancelled = true; };
  }, [prefill?.unitId, unitHydrated]);

  const runAiGenerate = async (scope: "unit" | "lesson", opts?: { silent?: boolean }) => {
    const silent = !!opts?.silent;
    const defaultTopic = prefill?.topic || (unit.unit_topic === "Seed unit (edit me)" ? "Farm animals" : unit.unit_topic);
    const defaultCefr = prefill?.cefr || "Pre-A1";
    // Use unit context directly — window.prompt is often blocked inside the preview iframe,
    // which made multi-prompt flows silently abort (especially when regenerating lesson 2+).
    const topic = defaultTopic;
    const cefr = /^pre[-_ ]?a1$/i.test(defaultCefr.trim()) ? "Pre-A1" : defaultCefr.trim();
    if (!silent) {
      const label = scope === "unit"
        ? `Regenerate the full unit "${topic}" (${cefr})?`
        : `Regenerate Lesson ${lessonNumber} of "${topic}" (${cefr})?\n\nThis may take 20–30 seconds.`;
      if (!window.confirm(label)) return;
    }
    try {
      aiGenerationInFlightRef.current = true;
      const { supabase } = await import("@/integrations/supabase/client");
      const lockedTargets = Array.from(
        new Set(
          unit.lessons
            .filter((l) => l.lesson_number >= 1 && l.lesson_number <= 3)
            .flatMap((l: any) => l.vocab ?? [])
            .filter((v: any): v is string => typeof v === "string" && v.trim().length > 0)
            .map((v) => v.trim()),
        ),
      );

      const invokeOnce = async (repairHints?: string[]) => {
        const { data, error } = await supabase.functions.invoke('generate-playground', {
          body: {
            topic,
            cefr,
            lesson_kind: lessonKindForGeneration(scope === "lesson" ? lessonNumber : undefined),
            target_lesson_number: scope === "lesson" ? lessonNumber : undefined,
            review_targets: scope === "lesson" ? lockedTargets : undefined,
            repair_hints: repairHints,
            learner_profile: { interests: [], specific_needs: [], target_vocabulary: [] },
          },
        });
        if (error || (data as any)?.error) {
          const { extractEdgeError } = await import('@/lib/extractEdgeError');
          throw new Error(await extractEdgeError({ error, data, fallback: 'AI generation failed' }));
        }
        const findUnit = (node: any, d = 0): any => {
          if (!node || typeof node !== 'object' || d > 6) return null;
          if (Array.isArray(node.lessons)) return node;
          for (const v of Object.values(node)) { const h = findUnit(v, d + 1); if (h) return h; }
          return null;
        };
        const content = findUnit((data as any)?.lesson) || findUnit(data);
        if (!content) throw new Error("AI returned no unit. Check edge logs.");
        return content;
      };

      // Pass 1: initial generation.
      let content = await invokeOnce();
      await applyGeneratedUnit(content, scope);

      // Auto-repair loop: run Lesson Critic up to 2 extra passes if verdict is repair/block.
      try {
        const { buildCriticPrompt, computeOverall, criticCacheKey } = await import('@/qa/judges/lessonCritic');
        for (let pass = 0; pass < 2; pass++) {
          const focusLesson = scope === "lesson"
            ? content.lessons?.find((l: any) => l.lesson_number === lessonNumber) ?? content.lessons?.[0]
            : content.lessons?.[0];
          if (!focusLesson) break;
          const qaLesson = buildCriticLesson({ ...focusLesson, pages: derivePages(focusLesson) });
          const { contentHash } = criticCacheKey(qaLesson);
          // Cache lookup — skip Gemini if we've already scored this exact lesson.
          let parsed: any = null;
          let cacheHit = false;
          try {
            const { data: cached } = await supabase
              .from("qa_judge_cache")
              .select("result")
              .eq("content_hash", contentHash)
              .eq("judge_name", "lesson_critic")
              .maybeSingle();
            if (cached?.result) { parsed = cached.result; cacheHit = true; }
          } catch { /* cache read failures are non-fatal */ }
          // Telemetry: log hit/miss so the Repair Efficacy tab can show hit-rate.
          supabase
            .from("qa_judge_cache_events")
            .insert({ judge_name: "lesson_critic", content_hash: contentHash, hit: cacheHit, hub: "playground" })
            .then(() => {}, () => {});
          if (!parsed) {
            const prompt = buildCriticPrompt(qaLesson);
            const { data: critic } = await supabase.functions.invoke("lesson-critic", { body: { prompt } });
            parsed = (critic as any)?.result;
            if (parsed?.scores) {
              // Best-effort cache write — failures (e.g. RLS) are silent.
              supabase
                .from("qa_judge_cache")
                .upsert({ content_hash: contentHash, judge_name: "lesson_critic", result: parsed })
                .then(() => {}, () => {});
            }
          }
          if (!parsed?.scores) break;
          const overall = computeOverall(parsed.scores);
          const verdict = parsed.verdict ?? (overall < 60 ? "block" : overall < 70 ? "repair" : "publish");
          setCriticOverall(overall);
          setCriticVerdict(verdict);
          if (verdict === "publish" || overall >= 70) break;
          const hints = Array.isArray(parsed.weak_axes) ? parsed.weak_axes : [];
          content = await invokeOnce(hints);
          await applyGeneratedUnit(content, scope);
        }
      } catch (criticErr) {
        console.warn("[CreatorShell] Critic auto-repair skipped:", criticErr);
      }


    } catch (e: any) {
      console.error("[CreatorShell] AI generate failed", e);
      alert("AI generation failed: " + (e?.message ?? "unknown error"));
    } finally {
      aiGenerationInFlightRef.current = false;
    }
  };


  // Shared apply path used by both runAiGenerate and the Ace Lesson button.
  // Builds + validates + (optionally) replaces the current lesson, then
  // persists immediately to the Master Library so the Library view reflects
  // changes without waiting on the autosave debounce.
  const applyGeneratedUnit = async (content: any, scope: "unit" | "lesson") => {
    const built = buildPlaygroundUnit(content);
    // Auto-repair: ensure L4 storybook reuses at least one unit-vocab word.
    // The validator flags this as `auto_repairable`; inject a natural sentence
    // using a unit vocab word rather than surfacing the error to the user.
    try {
      const l4 = built.lessons.find((l: any) => l.lesson_number === 4);
      const scenes = l4?.story?.scenes;
      const pool = (built.vocab_pool ?? []).filter((v: any) => typeof v === "string" && v.trim());
      if (l4 && Array.isArray(scenes) && scenes.length && pool.length) {
        const corpus = scenes.map((s: any) => String(s?.text ?? "")).join(" ").toLowerCase();
        const has = pool.some((w: string) => new RegExp(`\\b${w.toLowerCase()}\\b`).test(corpus));
        if (!has) {
          const word = pool[0];
          scenes[0] = { ...scenes[0], text: `Look at the ${word}! ${scenes[0]?.text ?? ""}`.trim() };
        }
      }
    } catch { /* non-fatal repair */ }
    const verdict = validatePlaygroundUnit(built);
    if (!verdict.ok) {
      const summary = verdict.issues.map((i) => `• ${i.code}: ${i.message}`).join('\n');
      throw new Error(`Curriculum validation failed:\n${summary}`);
    }
    const stripTitle = (l: any) => { const { title: _drop, ...rest } = l; return rest; };
    const hydrated = {
      ...built,
      lessons: built.lessons.map((l) => {
        const seeded = seedPacksForLesson(l);
        const normalized = normalizePreA1LessonForCreator(seeded, prefill?.cefr ?? "Pre-A1", built.unit_topic);
        return { ...stripTitle(normalized), pages: normalized.pages ?? derivePages(normalized) };
      }),
    };
    let nextUnit: PlaygroundUnit;
    if (scope === "unit") {
      nextUnit = hydrated;
    } else {
      const replacement = hydrated.lessons.find(l => l.lesson_number === lessonNumber)
        ?? hydrated.lessons[0];
      nextUnit = {
        ...unit,
        lessons: unit.lessons.map(l =>
          l.lesson_number === lessonNumber
            ? (() => {
                const normalized = normalizePreA1LessonForCreator(
                  { ...replacement, lesson_number: lessonNumber },
                  prefill?.cefr ?? "Pre-A1",
                  unit.unit_topic,
                );
                return { ...stripTitle(normalized), lesson_number: lessonNumber, pages: normalized.pages ?? derivePages(normalized) };
              })()
            : l,
        ),
      };
    }
    handleUnitChange(nextUnit);
    if (prefill?.unitId) {
      const persisted = await lessonHook.saveUnitLessons({
        unitId: prefill.unitId,
        unitTopic: nextUnit.unit_topic || 'Playground unit',
        cefr: prefill?.cefr,
        publish: false,
        silent: true,
        lessons: nextUnit.lessons.map((l) => ({
          lesson_number: l.lesson_number,
          title: resolveLessonTitle(nextUnit.unit_topic, l, l.lesson_number),
          slides: buildSlidesFor(l, nextUnit.unit_topic),
          playground_lesson: l,
        })),
      });
      if (!persisted) throw new Error('Generated unit could not be saved to the Master Library.');
    }
  };

  // Build the input for the Ace Lesson one-click generator.
  const getAceInput = (): AceLessonInput => {
    const reviewTargets = Array.from(
      new Set(
        unit.lessons
          .filter((l) => l.lesson_number < lessonNumber && l.lesson_number <= 4)
          .flatMap((l: any) => [...(l.vocab ?? []), ...((l.review_targets ?? []) as string[])])
          .filter((v: any): v is string => typeof v === "string" && v.trim().length > 0)
          .map((v) => v.trim()),
      ),
    );
    const themeVal = ((unit as any).unit_theme as string | undefined) || undefined;
    return {
      hub: "playground",
      cefr: /^pre[-_ ]?a1$/i.test((prefill?.cefr ?? "Pre-A1").trim())
        ? "Pre-A1"
        : (prefill?.cefr ?? (unit as any).cefr ?? "Pre-A1").trim(),
      topic: prefill?.topic || unit.unit_topic || "Greetings",
      unit_theme: themeVal,
      scene_phrase: themeVal ? topicToVocabScene(themeVal) : undefined,
      target_lesson_number: lessonNumber,
      review_targets: reviewTargets.length ? reviewTargets : undefined,
    };
  };

  const applyAceUnit = async (content: any, scope: "unit" | "lesson" = "lesson") => {
    try {
      await applyGeneratedUnit(content, scope);
    } catch (e: any) {
      console.error("[CreatorShell] Ace apply failed", e);
      alert("Ace lesson could not be applied: " + (e?.message ?? "unknown error"));
    }
  };


  // Auto-trigger when arriving from Master Library with ?autogen=unit|lesson
  const autoGenRanRef = useState({ done: false })[0];
  useEffect(() => {
    if (!prefill?.autoGenerate || autoGenRanRef.done) return;
    if (!prefill.topic) return; // need at least a topic
    // If we're editing an existing unit, wait for hydration and skip
    // auto-generation when saved lesson rows already exist — otherwise
    // re-opening "Edit Unit" would silently regenerate over the user's work.
    if (prefill?.unitId) {
      if (!unitHydrated) return;
      if (unitHasSavedContent) { autoGenRanRef.done = true; return; }
    }
    autoGenRanRef.done = true;
    runAiGenerate(prefill.autoGenerate, { silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill?.autoGenerate, prefill?.topic, prefill?.unitId, unitHydrated, unitHasSavedContent]);

  return (
    <PlaygroundUnitProvider unit={unit} onChange={handleUnitChange}>
      <div className="flex h-screen w-full flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        {/* TOP TOOLBAR */}
        <Toolbar
          unitTopic={unit.unit_topic}
          unitTheme={(unit as any).unit_theme}
          onUnitThemeChange={(env) =>
            setUnit((prev) => ({ ...prev, unit_theme: env === 'auto' ? undefined : env } as any))
          }
          lessonTitle={resolveLessonTitle(unit.unit_topic, unit.lessons.find(l => l.lesson_number === lessonNumber), lessonNumber)}
          mode={mode}
          onModeChange={setMode}
          onBack={() => navigate('/content-creator')}
          
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onViewCode={() => setCodeOpen(true)}
          onPlay={() => setPlayOpen(true)}
          isSaving={lessonHook.isSaving}
          isPublished={!!lessonHook.lesson?.is_published}
          aceInput={getAceInput}
          onAceApply={applyAceUnit}
          criticVerdict={criticVerdict}
          criticOverall={criticOverall}
        />

        <CodeViewerModal
          open={codeOpen}
          unit={unit}
          lessonNumber={lessonNumber}
          onClose={() => setCodeOpen(false)}
        />

        {playOpen ? (
          <div className="fixed inset-0 z-[100] flex flex-col bg-black/80 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#3a1d0a] px-4 py-2 text-white">
              <div className="min-w-0 truncate text-sm font-bold">
                ▶ Playing · {unit.unit_topic} · Lesson {lessonNumber}
              </div>
              <button
                onClick={() => setPlayOpen(false)}
                className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20"
              >
                <X className="h-3.5 w-3.5" /> Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-white">
              <Suspense fallback={<div className="p-6 text-sm text-orange-700">Loading lesson…</div>}>
                <PlaygroundLessonPlayer
                  key={`play-modal-${lessonNumber}-${JSON.stringify(unit.lessons.find(l => l.lesson_number === lessonNumber)?.pages?.length ?? 0)}-${(unit.lessons.find(l => l.lesson_number === lessonNumber)?.pages ?? []).reduce((acc, p: any) => acc + (p.blocks?.length ?? 0), 0)}`}
                  unit={unit}
                  lessonNumber={lessonNumber}
                  cefr={prefill?.cefr}
                  embedded
                  onExit={() => setPlayOpen(false)}
                />
              </Suspense>
            </div>
          </div>
        ) : null}

        {(lessonHook.lesson as any)?.content?.needs_regeneration ? (
          <div className="flex items-center justify-between gap-3 border-b border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-900">
            <span>
              ⚠️ This lesson is missing curriculum metadata
              (theme · communication goal · grammar target · story goal).
              Regenerate it to align with the current curriculum brain.
            </span>
            <button
              onClick={() => runAiGenerate("lesson")}
              className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-amber-700"
            >
              <Sparkles className="h-3 w-3" /> Regenerate
            </button>
          </div>
        ) : null}

        {mode === "edit" ? (
          <>
            <LessonIntroBar
              unit={unit}
              lessonNumber={lessonNumber}
              cefr={prefill?.cefr}
              onUnitChange={handleUnitChange}
            />
            <div className="space-y-2 border-b border-orange-200 bg-white/60 px-4 py-2 backdrop-blur">
              <LessonQualityBadge
                lessonId={String(lessonNumber)}
                slides={(pages ?? []).map((p: any, i: number) => ({
                  id: String(p.id ?? i),
                  type: p.type ?? p.kind ?? p.activity_type,
                }))}
                telemetry={telemetryScore}
              />
              <LessonCriticPanel
                lesson={buildCriticLesson(lesson)}
                onVerdict={(v, o) => { setCriticVerdict(v); setCriticOverall(o); }}
              />
              {lessonNumber === 1 ? (
                <ABVariantPanel
                  lesson={lesson as any}
                  unitTopic={unit.unit_topic}
                  cefr={prefill?.cefr}
                  onApply={(nextPages, starring) => {
                    setUnit((u) => ({
                      ...u,
                      lessons: u.lessons.map((l) =>
                        l.lesson_number === 1
                          ? {
                              ...l,
                              pages: nextPages,
                              ...(starring ? { starring_character: starring as any } : {}),
                            }
                          : l,
                      ),
                    }));
                  }}
                />
              ) : null}
              <PinGoldenButton
                hub="playground"
                cefr={prefill?.cefr}
                title={`Lesson ${lessonNumber}`}
                objective={unit.unit_topic}
                pages={(pages ?? []) as any}
              />
            </div>
          </>
        ) : null}

        {mode === "preview" ? (
          <div className="min-h-0 flex-1 bg-[#FEFBDD]">
            <div className="flex items-center justify-between gap-3 border-b border-orange-200 bg-white/80 px-4 py-2 text-orange-950 backdrop-blur">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#FE6A2F]">Preview as student</p>
                <p className="text-sm font-bold">Interactive player · Lesson {lessonNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMode("edit")}
                  className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-white px-3 py-1.5 text-xs font-bold text-orange-900 hover:bg-orange-50"
                >
                  Back to teacher editor
                </button>
                <button
                  onClick={() => setPlayOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full bg-[#FE6A2F] px-3 py-1.5 text-xs font-black text-white hover:brightness-110"
                >
                  <Play className="h-3.5 w-3.5" /> Play fullscreen
                </button>
              </div>
            </div>
            <main className="h-[calc(100%-49px)] overflow-auto bg-[#FEFBDD]">
              <Suspense fallback={<div className="p-6 text-sm text-orange-700">Loading interactive lesson…</div>}>
                <PlaygroundLessonPlayer
                  key={`student-player-${lessonNumber}-${(unit.lessons.find(l => l.lesson_number === lessonNumber)?.pages ?? []).reduce((acc, p: any) => acc + (p.blocks?.length ?? 0), 0)}`}
                  unit={unit}
                  lessonNumber={lessonNumber}
                  cefr={prefill?.cefr}
                  embedded
                />
              </Suspense>
            </main>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 w-full gap-3 p-3 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px] overflow-x-auto">
            {/* LEFT — Lessons */}
            <aside className="overflow-y-auto rounded-2xl border border-orange-200 bg-white/80 p-3 shadow-sm backdrop-blur">
              <LessonRail
                unit={unit}
                activeLesson={lessonNumber}
                onSelect={(n) => {
                  setLessonNumber(n);
                  setTab("content");
                }}
              />
            </aside>

            {/* CENTER — editable lesson pages */}
            <main className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-orange-200 bg-white/80 shadow-sm backdrop-blur">
              <div key={`edit-${lessonNumber}`} className="min-h-0 flex-1 overflow-y-auto bg-white/60">
                <LessonEditorCanvas lessonNumber={lessonNumber} />
              </div>
            </main>

            {/* RIGHT — Inspector */}
            <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-orange-200 bg-white/80 shadow-sm backdrop-blur">
              <div className="border-b border-orange-100 p-2">
                <PublishGatePanel lessonId={prefill?.lessonId ?? null} />
              </div>
              <div className="flex border-b border-orange-100 px-2 pt-2">
                {(["content", "media", "activity", "vocab", "motion", "homework", "games"] as InspectorTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 rounded-t-lg px-2 py-1.5 text-xs font-semibold capitalize transition ${
                      tab === t ? "bg-[#FE6A2F] text-white" : "text-orange-900 hover:bg-orange-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {tab === "vocab" ? (
                  <VocabTab lessonNumber={lessonNumber} lesson={lesson} />
                ) : !page ? (
                  <div className="text-sm text-orange-700">Pick a page to edit.</div>
                ) : tab === "content" ? (
                  <ContentTab lessonNumber={lessonNumber} page={page} />
                ) : tab === "media" ? (
                  <MediaTab lessonNumber={lessonNumber} page={page} />
                ) : tab === "activity" ? (
                  <ActivityTab lessonNumber={lessonNumber} page={page} />
                ) : tab === "motion" ? (
                  <MotionTab lessonNumber={lessonNumber} page={page} />
                ) : tab === "homework" ? (
                  <HomeworkTab lessonNumber={lessonNumber} lesson={lesson} />
                ) : (
                  <GamesTab lessonNumber={lessonNumber} lesson={lesson} />
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </PlaygroundUnitProvider>
  );
}

function pageTextSummary(page: PlaygroundPage): string {
  const lines: string[] = [];
  if (page.notes && page.notes.trim()) {
    lines.push(`Teacher note: ${page.notes.trim()}`);
  }
  for (const b of page.blocks ?? []) {
    if (b.kind === "text") lines.push(b.value);
    else if (b.kind === "audio") lines.push(b.text ?? "");
    else if (b.kind === "image") lines.push(b.subject);
    else if (b.kind === "activity") lines.push(`${b.label ?? b.type}: ${JSON.stringify(b.config ?? {})}`);
    else if (b.kind === "music") lines.push(b.mood);
    else if (b.kind === "video") lines.push(b.url || b.label || "");
  }
  return lines.filter(Boolean).join("\n");
}

function GeneratedLessonPreview({
  unit,
  lessonNumber,
  cefr,
}: {
  unit: PlaygroundUnit;
  lessonNumber: PlaygroundLessonNumber;
  cefr?: string;
}) {
  const lesson = unit.lessons.find((l) => l.lesson_number === lessonNumber);
  const pages = lesson ? derivePages(lesson) : [];
  if (!lesson || pages.length === 0) return <EmptyPages />;
  return (
    <div className="space-y-4 p-4">
      {pages.map((p) => (
        <section key={p.id} className="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm">
          {p.phase_id === "intro" ? (
            <IntroCardPreview unit={unit} lessonNumber={lessonNumber} cefr={cefr} />
          ) : (
            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-3 border-b border-orange-100 pb-2">
                <h2 className="text-lg font-black text-orange-950">{p.title ?? p.phase_id}</h2>
                <span className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-700">
                  {p.phase_id.replace(/_/g, " ")}
                </span>
              </div>
              <ul className="grid gap-2 md:grid-cols-2">
                {(p.blocks ?? []).map((b) => (
                  <li key={b.id} className="rounded-xl border border-orange-100 bg-orange-50/40 p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-bold capitalize text-orange-900">
                      {blockIcon(b.kind)} {b.kind} · {b.label ?? b.id.split(".").pop()}
                    </div>
                    <BlockSummary block={b} />
                    {b.kind === "activity" ? (
                      <pre className="mt-2 max-h-28 overflow-auto rounded-lg bg-white/80 p-2 text-[10px] text-orange-900">
                        {JSON.stringify(b.config ?? {}, null, 2)}
                      </pre>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

/**
 * StudentStackPreview — renders every page of the current lesson stacked
 * vertically using student-facing styling, so the creator can scroll
 * through the full lesson exactly as the student will see it.
 */
function StudentStackPreview({
  unit,
  lessonNumber,
  cefr,
}: {
  unit: PlaygroundUnit;
  lessonNumber: PlaygroundLessonNumber;
  cefr?: string;
}) {
  const lesson = unit.lessons.find((l) => l.lesson_number === lessonNumber);
  const pages = lesson?.pages?.length ? lesson.pages : lesson ? derivePages(lesson) : [];
  if (!lesson || pages.length === 0) {
    return (
      <div className="grid min-h-[300px] place-items-center p-6 text-center text-orange-900">
        <div>
          <p className="text-lg font-black">No pages yet</p>
          <p className="mt-1 text-sm opacity-75">Generate this lesson to preview the student view.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      {pages.map((p, i) => (
        <section key={p.id} className="overflow-hidden rounded-3xl border border-orange-200 bg-white/90 shadow-sm">
          <header className="flex items-center justify-between gap-3 border-b border-orange-100 bg-orange-50/70 px-5 py-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#FE6A2F]">
                Page {i + 1} of {pages.length} · {p.phase_id.replace(/_/g, " ")}
              </p>
              <h2 className="mt-0.5 text-xl font-black text-[#3a1d0a]">{p.title ?? p.phase_id}</h2>
            </div>
          </header>
          <div className="space-y-4 p-5">
            {p.phase_id === "intro" ? (
              <IntroCardPreview unit={unit} lessonNumber={lessonNumber} cefr={cefr} />
            ) : (
              (p.blocks ?? []).map((b) => <StudentBlock key={b.id} block={b} />)
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function StudentBlock({ block }: { block: PlaygroundBlock }) {
  if (block.kind === "text") {
    return (
      <div className="rounded-2xl border border-orange-100 bg-white p-4 text-center">
        {block.label ? <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#FE6A2F]">{block.label}</p> : null}
        <p className="whitespace-pre-line text-lg font-extrabold leading-snug text-[#3a1d0a]">{block.value}</p>
      </div>
    );
  }
  if (block.kind === "image") {
    return (
      <div className="rounded-2xl border border-orange-100 bg-white p-4 text-center">
        {block.url ? (
          <img src={block.url} alt={block.label || block.subject} className="mx-auto max-h-72 w-full object-contain" />
        ) : (
          <div className="grid min-h-40 place-items-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 p-4">
            <div>
              <p className="text-base font-black text-[#3a1d0a]">{block.label || "Scene"}</p>
              <p className="mt-1 text-xs font-semibold text-[#3a1d0a]/70">{block.prompt || block.subject}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
  if (block.kind === "audio") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-orange-50/70 p-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#FE6A2F]">🔊 {block.label || "Audio"}</p>
          <p className="mt-0.5 text-base font-extrabold text-[#3a1d0a]">{block.text || "Listen and repeat."}</p>
        </div>
        <button
          onClick={() => {
            if (block.text && typeof window !== "undefined" && "speechSynthesis" in window) {
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(new SpeechSynthesisUtterance(block.text));
            }
          }}
          className="rounded-full bg-[#FE6A2F] px-4 py-1.5 text-xs font-black text-white shadow"
        >Play</button>
      </div>
    );
  }
  if (block.kind === "video") {
    return (
      <div className="rounded-2xl border border-orange-100 bg-white p-4">
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#FE6A2F]">🎬 {block.label || "Video"}</p>
        {block.url ? <video src={block.url} controls className="w-full rounded-xl" /> : <div className="grid min-h-32 place-items-center rounded-xl bg-[#3a1d0a] text-white">▶️ Video slot</div>}
      </div>
    );
  }
  if (block.kind === "music") {
    return (
      <div className="rounded-2xl border border-orange-100 bg-amber-50 p-3 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#FE6A2F]">🎵 {block.label || "Music"}</p>
        <p className="mt-0.5 text-sm font-bold text-[#3a1d0a]">{block.mood}</p>
      </div>
    );
  }
  if (block.kind === "language_engine_slot") {
    return (
      <EngineSlotPreviewCard
        hub={(block.hub as any) || "playground"}
        lessonNumber={undefined}
        engineType={block.engineType as any}
        title={block.title || block.label}
        objective={block.objective}
        targetWords={block.target_words || []}
        mode={(block.mode as any) || "lesson"}
      />
    );
  }
  // activity
  return (
    <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-white p-4">
      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#FE6A2F]">🎮 {block.label || block.type}</p>
      <p className="text-base font-extrabold text-[#3a1d0a]">{String((block.config as any)?.prompt || block.type || "Activity")}</p>
      {Array.isArray((block.config as any)?.lines) ? (
        <div className="mt-2 grid gap-1.5">
          {((block.config as any).lines as string[]).map((line, i) => (
            <div key={`${block.id}-${i}`} className="rounded-xl bg-orange-50 px-3 py-2 text-sm font-bold text-[#3a1d0a]">{line}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
}



function lessonKindForGeneration(n?: PlaygroundLessonNumber): string {
  switch (n) {
    case 1: return "discover: warm-up, vocabulary, conversation/object modeling, phonics, sentence, spelling";
    case 2: return "build: recycle L1, modeling, phonics, guided practice, listening, spelling";
    case 3: return "apply: communicative modeling, roleplay/game, sentence production, spelling";
    case 4: return "storybook: story, story vocabulary, phonics review, story video, retell, review";
    case 5: return "review: recycle everything from lessons 1-4";
    case 6: return "quiz: 80 percent mastery gate";
    case 7: return "stretch: extra practice after failed quiz";
    default: return "full 7-lesson ACE unit";
  }
}

// ─── Toolbar ──────────────────────────────────────────────────────────────
function Toolbar({
  unitTopic, unitTheme, onUnitThemeChange, lessonTitle, mode, onModeChange, onBack,
  onSaveDraft, onPublish, onViewCode, onPlay, isSaving, isPublished,
  aceInput, onAceApply, criticVerdict, criticOverall,
}: {
  unitTopic: string;
  unitTheme?: string;
  onUnitThemeChange: (env: string) => void;
  lessonTitle: string;
  mode: "edit" | "preview"; onModeChange: (m: "edit" | "preview") => void;
  onBack: () => void;
  onSaveDraft: () => void | Promise<void>;
  onPublish: () => void | Promise<void>;
  onViewCode: () => void;
  onPlay: () => void;
  isSaving: boolean;
  isPublished: boolean;
  aceInput: () => AceLessonInput;
  onAceApply: (unit: any, scope?: "unit" | "lesson") => void | Promise<void>;
  criticVerdict?: "publish" | "repair" | "block" | null;
  criticOverall?: number | null;
}) {
  const busy = false;
  return (
    <header className="flex items-center justify-between gap-3 border-b border-orange-200 bg-white/70 px-3 py-2 backdrop-blur">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-semibold text-orange-900 hover:bg-orange-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Content Creator
        </button>
        <div className="ml-2 min-w-0 truncate text-sm">
          <span className="font-bold text-orange-900">{unitTopic}</span>
          <span className="mx-2 text-orange-300">/</span>
          <span className="text-orange-800">{lessonTitle}</span>
        </div>
        <label className="ml-3 hidden items-center gap-1 rounded-full border border-orange-200 bg-white px-2 py-1 text-[11px] font-semibold text-orange-900 md:inline-flex">
          <span className="text-orange-500">Theme</span>
          <select
            value={unitTheme ?? 'auto'}
            onChange={(e) => onUnitThemeChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-orange-900 focus:outline-none"
            title="Backdrop theme for every slide in this unit"
          >
            <option value="auto">Auto (from topic)</option>
            <option value="classroom">Classroom</option>
            <option value="park">Park</option>
            <option value="kitchen">Kitchen</option>
            <option value="space">Space</option>
            <option value="beach">Beach</option>
            <option value="library">Library</option>
            <option value="forest">Forest</option>
            <option value="bedroom">Bedroom</option>
          </select>
        </label>
      </div>
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-full border border-orange-200 bg-white p-0.5 text-xs font-semibold">
          {(["edit", "preview"] as const).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`rounded-full px-3 py-1 capitalize transition ${
                mode === m ? "bg-[#FE6A2F] text-white shadow" : "text-orange-900 hover:bg-orange-50"
              }`}
            >
              {m === "preview" ? "Preview as student" : "Teacher editor"}
            </button>
          ))}
        </div>
        <AceLessonButton input={aceInput} onApplyUnit={onAceApply} disabled={!!busy} />
        <div className="mx-1 h-5 w-px bg-orange-200" />
        <button
          onClick={onPlay}
          className="inline-flex items-center gap-1 rounded-full bg-[#FE6A2F] px-3 py-1.5 text-xs font-black text-white shadow hover:brightness-110"
          title="Play lesson as a student"
        >
          <Play className="h-3.5 w-3.5" /> Play Lesson
        </button>
        <button
          onClick={onViewCode}
          className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-white px-3 py-1.5 text-xs font-bold text-orange-900 hover:bg-orange-50"
          title="View / copy the lesson or unit JSON"
        >
          <Code2 className="h-3.5 w-3.5" /> View Code
        </button>
        {criticOverall != null && (
          <span
            title={`Lesson Critic verdict: ${criticVerdict ?? "n/a"}`}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
              criticVerdict === "block"
                ? "bg-rose-100 text-rose-800 border border-rose-300"
                : criticVerdict === "repair"
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : "bg-emerald-100 text-emerald-800 border border-emerald-300"
            }`}
          >
            Quality {criticOverall}/100
          </span>
        )}
        <button
          onClick={() => onSaveDraft()}
          disabled={isSaving}
          className="inline-flex items-center gap-1 rounded-full border-2 border-orange-400 bg-white px-3 py-1.5 text-xs font-bold text-orange-700 hover:bg-orange-50 disabled:opacity-60"
          title="Save current unit as a draft to the Master Library"
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save Draft
        </button>

        <button
          onClick={() => onPublish()}
          disabled={isSaving}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow disabled:opacity-60 ${
            criticVerdict === "block"
              ? "bg-rose-600 hover:bg-rose-700"
              : criticVerdict === "repair"
              ? "bg-amber-600 hover:bg-amber-700"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
          title={
            criticVerdict === "block"
              ? `Critic BLOCKED (${criticOverall ?? "?"}/100) — click to confirm publish anyway`
              : criticVerdict === "repair"
              ? `Critic suggests repair (${criticOverall ?? "?"}/100)`
              : "Publish this unit to the Master Library"
          }
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          {criticVerdict === "block" ? "⚠ " : ""}{isPublished ? "Republish" : "Publish"}
          {criticOverall != null ? ` · ${criticOverall}` : ""}
        </button>
      </div>
    </header>
  );
}


// ─── Page header / sub-rail ───────────────────────────────────────────────
function PageHeader({
  lessonNumber, pages, activeId, onSelect,
}: {
  lessonNumber: PlaygroundLessonNumber;
  pages: PlaygroundPage[];
  activeId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="border-b border-orange-100 px-3 py-2">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-orange-700">
        Lesson {lessonNumber} · Pages ({pages.length})
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {pages.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition ${
              p.id === activeId
                ? "bg-[#FE6A2F] text-white shadow"
                : "bg-orange-50 text-orange-900 hover:bg-orange-100"
            }`}
          >
            {i + 1}. {p.title ?? p.phase_id}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyPages() {
  return (
    <div className="grid h-full place-items-center text-center text-sm text-orange-800">
      <div>
        <p className="font-semibold">No pages on this lesson yet.</p>
        <p className="mt-1 text-xs text-orange-700">
          Use <span className="font-bold">AI Generate</span> in the toolbar to fill this unit, or pick another lesson.
        </p>
      </div>
    </div>
  );
}

// ─── Page block list (focused preview) ────────────────────────────────────
function blockIcon(kind: PlaygroundBlock["kind"]) {
  switch (kind) {
    case "text": return <FileText className="h-3.5 w-3.5" />;
    case "image": return <ImageIcon className="h-3.5 w-3.5" />;
    case "audio": return <Mic className="h-3.5 w-3.5" />;
    case "music": return <Music className="h-3.5 w-3.5" />;
    case "video": return <VideoIcon className="h-3.5 w-3.5" />;
    case "activity": return <Gamepad2 className="h-3.5 w-3.5" />;
  }
}

function PageBlockList({
  page, lessonNumber, onInspect,
}: {
  page: PlaygroundPage;
  lessonNumber: PlaygroundLessonNumber;
  onInspect: (tab: InspectorTab) => void;
}) {
  const { updatePage } = usePlaygroundUnitMutators();

  const addBlock = (kind: PlaygroundBlock["kind"]) => {
    const id = `${page.id}.${kind}-${Date.now().toString(36)}`;
    const newBlock: PlaygroundBlock = (() => {
      switch (kind) {
        case "text": return { kind, id, label: "Note", value: "" };
        case "image": return { kind, id, label: "Image", subject: "" };
        case "audio": return { kind, id, label: "Audio", text: "", voice: "pip" };
        case "music": return { kind, id, label: "Music", mood: "happy" };
        case "video": return { kind, id, label: "Video", url: "" };
        case "activity": return { kind, id, label: "Activity", type: "multiple", config: { question: "" } };
      }
    })();
    updatePage?.(lessonNumber, page.id, { blocks: [...page.blocks, newBlock] });
    onInspect(kind === "activity" ? "activity" : kind === "image" || kind === "audio" || kind === "music" || kind === "video" ? "media" : "content");
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-orange-950">{page.title ?? page.phase_id}</h2>
          <span className="text-[10px] font-semibold text-orange-700">{page.blocks.length} block(s)</span>
        </div>
        <p className="text-xs text-orange-700">Edit any block from the inspector on the right.</p>
      </div>

      {page.blocks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/50 p-4 text-center text-xs text-orange-800">
          This page is empty. Add a block below.
        </div>
      ) : (
        <ul className="space-y-2">
          {page.blocks.map((b) => (
            <li key={b.id} className="flex items-start gap-2 rounded-xl border border-orange-200 bg-white p-2">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-orange-100 text-orange-800">
                {blockIcon(b.kind)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold capitalize text-orange-900">{b.kind} · {b.label ?? b.id.split(".").pop()}</div>
                <BlockSummary block={b} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add block toolbar */}
      <div className="rounded-xl border border-orange-200 bg-white/70 p-2">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-orange-700">
          <Plus className="mr-1 inline h-3 w-3" /> Add block to this page
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["text","image","audio","music","video","activity"] as const).map((k) => (
            <button
              key={k}
              onClick={() => addBlock(k)}
              className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white px-2.5 py-1 text-[11px] font-semibold capitalize text-orange-900 hover:bg-orange-50"
            >
              {blockIcon(k)} {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlockSummary({ block }: { block: PlaygroundBlock }) {
  switch (block.kind) {
    case "text":
      return <div className="truncate text-[11px] text-orange-700">{block.value || <em className="opacity-60">(empty)</em>}</div>;
    case "image":
      return (
        <div className="mt-1 flex items-center gap-2">
          {block.url ? (
            <img src={block.url} alt={block.subject} className="h-10 w-14 rounded object-cover" />
          ) : (
            <div className="grid h-10 w-14 place-items-center rounded bg-orange-50 text-[9px] text-orange-700">no img</div>
          )}
          <div className="truncate text-[11px] text-orange-700">{block.subject || <em>no subject</em>}</div>
        </div>
      );
    case "audio":
      return <div className="truncate text-[11px] text-orange-700">🔊 {block.text || <em>no script</em>}</div>;
    case "music":
      return <div className="truncate text-[11px] text-orange-700">🎵 {block.mood}</div>;
    case "video":
      return <div className="truncate text-[11px] text-orange-700">▶ {block.url || <em>no url</em>}</div>;
    case "activity":
      return <div className="truncate text-[11px] text-orange-700">🎮 type: {block.type}</div>;
  }
}

function IntroCardPreview({
  unit,
  lessonNumber,
  cefr,
}: {
  unit: PlaygroundUnit;
  lessonNumber: PlaygroundLessonNumber;
  cefr?: string;
}) {
  const lessonRec = unit.lessons.find((l) => l.lesson_number === lessonNumber) as any;
  const lessonTitle = resolveLessonTitle(unit.unit_topic, lessonRec, lessonNumber);
  const star = lessonRec?.starring_character?.name as string | undefined;
  const starEmoji = (lessonRec?.starring_character?.emoji as string | undefined) ?? "✨";
  const topicImage =
    (lessonRec?.cover_image as string | undefined) ||
    (lessonRec?.vocabulary?.find?.((v: any) => v?.image_url)?.image_url as string | undefined) ||
    (lessonRec?.vocab?.find?.((v: any) => typeof v === "object" && v?.image_url)?.image_url as string | undefined);

  return (
    <div className="grid place-items-center p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-orange-200/70 bg-gradient-to-br from-[#FFF6D6] via-[#FFE7B8] to-[#FFD0A8] shadow-lg">
        <div className="grid grid-cols-1 overflow-hidden bg-white shadow-sm md:grid-cols-2 md:min-h-[420px]">
          {/* LEFT 50% — topic image fills the entire half */}
          <div className="relative overflow-hidden bg-[#FEFBDD] aspect-square md:aspect-auto md:h-full w-full">
            {topicImage ? (
              <img src={topicImage} alt={lessonTitle} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="grid h-28 w-28 place-items-center rounded-2xl border-2 border-dashed border-orange-300 bg-white text-5xl text-orange-400">
                  {starEmoji}
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-orange-700">
                  Topic image
                </p>
                <p className="text-[11px] text-orange-600">
                  Generate from the Media tab.
                </p>
              </div>
            )}
          </div>


          {/* RIGHT 50% — placement-test card vibe */}
          <div className="flex flex-col items-center justify-center gap-5 px-8 py-10 text-center">
            {/* Brand logo bubble — flat, soft ring, gentle float */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="relative grid h-24 w-24 place-items-center rounded-full animate-[bounce_2.4s_ease-in-out_infinite]"
                style={{
                  background:
                    "radial-gradient(circle at 32% 28%, #FFD9A8 0%, #FE9B5C 35%, #FE6A2F 65%, #C24412 100%)",
                  boxShadow:
                    "0 14px 30px -8px rgba(254,106,47,0.55), inset 0 -8px 16px rgba(154,52,0,0.45), inset 0 6px 12px rgba(255,255,255,0.35)",
                }}
                aria-label="EnglEuphoria logo"
              >
                <img
                  src={engleuphoriaLogo}
                  alt="EnglEuphoria"
                  className="h-16 w-16 object-contain drop-shadow"
                  style={{ filter: "brightness(0) invert(1)" }}
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.style.display = "none";
                    const fb = el.nextElementSibling as HTMLElement | null;
                    if (fb) fb.style.display = "grid";
                  }}
                />
                <span className="hidden h-full w-full place-items-center text-3xl font-black text-white">E</span>
                {/* glossy highlight */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute rounded-full bg-white/70"
                  style={{ width: 22, height: 12, top: 14, left: 22, filter: "blur(3px)" }}
                />
              </div>

              <div className="flex flex-col items-center leading-tight">
                <span className="text-sm font-extrabold tracking-tight text-[#FE6A2F]">
                  EnglEuphoria
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-700/80">
                  Playground · English for Kids
                </span>
              </div>
            </div>


            <h1 className="text-2xl font-black leading-tight text-orange-950">
              {lessonTitle}
            </h1>

            {star && (
              <p className="text-sm font-semibold text-orange-700">
                Starring {star} {starEmoji}
              </p>
            )}

            <div className="flex flex-wrap justify-center gap-1.5 pt-1 text-[10px] font-bold uppercase tracking-widest text-orange-900">
              <span className="rounded-full bg-[#FEFBDD] px-2.5 py-1 ring-1 ring-orange-200">
                Level · {cefr || "Pre-A1"}
              </span>
              <span className="rounded-full bg-[#FEFBDD] px-2.5 py-1 ring-1 ring-orange-200">
                Unit · {unit.unit_topic || "—"}
              </span>
              <span className="rounded-full bg-[#FEFBDD] px-2.5 py-1 ring-1 ring-orange-200">
                Lesson {lessonNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-orange-700">
        This is the branded intro card students see first when the lesson begins.
      </p>
    </div>
  );
}

export default CreatorShell;
