import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import '@/styles/academy-game.css';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  SlideRenderer,
  themeMap,
  BLOCKS,
  type Slide,
  type Theme,
  type Block,
  type AnswerEvent,
} from '@/pages/AcademyDemo';
import { AcademyHubProvider } from '@/components/academy/HubGuard';
import ProfileAvatar from '@/components/academy/ProfileAvatar';
import CoinBalance from '@/components/academy/CoinBalance';
import AcademyLessonCompleteModal from '@/components/academy/AcademyLessonCompleteModal';
import { awardAcademyCoins, ACADEMY_COINS_PER_BLOCK } from '@/lib/academy/coins';
import { QuestHud, LevelSplash, LevelCleared, XpPops, type XpPopItem } from '@/components/academy/game/QuestUi';
import { resolveQuestLevel, type QuestLevelOverrides } from '@/lib/academy/questLevels';
import { sfx, isSfxMuted, setSfxMuted } from '@/lib/academy/sfx';
import { extractImageUrls, loadResume, saveResume, clearResume } from '@/lib/academy/playerSafety';
import { SlideErrorBoundary, RenderGuard, OfflineChip } from '@/components/academy/player/PlayerSafety';
import { SlideNavigator } from '@/components/academy/player/SlideNavigator';
import { useDevBypass } from '@/hooks/useDevBypass';

/**
 * The new, canonical Academy lesson player (Phase 1 of the "new Academy
 * engine" rebuild) — full-bleed scene layout, mirroring Playground's
 * PlayUnitLesson.tsx/SceneRenderer.tsx convention: a scene's background
 * fills the whole viewport and content floats on top of it as a glass
 * panel, rather than sitting in a bordered card inside a split-pane page
 * (AcademyDemo.tsx's own layout, which this used to copy verbatim).
 *
 * Playground gets this from a hand-painted `bg` image per scene
 * (unit1/scenes.ts) — bespoke to each lesson's own story, not a shared
 * asset. Academy has no in-Creator authoring step for this yet, but the
 * same underlying pipeline exists (generate-slide-image, verify_jwt=false,
 * the exact function that produced the Ava & Theo scene_dialogue art) —
 * callable directly to pre-generate one real illustrated background per
 * pedagogical block for a given lesson, stored on that lesson's own
 * content.blockImages (see LessonRow below) and rendered here in place of
 * the CSS gradient. Each of the 7 blocks (warmup/vocab/reading/grammar/
 * practice/interactive/speaking — BLOCKS in AcademyDemo.tsx) still has a
 * CSS gradient "scene" (BLOCK_SCENES below) as the graceful fallback for
 * any lesson that hasn't been illustrated this way yet — never a blank or
 * broken background. A `scene_dialogue` slide (which carries its own
 * bg_image_url) is exempted from the glass-panel treatment and shown
 * edge-to-edge instead, since it's already a real full-bleed scene in its
 * own right.
 *
 * SlideRenderer itself (imported from AcademyDemo.tsx, unchanged) still
 * renders each slide type's actual content — this file only changes the
 * chrome around it, so there is no risk of regressing any of the ~30
 * slide-type renderers to keep this in sync with.
 *
 * Routed lessons must carry ai_metadata.contentFormat === 'academy-v2' —
 * see resolvePlaygroundLessonRoute() in lessonLibraryService.ts, which is
 * what sends a lesson id here instead of the old /lesson/:id reader.
 *
 * roomId/role are accepted for forward-compatibility with Phase 3 (live
 * classroom sync, mirroring PlayUnitLesson.tsx's pattern) but are inert here
 * — this component is solo-play only for now.
 */
interface PlayAcademyLessonProps {
  roomId?: string;
  role?: 'teacher' | 'student';
}

interface LessonRow {
  id: string;
  title: string;
  slides: Slide[];
  /** Real illustrated background per block, generated per-lesson via the
   *  app's own generate-slide-image pipeline (same one that produced the
   *  Ava & Theo scene_dialogue art) — bespoke to this lesson's own story,
   *  the same way Playground's bg images are bespoke per lesson, never a
   *  shared/generic asset. Absent on lessons not yet illustrated this way;
   *  BLOCK_SCENES' CSS gradients are the fallback for those. */
  blockImages?: Partial<Record<Block, string>>;
  /** Optional per-lesson quest level names/goals (see lib/academy/questLevels.ts). */
  levels?: QuestLevelOverrides;
}

const SESSION_KEY_PREFIX = 'academy-scene-idx:';

// One full-bleed "scene" per pedagogical block — layered radial glows over a
// dark base, each with its own accent hue and a distinct decorative motif so
// the lesson visibly moves through a place, the way Playground's varied
// scene backgrounds do, even though these are generated, not painted.
const BLOCK_SCENES: Record<Block, { background: string; motif: string; accent: string }> = {
  warmup: {
    background:
      'radial-gradient(ellipse 900px 700px at 15% 0%, rgba(91,140,255,0.38), transparent 60%), ' +
      'radial-gradient(ellipse 800px 800px at 90% 100%, rgba(168,85,247,0.26), transparent 60%), ' +
      'linear-gradient(160deg, #141a52 0%, #0d1140 55%, #070a24 100%)',
    motif: 'radial-gradient(circle, rgba(200,214,255,0.5) 1px, transparent 1.5px)',
    accent: '#8fb4ff',
  },
  vocab: {
    background:
      'radial-gradient(ellipse 900px 700px at 15% 0%, rgba(139,92,246,0.36), transparent 60%), ' +
      'radial-gradient(ellipse 800px 800px at 90% 100%, rgba(59,109,255,0.26), transparent 60%), ' +
      'linear-gradient(160deg, #1b1668 0%, #120f4a 55%, #070a24 100%)',
    motif: 'radial-gradient(circle, rgba(200,214,255,0.5) 1px, transparent 1.5px)',
    accent: '#b78bff',
  },
  reading: {
    background:
      'radial-gradient(ellipse 900px 700px at 15% 0%, rgba(59,109,255,0.34), transparent 60%), ' +
      'radial-gradient(ellipse 800px 800px at 90% 100%, rgba(124,92,246,0.24), transparent 60%), ' +
      'linear-gradient(160deg, #0f1c5c 0%, #0c1244 55%, #070a24 100%)',
    motif: 'radial-gradient(circle, rgba(200,214,255,0.5) 1px, transparent 1.5px)',
    accent: '#86b6ff',
  },
  grammar: {
    background:
      'radial-gradient(ellipse 900px 700px at 15% 0%, rgba(99,102,241,0.36), transparent 60%), ' +
      'radial-gradient(ellipse 800px 800px at 90% 100%, rgba(134,236,255,0.18), transparent 60%), ' +
      'linear-gradient(160deg, #141a58 0%, #0f1348 55%, #070a24 100%)',
    motif: 'linear-gradient(rgba(134,236,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(134,236,255,0.07) 1px, transparent 1px)',
    accent: '#86ecff',
  },
  practice: {
    background:
      'radial-gradient(ellipse 900px 700px at 15% 0%, rgba(124,92,246,0.34), transparent 60%), ' +
      'radial-gradient(ellipse 800px 800px at 90% 100%, rgba(59,130,255,0.26), transparent 60%), ' +
      'linear-gradient(160deg, #1a1766 0%, #110f48 55%, #070a24 100%)',
    motif: 'radial-gradient(circle, rgba(200,214,255,0.5) 1px, transparent 1.5px)',
    accent: '#a99bff',
  },
  interactive: {
    background:
      'radial-gradient(ellipse 900px 700px at 15% 0%, rgba(217,92,240,0.32), transparent 60%), ' +
      'radial-gradient(ellipse 800px 800px at 90% 100%, rgba(99,102,241,0.3), transparent 60%), ' +
      'linear-gradient(160deg, #2a1470 0%, #190f52 55%, #070a24 100%)',
    motif: 'radial-gradient(circle, rgba(200,214,255,0.5) 1px, transparent 1.5px)',
    accent: '#e3a2ff',
  },
  speaking: {
    background:
      'radial-gradient(ellipse 900px 700px at 15% 0%, rgba(134,236,255,0.2), transparent 60%), ' +
      'radial-gradient(ellipse 800px 800px at 90% 100%, rgba(139,92,246,0.3), transparent 60%), ' +
      'linear-gradient(160deg, #161c5e 0%, #0f1348 55%, #070a24 100%)',
    motif: 'radial-gradient(circle, rgba(200,214,255,0.5) 1px, transparent 1.5px)',
    accent: '#9ad8ff',
  },
};

export default function PlayAcademyLesson({ roomId, role }: PlayAcademyLessonProps) {
  const { id: routeLessonId } = useParams<{ id: string }>();
  const lessonId = routeLessonId;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lesson, setLesson] = useState<LessonRow | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const [badImages, setBadImages] = useState<Set<string>>(() => new Set());
  const preloaded = useRef<Set<string>>(new Set());
  const { isDevBypassActive, bypassRole } = useDevBypass();
  // Teachers / admins / content creators (and the dev-bypass teacher) may jump to any slide in the lesson map.
  const isTeacher =
    role === 'teacher' ||
    ['teacher', 'admin', 'content_creator'].includes(String((user as any)?.role ?? '')) ||
    (isDevBypassActive && (bypassRole === 'teacher' || bypassRole === 'admin'));

  const [i, setI] = useState(0);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const creditedBlocks = useRef<Set<string>>(new Set());
  const startTimeRef = useRef<number>(Date.now());

  const t = themeMap.game;

  useEffect(() => {
    let cancelled = false;
    if (!lessonId) {
      setLoadError('No lesson specified.');
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const { data, error } = await supabase
          .from('curriculum_lessons')
          .select('id, title, content')
          .eq('id', lessonId)
          .single();
        if (error) throw error;
        const slides = (data?.content as any)?.slides;
        if (!Array.isArray(slides) || slides.length === 0) {
          throw new Error('This lesson has no content yet.');
        }
        if (!cancelled) {
          // Read the saved position BEFORE touching any state: setting the lesson re-renders slide 1 and the
          // "save progress" effect would overwrite the saved position with 0 before we could read it.
          const saved = sessionStorage.getItem(`${SESSION_KEY_PREFIX}${lessonId}`);
          const resume = loadResume(lessonId, slides.length);
          const savedIdx = saved ? parseInt(saved, 10) : resume ? resume.i : 0;
          const startIdx = Number.isFinite(savedIdx) ? Math.min(Math.max(savedIdx, 0), slides.length - 1) : 0;
          setI(startIdx);
          setMaxReached(Math.max(startIdx, resume?.max ?? 0));
          if (resume && !saved) setXp(resume.xp);
          setLesson({
            id: data.id,
            title: data.title,
            slides: slides as Slide[],
            blockImages: (data?.content as any)?.blockImages ?? undefined,
            levels: (data?.content as any)?.levels ?? undefined,
          });
        }
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message || 'Failed to load this lesson.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId, reloadKey]);

  const slides = lesson?.slides ?? [];
  const slide = slides[i];

  // ───────────── Quest / game layer ─────────────
  // Every block is a "level". The student earns XP + a streak for correct answers, sees a level intro and a
  // level-cleared celebration, and follows a trail map in the header. Nothing here can fail the student: a
  // wrong answer only resets the streak (gentle sound, encouraging pop-up) — no lives, no locks.
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pops, setPops] = useState<XpPopItem[]>([]);
  type QuestOverlay = null | { kind: 'splash'; block: Block } | { kind: 'cleared'; block: Block; nextIndex: number };
  const [overlay, setOverlay] = useState<QuestOverlay>(null);
  const [sfxMuted, setSfxMutedState] = useState<boolean>(() => isSfxMuted());
  const overlayRef = useRef<QuestOverlay>(null);
  overlayRef.current = overlay;
  const shownSplash = useRef<Set<string>>(new Set());
  const visitedSlides = useRef<Set<number>>(new Set());
  const blockStats = useRef<Record<string, { correct: number; total: number; xp: number }>>({});
  const streakRef = useRef(0);
  const popId = useRef(0);
  const blockRef = useRef<string>('');
  blockRef.current = slide?.block ?? '';
  const nextRef = useRef<() => void>();
  const finishedLevelRef = useRef(false);

  const questLevels = useMemo(
    () => BLOCKS.map((b) => ({ id: b.id as string, level: resolveQuestLevel(b.id, lesson?.levels) })),
    [lesson?.levels],
  );
  const levelIndex = slide ? Math.max(0, BLOCKS.findIndex((b) => b.id === slide.block)) : 0;
  const currentLevel = questLevels[levelIndex]?.level ?? resolveQuestLevel('warmup');

  const addPop = (text: string, tone: XpPopItem['tone']) => {
    const id = ++popId.current;
    setPops((p) => [...p.slice(-2), { id, text, tone }]);
    window.setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 1100);
  };

  const handleAnswer = (e: AnswerEvent) => {
    const st = (blockStats.current[blockRef.current] ||= { correct: 0, total: 0, xp: 0 });
    st.total += 1;
    if (e.isCorrect) {
      st.correct += 1;
      const n = streakRef.current + 1;
      streakRef.current = n;
      setStreak(n);
      const gain = n >= 3 ? 15 : 10;
      st.xp += gain;
      setXp((x) => x + gain);
      addPop(n >= 3 ? `🔥 x${n}  +${gain} XP` : `+${gain} XP`, n >= 3 ? 'streak' : 'good');
      sfx.correct();
    } else {
      streakRef.current = 0;
      setStreak(0);
      addPop('Nice try — keep going!', 'soft');
      sfx.wrong();
    }
  };

  // First visit to a slide = +5 XP (silently); first visit to a block = level intro splash.
  useEffect(() => {
    if (!slide) return;
    setMaxReached((m) => (i > m ? i : m));
    if (!visitedSlides.current.has(i)) {
      visitedSlides.current.add(i);
      setXp((x) => x + 5);
    }
    if (!shownSplash.current.has(slide.block) && !overlayRef.current) {
      shownSplash.current.add(slide.block);
      setOverlay({ kind: 'splash', block: slide.block as Block });
      sfx.go();
    }
    if (i !== slides.length - 1) finishedLevelRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, lesson?.id]);

  const toggleMute = () => {
    const next = !sfxMuted;
    setSfxMuted(next);
    setSfxMutedState(next);
    if (!next) sfx.tap();
  };

  // Persist the current slide so a refresh/back-nav resumes where the
  // student left off, mirroring PlayUnitLesson.tsx's sessionStorage pattern.
  useEffect(() => {
    if (!lessonId || !slides.length) return;
    sessionStorage.setItem(`${SESSION_KEY_PREFIX}${lessonId}`, String(i));
    saveResume(lessonId, { i, xp, max: Math.max(maxReached, i) });
  }, [lessonId, i, slides.length, xp, maxReached]);

  // Preload the next two slides' pictures (and every level backdrop) so scenes never pop in blank; a picture
  // that fails to load is remembered so the player falls back to the level gradient instead of a broken image.
  useEffect(() => {
    if (!lesson) return;
    const urls = new Set<string>();
    for (const k of [i, i + 1, i + 2]) extractImageUrls(lesson.slides[k]).forEach((u) => urls.add(u));
    Object.values(lesson.blockImages ?? {}).forEach((u) => u && urls.add(u));
    urls.forEach((u) => {
      if (preloaded.current.has(u)) return;
      preloaded.current.add(u);
      const img = new Image();
      img.onerror = () => setBadImages((prev) => (prev.has(u) ? prev : new Set(prev).add(u)));
      img.src = u;
    });
  }, [i, lesson]);

  // Award coins the first time the student visits each block this session —
  // same idempotent-via-DB-unique-index pattern as AcademyDemo.tsx, but
  // scoped to the real lesson id instead of the 'academy-demo' placeholder.
  useEffect(() => {
    if (!user?.id || !lesson?.id || !slide) return;
    const blockKey = `${slide.block}`;
    if (creditedBlocks.current.has(blockKey)) return;
    creditedBlocks.current.add(blockKey);
    awardAcademyCoins({
      studentId: user.id,
      lessonId: lesson.id,
      blockId: `${lesson.id}:${blockKey}`,
      amount: ACADEMY_COINS_PER_BLOCK,
      reason: 'lesson_block_complete',
    });
  }, [slide, user?.id, lesson?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!slides.length || overlayRef.current) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return; // never steal arrow keys while typing
      if (e.key === 'ArrowRight') nextRef.current?.();
      if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slides.length]);

  const blockLabel = useMemo(() => BLOCKS.find((b) => b.id === slide?.block)?.label ?? '', [slide]);
  const coinsEarned = creditedBlocks.current.size * ACADEMY_COINS_PER_BLOCK;
  const cssScene = slide ? BLOCK_SCENES[slide.block] : BLOCK_SCENES.warmup;
  // A real illustrated background for this lesson's block wins over the CSS
  // gradient fallback — see LessonRow.blockImages' own comment.
  const realSceneImage = slide ? lesson?.blockImages?.[slide.block] : undefined;
  // Playground's PlayUnitLesson.tsx drives its ENTIRE page background from a
  // single per-scene `scene.bg` — one real image, cover-fit on the page root,
  // with the scene's own content floating directly on top (no separate
  // bounded/aspect-locked image card nested inside). Mirrored here: a slide
  // that carries its own real art (scene_dialogue's bg_image_url, a
  // canvas_game's background_image) wins as the page background over the
  // block-level image/gradient, so that art fills the actual viewport
  // instead of sitting boxed inside the content area.
  // role_play deliberately excluded here: which texting partner's art
  // applies depends on in-component character-select state the page-level
  // background logic can't see (the slide carries an array of characters,
  // each with its own bg_image_url, not one top-level image) -- the
  // component paints its own background internally instead.
  const slideOwnImage =
    slide?.type === 'scene_dialogue' || slide?.type === 'conversation_fill' || slide?.type === 'number_chart' || slide?.type === 'number_quiz_game' || slide?.type === 'story_page' || slide?.type === 'letter_sound_game' || slide?.type === 'word_blend' || slide?.type === 'picture_match_game' || slide?.type === 'say_it_game' || slide?.type === 'sound_challenge_game' || slide?.type === 'find_in_scene_game'
      ? slide.bg_image_url
      : slide?.type === 'canvas_game' || slide?.type === 'living_canvas'
        ? (slide as any).background_image
        : undefined;
  const pageBgImage = [slideOwnImage, realSceneImage].find((u) => !!u && !badImages.has(u as string)) as string | undefined;
  // scene_dialogue, conversation_fill, number_chart, number_quiz_game,
  // role_play, canvas_game/living_canvas, and intro all render their own
  // complete, self-contained visual already (a full scene, a game board,
  // or a branded cover card) — wrapping any of them in the speech-bubble
  // panel below just double-boxes them. Confirmed live: the intro slide's
  // own cover card (EnglEuphoria badge, level pill, gradient) was
  // rendering nested inside the white bubble until this was added.
  // number_chart, number_quiz_game, and role_play get the same fullBleed
  // treatment even on lessons where they carry no bg_image_url of their
  // own — the point is the bigger centered card, not just the background
  // photo.
  const isFullBleedSlideType =
    slide?.type === 'scene_dialogue' ||
    slide?.type === 'conversation_fill' ||
    slide?.type === 'role_play' ||
    slide?.type === 'number_chart' ||
    slide?.type === 'number_quiz_game' ||
    slide?.type === 'letter_sound_game' ||
    slide?.type === 'word_blend' ||
    slide?.type === 'picture_match_game' ||
    slide?.type === 'say_it_game' ||
    slide?.type === 'sound_challenge_game' ||
    slide?.type === 'find_in_scene_game' ||
    slide?.type === 'story_page' ||
    slide?.type === 'escape_room_slot' ||
    slide?.type === 'expedition_game' ||
    slide?.type === 'name_tag_studio' ||
    slide?.type === 'gate_guard' ||
    slide?.type === 'reply_quest' ||
    slide?.type === 'hidden_object_slot' ||
    slide?.type === 'detective_mystery_slot' ||
    slide?.type === 'story_engine_slot' ||
    slide?.type === 'canvas_game' ||
    slide?.type === 'living_canvas' ||
    slide?.type === 'vocab' ||
    slide?.type === 'reading_passage' ||
    slide?.type === 'cluster' ||
    slide?.type === 'grammar_pattern' ||
    slide?.type === 'intro' ||
    // Global rule: any slide carrying its own image_url gets the full
    // absolute-inset-0 area instead of the small bounded speech-bubble card,
    // regardless of type -- SlideRenderer's generic FullBleedSplitPanel wrap
    // (AcademyDemo.tsx) handles painting it for every type not already
    // listed above, so this list never needs a new type added by hand again.
    !!(slide as any)?.image_url;

  const persistCompletion = async () => {
    if (!user?.id || !lesson?.id) return;
    setSaving(true);
    try {
      const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      // Same shape as LessonPlayerContainer.tsx's claimRewards() — one
      // canonical completion record regardless of which player produced it.
      const { error: progressErr } = await supabase.from('student_lesson_progress').upsert(
        {
          user_id: user.id,
          lesson_id: lesson.id,
          status: 'completed',
          score: 100,
          time_spent_seconds: timeSpentSeconds,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: 'user_id,lesson_id' } as any,
      );
      if (progressErr) console.error('[PlayAcademyLesson] student_lesson_progress upsert failed:', progressErr);

      // Same assignment-completion write LessonReaderPage.tsx's onComplete
      // already does for the old player — keeps assignment-status tracking
      // working identically regardless of which player finished the lesson.
      const { error: assignErr } = await supabase
        .from('student_assignments')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('lesson_id', lesson.id)
        .eq('student_id', user.id);
      if (assignErr) console.error('[PlayAcademyLesson] student_assignments update failed:', assignErr);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (!slides.length || overlayRef.current) return;
    const isLast = i === slides.length - 1;
    const nextSlide = slides[i + 1];
    if (isLast && !finishedLevelRef.current) {
      finishedLevelRef.current = true;
      sfx.levelUp();
      setOverlay({ kind: 'cleared', block: slide.block as Block, nextIndex: -1 });
      return;
    }
    if (!isLast && nextSlide && nextSlide.block !== slide.block) {
      sfx.levelUp();
      setOverlay({ kind: 'cleared', block: slide.block as Block, nextIndex: i + 1 });
      return;
    }
    if (isLast) {
      void persistCompletion();
      setCompleteOpen(true);
      return;
    }
    setI((n) => Math.min(slides.length - 1, n + 1));
  };
  nextRef.current = handleNext;

  // Wrap a rendered slide so ONE broken slide can never take the whole lesson down.
  const guarded = (node: React.ReactNode) => (
    <SlideErrorBoundary resetKey={i} slide={slide} canSkip={i < slides.length - 1} onSkip={() => nextRef.current?.()}>
      <RenderGuard resetKey={i} slide={slide} canSkip={i < slides.length - 1} onSkip={() => nextRef.current?.()}>
        {node}
      </RenderGuard>
    </SlideErrorBoundary>
  );

  const closeSplash = () => setOverlay(null);
  const closeCleared = () => {
    const o = overlayRef.current;
    setOverlay(null);
    if (!o || o.kind !== 'cleared') return;
    if (o.nextIndex === -1) {
      void persistCompletion();
      setCompleteOpen(true);
    } else {
      setI(o.nextIndex);
    }
  };

  const handleCompleteClose = () => {
    setCompleteOpen(false);
    if (lessonId) {
      sessionStorage.removeItem(`${SESSION_KEY_PREFIX}${lessonId}`);
      clearResume(lessonId);
    }
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div dir="ltr" className="min-h-dvh flex items-center justify-center bg-[#0B0F1A] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (loadError || !lesson || !slide) {
    return (
      <div dir="ltr" className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-[#0B0F1A] text-white px-6 text-center">
        <p className="text-lg font-semibold">{loadError || 'This lesson could not be loaded.'}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="min-h-[44px] rounded-md bg-emerald-600 px-5 text-sm font-semibold hover:bg-emerald-500"
          >
            Try again
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="min-h-[44px] rounded-md bg-indigo-600 px-5 text-sm font-medium hover:bg-indigo-500"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <AcademyHubProvider>
      <Helmet>
        <title>{lesson.title} · Academy</title>
      </Helmet>

      {/* Academy content is authored English-only and this layout (prev/next
          nav, progress dots, floating chrome) assumes LTR — dir defaults to
          whatever LocaleContext/i18n set on <html> for the signed-in user's
          locale (e.g. rtl for an Arabic-locale account), which without this
          override mirrors everything: the title's bidi reorders ("Who Am I?"
          renders as "?Who Am I"), Next/Previous swap sides, and "1 / 32"
          renders as "32 / 1". AcademyLibraryPage.tsx already needed this
          exact same guard for the same reason. */}
      {/* Structure mirrors Playground's PlayUnitLesson.tsx one-for-one: the
          current slide's own real art (or the block's) is the PAGE
          background itself — cover-fit, edge-to-edge — with all chrome and
          content floating directly on top of it. Not a separate bounded
          image card nested inside a content area (that's what produced the
          letterboxed/boxed-in look this replaces). */}
      <div
        dir="ltr"
        className="ag-root relative h-dvh w-full overflow-hidden font-sans transition-[background-image] duration-500"
        data-hub="academy"
        style={
          pageBgImage
            ? { backgroundImage: `url(${pageBgImage})`, backgroundSize: 'cover', backgroundPosition: (slideOwnImage && (slide as any)?.bg_position) || 'center', backgroundRepeat: 'no-repeat' }
            : { background: cssScene.background }
        }
      >
        {/* Starline skin: the scene art is the page; a cool indigo wash (no cards) keeps the HUD and any text readable. */}
        {pageBgImage ? (
          <>
            {/* Only a light top wash for the HUD and a gentle edge vignette: the art stays vivid. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#070a24]/60 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_62%,rgba(7,10,36,0.38)_100%)]" />
          </>
        ) : (
          <div className="pointer-events-none absolute inset-0 opacity-[0.35]" style={{ backgroundImage: cssScene.motif, backgroundSize: '26px 26px' }} />
        )}

        <div className="relative z-10 flex h-full w-full flex-col pt-3">
          {/* HUD: bare — logo, quest trail + XP, wallet. */}
          <header className="relative flex items-center justify-between gap-3 px-4 pb-1 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <img src="/favicon.png?v=10" alt="EnglEuphoria" className="h-9 w-9 shrink-0 rounded-full object-contain drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
              <div className="hidden min-w-0 2xl:block">
                <div className="ag-title truncate text-sm">{lesson.title}</div>
                <div className="ag-chip !text-[11px]">{blockLabel}</div>
              </div>
            </div>
            <QuestHud
              levels={questLevels}
              currentIndex={levelIndex}
              progress={slides.length > 1 ? i / (slides.length - 1) : 0}
              xp={xp}
              streak={streak}
              muted={sfxMuted}
              onToggleMute={toggleMute}
            />
            <div className="flex shrink-0 items-center gap-2">
              <CoinBalance />
              <ProfileAvatar size="sm" />
            </div>
          </header>

          {/* Scene content. Full-bleed slides (story, dialogue, games) draw straight over their own art. Everything else
              is BARE: text and game buttons sit directly on the picture, carried by a soft bottom scrim — no card. */}
          <main className="relative flex-1 min-h-0">
            <AnimatePresence mode="wait">
              {isFullBleedSlideType ? (
                <motion.div
                  key={i}
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  {['reading_passage', 'grammar_pattern', 'cluster', 'vocab'].includes(String(slide.type)) && !(slide as any).image_url ? (
                    <div className="ag-scrim-soft mx-2 max-h-full w-full max-w-4xl overflow-y-auto px-14 py-10 md:px-16">
                      {guarded(<SlideRenderer slide={slide} t={themeMap.game} fullBleed={false} onAnswer={handleAnswer} />)}
                    </div>
                  ) : (
                    guarded(<SlideRenderer slide={slide} t={t} fullBleed={slide.type !== 'intro'} onAnswer={handleAnswer} />)
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={i}
                  className="absolute inset-0 flex items-center justify-center px-3 pb-20 pt-1 md:px-8"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Centred between the HUD and the Back/Next bar; a soft radial glow (not a card) carries the text. */}
                  <div className="ag-scrim-soft flex max-h-full w-full max-w-4xl flex-col px-14 py-10 md:px-16">
                    <span className="ag-chip mb-3"><span aria-hidden>{currentLevel.emoji}</span> {currentLevel.title}</span>
                    <div className="min-h-0 overflow-y-auto pr-1">
                      {guarded(<SlideRenderer slide={slide} t={themeMap.game} onAnswer={handleAnswer} />)}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        {/* Fixed bottom controls — angular game buttons, independent of scene height. */}
        <div className="fixed inset-x-0 bottom-4 z-[80] flex items-center justify-between gap-3 px-4 md:px-8">
          <button
            onClick={() => setI((n) => Math.max(0, n - 1))}
            disabled={i === 0}
            className="ag-btn ag-btn--ghost !min-h-[46px] !px-5 text-sm"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button
            onClick={() => setNavOpen(true)}
            aria-label={`Slide ${i + 1} of ${slides.length}. Open the lesson map`}
            className="ag-title min-h-[44px] px-3 py-2 text-sm tabular-nums"
          >
            {i + 1} / {slides.length} <span aria-hidden className="ml-1 opacity-70">▾</span>
          </button>
          <button
            onClick={handleNext}
            disabled={saving}
            className="ag-btn !min-h-[48px] !px-6 text-sm"
          >
            {i === slides.length - 1 ? (saving ? 'Saving…' : 'Finish') : 'Next'} <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <OfflineChip />
        <SlideNavigator
          open={navOpen}
          onClose={() => setNavOpen(false)}
          slides={slides}
          current={i}
          maxReached={maxReached}
          unlockAll={isTeacher}
          levelFor={(block) => {
            const idx = BLOCKS.findIndex((b) => b.id === block);
            return { index: idx, level: resolveQuestLevel((idx === -1 ? 'warmup' : block) as Block, lesson?.levels) };
          }}
          onJump={(idx) => { setI(idx); }}
        />
        <XpPops pops={pops} />
        <AnimatePresence>
          {overlay?.kind === 'splash' && (
            <LevelSplash
              key={`splash-${overlay.block}`}
              index={Math.max(0, BLOCKS.findIndex((b) => b.id === overlay.block))}
              total={BLOCKS.length}
              level={resolveQuestLevel(overlay.block, lesson?.levels)}
              accent={cssScene.accent}
              onGo={closeSplash}
            />
          )}
          {overlay?.kind === 'cleared' && (() => {
            const st = blockStats.current[overlay.block];
            const ratio = st && st.total > 0 ? st.correct / st.total : 1;
            const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
            return (
              <LevelCleared
                key={`cleared-${overlay.block}`}
                level={resolveQuestLevel(overlay.block, lesson?.levels)}
                stars={stars}
                coins={ACADEMY_COINS_PER_BLOCK}
                xp={(st?.xp ?? 0) + 25}
                isLast={overlay.nextIndex === -1}
                onNext={closeCleared}
              />
            );
          })()}
        </AnimatePresence>

        <AcademyLessonCompleteModal
          open={completeOpen}
          onClose={handleCompleteClose}
          xpGained={slides.length * 5}
          coinsEarned={coinsEarned}
        />
      </div>
    </AcademyHubProvider>
  );
}
