import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentLevel } from '@/hooks/useStudentLevel';
import { BookMarked, Gamepad2, Zap, Loader2, ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  listAssignments,
  recordPlay,
  recordCompletion,
  type StudentGameWithProgress,
} from '@/services/studentGames';
import { zoneForTags, type AcademyZoneId } from '@/hooks/academy/useAcademyZones';

const GamePlayer = lazy(() => import('@/components/games/GamePlayer'));

const HUB_ACCENT: Record<string, string> = {
  playground: 'text-orange-600',
  academy: 'text-purple-600',
  professional: 'text-emerald-600',
};

const ZONE_LABEL: Record<AcademyZoneId, string> = {
  grammar: 'Grammar Tower',
  sounds: 'Sound Studio',
  vocab: 'Vocab Market',
  speaking: 'Speaking Stage',
  writing: "Writers' Studio",
};

const ZONE_CHIP: Record<AcademyZoneId, string> = {
  grammar:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200',
  sounds:   'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200',
  vocab:    'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
  speaking: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
  writing:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
};

export function HomeworkTab() {
  const { user } = useAuth();
  const { studentLevel } = useStudentLevel();
  const accent = HUB_ACCENT[studentLevel || 'playground'];
  const [searchParams, setSearchParams] = useSearchParams();
  const zoneParam = (searchParams.get('zone') || '') as AcademyZoneId | '';

  const [items, setItems] = useState<StudentGameWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<StudentGameWithProgress | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancel = false;
    setLoading(true);
    listAssignments({ userId: user.id }).then((rows) => {
      if (cancel) return;
      setItems(rows);
      setLoading(false);
    });
    return () => { cancel = true; };
  }, [user?.id]);

  const enriched = useMemo(
    () => items.map((g) => ({ ...g, zone: zoneForTags(g.tags, g.game_type) })),
    [items],
  );

  const filtered = useMemo(
    () => (zoneParam ? enriched.filter((g) => g.zone === zoneParam) : enriched),
    [enriched, zoneParam],
  );

  const zoneCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of enriched) {
      const done = g.progress?.status === 'completed';
      if (done || !g.zone) continue;
      counts[g.zone] = (counts[g.zone] ?? 0) + 1;
    }
    return counts;
  }, [enriched]);

  async function startPlay(g: StudentGameWithProgress) {
    if (!user?.id) return;
    await recordPlay(user.id, g.id);
    setActive(g);
  }

  async function handleComplete() {
    if (!user?.id || !active) return;
    await recordCompletion(user.id, active);
    const rows = await listAssignments({ userId: user.id });
    setItems(rows);
  }

  function clearZone() {
    const sp = new URLSearchParams(searchParams);
    sp.delete('zone');
    setSearchParams(sp, { replace: true });
  }

  if (active) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setActive(null)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to homework
        </Button>
        <div className="rounded-2xl border bg-card p-4 sm:p-6">
          <Suspense fallback={<div className="p-10 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin inline" /></div>}>
            <GamePlayer gameId={active.id} onComplete={handleComplete} />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className={cn('text-3xl font-bold flex items-center gap-2', accent)}>
          <BookMarked className="w-7 h-7" />
          Homework
        </h1>
        <p className="text-muted-foreground mt-1">
          Assigned by your teacher and synced to your Academy Journey zones.
        </p>
      </div>

      {/* Zone filter chips — keep in sync with the Quest Map */}
      {(Object.keys(ZONE_LABEL) as AcademyZoneId[]).some((z) => zoneCounts[z]) && (
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(ZONE_LABEL) as AcademyZoneId[]).map((z) => {
            const n = zoneCounts[z] ?? 0;
            if (!n && zoneParam !== z) return null;
            const active = zoneParam === z;
            return (
              <button
                key={z}
                onClick={() => {
                  const sp = new URLSearchParams(searchParams);
                  if (active) sp.delete('zone'); else sp.set('zone', z);
                  setSearchParams(sp, { replace: true });
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition',
                  active ? 'ring-foreground/40 bg-foreground/5' : 'ring-border/60 hover:bg-muted/60',
                  ZONE_CHIP[z],
                )}
              >
                {ZONE_LABEL[z]}
                <span className="rounded-full bg-background/70 px-1.5 text-[10px]">{n}</span>
              </button>
            );
          })}
          {zoneParam && (
            <button onClick={clearZone} className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:underline">
              <X className="w-3 h-3" /> clear
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3].map((i) => <div key={i} className="h-32 rounded-2xl bg-muted/60 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 backdrop-blur-xl p-8 text-center text-muted-foreground">
          {zoneParam
            ? `Nothing for ${ZONE_LABEL[zoneParam]} right now.`
            : 'No homework assigned yet. Check back after your next lesson.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((g) => {
            const done = g.progress?.status === 'completed';
            return (
              <button
                key={g.id}
                onClick={() => startPlay(g)}
                className="text-left rounded-2xl border bg-card p-4 hover:-translate-y-0.5 hover:shadow-md transition ring-1 ring-border/60"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm leading-tight truncate">{g.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{g.description || g.game_type}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {g.zone && (
                        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 border-transparent', ZONE_CHIP[g.zone])}>
                          {ZONE_LABEL[g.zone]}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{g.level}</Badge>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Zap className="w-3 h-3" /> {g.xp_reward}
                      </span>
                      {done && <Badge className="text-[10px] px-1.5 py-0 bg-emerald-600 text-white">Done</Badge>}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
