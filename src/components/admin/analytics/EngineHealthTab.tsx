/**
 * Engine Health Monitor — flags engines whose 7-day accuracy dropped below
 * threshold or whose drop-off (started but < 80% accuracy) exceeded threshold.
 * Includes one-click auto-mitigation that eases difficulty for struggling engines
 * via the engineAutoTune cache (tier-6, never overrides CEFR).
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Activity, AlertTriangle, CheckCircle2, Wrench } from "lucide-react";

const ACC_FLOOR = 0.5;
const DROPOFF_CEILING = 0.4;
const MITIGATION_KEY = "engleuphoria.engine.healthMitigations.v1";

interface Health {
  engine: string;
  runs: number;
  avgAcc: number;
  dropOff: number;
  status: "healthy" | "warning" | "critical";
}

function readMitigations(): Record<string, { at: number; easedTo: number }> {
  try { return JSON.parse(localStorage.getItem(MITIGATION_KEY) || "{}"); } catch { return {}; }
}
function writeMitigations(v: Record<string, { at: number; easedTo: number }>) {
  try { localStorage.setItem(MITIGATION_KEY, JSON.stringify(v)); } catch { /* quota */ }
}

interface AutoHealEntry {
  id: string;
  engine: string;
  hub: string | null;
  reason: string | null;
  created_at: string;
  reverted?: boolean;
}

export default function EngineHealthTab() {
  const [rows, setRows] = useState<Health[]>([]);
  const [loading, setLoading] = useState(true);
  const [mitigations, setMitigations] = useState<Record<string, { at: number; easedTo: number }>>({});
  const [autoHeals, setAutoHeals] = useState<AutoHealEntry[]>([]);
  const [sparkDaily, setSparkDaily] = useState<number[]>([]);

  useEffect(() => { setMitigations(readMitigations()); }, []);

  const loadAutoHeals = async () => {
    const since14 = new Date(Date.now() - 14 * 86400_000).toISOString();
    const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();
    const [{ data: recent }, { data: month }] = await Promise.all([
      supabase
        .from("analytics_tuning_log")
        .select("id, engine, hub, reason, created_at, action, delta")
        .eq("action", "auto_heal_ease")
        .gte("created_at", since14)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("analytics_tuning_log")
        .select("created_at")
        .eq("action", "auto_heal_ease")
        .gte("created_at", since30)
        .limit(2000),
    ]);
    setAutoHeals(((recent as any[]) || []).map((r) => ({
      id: r.id, engine: r.engine, hub: r.hub, reason: r.reason, created_at: r.created_at,
      reverted: (r.delta && (r.delta as any).reverted) === true,
    })));
    // Build 30-day daily counts (index 0 = 29 days ago … 29 = today).
    const buckets = new Array(30).fill(0);
    const startMs = Date.now() - 29 * 86400_000;
    const day0 = new Date(startMs); day0.setHours(0, 0, 0, 0);
    ((month as any[]) || []).forEach((r) => {
      const t = new Date(r.created_at).getTime();
      const idx = Math.floor((t - day0.getTime()) / 86400_000);
      if (idx >= 0 && idx < 30) buckets[idx]++;
    });
    setSparkDaily(buckets);
  };

  useEffect(() => { loadAutoHeals(); }, []);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("student_engine_runs")
        .select("engine, accuracy")
        .gte("created_at", since)
        .limit(5000);
      const buckets: Record<string, number[]> = {};
      for (const r of (data || []) as any[]) {
        (buckets[r.engine] ||= []).push(Number(r.accuracy) || 0);
      }
      const health: Health[] = Object.entries(buckets).map(([engine, accs]) => {
        const avg = accs.reduce((s, a) => s + a, 0) / accs.length;
        const dropOff = accs.filter((a) => a < 0.8).length / accs.length;
        const status: Health["status"] =
          avg < ACC_FLOOR || dropOff > DROPOFF_CEILING
            ? "critical"
            : avg < ACC_FLOOR + 0.1 || dropOff > DROPOFF_CEILING - 0.1
            ? "warning"
            : "healthy";
        return { engine, runs: accs.length, avgAcc: avg, dropOff, status };
      });
      setRows(health.sort((a, b) => a.avgAcc - b.avgAcc));
      setLoading(false);
    })();
  }, []);

  const mitigate = (r: Health) => {
    // Eases the engine one difficulty tier by seeding a low avg in the
    // engineAutoTune cache. engineSlotInjector reads this and downshifts.
    const easedTo = Math.max(0.35, r.avgAcc - 0.1);
    try {
      localStorage.setItem(
        "engleuphoria.engine.autoTune.v1",
        JSON.stringify({ avg: easedTo, at: Date.now(), source: `health-mitigation:${r.engine}` }),
      );
    } catch { /* quota */ }
    const next = { ...readMitigations(), [r.engine]: { at: Date.now(), easedTo } };
    writeMitigations(next);
    setMitigations(next);
    toast({
      title: `Eased ${r.engine.replace(/_/g, " ")}`,
      description: `Difficulty lowered — new lessons will scaffold more heavily. Revert after next healthy window.`,
    });
  };

  const badgeFor = (s: Health["status"]) =>
    s === "critical"
      ? { icon: AlertTriangle, cls: "bg-red-100 text-red-700 border-red-300", label: "Critical" }
      : s === "warning"
      ? { icon: AlertTriangle, cls: "bg-amber-100 text-amber-700 border-amber-300", label: "Warning" }
      : { icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-700 border-emerald-300", label: "Healthy" };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" /> Engine Health (last 7 days)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Alerts when average accuracy &lt; {Math.round(ACC_FLOOR * 100)}% or
          drop-off exceeds {Math.round(DROPOFF_CEILING * 100)}%. Mitigate eases
          the difficulty tier for future lessons (tier-6, never overrides CEFR).
        </p>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">No runs in the last 7 days.</p>
        )}
        <div className="grid gap-2">
          {rows.map((r) => {
            const b = badgeFor(r.status);
            const Icon = b.icon;
            const m = mitigations[r.engine];
            return (
              <div
                key={r.engine}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <div className="font-semibold capitalize">{r.engine.replace(/_/g, " ")}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.runs} runs · {Math.round(r.avgAcc * 100)}% avg ·{" "}
                    {Math.round(r.dropOff * 100)}% drop-off
                    {m ? ` · eased ${new Date(m.at).toLocaleDateString()}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`gap-1.5 ${b.cls}`}>
                    <Icon className="h-3 w-3" /> {b.label}
                  </Badge>
                  {r.status !== "healthy" ? (
                    <Button size="sm" variant="outline" onClick={() => mitigate(r)}>
                      <Wrench className="h-3.5 w-3.5 mr-1" /> Mitigate
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Auto-heal decisions (last 14 days)</h3>
            <Button size="sm" variant="ghost" onClick={loadAutoHeals}>Refresh</Button>
          </div>
          <AutoHealSparkline daily={sparkDaily} />
          {autoHeals.length === 0 ? (
            <p className="text-xs text-muted-foreground">No auto-heal decisions logged.</p>
          ) : (
            <div className="grid gap-1.5">
              {autoHeals.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-xs p-2 rounded border">
                  <div>
                    <span className="font-semibold capitalize">{a.engine.replace(/_/g, " ")}</span>
                    <span className="text-muted-foreground"> · {a.hub || "—"} · {new Date(a.created_at).toLocaleString()}</span>
                    {a.reason ? <div className="text-muted-foreground">{a.reason}</div> : null}
                  </div>
                  {a.reverted ? (
                    <Badge variant="outline">Reverted</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const { error } = await supabase
                          .from("analytics_tuning_log")
                          .update({ delta: { reverted: true, at: new Date().toISOString() } })
                          .eq("id", a.id);
                        if (error) {
                          toast({ title: "Revert failed", description: error.message, variant: "destructive" });
                          return;
                        }
                        toast({ title: "Auto-heal reverted", description: "Future lessons will not eased for this engine." });
                        loadAutoHeals();
                      }}
                    >Revert</Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AutoHealSparkline({ daily }: { daily: number[] }) {
  if (!daily.length) return null;
  const max = Math.max(1, ...daily);
  const w = 240, h = 36, step = w / (daily.length - 1 || 1);
  const points = daily.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * (h - 4) - 2).toFixed(1)}`).join(" ");
  const total = daily.reduce((s, v) => s + v, 0);
  return (
    <div className="flex items-center gap-3 rounded border bg-muted/30 p-2">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" aria-label="Auto-heal daily counts, last 30 days">
        <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} points={points} />
        {daily.map((v, i) => (
          <circle key={i} cx={i * step} cy={h - (v / max) * (h - 4) - 2} r={v > 0 ? 1.6 : 0} fill="hsl(var(--primary))" />
        ))}
      </svg>
      <div className="text-[10px] text-muted-foreground leading-tight">
        <div><span className="font-semibold text-foreground">{total}</span> ease actions</div>
        <div>peak {max}/day · 30-day trend</div>
      </div>
    </div>
  );
}



