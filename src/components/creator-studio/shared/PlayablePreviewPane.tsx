import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, StickyNote } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PreviewMode } from './PreviewModeToggle';
import type { PreviewRole } from './PreviewRoleToggle';
import { HUB_THEME, type Hub } from './hubTheme';
import { GameBackground, type GameBackgroundTheme } from './GameBackground';

interface Props<TSlide> {
  mode: PreviewMode;
  slides: TSlide[];
  startIndex: number;
  renderSlide: (slide: TSlide, index: number) => ReactNode;
  hub: Hub;
  previewRole?: PreviewRole;
  getTeacherNotes?: (slide: TSlide) => string | undefined;
  /** Optional resolver: return a game background theme to render behind the slide. */
  getGameBackground?: (slide: TSlide) => GameBackgroundTheme | undefined;
}


/**
 * Hero canvas — 16:9 aspect ratio, hub-themed, slide transitions.
 */
export function PlayablePreviewPane<TSlide>({
  mode,
  slides,
  startIndex,
  renderSlide,
  hub,
  previewRole = 'teacher',
  getTeacherNotes,
  getGameBackground,
}: Props<TSlide>) {
  const [playIndex, setPlayIndex] = useState(startIndex);
  const dirRef = useRef<1 | -1>(1);
  const reduce = useReducedMotion();
  const theme = HUB_THEME[hub];


  useEffect(() => {
    if (mode === 'play') setPlayIndex(startIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (playIndex >= slides.length) setPlayIndex(Math.max(0, slides.length - 1));
  }, [slides.length, playIndex]);

  if (slides.length === 0) {
    return (
      <div className={cn('mx-auto w-full max-w-[920px] aspect-video flex items-center justify-center text-sm text-muted-foreground', theme.corners, theme.canvasBg)}>
        No slides yet
      </div>
    );
  }

  const renderTeacherNotes = (slide: TSlide) => {
    if (previewRole !== 'teacher' || !getTeacherNotes) return null;
    const notes = getTeacherNotes(slide);
    if (!notes || !notes.trim()) return null;
    return (
      <div className="mt-3 mx-auto w-full max-w-[920px] rounded-lg border border-amber-300 bg-amber-50/95 backdrop-blur-sm px-3 py-2 shadow-sm flex items-start gap-2">
        <StickyNote className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
        <div className="text-[12px] leading-snug text-amber-900">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-0.5">Teacher Script</div>
          {notes}
        </div>
      </div>
    );
  };

  // 16:9 hero frame
  const Frame = ({ children, k, bg }: { children: ReactNode; k: string | number; bg?: GameBackgroundTheme }) => (
    <div className={cn('relative mx-auto w-full max-w-[920px]', theme.shadow)}>
      <div className={cn('relative w-full aspect-video overflow-hidden border-2', theme.ring, theme.corners, theme.canvasBg, theme.canvasFont)}>
        <GameBackground theme={bg}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={k}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 * dirRef.current }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -40 * dirRef.current, transition: { duration: 0.18, ease: 'easeIn' } }}
              className="absolute inset-0 overflow-auto p-6 md:p-8 flex items-center justify-center"
            >
              <div className="w-full">{children}</div>
            </motion.div>
          </AnimatePresence>
        </GameBackground>
      </div>
    </div>
  );


  if (mode === 'editor') {
    const idx = Math.min(startIndex, slides.length - 1);
    return (
      <div className="space-y-3">
        <Frame k={`editor-${idx}`} bg={getGameBackground?.(slides[idx])}>{renderSlide(slides[idx], idx)}</Frame>
        {renderTeacherNotes(slides[idx])}
      </div>
    );
  }


  // Play mode
  const current = slides[playIndex];
  const isStudent = previewRole === 'student';
  const goPrev = () => { dirRef.current = -1; setPlayIndex((i) => Math.max(0, i - 1)); };
  const goNext = () => { dirRef.current = 1; setPlayIndex((i) => Math.min(slides.length - 1, i + 1)); };

  return (
    <div className="space-y-3">
      <Frame k={playIndex} bg={getGameBackground?.(current)}>{renderSlide(current, playIndex)}</Frame>
      {renderTeacherNotes(current)}

      {!isStudent && (
        <div className="mx-auto w-full max-w-[920px] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={playIndex === 0}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
            <span className={cn('inline-block w-1.5 h-1.5 rounded-full', theme.dot)} />
            Slide {playIndex + 1} / {slides.length}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => { dirRef.current = -1; setPlayIndex(0); }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              title="Restart deck"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={playIndex >= slides.length - 1}
              className={cn('inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed', theme.accentBtn)}
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {isStudent && (
        <div className="text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Student view · navigation controlled by teacher
        </div>
      )}
    </div>
  );
}
