/**
 * HomeworkAnalyticsTile — read-only summary of student attempts on the
 * currently-authored homework for a given lesson. Reads from
 * `homework_packs` + `homework_attempts` (both filtered by `lesson_id`).
 *
 * No writes, no new tables. Renders inside HomeworkTab.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  attempts: number;
  successRate: number;      // 0..1
  avgMinutes: number;
  completionRate: number;   // 0..1 over packs
  topStruggle?: { task_type: string; success_rate: number; attempts: number };
}

export function HomeworkAnalyticsTile({ lessonId }: { lessonId: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: packs } = await supabase
          .from("homework_packs")
          .select("id,status")
          .eq("lesson_id", lessonId);
        const packIds = (packs ?? []).map((p) => p.id);
        if (!packIds.length) {
          if (!cancelled) setStats({ attempts: 0, successRate: 0, avgMinutes: 0, completionRate: 0 });
          return;
        }
        const completed = (packs ?? []).filter((p) => p.status === "completed").length;
        const { data: rows } = await supabase
          .from("homework_attempts")
          .select("task_type,success,time_spent_ms")
          .in("pack_id", packIds);
        const attempts = rows ?? [];
        const successes = attempts.filter((a) => a.success).length;
        const totalMs = attempts.reduce((s, a) => s + Number(a.time_spent_ms ?? 0), 0);
        // group struggle
        const byType = new Map<string, { s: number; n: number }>();
        for (const a of attempts) {
          const k = String(a.task_type ?? "unknown");
          const cur = byType.get(k) ?? { s: 0, n: 0 };
          cur.n += 1;
          if (a.success) cur.s += 1;
          byType.set(k, cur);
        }
        let topStruggle: Stats["topStruggle"] | undefined;
        for (const [task_type, { s, n }] of byType) {
          if (n < 2) continue;
          const rate = s / n;
          if (!topStruggle || rate < topStruggle.success_rate) {
            topStruggle = { task_type, success_rate: rate, attempts: n };
          }
        }
        if (!cancelled) {
          setStats({
            attempts: attempts.length,
            successRate: attempts.length ? successes / attempts.length : 0,
            avgMinutes: attempts.length ? totalMs / attempts.length / 60_000 : 0,
            completionRate: packs?.length ? completed / packs.length : 0,
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
        Loading student attempts…
      </div>
    );
  }
  if (!stats || stats.attempts === 0) {
    return (
      <div className="rounded-xl border border-orange-200 bg-white/70 p-2 text-[11px] text-orange-800">
        No student attempts yet — publish and wait for data.
      </div>
    );
  }

  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return (
    <div className="rounded-xl border border-orange-200 bg-white/70 p-2 space-y-1">
      <div className="text-[10px] font-bold uppercase tracking-widest text-orange-700">
        Student attempts
      </div>
      <div className="grid grid-cols-2 gap-1 text-[11px]">
        <Stat label="Attempts" value={stats.attempts.toString()} />
        <Stat label="Success" value={pct(stats.successRate)} />
        <Stat label="Avg time" value={`${stats.avgMinutes.toFixed(1)} min`} />
        <Stat label="Completion" value={pct(stats.completionRate)} />
      </div>
      {stats.topStruggle && (
        <div className="rounded-md bg-rose-50 px-2 py-1 text-[11px] text-rose-800">
          ⚠ Hardest task: <b>{stats.topStruggle.task_type}</b> · {pct(stats.topStruggle.success_rate)} success ({stats.topStruggle.attempts})
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
