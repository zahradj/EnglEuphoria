import React, { useEffect, useState, useRef } from 'react';

interface EntryCountdownProps {
  /** Trigger countdown (e.g. when both peers are present or teacher flips status to 'live') */
  active: boolean;
  seconds?: number;
  onComplete?: () => void;
  hubColor?: string; // tailwind ring color override
}

/**
 * 30-second visual ring countdown + single audio bell at start.
 * Audio is synthesized via Web Audio API (no asset needed).
 */
export const EntryCountdown: React.FC<EntryCountdownProps> = ({
  active,
  seconds = 30,
  onComplete,
  hubColor = 'hsl(var(--primary))',
}) => {
  const [remaining, setRemaining] = useState(seconds);
  const playedRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    setRemaining(seconds);
    playedRef.current = false;

    // Play bell once at start
    if (!playedRef.current) {
      try {
        const AC: typeof AudioContext =
          (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AC();
        const now = ctx.currentTime;
        // Two-tone bell
        [880, 660].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.setValueAtTime(freq, now + i * 0.18);
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.0001, now + i * 0.18);
          gain.gain.exponentialRampToValueAtTime(0.4, now + i * 0.18 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 1.2);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now + i * 0.18);
          osc.stop(now + i * 0.18 + 1.3);
        });
        playedRef.current = true;
      } catch (e) {
        // Audio context may be blocked until user gesture; silently ignore
      }
    }

    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          onComplete?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [active, seconds, onComplete]);

  if (!active || remaining === 0) return null;

  const pct = ((seconds - remaining) / seconds) * 100;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="text-center space-y-6">
        <div className="relative w-40 h-40 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64" cy="64" r={radius}
              fill="none" strokeWidth="8"
              stroke="hsl(var(--muted))"
              opacity={0.3}
            />
            <circle
              cx="64" cy="64" r={radius}
              fill="none" strokeWidth="8"
              stroke={hubColor}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-bold text-foreground tabular-nums">
              {remaining}
            </span>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Class is starting</h2>
          <p className="text-sm text-muted-foreground mt-1">Get ready — your lesson begins in {remaining}s</p>
        </div>
      </div>
    </div>
  );
};

export default EntryCountdown;
