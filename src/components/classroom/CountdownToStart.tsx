import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";

interface CountdownToStartProps {
  scheduledAt?: string | Date | null;
  /** Called once when the scheduled time is reached. */
  onTimeReached?: () => void;
  /** Tone color for the chip + bell. Defaults to amber. */
  accent?: string;
  /** When true, plays a short bell sound on time-reached. */
  ring?: boolean;
}

/**
 * Live countdown to the scheduled lesson start.
 * - Shows "Starts in HH:MM:SS" while waiting.
 * - When the clock reaches zero, rings a bell, pulses, and shows
 *   "🔔 It's time to start the lesson".
 */
export const CountdownToStart: React.FC<CountdownToStartProps> = ({
  scheduledAt,
  onTimeReached,
  accent = "#F59E0B",
  ring = true,
}) => {
  const target = useMemo(() => {
    if (!scheduledAt) return null;
    const t = scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
    return isNaN(t.getTime()) ? null : t;
  }, [scheduledAt]);

  const [now, setNow] = useState(() => Date.now());
  const firedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = target ? target.getTime() - now : 0;
  const reached = !!target && remainingMs <= 0;

  useEffect(() => {
    if (!reached || firedRef.current) return;
    firedRef.current = true;
    if (ring) {
      try {
        const AC: typeof AudioContext | undefined =
          (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AC) {
          const ctx = new AC();
          const ringOnce = (when: number, freq: number) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = "sine";
            o.frequency.setValueAtTime(freq, ctx.currentTime + when);
            g.gain.setValueAtTime(0.0001, ctx.currentTime + when);
            g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + when + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + when + 0.6);
            o.connect(g).connect(ctx.destination);
            o.start(ctx.currentTime + when);
            o.stop(ctx.currentTime + when + 0.65);
          };
          ringOnce(0, 880);
          ringOnce(0.35, 1175);
          ringOnce(0.7, 880);
        }
      } catch {
        /* ignore audio errors */
      }
    }
    onTimeReached?.();
  }, [reached, ring, onTimeReached]);

  if (!target) return null;

  if (reached) {
    return (
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm animate-pulse"
        style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}55` }}
        role="status"
        aria-live="polite"
      >
        <Bell className="w-4 h-4" />
        It's time to start the lesson
      </div>
    );
  }

  const s = Math.max(0, Math.floor(remainingMs / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const label = h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;

  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm"
      style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}33` }}
      role="timer"
      aria-live="off"
    >
      <span className="text-base leading-none">⏱️</span>
      <span>Starts in</span>
      <span className="tabular-nums font-mono">{label}</span>
    </div>
  );
};

export default CountdownToStart;
