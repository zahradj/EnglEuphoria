import { Play } from 'lucide-react';
import { ACADEMY_GAMES } from './academyGamesCatalog';

/** The Academy hub's featured (built-in) games, as cards for the student's Game Library. */
export function AcademyGamesGrid({ onPlay }: { onPlay: (id: string) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {ACADEMY_GAMES.map((g) => (
        <button
          key={g.id}
          type="button"
          onClick={() => onPlay(g.id)}
          aria-label={`Play ${g.title}`}
          className="group overflow-hidden rounded-3xl border border-violet-300/30 bg-card text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl active:scale-[.98]"
        >
          <div className="relative aspect-video w-full" style={{ background: g.gradient }}>
            <img src={g.cover} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            <span className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-violet-700 shadow-lg transition group-hover:scale-110"><Play className="h-6 w-6" /></span>
          </div>
          <div className="space-y-1.5 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-600">{g.skill} · {g.levels.join(' – ')} · {g.minutes}</p>
            <h3 className="text-xl font-extrabold">{g.title}</h3>
            <p className="text-sm text-muted-foreground">{g.tagline}</p>
            <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">Method: {g.method}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
