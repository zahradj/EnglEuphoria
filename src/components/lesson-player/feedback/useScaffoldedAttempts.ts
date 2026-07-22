import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * 3-Strike scaffolded feedback hook.
 *
 * Strike 1 → 'shake'   : caller plays its own wrong-answer animation.
 * Strike 2 → 'hint'    : caller surfaces the slide's hint string (lightbulb / tooltip).
 * Strike 3 → 'reteach' : caller pauses the activity and mounts the reteach modal.
 *
 * Pass `telemetry` to also log each strike to `scaffold_strike_events`,
 * which powers the teacher's Class Friction Heatmap.
 */
export type Strike = 'none' | 'shake' | 'hint' | 'reteach';

export interface StrikeTelemetry {
  studentId?: string;
  lessonId?: string;
  blockId?: string;
  targetLabel: string;
  targetType?: 'vocab' | 'grammar' | 'phonics' | 'speaking' | string;
  /** Lesson phase (e.g. 'phase_1' … 'phase_4'). Powers in-lesson micro-remediation. */
  phase?: string;
  /** Optional callback fired on a 3rd-strike reteach event. Used by useMicroRemediation. */
  onThirdStrike?: (phase?: string) => void;
}

export interface ScaffoldedAttempts {
  failedAttempts: number;
  strike: Strike;
  paused: boolean;
  registerWrong: () => Strike;
  reset: () => void;
  resume: () => void;
}

export function useScaffoldedAttempts(telemetry?: StrikeTelemetry): ScaffoldedAttempts {
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [paused, setPaused] = useState(false);

  const log = (level: number) => {
    if (!telemetry?.studentId || !telemetry.targetLabel) return;
    supabase
      .from('scaffold_strike_events')
      .insert({
        student_id: telemetry.studentId,
        lesson_id: telemetry.lessonId ?? null,
        block_id: telemetry.blockId ?? null,
        target_label: telemetry.targetLabel,
        target_type: telemetry.targetType ?? 'vocab',
        strike_level: level,
        phase: telemetry.phase ?? null,
      } as never)
      .then(() => {});
  };

  const registerWrong = useCallback((): Strike => {
    let next: Strike = 'none';
    setFailedAttempts((prev) => {
      const n = prev + 1;
      if (n === 1) next = 'shake';
      else if (n === 2) next = 'hint';
      else if (n >= 3) {
        next = 'reteach';
        setPaused(true);
        if (n === 3) {
          telemetry?.onThirdStrike?.(telemetry?.phase);
          // Broadcast for in-lesson micro-remediation (LessonPlayerContainer).
          // Activities don't directly know about the container, so we use a
          // window event so the safety net hears every 3rd strike for free.
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('lesson:thirdStrike', {
                detail: {
                  phase: telemetry?.phase,
                  targetLabel: telemetry?.targetLabel,
                  targetType: telemetry?.targetType,
                },
              }),
            );
          }
        }
      }
      log(n);
      return n;
    });
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telemetry?.studentId, telemetry?.lessonId, telemetry?.blockId, telemetry?.targetLabel, telemetry?.targetType]);

  const reset = useCallback(() => {
    setFailedAttempts(0);
    setPaused(false);
  }, []);

  const resume = useCallback(() => {
    setFailedAttempts(0);
    setPaused(false);
  }, []);

  const strike: Strike =
    failedAttempts >= 3 ? 'reteach' :
    failedAttempts === 2 ? 'hint' :
    failedAttempts === 1 ? 'shake' : 'none';

  return { failedAttempts, strike, paused, registerWrong, reset, resume };
}

