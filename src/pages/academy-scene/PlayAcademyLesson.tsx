import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sun, Moon, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  SlideRenderer,
  ProgressBar,
  themeMap,
  BLOCKS,
  type Slide,
  type Theme,
} from '@/pages/AcademyDemo';
import { AcademyHubProvider } from '@/components/academy/HubGuard';
import ProfileAvatar from '@/components/academy/ProfileAvatar';
import CoinBalance from '@/components/academy/CoinBalance';
import AcademyLessonCompleteModal from '@/components/academy/AcademyLessonCompleteModal';
import { awardAcademyCoins, ACADEMY_COINS_PER_BLOCK } from '@/lib/academy/coins';
import { staticContextForSlide, FocusPanel } from '@/components/academy/splitSlide';

/**
 * The new, canonical Academy lesson player (Phase 1 of the "new Academy
 * engine" rebuild). This is a real-lesson-data adaptation of AcademyDemo.tsx's
 * own page component — that file already renders the exact schema
 * generate-ppp-slides produces correctly (SlideRenderer/themeMap/BLOCKS,
 * imported straight from there rather than duplicated, so there is exactly
 * one canonical renderer for this schema, not two). What AcademyDemo.tsx
 * doesn't do is fetch a real curriculum_lessons row or persist real
 * completion — that's what this component adds.
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
      <div className={`min-h-dvh ${t.bg} ${t.text} font-sans flex flex-col`} data-hub="academy">
        {theme === 'dark' && (
          <div
            className="pointer-events-none fixed inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(at 20% 10%, rgba(99,102,241,0.25), transparent 50%), radial-gradient(at 80% 90%, rgba(168,85,247,0.18), transparent 50%)',
            }}
          />
        )}

        <header className="relative z-10 border-b border-slate-800/60 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 shrink-0 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{lesson.title}</div>
                  <div className={`text-xs ${t.muted}`}>Academy</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <CoinBalance />
                <ProfileAvatar size="sm" />
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={`p-2 rounded-md ${t.btnGhost}`}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <ProgressBar currentBlock={slide.block} slideIndex={i} t={t} slides={slides} />
          </div>
        </header>

        <main className="relative z-10 flex-1">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`static-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {staticContextForSlide(slide) ?? (
                    <FocusPanel
                      lessonTitle={lesson.title}
                      blockLabel={blockLabel}
                      block={slide.block}
                      slideIndex={i}
                      totalSlides={slides.length}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </aside>

            <section>
              <AnimatePresence mode="wait">
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className={`w-full rounded-xl border ${t.card} px-6 py-8 md:px-8 md:py-10 min-h-[420px] flex items-center justify-center`}
                >
                  <SlideRenderer slide={slide} t={t} />
                </motion.div>
              </AnimatePresence>
            </section>
          </div>
        </main>

        <footer className="relative z-10 border-t border-slate-800/60 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setI((n) => Math.max(0, n - 1))}
              disabled={i === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-30 ${t.btnGhost}`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <div className={`text-sm ${t.muted}`}>
              <span className="font-semibold text-indigo-400">{blockLabel}</span>
              <span className="mx-2">·</span>
              <span>
                {i + 1} / {slides.length}
              </span>
            </div>
            <button
              onClick={handleNext}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white"
            >
              {i === slides.length - 1 ? (saving ? 'Saving…' : 'Finish') : 'Next'} <ChevronRight className="w-4 h-4" />
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
