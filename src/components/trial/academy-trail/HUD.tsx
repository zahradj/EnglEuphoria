import { LogoBubble } from "./LogoBubble";
import { LevelPicker } from "./LevelPicker";
import type { Difficulty } from "./levels";

export function HUD({
  xp,
  maxXp,
  streak,
  questIndex,
  totalQuests,
  difficulty,
  setDifficulty,
}: {
  xp: number;
  maxXp: number;
  streak: number;
  questIndex: number;
  totalQuests: number;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
}) {
  const pct = Math.min(100, Math.round((xp / maxXp) * 100));
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4">
        <LogoBubble size={64} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-brand-purple-deep truncate">
              Engleuphoria Academy Hub
            </h1>
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground whitespace-nowrap">
              Quest {Math.min(questIndex + 1, totalQuests)} / {totalQuests}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-32 h-4 rounded-full bg-secondary overflow-hidden border border-border">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background:
                    "linear-gradient(90deg, var(--brand-purple-glow), var(--brand-purple), var(--brand-pink))",
                  boxShadow: "0 0 12px color-mix(in oklch, var(--brand-purple) 60%, transparent)",
                }}
              />
            </div>
            <span className="font-display text-sm font-semibold text-brand-purple-deep tabular-nums">
              ⭐ {xp} XP
            </span>
            <span
              className={`font-display text-sm font-semibold tabular-nums ${streak >= 2 ? "text-brand-purple" : "text-muted-foreground"}`}
              title="Streak"
            >
              🔥 {streak}
            </span>
            <LevelPicker variant="pill" value={difficulty} onChange={setDifficulty} />
          </div>
        </div>
      </div>
    </header>
  );
}
