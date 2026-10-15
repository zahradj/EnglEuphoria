import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { partsFor, type DeckScript } from './types';

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

/** What the clock says about the part the lesson is in: the part's own time against its budget, and the whole hour against what the finished parts were allowed. */
export function clockStatus(partSeconds: number[], budgets: number[], part: number): { state: 'ahead' | 'on-time' | 'behind'; behindSec: number } {
  const allowedSoFar = budgets.slice(0, part).reduce((a, b) => a + b * 60, 0);
  const usedBefore = partSeconds.slice(0, part).reduce((a, b) => a + b, 0);
  const drift = usedBefore - allowedSoFar + Math.max(0, (partSeconds[part] ?? 0) - budgets[part] * 60);
  if (drift > 120) return { state: 'behind', behindSec: drift };
  if (drift < -120) return { state: 'ahead', behindSec: drift };
  return { state: 'on-time', behindSec: drift };
}

/** Teacher-only lesson clock (owner 2026-10-15: "it doesn't seem like one hour"): the part's running time against its target and a plain hint. Never shown to the student (comfort: no visible timers). */
export function LessonClock({ script, part }: { script: DeckScript; part: number }) {
  const parts = partsFor(script);
  const budgets = parts.map((p) => p.minutes);
  const [secs, setSecs] = useState<number[]>(() => parts.map(() => 0));
  const partRef = useRef(part);
  partRef.current = part;
  useEffect(() => {
    const t = window.setInterval(() => setSecs((s) => s.map((v, i) => (i === partRef.current ? v + 5 : v))), 5000);
    return () => window.clearInterval(t);
  }, []);
  const st = clockStatus(secs, budgets, part);
  const total = secs.reduce((a, b) => a + b, 0);
  const hint = st.state === 'behind' ? 'Running long: skip the dashed (optional) pages and move on.' : st.state === 'ahead' ? 'Ahead of time: play the dashed (optional) pages or add a speaking take.' : 'On time.';
  return (
    <aside className="ad-clock" data-state={st.state} aria-label="Lesson clock (teacher only)">
      <Icon name="pause" />
      <span className="ad-clock-part">{parts[part]?.name} {mmss(secs[part] ?? 0)} / {budgets[part]}:00</span>
      <span className="ad-clock-total">Lesson {mmss(total)} / 60:00</span>
      <span className="ad-clock-hint">{hint}</span>
    </aside>
  );
}
