import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX } from 'lucide-react';
import type { QuestLevel } from '@/lib/academy/questLevels';
import { prefersReducedMotion } from '@/lib/academy/playerSafety';
import '@/styles/academy-game.css';

/**
 * Game chrome for the Academy quest player in the "Starline" game skin (src/styles/academy-game.css):
 * diamond trail HUD, anime title-card level splash, level-cleared celebration and floating XP.
 * Everything keeps the student-comfort rules (lesson-quality-gate, engine 5): large tap targets, high contrast,
 * skippable with a tap / Enter / Space, no timers that punish. No cards: shapes are angular, fills are gradients.
 */

// ───────────────────────── HUD (trail map + XP + streak) ─────────────────────────
export interface QuestHudProps {
  levels: { id: string; level: QuestLevel }[];
  currentIndex: number;
  /** 0..1 progress through the whole lesson. */
  progress: number;
  xp: number;
  streak: number;
  /** Kept for API compatibility; the skin uses its own blue→violet palette. */
  accent?: string;
  muted: boolean;
  onToggleMute: () => void;
}

export function QuestHud({ levels, currentIndex, progress, xp, streak, muted, onToggleMute }: QuestHudProps) {
  const current = levels[currentIndex];
  return (
    <div className="ag-root relative flex min-w-0 flex-1 items-center justify-center gap-4 px-2 pb-2">
      {/* Trail: one diamond per level. Hidden on small screens where the level label takes over. */}
      <div className="hidden min-w-0 items-center md:flex" aria-label="Quest trail">
        {levels.map((l, idx) => {
          const done = idx < currentIndex;
          const now = idx === currentIndex;
          return (
            <React.Fragment key={l.id}>
              <motion.div
                animate={now ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={now ? { repeat: Infinity, duration: 1.8 } : undefined}
                title={`${idx + 1}. ${l.level.title}`}
                className="relative flex h-9 w-9 items-center justify-center"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 rotate-45 rounded-[6px]"
                  style={{
                    background: done
                      ? 'linear-gradient(135deg, #3b6dff, #8b5cf6)'
                      : now
                        ? 'linear-gradient(135deg, #ffffff, #cfe0ff)'
                        : 'rgba(205,198,255,0.16)',
                    boxShadow: now ? '0 0 0 2px #86ecff, 0 0 18px rgba(134,236,255,0.85)' : done ? '0 0 10px rgba(139,92,246,0.6)' : 'inset 0 0 0 1px rgba(205,198,255,0.35)',
                  }}
                />
                <span className="relative text-sm" style={{ color: now ? '#1b1d6e' : done ? '#fff' : 'rgba(205,198,255,0.8)' }}>
                  {done ? '✓' : l.level.emoji}
                </span>
              </motion.div>
              {idx < levels.length - 1 && (
                <div className="mx-1 h-[3px] w-4 overflow-hidden rounded-full bg-white/20 lg:w-7">
                  <div className="h-full bg-gradient-to-r from-[#3b6dff] to-[#8b5cf6] transition-all duration-500" style={{ width: idx < currentIndex ? '100%' : '0%' }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Level label: the diamond chip + title in the display face. */}
      <div className="flex min-w-0 shrink items-center gap-2 leading-tight">
        <span className="ag-chip whitespace-nowrap">Level {currentIndex + 1}/{levels.length}</span>
        <span className="ag-title max-w-[8.5rem] truncate text-sm sm:max-w-[13rem] sm:text-base">{current?.level.title}</span>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="ag-title text-base" style={{ color: '#ffd76a' }} title="Experience points">⚡ {xp}</span>
        <motion.span
          key={streak}
          initial={{ scale: streak > 0 ? 1.5 : 1 }}
          animate={{ scale: 1 }}
          className="ag-title text-base"
          style={{ color: streak >= 3 ? '#ff9ad5' : '#cdc6ff' }}
          title="Answer streak"
        >
          🔥 {streak}
        </motion.span>
        <button
          onClick={onToggleMute}
          aria-label={muted ? 'Turn game sounds on' : 'Turn game sounds off'}
          className="flex h-10 w-10 items-center justify-center rounded-[12px_4px_12px_4px] bg-white/10 text-white hover:bg-white/20"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Whole-lesson progress, glowing hairline under the header. */}
      <div className="ag-bar pointer-events-none absolute inset-x-2 bottom-0 !h-[3px]" aria-hidden>
        <i style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  );
}

const SPEED_LINES =
  'repeating-conic-gradient(from 0deg at 50% 46%, rgba(134,236,255,0.0) 0deg 5deg, rgba(134,236,255,0.10) 5deg 6.2deg)';

// ───────────────────────── Level intro splash (anime title card) ─────────────────────────
export function LevelSplash({ index, total, level, onGo }: { index: number; total: number; level: QuestLevel; accent?: string; onGo: () => void }) {
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
      className="ag-root fixed inset-0 z-[90] flex items-center justify-center overflow-hidden px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 42%, #3a3fd0 0%, #1c1f6b 48%, #070a24 100%)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onGo} role="dialog" aria-modal="true" aria-label={`Level ${index + 1}: ${level.title}`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: SPEED_LINES }} />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-10 top-1/2 h-40 w-[130%] -translate-y-1/2 -rotate-6"
        style={{ background: 'linear-gradient(90deg, rgba(59,109,255,0), rgba(139,92,246,0.55) 30%, rgba(217,92,240,0.55) 70%, rgba(217,92,240,0))' }}
        initial={{ x: '-60%' }} animate={{ x: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
      <div className="relative w-full max-w-xl text-center">
        <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 18 }}
          className="ag-chip justify-center text-base">Level {index + 1} of {total}</motion.div>
        <motion.div initial={{ y: 12 }} animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="my-2 text-7xl drop-shadow-[0_0_24px_rgba(134,236,255,0.7)]" aria-hidden>
          {level.emoji}
        </motion.div>
        <motion.h2 initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 16 }}
          className="ag-title text-5xl uppercase sm:text-6xl">{level.title}</motion.h2>
        <p className="ag-prompt mx-auto mt-3 max-w-md text-lg">{level.goal}</p>
        {level.ican && <p className="ag-chip mx-auto mt-4 !tracking-[0.08em] !normal-case text-base" style={{ color: '#ffd76a' }}>I can {level.ican}</p>}
        <button
          autoFocus
          onClick={(e) => { e.stopPropagation(); onGo(); }}
          className="ag-btn ag-btn--gold mt-7 !min-h-[56px] !px-12 text-xl"
        >
          Go!
        </button>
        <div className="mx-auto mt-5 h-1 w-40 overflow-hidden rounded-full bg-white/20">
          <motion.div className="h-full bg-[#86ecff]" initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: AUTO_MS / 1000, ease: 'linear' }} />
        </div>
        <div className="ag-muted mt-1 text-xs">Tap anywhere to start</div>
      </div>
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
      const colors = ['#3b6dff', '#8b5cf6', '#d95cf0', '#86ecff', '#ffd76a'];
      confetti({ particleCount: 110, spread: 80, origin: { y: 0.55 }, colors });
      window.setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { x: 0.2, y: 0.6 }, colors }), 250);
      window.setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { x: 0.8, y: 0.6 }, colors }), 450);
    } catch { /* confetti is decoration only */ }
    const timer = window.setTimeout(() => onNextRef.current(), AUTO_MS);
    const key = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); onNextRef.current(); } };
    window.addEventListener('keydown', key);
    return () => { window.clearTimeout(timer); window.removeEventListener('keydown', key); };
  }, []);
  return (
    <motion.div
      className="ag-root fixed inset-0 z-[90] flex items-center justify-center overflow-hidden px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #5b3fe0 0%, #241a74 50%, #070a24 100%)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onNext} role="dialog" aria-modal="true" aria-label={`${level.title} cleared`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: SPEED_LINES }} />
      <div className="relative w-full max-w-md text-center">
        <div className="ag-chip justify-center text-base">{level.emoji} {level.title}</div>
        <motion.h2 initial={{ scale: 1.6, rotate: -4, opacity: 0 }} animate={{ scale: 1, rotate: -2, opacity: 1 }} transition={{ type: 'spring', stiffness: 240, damping: 15 }}
          className="ag-title mt-1 text-5xl uppercase">Level cleared!</motion.h2>
        <div className="my-5 flex items-center justify-center gap-2" aria-label={`${stars} of 3 stars`}>
          {[1, 2, 3].map((n) => (
            <motion.span
              key={n}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: n <= stars ? 1 : 0.8, rotate: 0 }}
              transition={{ delay: 0.25 + n * 0.22, type: 'spring', stiffness: 300, damping: 12 }}
              className={`text-6xl ${n <= stars ? 'drop-shadow-[0_0_18px_rgba(255,215,106,0.9)]' : 'opacity-30 grayscale'}`}
            >
              ⭐
            </motion.span>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6">
          <span className="ag-title text-2xl" style={{ color: '#ffd76a' }}>🪙 +{coins}</span>
          <span className="ag-title text-2xl" style={{ color: '#86ecff' }}>⚡ +{xp} XP</span>
        </div>
        <button autoFocus onClick={(e) => { e.stopPropagation(); onNext(); }} className="ag-btn mt-7 !min-h-[56px] !px-10 text-xl">
          {isLast ? 'Finish' : 'Next level ▶'}
        </button>
        <div className="ag-muted mt-2 text-xs">Tap anywhere or press Enter</div>
      </div>
    </motion.div>
  );
}

// ───────────────────────── Floating XP ─────────────────────────
export interface XpPopItem { id: number; text: string; tone: 'good' | 'streak' | 'soft' }

export function XpPops({ pops }: { pops: XpPopItem[] }) {
  return (
    <div role="status" aria-live="polite" className="ag-root pointer-events-none fixed inset-x-0 top-24 z-[85] flex flex-col items-center gap-1">
      <AnimatePresence>
        {pops.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 14, scale: 0.7 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            exit={{ opacity: 0, y: -34 }}
            transition={{ duration: 0.45 }}
            className="ag-title px-5 py-1.5 text-xl"
            style={{
              borderRadius: '14px 4px 14px 4px',
              background: p.tone === 'streak' ? 'linear-gradient(135deg,#d95cf0,#8b5cf6)' : p.tone === 'soft' ? 'rgba(14,18,56,0.78)' : 'linear-gradient(135deg,#3b6dff,#8b5cf6)',
              boxShadow: '0 4px 0 #1b1d6e, 0 10px 24px rgba(70,60,210,0.45)',
            }}
          >
            {p.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
