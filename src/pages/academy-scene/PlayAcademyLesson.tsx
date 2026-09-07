import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sun, Moon, Loader2 } from 'lucide-react';
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
} from '@/pages/AcademyDemo';
import { AcademyHubProvider } from '@/components/academy/HubGuard';
import ProfileAvatar from '@/components/academy/ProfileAvatar';
import CoinBalance from '@/components/academy/CoinBalance';
import AcademyLessonCompleteModal from '@/components/academy/AcademyLessonCompleteModal';
import { awardAcademyCoins, ACADEMY_COINS_PER_BLOCK } from '@/lib/academy/coins';

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
}

const SESSION_KEY_PREFIX = 'academy-scene-idx:';

// One full-bleed "scene" per pedagogical block — layered radial glows over a
// dark base, each with its own accent hue and a distinct decorative motif so
// the lesson visibly moves through a place, the way Playground's varied
// scene backgrounds do, even though these are generated, not painted.
const BLOCK_SCENES: Record<Block, { background: string; motif: string; accent: string }> = {
  warmup: {
    background:
      'radial-gradient(ellipse 900px 700px at 15% 0%, rgba(129,140,248,0.35), transparent 60%), ' +
      'radial-gradient(ellipse 800px 800px at 90% 100%, rgba(217,70,239,0.22), transparent 60%), ' +
      'linear-gradient(160deg, #171335 0%, #100e28 55%, #0b0a1f 100%)',
    motif: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1.5px)',
    accent: '#a5b4fc',
  },
  vocab: {
    background:
      'radial-gradient(ellipse 850px 650px at 85% 5%, rgba(192,132,252,0.32), transparent 60%), ' +
      'radial-gradient(ellipse 700px 900px at 5% 95%, rgba(129,140,248,0.24), transparent 60%), ' +
      'linear-gradient(160deg, #1d1440 0%, #140f30 55%, #0b0a1f 100%)',
    motif: 'radial-gradient(circle, rgba(216,180,254,0.55) 1.5px, transparent 2px)',
    accent: '#d8b4fe',
  },
  reading: {
    background:
      'radial-gradient(ellipse 900px 700px at 10% 100%, rgba(96,165,250,0.26), transparent 60%), ' +
      'radial-gradient(ellipse 750px 600px at 95% 0%, rgba(129,140,248,0.24), transparent 60%), ' +
      'linear-gradient(160deg, #101a3a 0%, #0e1330 55%, #0b0a1f 100%)',
    motif:
      'repeating-linear-gradient(0deg, rgba(147,197,253,0.06) 0px, rgba(147,197,253,0.06) 1px, transparent 1px, transparent 28px)',
    accent: '#93c5fd',
  },
  grammar: {
    background:
      'radial-gradient(ellipse 850px 700px at 90% 90%, rgba(45,212,191,0.22), transparent 60%), ' +
      'radial-gradient(ellipse 800px 650px at 5% 10%, rgba(99,102,241,0.28), transparent 60%), ' +
      'linear-gradient(160deg, #12213a 0%, #101430 55%, #0b0a1f 100%)',
    motif:
      'linear-gradient(rgba(94,234,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(94,234,212,0.08) 1px, transparent 1px)',
    accent: '#5eead4',
  },
  practice: {
    background:
      'radial-gradient(ellipse 900px 700px at 20% 100%, rgba(52,211,153,0.24), transparent 60%), ' +
      'radial-gradient(ellipse 750px 700px at 85% 10%, rgba(99,102,241,0.24), transparent 60%), ' +
      'linear-gradient(160deg, #10231f 0%, #10182e 55%, #0b0a1f 100%)',
    motif: 'radial-gradient(circle at 50% 50%, transparent 24%, rgba(110,231,183,0.12) 25%, transparent 26%)',
    accent: '#6ee7b7',
  },
  interactive: {
    background:
      'radial-gradient(ellipse 900px 700px at 95% 100%, rgba(244,114,182,0.28), transparent 60%), ' +
      'radial-gradient(ellipse 750px 650px at 5% 0%, rgba(168,85,247,0.28), transparent 60%), ' +
      'linear-gradient(160deg, #29103a 0%, #1a0f30 55%, #0b0a1f 100%)',
    motif:
      'repeating-linear-gradient(115deg, rgba(244,114,182,0.07) 0px, rgba(244,114,182,0.07) 2px, transparent 2px, transparent 26px)',
    accent: '#f9a8d4',
  },
  speaking: {
    background:
      'radial-gradient(ellipse 900px 800px at 50% 100%, rgba(45,212,191,0.26), transparent 65%), ' +
      'radial-gradient(ellipse 700px 700px at 15% 0%, rgba(129,140,248,0.24), transparent 60%), ' +
      'linear-gradient(160deg, #10231f 0%, #101430 55%, #0b0a1f 100%)',
    motif: 'radial-gradient(circle at 50% 100%, rgba(94,234,212,0.18), transparent 55%)',
    accent: '#99f6e4',
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

  const [theme, setTheme] = useState<Theme>('dark');
  const [i, setI] = useState(0);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const creditedBlocks = useRef<Set<string>>(new Set());
  const startTimeRef = useRef<number>(Date.now());

  const t = themeMap[theme];

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
          setLesson({
            id: data.id,
            title: data.title,
            slides: slides as Slide[],
            blockImages: (data?.content as any)?.blockImages ?? undefined,
          });
          const saved = sessionStorage.getItem(`${SESSION_KEY_PREFIX}${lessonId}`);
          const savedIdx = saved ? parseInt(saved, 10) : 0;
          setI(Number.isFinite(savedIdx) ? Math.min(Math.max(savedIdx, 0), slides.length - 1) : 0);
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
  }, [lessonId]);

  const slides = lesson?.slides ?? [];
  const slide = slides[i];

  // Persist the current slide so a refresh/back-nav resumes where the
  // student left off, mirroring PlayUnitLesson.tsx's sessionStorage pattern.
  useEffect(() => {
    if (!lessonId || !slides.length) return;
    sessionStorage.setItem(`${SESSION_KEY_PREFIX}${lessonId}`, String(i));
  }, [lessonId, i, slides.length]);

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
      if (!slides.length) return;
      if (e.key === 'ArrowRight') setI((n) => Math.min(slides.length - 1, n + 1));
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
  const slideOwnImage =
    slide?.type === 'scene_dialogue' || slide?.type === 'conversation_fill' || slide?.type === 'number_chart'
      ? slide.bg_image_url
      : slide?.type === 'canvas_game' || slide?.type === 'living_canvas'
        ? (slide as any).background_image
        : undefined;
  const pageBgImage = slideOwnImage || realSceneImage;
  // scene_dialogue, conversation_fill, number_chart, canvas_game/
  // living_canvas, and intro all render their own complete, self-contained
  // visual already (a full scene, a game board, or a branded cover card) —
  // wrapping any of them in the speech-bubble panel below just double-boxes
  // them. Confirmed live: the intro slide's own cover card (EnglEuphoria
  // badge, level pill, gradient) was rendering nested inside the white
  // bubble until this was added. number_chart gets the same fullBleed
  // treatment even on lessons where it carries no bg_image_url of its own —
  // the point is the bigger centered card, not just the background photo.
  const isFullBleedSlideType =
    slide?.type === 'scene_dialogue' ||
    slide?.type === 'conversation_fill' ||
    slide?.type === 'number_chart' ||
    slide?.type === 'canvas_game' ||
    slide?.type === 'living_canvas' ||
    slide?.type === 'intro';

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
    if (!slides.length) return;
    if (i === slides.length - 1) {
      void persistCompletion();
      setCompleteOpen(true);
      return;
    }
    setI((n) => Math.min(slides.length - 1, n + 1));
  };

  const handleCompleteClose = () => {
    setCompleteOpen(false);
    if (lessonId) sessionStorage.removeItem(`${SESSION_KEY_PREFIX}${lessonId}`);
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
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-sm font-medium"
        >
          Back to dashboard
        </button>
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
        className="relative h-dvh w-full overflow-hidden text-white font-sans transition-[background-image] duration-500"
        data-hub="academy"
        style={
          pageBgImage
            ? { backgroundImage: `url(${pageBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
            : { background: cssScene.background }
        }
      >
        {pageBgImage ? (
          <>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.35)_100%)]" />
          </>
        ) : (
          <div className="pointer-events-none absolute inset-0 opacity-[0.35]" style={{ backgroundImage: cssScene.motif, backgroundSize: '26px 26px' }} />
        )}

        <div className="relative z-10 flex h-full w-full flex-col px-0 pb-4 pt-4">
          {/* Top chrome — lesson chip, block label, minimal controls. */}
          <header className="flex items-center justify-between gap-4 px-4 md:px-8">
            <div className="flex min-w-0 items-center gap-3 rounded-full bg-black/30 py-1.5 pl-1.5 pr-4 backdrop-blur-md ring-1 ring-white/10">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold">
                A
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold leading-tight">{lesson.title}</div>
                <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: cssScene.accent }}>
                  {blockLabel}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-full bg-black/30 px-2 py-1.5 backdrop-blur-md ring-1 ring-white/10">
              <CoinBalance />
              <ProfileAvatar size="sm" />
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </header>

          {/* Scene content — grows to fill the space between the top bar and
              the progress dots, exactly like Playground's flex-1 scene slot.
              scene_dialogue/canvas_game/living_canvas render edge-to-edge
              inside it (their art is already the page background above, so
              they're purely the interactive layer here); everything else is
              a real speech bubble anchored over the scene, not a boxed
              content card. Bubble content always renders in the LIGHT theme
              regardless of the page's dark/light toggle, since a white
              bubble needs dark text (themeMap.light) independent of what the
              toggle does to the surrounding chrome. */}
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
                  <SlideRenderer slide={slide} t={t} fullBleed={slide.type !== 'intro'} />
                </motion.div>
              ) : (
                <motion.div
                  key={i}
                  className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-xl px-4 md:px-8"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <span
                    className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-widest shadow"
                    style={{ color: cssScene.accent }}
                  >
                    🗣 Ava
                  </span>
                  <div className="relative max-h-[50vh] overflow-y-auto rounded-2xl bg-white px-5 py-4 shadow-2xl md:px-7 md:py-6">
                    <SlideRenderer slide={slide} t={themeMap.light} />
                  </div>
                  {/* Speech-bubble tail, pointing down toward the "speaker". */}
                  <div
                    className="absolute bottom-[calc(100%-1.5rem)] left-8 h-5 w-5 rotate-45 bg-white"
                    style={{ boxShadow: '2px 2px 2px rgba(0,0,0,0.04)' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Progress dots — one per slide, sitting just above the fixed nav
              bar, the same position Playground's dot row holds. */}
          <div className="mt-3 flex flex-wrap justify-center gap-1.5 px-4 pb-16">
            {slides.map((s, idx) => (
              <span
                key={s.id ?? idx}
                className="h-2 rounded-full shadow transition-all"
                style={{
                  width: idx === i ? '2rem' : '0.5rem',
                  background: idx <= i ? cssScene.accent : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Fixed bottom nav — same fixed-to-viewport placement as
            Playground's Back/counter/Next bar, independent of scene content
            height. */}
        <div className="fixed inset-x-0 bottom-4 z-[80] flex items-center justify-between gap-3 px-4 md:px-8">
          <button
            onClick={() => setI((n) => Math.max(0, n - 1))}
            disabled={i === 0}
            className="flex items-center gap-1.5 rounded-full bg-white/90 px-5 py-3 text-sm font-bold text-slate-800 shadow-xl backdrop-blur transition hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-extrabold text-slate-800 shadow-xl backdrop-blur tabular-nums">
            {i + 1} / {slides.length}
          </div>
          <button
            onClick={handleNext}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-full px-5 py-3 text-sm font-bold text-[#0B0A1F] shadow-xl backdrop-blur transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            style={{ background: cssScene.accent }}
          >
            {i === slides.length - 1 ? (saving ? 'Saving…' : 'Finish') : 'Next'} <ChevronRight className="h-4 w-4" />
          </button>
        </div>

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
