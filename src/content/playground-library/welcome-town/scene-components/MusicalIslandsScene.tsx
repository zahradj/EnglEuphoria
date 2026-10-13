import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS, useArtBox } from '../../unit1/scene-components/shared';

/* ---------- Musical Islands (Musical Chairs, made kind — docs/a1-activity-library.md §11) ----------
 * Four coloured lily pads on a pond. The child presses 🎵: a few seconds of the song play and the friends hop from pad
 * to pad. The music stops, everyone lands, and the friend asks "Who is on the red lily pad?". The child taps the right
 * friend (and says it: "Mia!"). Nobody is ever "out" — every friend stays in the game.
 * Mechanics: Musical Chairs / Musical Statues (move while the music plays, stop when it stops), Cambridge Starters
 * "listen and colour / point". Better: no one loses a seat, the stop is a listening question with colours + names or
 * animals, and the music is the real recorded song. */

type Islands = Extract<Scene, { kind: 'musical-islands' }>;
const PADS = [
  { x: 20, y: 66, color: '#ef4444', name: 'red' },
  { x: 40, y: 52, color: '#3b82f6', name: 'blue' },
  { x: 59, y: 69, color: '#facc15', name: 'yellow' },
  { x: 77, y: 58, color: '#22c55e', name: 'green' },
];

export function MusicalIslandsScene({ scene, onNext, onWin, onLose, sync }: { scene: Islands; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, phase: 'ready', wrong: -1, done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[round];
  const phase = String(state.phase) as 'ready' | 'music' | 'ask' | 'got';
  const done = !!state.done;
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useArtBox(rootRef, 16 / 9);
  const gemDone = useRef(false);
  const [tick, setTick] = useState(0); // local hop beat while the music plays
  const audio = useRef<HTMLAudioElement | null>(null);

  // where each player stands: while the music plays they hop round the pads; otherwise the round's places
  const padOf = (p: number) => {
    if (phase === 'music') return (p + tick) % PADS.length;
    if (phase === 'ready' && round === 0) return p % PADS.length;
    return ((r?.at?.[p] ?? p) % PADS.length + PADS.length) % PADS.length;
  };

  useEffect(() => {
    if (phase !== 'music' || done) return undefined;
    // play a few seconds of the recorded song (never a synthesized voice)
    try {
      const a = new Audio(scene.music);
      audio.current = a;
      a.currentTime = 8 + (round * 7) % 30;
      a.volume = 0.8;
      a.play().catch(() => undefined);
    } catch { /* stay silent */ }
    const hop = window.setInterval(() => { setTick((t) => t + 1); sfx.pop(); }, reduce ? 1200 : 650);
    const stop = window.setTimeout(() => {
      window.clearInterval(hop);
      const a = audio.current; if (a) { a.pause(); audio.current = null; }
      setState((s) => ({ ...s, phase: 'ask' }));
      if (r) window.setTimeout(() => cueSpeak(r.ask, voiceOf(scene.who)), 500);
    }, 4200);
    return () => { window.clearInterval(hop); window.clearTimeout(stop); const a = audio.current; if (a) { a.pause(); audio.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const play = () => { if (done) return; sfx.click(); setState((s) => ({ ...s, phase: 'music', wrong: -1 })); };
  const tapPlayer = (p: number) => {
    if (!r || phase !== 'ask') return;
    if (padOf(p) !== r.pad) {
      sfx.wrong(); onLose();
      cueSpeak('Look again! Which lily pad?', voiceOf(scene.who));
      setState((s) => ({ ...s, wrong: p }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.match(); sfx.whoop();
    cueSpeak(r.say, 'teacher');
    setState((s) => ({ ...s, phase: 'got', wrong: -1 }));
  };
  const next = () => {
    sfx.click();
    setState((s) => {
      const n = (Number(s.round) || 0) + 1;
      return n >= total ? { ...s, done: true } : { ...s, round: n, phase: 'music', wrong: -1 };
    });
  };

  // players on the same pad stand side by side
  const slot = (p: number) => {
    const pad = padOf(p);
    const same = scene.players.map((_, q) => q).filter((q) => padOf(q) === pad);
    return { pad, k: same.indexOf(p), n: same.length };
  };
  return (
    <div ref={rootRef} className="absolute inset-0 select-none overflow-hidden bg-sky-500">
      <div className="absolute" style={{ width: box.width, height: box.height, left: box.left, top: box.top }}>
        <img src={scene.bg} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
        {/* the lily pads */}
        {PADS.map((pad, i) => {
          const asked = phase !== 'music' && phase !== 'ready' && r?.pad === i;
          return (
            <div key={i} className="pointer-events-none absolute" style={{ left: `${pad.x - 8.5}%`, top: `${pad.y - 6.5}%`, width: '17%', height: '13%' }}>
              <motion.div className="h-full w-full" animate={reduce ? {} : { rotate: [0, 2, -2, 0] }} transition={{ duration: 6 + i, repeat: Infinity }}>
                <svg viewBox="0 0 200 100" className="h-full w-full drop-shadow-[0_0.8vh_0.6vh_rgba(0,60,80,0.35)]" aria-hidden>
                  <path d="M100 50 L190.8 38.6 A94 44 0 1 0 190.8 61.4 Z" fill="#4ade80" stroke="#166534" strokeWidth="4" strokeLinejoin="round" />
                  <path d="M100 50 L30 30 M100 50 L40 76 M100 50 L110 92 M100 50 L118 8" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
                  <ellipse cx="100" cy="50" rx="94" ry="44" fill="none" stroke={pad.color} strokeWidth={asked ? 11 : 7} />
                  <circle cx="42" cy="44" r="11" fill={pad.color} stroke="#fff" strokeWidth="3" />
                </svg>
              </motion.div>
            </div>
          );
        })}
        {/* the players */}
        {scene.players.map((pl, p) => {
          const { pad, k, n } = slot(p);
          const P = PADS[pad];
          const x = P.x + (k - (n - 1) / 2) * 7;
          return (
            <motion.button key={p} type="button" onClick={() => tapPlayer(p)} disabled={phase !== 'ask'} aria-label={pl.label}
              className="absolute z-10" style={{ width: '10%', height: '22%' }}
              animate={{ left: `${x - 5}%`, top: `${P.y - 20}%`, ...(state.wrong === p ? { rotate: [0, -10, 10, -6, 0] } : { rotate: 0 }) }}
              transition={{ left: { type: 'spring', stiffness: 120, damping: 14 }, top: { type: 'spring', stiffness: 120, damping: 14 }, rotate: { duration: 0.4 } }}>
              <motion.img src={pl.img} alt="" draggable={false} className="h-full w-full object-contain object-bottom drop-shadow-lg"
                animate={phase === 'music' && !reduce ? { y: [0, -30, 0] } : phase === 'got' && padOf(p) === r?.pad ? { y: [0, -14, 0], scale: 1.1 } : { y: 0, scale: 1 }}
                transition={phase === 'music' ? { duration: 0.65, repeat: Infinity } : { duration: 0.6, repeat: phase === 'got' ? 2 : 0 }} />
            </motion.button>
          );
        })}
      </div>
      {done && <Confetti count={80} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🎵 ${scene.title}`}
        </span>
      </div>
      {!done && r && (
        <>
          <span className="absolute right-3 top-[13%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-emerald-700 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>🎵 {round + 1}/{total}</span>
          <div className="absolute inset-x-0 bottom-[4%] z-30 flex flex-col items-center gap-[1vh]">
            {phase === 'ready' && <button type="button" onClick={play} className={`${CLAY_BUTTON} px-8 py-2`} style={{ fontSize: 'min(3.6vh, 2.4vw)' }}>🎵 Play the music!</button>}
            {phase === 'music' && (
              <span className="rounded-full bg-black/55 px-5 py-2 font-black text-white" style={{ fontSize: 'min(3.2vh, 2.2vw)' }}>
                <motion.span className="inline-block" animate={reduce ? {} : { rotate: [0, 15, -15, 0] }} transition={{ duration: 0.6, repeat: Infinity }}>🎶</motion.span> Hop, hop, hop…
              </span>
            )}
            {phase === 'ask' && (
              <button type="button" onClick={() => { sfx.click(); cueSpeak(r.ask, voiceOf(scene.who)); }} className="rounded-[2vh] bg-white/95 px-5 py-2 font-black text-sky-800 shadow-xl" style={{ fontSize: 'min(3.6vh, 2.4vw)' }}>
                🔊 {r.ask} <span className="text-[0.75em] text-slate-500">— tap!</span>
              </button>
            )}
            {phase === 'got' && (
              <>
                <span className="rounded-[2vh] bg-white/95 px-5 py-2 font-black text-emerald-700 shadow-xl" style={{ fontSize: 'min(3.6vh, 2.4vw)' }}>🎉 {r.say}</span>
                <button type="button" onClick={next} className={`${CLAY_BUTTON} px-8 py-2`} style={{ fontSize: 'min(3.2vh, 2.2vw)' }}>{round + 1 >= total ? 'Done! ⭐' : '🎵 Music again!'}</button>
              </>
            )}
          </div>
        </>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
