import { DIFFICULTIES, type Difficulty } from "./levels";

export function LevelPicker({
  value,
  onChange,
  compact = false,
}: {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : ""}`}>
      {DIFFICULTIES.map((d) => {
        const active = d === value;
        return (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            className={
              "rounded-full font-display font-bold transition border-2 " +
              (compact ? "px-3 py-1 text-xs " : "px-4 py-2 text-sm ") +
              (active
                ? "bg-brand-emerald text-primary-foreground border-brand-emerald shadow-md"
                : "bg-card text-brand-emerald-deep border-border hover:border-brand-emerald")
            }
            aria-pressed={active}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}
