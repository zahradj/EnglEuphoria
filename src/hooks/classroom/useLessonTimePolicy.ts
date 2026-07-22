import { useMemo } from 'react';

export type HubKey = 'playground' | 'academy' | 'professional' | 'success';
export type LessonPhase = 'mandatory' | 'bonus' | 'overtime';

export interface LessonTimePolicy {
  /** Minutes the teacher MUST stay for the session to count (25 for Playground, 55 for Academy/Success). */
  mandatoryMinutes: 0 | 25 | 55;
  /** Full booked duration including the optional 5-minute bonus (30 for Playground, 60 for Academy/Success). */
  totalMinutes: 25 | 30 | 60;

  mandatorySeconds: number;
  totalSeconds: number;
  bonusSeconds: number;
  /** Current elapsed seconds (echoed for convenience). */
  elapsedSeconds: number;
  /** Lifecycle phase: mandatory → bonus (optional) → overtime. */
  phase: LessonPhase;
  /** True once mandatory time has been completed. Leaving before this is "left early". */
  mandatoryReached: boolean;
  /** Inverse of mandatoryReached — used to warn the teacher when ending early. */
  wouldBeLeftEarly: boolean;
  /** Seconds remaining until mandatory end. */
  secondsUntilMandatoryEnd: number;
  /** Seconds remaining in the optional bonus window (0 if mandatory not yet reached, or after total). */
  bonusSecondsRemaining: number;
  /** Friendly phase label for chips. */
  phaseLabel: string;
}

/**
 * Hub-aware time policy for live classrooms.
 *
 * - Playground = 25 mandatory + 5 optional bonus = 30 booked.
 * - Academy / Success = 55 mandatory + 5 optional bonus = 60 booked.
 *
 * The first chunk MUST be attended — leaving before it ends marks the session
 * as "left early". The trailing 5 minutes are an optional bonus the teacher
 * can use to wrap up or extend; ending during this window is normal.
 */
export function useLessonTimePolicy(
  hubType: HubKey | null | undefined,
  elapsedSeconds: number,
  options?: { isInterview?: boolean; isTrial?: boolean },
): LessonTimePolicy {
  const isInterview = options?.isInterview === true;
  const isTrial = options?.isTrial === true;
  return useMemo(() => {
    const isPlayground = hubType === 'playground';
    // Interviews are uniformly 25 minutes for every hub and have NO mandatory
    // floor — the teacher can wrap up at any time without an "early leave" penalty.
    // Trial lessons (first booking) are uniformly 25 mandatory + 5 optional across every hub.
    const mandatoryMinutes: 0 | 25 | 55 =
      isInterview ? 0 : isTrial ? 25 : isPlayground ? 25 : 55;
    const totalMinutes: 25 | 30 | 60 =
      isInterview ? 25 : isTrial ? 30 : isPlayground ? 30 : 60;


    const mandatorySeconds = isInterview ? 0 : mandatoryMinutes * 60;
    const totalSeconds = totalMinutes * 60;

    const bonusSeconds = totalSeconds - mandatorySeconds;

    let phase: LessonPhase = 'mandatory';
    if (elapsedSeconds >= totalSeconds) phase = 'overtime';
    else if (elapsedSeconds >= mandatorySeconds) phase = 'bonus';

    const mandatoryReached = elapsedSeconds >= mandatorySeconds;
    const wouldBeLeftEarly = !mandatoryReached;
    const secondsUntilMandatoryEnd = Math.max(0, mandatorySeconds - elapsedSeconds);
    const bonusSecondsRemaining =
      phase === 'bonus' ? Math.max(0, totalSeconds - elapsedSeconds) : 0;

    const phaseLabel =
      phase === 'mandatory'
        ? `Core ${mandatoryMinutes}m`
        : phase === 'bonus'
          ? 'Bonus +5m'
          : 'Overtime';

    return {
      mandatoryMinutes,
      totalMinutes,
      mandatorySeconds,
      totalSeconds,
      bonusSeconds,
      elapsedSeconds,
      phase,
      mandatoryReached,
      wouldBeLeftEarly,
      secondsUntilMandatoryEnd,
      bonusSecondsRemaining,
      phaseLabel,
    };
  }, [hubType, elapsedSeconds, isInterview, isTrial]);
}
