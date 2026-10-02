import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX } from 'lucide-react';
import type { QuestLevel } from '@/lib/academy/questLevels';
import { prefersReducedMotion } from '@/lib/academy/playerSafety';

/**
 * Game chrome for the Academy quest player: trail-map HUD, level intro splash, level-cleared celebration
 * and floating XP. Everything here follows the student-comfort rules (lesson-quality-gate, engine 5):
 * large tap targets, high contrast, skippable with a tap / Enter / Space, no timers that punish.
 */

// ───────────────────────── HUD (trail map + XP + streak) ─────────────────────────
export interface QuestHudProps {
  levels: { id: string; level: QuestLevel }[];
  currentIndex: number;
  /** 0..1 progress through the whole lesson. */
  progress: number;
  xp: number;
  streak: number;
  accent: string;
  muted: boolean;
  onToggleMute: () => void;
}

export function QuestHud({ levels, currentIndex, progress, xp, streak, accent, muted, onToggleMute }: QuestHudProps) {
  const current = levels[currentIndex];
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center gap-3 px-2">
      {/* Trail map: one node per level, explorer marker on the current one. Hidden on very small screens
          where the compact level chip below takes over. */}
      <div className="hidden min-w-0 items-center md:flex" aria-label="Quest trail">
        {levels.map((l, idx) => {
          const done = idx < currentIndex;
          const now = idx === currentIndex;
          return (
            <React.Fragment key={l.id}>
              <div className="relative flex flex-col items-center">
                <motion.div
                  animate={now ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                  transition={now ? { repeat: Infinity, duration: 1.6 } : undefined}
                  title={`${idx + 1}. ${l.level.title}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-base shadow-lg ${
                    done ? 'border-emerald-300 bg-emerald-500 text-white' : now ? 'border-white bg-white text-slate-900' : 'border-white/30 bg-black/40 text-white/60'
                  }`}
                  style={now ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 18px ${accent}` } : undefined}
                >
                  {done ? '✓' : l.level.emoji}
                </motion.div>
              </div>
              {idx < levels.length - 1 && (
                <div className="mx-0.5 h-1 w-5 overflow-hidden rounded-full bg-white/20 lg:w-8">
                  <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: idx < currentIndex ? '100%' : '0%' }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Compact level chip (mobile + a label next to the trail on desktop). */}
      <div className="flex min-w-0 shrink items-center gap-2 rounded-full bg-black/45 py-1 pl-1 pr-3 ring-1 ring-white/15 backdrop-blur-md">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-base">{current?.level.emoji}</span>
        <div className="min-w-0 leading-tight">
          <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: accent }}>Level {currentIndex + 1}/{levels.length}</div>
          <div className="max-w-[9.5rem] truncate text-xs font-bold text-white sm:max-w-[13rem]">{current?.level.title}</div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <div className="flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1.5 text-sm font-black text-amber-950 shadow-[0_3px_0_0_#b45309]" title="Experience points">
          ⚡ {xp}
        </div>
        <motion.div
          key={streak}
          initial={{ scale: streak > 0 ? 1.4 : 1 }}
          animate={{ scale: 1 }}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-black shadow-[0_3px_0_0_rgba(0,0,0,0.35)] ${streak >= 3 ? 'bg-orange-500 text-white' : 'bg-white/90 text-slate-800'}`}
          title="Answer streak"
        >
          🔥 {streak}
        </motion.div>
        <button
          onClick={onToggleMute}
          aria-label={muted ? 'Turn game sounds on' : 'Turn game sounds off'}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/15 hover:bg-black/60"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Whole-lesson progress, hairline under the header. */}
      <div className="pointer-events-none absolute inset-x-4 bottom-0 h-1 overflow-hidden rounded-full bg-white/10 md:inset-x-8">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.round(progress * 100)}%`, background: `linear-gradient(90deg, ${accent}, #fbbf24)` }} />
      </div>
    </div>
  );
}

// ───────────────────────── Level intro splash ─────────────────────────
export function LevelSplash({ index, total, level, accent, onGo }: { index: number; total: number; level: QuestLevel; accent: string; onGo: () => void }) {
  const AUTO_MS = 3600;
  const onGoRef = useRef(onGo);
  onGoRef.current = onGo;
  useEffect(() => {
    const timer = window.setTimeout(() => onGoRef.current(), AUTO_MS);
    const key = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); onGoRef.current(); } };
    window.addEventListener('keydown', key);
    return () => { window.clearTimeout(timer); window.removeEventListener('keydown', key); };
  }, []);
  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onGo} role="dialog" aria-modal="true" aria-label={`Level ${index + 1}: ${level.title}`}
    >
      <motion.div
        initial={{ scale: 0.6, rotate: -3, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border-4 border-white/90 bg-gradient-to-b from-emerald-800 to-emerald-950 p-7 text-center text-white shadow-[0_10px_0_0_rgba(0,0,0,0.45)]"
      >
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 50% 0%, ${accent}, transparent 60%)` }} />
        <div className="relative">
          <div className="text-xs font-extrabold uppercase tracking-[0.35em]" style={{ color: accent }}>Level {index + 1} of {total}</div>
          <motion.div initial={{ y: 12 }} animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} className="my-2 text-7xl drop-shadow-lg" aria-hidden>
            {level.emoji}
          </motion.div>
          <h2 className="text-4xl font-black uppercase leading-tight tracking-wide" style={{ textShadow: '0 3px 0 rgba(0,0,0,0.45)' }}>{level.title}</h2>
          <p className="mx-auto mt-2 max-w-sm text-lg font-medium text-emerald-50">{level.goal}</p>
          {level.ican && (
            <p className="mx-auto mt-3 max-w-sm rounded-xl bg-white/15 px-4 py-2 text-base font-bold text-white">🎯 I can {level.ican}</p>
          )}
          <div className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-amber-200">
            <span>⭐⭐⭐ up to 3 stars</span><span aria-hidden>·</span><span>🪙 coins</span><span aria-hidden>·</span><span>⚡ XP</span>
          </div>
          <button
            autoFocus
            onClick={(e) => { e.stopPropagation(); onGo(); }}
            className="mt-5 inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-amber-400 px-10 text-xl font-black uppercase tracking-wider text-amber-950 shadow-[0_6px_0_0_#b45309] transition active:translate-y-1 active:shadow-[0_2px_0_0_#b45309]"
          >
            Go!
          </button>
          <div className="mx-auto mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-white/20">
            <motion.div className="h-full bg-white/80" initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: AUTO_MS / 1000, ease: 'linear' }} />
          </div>
          <div className="mt-1 text-[11px] text-white/70">Tap anywhere to start</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ───────────────────────── Level cleared celebration ─────────────────────────
export function LevelCleared({ level, stars, coins, xp, isLast, onNext }: { level: QuestLevel; stars: number; coins: number; xp: number; isLast: boolean; onNext: () => void }) {
  const AUTO_MS = 4200;
  const onNextRef = useRef(onNext);
  onNextRef.current = onNext;
  useEffect(() => {
    try {
      if (prefersReducedMotion()) throw new Error('reduced motion');
      confetti({ particleCount: 110, spread: 80, origin: { y: 0.55 }, colors: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6'] });
      window.setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { x: 0.2, y: 0.6 } }), 250);
      window.setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { x: 0.8, y: 0.6 } }), 450);
    } catch { /* confetti is decoration only */ }
    const timer = window.setTimeout(() => onNextRef.current(), AUTO_MS);
    const key = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); onNextRef.current(); } };
    window.addEventListener('keydown', key);
    return () => { window.clearTimeout(timer); window.removeEventListener('keydown', key); };
  }, []);
  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onNext} role="dialog" aria-modal="true" aria-label={`${level.title} cleared`}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 240, damping: 16 }}
        className="w-full max-w-md rounded-3xl border-4 border-amber-200 bg-gradient-to-b from-amber-400 to-orange-500 p-7 text-center text-amber-950 shadow-[0_10px_0_0_rgba(0,0,0,0.4)]"
      >
        <div className="text-xs font-extrabold uppercase tracking-[0.35em] text-amber-900">{level.emoji} {level.title}</div>
        <h2 className="mt-1 text-4xl font-black uppercase" style={{ textShadow: '0 3px 0 rgba(255,255,255,0.5)' }}>Level cleared!</h2>
        <div className="my-4 flex items-center justify-center gap-2" aria-label={`${stars} of 3 stars`}>
          {[1, 2, 3].map((n) => (
            <motion.span
              key={n}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: n <= stars ? 1 : 0.8, rotate: 0 }}
              transition={{ delay: 0.25 + n * 0.22, type: 'spring', stiffness: 300, damping: 12 }}
              className={`text-6xl ${n <= stars ? '' : 'opacity-30 grayscale'}`}
            >
              ⭐
            </motion.span>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 text-lg font-black">
          <span className="rounded-full bg-white/80 px-4 py-1.5">🪙 +{coins}</span>
          <span className="rounded-full bg-white/80 px-4 py-1.5">⚡ +{xp} XP</span>
        </div>
        <button
          autoFocus
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="mt-5 inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-emerald-600 px-8 text-xl font-black uppercase tracking-wider text-white shadow-[0_6px_0_0_#064e3b] transition active:translate-y-1 active:shadow-[0_2px_0_0_#064e3b]"
        >
          {isLast ? 'Finish' : 'Next level ▶'}
        </button>
        <div className="mt-2 text-[11px] font-medium text-amber-900/80">Tap anywhere or press Enter</div>
      </motion.div>
    </motion.div>
  );
}

// ───────────────────────── Floating XP ─────────────────────────
export interface XpPopItem { id: number; text: string; tone: 'good' | 'streak' | 'soft' }

export function XpPops({ pops }: { pops: XpPopItem[] }) {
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-24 z-[85] flex flex-col items-center gap-1">
      <AnimatePresence>
        {pops.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 14, scale: 0.7 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            exit={{ opacity: 0, y: -34 }}
            transition={{ duration: 0.45 }}
            className={`rounded-full px-5 py-2 text-lg font-black shadow-xl ${
              p.tone === 'streak' ? 'bg-orange-500 text-white' : p.tone === 'soft' ? 'bg-white/90 text-slate-800' : 'bg-amber-400 text-amber-950'
            }`}
          >
            {p.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
