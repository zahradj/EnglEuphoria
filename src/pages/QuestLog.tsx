/**
 * Quest Log — student-side history of completed Language Engine runs.
 *
 * Reads from localStorage (`unit_engine_report_v1`) so it works offline
 * and requires no auth. Groups runs by unit + engine, exposes a Replay
 * link back to the lesson player.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Star, RotateCcw, Timer, Target, Cloud, HardDrive } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { EngineKind, UnitEngineRun } from '@/lib/unitProgressReport';
import { evaluateEngineAchievements } from '@/lib/engineAchievements';
import { Progress } from '@/components/ui/progress';

const ENGINE_STORAGE_KEY = 'unit_engine_report_v1';
type Store = Record<string, { runs: UnitEngineRun[] }>;
type Entry = { unitId: string; run: UnitEngineRun };

const ENGINE_LABEL: Record<EngineKind, string> = {
  story: 'Story Adventure',
  escape_room: 'Escape Room',
  detective_mystery: 'Detective Mystery',
  hidden_object: 'Hidden Object',
};

const ENGINE_ACCENT: Record<EngineKind, string> = {
  story: 'from-purple-500 to-indigo-400',
  escape_room: 'from-amber-500 to-orange-400',
  detective_mystery: 'from-slate-700 to-slate-500',
  hidden_object: 'from-emerald-500 to-teal-400',
};

function readLocalStore(): Store {
  try {
    return JSON.parse(localStorage.getItem(ENGINE_STORAGE_KEY) || '{}') as Store;
  } catch {
    return {};
  }
}

function fmtMinutes(ms: number): string {
  const mins = Math.max(1, Math.round(ms / 60000));
  return `${mins}m`;
}

export default function QuestLog() {
  const localEntries = useMemo<Entry[]>(() => {
    const store = readLocalStore();
    return Object.entries(store).flatMap(([unitId, b]) =>
      b.runs.map((r) => ({ unitId, run: r })),
    );
  }, []);
  const [entries, setEntries] = useState<Entry[]>(localEntries);
  const [source, setSource] = useState<'cloud' | 'local'>('local');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from('student_engine_runs')
          .select('unit_id, engine, accuracy, duration_ms, attempts, correct, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(200);
        if (!alive || error || !data) return;
        const cloud: Entry[] = data.map((r: any) => ({
          unitId: r.unit_id,
          run: {
            engine: r.engine as EngineKind,
            accuracy: Number(r.accuracy) || 0,
            durationMs: r.duration_ms || 0,
            attempts: r.attempts || 0,
            correct: r.correct || 0,
            ts: r.created_at,
          },
        }));
        // Merge cloud + local, dedupe by (unitId, engine, ts).
        const key = (e: Entry) => `${e.unitId}|${e.run.engine}|${e.run.ts}`;
        const map = new Map<string, Entry>();
        [...cloud, ...localEntries].forEach((e) => map.set(key(e), e));
        setEntries(
          Array.from(map.values()).sort((a, b) => (a.run.ts < b.run.ts ? 1 : -1)),
        );
        setSource('cloud');
      } catch {
        /* stay on local */
      }
    })();
    return () => {
      alive = false;
    };
  }, [localEntries]);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => (a.run.ts < b.run.ts ? 1 : -1)),
    [entries],
  );


  if (sortedEntries.length === 0) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="text-center max-w-md">
          <Compass className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">No quests yet</h1>
          <p className="text-muted-foreground">
            Complete a Language Engine slot inside a lesson and it will show up here.
          </p>
        </div>
      </div>
    );
  }

  const totalRuns = sortedEntries.length;
  const avgAcc = sortedEntries.reduce((s, e) => s + e.run.accuracy, 0) / totalRuns;

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Compass className="h-7 w-7 text-purple-500" /> Quest Log
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalRuns} completed · {Math.round(avgAcc * 100)}% avg accuracy
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          {source === 'cloud' ? (
            <><Cloud className="h-3 w-3" /> Synced</>
          ) : (
            <><HardDrive className="h-3 w-3" /> Local only</>
          )}
        </Badge>
      </header>

      {(() => {
        const achievements = evaluateEngineAchievements(
          sortedEntries.map((e) => ({ accuracy: e.run.accuracy, created_at: e.run.ts })),
        );
        return (
          <Card className="p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" /> Vault Stickers
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {achievements.map((a) => (
                <div
                  key={a.key}
                  className={`p-3 rounded-lg border text-center ${a.unlocked ? 'bg-yellow-50 border-yellow-300' : 'bg-muted/40 border-muted opacity-70'}`}
                  title={a.description}
                >
                  <div className="text-2xl" aria-hidden>{a.icon}</div>
                  <div className="text-xs font-semibold mt-1">{a.label}</div>
                  <Progress value={a.progress * 100} className="h-1 mt-2" />
                </div>
              ))}
            </div>
          </Card>
        );
      })()}

      <div className="grid gap-3">
        {sortedEntries.map(({ unitId, run }, i) => {
          const pct = Math.round(run.accuracy * 100);
          return (
            <Card key={`${unitId}-${i}`} className="overflow-hidden">
              <div className="flex items-stretch">
                <div
                  className={`w-2 bg-gradient-to-b ${ENGINE_ACCENT[run.engine]}`}
                  aria-hidden
                />
                <div className="flex-1 p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{ENGINE_LABEL[run.engine]}</span>
                      <Badge variant="outline">Unit {unitId.slice(0, 6)}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" /> {pct}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="h-3 w-3" /> {fmtMinutes(run.durationMs)}
                      </span>
                      <span>
                        {run.correct}/{run.attempts} correct
                      </span>
                      <span>{new Date(run.ts).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" aria-label={`${pct}% accuracy`}>
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${
                          (pct >= 90 && s <= 3) || (pct >= 75 && s <= 2) || s === 1
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/play/${unitId}`}>
                      <RotateCcw className="h-4 w-4 mr-1.5" /> Replay
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
