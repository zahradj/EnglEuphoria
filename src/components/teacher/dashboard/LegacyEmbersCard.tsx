import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight, UserCheck, GraduationCap, MessageCircleHeart,
  CalendarX, Clock, Repeat, Sparkles, TrendingUp,
  DollarSign, ShieldCheck, AlarmClock, Compass,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeacherEmbers, type EmberEvent } from "@/hooks/useTeacherEmbers";
import { useBonusPolicy } from "@/hooks/useBonusPolicy";
import { calculateKpiBonus } from "@/lib/kpiBonus";
import { cn } from "@/lib/utils";

function useKpiSnapshot(teacherId: string | undefined) {
  const [state, setState] = useState<{ score: number; metric: any | null; earnings30d: number } | null>(null);
  useEffect(() => {
    if (!teacherId) return;
    (async () => {
      const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
      const [m, e] = await Promise.all([
        supabase.from("teacher_performance_metrics").select("*").eq("teacher_id", teacherId).maybeSingle(),
        supabase.from("teacher_earnings").select("teacher_amount").eq("teacher_id", teacherId).gte("earned_at", since),
      ]);
      const metric = (m.data as any) ?? null;
      setState({
        score: Number(metric?.overall_kpi_score) || 0,
        metric,
        earnings30d: (e.data ?? []).reduce((s: number, x: any) => s + Number(x.teacher_amount ?? 0), 0),
      });
    })();
  }, [teacherId]);
  return state;
}

function tierFor(score: number) {
  if (score >= 95) return { label: "Elite" };
  if (score >= 85) return { label: "Excellent" };
  if (score >= 70) return { label: "Strong" };
  if (score >= 55) return { label: "On Track" };
  return                { label: "At Risk" };
}

const EVENT_ICON: Record<EmberEvent["kind"], any> = {
  same_day_cancel: CalendarX, late_cancel: Clock, no_show: CalendarX,
  late_arrival: AlarmClock, five_star: MessageCircleHeart,
  trial_paid: GraduationCap, regular_retained: Repeat,
};

/**
 * Teacher's Compass — original KPI visualization.
 *  N: RETAIN (regulars)   E: GROW (trials→paid)
 *  S: DELIGHT (5★)        W: SHOW-UP (attendance)
 * Needle rotates toward the teacher's dominant cardinal.
 * Outer ring arc fills to the KPI score.
 */
function TeacherCompass({
  score, retain, grow, delight, showUp,
}: { score: number; retain: number; grow: number; delight: number; showUp: number; }) {
  const S = 240;                       // svg size
  const cx = S / 2, cy = S / 2;
  const rRing = 108;                   // KPI arc radius
  const rInner = 84;                   // cardinal ring
  const stroke = 8;
  const c = 2 * Math.PI * rRing;
  const pct = Math.max(0, Math.min(1, score / 100));

  // Normalize cardinals for needle direction (0..1)
  const cardinals = [
    { dir: "N", key: "retain",  val: retain,  norm: Math.min(1, retain / 20),  icon: UserCheck,          label: "Retain",  hint: "regulars" },
    { dir: "E", key: "grow",    val: grow,    norm: Math.min(1, grow / 10),    icon: GraduationCap,      label: "Grow",    hint: "trial→paid" },
    { dir: "S", key: "delight", val: delight, norm: Math.min(1, delight / 30), icon: MessageCircleHeart, label: "Delight", hint: "5★ fb" },
    { dir: "W", key: "showUp",  val: showUp,  norm: Math.min(1, showUp / 100), icon: ShieldCheck,        label: "Show-Up", hint: "attend%" },
  ];
  // Angles: N=-90, E=0, S=90, W=180 (SVG degrees)
  const angles = { N: -90, E: 0, S: 90, W: 180 } as const;
  // Weighted-vector needle: sum unit vectors × norm
  let vx = 0, vy = 0;
  cardinals.forEach(c => {
    const a = (angles as any)[c.dir] * Math.PI / 180;
    vx += Math.cos(a) * c.norm;
    vy += Math.sin(a) * c.norm;
  });
  const needleAngle = Math.atan2(vy, vx) * 180 / Math.PI;
  const magnitude = Math.min(1, Math.hypot(vx, vy) / 2);
  const needleLen = rInner - 14;

  // Position for cardinal icons/values (outside inner ring)
  const posFor = (dir: keyof typeof angles, r: number) => {
    const a = angles[dir] * Math.PI / 180;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  };

  const strongest = cardinals.reduce((a, b) => (b.norm > a.norm ? b : a));

  return (
    <div className="relative" style={{ width: S, height: S }}>
      <svg viewBox={`0 0 ${S} ${S}`} width={S} height={S}>
        {/* Outer KPI ring track */}
        <circle cx={cx} cy={cy} r={rRing}
          className="stroke-muted" strokeWidth={stroke} fill="none" />
        {/* Outer KPI ring fill */}
        <circle cx={cx} cy={cy} r={rRing}
          className="stroke-primary transition-[stroke-dashoffset] duration-700"
          strokeWidth={stroke} strokeLinecap="round" fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${cx} ${cy})`} />

        {/* Cardinal spokes (subtle) */}
        {(["N","E","S","W"] as const).map(d => {
          const p = posFor(d, rInner - 4);
          return (
            <line key={d} x1={cx} y1={cy} x2={p.x} y2={p.y}
              className="stroke-border" strokeWidth="1" strokeDasharray="2 4" />
          );
        })}

        {/* Cardinal tick dots */}
        {cardinals.map(c => {
          const p = posFor(c.dir as any, rInner);
          const active = c.key === strongest.key;
          return (
            <circle key={c.dir} cx={p.x} cy={p.y} r={active ? 5 : 3}
              className={cn(active ? "fill-primary" : "fill-muted-foreground/40")} />
          );
        })}

        {/* Needle */}
        <g transform={`rotate(${needleAngle} ${cx} ${cy})`}>
          <line x1={cx} y1={cy}
            x2={cx + needleLen * (0.4 + magnitude * 0.6)} y2={cy}
            className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
          <polygon
            points={`${cx + needleLen * (0.4 + magnitude * 0.6)},${cy - 4} ${cx + needleLen * (0.4 + magnitude * 0.6) + 8},${cy} ${cx + needleLen * (0.4 + magnitude * 0.6)},${cy + 4}`}
            className="fill-primary" />
        </g>

        {/* Hub cap */}
        <circle cx={cx} cy={cy} r="26" className="fill-card stroke-primary" strokeWidth="2" />
      </svg>

      {/* Cardinal labels overlaid via HTML (crisp text) */}
      {cardinals.map(c => {
        const p = posFor(c.dir as any, rRing + 18);
        const Icon = c.icon;
        return (
          <div key={c.dir}
            className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
            style={{ left: p.x, top: p.y }}>
            <Icon className={cn(
              "h-3.5 w-3.5",
              c.key === strongest.key ? "text-primary" : "text-muted-foreground",
            )} />
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">{c.label}</div>
            <div className={cn(
              "text-xs font-black tabular-nums leading-none",
              c.key === strongest.key ? "text-primary" : "text-foreground",
            )}>
              {typeof c.val === "number" && c.key === "showUp" ? `${c.val}%` : c.val}
            </div>
          </div>
        );
      })}

      {/* Center KPI readout */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">KPI</div>
        <div className="text-2xl font-black tabular-nums text-foreground leading-none">
          {Math.round(score)}
        </div>
      </div>
    </div>
  );
}

const fmtMoney = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;

export function LegacyEmbersCard() {
  const { user } = useAuth();
  const { data, loading } = useTeacherEmbers(user?.id);
  const kpi = useKpiSnapshot(user?.id);
  const { policy } = useBonusPolicy();

  const bonus = useMemo(
    () => (kpi?.metric ? calculateKpiBonus(kpi.metric, kpi.earnings30d, policy) : null),
    [kpi, policy],
  );

  if (loading || !data || !kpi) {
    return (
      <Card className="md:col-span-3 overflow-hidden">
        <CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent>
      </Card>
    );
  }

  if (kpi.score === 0 && data.events.length === 0 && data.regulars === 0 && data.fiveStarFb === 0) {
    return (
      <Card className="md:col-span-3 overflow-hidden border-dashed">
        <CardContent className="p-6 flex items-center gap-3 text-muted-foreground">
          <Sparkles className="w-5 h-5" />
          Your compass sets its bearings once you've taught your first lessons.
        </CardContent>
      </Card>
    );
  }

  const {
    regulars, trialsConverted, fiveStarFb, lessonsStreak,
    lateArrivals, attendanceRate, earnings30d, events,
  } = data;
  const tier = tierFor(kpi.score);
  const attendancePct = Math.round(attendanceRate * 100);

  return (
    <Card className="md:col-span-3 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <CardContent className="relative p-6 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-center">
        {/* LEFT — Teacher's Compass */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Teacher's Compass
            </span>
          </div>
          <TeacherCompass
            score={kpi.score}
            retain={regulars}
            grow={trialsConverted}
            delight={fiveStarFb}
            showUp={attendancePct}
          />
          <Badge variant="secondary" className="font-semibold">
            {tier.label}
          </Badge>
        </div>

        {/* RIGHT — earnings + pills + events + CTA */}
        <div className="space-y-3">
          {/* Earnings hero */}
          <div className="rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/30 p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  Earnings · Last 30 days
                </span>
              </div>
              {bonus?.eligible && (
                <span className="text-[11px] text-primary font-bold">
                  +${bonus.bonusAmount.toFixed(0)} KPI bonus
                </span>
              )}
            </div>
            <div className="text-3xl font-black text-foreground tabular-nums leading-none">
              {fmtMoney(earnings30d)}
            </div>
          </div>

          {/* Reliability pills */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-muted/40 border border-border px-3 py-2">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] uppercase tracking-wider">Streak</span>
              </div>
              <div className="text-sm font-bold text-foreground tabular-nums mt-0.5">
                {lessonsStreak} <span className="text-[10px] text-muted-foreground font-normal">lessons</span>
              </div>
            </div>
            <div className={cn(
              "rounded-lg border px-3 py-2",
              lateArrivals > 0 ? "bg-destructive/10 border-destructive/30" : "bg-muted/40 border-border",
            )}>
              <div className="flex items-center gap-1.5">
                <AlarmClock className={cn("h-3.5 w-3.5", lateArrivals > 0 ? "text-destructive" : "text-muted-foreground")} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Late</span>
              </div>
              <div className={cn(
                "text-sm font-bold tabular-nums mt-0.5",
                lateArrivals > 0 ? "text-destructive" : "text-foreground",
              )}>
                {lateArrivals} <span className="text-[10px] text-muted-foreground font-normal">this 30d</span>
              </div>
            </div>
            <div className="rounded-lg bg-muted/40 border border-border px-3 py-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Attend</span>
              </div>
              <div className="text-sm font-bold text-foreground tabular-nums mt-0.5">
                {attendancePct}%
              </div>
            </div>
          </div>

          {/* Events feed */}
          <div className="rounded-lg bg-muted/30 border border-border px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
              Recent events
            </div>
            <div className="space-y-1">
              {events.length === 0 && (
                <div className="text-xs text-muted-foreground italic">No events yet.</div>
              )}
              {events.slice(0, 4).map((e, i) => {
                const Icon = EVENT_ICON[e.kind];
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Icon className={cn("h-3.5 w-3.5 shrink-0",
                      e.tone === "good" ? "text-primary" : "text-destructive")} />
                    <span className="flex-1 truncate text-foreground/90">{e.label}</span>
                    <span className={cn("font-bold tabular-nums text-[11px]",
                      e.tone === "good" ? "text-primary" : "text-destructive")}>
                      {e.delta > 0 ? `+${e.delta}` : e.delta}
                    </span>
                    <span className="text-[10px] text-muted-foreground w-10 text-right shrink-0">{e.when}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Button asChild size="sm" className="w-full">
            <Link to="/teacher/kpi">
              View full performance <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default LegacyEmbersCard;
