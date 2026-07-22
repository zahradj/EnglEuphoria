import { Sparkles, Star, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export type AuraLevel = {
  key: "dormant" | "spark" | "glow" | "radiance" | "legendary";
  label: string;
  min: number;
  /** Base HSL triplet "h s% l%" used to tint the whole dashboard. */
  hsl: string;
  dot: string;
  ring: string;
  swatch: string;
  glow: string;
};

export const AURA_LEVELS: AuraLevel[] = [
  { key: "dormant",   label: "Dormant",         min: 0,  hsl: "220 10% 60%",  dot: "bg-muted-foreground",  ring: "stroke-muted-foreground/60",  swatch: "bg-muted",             glow: "shadow-none" },
  { key: "spark",     label: "Spark",           min: 40, hsl: "152 76% 55%",  dot: "bg-emerald-400",       ring: "stroke-emerald-400",          swatch: "bg-emerald-400",       glow: "shadow-[0_0_28px_hsl(var(--aura-hsl)/0.55)]" },
  { key: "glow",      label: "Glow",            min: 60, hsl: "199 90% 60%",  dot: "bg-sky-400",           ring: "stroke-sky-400",              swatch: "bg-sky-400",           glow: "shadow-[0_0_36px_hsl(var(--aura-hsl)/0.6)]" },
  { key: "radiance",  label: "Radiance",        min: 80, hsl: "292 84% 68%",  dot: "bg-fuchsia-400",       ring: "stroke-fuchsia-400",          swatch: "bg-fuchsia-400",       glow: "shadow-[0_0_44px_hsl(var(--aura-hsl)/0.7)]" },
  { key: "legendary", label: "Legendary Aura",  min: 92, hsl: "45 96% 62%",   dot: "bg-amber-300",         ring: "stroke-amber-300",            swatch: "bg-amber-300",         glow: "shadow-[0_0_60px_hsl(var(--aura-hsl)/0.85)]" },
];

export function resolveAuraLevel(brightness: number): AuraLevel {
  return [...AURA_LEVELS].reverse().find(l => brightness >= l.min) ?? AURA_LEVELS[0];
}

interface Props {
  brightness?: number;
  weeklyDelta?: number;
  earnings30d?: number;
  streak?: number;
  events?: { label: string; tone: "good" | "bad"; when: string }[];
}

const fmtMoney = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;

export function TeacherAuraRail({
  brightness = 84,
  weeklyDelta = 6,
  earnings30d = 2847,
  streak = 18,
  events = [
    { label: "Your Aura is shining brightly this week.", tone: "good", when: "now" },
    { label: "Your Aura brightened — 5★ from Amina.",    tone: "good", when: "2h" },
    { label: "A trial glowed into a regular · Reda.",    tone: "good", when: "1d" },
    { label: "Your Aura faded — a missed lesson.",       tone: "bad",  when: "3d" },
  ],
}: Props) {
  const level = resolveAuraLevel(brightness);
  const nextLevel = AURA_LEVELS.find(l => l.min > brightness);
  const pct = Math.max(0, Math.min(1, brightness / 100));

  return (
    <aside
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72 w-full flex flex-col gap-4 transition-all duration-700 backdrop-blur-xl text-foreground",
        level.glow,
      )}
      style={{
        ["--aura-hsl" as any]: level.hsl,
        background:
          "linear-gradient(160deg, hsl(var(--aura-hsl) / 0.18) 0%, hsl(var(--aura-hsl) / 0.08) 55%, hsl(var(--card) / 0.85) 100%), " +
          "radial-gradient(120% 80% at 100% 0%, hsl(var(--aura-hsl) / 0.14), transparent 65%), " +
          "hsl(var(--card) / 0.75)",
        borderColor: "hsl(var(--aura-hsl) / 0.25)",
        boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.4), inset 0 -1px 0 hsl(var(--aura-hsl) / 0.15)",
      }}
    >
      {/* Glossy top sheen */}
      <div className="absolute inset-x-0 top-0 h-1/3 pointer-events-none rounded-t-2xl"
           style={{ background: "linear-gradient(to bottom, hsl(0 0% 100% / 0.35), transparent)" }} />
      {/* Soft aura bloom */}
      <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full blur-3xl opacity-40 pointer-events-none"
           style={{ background: "hsl(var(--aura-hsl))" }} />

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: "hsl(var(--aura-hsl))" }} />
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">Teacher Aura</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md text-slate-950"
             style={{ background: "hsl(var(--aura-hsl))" }}>
          <Star className="h-3 w-3 fill-slate-950" /> {level.label.split(" ")[0]}
        </div>
      </div>

      {/* Earnings — the reward crown */}
      <div className="relative">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          <DollarSign className="h-3 w-3" /> Earnings · 30d
        </div>
        <div className="flex items-baseline justify-between mt-0.5">
          <div className="text-3xl font-black tabular-nums leading-none"
               style={{ color: "hsl(var(--aura-hsl))", textShadow: "0 0 24px hsl(var(--aura-hsl) / 0.6)" }}>
            {fmtMoney(earnings30d)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <TrendingUp className="h-3 w-3" /> {streak}d
          </div>
        </div>
      </div>

      {/* Unified brightness + levels */}
      <div className="relative flex gap-3">
        {/* Vertical brightness ruler with level markers */}
        <div className="relative w-3 rounded-full bg-foreground/5 overflow-visible" style={{ minHeight: 220 }}>
          <div
            className="absolute inset-x-0 bottom-0 rounded-full transition-all duration-700"
            style={{
              height: `${pct * 100}%`,
              background: "linear-gradient(to top, hsl(var(--aura-hsl) / 0.95), hsl(var(--aura-hsl) / 0.35))",
              boxShadow: "0 0 24px hsl(var(--aura-hsl) / 0.7)",
            }}
          />
          {AURA_LEVELS.map(l => (
            <div key={l.key}
                 className="absolute -inset-x-1 h-px bg-white/25"
                 style={{ bottom: `${l.min}%` }} />
          ))}
          {/* current marker */}
          <div
            className="absolute -left-1.5 h-3 w-6 rounded-full border-2 border-white transition-all duration-700"
            style={{
              bottom: `calc(${pct * 100}% - 6px)`,
              background: "hsl(var(--aura-hsl))",
              boxShadow: "0 0 14px hsl(var(--aura-hsl))",
            }}
          />
        </div>

        {/* Level ladder — anchored to the ruler */}
        <div className="relative flex-1" style={{ minHeight: 220 }}>
          {[...AURA_LEVELS].reverse().map(l => {
            const active = brightness >= l.min;
            const current = l.key === level.key;
            return (
              <div
                key={l.key}
                className={cn(
                  "absolute inset-x-0 flex items-center gap-2 rounded-md border px-2 py-1 transition-all -translate-y-1/2",
                  current
                    ? "border-foreground/40 bg-foreground/5"
                    : active
                    ? "border-foreground/15 bg-foreground/[0.03]"
                    : "border-foreground/10 bg-foreground/[0.02] opacity-55",
                )}
                style={{ bottom: `${l.min}%` }}
              >
                <span
                  className={cn("h-2 w-2 rounded-full shrink-0", l.dot, !active && "opacity-40")}
                  style={current ? { boxShadow: "0 0 10px hsl(var(--aura-hsl))" } : undefined}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/85 flex-1 truncate">
                  {l.label}
                </span>
                <span className="text-[9px] text-muted-foreground/70 font-mono tabular-nums">{l.min}+</span>
              </div>
            );
          })}
        </div>

        {/* Big brightness readout */}
        <div className="relative flex flex-col justify-between items-end shrink-0">
          <div className="text-right">
            <div className="text-3xl font-black tabular-nums leading-none">{brightness}</div>
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">Brightness</div>
          </div>
          <div className="text-[10px] text-muted-foreground text-right leading-tight">
            {weeklyDelta >= 0 ? "Brighter" : "Faded"}<br />
            <span className="text-muted-foreground/70">{weeklyDelta >= 0 ? "+" : ""}{weeklyDelta} this wk</span>
          </div>
        </div>
      </div>

      {nextLevel && (
        <div className="relative text-[11px] text-muted-foreground text-center">
          {nextLevel.min - brightness} to <span className="font-semibold text-foreground/90">{nextLevel.label}</span>
        </div>
      )}

      {/* Aura journal */}
      <div className="relative rounded-lg bg-foreground/[0.03] border border-foreground/10 px-2.5 py-2 space-y-1 flex-1 overflow-auto min-h-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Aura journal</div>
        {events.map((e, i) => (
          <div key={i} className="flex items-start gap-2 text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full shrink-0 mt-1.5"
                  style={{ background: e.tone === "good" ? "hsl(var(--aura-hsl))" : "hsl(292 84% 68% / 0.7)" }} />
            <span className="flex-1 text-foreground/85 leading-snug">{e.label}</span>
            <span className="text-[10px] text-muted-foreground/70 shrink-0">{e.when}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default TeacherAuraRail;
