import { LevelPicker } from "./LevelPicker";
import { TRACK_LABEL, type Difficulty, type Track } from "./levels";

export function HUD({
  xp,
  maxXp,
  streak,
  questIndex,
  totalQuests,
  difficulty,
  setDifficulty,
  track,
}: {
  xp: number;
  maxXp: number;
  streak: number;
  questIndex: number;
  totalQuests: number;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  track: Track;
}) {
  const pct = Math.min(100, Math.round((xp / maxXp) * 100));
  const stop = Math.min(questIndex + 1, totalQuests);
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-background/70 border-b-2 border-border">
      <div className="max-w-3xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center w-8 h-8 rounded-full bg-brand-emerald text-primary-foreground font-display font-bold text-sm">
            E
          </span>
          <span className="font-display font-semibold text-brand-emerald-deep text-sm">
            Engleuphoria Success
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-muted-foreground">
          <span className="px-2 py-1 rounded-full bg-brand-mint text-brand-emerald-deep">
            {TRACK_LABEL[track]}
          </span>
        </div>
        <div className="flex-1 min-w-[160px]">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-emerald-deep mb-1">
            <span>⭐ {xp} XP</span>
            <span>
              Stop {stop} of {totalQuests} · 🔥 {streak}
            </span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-emerald-glow via-brand-emerald to-brand-emerald-deep transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <LevelPicker value={difficulty} onChange={setDifficulty} compact />
      </div>
    </header>
  );
}
