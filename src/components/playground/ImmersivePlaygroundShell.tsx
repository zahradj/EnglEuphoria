/**
 * ImmersivePlaygroundShell
 * ------------------------
 * Full-screen, framer-motion-driven wrapper for Playground lesson activities.
 * Replaces the traditional "slide deck + Prev/Next bar" chrome with a tablet-
 * game-style immersive canvas.
 *
 * RESPONSIBILITIES (UI/UX only — never alters activity logic):
 *  1. Owns the full viewport with a hub-branded gradient backdrop.
 *  2. Animates scene transitions between activities via AnimatePresence
 *     (smooth fade + scale + subtle pan instead of hard slide cuts).
 *  3. Mounts the persistent floating Pip mascot (audio-reactive).
 *  4. Renders a small celebration burst + auto-advance timer when the parent
 *     marks the current scene as complete.
 *  5. Provides an unobtrusive corner "skip" arrow as a teacher/parent fallback.
 *
 * The host page passes the active activity component as `children` and tells
 * the shell when it is `complete`. The shell does NOT decide pedagogy; it
 * just orchestrates the immersive frame around the existing components.
 */
import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import PipMascot from '@/components/lesson-player/PipMascot';
import { useAudioReactiveMascot } from './useAudioReactiveMascot';

export type ImmersiveHub = 'playground' | 'academy' | 'success';

const HUB_BG: Record<ImmersiveHub, string> = {
  playground:
    'radial-gradient(ellipse at top, #FFE7C2 0%, #FFB86B 45%, #FE6A2F 100%)',
  academy:
    'radial-gradient(ellipse at top, #E0E7FF 0%, #A5B4FC 45%, #6366F1 100%)',
  success:
    'radial-gradient(ellipse at top, #D1FAE5 0%, #6EE7B7 45%, #059669 100%)',
};

interface Props {
  /** Stable key for the current scene/slide. Drives AnimatePresence. */
  sceneKey: string | number;
  /** The activity component to render inside the immersive canvas. */
  children: React.ReactNode;
  /** Hub palette for the backdrop gradient. */
  hub?: ImmersiveHub;
  /** True when the current scene/activity is finished and ready to advance. */
  complete?: boolean;
  /**
   * Called to advance to the next scene. If omitted, auto-advance is disabled
   * (e.g. live classroom where the teacher controls navigation).
   */
  onAdvance?: () => void;
  /**
   * Milliseconds to wait after `complete` flips true before calling onAdvance.
   * Defaults to 2500ms (per spec) so the child can enjoy the celebration.
   */
  autoAdvanceDelayMs?: number;
  /**
   * If false, the fallback skip arrow is hidden. Defaults to true.
   */
  showSkip?: boolean;
  /**
   * Optional progress indicator: "{current}/{total}".
   */
  current?: number;
  total?: number;
  /**
   * When true (default), fires a small confetti burst when `complete` flips on.
   */
  celebrate?: boolean;
  /**
   * Layout mode.
   *  - `fixed` (default): takes over the full viewport — used in the solo
   *    playground player.
   *  - `embedded`: fills its parent container — used inside the live
   *    classroom so teacher chrome (dock, side panels) stays visible.
   */
  variant?: 'fixed' | 'embedded';
}

export default function ImmersivePlaygroundShell({
  sceneKey,
  children,
  hub = 'playground',
  complete = false,
  onAdvance,
  autoAdvanceDelayMs = 2500,
  showSkip = true,
  current,
  total,
  celebrate = true,
  variant = 'fixed',
}: Props) {
  const { isSpeaking } = useAudioReactiveMascot();
  const firedFor = useRef<string | number | null>(null);

  // Celebration + auto-advance when the parent flags scene completion.
  useEffect(() => {
    if (!complete) return;
    if (firedFor.current === sceneKey) return;
    firedFor.current = sceneKey;

    if (celebrate) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#FE6A2F', '#FFB703', '#FFD166', '#10B981', '#FFFFFF'],
        scalar: 0.9,
      });
    }

    if (!onAdvance) return;
    const t = setTimeout(() => onAdvance(), autoAdvanceDelayMs);
    return () => clearTimeout(t);
  }, [complete, sceneKey, onAdvance, autoAdvanceDelayMs, celebrate]);

  const rootClass =
    variant === 'fixed'
      ? 'pg-immersive fixed inset-0 z-40 overflow-hidden pg-tactile'
      : 'pg-immersive relative w-full h-full min-h-[480px] overflow-hidden pg-tactile rounded-3xl';

  return (
    <div className={rootClass} style={{ background: HUB_BG[hub] }}>
      {/* Soft floating ornaments for depth (flat, no shadows). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.35) 0, transparent 30%), radial-gradient(circle at 90% 80%, rgba(255,255,255,0.25) 0, transparent 35%)',
        }}
      />


      {/* Progress pill (tiny, unobtrusive — replaces full pagination bar). */}
      {typeof current === 'number' && typeof total === 'number' && total > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 rounded-full bg-white/80 backdrop-blur px-3 py-1 text-xs font-bold text-orange-700">
          {current + 1} / {total}
        </div>
      )}

      {/* Scene canvas with smooth pan/zoom transitions. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sceneKey}
          initial={{ opacity: 0, scale: 0.94, x: 24 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.96, x: -24 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
        >
          <div className="relative w-full h-full max-w-6xl flex items-center justify-center">
            <div className="w-full max-h-full overflow-auto bg-white/95 rounded-3xl p-6 md:p-10 flex items-center justify-center">
              {children}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Persistent floating Pip mascot. Bounces in sync with TTS audio. */}
      <div className="pointer-events-none absolute bottom-4 left-4 md:bottom-6 md:left-6 z-30">
        <motion.div
          animate={
            isSpeaking
              ? { scale: [1, 1.12, 1], y: [0, -8, 0] }
              : { scale: 1, y: 0 }
          }
          transition={
            isSpeaking
              ? { repeat: Infinity, duration: 0.55, ease: 'easeInOut' }
              : { duration: 0.3 }
          }
        >
          <PipMascot
            size={110}
            animation={isSpeaking ? 'bounce' : 'idle'}
            dynamic
          />
        </motion.div>
      </div>

      {/* Celebration overlay text when complete. */}
      <AnimatePresence>
        {complete && celebrate && (
          <motion.div
            key={`celeb-${sceneKey}`}
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 z-30 rounded-full bg-white/90 px-5 py-2 text-lg font-extrabold text-orange-600"
          >
            ✨ Great job! ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fallback skip arrow (teacher/parent escape hatch). */}
      {showSkip && onAdvance && (
        <button
          type="button"
          aria-label="Skip to next scene"
          onClick={onAdvance}
          className="absolute bottom-5 right-5 md:bottom-7 md:right-7 z-30 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/70 hover:bg-white text-orange-700 transition-transform hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-7 h-7" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
