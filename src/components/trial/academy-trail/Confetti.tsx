import { useEffect, useState } from "react";

const COLORS = [
  "var(--brand-purple)",
  "var(--brand-purple-glow)",
  "var(--brand-mint)",
  "var(--brand-sun)",
  "var(--brand-pink)",
];

export function Confetti({ trigger }: { trigger: number }) {
  const [bursts, setBursts] = useState<number[]>([]);
  useEffect(() => {
    if (trigger === 0) return;
    setBursts((b) => [...b, trigger]);
    const t = setTimeout(() => setBursts((b) => b.filter((x) => x !== trigger)), 1200);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {bursts.map((id) => (
        <div key={id} className="absolute left-1/2 top-1/2">
          {Array.from({ length: 24 }).map((_, i) => {
            const tx = (Math.random() - 0.5) * 400;
            const delay = Math.random() * 0.15;
            return (
              <span
                key={i}
                className="absolute block rounded-full"
                style={{
                  width: 10,
                  height: 10,
                  background: COLORS[i % COLORS.length],
                  ["--tx" as string]: `${tx}px`,
                  animation: `sparkle-rise 1s ease-out ${delay}s forwards`,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
