import React, { useEffect, useRef, useState } from 'react';
import { Coins } from 'lucide-react';
import { useAcademyCoinBalance } from '@/hooks/useAcademyCoinBalance';

/**
 * Top-bar coin balance badge for the Academy hub.
 * Animated count-up when the total increases.
 */
export default function CoinBalance({ className = '' }: { className?: string }) {
  const { coins } = useAcademyCoinBalance();
  const [display, setDisplay] = useState(coins);
  const prev = useRef(coins);

  useEffect(() => {
    const from = prev.current;
    const to = coins;
    prev.current = to;
    if (from === to) {
      setDisplay(to);
      return;
    }
    const duration = 600;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [coins]);

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium ${className}`}
      aria-label={`Coin balance: ${display}`}
    >
      <Coins className="h-4 w-4 text-primary" aria-hidden="true" />
      <span className="tabular-nums">{display}</span>
    </div>
  );
}
