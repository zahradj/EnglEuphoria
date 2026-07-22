import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Sparkles, Star, TrendingUp, DollarSign, ArrowLeft, ShieldCheck,
  UserCheck, GraduationCap, MessageCircleHeart, CalendarX, Clock, Repeat,
  AlarmClock, Info, Flame, Zap,
} from "lucide-react";
import {
  AURA_LEVELS,
  resolveAuraLevel,
} from "@/components/teacher/dashboard/TeacherAuraRail";

// ── Mock data — swap for real KPI signal later ─────────────────────
const MOCK = {
  brightness: 84,
  weeklyDelta: +6,
  earnings30d: 2847,
  bonusThisMonth: 341,
  streak: 18,
  attendPct: 96,
  lateArrivals: 1,
  regulars: 14,
  trialsConverted: 6,
  fiveStar: 23,
  brighteners: [
    { icon: UserCheck,          label: "Regular student retained 4+ wks", value: "+2 brightness" },
    { icon: GraduationCap,      label: "Trial → paid conversion",         value: "+3 brightness" },
    { icon: MessageCircleHeart, label: "5★ parent/student feedback",      value: "+1 brightness" },
    { icon: Flame,              label: "20-lesson streak",                value: "+2 brightness" },
  ],
  faders: [
    { icon: CalendarX, label: "Same-day cancellation", value: "−3 brightness" },
    { icon: CalendarX, label: "Cancellation < 24h",    value: "−1 brightness" },
    { icon: AlarmClock,label: "Late arrival to class", value: "−1 brightness" },
    { icon: ShieldCheck,label: "No-show",              value: "−4 brightness" },
  ],
  journal: [
    { label: "Your Aura is shining brightly this week.",       tone: "good" as const, when: "now" },
    { label: "Your Aura brightened — 5★ from Amina's parent.", tone: "good" as const, when: "2h" },
    { label: "A trial glowed into a regular · Reda.",          tone: "good" as const, when: "1d" },
    { label: "Your Aura faded — same-day cancel (Lina).",      tone: "bad"  as const, when: "3d" },
    { label: "A small flicker — arrived 6 min late.",          tone: "bad"  as const, when: "1w" },
    { label: "Your Aura brightened — 5-lesson streak with Yacine.", tone: "good" as const, when: "1w" },
  ],
};

const fmtMoney = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;

export default function TeacherAuraDetail() {
  const navigate = useNavigate();
  const { brightness, weeklyDelta, earnings30d, bonusThisMonth, streak, attendPct,
          lateArrivals, regulars, trialsConverted, fiveStar, brighteners, faders, journal } = MOCK;

  const level = resolveAuraLevel(brightness);
  const nextLevel = AURA_LEVELS.find(l => l.min > brightness);
  const toNext = nextLevel ? nextLevel.min - brightness : 0;

  return (
    <div
      className="min-h-dvh transition-colors duration-700"
      style={{
        ["--aura-hsl" as any]: level.hsl,
        background:
          "radial-gradient(1400px 800px at 0% 0%, hsl(var(--aura-hsl) / 0.16), transparent 60%), " +
          "radial-gradient(1200px 700px at 100% 100%, hsl(var(--aura-hsl) / 0.10), transparent 60%), " +
          "hsl(var(--background))",
      }}
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/teacher")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to dashboard
          </Button>
          <Badge className="border-0 text-slate-950 font-bold" style={{ background: "hsl(var(--aura-hsl))" }}>
            <Star className="h-3 w-3 mr-1 fill-slate-950" /> {level.label}
          </Badge>
        </div>

        {/* Hero */}
        <Card
          className="relative overflow-hidden border backdrop-blur-xl"
          style={{
            background:
              "linear-gradient(160deg, hsl(var(--aura-hsl) / 0.18) 0%, hsl(var(--aura-hsl) / 0.06) 55%, hsl(var(--card) / 0.85) 100%), hsl(var(--card) / 0.75)",
            borderColor: "hsl(var(--aura-hsl) / 0.25)",
            boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.35)",
          }}
        >
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-40 pointer-events-none"
               style={{ background: "hsl(var(--aura-hsl))" }} />
          <div className="absolute inset-x-0 top-0 h-1/3 pointer-events-none rounded-t-lg"
               style={{ background: "linear-gradient(to bottom, hsl(0 0% 100% / 0.3), transparent)" }} />

          <CardContent className="relative p-8">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center">
              {/* Orb */}
              <div className="mx-auto md:mx-0">
                <AuraOrb brightness={brightness} />
              </div>

              {/* Story */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  <Sparkles className="h-4 w-4" style={{ color: "hsl(var(--aura-hsl))" }} />
                  Teacher Aura · Detailed view
                </div>
                <h1 className="text-3xl md:text-4xl font-black leading-tight text-foreground">
                  {weeklyDelta >= 0
                    ? "Your Aura is shining brightly this week."
                    : "Your Aura faded this week."}
                </h1>
                <p className="text-muted-foreground max-w-prose">
                  Every teacher has an Aura reflecting their teaching excellence. It brightens with
                  retention, conversions, and delighted students — and fades from cancellations,
                  lateness, or no-shows. No hearts. No punishment. Just a magical signal of who
                  you're becoming as a mentor.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <MiniStat icon={Sparkles} label="Brightness" value={`${brightness}`} accent />
                  <MiniStat icon={TrendingUp} label="This week" value={`${weeklyDelta >= 0 ? "+" : ""}${weeklyDelta}`} />
                  <MiniStat icon={DollarSign} label="Earnings · 30d" value={fmtMoney(earnings30d)} />
                  <MiniStat icon={Flame} label="Streak" value={`${streak}`} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level ladder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" style={{ color: "hsl(var(--aura-hsl))" }} />
              The five auras
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextLevel && (
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">
                    <span className="font-bold text-foreground">{toNext}</span> to <span className="font-bold" style={{ color: "hsl(var(--aura-hsl))" }}>{nextLevel.label}</span>
                  </span>
                  <span className="tabular-nums text-muted-foreground">{brightness} / {nextLevel.min}</span>
                </div>
                <Progress value={((brightness - level.min) / (nextLevel.min - level.min)) * 100} className="h-2" />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {AURA_LEVELS.map(l => {
                const active = brightness >= l.min;
                const current = l.key === level.key;
                return (
                  <div key={l.key}
                       className={cn(
                         "relative rounded-xl border p-4 transition-all overflow-hidden",
                         current ? "shadow-lg" : "",
                         !active && "opacity-55",
                       )}
                       style={{
                         borderColor: current ? `hsl(${l.hsl} / 0.6)` : undefined,
                         background: current
                           ? `linear-gradient(160deg, hsl(${l.hsl} / 0.18), hsl(var(--card) / 0.85))`
                           : undefined,
                       }}>
                    <div className="h-3 w-3 rounded-full mb-2" style={{ background: `hsl(${l.hsl})`, boxShadow: active ? `0 0 12px hsl(${l.hsl})` : undefined }} />
                    <div className="text-sm font-black">{l.label}</div>
                    <div className="text-xs text-muted-foreground font-mono">{l.min}+ brightness</div>
                    {current && (
                      <div className="mt-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: `hsl(${l.hsl})` }}>
                        Current
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Brighteners & Faders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-600">
                <Sparkles className="h-5 w-5" /> Brighten your Aura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {brighteners.map((b, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <b.icon className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-sm flex-1">{b.label}</span>
                  <span className="text-xs font-bold text-emerald-600 tabular-nums">{b.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <CalendarX className="h-5 w-5" /> What fades your Aura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {faders.map((f, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <f.icon className="h-4 w-4 text-destructive shrink-0" />
                  <span className="text-sm flex-1">{f.label}</span>
                  <span className="text-xs font-bold text-destructive tabular-nums">{f.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Boosters + Earnings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" style={{ color: "hsl(var(--aura-hsl))" }} />
                This month's boosters
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Booster icon={UserCheck}          label="Regulars"      value={regulars} />
              <Booster icon={GraduationCap}      label="Trials → Paid" value={trialsConverted} />
              <Booster icon={MessageCircleHeart} label="5★ feedback"   value={fiveStar} />
              <Booster icon={ShieldCheck}        label="Attendance"    value={`${attendPct}%`} />
              <Booster icon={Flame}              label="Streak"        value={streak} />
              <Booster icon={AlarmClock}         label="Late · 30d"    value={lateArrivals} tone={lateArrivals > 0 ? "bad" : "neutral"} />
              <Booster icon={Repeat}             label="Bookings"      value="+12" />
              <Booster icon={Clock}              label="Hours · 30d"   value="48h" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" style={{ color: "hsl(var(--aura-hsl))" }} />
                Earnings · 30d
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tabular-nums leading-none"
                   style={{ color: "hsl(var(--aura-hsl))" }}>{fmtMoney(earnings30d)}</div>
              <div className="mt-2 text-xs text-muted-foreground">Aura bonus this month</div>
              <div className="text-lg font-bold tabular-nums text-foreground">+${bonusThisMonth}</div>
              <p className="mt-4 text-xs text-muted-foreground">
                Brighter Auras unlock higher rate tiers. Reach <span className="font-semibold text-foreground">{nextLevel?.label ?? "Legendary"}</span> for the next multiplier.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Journal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" style={{ color: "hsl(var(--aura-hsl))" }} />
              Aura journal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {journal.map((e, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
                <span className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: e.tone === "good" ? "hsl(var(--aura-hsl))" : "hsl(var(--destructive))" }} />
                <span className="text-sm flex-1">{e.label}</span>
                <span className="text-xs text-muted-foreground w-14 text-right">{e.when}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Bits ────────────────────────────────────────────────────────────
function AuraOrb({ brightness }: { brightness: number }) {
  const level = resolveAuraLevel(brightness);
  const size = 220, cx = size / 2, cy = size / 2, r = 90;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, brightness / 100));
  const offset = c - pct * c;
  return (
    <div className="relative rounded-full transition-shadow duration-700"
         style={{ width: size, height: size, boxShadow: `0 0 56px hsl(${level.hsl} / 0.55)` }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={cx} cy={cy} r={r + 14} fill={`hsl(${level.hsl} / 0.15)`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
        <circle cx={cx} cy={cy} r={r} fill="none"
                stroke={`hsl(${level.hsl})`} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={offset}
                transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r - 24} fill={`hsl(${level.hsl} / 0.18)`} />
        <text x={cx} y={cy - 2} textAnchor="middle" className="fill-foreground font-black"
              style={{ fontSize: 44, fontVariantNumeric: "tabular-nums" }}>{brightness}</text>
        <text x={cx} y={cy + 20} textAnchor="middle" className="fill-muted-foreground"
              style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>brightness</text>
      </svg>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 backdrop-blur px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={cn("text-xl font-black tabular-nums mt-0.5", accent && "")}
           style={accent ? { color: "hsl(var(--aura-hsl))" } : undefined}>
        {value}
      </div>
    </div>
  );
}

function Booster({ icon: Icon, label, value, tone = "neutral" }: { icon: any; label: string; value: string | number; tone?: "neutral" | "bad" }) {
  return (
    <div className={cn(
      "rounded-lg border p-3",
      tone === "bad" ? "border-destructive/30 bg-destructive/5" : "border-border bg-muted/30",
    )}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("h-3 w-3", tone === "bad" ? "text-destructive" : "")} /> {label}
      </div>
      <div className={cn("text-xl font-black tabular-nums mt-0.5",
                         tone === "bad" ? "text-destructive" : "text-foreground")}>
        {value}
      </div>
    </div>
  );
}
