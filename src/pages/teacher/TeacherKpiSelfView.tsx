import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeacherPayoutCurrency } from "@/hooks/useTeacherPayoutCurrency";
import { formatPay } from "@/lib/teacherPay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Gift, ArrowLeft, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { calculateKpiBonus } from "@/lib/kpiBonus";
import { useBonusPolicy } from "@/hooks/useBonusPolicy";
import { toast } from "sonner";
import { TeachingScorecard } from "@/components/teacher/scorecard/TeachingScorecard";

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

export default function TeacherKpiSelfView() {
  const { user } = useAuth();
  const [metric, setMetric] = useState<Metric | null>(null);
  const [alert, setAlert] = useState<{ consecutive_weeks: number; kpi_score: number } | null>(null);
  const [earnings30d, setEarnings30d] = useState(0);

  // The legacy score and earnings only feed the bonus preview and the at-risk notice below.
  useEffect(() => {
    if (!user) return;
    (async () => {
      const since = new Date(Date.now() - 30 * 864e5).toISOString();
      const [m, al, earn] = await Promise.all([
        supabase.from("teacher_performance_metrics").select("*").eq("teacher_id", user.id).maybeSingle(),
        supabase.from("teacher_kpi_alerts").select("consecutive_weeks, kpi_score")
          .eq("teacher_id", user.id).order("week_start", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("teacher_earnings").select("teacher_amount")
          .eq("teacher_id", user.id).gte("earned_at", since),
      ]);
      setMetric(m.data as Metric | null);
      setAlert(al.data);
      setEarnings30d((earn.data ?? []).reduce((s: number, e: any) => s + Number(e.teacher_amount ?? 0), 0));
    })();
  }, [user]);

  return (
    <div className="container mx-auto max-w-3xl space-y-5 p-4 md:p-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/teacher"><ArrowLeft className="w-4 h-4 mr-2" />Back to dashboard</Link>
      </Button>

      <header>
        <h1 className="text-2xl font-bold md:text-3xl">My teaching</h1>
        <p className="text-muted-foreground">Five simple goals, and one thing to focus on.</p>
      </header>

      {alert && alert.consecutive_weeks >= 2 && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <p className="font-semibold">Let's talk about how your lessons are going</p>
              <p className="text-sm text-muted-foreground">
                Your score has been low for {alert.consecutive_weeks} weeks. The team would like to help: please check
                in with your coordinator.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <TeachingScorecard />

      {metric && (
        <details className="group rounded-2xl border bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 font-semibold">
            <span className="flex items-center gap-2"><Gift className="h-4 w-4 text-primary" /> Bonus preview</span>
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <div className="p-4 pt-0">
            <BonusPreview metric={metric} earnings30d={earnings30d} />
          </div>
        </details>
      )}
    </div>
  );
}

function BonusPreview({ metric, earnings30d }: { metric: Metric; earnings30d: number }) {
  // Local teachers are paid in DZD, international in EUR.
  const currency = useTeacherPayoutCurrency();
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
            <div className="font-mono">{formatPay(earnings30d, currency)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Projected bonus</div>
            <div className="font-mono font-bold text-emerald-600 text-lg">
              {formatPay(calc.bonusAmount, currency)}
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
