import type { Difficulty } from "./levels";
import { LEVEL_META } from "./levels";

export function LevelPicker({
  value,
  onChange,
  variant = "card",
}: {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
  variant?: "card" | "pill";
}) {
  const levels: Difficulty[] = ["pre-a1", "standard", "challenge"];
  if (variant === "pill") {
    return (
      <div className="inline-flex rounded-full border-2 border-border bg-card p-1 gap-1">
        {levels.map((d) => {
          const active = d === value;
          return (
            <button
              key={d}
              onClick={() => onChange(d)}
              className={`px-3 py-1 rounded-full text-xs font-display font-bold transition-all ${
                active
                  ? "bg-brand-purple text-primary-foreground"
                  : "text-brand-purple-deep hover:bg-secondary"
              }`}
              title={LEVEL_META[d].label}
            >
              {LEVEL_META[d].emoji} {LEVEL_META[d].short}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {levels.map((d) => {
        const active = d === value;
        const meta = LEVEL_META[d];
        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={`text-left rounded-2xl p-4 border-2 transition-all active:scale-95 ${
              active
                ? "border-brand-purple bg-brand-purple/10 shadow-lg"
                : "border-border bg-card hover:border-brand-purple/60"
            }`}
          >
            <div className="text-2xl mb-1" aria-hidden>{meta.emoji}</div>
            <div className="font-display font-bold text-brand-purple-deep">{meta.label}</div>
            <p className="text-xs text-muted-foreground mt-1">{meta.tagline}</p>
          </button>
        );
      })}
    </div>
  );
}
