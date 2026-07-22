/**
 * Engine Leaderboard — Academy / Success only.
 * Weekly (last 7 days) XP board built from `student_engine_runs`.
 *
 * XP formula: sum(correct) * 10 per run, with anti-farming caps:
 *   - max 5 counted runs per user per calendar day
 *   - runs with accuracy < 40% award 0 XP (prevent spam farming)
 *   - top 25 board only, hub-scoped, self row always shown
 *
 * Playground is excluded per project rules (no leaderboards for Kids).
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useStudentHubTheme } from '@/hooks/useStudentHubTheme';

type Run = {
  user_id: string;
  accuracy: number;
  correct: number;
  hub: string | null;
  created_at: string;
};

type Entry = { userId: string; xp: number; runs: number; avgAcc: number };

const DAILY_CAP = 5;
const MIN_ACC = 40;

export default function EngineLeaderboard() {
  const navigate = useNavigate();
  const theme = useStudentHubTheme();
  const [me, setMe] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const hub = theme.hubKey; // 'playground' | 'academy' | 'success'
  const isPlayground = hub === 'playground';

  useEffect(() => {
    if (isPlayground) return;
    (async () => {
      setLoading(true);
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id ?? null;
      setMe(uid);
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await (supabase as any)
        .from('student_engine_runs')
        .select('user_id, accuracy, correct, hub, created_at')
        .eq('hub', hub)
        .gte('created_at', since)
        .limit(5000);
      const rows = (data as Run[] | null) ?? [];

      // Anti-farming: bucket per user per day, cap DAILY_CAP.
      const perUserDay = new Map<string, number>();
      const agg = new Map<string, { xp: number; runs: number; accSum: number; accN: number }>();
      for (const r of rows) {
        if (r.accuracy < MIN_ACC) continue;
        const day = r.created_at.slice(0, 10);
        const key = `${r.user_id}::${day}`;
        const used = perUserDay.get(key) ?? 0;
        if (used >= DAILY_CAP) continue;
        perUserDay.set(key, used + 1);
        const cur = agg.get(r.user_id) ?? { xp: 0, runs: 0, accSum: 0, accN: 0 };
        cur.xp += (r.correct ?? 0) * 10;
        cur.runs += 1;
        cur.accSum += r.accuracy;
        cur.accN += 1;
        agg.set(r.user_id, cur);
      }
      const list: Entry[] = Array.from(agg.entries())
        .map(([userId, v]) => ({
          userId,
          xp: v.xp,
          runs: v.runs,
          avgAcc: v.accN ? Math.round(v.accSum / v.accN) : 0,
        }))
        .sort((a, b) => b.xp - a.xp);
      setEntries(list);
      setLoading(false);
    })();
  }, [hub, isPlayground]);

  const top = useMemo(() => entries.slice(0, 25), [entries]);
  const myRank = useMemo(() => (me ? entries.findIndex((e) => e.userId === me) : -1), [entries, me]);
  const myEntry = myRank >= 0 ? entries[myRank] : null;
  const meInTop = myRank >= 0 && myRank < top.length;

  if (isPlayground) {
    return (
      <div className={`min-h-dvh ${theme.pageBg} p-6`}>
        <div className="mx-auto max-w-2xl text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Playground has no leaderboard</h1>
          <p className="text-muted-foreground">
            Playground rewards curiosity over competition. Head back to your Quest Log to see your own progress.
          </p>
          <button
            onClick={() => navigate('/quest-log')}
            className={`px-4 py-2 rounded ${theme.buttonPrimary}`}
          >
            Open Quest Log
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-dvh ${theme.pageBg} p-6`}>
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Weekly Quest Leaderboard</h1>
          <p className="text-muted-foreground text-sm">
            Last 7 days · {hub === 'academy' ? 'Academy Hub' : 'Success Hub'} · Max {DAILY_CAP} runs/day counted
          </p>
        </header>

        <Card>
          <CardHeader><CardTitle className="text-base">Top explorers</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : top.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No qualifying runs yet this week. Play a quest to get on the board!
              </p>
            ) : (
              <ol className="space-y-1">
                {top.map((e, i) => (
                  <LbRow key={e.userId} rank={i + 1} entry={e} isMe={e.userId === me} theme={theme} />
                ))}
              </ol>
            )}

            {!loading && myEntry && !meInTop && (
              <div className="mt-4 pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground mb-1">Your position</div>
                <LbRow rank={myRank + 1} entry={myEntry} isMe theme={theme} />
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          XP formula: 10 × correct answers per run. Runs below {MIN_ACC}% accuracy award no XP.
        </p>
      </div>
    </div>
  );
}

function LbRow({
  rank,
  entry,
  isMe,
  theme,
}: {
  rank: number;
  entry: Entry;
  isMe: boolean;
  theme: ReturnType<typeof useStudentHubTheme>;
}) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
  return (
    <li
      className={`flex items-center justify-between rounded-lg px-3 py-2 ${
        isMe ? `${theme.accentSoftBg} ${theme.accentText} font-semibold` : 'text-foreground'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="w-8 text-center tabular-nums">{medal}</span>
        <span className="font-mono text-xs opacity-70">
          {isMe ? 'You' : `${entry.userId.slice(0, 4)}…${entry.userId.slice(-4)}`}
        </span>
      </div>
      <div className="text-sm tabular-nums">
        <span className="font-bold">{entry.xp}</span>
        <span className="opacity-60"> XP · {entry.runs} runs · {entry.avgAcc}%</span>
      </div>
    </li>
  );
}
