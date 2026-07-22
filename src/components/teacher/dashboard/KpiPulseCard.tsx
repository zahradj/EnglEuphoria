import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, TrendingUp, TrendingDown, Trophy, Flame, ArrowRight, Target } from "lucide-react";
import { calculateKpiBonus } from "@/lib/kpiBonus";
import { useBonusPolicy } from "@/hooks/useBonusPolicy";
import { cn } from "@/lib/utils";

type Metric = {
  overall_kpi_score: number;
  lesson_quality_score: number;
  attendance_rate: number;
  student_progress_impact: number;
  response_time_score: number;
  feedback_completion_rate: number;
  curriculum_coverage: number;
};

const SUB_LABELS: Array<[keyof Metric, string]> = [
  ["lesson_quality_score", "Quality"],
  ["attendance_rate", "Attendance"],
  ["student_progress_impact", "Progress"],
  ["response_time_score", "Response"],
  ["feedback_completion_rate", "Feedback"],
  ["curriculum_coverage", "Curriculum"],
];

function tierFor(score: number) {
  if (score >= 95) return { label: "Elite",     accent: "text-fuchsia-500",  ring: "stroke-fuchsia-500", chip: "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/30",  bar: "bg-fuchsia-500", glow: "shadow-[0_0_40px_-18px_hsl(var(--primary)/0.5)]" };
  if (score >= 85) return { label: "Excellent", accent: "text-emerald-500",  ring: "stroke-emerald-500", chip: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",  bar: "bg-emerald-500", glow: "shadow-[0_0_40px_-18px_hsl(var(--primary)/0.4)]" };
  if (score >= 70) return { label: "Strong",    accent: "text-sky-500",      ring: "stroke-sky-500",     chip: "bg-sky-500/10 text-sky-600 border-sky-500/30",              bar: "bg-sky-500",     glow: "shadow-[0_0_40px_-18px_hsl(var(--primary)/0.35)]" };
  if (score >= 55) return { label: "On Track",  accent: "text-amber-500",    ring: "stroke-amber-500",   chip: "bg-amber-500/10 text-amber-600 border-amber-500/30",        bar: "bg-amber-500",   glow: "shadow-[0_0_40px_-18px_hsl(var(--primary)/0.3)]" };
  return                { label: "At Risk",   accent: "text-rose-500",     ring: "stroke-rose-500",    chip: "bg-rose-500/10 text-rose-600 border-rose-500/30",           bar: "bg-rose-500",    glow: "shadow-[0_0_40px_-18px_hsl(var(--destructive)/0.4)]" };
}

function Ring({ score, className }: { score: number; className: string }) {
  const R = 54;
  const C = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const [dash, setDash] = useState(C);
  useEffect(() => {
    const t = setTimeout(() => setDash(C * (1 - pct)), 60);
    return () => clearTimeout(t);
  }, [pct, C]);
  return (
    <svg viewBox="0 0 130 130" className="w-32 h-32 -rotate-90">
      <circle cx="65" cy="65" r={R} className="fill-none stroke-muted" strokeWidth="10" />
      <circle
        cx="65"
        cy="65"
        r={R}
        className={cn("fill-none transition-[stroke-dashoffset] duration-[1400ms] ease-out", className)}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={dash}
      />
    </svg>
  );
}

export function KpiPulseCard() {
  const { user } = useAuth();
  const { policy } = useBonusPolicy();
  const [metric, setMetric] = useState<Metric | null>(null);
  const [spark, setSpark] = useState<number[]>([]);
  const [earnings30d, setEarnings30d] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const since = new Date(Date.now() - 30 * 864e5).toISOString();
      const [m, snaps, earn] = await Promise.all([
        supabase.from("teacher_performance_metrics").select("*").eq("teacher_id", user.id).maybeSingle(),
        supabase.from("teacher_kpi_snapshots").select("overall_kpi_score")
          .eq("teacher_id", user.id).order("snapshot_date", { ascending: true }).limit(30),
        supabase.from("teacher_earnings").select("teacher_amount")
          .eq("teacher_id", user.id).gte("earned_at", since),
      ]);
      setMetric((m.data as Metric | null) ?? null);
      setSpark((snaps.data ?? []).map((s: any) => Number(s.overall_kpi_score) || 0));
      setEarnings30d((earn.data ?? []).reduce((s: number, e: any) => s + Number(e.teacher_amount ?? 0), 0));
      setLoading(false);
    })();
  }, [user?.id]);

  const score = metric?.overall_kpi_score ?? 0;
  const tier = tierFor(score);
  const trending = spark.length > 1 ? spark[spark.length - 1] - spark[0] : 0;

  const bonus = useMemo(
    () => (metric ? calculateKpiBonus(metric as any, earnings30d, policy) : null),
    [metric, earnings30d, policy],
  );

  const weakest = useMemo(() => {
    if (!metric) return null;
    return SUB_LABELS
      .map(([k, l]) => ({ k, l, v: Number(metric[k]) || 0 }))
      .sort((a, b) => a.v - b.v)[0];
  }, [metric]);

  // Next tier progress
  const nextTarget = score >= 95 ? 100 : score >= 85 ? 95 : score >= 70 ? 85 : score >= 55 ? 70 : 55;
  const prevAnchor = score >= 95 ? 95 : score >= 85 ? 85 : score >= 70 ? 70 : score >= 55 ? 55 : 0;
  const toNext = Math.max(0, Math.round(nextTarget - score));
  const nextPct = Math.min(100, Math.max(0, ((score - prevAnchor) / (nextTarget - prevAnchor)) * 100));

  // Sparkline path
  const sparkPath = useMemo(() => {
    if (spark.length < 2) return "";
    const w = 120, h = 32;
    const min = Math.min(...spark), max = Math.max(...spark);
    const range = Math.max(1, max - min);
    return spark
      .map((v, i) => {
        const x = (i / (spark.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [spark]);

  if (loading) {
    return (
      <Card className="md:col-span-3 overflow-hidden">
        <CardContent className="p-6">
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!metric) {
    return (
      <Card className="md:col-span-3 overflow-hidden border-dashed">
        <CardContent className="p-6 flex items-center gap-3 text-muted-foreground">
          <Sparkles className="w-5 h-5" />
          Your KPI card unlocks after your first completed lessons.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("md:col-span-3 relative overflow-hidden", tier.glow)}>
      {/* Subtle accent wash — matches teacher dashboard neutral surface */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div aria-hidden className={cn("pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30", tier.bar)} />

      <CardContent className="relative p-6 grid grid-cols-1 lg:grid-cols-[auto_1fr_1fr] gap-6 items-center">
        {/* Left: score ring */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Ring score={score} className={tier.ring} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={cn("text-4xl font-black leading-none tabular-nums", tier.accent)}>
                {Math.round(score)}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">/ 100</div>
            </div>
          </div>
          <div className="space-y-2">
            <Badge variant="outline" className={cn("font-bold gap-1 border", tier.chip)}>
              <Trophy className="w-3.5 h-3.5" /> {tier.label}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {trending >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trending >= 0 ? "+" : ""}
              {trending.toFixed(1)} pts / 30d
            </div>
            {/* At-risk / tier threshold hint */}
            <div
              className={cn(
                "text-[11px] leading-tight rounded-md px-2 py-1 border",
                score < 55
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-600"
                  : score < 70
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-700"
                    : "bg-muted/40 border-border text-muted-foreground",
              )}
              title="Tier thresholds: 55 On Track · 70 Strong · 85 Excellent · 95 Elite"
            >
              {score < 55 ? (
                <><span className="font-bold">⚠ At risk.</span> Reach <b>55</b> to exit risk zone.</>
              ) : score < 70 ? (
                <>Careful — drop below <b>55</b> = at risk.</>
              ) : (
                <>Safe zone · risk below <b>55</b>.</>
              )}
            </div>
            {spark.length > 1 && (
              <svg viewBox="0 0 120 32" className="w-32 h-8 overflow-visible">
                <path
                  d={sparkPath}
                  fill="none"
                  className={tier.accent}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Middle: sub-score bars */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {SUB_LABELS.map(([k, l]) => {
            const v = Number(metric[k]) || 0;
            const hot = v >= 90;
            return (
              <div key={k} className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-muted-foreground flex items-center gap-1">
                    {hot && <Flame className={cn("w-3 h-3", tier.accent)} />} {l}
                  </span>
                  <span className="tabular-nums text-foreground">{Math.round(v)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000", tier.bar)}
                    style={{ width: `${Math.max(2, Math.min(100, v))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: gamified panel */}
        <div className="space-y-3">
          {bonus?.eligible && (
            <div className="rounded-xl bg-muted/40 border border-border px-4 py-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Projected bonus · 30d</div>
              <div className="text-2xl font-black tabular-nums text-foreground">
                ${bonus.bonusAmount.toFixed(2)}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {bonus.basePct}% base
                {bonus.kickerPct > 0 && <> · <span className={cn("font-semibold", tier.accent)}>+{bonus.kickerPct}% kickers</span></>}
              </div>
            </div>
          )}

          <div className="rounded-xl bg-muted/40 border border-border px-4 py-3">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Target className="w-3 h-3" />
                {score >= 95 ? "Elite maintained" : `${toNext} pts to next tier`}
              </span>
              <span className="text-muted-foreground tabular-nums">→ {nextTarget}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-1000", tier.bar)}
                style={{ width: `${nextPct}%` }}
              />
            </div>
            {weakest && score < 95 && (
              <div className="text-[11px] mt-2 text-muted-foreground">
                Fastest win: lift <span className="font-semibold text-foreground">{weakest.l}</span>
              </div>
            )}
          </div>

          <Button asChild size="sm" variant="outline" className="w-full font-semibold">
            <Link to="/teacher/kpi">
              View full performance <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default KpiPulseCard;
