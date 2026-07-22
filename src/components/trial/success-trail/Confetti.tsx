import { useEffect, useState } from "react";

const COLORS = [
  "var(--brand-emerald)",
  "var(--brand-emerald-glow)",
  "var(--brand-mint)",
  "var(--brand-sun)",
  "var(--brand-sky)",
];

export function Confetti({ trigger }: { trigger: number }) {
  const [bursts, setBursts] = useState<number[]>([]);
  useEffect(() => {
    if (trigger === 0) return;
    const id = Date.now();
    setBursts((b) => [...b, id]);
    const t = setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 1200);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {bursts.map((id) => (
        <div key={id} className="absolute inset-x-0 top-1/3 flex justify-center">
          {Array.from({ length: 18 }).map((_, i) => {
            const tx = (i - 9) * 14 + (Math.random() * 20 - 10);
            return (
              <span
                key={i}
                className="absolute block w-2 h-2 rounded-full"
                style={{
                  background: COLORS[i % COLORS.length],
                  // @ts-expect-error CSS custom prop
                  "--tx": `${tx}px`,
                  animation: "sparkle-rise 1.2s ease-out forwards",
                  animationDelay: `${(i % 6) * 40}ms`,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
