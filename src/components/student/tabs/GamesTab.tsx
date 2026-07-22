import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentLevel } from '@/hooks/useStudentLevel';
import { useCEFRProgress } from '@/hooks/useCEFRProgress';
import {
  listLibrary,
  recordPlay,
  recordCompletion,
  studentLevelToHub,
  type GameHub,
  type StudentGameWithProgress,
} from '@/services/studentGames';
import { Loader2, Gamepad2, Sparkles, Trophy, Play, Zap, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const GamePlayer = lazy(() => import('@/components/games/GamePlayer'));

const HUB_THEME: Record<GameHub, { accent: string; chip: string; ring: string; soft: string }> = {
  playground: { accent: 'text-orange-600', chip: 'bg-orange-500 text-white', ring: 'ring-orange-400/40', soft: 'bg-orange-50 dark:bg-orange-950/30' },
  academy:    { accent: 'text-purple-600', chip: 'bg-purple-600 text-white', ring: 'ring-purple-400/40', soft: 'bg-purple-50 dark:bg-purple-950/30' },
  success:    { accent: 'text-emerald-600', chip: 'bg-emerald-600 text-white', ring: 'ring-emerald-400/40', soft: 'bg-emerald-50 dark:bg-emerald-950/30' },
};

const TYPE_GRADIENT: Record<string, string> = {
  sentence_builder: 'from-indigo-500 to-purple-600',
  verb_trio: 'from-amber-500 to-orange-600',
  interview: 'from-emerald-500 to-teal-600',
  sorting: 'from-fuchsia-500 to-pink-600',
};

function gradientFor(type: string): string {
  return TYPE_GRADIENT[type] || 'from-slate-500 to-slate-700';
}

function GameCard({
  game,
  hub,
  onPlay,
}: {
  game: StudentGameWithProgress;
  hub: GameHub;
  onPlay: () => void;
}) {
  const theme = HUB_THEME[hub];
  const completed = game.progress?.status === 'completed';
  return (
    <button
      onClick={onPlay}
      className={cn(
        'group text-left rounded-2xl border bg-card transition hover:-translate-y-0.5 hover:shadow-md ring-1 ring-border/60',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring overflow-hidden flex flex-col',
      )}
    >
      <div className={cn('h-28 w-full bg-gradient-to-br relative', gradientFor(game.game_type))}>
        {game.thumbnail_url ? (
          <img src={game.thumbnail_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/90">
            <Gamepad2 className="w-10 h-10" />
          </div>
        )}
        {completed && (
          <div className="absolute top-2 right-2 bg-white/95 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">{game.title}</h3>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{game.description || ' '}</p>
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{game.level}</Badge>
            <Badge className={cn('text-[10px] px-1.5 py-0', theme.chip)}>{hub}</Badge>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
            <Zap className="w-3 h-3" /> {game.xp_reward}
          </span>
        </div>
      </div>
    </button>
  );
}

function Row({
  title,
  icon: Icon,
  games,
  hub,
  onPlay,
  empty,
}: {
  title: string;
  icon: typeof Sparkles;
  games: StudentGameWithProgress[];
  hub: GameHub;
  onPlay: (g: StudentGameWithProgress) => void;
  empty: string;
}) {
  if (!games.length) {
    return (
      <section>
        <h2 className="flex items-center gap-2 text-lg font-bold mb-3">
          <Icon className="w-5 h-5" /> {title}
        </h2>
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
          {empty}
        </div>
      </section>
    );
  }
  return (
    <section>
      <h2 className="flex items-center gap-2 text-lg font-bold mb-3">
        <Icon className="w-5 h-5" /> {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {games.map((g) => (
          <GameCard key={g.id} game={g} hub={hub} onPlay={() => onPlay(g)} />
        ))}
      </div>
    </section>
  );
}

export function GamesTab() {
  const { user } = useAuth();
  const { studentLevel, hubReady } = useStudentLevel();
  const cefr = useCEFRProgress();
  const cefrLevel = (cefr?.data?.level as string) || null;
  const hub = studentLevelToHub(studentLevel);
  const theme = hub ? HUB_THEME[hub] : HUB_THEME.academy;

  const [games, setGames] = useState<StudentGameWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState<StudentGameWithProgress | null>(null);

  useEffect(() => {
    if (!hubReady || !hub || !user?.id) return;
    let cancel = false;
    setLoading(true);
    listLibrary({ userId: user.id, hub, level: cefrLevel })
      .then((rows) => {
        if (cancel) return;
        setGames(rows);
        setLoading(false);
      });
    return () => { cancel = true; };
  }, [hub, hubReady, user?.id, cefrLevel]);

  const sections = useMemo(() => {
    const continuePlaying = games.filter((g) => g.progress?.status === 'in_progress');
    const completed = games.filter((g) => g.progress?.status === 'completed');
    const recent = [...games]
      .filter((g) => g.progress)
      .sort((a, b) => (b.progress!.last_played_at || '').localeCompare(a.progress!.last_played_at || ''))
      .slice(0, 8);
    const recommended = games.filter((g) => !g.progress).slice(0, 8);
    return { continuePlaying, completed, recent, recommended };
  }, [games]);

  async function startPlay(g: StudentGameWithProgress) {
    if (!user?.id) return;
    await recordPlay(user.id, g.id);
    setActiveGame(g);
  }

  async function handleComplete() {
    if (!user?.id || !activeGame) return;
    await recordCompletion(user.id, activeGame);
    // refresh
    if (hub) {
      const rows = await listLibrary({ userId: user.id, hub, level: cefrLevel });
      setGames(rows);
    }
  }

  if (activeGame) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setActiveGame(null)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to library
        </Button>
        <div className={cn('rounded-2xl border bg-card p-4 sm:p-6 ring-1', theme.ring)}>
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-10 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            }
          >
            <GamePlayer gameId={activeGame.id} onComplete={handleComplete} />
          </Suspense>
        </div>
      </div>
    );
  }

  if (!hubReady || loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 rounded bg-muted animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 w-40 bg-muted/70 animate-pulse rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-48 rounded-2xl bg-muted/60 animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center text-muted-foreground">
        Pick a learning hub to see your games.
      </div>
    );
  }

  const noGamesAtAll = games.length === 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className={cn('text-3xl font-bold flex items-center gap-2', theme.accent)}>
            <Gamepad2 className="w-7 h-7" /> Game Library
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Earn XP. Master English. Play games made for the {hub} hub.
          </p>
        </div>
        <Badge className={cn('text-xs px-2.5 py-1', theme.chip)}>
          {games.length} games available
        </Badge>
      </header>

      {noGamesAtAll ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-12 text-center">
          <Gamepad2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold text-lg mb-1">No games yet</h3>
          <p className="text-sm text-muted-foreground">
            Your teacher hasn't published any {hub} games yet. Check back soon!
          </p>
        </div>
      ) : (
        <>
          <Row
            title="Continue Playing"
            icon={Play}
            games={sections.continuePlaying}
            hub={hub}
            onPlay={startPlay}
            empty="Start a game to see it here."
          />
          <Row
            title="Recent Games"
            icon={Sparkles}
            games={sections.recent}
            hub={hub}
            onPlay={startPlay}
            empty="No recent play yet."
          />
          <Row
            title="Recommended for you"
            icon={Sparkles}
            games={sections.recommended}
            hub={hub}
            onPlay={startPlay}
            empty="You've tried them all — nice work!"
          />
          <Row
            title="Completed"
            icon={Trophy}
            games={sections.completed}
            hub={hub}
            onPlay={startPlay}
            empty="No completed games yet. You've got this!"
          />
        </>
      )}
    </div>
  );
}

export default GamesTab;
