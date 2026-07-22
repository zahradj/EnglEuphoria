// Teacher-side HUD that surfaces live WTC + anxiety reading and AI recommendations.
// Cycle 5 only. Rendered inside live-classroom or scorecard.

import { AlertTriangle, Heart, Sparkles } from 'lucide-react';
import type { WTCState } from '@/wtc';

interface AnxietyCoachProps {
  state: WTCState | null;
  compact?: boolean;
}

const LABEL: Record<NonNullable<WTCState['recommendation']>, string> = {
  continue: 'Student is engaged',
  shorten_task: 'Suggest: shorten current task',
  switch_to_game: 'Suggest: switch to a low-pressure game',
  invite_pip_support: 'Suggest: invite Pip to model the answer',
};

export function AnxietyCoach({ state, compact = false }: AnxietyCoachProps) {
  if (!state) {
    return (
      <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">
        Calibrating WTC monitor…
      </div>
    );
  }

  const tone =
    state.anxietyLevel === 'high'
      ? 'bg-destructive/10 text-destructive border-destructive/30'
      : state.anxietyLevel === 'medium'
        ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200'
        : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200';

  const Icon =
    state.anxietyLevel === 'high'
      ? AlertTriangle
      : state.anxietyLevel === 'medium'
        ? Heart
        : Sparkles;

  return (
    <div className={`rounded-lg border p-3 ${tone}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wide">
            WTC {Math.round(state.wtcScore * 100)}%
          </span>
        </div>
        <span className="text-xs">{state.anxietyLevel} anxiety</span>
      </div>
      {!compact && (
        <>
          <div className="mt-2 text-sm font-medium">
            {LABEL[state.recommendation]}
          </div>
          {state.reason && (
            <div className="mt-1 text-xs opacity-80">{state.reason}</div>
          )}
        </>
      )}
    </div>
  );
}

export default AnxietyCoach;
