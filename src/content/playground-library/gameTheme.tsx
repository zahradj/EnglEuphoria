import { useMemo, type CSSProperties, type ReactNode } from 'react';

/**
 * Shared "game dressing" for the alphabet / phonics games: backdrops, the
 * title ribbon and progress pill, and a few small flat SVG props. Everything
 * is flat 2D vector (no emoji, no 3D) and sized in container units (`cqw`/`cqh`),
 * so it needs a `container-type: size` ancestor — every game scene root has one.
 */

export const GAME_FONT = "'Fredoka', 'Baloo 2', system-ui, sans-serif";

/* ---------------- Animation layer ---------------- */

/** Every keyframe the game scenes use. Decorative loops carry the `gt-idle`
 *  class, which `prefers-reduced-motion` switches off (entrances stay: they
 *  are short and carry meaning). Render once per scene root. */
export function GameStyles() {
  return (
    <style>{`
      @keyframes gt-slide-down { from { transform: translateY(-160%); opacity: 0; } to { transform: none; opacity: 1; } }
      @keyframes gt-pop-in { 0% { transform: scale(.4); opacity: 0; } 65% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
      @keyframes gt-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-1.1cqh); } }
      @keyframes gt-sway { 0%,100% { transform: rotate(-1.8deg) translateY(0); } 50% { transform: rotate(1.8deg) translateY(-0.5cqh); } }
      @keyframes gt-drift { from { transform: translateX(-30cqw); } to { transform: translateX(125cqw); } }
      @keyframes gt-spin { to { transform: rotate(360deg); } }
      @keyframes gt-puff { 0% { transform: translate(0,0) scale(.4); opacity: 0; } 20% { opacity: .85; } 100% { transform: translate(7px,-26px) scale(1.7); opacity: 0; } }
      @keyframes gt-burst { 0% { transform: translate(0,0) scale(.2) rotate(0); opacity: 1; } 70% { opacity: 1; } 100% { transform: translate(var(--dx), var(--dy)) scale(1) rotate(var(--rot)); opacity: 0; } }
      @keyframes gt-ring { 0% { transform: translate(-50%,-50%) scale(.4); opacity: .9; } 100% { transform: translate(-50%,-50%) scale(2.6); opacity: 0; } }
      @keyframes gt-flip-in { 0% { transform: perspective(900px) rotateY(-80deg) scale(.8); opacity: 0; } 100% { transform: perspective(900px) rotateY(0) scale(1); opacity: 1; } }
      @keyframes gt-rise-in { 0% { transform: translateY(5cqh) scale(.92); opacity: 0; } 100% { transform: none; opacity: 1; } }
      @keyframes gt-nudge { 0%,100% { transform: translateX(0); } 50% { transform: translateX(.9cqw); } }
      @keyframes gt-shine { 0% { transform: translateX(-130%) skewX(-20deg); } 55%,100% { transform: translateX(230%) skewX(-20deg); } }
      @keyframes gt-depart { 0% { transform: translateX(0); } 14% { transform: translateX(-2.5cqw); } 100% { transform: translateX(128cqw); } }
      @keyframes gt-wag { 0%,100% { transform: rotate(-10deg); } 50% { transform: rotate(12deg); } }
      @keyframes gt-ray { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
      @keyframes gt-glow-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(251,146,60,.55); } 50% { box-shadow: 0 0 0 1.6cqh rgba(251,146,60,0); } }
      @keyframes gt-wave { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2.6cqh) rotate(-3deg); } }
      @keyframes gt-door { 0% { transform: perspective(700px) rotateY(0); } 100% { transform: perspective(700px) rotateY(-115deg); } }
      @keyframes gt-speak { 0%,100% { transform: scale(1); } 50% { transform: scale(1.22); } }
      @media (prefers-reduced-motion: reduce) { .gt-idle { animation: none !important; } }
    `}</style>
  );
}

const BURST_COLORS = ['#FE6A2F', '#FFC93C', '#7BE0FF', '#FF6EA5', '#7ee081', '#B892FF'];

/** One-shot particle burst from (x%, y%) of the scene. Mount it with a fresh
 *  `key` each time you want it to play. Sizes are in container units. */
export function Burst({ x, y, count = 18, spread = 22, colors = BURST_COLORS, ring = true }: { x: number; y: number; count?: number; spread?: number; colors?: string[]; ring?: boolean }) {
  const parts = useMemo(() => Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const dist = spread * (0.55 + Math.random() * 0.7);
    return {
      dx: `${(Math.cos(angle) * dist).toFixed(1)}cqw`,
      dy: `${(Math.sin(angle) * dist * 0.9 - 4).toFixed(1)}cqh`,
      rot: `${Math.round((Math.random() - 0.5) * 540)}deg`,
      size: 1 + Math.random() * 1.3,
      dur: 650 + Math.random() * 500,
      color: colors[i % colors.length],
      star: i % 3 === 0,
    };
  }), [count, spread, colors]);
  return (
    <div className="pointer-events-none absolute z-30" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true">
      {ring && <span className="absolute rounded-full border-[0.6cqh] border-white/90" style={{ left: 0, top: 0, width: '9cqh', height: '9cqh', animation: 'gt-ring .7s ease-out forwards' }} />}
      {parts.map((p, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: 0, top: 0, width: `${p.size}cqh`, height: `${p.size}cqh`, background: p.color,
            borderRadius: p.star ? '25%' : '50%', opacity: 0,
            animation: `gt-burst ${p.dur}ms cubic-bezier(.15,.7,.3,1) forwards`,
            ['--dx' as string]: p.dx, ['--dy' as string]: p.dy, ['--rot' as string]: p.rot,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}

/* ---------------- Backdrops ---------------- */

function Cloud({ left, top, scale = 1, opacity = 0.9, dur = 70, delay = 0 }: { left: string; top: string; scale?: number; opacity?: number; dur?: number; delay?: number }) {
  return (
    <svg viewBox="0 0 120 50" className="gt-idle pointer-events-none absolute" style={{ left, top, width: `${16 * scale}cqw`, opacity, animation: `gt-drift ${dur}s linear ${delay}s infinite` }} aria-hidden="true">
      <path d="M20 44C6 44 2 28 14 24C14 12 30 6 38 16C44 4 64 4 70 16C84 8 102 18 98 32C112 32 116 44 102 44Z" fill="#fff" />
    </svg>
  );
}

/** Sunny sky + rolling hills (used by the train and the letter homes). */
export function SkyBackdrop({ bg, hills = true }: { bg?: string; hills?: boolean }) {
  if (bg) {
    return <div className="absolute inset-0" style={{ backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />;
  }
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'linear-gradient(180deg, #8fd3ff 0%, #c9ecff 55%, #effaff 100%)' }}>
      <Cloud left="0%" top="14%" scale={1} dur={80} delay={-12} />
      <Cloud left="0%" top="24%" scale={1.2} opacity={0.8} dur={110} delay={-70} />
      <Cloud left="0%" top="7%" scale={0.7} opacity={0.7} dur={95} delay={-40} />
      {hills && (
        <>
          <div className="absolute rounded-[50%]" style={{ left: '-10%', right: '35%', bottom: '-30%', height: '48%', background: '#7bd389' }} />
          <div className="absolute rounded-[50%]" style={{ left: '30%', right: '-15%', bottom: '-34%', height: '52%', background: '#5cc474' }} />
        </>
      )}
    </div>
  );
}

/** Underwater scene for First Sound Fishing: light rays, rising bubbles, sand. */
export function SeaBackdrop({ bg }: { bg?: string }) {
  if (bg) {
    return <div className="absolute inset-0" style={{ backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />;
  }
  const bubbles = [
    { left: '8%', size: 3.2, delay: 0, dur: 9 }, { left: '22%', size: 2, delay: 3, dur: 7 }, { left: '38%', size: 2.6, delay: 5, dur: 10 },
    { left: '62%', size: 3, delay: 1.5, dur: 8.5 }, { left: '78%', size: 2.2, delay: 4, dur: 7.5 }, { left: '92%', size: 3.4, delay: 2, dur: 11 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'linear-gradient(180deg, #5fd0ff 0%, #1aa3e8 45%, #0b6fb8 100%)' }}>
      <style>{`@keyframes gt-rise { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: .7; } 100% { transform: translateY(-115cqh); opacity: 0; } }
@keyframes gt-sway { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }`}</style>
      {[12, 38, 64].map((l) => (
        <div key={l} className="gt-idle absolute top-0" style={{ left: `${l}%`, width: '9%', height: '75%', background: 'linear-gradient(180deg, rgba(255,255,255,.28), rgba(255,255,255,0))', transform: 'skewX(-14deg)', animation: `gt-ray ${5 + l / 20}s ease-in-out infinite` }} />
      ))}
      {bubbles.map((b, i) => (
        <span key={i} className="absolute rounded-full border-2 border-white/70 bg-white/20" style={{ left: b.left, bottom: '-6cqh', width: `${b.size}cqw`, height: `${b.size}cqw`, animation: `gt-rise ${b.dur}s linear ${b.delay}s infinite` }} />
      ))}
      <div className="absolute rounded-[50%]" style={{ left: '-8%', right: '-8%', bottom: '-14%', height: '26%', background: '#f3d899' }} />
      {[{ l: '6%', h: 16 }, { l: '13%', h: 11 }, { l: '86%', h: 15 }, { l: '93%', h: 10 }].map((w, i) => (
        <svg key={i} viewBox="0 0 30 60" className="absolute origin-bottom" style={{ left: w.l, bottom: '7%', height: `${w.h}cqh`, animation: `gt-sway ${3 + i * 0.4}s ease-in-out infinite` }} aria-hidden="true">
          <path d="M15 60C6 44 22 36 12 22C8 14 14 6 15 0C18 12 28 24 20 38C14 48 24 52 15 60Z" fill="#2fb36b" />
        </svg>
      ))}
    </div>
  );
}

/* ---------------- HUD ---------------- */

/** Wooden-sign game title with a small icon on its left. */
export function TitleRibbon({ text, icon }: { text: string; icon?: ReactNode }) {
  return (
    <div
      className="flex shrink-0 items-center gap-[1cqw] rounded-[2.4cqh] border-[0.5cqh] border-[#8a5a2b] bg-[#f4c87a] px-[2cqw] py-[0.8cqh] font-black text-[#4a2a0c] shadow-[0_0.8cqh_0_#8a5a2b]"
      style={{ fontSize: '4cqh', lineHeight: 1.1, fontFamily: GAME_FONT }}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}

/** "7 / 26" with a fill bar. */
export function ProgressPill({ done, total, color = '#22c55e', label }: { done: number; total: number; color?: string; label?: string }) {
  const pct = total > 0 ? Math.min(100, (done / total) * 100) : 0;
  return (
    <div className="flex shrink-0 flex-col items-stretch gap-[0.4cqh] rounded-[2.4cqh] bg-white/90 px-[1.6cqw] py-[0.8cqh] shadow-lg" style={{ minWidth: '16cqw', fontFamily: GAME_FONT }}>
      <div className="text-center font-black text-slate-700" style={{ fontSize: '3.2cqh', lineHeight: 1.1 }}>
        <span key={done} className="inline-block" style={{ animation: 'gt-pop-in .35s cubic-bezier(.2,.9,.3,1.4)' }}>{done}</span> / {total}{label ? ` ${label}` : ''}
      </div>
      <div className="relative h-[1.6cqh] overflow-hidden rounded-full bg-slate-200">
        <div className="relative h-full overflow-hidden rounded-full transition-[width] duration-700 ease-out" style={{ width: `${pct}%`, background: color }}>
          <span className="gt-idle absolute inset-y-0 w-1/3 bg-white/45" style={{ animation: 'gt-shine 2.2s ease-in-out infinite' }} />
        </div>
      </div>
    </div>
  );
}

/** Top bar: ribbon left, instruction centre, progress right. */
export function HudBar({ left, centre, right }: { left?: ReactNode; centre?: ReactNode; right?: ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-x-[2%] top-[1.8%] z-10 flex items-center justify-between gap-[1.5cqw]" style={{ height: '9cqh' }}>
      <div style={{ animation: 'gt-slide-down .55s cubic-bezier(.2,.9,.3,1.2) both' }}>{left}</div>
      <div className="flex min-w-0 flex-1 justify-center" style={{ animation: 'gt-slide-down .55s cubic-bezier(.2,.9,.3,1.2) .12s both' }}>{centre}</div>
      <div style={{ animation: 'gt-slide-down .55s cubic-bezier(.2,.9,.3,1.2) .24s both' }}>{right}</div>
    </div>
  );
}

export function PromptChip({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-full bg-white/90 px-[2.4cqw] py-[0.8cqh] text-center font-black text-orange-600 shadow-md" style={{ fontSize: '3cqh', lineHeight: 1.15, fontFamily: GAME_FONT }}>
      {children}
    </div>
  );
}

/* ---------------- Flat SVG props ---------------- */

export function LocoIcon({ height = '5cqh', smoke = true }: { height?: string; smoke?: boolean }) {
  return (
    <svg viewBox="0 0 90 56" style={{ height, overflow: 'visible' }} aria-hidden="true">
      {smoke && [0, 0.7, 1.4].map((d) => (
        <circle key={d} cx="18" cy="6" r="4" fill="#fff" className="gt-idle" style={{ animation: `gt-puff 2.1s ease-out ${d}s infinite`, opacity: 0 }} />
      ))}
      <rect x="6" y="20" width="50" height="22" rx="6" fill="#ef4444" stroke="#5b1d1d" strokeWidth="3" />
      <rect x="44" y="8" width="34" height="34" rx="6" fill="#dc2626" stroke="#5b1d1d" strokeWidth="3" />
      <rect x="52" y="14" width="18" height="14" rx="3" fill="#cfeaff" stroke="#5b1d1d" strokeWidth="3" />
      <rect x="12" y="8" width="12" height="14" rx="3" fill="#374151" stroke="#5b1d1d" strokeWidth="3" />
      <circle cx="22" cy="46" r="8" fill="#374151" stroke="#5b1d1d" strokeWidth="3" />
      <circle cx="62" cy="46" r="8" fill="#374151" stroke="#5b1d1d" strokeWidth="3" />
    </svg>
  );
}

export function HouseIcon({ height = '5cqh' }: { height?: string }) {
  return (
    <svg viewBox="0 0 60 56" style={{ height }} aria-hidden="true">
      <path d="M6 28L30 6L54 28Z" fill="#ef6c3f" stroke="#5b1d1d" strokeWidth="3" strokeLinejoin="round" />
      <rect x="12" y="28" width="36" height="24" rx="2" fill="#ffe3a8" stroke="#5b1d1d" strokeWidth="3" />
      <rect x="25" y="36" width="10" height="16" rx="3" fill="#8a5a2b" stroke="#5b1d1d" strokeWidth="2.5" />
    </svg>
  );
}

/** A fish whose body carries `children` (the letter). `color` is the body fill. */
export function Fish({ color, children, style, className = '' }: { color: string; children?: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: '1.45 / 1', ...style }}>
      <svg viewBox="0 0 145 100" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <path className="gt-idle" d="M104 50L140 18Q146 50 140 82Z" fill={color} stroke="#0b3a66" strokeWidth="4" strokeLinejoin="round" style={{ transformOrigin: '104px 50px', animation: 'gt-wag .9s ease-in-out infinite' }} />
        <path d="M44 20Q64 -2 84 20Z" fill={color} stroke="#0b3a66" strokeWidth="4" strokeLinejoin="round" />
        <ellipse cx="62" cy="52" rx="58" ry="40" fill={color} stroke="#0b3a66" strokeWidth="4" />
        <ellipse cx="48" cy="30" rx="26" ry="8" fill="#fff" opacity=".35" transform="rotate(-12 48 30)" />
        <circle cx="26" cy="42" r="8" fill="#fff" stroke="#0b3a66" strokeWidth="3" />
        <circle cx="24" cy="42" r="4" fill="#0b3a66" />
      </svg>
      <div className="absolute flex items-center justify-center font-black text-white" style={{ left: '30%', right: '22%', top: '18%', bottom: '18%' }}>
        {children}
      </div>
    </div>
  );
}

/** A train car: coloured body, two wheels and a coupler. `unit` is any CSS length. */
export function TrainCar({ unit, color, children, glyph, sound = false, rolling = false, className = '', style }: {
  unit: string;
  color: string;
  children: ReactNode;
  glyph: string;
  sound?: boolean;
  /** Spin the wheels (the train is moving). */
  rolling?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`relative ${className}`} style={{ width: unit, height: unit, ...style }}>
      <div className="absolute" style={{ right: `calc(${unit} * -0.1)`, top: '62%', width: `calc(${unit} * 0.12)`, height: `calc(${unit} * 0.08)`, background: '#6b7280', borderRadius: 3 }} />
      <div
        className="absolute inset-x-0 top-0 flex items-center justify-center rounded-[22%] font-black text-white"
        style={{ height: '88%', backgroundColor: color, fontSize: glyph, lineHeight: 1, boxShadow: 'inset 0 -0.55cqh 0 rgba(0,0,0,.18), 0 0.6cqh 1.4cqh rgba(15,23,42,.25)', border: '0.4cqh solid rgba(0,0,0,.25)' }}
      >
        <span style={{ textShadow: '0 0.3cqh 0 rgba(0,0,0,.25)' }}>{children}</span>
        <div className="absolute inset-x-[12%] top-[7%] h-[10%] rounded-full bg-white/35" />
        {sound && (
          <svg viewBox="0 0 24 24" className="absolute" style={{ right: '8%', top: '8%', width: '24%', height: '24%' }} aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="#fff" />
            <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        )}
      </div>
      {[22, 62].map((l) => (
        <div key={l} className="absolute rounded-full" style={{ left: `${l}%`, bottom: 0, width: '22%', height: '22%', background: '#374151', border: '0.35cqh solid #111827', boxShadow: 'inset 0 0 0 0.35cqh #9ca3af' }}>
          <span className="absolute inset-0" style={{ animation: rolling ? 'gt-spin .45s linear infinite' : undefined }}>
            <span className="absolute left-1/2 top-[8%] h-[84%] w-[12%] -translate-x-1/2 rounded bg-[#d1d5db]" />
            <span className="absolute left-[8%] top-1/2 h-[12%] w-[84%] -translate-y-1/2 rounded bg-[#d1d5db]" />
          </span>
        </div>
      ))}
    </div>
  );
}
