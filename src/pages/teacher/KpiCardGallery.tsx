import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Flame, Trophy, Sparkles, TrendingUp, Target, Zap, Crown, Star,
  ArrowRight, Award, Rocket, Shield, Swords, Gem, Gauge, Heart,
  UserCheck, GraduationCap, MessageCircleHeart, CalendarX, Clock, Repeat,
  DollarSign, ShieldCheck, AlarmClock, Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Shared mock data ────────────────────────────────────────────
const MOCK = {
  overall: 88,
  tier: "Excellent",
  nextTier: "Elite",
  toNext: 7,
  bonusPct: 12,
  bonusAmount: 4320,
  streak: 6,
  subs: [
    { label: "Quality",    value: 94, kicker: true  },
    { label: "Attendance", value: 97, kicker: true  },
    { label: "Progress",   value: 82, kicker: false },
    { label: "Response",   value: 91, kicker: true  },
    { label: "Feedback",   value: 78, kicker: false },
    { label: "Curriculum", value: 86, kicker: false },
  ],
  spark: [62, 68, 65, 74, 71, 79, 82, 80, 85, 84, 88, 88],
};

function sparkPath(vals: number[], w = 140, h = 36) {
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  return vals
    .map((v, i) => {
      const x = (i / (vals.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

// ─── A · ARCADE — Neon Coin-Op ───────────────────────────────────
function VariantA() {
  const r = 54, c = 2 * Math.PI * r;
  const offset = c - (MOCK.overall / 100) * c;
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-fuchsia-950 text-white shadow-2xl">
      {/* scanlines */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
           style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,.08) 0 1px, transparent 1px 3px)" }} />
      <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_20%_10%,rgba(217,70,239,.35),transparent_50%),radial-gradient(circle_at_80%_90%,rgba(56,189,248,.3),transparent_50%)]" />
      <CardContent className="relative p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-fuchsia-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-200 [font-family:ui-monospace,monospace]">
              ★ Player 1 · Insert Coin
            </span>
          </div>
          <Badge className="bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-100 font-mono">{MOCK.tier.toUpperCase()}</Badge>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative">
            <svg width="130" height="130" className="-rotate-90">
              <defs>
                <linearGradient id="ga" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e879f9" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              <circle cx="65" cy="65" r={r} stroke="rgba(255,255,255,.1)" strokeWidth="10" fill="none" />
              <circle cx="65" cy="65" r={r} stroke="url(#ga)" strokeWidth="10" fill="none"
                strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 10px rgba(232,121,249,.7))" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black [font-family:ui-monospace,monospace] tabular-nums">{MOCK.overall.toString().padStart(3,"0")}</span>
              <span className="text-[9px] uppercase tracking-widest text-white/60">HI-SCORE</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-white/60 font-mono">Combo Bonus</div>
            <div className="text-3xl font-black bg-gradient-to-r from-amber-300 to-fuchsia-300 bg-clip-text text-transparent">
              ×{MOCK.bonusPct}
            </div>
            <div className="text-xs text-white/70 font-mono">🔥 {MOCK.streak}-day streak</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {MOCK.subs.map(s => (
            <div key={s.label} className="rounded-md bg-white/5 border border-white/10 p-2">
              <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-white/70 font-mono">
                <span>{s.label}</span>{s.kicker && <Flame className="h-3 w-3 text-amber-300" />}
              </div>
              <div className="text-sm font-black font-mono tabular-nums">{s.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── B · GRAND PRIX — Racing Dashboard ───────────────────────────
function VariantB() {
  const rpm = (MOCK.overall / 100) * 270 - 135; // dial angle
  return (
    <Card className="relative overflow-hidden border bg-gradient-to-br from-zinc-900 via-zinc-800 to-red-950 text-white">
      {/* checker flag strip */}
      <div className="absolute top-0 inset-x-0 h-2 flex">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={cn("flex-1", i % 2 === 0 ? "bg-white" : "bg-black")} />
        ))}
      </div>
      <CardContent className="relative p-6 pt-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-red-400" />
            <span className="font-black tracking-wider uppercase text-sm">Grand Prix · Lap {MOCK.streak}</span>
          </div>
          <Badge className="bg-red-500 hover:bg-red-500 text-white font-mono">P1 · {MOCK.tier}</Badge>
        </div>

        <div className="flex items-center gap-4">
          {/* speedometer */}
          <div className="relative h-32 w-32 shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full">
              <path d="M20,90 A50,50 0 1 1 100,90" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="10" strokeLinecap="round" />
              <path d="M20,90 A50,50 0 1 1 100,90" fill="none" stroke="url(#gb)" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray="235" strokeDashoffset={235 - (MOCK.overall / 100) * 235} />
              <defs>
                <linearGradient id="gb" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <line x1="60" y1="60" x2="60" y2="25" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"
                    transform={`rotate(${rpm} 60 60)`} />
              <circle cx="60" cy="60" r="4" fill="#fbbf24" />
            </svg>
            <div className="absolute inset-x-0 bottom-2 text-center">
              <div className="text-2xl font-black tabular-nums">{MOCK.overall}</div>
              <div className="text-[9px] uppercase tracking-wider text-white/60">KPI RPM</div>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="rounded-md bg-white/5 border border-white/10 p-2">
              <div className="text-[10px] uppercase text-white/60">Podium</div>
              <div className="flex gap-2 mt-1">
                {MOCK.subs.slice(0,3).sort((a,b)=>b.value-a.value).map((s,i) => (
                  <div key={s.label} className="flex-1">
                    <div className="text-lg">{["🥇","🥈","🥉"][i]}</div>
                    <div className="text-[9px] text-white/70 truncate">{s.label}</div>
                    <div className="text-sm font-black">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md bg-red-500/20 border border-red-400/40 p-2 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-red-200">Purse</span>
              <span className="text-lg font-black text-amber-300">+{MOCK.bonusPct}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-1">
          {MOCK.subs.map(s => (
            <div key={s.label} className="text-center">
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className={cn("h-full", s.kicker ? "bg-amber-400" : "bg-red-500")} style={{ width: `${s.value}%` }} />
              </div>
              <div className="text-[9px] mt-1 text-white/60 truncate">{s.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── C · TRADING CARD — Collectible Foil ─────────────────────────
function VariantC() {
  return (
    <Card className="relative overflow-hidden border-2 border-amber-400/60 bg-gradient-to-br from-amber-50 via-white to-sky-50 dark:from-amber-950/40 dark:via-zinc-900 dark:to-sky-950/40">
      {/* holographic sheen */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
           style={{ background: "linear-gradient(135deg, rgba(251,191,36,.3), transparent 30%, rgba(56,189,248,.3) 60%, transparent 90%)" }} />
      <CardContent className="relative p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-amber-400/40 pb-2">
          <div className="flex items-center gap-2">
            <Gem className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-widest">Legendary · Teacher</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">SR · #{MOCK.streak.toString().padStart(3,"0")}</span>
        </div>

        <div className="rounded-lg overflow-hidden bg-gradient-to-br from-sky-100 to-amber-100 dark:from-sky-900/60 dark:to-amber-900/60 aspect-[16/8] flex items-center justify-center relative">
          <div className="text-7xl font-black tracking-tighter bg-gradient-to-br from-amber-500 to-fuchsia-600 bg-clip-text text-transparent">
            {MOCK.overall}
          </div>
          <div className="absolute bottom-2 right-2 text-[10px] font-mono uppercase text-muted-foreground">Power</div>
          <div className="absolute top-2 left-2 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn("h-3 w-3", i < 4 ? "text-amber-500 fill-amber-500" : "text-muted")} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {MOCK.subs.map(s => (
            <div key={s.label} className="flex items-center justify-between border-b border-dashed border-muted-foreground/20 py-1">
              <span className="text-muted-foreground uppercase text-[10px] tracking-wide">{s.label}</span>
              <span className="font-black font-mono flex items-center gap-1">
                {s.kicker && <Flame className="h-3 w-3 text-amber-500" />}
                {s.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-amber-500 to-fuchsia-500 text-white px-3 py-2">
          <span className="text-[10px] uppercase tracking-wider font-bold">Ability · Bonus Strike</span>
          <span className="font-black">+{MOCK.bonusPct}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── D · RPG QUEST — Level-Up Adventure ──────────────────────────
function VariantD() {
  return (
    <Card className="relative overflow-hidden border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-950 text-white">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-400/30 blur-3xl" />
      <div className="absolute bottom-0 left-0 right-0 h-8 opacity-30"
           style={{ backgroundImage: "radial-gradient(ellipse at 20% 0%, #34d399 0 2px, transparent 3px), radial-gradient(ellipse at 60% 0%, #22d3ee 0 2px, transparent 3px)" }} />
      <CardContent className="relative p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/40 rotate-3">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-950 border-2 border-emerald-400 px-1.5 text-[10px] font-black">Lv.4</div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-emerald-300">◆ Class</div>
            <div className="text-lg font-black">{MOCK.tier} Mentor</div>
          </div>
          <div className="flex items-center gap-1 text-red-300">
            <Heart className="h-4 w-4 fill-red-400" />
            <Heart className="h-4 w-4 fill-red-400" />
            <Heart className="h-4 w-4 fill-red-400" />
          </div>
        </div>

        {/* XP bar */}
        <div>
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider mb-1">
            <span className="text-emerald-300">XP → {MOCK.nextTier}</span>
            <span className="font-black text-amber-300">{MOCK.overall}/100</span>
          </div>
          <div className="h-3 rounded-full bg-emerald-950 border border-emerald-500/40 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 shadow-[0_0_12px_rgba(52,211,153,.8)]"
                 style={{ width: `${MOCK.overall}%` }} />
          </div>
        </div>

        {/* stat sheet */}
        <div className="grid grid-cols-2 gap-2">
          {MOCK.subs.map(s => (
            <div key={s.label} className={cn(
              "rounded-md border p-2 flex items-center gap-2 backdrop-blur",
              s.kicker ? "border-amber-400/60 bg-amber-500/10" : "border-emerald-500/30 bg-emerald-500/5"
            )}>
              {s.kicker ? <Swords className="h-4 w-4 text-amber-300" /> : <Shield className="h-4 w-4 text-emerald-300" />}
              <div className="flex-1 min-w-0">
                <div className="text-[9px] uppercase tracking-wider text-white/70 truncate">{s.label}</div>
                <div className="text-sm font-black font-mono">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black">
          <Rocket className="h-4 w-4 mr-1" /> Claim Loot · +{MOCK.bonusPct}% gold
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── E · SPACE MISSION — Cosmic Ops ──────────────────────────────
function VariantE() {
  return (
    <Card className="relative overflow-hidden border border-white/20 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 text-white">
      {/* stars */}
      <div className="absolute inset-0 opacity-60 pointer-events-none"
           style={{ backgroundImage: "radial-gradient(1px 1px at 20% 30%, #fff, transparent), radial-gradient(1px 1px at 70% 60%, #fff, transparent), radial-gradient(1px 1px at 40% 80%, #fff, transparent), radial-gradient(2px 2px at 85% 20%, #fbbf24, transparent), radial-gradient(1px 1px at 10% 70%, #67e8f9, transparent)" }} />
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-800 blur-2xl opacity-40" />
      <CardContent className="relative p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-200 font-mono">Mission Log · Wk {MOCK.streak}</span>
            </div>
            <div className="text-5xl font-black leading-none">
              {MOCK.overall}<span className="text-2xl text-white/50">/100</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-cyan-300/80 mt-1">◉ Orbit stable</div>
          </div>
          <div className="rounded-lg bg-white/10 backdrop-blur px-3 py-2 border border-white/20">
            <div className="text-[9px] uppercase opacity-70">Rank</div>
            <div className="font-black flex items-center gap-1"><Award className="h-3 w-3 text-amber-300" />{MOCK.tier}</div>
          </div>
        </div>

        <div className="rounded-lg bg-black/30 backdrop-blur border border-cyan-400/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-cyan-200 font-mono">Telemetry · 30d</span>
            <span className="text-xs font-black flex items-center gap-1 text-emerald-300"><TrendingUp className="h-3 w-3" /> +14 kts</span>
          </div>
          <svg width="100%" height="40" viewBox="0 0 140 36" preserveAspectRatio="none">
            <defs>
              <linearGradient id="ge" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#67e8f9" /><stop offset="100%" stopColor="#e879f9" />
              </linearGradient>
            </defs>
            <path d={sparkPath(MOCK.spark)} fill="none" stroke="url(#ge)" strokeWidth="2.5" strokeLinecap="round" />
            <path d={`${sparkPath(MOCK.spark)} L140,36 L0,36 Z`} fill="rgba(103,232,249,.15)" />
          </svg>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {MOCK.subs.map(s => (
            <div key={s.label} className="rounded-lg bg-white/5 backdrop-blur border border-cyan-400/20 p-2 text-center">
              <div className="text-lg font-black text-cyan-200 font-mono">{s.value}</div>
              <div className="text-[9px] uppercase tracking-wider text-white/60 truncate">{s.label}</div>
              {s.kicker && <div className="text-[9px] text-amber-300 mt-0.5">⚡ boost</div>}
            </div>
          ))}
        </div>

        <Button size="sm" className="w-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-950 hover:opacity-90 font-black">
          Deploy bonus payload · +{MOCK.bonusPct}% <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── F · 8-BIT PIXEL — Retro Handheld ────────────────────────────
function VariantF() {
  return (
    <Card className="relative overflow-hidden border-4 border-lime-500/70 bg-lime-100 dark:bg-lime-950 [font-family:ui-monospace,monospace]"
          style={{ boxShadow: "inset 0 0 0 4px #365314" }}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between text-lime-900 dark:text-lime-200">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-red-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest">▶ Teacher.exe</span>
          </div>
          <span className="text-[11px] font-black">LV.{MOCK.streak}</span>
        </div>

        <div className="rounded-sm bg-lime-200/70 dark:bg-lime-900/60 border-2 border-lime-700 dark:border-lime-500 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-lime-900 dark:text-lime-200">HI-SCORE</span>
            <span className="text-3xl font-black text-lime-900 dark:text-lime-100 tabular-nums">
              {MOCK.overall.toString().padStart(6, "0")}
            </span>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className={cn(
                "h-3 flex-1 rounded-sm",
                i < Math.round(MOCK.overall / 5)
                  ? "bg-lime-600 dark:bg-lime-400"
                  : "bg-lime-300/50 dark:bg-lime-800"
              )} />
            ))}
          </div>
        </div>

        <div className="space-y-1 text-[11px] text-lime-900 dark:text-lime-100">
          {MOCK.subs.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-20 uppercase">{s.label}</span>
              <div className="flex-1 flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className={cn(
                    "h-2 flex-1",
                    i < Math.round(s.value / 10)
                      ? (s.kicker ? "bg-amber-500" : "bg-lime-600 dark:bg-lime-400")
                      : "bg-lime-300/60 dark:bg-lime-800"
                  )} />
                ))}
              </div>
              <span className="w-8 text-right font-black tabular-nums">{s.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t-2 border-dashed border-lime-700 dark:border-lime-500 pt-2 text-lime-900 dark:text-lime-100">
          <span className="text-[10px] uppercase animate-pulse">▶ Press A · Claim</span>
          <span className="text-lg font-black">+{MOCK.bonusPct}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── G · LEGACY EMBERS — Teacher Standing (Novakid-hearts, original metaphor) ─
// Mechanic: 10 "embers" burn on your hearth. Teacher-specific events change them.
//   Penalties (dim embers):
//     · Same-day cancellation ............ −2 embers
//     · <24h cancellation ................ −1 ember
//     · No-show .......................... −2 embers
//     · Late to class .................... −1 ember
//   Reignitions (relight embers, max 10):
//     · Regular student retained 4+ wks .. +1 ember
//     · Trial → paid conversion .......... +1 ember
//     · 5★ parent/student feedback ....... +1 ember
//     · 20 lessons taught streak ......... +1 ember
// The count of lit embers directly modulates the KPI bonus multiplier.

const EMBERS_MOCK = {
  lit: 6,                    // out of 10 (starts at 5, earned slowly)
  max: 10,
  overall: 72,
  tier: "Strong",
  earnings30d: 2847,
  bonusAmount: 341,
  attendancePct: 96,
  lateArrivals: 1,
  regulars: 14,
  trialsConverted: 6,
  fiveStarFb: 23,
  lessonsStreak: 18,
  events: [
    { icon: MessageCircleHeart, label: "5★ from Amina's parent",   delta: +1, tone: "good" as const, when: "2h" },
    { icon: Repeat,             label: "Yacine booked wk 5",       delta: +1, tone: "good" as const, when: "1d" },
    { icon: CalendarX,          label: "Same-day cancel · Lina",   delta: -2, tone: "bad"  as const, when: "3d" },
    { icon: GraduationCap,      label: "Trial → paid · Reda",      delta: +1, tone: "good" as const, when: "5d" },
    { icon: Clock,              label: "Late 6min · Sofia",        delta: -1, tone: "bad"  as const, when: "1w" },
  ],
};

const fmtMoney = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;

function VariantG() {
  const {
    lit, max, overall, tier, earnings30d, bonusAmount, attendancePct,
    lateArrivals, regulars, trialsConverted, fiveStarFb, lessonsStreak, events,
  } = EMBERS_MOCK;
  const pct = Math.max(0, Math.min(1, overall / 100));
  const tickTargets = [25, 50, 75, 95];

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <CardContent className="relative p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Teacher Standing</span>
          </div>
          <Badge variant="secondary" className="font-semibold">
            <Shield className="h-3 w-3 mr-1" /> {tier}
          </Badge>
        </div>

        {/* KPI Key + readout */}
        {(() => {
          const H = 224;
          const fillY = H * (1 - pct);
          const tiers = [
            { at: 95, label: "Elite" },
            { at: 85, label: "Excellent" },
            { at: 70, label: "Strong" },
            { at: 55, label: "Track" },
          ];
          return (
            <div className="flex items-center gap-4">
              <div className="relative" style={{ width: 60, height: H }}>
                <svg viewBox={`0 0 60 ${H}`} width={60} height={H} className="overflow-visible">
                  <defs>
                    <clipPath id="kpi-key-shape-gallery">
                      <circle cx="30" cy="26" r="20" />
                      <rect x="24" y="40" width="12" height="170" rx="3" />
                      <rect x="36" y="150" width="10" height="8" />
                      <rect x="36" y="165" width="14" height="8" />
                      <rect x="36" y="180" width="8"  height="8" />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#kpi-key-shape-gallery)">
                    <rect x="0" y="0" width="60" height={H} className="fill-muted" />
                    <rect x="0" y={fillY} width="60" height={H - fillY}
                      className="fill-primary transition-all duration-700" />
                  </g>
                  <circle cx="30" cy="26" r="7" className="fill-card stroke-border" strokeWidth="1" />
                  <g fill="none" className="stroke-border" strokeWidth="1.5">
                    <circle cx="30" cy="26" r="20" />
                    <rect x="24" y="40" width="12" height="170" rx="3" />
                    <rect x="36" y="150" width="10" height="8" />
                    <rect x="36" y="165" width="14" height="8" />
                    <rect x="36" y="180" width="8"  height="8" />
                  </g>
                </svg>
              </div>
              <div className="flex flex-col justify-between h-[224px] py-1">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">KPI</div>
                  <div className="text-4xl font-black tabular-nums text-foreground leading-none">
                    {overall}<span className="text-lg text-muted-foreground font-bold">/100</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Standing · <span className="text-primary font-bold tabular-nums">{lit}/{max}</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  {tiers.map(t => (
                    <div key={t.at} className={cn(
                      "flex items-center gap-1.5 text-[10px] font-mono tabular-nums",
                      overall >= t.at ? "text-primary font-bold" : "text-muted-foreground/60",
                    )}>
                      <span className={cn("h-1 w-1 rounded-full", overall >= t.at ? "bg-primary" : "bg-muted-foreground/40")} />
                      {t.at} · {t.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Earnings hero */}
        <div className="rounded-lg bg-primary/10 border border-primary/30 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Earnings · 30d</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-foreground tabular-nums leading-none">{fmtMoney(earnings30d)}</div>
            <div className="text-[11px] text-primary font-semibold">+${bonusAmount} bonus</div>
          </div>
        </div>

        {/* Booster grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: UserCheck,          label: "Regulars",     value: regulars,             hint: "÷2 → +1" },
            { icon: GraduationCap,      label: "Trial → Paid", value: trialsConverted,      hint: "÷2 → +1" },
            { icon: MessageCircleHeart, label: "5★ Feedback",  value: fiveStarFb,           hint: "÷3 → +1" },
            { icon: ShieldCheck,        label: "Attendance",   value: `${attendancePct}%`,  hint: "≥95% +1 · ≥98% +2" },
          ].map(s => (
            <div key={s.label} className="rounded-lg bg-muted/40 border border-border p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</span>
              </div>
              <div className="text-lg font-black text-foreground tabular-nums leading-none">{s.value}</div>
              <div className="text-[9px] text-muted-foreground/70 mt-0.5">{s.hint}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" /> Streak
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums">{lessonsStreak}</span>
          </div>
          <div className={cn(
            "flex items-center justify-between rounded-lg border px-3 py-2",
            lateArrivals > 0 ? "bg-destructive/10 border-destructive/30" : "bg-muted/30 border-border",
          )}>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <AlarmClock className={cn("h-3.5 w-3.5", lateArrivals > 0 ? "text-destructive" : "text-muted-foreground")} />
              Late · 30d
            </span>
            <span className={cn("text-sm font-bold tabular-nums", lateArrivals > 0 ? "text-destructive" : "text-foreground")}>
              {lateArrivals}
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-muted/30 border border-border px-3 py-2.5 space-y-1.5">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Recent events</div>
          {events.slice(0, 4).map((e, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <e.icon className={cn("h-3.5 w-3.5 shrink-0", e.tone === "good" ? "text-primary" : "text-destructive")} />
              <span className="flex-1 truncate text-foreground/90">{e.label}</span>
              <span className={cn("font-bold tabular-nums text-[11px]", e.tone === "good" ? "text-primary" : "text-destructive")}>
                {e.delta > 0 ? `+${e.delta}` : e.delta}
              </span>
              <span className="text-[10px] text-muted-foreground w-10 text-right shrink-0">{e.when}</span>
            </div>
          ))}
        </div>

        <Button size="sm" className="w-full">
          View standing rules <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── H · TEACHER'S COMPASS — Cardinal Bearings (original) ────────
// Four cardinals monitor the teacher: N Retain · E Grow · S Delight · W Show-Up.
// Outer ring fills to KPI score. Needle points to the strongest bearing.
const COMPASS_MOCK = {
  score: 88,
  tier: "Excellent",
  earnings30d: 2847,
  streak: 18,
  late: 1,
  attendPct: 96,
  cardinals: [
    { key: "N", label: "Retain",   icon: UserCheck,          value: 82, max: 20,  hint: "Regulars 4wk+" },
    { key: "E", label: "Grow",     icon: GraduationCap,      value: 76, max: 10,  hint: "Trial → Paid" },
    { key: "S", label: "Delight",  icon: MessageCircleHeart, value: 94, max: 30,  hint: "5★ feedback" },
    { key: "W", label: "Show-Up",  icon: ShieldCheck,        value: 96, max: 100, hint: "Attendance" },
  ],
  events: [
    { icon: MessageCircleHeart, label: "5★ from Amina's parent",  tone: "good" as const, when: "2h" },
    { icon: Repeat,             label: "Yacine booked wk 5",      tone: "good" as const, when: "1d" },
    { icon: CalendarX,          label: "Same-day cancel · Lina",  tone: "bad"  as const, when: "3d" },
    { icon: GraduationCap,      label: "Trial → paid · Reda",     tone: "good" as const, when: "5d" },
  ],
};

function VariantH() {
  const { score, tier, earnings30d, streak, late, attendPct, cardinals, events } = COMPASS_MOCK;
  const size = 220, cx = size / 2, cy = size / 2;
  const rRing = 100, rInner = 78;
  const c = 2 * Math.PI * rRing;
  const pct = Math.max(0, Math.min(1, score / 100));
  const offset = c - pct * c;

  // Weighted vector for the needle (each cardinal points N/E/S/W).
  const vectors = [
    { key: "N", x: 0,  y: -1, w: cardinals[0].value },
    { key: "E", x: 1,  y: 0,  w: cardinals[1].value },
    { key: "S", x: 0,  y: 1,  w: cardinals[2].value },
    { key: "W", x: -1, y: 0,  w: cardinals[3].value },
  ];
  const sumW = vectors.reduce((s, v) => s + v.w, 0);
  const vx = vectors.reduce((s, v) => s + (v.x * v.w) / sumW, 0);
  const vy = vectors.reduce((s, v) => s + (v.y * v.w) / sumW, 0);
  const angle = Math.atan2(vy, vx) * (180 / Math.PI);
  const strongestIdx = cardinals.reduce((best, c, i, arr) => c.value > arr[best].value ? i : best, 0);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <CardContent className="relative p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Teacher's Compass</span>
          </div>
          <Badge variant="secondary" className="font-semibold">
            <Shield className="h-3 w-3 mr-1" /> {tier}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 items-center">
          {/* Compass */}
          <div className="relative mx-auto" style={{ width: size, height: size }}>
            <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="overflow-visible">
              {/* Outer KPI ring */}
              <circle cx={cx} cy={cy} r={rRing} fill="none" className="stroke-muted" strokeWidth="8" />
              <circle
                cx={cx} cy={cy} r={rRing} fill="none"
                className="stroke-primary transition-all duration-700"
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={offset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
              {/* Inner face */}
              <circle cx={cx} cy={cy} r={rInner} className="fill-card stroke-border" strokeWidth="1" />
              {/* Cross ticks */}
              {[0, 90, 180, 270].map(a => (
                <line
                  key={a}
                  x1={cx} y1={cy - rInner + 4}
                  x2={cx} y2={cy - rInner + 12}
                  className="stroke-border" strokeWidth="1.5"
                  transform={`rotate(${a} ${cx} ${cy})`}
                />
              ))}
              {/* Needle */}
              <g transform={`rotate(${angle} ${cx} ${cy})`}>
                <polygon
                  points={`${cx},${cy - rInner + 14} ${cx - 6},${cy} ${cx},${cy + 8} ${cx + 6},${cy}`}
                  className="fill-primary"
                />
                <circle cx={cx} cy={cy} r="6" className="fill-card stroke-primary" strokeWidth="2" />
              </g>
              {/* Score readout */}
              <text x={cx} y={cy - 18} textAnchor="middle" className="fill-muted-foreground"
                    style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase" }}>KPI</text>
              <text x={cx} y={cy + 26} textAnchor="middle" className="fill-foreground font-black"
                    style={{ fontSize: 32, fontVariantNumeric: "tabular-nums" }}>{score}</text>
              <text x={cx} y={cy + 42} textAnchor="middle" className="fill-muted-foreground"
                    style={{ fontSize: 10 }}>/ 100</text>
            </svg>
            {/* Cardinal labels */}
            {cardinals.map((card, i) => {
              const pos = [
                { top: -6, left: "50%", tx: "-50%" },
                { top: "50%", right: -6, ty: "-50%" },
                { bottom: -6, left: "50%", tx: "-50%" },
                { top: "50%", left: -6, ty: "-50%" },
              ][i];
              const isStrong = i === strongestIdx;
              return (
                <div key={card.key}
                     className={cn(
                       "absolute flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                       isStrong ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"
                     )}
                     style={{
                       ...pos,
                       transform: `translate(${pos.tx ?? "0"}, ${pos.ty ?? "0"})`,
                     }}>
                  <card.icon className="h-3 w-3" />
                  <span>{card.key} · {card.label}</span>
                </div>
              );
            })}
          </div>

          {/* Right column · earnings + cardinals list */}
          <div className="space-y-3">
            <div className="rounded-lg bg-primary/10 border border-primary/30 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Earnings · 30d</span>
              </div>
              <div className="text-2xl font-black text-foreground tabular-nums leading-none">{fmtMoney(earnings30d)}</div>
            </div>

            <div className="space-y-1.5">
              {cardinals.map((card, i) => (
                <div key={card.key} className={cn(
                  "flex items-center gap-2 rounded-md border px-2.5 py-1.5",
                  i === strongestIdx ? "border-primary/40 bg-primary/5" : "border-border bg-muted/30"
                )}>
                  <card.icon className={cn("h-3.5 w-3.5", i === strongestIdx ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-[11px] font-semibold text-foreground flex-1">{card.label}</span>
                  <span className="text-[10px] text-muted-foreground">{card.hint}</span>
                  <span className="text-sm font-black tabular-nums text-foreground w-8 text-right">{card.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reliability pills */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" /> Streak
            </span>
            <span className="text-sm font-bold tabular-nums">{streak}</span>
          </div>
          <div className={cn("flex items-center justify-between rounded-lg border px-3 py-2",
            late > 0 ? "bg-destructive/10 border-destructive/30" : "bg-muted/30 border-border")}>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <AlarmClock className={cn("h-3.5 w-3.5", late > 0 ? "text-destructive" : "text-muted-foreground")} /> Late
            </span>
            <span className={cn("text-sm font-bold tabular-nums", late > 0 ? "text-destructive" : "text-foreground")}>{late}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/30 border border-border px-3 py-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Attend
            </span>
            <span className="text-sm font-bold tabular-nums">{attendPct}%</span>
          </div>
        </div>

        <div className="rounded-lg bg-muted/30 border border-border px-3 py-2.5 space-y-1.5">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Recent bearings</div>
          {events.map((e, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <e.icon className={cn("h-3.5 w-3.5 shrink-0", e.tone === "good" ? "text-primary" : "text-destructive")} />
              <span className="flex-1 truncate text-foreground/90">{e.label}</span>
              <span className="text-[10px] text-muted-foreground w-10 text-right shrink-0">{e.when}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── I · TEACHER AURA — Magical Standing (original) ──────────────
// Every teacher radiates an Aura reflecting their teaching excellence.
// Levels: Dormant · Spark · Glow · Radiance · Legendary.
// Events don't cost "hearts" — they brighten or fade the Aura.
const AURA_LEVELS = [
  { key: "dormant",   label: "Dormant",         min: 0,  swatch: "bg-muted",                     ring: "stroke-muted-foreground/40", glow: "shadow-none",                     dot: "bg-muted-foreground" },
  { key: "spark",     label: "Spark",           min: 40, swatch: "bg-emerald-400",               ring: "stroke-emerald-400",         glow: "shadow-[0_0_24px_rgba(52,211,153,.55)]", dot: "bg-emerald-400" },
  { key: "glow",      label: "Glow",            min: 60, swatch: "bg-sky-400",                   ring: "stroke-sky-400",             glow: "shadow-[0_0_32px_rgba(56,189,248,.6)]",  dot: "bg-sky-400" },
  { key: "radiance",  label: "Radiance",        min: 80, swatch: "bg-fuchsia-400",               ring: "stroke-fuchsia-400",         glow: "shadow-[0_0_40px_rgba(232,121,249,.7)]", dot: "bg-fuchsia-400" },
  { key: "legendary", label: "Legendary Aura",  min: 92, swatch: "bg-amber-300",                 ring: "stroke-amber-300",           glow: "shadow-[0_0_56px_rgba(252,211,77,.85)]", dot: "bg-amber-300" },
];

const AURA_MOCK = {
  brightness: 84, // 0–100
  weeklyDelta: +6,
  earnings30d: 2847,
  streak: 18,
  events: [
    { label: "Your Aura is shining brightly this week.", tone: "good" as const, when: "now" },
    { label: "Your Aura brightened — 5★ from Amina.",    tone: "good" as const, when: "2h"  },
    { label: "A trial glowed into a regular · Reda.",    tone: "good" as const, when: "1d"  },
    { label: "Your Aura faded — a missed lesson.",       tone: "bad"  as const, when: "3d"  },
    { label: "A small flicker — arrived late.",          tone: "bad"  as const, when: "1w"  },
  ],
};

function VariantI() {
  const { brightness, weeklyDelta, earnings30d, streak, events } = AURA_MOCK;
  const level = [...AURA_LEVELS].reverse().find(l => brightness >= l.min) ?? AURA_LEVELS[0];
  const nextLevel = AURA_LEVELS.find(l => l.min > brightness);
  const size = 200, cx = size / 2, cy = size / 2, r = 78;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, brightness / 100));
  const offset = c - pct * c;

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      {/* starfield */}
      <div className="absolute inset-0 opacity-70 pointer-events-none"
           style={{ backgroundImage: "radial-gradient(1px 1px at 15% 25%, #fff, transparent), radial-gradient(1px 1px at 75% 65%, #fff, transparent), radial-gradient(1px 1px at 40% 85%, #fff, transparent), radial-gradient(2px 2px at 88% 18%, #fde68a, transparent), radial-gradient(1px 1px at 12% 72%, #a5f3fc, transparent)" }} />
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-fuchsia-500/25 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-sky-500/20 blur-3xl" />

      <CardContent className="relative p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-semibold">Teacher Aura</span>
          </div>
          <Badge className={cn("border-0 text-slate-950 font-bold", level.swatch)}>
            <Star className="h-3 w-3 mr-1 fill-slate-950" /> {level.label}
          </Badge>
        </div>

        {/* Aura orb */}
        <div className="flex flex-col items-center">
          <div className={cn("relative rounded-full transition-shadow duration-700", level.glow)}
               style={{ width: size, height: size }}>
            <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
              {/* soft halo */}
              <defs>
                <radialGradient id="aura-halo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx={cx} cy={cy} r={r + 18}
                      className={cn("text-current", level.ring)}
                      fill="url(#aura-halo)" />
              {/* track */}
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
              {/* brightness */}
              <circle
                cx={cx} cy={cy} r={r} fill="none"
                className={cn(level.ring, "transition-all duration-700")}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={offset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
              {/* core */}
              <circle cx={cx} cy={cy} r={r - 22} className={cn(level.swatch, "opacity-20")} />
              <text x={cx} y={cy - 4} textAnchor="middle" className="fill-white font-black"
                    style={{ fontSize: 36, fontVariantNumeric: "tabular-nums" }}>{brightness}</text>
              <text x={cx} y={cy + 16} textAnchor="middle" className="fill-white/60"
                    style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase" }}>brightness</text>
            </svg>
          </div>
          <div className="mt-3 text-center">
            <div className="text-sm font-bold text-white/90">
              {weeklyDelta >= 0 ? "Your Aura is shining brighter this week." : "Your Aura faded this week."}
            </div>
            {nextLevel && (
              <div className="text-[11px] text-white/60 mt-0.5">
                {nextLevel.min - brightness} to <span className="font-semibold text-white/80">{nextLevel.label}</span>
              </div>
            )}
          </div>
        </div>

        {/* Level ladder */}
        <div className="grid grid-cols-5 gap-1.5">
          {AURA_LEVELS.map(l => {
            const active = brightness >= l.min;
            const current = l.key === level.key;
            return (
              <div key={l.key} className={cn(
                "rounded-md border px-1.5 py-1.5 text-center transition-all",
                current ? "border-white/70 bg-white/10" :
                active  ? "border-white/30 bg-white/5"  :
                          "border-white/10 bg-white/[0.02] opacity-60",
              )}>
                <div className={cn("mx-auto h-2.5 w-2.5 rounded-full mb-1", l.dot,
                                   !active && "opacity-40")} />
                <div className="text-[9px] font-bold uppercase tracking-wider text-white/80 leading-tight">
                  {l.label.split(" ")[0]}
                </div>
                <div className="text-[9px] text-white/40 font-mono">{l.min}+</div>
              </div>
            );
          })}
        </div>

        {/* Earnings + streak */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/5 backdrop-blur border border-white/10 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/60">
              <DollarSign className="h-3.5 w-3.5" /> Earnings · 30d
            </div>
            <div className="text-xl font-black tabular-nums mt-0.5">{fmtMoney(earnings30d)}</div>
          </div>
          <div className="rounded-lg bg-white/5 backdrop-blur border border-white/10 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/60">
              <TrendingUp className="h-3.5 w-3.5" /> Streak
            </div>
            <div className="text-xl font-black tabular-nums mt-0.5">{streak}</div>
          </div>
        </div>

        {/* Aura journal */}
        <div className="rounded-lg bg-white/5 backdrop-blur border border-white/10 px-3 py-2.5 space-y-1.5">
          <div className="text-[10px] uppercase tracking-widest text-white/60 mb-1">Aura journal</div>
          {events.map((e, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0",
                                  e.tone === "good" ? "bg-amber-300" : "bg-fuchsia-400/70")} />
              <span className="flex-1 truncate text-white/85">{e.label}</span>
              <span className="text-[10px] text-white/50 w-10 text-right shrink-0">{e.when}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const VARIANTS = [
  { id: "A", name: "Neon Arcade",     theme: "🕹️ Coin-op arcade — scanlines, hi-score, combo streak", cmp: VariantA },
  { id: "B", name: "Grand Prix",      theme: "🏁 Racing dashboard — RPM speedometer, checkered flag, podium", cmp: VariantB },
  { id: "C", name: "Trading Card",    theme: "💎 Collectible foil — legendary rarity, star rating, ability strike", cmp: VariantC },
  { id: "D", name: "RPG Quest",       theme: "⚔️ Level-up adventure — XP bar, class rank, loot claim", cmp: VariantD },
  { id: "E", name: "Space Mission",   theme: "🚀 Cosmic ops — starfield, telemetry, mission log", cmp: VariantE },
  { id: "F", name: "8-Bit Handheld",  theme: "👾 Retro pixel — Game-Boy screen, pixel bars, HI-SCORE", cmp: VariantF },
  { id: "G", name: "Legacy Embers",   theme: "🔥 10-ember hearth — cancels dim, regulars/trials/5★ relight", cmp: VariantG },
  { id: "H", name: "Teacher's Compass", theme: "🧭 Cardinal bearings — N Retain · E Grow · S Delight · W Show-Up", cmp: VariantH },
  { id: "I", name: "Teacher Aura",    theme: "✨ Magical standing — Dormant → Spark → Glow → Radiance → Legendary", cmp: VariantI },
];

export default function KpiCardGallery() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">KPI Card — Gamified Gallery</h1>
        <p className="text-muted-foreground mt-1">
          Six themed directions using the same mock KPI data. Pick a theme (A–F) and I'll wire it into the teacher dashboard with real API data.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {VARIANTS.map(v => {
          const Cmp = v.cmp;
          return (
            <div key={v.id} className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">{v.id}</Badge>
                  <span className="font-semibold">{v.name}</span>
                </div>
                <span className="text-xs text-muted-foreground text-right">{v.theme}</span>
              </div>
              <Cmp />
            </div>
          );
        })}
      </div>
    </div>
  );
}
