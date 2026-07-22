import { TRACKS, type Track } from "./levels";

export function TrackPicker({
  value,
  onChange,
}: {
  value: Track;
  onChange: (t: Track) => void;
}) {
  return (
    <div className="grid sm:grid-cols-3 gap-2">
      {TRACKS.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-pressed={active}
            className={
              "text-left rounded-2xl border-2 p-3 transition " +
              (active
                ? "border-brand-emerald bg-brand-mint shadow-md"
                : "border-border bg-card hover:border-brand-emerald")
            }
          >
            <div className="flex items-center gap-2">
              <span aria-hidden className="text-xl">{t.emoji}</span>
              <span className="font-display font-bold text-brand-emerald-deep">{t.label}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-snug">{t.tagline}</p>
          </button>
        );
      })}
    </div>
  );
}
