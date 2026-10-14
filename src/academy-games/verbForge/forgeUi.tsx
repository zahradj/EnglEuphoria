import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import type { Verb } from './verbData';

/** The three forms always wear the same colours (they are the "colour code" of the whole game). */
export const FORM = {
  base: { label: 'Base', short: '1', hex: '#38bdf8', soft: 'rgba(56,189,248,.16)' },
  past: { label: 'Past simple', short: '2', hex: '#fb923c', soft: 'rgba(251,146,60,.16)' },
  pp: { label: 'Past participle', short: '3', hex: '#4ade80', soft: 'rgba(74,222,128,.16)' },
} as const;
export type FormId = keyof typeof FORM;

/** Small deterministic random generator (so tests and "seeded" sessions are repeatable). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffled<T>(items: T[], random: () => number): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Living world: drifting embers over a deep violet-to-ember sky. Decorative only. */
export function ForgeBackdrop() {
  const embers = Array.from({ length: 14 }, (_, i) => ({ left: (i * 71 + 9) % 100, size: 3 + (i % 4) * 1.6, delay: (i * 0.55) % 6, dur: 5 + (i % 5) }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 50% 110%, #7c2d12 0%, #3b0764 38%, #160a2e 75%)' }} />
      {embers.map((e, i) => (
        <motion.span
          key={i}
          className="absolute bottom-[-4%] rounded-full"
          style={{ left: `${e.left}%`, width: e.size, height: e.size, background: '#fdba74', boxShadow: '0 0 10px 2px rgba(251,146,60,.8)' }}
          animate={{ y: [0, -520], x: [0, (i % 2 ? 24 : -24)], opacity: [0, 0.9, 0] }}
          transition={{ duration: e.dur, repeat: Infinity, delay: e.delay, ease: 'easeOut' }}
        />
      ))}
      {/* the forge's glow along the floor */}
      <motion.div className="absolute inset-x-0 bottom-0 h-28" style={{ background: 'linear-gradient(0deg, rgba(251,146,60,.35), rgba(251,146,60,0))' }} animate={{ opacity: [0.55, 1, 0.55] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} />
    </div>
  );
}

/** Gentle sparks from a point (px inside the frame) on every right answer. */
export function useSparks() {
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);
  const uid = useRef(0);
  const fire = useCallback((x: number, y: number) => {
    const id = ++uid.current;
    setSparks((s) => [...s.slice(-3), { id, x, y }]);
    window.setTimeout(() => setSparks((s) => s.filter((q) => q.id !== id)), 1100);
  }, []);
  return [sparks, fire] as const;
}

export function Sparks({ items }: { items: { id: number; x: number; y: number }[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden" aria-hidden="true">
      {items.map((s) => (
        <span key={s.id} className="absolute" style={{ left: s.x, top: s.y }}>
          <motion.span className="absolute rounded-full border-2 border-amber-300" initial={{ width: 8, height: 8, x: -4, y: -4, opacity: 0.9 }} animate={{ width: 150, height: 150, x: -75, y: -75, opacity: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} />
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const d = 60 + (i % 3) * 26;
            return (
              <motion.span
                key={i}
                className="absolute rounded-full"
                style={{ width: 7, height: 7, background: i % 3 === 0 ? '#fde68a' : i % 3 === 1 ? '#fb923c' : '#f472b6', boxShadow: '0 0 8px rgba(253,186,116,.9)' }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d + 28, opacity: 0, scale: 0.3 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
            );
          })}
        </span>
      ))}
    </div>
  );
}

/** One of the three coloured slots of a verb card. */
export function FormChip({ form, text, hidden, focus, size = 'lg', dim }: { form: FormId; text?: string; hidden?: boolean; focus?: boolean; size?: 'md' | 'lg'; dim?: boolean }) {
  const f = FORM[form];
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide" style={{ background: f.soft, color: f.hex }}>
        {f.short} · {f.label}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={hidden ? 'hidden' : text}
          initial={{ scale: 0.4, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: dim ? 0.45 : 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 16 }}
          className={`flex w-full items-center justify-center rounded-2xl border-2 px-2 font-extrabold text-white ${size === 'lg' ? 'min-h-[64px] text-2xl sm:min-h-[76px] sm:text-3xl' : 'min-h-[52px] text-xl'}`}
          style={{
            borderColor: f.hex,
            background: hidden ? 'rgba(255,255,255,.04)' : `linear-gradient(180deg, ${f.soft}, rgba(15,10,30,.55))`,
            boxShadow: focus ? `0 0 0 3px ${f.hex}55, 0 0 26px ${f.hex}66` : hidden ? 'none' : `0 0 18px ${f.hex}33`,
          }}
        >
          {hidden ? <span style={{ color: f.hex }} className="animate-pulse">?</span> : text}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** The three-form card: base · past · participle. */
export function VerbCard({ verb, hide = [], focus, onHear, hearing }: { verb: Verb; hide?: FormId[]; focus?: FormId; onHear?: () => void; hearing?: boolean }) {
  return (
    <div data-verb={verb.base} className="relative w-full rounded-3xl border border-white/15 bg-white/[.06] p-3 backdrop-blur sm:p-4">
      <div className="flex items-stretch gap-2 sm:gap-3">
        {(['base', 'past', 'pp'] as FormId[]).map((f) => (
          <FormChip key={f} form={f} text={verb[f]} hidden={hide.includes(f)} focus={focus === f} />
        ))}
      </div>
      {onHear && (
        <motion.button
          type="button"
          onClick={onHear}
          aria-label={`Hear ${verb.base}, ${verb.past}, ${verb.pp}`}
          whileTap={{ scale: 0.88 }}
          className="absolute -right-2 -top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-violet-700 shadow-lg"
          animate={hearing ? { scale: [1, 1.15, 1] } : undefined}
          transition={{ duration: 0.6, repeat: hearing ? Infinity : 0 }}
        >
          <Volume2 className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  );
}

/** A big answer button with press / hover feel. */
export function ForgeButton({ children, onClick, disabled, tone = 'idle', index = 0, ariaLabel, wide, hot }: { children: ReactNode; onClick: (el: Element) => void; disabled?: boolean; tone?: 'idle' | 'right' | 'wrong'; index?: number; ariaLabel?: string; wide?: boolean; hot?: boolean }) {
  const bg = tone === 'right' ? 'linear-gradient(180deg,#34d399,#059669)' : tone === 'wrong' ? 'rgba(255,255,255,.08)' : 'linear-gradient(180deg,#7c3aed,#4c1d95)';
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => onClick(e.currentTarget)}
      initial={{ y: 24, opacity: 0, scale: 0.85 }}
      animate={tone === 'wrong' ? { x: [0, -7, 7, -4, 4, 0], opacity: 0.45, scale: 1, y: 0 } : { y: 0, opacity: 1, scale: hot ? [1, 1.05, 1] : 1 }}
      transition={tone === 'wrong' ? { duration: 0.45 } : { type: 'spring', stiffness: 280, damping: 16, delay: index * 0.07, ...(hot ? { scale: { repeat: Infinity, duration: 1.1 } } : {}) }}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      className={`min-h-[56px] rounded-2xl border border-white/20 px-4 py-2 text-lg font-extrabold text-white shadow-[0_6px_0_rgba(0,0,0,.35)] disabled:cursor-default ${wide ? 'w-full' : ''}`}
      style={{ background: bg }}
    >
      {children}
    </motion.button>
  );
}

/** The frame title bar: stop name + progress dots. */
export function StopHeader({ title, sub, done, total }: { title: string; sub: string; done: number; total: number }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">{sub}</p>
        <h2 className="text-xl font-extrabold text-white sm:text-2xl">{title}</h2>
      </div>
      <div className="flex items-center gap-1.5" aria-label={`${done} of ${total} done`}>
        {Array.from({ length: total }, (_, i) => (
          <motion.span key={i} className="h-2.5 w-2.5 rounded-full" animate={{ scale: i === done ? [1, 1.35, 1] : 1, background: i < done ? '#fbbf24' : 'rgba(255,255,255,.22)' }} transition={{ duration: 0.6, repeat: i === done ? Infinity : 0 }} />
        ))}
      </div>
    </div>
  );
}

/** Calls `fn` once on mount (used to say the first line of a round). */
export function useOnce(fn: () => void) {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
