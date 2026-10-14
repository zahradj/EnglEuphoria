import { type PointerEvent as RPointerEvent, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS, useArtBox } from '../../unit1/scene-components/shared';

/* ---------- I Spy (classic "I spy with my little eye", modern design — docs/a1-activity-library.md §11) ----------
 * The painted scene is seen through a pair of binoculars: everything outside the two lenses is dim. The friend gives
 * a clue ("I spy something small and green!"); the child drags the binoculars (or taps anywhere to jump them) until the
 * thing is inside the lenses — the lenses turn gold, it sparkles, and the answer is said ("It's a frog!") for the child
 * to repeat. Mechanics: I Spy (esl-kids.com, eslactive.com — colour clues for young learners), Wordwall "Find the
 * match", hidden-object apps. Better: the clue is a DESCRIPTION, not the name, so the child must understand the looks
 * words; the binoculars give a real searching feel; no timer, a glow hint after a few tries. */

type Spy = Extract<Scene, { kind: 'i-spy' }>;
const LENS = 10; // lens radius, % of the picture width
const SPREAD = 0.42; // lens centres sit ±SPREAD×LENS from the aim point: one wide figure-8 view, the aim point clear
const START = { x: 50, y: 50 };

export function ISpyScene({ scene, onNext, onWin, onLose, sync }: { scene: Spy; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, lens: START, found: false, misses: 0, done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[round];
  const done = !!state.done;
  const found = !!state.found;
  const lens = state.lens && typeof state.lens.x === 'number' && typeof state.lens.y === 'number' ? state.lens : START;
  const [live, setLive] = useState<{ x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const box = useArtBox(rootRef, 16 / 9);
  const gemDone = useRef(false);

  const clue = () => { if (r) cueSpeak(r.clue, voiceOf(scene.who)); };
  useEffect(() => {
    if (done || !r) return undefined;
    const t = window.setTimeout(clue, 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done]);
  useEffect(() => {
    if (!found || !r) return undefined;
    const t = window.setTimeout(() => cueSpeak(r.answer, voiceOf(scene.who)), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pct = (e: RPointerEvent) => {
    const b = artRef.current!.getBoundingClientRect();
    return { x: Math.max(0, Math.min(100, ((e.clientX - b.left) / b.width) * 100)), y: Math.max(0, Math.min(100, ((e.clientY - b.top) / b.height) * 100)) };
  };
  const look = (p: { x: number; y: number }) => {
    if (!r || found || done) return;
    // both lenses sit side by side around p; the thing must be inside one of them
    const inside = [-SPREAD, SPREAD].some((k) => Math.hypot(r.spot.left - (p.x + k * LENS), (r.spot.top - p.y) * (9 / 16)) < LENS * 0.95);
    if (inside) {
      sfx.match(); sfx.reveal();
      setState((s) => ({ ...s, lens: p, found: true }));
    } else {
      sfx.pop();
      setState((s) => ({ ...s, lens: p, misses: (Number(s.misses) || 0) + 1 }));
      if (((Number(state.misses) || 0) + 1) % 3 === 0) { onLose(); clue(); }
    }
  };
  const nextClue = () => {
    if (!found) return;
    sfx.click();
    setState((s) => {
      const next = (Number(s.round) || 0) + 1;
      return next >= total ? { ...s, done: true } : { ...s, round: next, found: false, misses: 0, lens: START };
    });
  };

  const p = live ?? lens;
  const hint = !found && (Number(state.misses) || 0) >= 4;
  const lx = [p.x - SPREAD * LENS, p.x + SPREAD * LENS];
  const ly = p.y * (9 / 16); // in the 100 × 56.25 viewBox
  const Rpx = (LENS / 100) * box.width;
  const lensMask = lx.map((x) => `radial-gradient(circle ${Rpx}px at ${(x / 100) * box.width}px ${(p.y / 100) * box.height}px, transparent 97%, #000 100%)`).join(', ');
  return (
    <div ref={rootRef} className="absolute inset-0 select-none overflow-hidden bg-[#1b2a12]">
      <div ref={artRef} className="absolute touch-none" style={{ width: box.width, height: box.height, left: box.left, top: box.top, cursor: found ? 'default' : 'grab' }}
        onPointerDown={(e) => { if (!found && !done) { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setLive(pct(e)); } }}
        onPointerMove={(e) => { if (live) setLive(pct(e)); }}
        onPointerUp={(e) => { if (live) { const q = pct(e); setLive(null); look(q); } }}
        onPointerCancel={() => setLive(null)}>
        <img src={scene.bg} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
        {!done && (
          <>
            {/* outside the lenses: dimmed and softly blurred, like looking past the eyecups */}
            <div className="pointer-events-none absolute inset-0" style={{
              background: 'rgba(10,20,8,0.6)', backdropFilter: 'blur(3px) saturate(0.55)', WebkitBackdropFilter: 'blur(3px) saturate(0.55)',
              maskImage: lensMask, WebkitMaskImage: lensMask, maskComposite: 'intersect', WebkitMaskComposite: 'source-in',
            }} />
            {/* the binoculars */}
            <svg viewBox="0 0 100 56.25" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
              <defs>
                <radialGradient id={`ispy-glass-${scene.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="72%" stopColor="#000" stopOpacity="0" />
                  <stop offset="100%" stopColor="#0b1a08" stopOpacity="0.38" />
                </radialGradient>
                <linearGradient id={`ispy-body-${scene.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#4d7c32" />
                  <stop offset="1" stopColor="#1f3a14" />
                </linearGradient>
              </defs>
              {lx.map((x, i) => (
                <mask key={`m${i}`} id={`ispy-ring-${scene.id}-${i}`}>
                  <rect width="100" height="56.25" fill="white" />
                  <circle cx={lx[1 - i]} cy={ly} r={LENS} fill="black" />
                </mask>
              ))}
              {lx.map((x, i) => <circle key={`g${i}`} cx={x} cy={ly} r={LENS} fill={`url(#ispy-glass-${scene.id})`} mask={`url(#ispy-ring-${scene.id}-${i})`} />)}
              {lx.map((x, i) => (
                <g key={i} mask={`url(#ispy-ring-${scene.id}-${i})`}>
                  <circle cx={x} cy={ly} r={LENS + 1.15} fill="none" stroke={`url(#ispy-body-${scene.id})`} strokeWidth="2.3" />
                  <circle cx={x} cy={ly} r={LENS + 2.25} fill="none" stroke="#163010" strokeWidth="0.35" />
                  <circle cx={x} cy={ly} r={LENS + 0.05} fill="none" stroke={found ? '#FCD34D' : '#c9a24a'} strokeWidth={found ? 0.9 : 0.35} />
                </g>
              ))}
              {/* glass shine (left lens only, upper-left) */}
              <path d={`M ${lx[0] - LENS * 0.62} ${ly - LENS * 0.32} A ${LENS * 0.72} ${LENS * 0.72} 0 0 1 ${lx[0] - LENS * 0.18} ${ly - LENS * 0.7}`} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.7" strokeLinecap="round" />
              <circle cx={lx[0] - LENS * 0.1} cy={ly - LENS * 0.72} r="0.45" fill="#fff" fillOpacity="0.6" />
              {/* bridge + focus wheel */}
              <rect x={p.x - 3} y={ly - LENS - 2.6} width="6" height="3.2" rx="1.4" fill={`url(#ispy-body-${scene.id})`} stroke="#163010" strokeWidth="0.3" />
              <rect x={p.x - 1.5} y={ly - LENS - 3.9} width="3" height="2" rx="0.6" fill="#c9a24a" stroke="#7a5a1a" strokeWidth="0.2" />
              {[-1, -0.5, 0, 0.5, 1].map((k) => <line key={k} x1={p.x + k} y1={ly - LENS - 3.7} x2={p.x + k} y2={ly - LENS - 2.1} stroke="#7a5a1a" strokeWidth="0.18" />)}
            </svg>
          </>
        )}
        {hint && r && (
          <motion.div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${r.spot.left}%`, top: `${r.spot.top}%`, width: '7%', aspectRatio: '1', boxShadow: '0 0 30px 14px rgba(255,214,102,.6)' }}
            animate={reduce ? {} : { opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity }} />
        )}
        {found && r && !reduce && [0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
          <span key={`${round}-${k}`} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${r.spot.left}%`, top: `${r.spot.top}%`, fontSize: 'min(4vh, 2.6vw)' }}>
            <motion.span className="block" initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }} animate={{ x: Math.cos((k / 8) * Math.PI * 2) * 90, y: Math.sin((k / 8) * Math.PI * 2) * 90, opacity: 0, scale: 1.2 }} transition={{ duration: 0.9, ease: 'easeOut' }}>✨</motion.span>
          </span>
        ))}
        {found && r && (
          <motion.div className="pointer-events-none absolute rounded-full border-[5px] border-white" style={{ left: `${r.spot.left - r.spot.r}%`, top: `${r.spot.top - r.spot.r * (16 / 9)}%`, width: `${r.spot.r * 2}%`, height: `${r.spot.r * 2 * (16 / 9)}%`, boxShadow: '0 0 0 4px #FFD34E, 0 0 30px 10px rgba(255,211,78,.7)' }}
            initial={reduce ? false : { scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} />
        )}
      </div>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-[7%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : scene.guide ? '👀 I spy with my little eye…' : `👀 ${r?.clue ?? ''}`}
        </span>
      </div>
      {!done && (
        <button type="button" onClick={clue} aria-label="Hear the clue again"
          className="absolute right-3 top-[14%] z-30 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 font-black text-emerald-700 shadow-lg active:scale-95" style={{ fontSize: 'min(3vh, 2vw)' }}>
          🔊 Again <span className="text-neutral-400">{round + 1}/{total}</span>
        </button>
      )}
      {scene.guide && !done && r && (
        <div className="pointer-events-none absolute bottom-[2%] right-[1%] z-30 flex flex-row-reverse items-end">
          <motion.img src={scene.guide} alt="" draggable={false} className="w-[min(30vh,20vw)] drop-shadow-[0_1vh_1vh_rgba(0,0,0,0.35)]"
            animate={reduce ? {} : { rotate: [0, -2, 2, 0] }} transition={{ duration: 3, repeat: Infinity }} />
          <motion.div key={round} className="relative mb-[22vh] -mr-[2vw] max-w-[min(46vh,30vw)] rounded-[2.4vh] border-[0.5vh] border-white bg-white/95 px-4 py-2 font-black text-[#3b2410] shadow-2xl"
            style={{ fontSize: 'min(3.4vh, 2.3vw)' }} initial={reduce ? false : { scale: 0, originX: 1, originY: 1 }} animate={{ scale: 1 }}>
            {r.clue}
          </motion.div>
        </div>
      )}
      {found && r && !done && (
        <motion.div className={`absolute inset-x-0 z-40 flex flex-col items-center gap-[1.4vh] ${r.spot.top > 55 ? 'top-[22%]' : 'bottom-[5%]'}`} initial={reduce ? false : { y: r.spot.top > 55 ? -60 : 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <button type="button" onClick={() => cueSpeak(r.answer, voiceOf(scene.who))} className="rounded-[2.4vh] border-[0.5vh] border-white bg-white/95 px-8 py-3 font-black text-[#3b2410] shadow-2xl" style={{ fontSize: 'min(4.6vh, 3vw)' }}>
            {r.answer} <span className="text-[0.7em]">🔊</span>
          </button>
          <button type="button" onClick={nextClue} className={`${CLAY_BUTTON} px-8 py-2`} style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>
            {round + 1 >= total ? 'Done! ⭐' : 'Next clue 👀'}
          </button>
        </motion.div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
