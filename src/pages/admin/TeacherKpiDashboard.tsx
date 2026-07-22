import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, Users, Clock, Star, AlertTriangle, Download, RefreshCw, Gift } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from "recharts";
import { toast } from "sonner";
import { calculateKpiBonus, formatBonusNote } from "@/lib/kpiBonus";

type TeacherRow = {
  teacher_id: string;
  name: string;
  avatar: string | null;
  rating: number;
  total_reviews: number;
  lessons_taught: number;
  total_minutes_taught: number;
  attendance_rate: number;
  lesson_quality_score: number;
  student_progress_impact: number;
  response_time_score: number;
  feedback_completion_rate: number;
  curriculum_coverage: number;
  overall_kpi_score: number;
  last_lesson_at: string | null;
  earnings_30d: number;
  completions_30d: number;
  cancellations_30d: number;
  active_students: number;
  retention_rate: number;
};

const tier = (score: number) => {
  if (score >= 85) return { label: "Excellent", color: "bg-emerald-500" };
  if (score >= 70) return { label: "Strong", color: "bg-blue-500" };
  if (score >= 55) return { label: "On Track", color: "bg-amber-500" };
  return { label: "At Risk", color: "bg-red-500" };
};

export default function TeacherKpiDashboard() {
  const [rows, setRows] = useState<TeacherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [trends, setTrends] = useState<Record<string, { d: string; v: number }[]>>({});
  const [alerts, setAlerts] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<TeacherRow | null>(null);
  const [recomputing, setRecomputing] = useState(false);

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - 30 * 864e5).toISOString();

    const [metrics, profiles, earnings, bookings, snaps, alertRows] = await Promise.all([
      supabase.from("teacher_performance_metrics").select("*"),
      supabase.from("teacher_profiles").select("user_id, profile_image_url, rating, total_reviews"),
      supabase.from("teacher_earnings").select("teacher_id, teacher_amount, earned_at").gte("earned_at", since),
      supabase.from("class_bookings").select("teacher_id, status, scheduled_at").gte("scheduled_at", since),
      supabase.from("teacher_kpi_snapshots").select("teacher_id, snapshot_date, overall_kpi_score")
        .gte("snapshot_date", new Date(Date.now() - 84 * 864e5).toISOString().slice(0, 10)),
      supabase.from("teacher_kpi_alerts").select("teacher_id, consecutive_weeks")
        .gte("week_start", new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)),
    ]);

    const trendMap: Record<string, { d: string; v: number }[]> = {};
    (snaps.data ?? []).forEach((s: any) => {
      (trendMap[s.teacher_id] ??= []).push({ d: s.snapshot_date, v: Number(s.overall_kpi_score) });
    });
    Object.values(trendMap).forEach((arr) => arr.sort((a, b) => a.d.localeCompare(b.d)));
    setTrends(trendMap);

    const alertMap: Record<string, number> = {};
    (alertRows.data ?? []).forEach((a: any) => { alertMap[a.teacher_id] = a.consecutive_weeks; });
    setAlerts(alertMap);

    // metrics/profiles/earnings/bookings already fetched above
    const teacherIds = Array.from(new Set((metrics.data ?? []).map((m: any) => m.teacher_id)));
    const { data: users } = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .in("id", teacherIds.length ? teacherIds : ["00000000-0000-0000-0000-000000000000"]);

    const profileByUser = new Map((profiles.data ?? []).map((p: any) => [p.user_id, p]));
    const userById = new Map((users ?? []).map((u: any) => [u.id, u]));

    const earnById = new Map<string, number>();
    (earnings.data ?? []).forEach((e: any) => {
      earnById.set(e.teacher_id, (earnById.get(e.teacher_id) ?? 0) + Number(e.teacher_amount ?? 0));
    });

    const compById = new Map<string, number>();
    const cancById = new Map<string, number>();
    (bookings.data ?? []).forEach((b: any) => {
      if (b.status === "completed") compById.set(b.teacher_id, (compById.get(b.teacher_id) ?? 0) + 1);
      if (b.status === "cancelled") cancById.set(b.teacher_id, (cancById.get(b.teacher_id) ?? 0) + 1);
    });

    const merged: TeacherRow[] = (metrics.data ?? []).map((m: any) => {
      const p = profileByUser.get(m.teacher_id) ?? {};
      const u = userById.get(m.teacher_id) ?? {};
      return {
        teacher_id: m.teacher_id,
        name: [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email || "Unknown",
        avatar: p.profile_image_url ?? null,
        rating: Number(p.rating ?? 0),
        total_reviews: Number(p.total_reviews ?? 0),
        lessons_taught: m.lessons_taught ?? 0,
        total_minutes_taught: m.total_minutes_taught ?? 0,
        attendance_rate: Number(m.attendance_rate ?? 0),
        lesson_quality_score: Number(m.lesson_quality_score ?? 0),
        student_progress_impact: Number(m.student_progress_impact ?? 0),
        response_time_score: Number(m.response_time_score ?? 0),
        feedback_completion_rate: Number(m.feedback_completion_rate ?? 0),
        curriculum_coverage: Number(m.curriculum_coverage ?? 0),
        overall_kpi_score: Number(m.overall_kpi_score ?? 0),
        last_lesson_at: m.last_lesson_at,
        earnings_30d: earnById.get(m.teacher_id) ?? 0,
        completions_30d: compById.get(m.teacher_id) ?? 0,
        cancellations_30d: cancById.get(m.teacher_id) ?? 0,
        active_students: Number(m.active_students ?? 0),
        retention_rate: Number(m.retention_rate ?? 0),
      };
    });

    merged.sort((a, b) => b.overall_kpi_score - a.overall_kpi_score);
    setRows(merged);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const id = searchParams.get("teacher");
    if (!id || rows.length === 0) return;
    const row = rows.find((r) => r.teacher_id === id);
    if (row) setSelected(row);
  }, [searchParams, rows]);

  const handleSelect = (row: TeacherRow | null) => {
    setSelected(row);
    const next = new URLSearchParams(searchParams);
    if (row) next.set("teacher", row.teacher_id);
    else next.delete("teacher");
    setSearchParams(next, { replace: true });
  };

  const recompute = async () => {
    setRecomputing(true);
    const { error } = await supabase.rpc("recompute_teacher_kpis");
    if (error) toast.error("Recompute failed: " + error.message);
    else { toast.success("KPIs recomputed"); await load(); }
    setRecomputing(false);
  };

  const exportCsv = () => {
    const header = ["Teacher","KPI","Quality","Attendance","Progress","Response","Feedback","Curriculum","Rating","Reviews","Students","Retention%","Lessons","Minutes","30d Completed","30d Cancelled","30d Earnings"];
    const csv = [header.join(",")].concat(
      filtered.map((r) => [
        `"${r.name.replace(/"/g,'""')}"`, r.overall_kpi_score.toFixed(0),
        r.lesson_quality_score.toFixed(0), r.attendance_rate.toFixed(0),
        r.student_progress_impact.toFixed(0), r.response_time_score.toFixed(0),
        r.feedback_completion_rate.toFixed(0), r.curriculum_coverage.toFixed(0),
        r.rating.toFixed(1), r.total_reviews,
        r.active_students, r.retention_rate.toFixed(0),
        r.lessons_taught, r.total_minutes_taught,
        r.completions_30d, r.cancellations_30d, r.earnings_30d.toFixed(0),
      ].join(","))
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `teacher-kpi-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const filtered = useMemo(
    () => rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase())),
    [rows, q],
  );

  const summary = useMemo(() => {
    if (!rows.length) return null;
    const avg = (k: keyof TeacherRow) =>
      rows.reduce((s, r) => s + (Number(r[k]) || 0), 0) / rows.length;
    return {
      avgKpi: avg("overall_kpi_score"),
      totalLessons: rows.reduce((s, r) => s + r.lessons_taught, 0),
      atRisk: rows.filter((r) => r.overall_kpi_score < 55).length,
      topRated: rows.filter((r) => r.rating >= 4.5).length,
    };
  }, [rows]);

  const atRiskList = filtered.filter((r) => (alerts[r.teacher_id] ?? 0) >= 2);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Teacher KPI Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor teacher performance across quality, attendance, progress impact, and earnings.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={recompute} disabled={recomputing}>
            <RefreshCw className={`w-4 h-4 mr-1 ${recomputing ? "animate-spin" : ""}`} />
            Recompute
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-1" /> CSV
          </Button>
        </div>
      </header>

      {atRiskList.length > 0 && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-semibold mb-2">
              <AlertTriangle className="w-5 h-5" />
              {atRiskList.length} teacher(s) at-risk (KPI &lt; 55 for ≥2 weeks)
            </div>
            <div className="flex flex-wrap gap-2">
              {atRiskList.map((r) => (
                <Badge key={r.teacher_id} variant="destructive" className="cursor-pointer"
                  onClick={() => handleSelect(r)}>
                  {r.name} · {alerts[r.teacher_id]}w
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard icon={<TrendingUp className="w-4 h-4" />} label="Avg KPI" value={summary.avgKpi.toFixed(1)} />
          <KpiCard icon={<Clock className="w-4 h-4" />} label="Lessons Taught" value={summary.totalLessons.toString()} />
          <KpiCard icon={<Star className="w-4 h-4" />} label="Top Rated (≥4.5)" value={summary.topRated.toString()} />
          <KpiCard icon={<AlertTriangle className="w-4 h-4" />} label="At Risk" value={summary.atRisk.toString()} />
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" /> Teachers ({filtered.length})
          </CardTitle>
          <Input
            placeholder="Search teacher…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>KPI</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead>Curriculum</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Retention</TableHead>
                    <TableHead>Lessons</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>30d ✓ / ✗</TableHead>
                    <TableHead>30d €</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const t = tier(r.overall_kpi_score);
                    const trend = trends[r.teacher_id] ?? [];
                    return (
                      <TableRow key={r.teacher_id} className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSelect(r)}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {r.avatar ? (
                              <img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
                                {r.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{r.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {r.last_lesson_at ? new Date(r.last_lesson_at).toLocaleDateString() : "No lessons"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[140px]">
                            <Badge className={`${t.color} text-white border-0`}>{t.label}</Badge>
                            <span className="font-mono text-sm">{r.overall_kpi_score.toFixed(0)}</span>
                          </div>
                          <Progress value={r.overall_kpi_score} className="h-1 mt-1" />
                        </TableCell>
                        <MetricCell v={r.lesson_quality_score} />
                        <MetricCell v={r.attendance_rate} />
                        <MetricCell v={r.student_progress_impact} />
                        <MetricCell v={r.response_time_score} />
                        <MetricCell v={r.feedback_completion_rate} />
                        <MetricCell v={r.curriculum_coverage} />
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{r.rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({r.total_reviews})</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{r.active_students}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[90px]">
                            <span className={`font-mono text-sm ${r.retention_rate >= 70 ? "text-emerald-600" : r.retention_rate >= 40 ? "text-amber-600" : "text-red-600"}`}>
                              {r.retention_rate.toFixed(0)}%
                            </span>
                            <Progress value={r.retention_rate} className="h-1 flex-1" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{r.lessons_taught}</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(r.total_minutes_taught / 60)}h
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-20 h-8">
                            {trend.length > 1 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trend}>
                                  <YAxis domain={[0, 100]} hide />
                                  <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))"
                                    strokeWidth={1.5} dot={false} />
                                  <Tooltip content={() => null} />
                                </LineChart>
                              </ResponsiveContainer>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-emerald-600">{r.completions_30d}</span>
                          {" / "}
                          <span className="text-red-600">{r.cancellations_30d}</span>
                        </TableCell>
                        <TableCell className="font-mono">€{r.earnings_30d.toFixed(0)}</TableCell>
                      </TableRow>
                    );
                  })}
                  {!filtered.length && (
                    <TableRow>
                      <TableCell colSpan={15} className="text-center text-muted-foreground py-6">
                        No teachers match your filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TeacherDrillDown row={selected} trend={selected ? trends[selected.teacher_id] ?? [] : []}
        weeksAtRisk={selected ? alerts[selected.teacher_id] ?? 0 : 0}
        onClose={() => handleSelect(null)} />
    </div>
  );
}

function TeacherDrillDown({
  row, trend, weeksAtRisk, onClose,
}: {
  row: TeacherRow | null;
  trend: { d: string; v: number }[];
  weeksAtRisk: number;
  onClose: () => void;
}) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [cancellations, setCancellations] = useState<any[]>([]);

  useEffect(() => {
    if (!row) return;
    (async () => {
      const [rev, canc] = await Promise.all([
        supabase.from("teacher_reviews").select("rating, comment, created_at")
          .eq("teacher_id", row.teacher_id).order("created_at", { ascending: false }).limit(10),
        supabase.from("class_bookings").select("scheduled_at, cancellation_reason, status")
          .eq("teacher_id", row.teacher_id).in("status", ["cancelled", "no_show"])
          .order("scheduled_at", { ascending: false }).limit(10),
      ]);
      setReviews(rev.data ?? []);
      setCancellations(canc.data ?? []);
    })();
  }, [row]);

  if (!row) return null;
  const t = tier(row.overall_kpi_score);

  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {row.avatar && <img src={row.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />}
            <div>
              <div>{row.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${t.color} text-white border-0`}>{t.label} · {row.overall_kpi_score.toFixed(0)}</Badge>
                {weeksAtRisk >= 2 && (
                  <Badge variant="destructive">{weeksAtRisk} weeks at-risk</Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {trend.length > 1 && (
            <div>
              <div className="text-sm font-medium mb-2">KPI Trend</div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div>
            <div className="text-sm font-medium mb-2">Recent Reviews ({reviews.length})</div>
            {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
            <div className="space-y-2">
              {reviews.map((r, i) => (
                <div key={i} className="border rounded p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-mono">{r.rating}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {r.comment && <p className="mt-1 text-muted-foreground">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Recent Cancellations / No-shows ({cancellations.length})</div>
            {cancellations.length === 0 && <p className="text-sm text-muted-foreground">None recorded.</p>}
            <div className="space-y-2">
              {cancellations.map((c, i) => (
                <div key={i} className="border rounded p-2 text-sm flex justify-between">
                  <span>{new Date(c.scheduled_at).toLocaleString()}</span>
                  <span className="text-muted-foreground">
                    {c.status} {c.cancellation_reason ? `— ${c.cancellation_reason}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <BonusPanel row={row} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BonusPanel({ row }: { row: TeacherRow }) {
  const [queuing, setQueuing] = useState(false);
  const [queuedId, setQueuedId] = useState<string | null>(null);

  const calc = useMemo(() => calculateKpiBonus(
    {
      overall_kpi_score: row.overall_kpi_score,
      attendance_rate: row.attendance_rate,
      lesson_quality_score: row.lesson_quality_score,
      student_progress_impact: row.student_progress_impact,
      response_time_score: row.response_time_score,
      feedback_completion_rate: row.feedback_completion_rate,
      curriculum_coverage: row.curriculum_coverage,
    },
    row.earnings_30d,
  ), [row]);

  const periodEnd = new Date();
  const periodStart = new Date(Date.now() - 30 * 864e5);
  const periodLabel = `${periodStart.toISOString().slice(0, 10)} → ${periodEnd.toISOString().slice(0, 10)}`;

  const queueBonus = async () => {
    if (!calc.eligible || calc.bonusAmount <= 0) return;
    setQueuing(true);
    const { data, error } = await supabase.from("teacher_payouts_ledger").insert({
      teacher_user_id: row.teacher_id,
      period_start: periodStart.toISOString().slice(0, 10),
      period_end: periodEnd.toISOString().slice(0, 10),
      classes_count: row.completions_30d,
      rate_applied: calc.totalPct,
      amount: calc.bonusAmount,
      currency: "USD",
      status: "pending",
      notes: formatBonusNote(calc, periodLabel),
    }).select("id").single();
    setQueuing(false);
    if (error) {
      toast.error(`Could not queue bonus: ${error.message}`);
      return;
    }
    setQueuedId(data?.id ?? null);
    toast.success(`Bonus of $${calc.bonusAmount.toFixed(2)} queued`);
  };

  return (
    <div className="rounded-lg border p-4 bg-muted/30">
      <div className="flex items-center gap-2 mb-3">
        <Gift className="w-4 h-4 text-primary" />
        <div className="text-sm font-medium">KPI Payroll Bonus (last 30 days)</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
        <div>
          <div className="text-xs text-muted-foreground">Tier</div>
          <div className="font-mono">{calc.baseTier}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Base + Kickers</div>
          <div className="font-mono">{calc.basePct}% + {calc.kickerPct}%</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Earnings Base</div>
          <div className="font-mono">${row.earnings_30d.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Bonus</div>
          <div className="font-mono font-bold text-emerald-600">
            ${calc.bonusAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {calc.kickers.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {calc.kickers.map((k) => (
            <Badge key={k} variant="secondary" className="text-xs">+1% {k}</Badge>
          ))}
        </div>
      )}

      {!calc.eligible && (
        <p className="text-xs text-muted-foreground mb-3">
          {row.overall_kpi_score < 55
            ? "Not eligible: overall KPI below 55."
            : "Not eligible: no earnings in the last 30 days."}
        </p>
      )}

      <Button
        size="sm"
        onClick={queueBonus}
        disabled={!calc.eligible || calc.bonusAmount <= 0 || queuing || !!queuedId}
      >
        {queuedId ? "Queued ✓" : queuing ? "Queuing…" : `Queue $${calc.bonusAmount.toFixed(2)} bonus`}
      </Button>
    </div>
  );
}

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          {icon} {label}
        </div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}

function MetricCell({ v }: { v: number }) {
  const pct = Math.max(0, Math.min(100, v));
  const color = pct >= 85 ? "text-emerald-600" : pct >= 70 ? "text-blue-600" : pct >= 55 ? "text-amber-600" : "text-red-600";
  return (
    <TableCell>
      <div className={`font-mono text-sm ${color}`}>{pct.toFixed(0)}</div>
      <Progress value={pct} className="h-1 w-16 mt-1" />
    </TableCell>
  );
}
