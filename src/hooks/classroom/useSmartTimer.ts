import { useMemo } from "react";

export type TimerPhase = "normal" | "warning" | "urgent" | "overtime";

interface SmartTimerResult {
  phase: TimerPhase;
  phaseColor: string;
  phaseLabel: string;
  shouldPulseWrapUp: boolean;
}

/**
 * Determines the color phase of the classroom timer based on elapsed time
 * and the teaching duration (25 or 55 minutes).
 *
 * Phases:
 *   normal  → default gradient
 *   warning → amber/yellow (5 min before end for 55-min, 3 min for 25-min)
 *   urgent  → red + pulse  (2 min before end for 25-min, 5 min for 55-min)
 *   overtime → red steady glow
 */
export function useSmartTimer(
  elapsedSeconds: number,
  sessionDurationMinutes: 25 | 55 = 25
): SmartTimerResult {
  return useMemo(() => {
    const totalSec = sessionDurationMinutes * 60;

    // Thresholds in seconds
    const warningAt = sessionDurationMinutes === 25 ? 20 * 60 : 45 * 60;
    const urgentAt = sessionDurationMinutes === 25 ? 23 * 60 : 50 * 60;

    let phase: TimerPhase = "normal";
    if (elapsedSeconds >= totalSec) {
      phase = "overtime";
    } else if (elapsedSeconds >= urgentAt) {
      phase = "urgent";
    } else if (elapsedSeconds >= warningAt) {
      phase = "warning";
    }

    const phaseConfig: Record<TimerPhase, { color: string; label: string }> = {
      normal: {
        color: "bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 bg-clip-text text-transparent",
        label: "In Progress",
      },
      warning: {
        color: "text-amber-400",
        label: "Wrap-up Soon",
      },
      urgent: {
        color: "text-red-500 animate-pulse",
        label: "Wrap Up Now",
      },
      overtime: {
        color: "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]",
        label: "OVERTIME",
      },
    };

    const config = phaseConfig[phase];

    return {
      phase,
      phaseColor: config.color,
      phaseLabel: config.label,
      shouldPulseWrapUp: phase === "urgent" || phase === "overtime",
    };
  }, [elapsedSeconds, sessionDurationMinutes]);
}
