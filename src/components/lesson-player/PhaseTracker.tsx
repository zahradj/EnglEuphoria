/**
 * Locked Phase Tracker — horizontal progression map at the top of the lesson.
 *
 * Shows the 6-Step Integrated Skills Blueprint as connected nodes:
 *   Vocab → Reading → Comprehension → Grammar → Speaking → Writing
 *
 * Logic:
 *  • Past phases   → solid colored, ✓ check icon, clickable (jumps back).
 *  • Current phase → highlighted with ring + brand color.
 *  • Future phases → strictly greyed-out with a padlock 🔒. Not clickable.
 *
 * The student can never *skip ahead* — they only unlock the next phase by
 * progressing through the deck (which the LessonPlayerContainer enforces by
 * gating the Next button on completed activities).
 */
import React, { useMemo } from 'react';
import { Lock, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { LESSON_PHASE_ORDER, type LessonPhase } from '@/components/creator-studio/CreatorContext';

const PHASE_LABEL: Record<LessonPhase, string> = {
  Vocabulary: 'Vocab',
  Reading: 'Reading',
  Comprehension: 'Check',
  Grammar: 'Grammar',
  Speaking: 'Speaking',
  Writing: 'Writing',
};

interface SlideLike {
  id: string;
  lesson_phase?: string;
}

interface PhaseTrackerProps {
  slides: SlideLike[];
  currentIndex: number;
  /** Optional click-to-navigate (only fires for unlocked phases). */
  onJumpToPhase?: (firstSlideIndex: number, phase: LessonPhase) => void;
  /** Tailwind classes for the active node — defaults to brand violet. */
  accentClass?: string;
  className?: string;
}

export const PhaseTracker: React.FC<PhaseTrackerProps> = ({
  slides,
  currentIndex,
  onJumpToPhase,
  accentClass = 'bg-violet-600 text-white ring-violet-300',
  className = '',
}) => {
  /** Map every blueprint phase → first slide index where it appears (or -1). */
  const phaseStartIndex = useMemo(() => {
    const out: Record<LessonPhase, number> = {
      Vocabulary: -1,
      Reading: -1,
      Comprehension: -1,
      Grammar: -1,
      Speaking: -1,
      Writing: -1,
    };
    slides.forEach((s, i) => {
      const p = s.lesson_phase as LessonPhase | undefined;
      if (p && p in out && out[p] === -1) out[p] = i;
    });
    return out;
  }, [slides]);

  const currentPhase = (slides[currentIndex]?.lesson_phase as LessonPhase | undefined) ?? 'Vocabulary';
  const currentPhaseRank = LESSON_PHASE_ORDER.indexOf(currentPhase);

  return (
    <nav
      aria-label="Lesson phase tracker"
      className={`w-full flex items-center justify-center gap-1 sm:gap-2 ${className}`}
    >
      {LESSON_PHASE_ORDER.map((phase, idx) => {
        const phaseIdxInDeck = phaseStartIndex[phase];
        const phaseExistsInDeck = phaseIdxInDeck !== -1;
        const rank = idx;
        const status: 'past' | 'current' | 'future' =
          rank < currentPhaseRank ? 'past' : rank === currentPhaseRank ? 'current' : 'future';
        const isLocked = status === 'future';
        const clickable = phaseExistsInDeck && !isLocked && !!onJumpToPhase;

        return (
          <React.Fragment key={phase}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onJumpToPhase!(phaseIdxInDeck, phase)}
              aria-current={status === 'current' ? 'step' : undefined}
              aria-label={`${PHASE_LABEL[phase]}${isLocked ? ' (locked)' : ''}`}
              className={[
                'group flex flex-col items-center gap-1 transition-all shrink-0',
                clickable ? 'cursor-pointer' : 'cursor-default',
              ].join(' ')}
            >
              <motion.div
                initial={false}
                animate={{ scale: status === 'current' ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className={[
                  'w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold ring-2 transition-colors',
                  status === 'past' &&
                    'bg-emerald-500 text-white ring-emerald-200 dark:ring-emerald-800',
                  status === 'current' && `${accentClass} ring-offset-1`,
                  status === 'future' &&
                    'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 ring-transparent',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {status === 'past' ? (
                  <Check className="w-4 h-4" strokeWidth={3} />
                ) : isLocked ? (
                  <Lock className="w-3.5 h-3.5" strokeWidth={2.5} />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </motion.div>
              <span
                className={[
                  'text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase',
                  status === 'current' && 'text-slate-900 dark:text-slate-100',
                  status === 'past' && 'text-emerald-700 dark:text-emerald-400',
                  isLocked && 'text-slate-400 dark:text-slate-600',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {PHASE_LABEL[phase]}
              </span>
            </button>
            {idx < LESSON_PHASE_ORDER.length - 1 && (
              <div
                aria-hidden
                className={[
                  'h-[2px] w-3 sm:w-6 rounded-full mt-[-14px] transition-colors',
                  rank < currentPhaseRank
                    ? 'bg-emerald-400'
                    : 'bg-slate-200 dark:bg-slate-700',
                ].join(' ')}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default PhaseTracker;
