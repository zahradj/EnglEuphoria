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
 * (unit1/scenes.ts). Academy has no equivalent per-slide art pipeline yet
 * (AcademyCreator's AI generation produces text content, not backgrounds),
 * so each of the 7 pedagogical blocks (warmup/vocab/reading/grammar/
 * practice/interactive/speaking — BLOCKS in AcademyDemo.tsx) gets its own
 * full-bleed CSS gradient "scene" (BLOCK_SCENES below) — a real, distinct,
 * full-viewport backdrop per stage of the lesson, the same role Playground's
 * bg images play, without requiring a bespoke illustration per slide. A
 * `scene_dialogue` slide (which already carries its own bg_image_url) is
 * exempted from the glass-panel treatment and shown edge-to-edge instead,
 * since it's already a real full-bleed scene in its own right.
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
          setLesson({ id: data.id, title: data.title, slides: slides as Slide[] });
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
  const scene = slide ? BLOCK_SCENES[slide.block] : BLOCK_SCENES.warmup;
  const isFullBleedSlideType = slide?.type === 'scene_dialogue';

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
      <div className="min-h-dvh flex items-center justify-center bg-[#0B0F1A] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (loadError || !lesson || !slide) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-[#0B0F1A] text-white px-6 text-center">
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

      <div className="relative h-dvh w-full overflow-hidden text-white font-sans" data-hub="academy">
        {/* Full-bleed scene background, cross-fading per block — the
            Academy equivalent of a Playground scene's `bg` image. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.block}
            className="absolute inset-0"
            style={{ background: scene.background }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 opacity-[0.35]" style={{ backgroundImage: scene.motif, backgroundSize: '26px 26px' }} />
          </motion.div>
        </AnimatePresence>

        {/* Floating top chrome — lesson chip, progress dots, block label, minimal controls. */}
        <header className="absolute inset-x-0 top-0 z-30 px-4 pt-4 md:px-8 md:pt-6">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3 rounded-full bg-black/30 py-1.5 pl-1.5 pr-4 backdrop-blur-md ring-1 ring-white/10">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold">
                A
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold leading-tight">{lesson.title}</div>
                <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: scene.accent }}>
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
          </div>

          {/* Progress dots — one per slide, current block's accent highlights the active run. */}
          <div className="mx-auto mt-3 flex max-w-5xl items-center gap-1 overflow-x-auto pb-1">
            {slides.map((s, idx) => (
              <div
                key={s.id ?? idx}
                className="h-1.5 flex-1 min-w-[6px] rounded-full transition-colors duration-300"
                style={{
                  background:
                    idx < i ? scene.accent : idx === i ? scene.accent : 'rgba(255,255,255,0.15)',
                  opacity: idx <= i ? 1 : 0.5,
                }}
              />
            ))}
          </div>
        </header>

        {/* Scene content. scene_dialogue renders itself edge-to-edge (it's
            already a real full-bleed scene); everything else floats as a
            glass panel over the block's background, mirroring Playground's
            GlassCard-over-bg convention. */}
        <main className="absolute inset-0 z-20 flex items-center justify-center px-4 pt-28 pb-24 md:px-8">
          <AnimatePresence mode="wait">
            {isFullBleedSlideType ? (
              <motion.div
                key={i}
                className="flex h-full w-full max-w-6xl items-center justify-center"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              >
                <SlideRenderer slide={slide} t={t} />
              </motion.div>
            ) : (
              <motion.div
                key={i}
                className="w-full max-w-2xl rounded-3xl bg-[#0B0A1F]/70 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl md:p-10"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <SlideRenderer slide={slide} t={t} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Floating bottom nav. */}
        <footer className="absolute inset-x-0 bottom-0 z-30 px-4 pb-4 md:px-8 md:pb-6">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full bg-black/30 px-3 py-2 backdrop-blur-md ring-1 ring-white/10">
            <button
              onClick={() => setI((n) => Math.max(0, n - 1))}
              disabled={i === 0}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <div className="text-xs font-medium text-white/60">
              {i + 1} / {slides.length}
            </div>
            <button
              onClick={handleNext}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold text-[#0B0A1F] shadow-lg transition disabled:opacity-60"
              style={{ background: scene.accent }}
            >
              {i === slides.length - 1 ? (saving ? 'Saving…' : 'Finish') : 'Next'} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </footer>

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
