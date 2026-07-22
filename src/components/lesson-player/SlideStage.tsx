import React, { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import PipMascot from './PipMascot';
import SceneBackdrop, { type Environment } from './SceneBackdrop';
import Sparkles from './Sparkles';

// Playful personality (motion-design skill): ease-out-back, playful overshoot.
const EASE_OUT_BACK = [0.175, 0.885, 0.32, 1.275] as const;

// Runtime bridge for the Motion & Mascot Animation Contract emitted by
// the lesson maker (see src/orchestrator/motionAnimationPrompt.ts and
// src/qa/validators/motionMascotContract.ts).
//
// Usage inside a slide renderer:
//   <SlideStage mascot={slide.mascot} motion={slide.motion}>
//     {...slide content...}
//   </SlideStage>

export type MascotState =
  | 'idle' | 'blink' | 'wave' | 'point_left' | 'point_right'
  | 'celebrate' | 'thinking' | 'listening' | 'speaking' | 'sad';

export type MotionEntrance =
  | 'fade_up' | 'scale_in' | 'slide_in_right' | 'slide_in_left' | 'pop';

export interface SlideMascot {
  state: MascotState;
  environment?: string;
  speech?: string;
}

export interface SlideMotion {
  entrance: MotionEntrance;
  duration_ms?: number;
  easing?: string;
  stagger_ms?: number;
  emphasis?: 'none' | 'pulse' | 'shake' | 'bounce';
}

// Map Rive state → the animation prop supported by <PipMascot>.
// When the .riv rig lands, swap this for <PipRive state={state} />.
const STATE_TO_ANIM: Record<MascotState, React.ComponentProps<typeof PipMascot>['animation']> = {
  idle: 'idle',
  blink: 'idle',
  wave: 'wave',
  point_left: 'wave',
  point_right: 'wave',
  celebrate: 'celebrate',
  thinking: 'idle',
  listening: 'idle',
  speaking: 'bounce',
  sad: 'idle',
};

const VARIANTS: Record<MotionEntrance, Variants> = {
  fade_up:        { hidden: { opacity: 0, y: 24 },  show: { opacity: 1, y: 0 } },
  scale_in:       { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1 } },
  slide_in_right: { hidden: { opacity: 0, x: 40 },  show: { opacity: 1, x: 0 } },
  slide_in_left:  { hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0 } },
  pop:            { hidden: { opacity: 0, scale: 0.6 },  show: { opacity: 1, scale: 1 } },
};

// Continuous heartbeat/bounce loops caused motion sickness for students.
// Disable all looping emphasis animations; keep only one-shot shake for errors.
const EMPHASIS: Record<NonNullable<SlideMotion['emphasis']>, any> = {
  none: {},
  pulse:  {},
  shake:  { x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } },
  bounce: {},
};

interface Props {
  mascot?: SlideMascot;
  motion?: SlideMotion;
  children: React.ReactNode;
  className?: string;
}

/** Wraps a slide with Framer Motion entrance + mascot overlay. */
export default function SlideStage({ mascot, motion: m, children, className = '' }: Props) {
  const entrance = m?.entrance ?? 'fade_up';
  const duration = (m?.duration_ms ?? 300) / 1000;
  const emphasisKey = m?.emphasis ?? 'none';
  const emphasis = EMPHASIS[emphasisKey];
  const state: MascotState = mascot?.state ?? 'idle';

  // Celebration → one-shot sparkle burst on mount / when state becomes celebrate.
  const [sparkle, setSparkle] = useState(false);
  useEffect(() => {
    if (state === 'celebrate' || emphasisKey === 'bounce') {
      setSparkle(true);
      const t = setTimeout(() => setSparkle(false), 1100);
      return () => clearTimeout(t);
    }
  }, [state, emphasisKey]);

  return (
    <motion.div
      className={`relative w-full h-full overflow-hidden rounded-3xl ${className}`}
      variants={VARIANTS[entrance]}
      initial="hidden"
      animate="show"
      transition={{ duration, ease: EASE_OUT_BACK as any }}
    >
      {/* Painted ambient backdrop, keyed by environment */}
      <SceneBackdrop environment={(mascot?.environment as Environment) ?? 'classroom'} />

      <motion.div animate={emphasis} className="relative z-10 w-full h-full">
        {children}
      </motion.div>

      {/* Celebration burst */}
      <Sparkles show={sparkle} />

      {mascot && (
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
          {mascot.speech && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: EASE_OUT_BACK as any }}
              className="max-w-[220px] rounded-2xl bg-white/95 px-3 py-2 text-sm font-bold text-slate-700 shadow-lg"
            >
              {mascot.speech}
            </motion.div>
          )}
          <PipMascot size={96} animation={STATE_TO_ANIM[state]} />
        </div>
      )}
    </motion.div>
  );
}
