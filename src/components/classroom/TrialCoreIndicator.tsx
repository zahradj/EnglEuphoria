import { useEffect, useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

interface Props {
  /** Session start (teacher's actual entry). Falls back to scheduledAt. */
  startedAt: string | null;
  scheduledAt: string | null;
  /** Only render when this is true (trial + student present). */
  active: boolean;
}

const CORE_MIN = 25;
const OPTIONAL_MIN = 30;

/**
 * Trial-lesson pacing chip.
 * - Core window: first 25 minutes after start (teacher must stay).
 * - Optional window: minutes 25–30 (teacher may end or extend).
 * - Past 30 min: hidden — SafeToLeave handles normal end.
 */
export function TrialCoreIndicator({ startedAt, scheduledAt, active }: Props) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  if (!active) return null;
  const baseIso = startedAt ?? scheduledAt;
  if (!baseIso) return null;

  const elapsedMs = Date.now() - new Date(baseIso).getTime();
  if (elapsedMs < 0) return null;

  const coreMs = CORE_MIN * 60_000;
  const optionalMs = OPTIONAL_MIN * 60_000;

  if (elapsedMs >= optionalMs) return null;

  const inCore = elapsedMs < coreMs;
  const remaining = inCore ? coreMs - elapsedMs : optionalMs - elapsedMs;
  const mm = String(Math.floor(remaining / 60_000)).padStart(2, '0');
  const ss = String(Math.floor((remaining % 60_000) / 1000)).padStart(2, '0');

  return (
    <div
      className={[
        'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur',
        inCore
          ? 'border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'
          : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      ].join(' ')}
      title={
        inCore
          ? `Core trial time — please teach the full ${CORE_MIN} minutes.`
          : `Core complete. You may end now, or continue up to ${OPTIONAL_MIN} minutes.`
      }
    >
      {inCore ? <Clock className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
      <span>
        {inCore ? 'Core' : 'Optional'} · {mm}:{ss}
      </span>
    </div>
  );
}

export default TrialCoreIndicator;
