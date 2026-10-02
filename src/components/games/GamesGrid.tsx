import { useMemo } from 'react';
import { Play, Star } from 'lucide-react';
import { LIBRARY_GAMES, type LibraryGame } from '@/content/playground-library/gamesCatalog';
import { getGameProgress, overallStars } from '@/content/playground-library/gameProgress';

const FONT = "'Fredoka', system-ui, sans-serif";

/** "Lessons | Games" switch used in the Playground Library header. */
export function LibrarySectionToggle({ section, onChange }: { section: 'lessons' | 'games'; onChange: (s: 'lessons' | 'games') => void }) {
  const tabs: { id: 'lessons' | 'games'; label: string }[] = [
    { id: 'lessons', label: '📚 Lessons' },
    { id: 'games', label: '🎮 Games' },
  ];
  return (
    <div className="mx-auto flex max-w-6xl px-6 pb-3" role="tablist" aria-label="Library section">
      <div className="inline-flex rounded-full bg-white p-1 shadow ring-2 ring-orange-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={section === t.id}
            onClick={() => onChange(t.id)}
            className={`rounded-full px-5 py-1.5 text-sm font-black transition ${section === t.id ? 'bg-orange-500 text-white shadow' : 'text-orange-700 hover:bg-orange-50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StarsRow({ count, size = 16 }: { count: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${count} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <Star key={n} width={size} height={size} className={n <= count ? 'fill-amber-400 text-amber-500' : 'fill-transparent text-orange-200'} />
      ))}
    </span>
  );
}

/** The game's card: art banner with its journey map, title, progress, Play/Continue. */
function GameCard({ game, onPlay, compact }: { game: LibraryGame; onPlay: (id: string) => void; compact?: boolean }) {
  const progress = useMemo(() => getGameProgress(game.id), [game.id]);
  const done = game.stages.filter((_, i) => (progress.stageStars[i] ?? 0) > 0).length;
  const started = done > 0;
  const finished = done === game.stages.length;
  const overall = overallStars(progress.stageStars, game.stages.length);

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-orange-100 md:flex">
      {/* Cover */}
      <button
        type="button"
        onClick={() => onPlay(game.id)}
        aria-label={`Play ${game.title}`}
        className={`group relative block overflow-hidden md:w-[46%] ${compact ? 'aspect-video md:aspect-auto md:min-h-[190px]' : 'aspect-video md:aspect-auto md:min-h-[300px]'}`}
        style={{ background: game.gradient }}
      >
        <img src={game.cover} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-0.5 text-[11px] font-black uppercase tracking-wide text-orange-700 shadow">{game.skill}</span>
        <span className="absolute bottom-3 right-3 grid h-12 w-12 place-items-center rounded-full bg-white text-orange-600 shadow-xl transition group-hover:scale-110">
          <Play className="h-6 w-6 fill-current" />
        </span>
      </button>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div>
          <h3 className={`${compact ? 'text-xl' : 'text-2xl sm:text-3xl'} font-black text-orange-900`} style={{ fontFamily: FONT }}>{game.title}</h3>
          {!compact && <p className="mt-1 text-sm font-medium text-neutral-600 sm:text-base">{game.tagline}</p>}
        </div>

        {/* Journey map */}
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-2" aria-label="The four stops">
          {game.stages.map((s, i) => {
            const stars = progress.stageStars[i] ?? 0;
            return (
              <li key={s.id} className="flex items-center gap-1">
                <span className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-xs font-black ${stars ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-orange-50 text-orange-800 ring-1 ring-orange-200'}`}>
                  <img src={s.art} alt="" className="h-7 w-7 rounded-full bg-white object-contain p-0.5" draggable={false} />
                  {s.station}
                  {stars > 0 && <StarsRow count={stars} size={11} />}
                </span>
                {i < game.stages.length - 1 && <span className="text-orange-300" aria-hidden="true">›</span>}
              </li>
            );
          })}
        </ol>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 text-xs font-bold text-neutral-500">
            <span>{game.minutes}</span>
            <span>{game.levels.join(' · ')}</span>
            {started && <span className="text-orange-600">{finished ? `${game.stages.length}/${game.stages.length} stops` : `${done}/${game.stages.length} stops`}</span>}
            {overall > 0 && <StarsRow count={overall} size={15} />}
          </div>
          <button
            type="button"
            onClick={() => onPlay(game.id)}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-2.5 text-base font-black text-white shadow-lg transition hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300"
          >
            <Play className="h-5 w-5 fill-current" />
            {finished ? 'Play again' : started ? 'Continue' : 'Play'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Lists the games (today there is one: the Alphabet Express). */
export function GamesGrid({ onPlay, compact = false, level }: { onPlay: (id: string) => void; compact?: boolean; level?: string }) {
  const games = LIBRARY_GAMES.filter((g) => !level || g.levels.includes(level));
  return (
    <div className="grid gap-5">
      {games.map((g) => <GameCard key={g.id} game={g} onPlay={onPlay} compact={compact} />)}
    </div>
  );
}
