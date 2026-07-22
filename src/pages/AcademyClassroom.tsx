import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize, Minimize, Volume2, Mic, ArrowLeft } from 'lucide-react';
import {
  SlideRenderer,
  ProgressBar,
  themeMap,
  BLOCKS,
  type Slide,
  type Theme,
} from './AcademyDemo';
import { useAcademyAudio } from '@/hooks/useAcademyAudio';
import { SOCIAL_MEDIA_LESSON } from '@/data/academyLessons/socialMediaHabits';
import AcademyWorkspace from '@/components/academy/AcademyWorkspace';
import { staticContextForSlide, FocusPanel } from '@/components/academy/splitSlide';

function getVoiceText(slide: Slide): string | null {
  if (slide.type === 'reading_passage') return slide.passage;
  if (slide.type === 'listening') return slide.transcript;
  if (slide.type === 'vocab')
    return `${slide.word}. ${slide.definition}.${slide.example ? ' For example. ' + slide.example : ''}`;
  return null;
}

const isSpeakingBlock = (s: Slide) =>
  s.block === 'speaking' || s.type === 'speaking_task' || s.type === 'role_play';

export default function AcademyClassroom() {
  const navigate = useNavigate();
  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate('/'));

  const deck = useMemo<Slide[]>(() => {
    const custom = (window as any).__ACADEMY_DECK__;
    if (Array.isArray(custom) && custom.length > 0) return custom as Slide[];
    return SOCIAL_MEDIA_LESSON.slides;
  }, []);

  const [i, setI] = useState(0);
  const [theme] = useState<Theme>('dark');
  const [isFs, setIsFs] = useState(false);
  const t = themeMap[theme];
  const slide = deck[i];
  const { playVoice, isPlaying, isLoading } = useAcademyAudio();

  const voiceText = getVoiceText(slide);
  const showSpeak = isSpeakingBlock(slide);
  const blockLabel = BLOCKS.find((b) => b.id === slide.block)?.label ?? '';

  const next = () => setI((n) => Math.min(deck.length - 1, n + 1));
  const prev = () => setI((n) => Math.max(0, n - 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key.toLowerCase() === 'f') toggleFs();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFs = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const staticContent = staticContextForSlide(slide) ?? (
    <FocusPanel
      lessonTitle={SOCIAL_MEDIA_LESSON.title}
      blockLabel={blockLabel}
      block={slide.block}
      slideIndex={i}
      totalSlides={deck.length}
    />
  );

  return (
    <AcademyWorkspace
      variant="classroom"
      title="ENGLEUPHORIA · ACADEMY"
      subtitle={`${SOCIAL_MEDIA_LESSON.title} · ${SOCIAL_MEDIA_LESSON.level}`}
      xpSlot={
        <span className="text-xs font-mono text-muted-foreground">
          {i + 1} / {deck.length}
        </span>
      }
      topBarSlot={
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="flex items-center gap-1 rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-300 transition hover:border-indigo-500"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <div className="flex-1">
            <ProgressBar currentBlock={slide.block} slideIndex={i} t={t} slides={deck} />
          </div>
          <button
            onClick={toggleFs}
            className="rounded-md border border-slate-700 p-1.5 transition hover:border-indigo-500"
            aria-label="Fullscreen"
          >
            {isFs ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
          </button>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={prev}
            disabled={i === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-2.5 transition hover:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <div className="flex items-center gap-2">
            {voiceText && (
              <button
                onClick={() => playVoice(voiceText)}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500"
              >
                <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                {isLoading ? 'Loading…' : 'Listen'}
              </button>
            )}
            {showSpeak && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-purple-700 bg-purple-900/40 px-4 py-2 text-sm font-semibold text-purple-200">
                <Mic className="h-4 w-4" /> Speak
              </div>
            )}
          </div>
          <button
            onClick={next}
            disabled={i === deck.length - 1}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      }
    >
      <AcademyWorkspace.Static>
        <AnimatePresence mode="wait">
          <motion.div
            key={`static-${i}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {staticContent}
          </motion.div>
        </AnimatePresence>
      </AcademyWorkspace.Static>

      <AcademyWorkspace.Interactive>
        <AnimatePresence mode="wait">
          <motion.div
            key={`interactive-${i}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={`w-full rounded-2xl border ${t.card} p-6 shadow-xl shadow-indigo-950/30 md:p-8`}
          >
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-400">
              {blockLabel}
            </div>
            <SlideRenderer slide={slide} t={t} />
          </motion.div>
        </AnimatePresence>
      </AcademyWorkspace.Interactive>
    </AcademyWorkspace>
  );
}
