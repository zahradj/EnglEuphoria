/**
 * GamesAnalyticsTile — read-only summary of student attempts on the Game Pack
 * for a given lesson. Mirrors HomeworkAnalyticsTile but reads game_packs +
 * game_attempts (grouped by game_type).
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  attempts: number;
  successRate: number;
  avgSeconds: number;
  packs: number;
  avgEducationalValue: number;
  topStruggle?: { game_type: string; success_rate: number; attempts: number };
}

export function GamesAnalyticsTile({ lessonId }: { lessonId: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: packs } = await supabase
          .from("game_packs")
          .select("id,educational_value_avg")
          .eq("lesson_id", lessonId);
        const packIds = (packs ?? []).map((p) => p.id);
        if (!packIds.length) {
          if (!cancelled) setStats({ attempts: 0, successRate: 0, avgSeconds: 0, packs: 0, avgEducationalValue: 0 });
          return;
        }
        const avgEV = (packs ?? []).reduce((s, p) => s + Number(p.educational_value_avg ?? 0), 0) / packs!.length;
        const { data: rows } = await supabase
          .from("game_attempts")
          .select("game_type,success,duration_ms")
          .in("pack_id", packIds);
        const attempts = rows ?? [];
        const successes = attempts.filter((a) => a.success).length;
        const totalMs = attempts.reduce((s, a) => s + Number(a.duration_ms ?? 0), 0);
        const byType = new Map<string, { s: number; n: number }>();
        for (const a of attempts) {
          const k = String(a.game_type ?? "unknown");
          const cur = byType.get(k) ?? { s: 0, n: 0 };
          cur.n += 1;
          if (a.success) cur.s += 1;
          byType.set(k, cur);
        }
        let topStruggle: Stats["topStruggle"] | undefined;
        for (const [game_type, { s, n }] of byType) {
          if (n < 2) continue;
          const rate = s / n;
          if (!topStruggle || rate < topStruggle.success_rate) {
            topStruggle = { game_type, success_rate: rate, attempts: n };
          }
        }
        if (!cancelled) {
          setStats({
            attempts: attempts.length,
            successRate: attempts.length ? successes / attempts.length : 0,
            avgSeconds: attempts.length ? totalMs / attempts.length / 1000 : 0,
            packs: packs!.length,
            avgEducationalValue: avgEV,
            topStruggle,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lessonId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-orange-200 bg-white/70 p-2 text-[11px] text-orange-700">
        Loading game attempts…
      </div>
    );
  }
  if (!stats || stats.attempts === 0) {
    return (
      <div className="rounded-xl border border-orange-200 bg-white/70 p-2 text-[11px] text-orange-800">
        No game rounds played yet — publish and wait for data.
      </div>
    );
  }

  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return (
    <div className="rounded-xl border border-orange-200 bg-white/70 p-2 space-y-1">
      <div className="text-[10px] font-bold uppercase tracking-widest text-orange-700">
        Game attempts
      </div>
      <div className="grid grid-cols-2 gap-1 text-[11px]">
        <Stat label="Rounds" value={stats.attempts.toString()} />
        <Stat label="Success" value={pct(stats.successRate)} />
        <Stat label="Avg time" value={`${stats.avgSeconds.toFixed(1)}s`} />
        <Stat label="Edu value" value={stats.avgEducationalValue.toFixed(2)} />
      </div>
      {stats.topStruggle && (
        <div className="rounded-md bg-rose-50 px-2 py-1 text-[11px] text-rose-800">
          ⚠ Hardest round: <b>{stats.topStruggle.game_type}</b> · {pct(stats.topStruggle.success_rate)} success ({stats.topStruggle.attempts})
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-orange-50 px-2 py-1">
      <div className="text-[9px] font-semibold uppercase text-orange-600">{label}</div>
      <div className="text-xs font-bold text-orange-900">{value}</div>
    </div>
  );
}
