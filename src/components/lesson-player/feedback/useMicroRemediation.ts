import { useCallback, useRef, useState } from 'react';
import { MICRO_REMEDIATION_THIRD_STRIKE_TRIGGER } from '@/lib/remediation/constants';

/**
 * In-Lesson Micro-Remediation tracker.
 *
 * Counts how many third-strike (reteach) events have fired during Phase 3
 * of the active lesson. When the count reaches
 * `MICRO_REMEDIATION_THIRD_STRIKE_TRIGGER`, sets `pendingConfidenceBuilder = true`
 * so the player can inject a Confidence Builder block before Phase 4 (Speaking).
 *
 * Once consumed (`markInjected()`), the flag clears for the rest of the lesson.
 */
export interface MicroRemediation {
  phase3Strikes: number;
  pendingConfidenceBuilder: boolean;
  registerPhase3ThirdStrike: () => void;
  markInjected: () => void;
  reset: () => void;
}

export function useMicroRemediation(): MicroRemediation {
  const [phase3Strikes, setStrikes] = useState(0);
  const [pendingConfidenceBuilder, setPending] = useState(false);
  const consumed = useRef(false);

  const registerPhase3ThirdStrike = useCallback(() => {
    setStrikes((prev) => {
      const next = prev + 1;
      if (!consumed.current && next >= MICRO_REMEDIATION_THIRD_STRIKE_TRIGGER) {
        setPending(true);
      }
      return next;
    });
  }, []);

  const markInjected = useCallback(() => {
    consumed.current = true;
    setPending(false);
  }, []);

  const reset = useCallback(() => {
    consumed.current = false;
    setStrikes(0);
    setPending(false);
  }, []);

  return { phase3Strikes, pendingConfidenceBuilder, registerPhase3ThirdStrike, markInjected, reset };
}
