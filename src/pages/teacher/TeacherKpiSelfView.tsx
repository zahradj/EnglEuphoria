import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, TrendingDown, Gift, ArrowLeft, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { calculateKpiBonus } from "@/lib/kpiBonus";
import { useBonusPolicy } from "@/hooks/useBonusPolicy";
import { toast } from "sonner";

type Metric = {
  overall_kpi_score: number;
  lesson_quality_score: number;
  attendance_rate: number;
  student_progress_impact: number;
  response_time_score: number;
  feedback_completion_rate: number;
  curriculum_coverage: number;
  lessons_taught: number;
};

type Snapshot = { snapshot_date: string; overall_kpi_score: number };

const TIPS: Record<keyof Metric | "overall_kpi_score", string> = {
  overall_kpi_score: "Focus on the lowest sub-score below to raise your overall KPI.",
  lesson_quality_score: "Request feedback at lesson end — higher ratings lift this fastest.",
  attendance_rate: "Confirm bookings 24h ahead; avoid last-minute cancellations.",
  student_progress_impact: "Assign homework and follow up on speech attempts.",
  response_time_score: "Reply to student messages within 12 hours.",
  feedback_completion_rate: "Leave 2+ sentences of written feedback after every lesson.",
  curriculum_coverage: "Complete each unit's 7-lesson arc; avoid skipping mastery quizzes.",
  lessons_taught: "",
};

export default function TeacherKpiSelfView() {
  const { user } = useAuth();
  const [metric, setMetric] = useState<Metric | null>(null);
  const [trend, setTrend] = useState<Snapshot[]>([]);
  const [alert, setAlert] = useState<{ consecutive_weeks: number; kpi_score: number } | null>(null);
  const [earnings30d, setEarnings30d] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const since = new Date(Date.now() - 30 * 864e5).toISOString();
      const [m, snaps, al, earn] = await Promise.all([
        supabase.from("teacher_performance_metrics").select("*").eq("teacher_id", user.id).maybeSingle(),
        supabase.from("teacher_kpi_snapshots").select("snapshot_date, overall_kpi_score")
          .eq("teacher_id", user.id).order("snapshot_date", { ascending: true }).limit(84),
        supabase.from("teacher_kpi_alerts").select("consecutive_weeks, kpi_score")
          .eq("teacher_id", user.id).order("week_start", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("teacher_earnings").select("teacher_amount")
          .eq("teacher_id", user.id).gte("earned_at", since),
      ]);
      setMetric(m.data as Metric | null);
      setTrend((snaps.data ?? []) as Snapshot[]);
      setAlert(al.data);
      setEarnings30d((earn.data ?? []).reduce((s: number, e: any) => s + Number(e.teacher_amount ?? 0), 0));
    })();
  }, [user]);

  if (!metric) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/teacher"><ArrowLeft className="w-4 h-4 mr-2" />Back to dashboard</Link>
        </Button>
        <p className="text-muted-foreground">
          No KPI data yet. Metrics appear after your first completed lessons.
        </p>
      </div>
    );
  }

  const subScores: [keyof Metric, string][] = [
    ["lesson_quality_score", "Lesson Quality"],
    ["attendance_rate", "Attendance"],
    ["student_progress_impact", "Student Progress"],
    ["response_time_score", "Response Time"],
    ["feedback_completion_rate", "Feedback Completion"],
    ["curriculum_coverage", "Curriculum Coverage"],
  ];

  const lowest = subScores
    .map(([k, l]) => ({ k, l, v: Number(metric[k]) }))
    .sort((a, b) => a.v - b.v)[0];

  const first = trend[0]?.overall_kpi_score ?? metric.overall_kpi_score;
  const last = trend[trend.length - 1]?.overall_kpi_score ?? metric.overall_kpi_score;
  const trending = last - first;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/teacher"><ArrowLeft className="w-4 h-4 mr-2" />Back to dashboard</Link>
      </Button>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Performance</h1>
          <p className="text-muted-foreground">
            Your KPI score reflects the last 30 days. Snapshots update nightly.
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {metric.overall_kpi_score.toFixed(0)} / 100
        </Badge>
      </header>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="w-4 h-4 text-primary" />
            How your KPI works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Your <strong className="text-foreground">Overall KPI</strong> is a weighted score from 0–100,
            recalculated nightly over the last 30 days across six sub-scores:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-muted-foreground">
            <li>• <strong className="text-foreground">Lesson Quality (25%)</strong> — student ratings & feedback.</li>
            <li>• <strong className="text-foreground">Attendance (20%)</strong> — punctuality, no-shows, cancellations.</li>
            <li>• <strong className="text-foreground">Student Progress (20%)</strong> — mastery, homework, speech attempts.</li>
            <li>• <strong className="text-foreground">Response Time (15%)</strong> — how fast you reply to messages.</li>
            <li>• <strong className="text-foreground">Feedback Completion (10%)</strong> — written notes after each lesson.</li>
            <li>• <strong className="text-foreground">Curriculum Coverage (10%)</strong> — completing the 6-lesson unit arc.</li>
          </ul>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
            <div className="rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 px-3 py-2 text-xs">
              <div className="font-bold">&lt; 55</div><div>At risk</div>
            </div>
            <div className="rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 px-3 py-2 text-xs">
              <div className="font-bold">55–69</div><div>On Track</div>
            </div>
            <div className="rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3 py-2 text-xs">
              <div className="font-bold">70–84</div><div>Strong</div>
            </div>
            <div className="rounded-md bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 px-3 py-2 text-xs">
              <div className="font-bold">85+</div><div>Excellent / Elite</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Staying below 55 for 2 consecutive weeks flags you as at-risk. Reaching 85+ unlocks monthly bonuses —
            see the bonus preview below. Focus on your lowest sub-score first to lift your overall fastest.
          </p>
        </CardContent>
      </Card>

      {alert && alert.consecutive_weeks >= 2 && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold">You've been flagged as at-risk</p>
              <p className="text-sm text-muted-foreground">
                Your KPI has been below 55 for {alert.consecutive_weeks} weeks in a row.
                Focus on <strong>{lowest.l}</strong>: {TIPS[lowest.k]}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {trending >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
            Trend (last {trend.length} days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trend.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="snapshot_date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="overall_kpi_score"
                  stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Not enough data yet — check back tomorrow.</p>
          )}
        </CardContent>
      </Card>

      <BonusPreview metric={metric} earnings30d={earnings30d} />



      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subScores.map(([k, l]) => {
          const v = Number(metric[k]);
          return (
            <Card key={k}>
              <CardContent className="p-4">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{l}</span>
                  <span className="font-mono">{v.toFixed(0)}</span>
                </div>
                <Progress value={v} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">{TIPS[k]}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function BonusPreview({ metric, earnings30d }: { metric: Metric; earnings30d: number }) {
  const { policy } = useBonusPolicy();
  const calc = useMemo(
    () => calculateKpiBonus(metric, earnings30d, policy),
    [metric, earnings30d, policy],
  );

  // Celebrate newly-unlocked kickers (persist across sessions via localStorage)
  useEffect(() => {
    if (calc.kickers.length === 0) return;
    const key = "kpi-kickers-seen-v1";
    const seen = new Set<string>(JSON.parse(localStorage.getItem(key) || "[]"));
    const fresh = calc.kickers.filter((k) => !seen.has(k));
    if (fresh.length > 0) {
      fresh.forEach((k) =>
        toast.success(`${k} kicker unlocked — +${policy.kicker_pct_each}% next bonus`, {
          icon: "🎉",
        }),
      );
      fresh.forEach((k) => seen.add(k));
      localStorage.setItem(key, JSON.stringify([...seen]));
    }
  }, [calc.kickers, policy.kicker_pct_each]);

  const eligibleSubs: [keyof Metric, string][] = [
    ["attendance_rate", "Attendance"],
    ["lesson_quality_score", "Lesson Quality"],
    ["student_progress_impact", "Progress"],
    ["response_time_score", "Response Time"],
    ["feedback_completion_rate", "Feedback"],
    ["curriculum_coverage", "Curriculum"],
  ];
  const unlockable = eligibleSubs
    .filter(([k]) => Number(metric[k]) >= 80 && Number(metric[k]) < policy.kicker_threshold)
    .slice(0, 3);


  return (
    <Card className="border-primary/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Projected Bonus (last 30 days)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Tier</div>
            <div className="font-mono font-semibold">{calc.baseTier}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Bonus rate</div>
            <div className="font-mono">{calc.basePct}% + {calc.kickerPct}%</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Earnings base</div>
            <div className="font-mono">${earnings30d.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Projected bonus</div>
            <div className="font-mono font-bold text-emerald-600 text-lg">
              ${calc.bonusAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {calc.kickers.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {calc.kickers.map((k) => (
              <Badge key={k} variant="secondary" className="text-xs">
                +1% {k}
              </Badge>
            ))}
          </div>
        )}

        {!calc.eligible && (
          <p className="text-xs text-muted-foreground">
            {metric.overall_kpi_score < 55
              ? "Reach an overall KPI of at least 55 to unlock a bonus tier."
              : "No completed paid lessons in the last 30 days — bonuses apply to earnings."}
          </p>
        )}

        {unlockable.length > 0 && (
          <div className="border-t pt-3 mt-2">
            <div className="text-xs font-medium mb-1">Almost there</div>
            <p className="text-xs text-muted-foreground">
              Lift these sub-scores to 90+ to unlock an extra +1% each:{" "}
              <strong>{unlockable.map(([, l]) => l).join(", ")}</strong>.
            </p>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">
          Bonuses are queued by admins from the KPI dashboard. Projection is indicative; final payout follows approval.
        </p>
      </CardContent>
    </Card>
  );
}
