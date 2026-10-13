import { type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Draw That (Pictionary / Gimkit "Draw That", modern design — docs/a1-activity-library.md §11) ----------
 * One player draws on a shared paper, the other guesses. The drawer sees a secret card ("Draw a frog! Don't say
 * it!"); every stroke appears live on the other screen. The guesser taps the matching picture and SAYS it — "It's a
 * frog!" — then the secret is shown to both and the roles swap next round. In a live class the teacher screen is the
 * leader (shared play), so only the drawer's screen shows the secret; on one screen a "Peek" button shows it.
 * Mechanics: Pictionary, Gimkit Draw That, Quick-Draw style games. Better: the guess must be a sentence, the child
 * both draws (meaning) and names, guesses come from the unit's words, the teacher plays too. */

type Draw = Extract<Scene, { kind: 'draw-guess' }>;
const INKS = ['#1f2937', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b'];
const enc = (color: string, pts: [number, number][]) => `${color}|${pts.map(([x, y]) => `${x},${y}`).join(' ')}`;
const dec = (s: string): { color: string; points: string } | null => {
  const [color, pts] = s.split('|');
  return pts ? { color: INKS.includes(color) ? color : INKS[0], points: pts } : null;
};

export function DrawGuessScene({ scene, onNext, onWin, onLose, sync }: { scene: Draw; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, strokes: [''] as string[], guessed: false, wrong: -1, done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[round];
  const secret = r?.options[r.secret];
  const role: 'both' | 'teacher' | 'student' = !sync?.isSynced ? 'both' : sync.shared ? (sync.leader ? 'teacher' : 'student') : 'both';
  const canDraw = !!r && !state.guessed && (role === 'both' || role === r.drawer);
  const canGuess = !!r && !state.guessed && (role === 'both' || role !== r.drawer);
  const [peek, setPeek] = useState(false);
  const showSecret = !!r && (state.guessed || (role === 'both' ? peek : role === r.drawer));
  const [ink, setInk] = useState(INKS[0]);
  const live = useRef<[number, number][] | null>(null);
  const [, force] = useState(0);
  const lastPush = useRef(0);
  const paperRef = useRef<HTMLDivElement>(null);
  const strokes = useMemo(() => (Array.isArray(state.strokes) ? state.strokes.filter(Boolean).map(dec).filter(Boolean) : []) as { color: string; points: string }[], [state.strokes]);
  const done = !!state.done;
  const gemDone = useRef(false);

  useEffect(() => {
    if (done || !r) return undefined;
    setPeek(false);
    const t = window.setTimeout(() => cueSpeak(r.drawer === 'student' ? 'You draw! Don’t say it! Your teacher guesses.' : 'Your teacher draws! What is it? Guess and say it!', voiceOf(scene.who)), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pt = (e: RPointerEvent): [number, number] => {
    const b = paperRef.current!.getBoundingClientRect();
    return [Math.round(Math.max(0, Math.min(1, (e.clientX - b.left) / b.width)) * 1000), Math.round(Math.max(0, Math.min(1, (e.clientY - b.top) / b.height)) * 600)];
  };
  const push = (final: boolean) => {
    const pts = live.current;
    if (!pts || pts.length < 2) return;
    const s = enc(ink, pts);
    setState((st) => {
      const list = Array.isArray(st.strokes) ? st.strokes.filter(Boolean) : [];
      // the stroke being drawn is the last one while `live` is open
      const base = lastPush.current > 0 ? list.slice(0, -1) : list;
      return { ...st, strokes: [...base, s].slice(-80) };
    });
    lastPush.current = final ? 0 : Date.now();
  };
  const down = (e: RPointerEvent) => {
    if (!canDraw) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    live.current = [pt(e)];
    lastPush.current = 0;
    force((n) => n + 1);
  };
  const move = (e: RPointerEvent) => {
    if (!live.current) return;
    const p = pt(e);
    const last = live.current[live.current.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 6) return;
    live.current.push(p);
    force((n) => n + 1);
    if (Date.now() - (lastPush.current || 0) > 300) push(false);
  };
  const up = () => {
    if (!live.current) return;
    push(true);
    live.current = null;
    lastPush.current = 0;
    force((n) => n + 1);
  };
  const clear = () => { sfx.click(); setState((s) => ({ ...s, strokes: [''] })); };

  const guess = (i: number) => {
    if (!r || !canGuess) return;
    if (i !== r.secret) {
      sfx.wrong(); onLose();
      cueSpeak('Not yet! Look again!', voiceOf(scene.who));
      setState((s) => ({ ...s, wrong: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.match(); sfx.whoop();
    cueSpeak(r.options[i].say, 'teacher');
    setState((s) => ({ ...s, guessed: true, wrong: -1 }));
  };
  const next = () => {
    sfx.click();
    setState((s) => {
      const n = (Number(s.round) || 0) + 1;
      return n >= total ? { ...s, done: true } : { ...s, round: n, strokes: [''], guessed: false, wrong: -1 };
    });
  };

  const liveStroke = live.current && live.current.length > 1 ? enc(ink, live.current) : null;
  // while drawing, the synced copy of the open stroke (pushed every 300 ms) is hidden behind the smooth local one
  const shown = liveStroke && lastPush.current > 0 ? strokes.slice(0, -1) : strokes;
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/20" />
      {done && <Confetti count={80} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `✏️ ${scene.title}`}
        </span>
      </div>
      {!done && r && (
        <>
          {/* who draws */}
          <span className="absolute left-[4%] top-[13%] z-30 rounded-full bg-white/95 px-4 py-1 font-black text-violet-700 shadow" style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>
            {r.drawer === 'student' ? '✏️ You draw · 👩‍🏫 Teacher guesses' : '👩‍🏫 Teacher draws · 🔍 You guess'} · {round + 1}/{total}
          </span>
          {/* the paper */}
          <div className="absolute bottom-[4%] left-[4%] top-[20%] z-20 flex w-[58%] flex-col gap-[1vh]">
            <div ref={paperRef} className={`relative flex-1 touch-none overflow-hidden rounded-[2.4vh] border-[0.7vh] border-amber-200 bg-[#fffdf5] shadow-2xl ${canDraw ? 'cursor-crosshair' : ''}`}
              onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
              <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
                {shown.map((s, i) => <polyline key={i} points={s.points} fill="none" stroke={s.color} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />)}
                {liveStroke && <polyline points={dec(liveStroke)!.points} fill="none" stroke={ink} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />}
              </svg>
              {shown.length === 0 && !liveStroke && (
                <span className="pointer-events-none absolute inset-0 grid place-items-center font-black text-amber-300" style={{ fontSize: 'min(4vh, 2.6vw)' }}>
                  {canDraw ? 'Draw here! ✏️' : 'Watch the drawing… 👀'}
                </span>
              )}
            </div>
            {canDraw && (
              <div className="flex items-center gap-[0.8vw]">
                {INKS.map((c) => (
                  <button key={c} type="button" onClick={() => setInk(c)} aria-label={`colour ${c}`} className={`h-[min(6vh,4vw)] w-[min(6vh,4vw)] rounded-full border-[0.5vh] ${ink === c ? 'border-yellow-300 scale-110' : 'border-white'} shadow`} style={{ background: c }} />
                ))}
                <button type="button" onClick={clear} className="ms-auto rounded-full bg-white/95 px-4 py-1 font-black text-rose-600 shadow" style={{ fontSize: 'min(2.6vh, 1.8vw)' }}>🧽 Clear</button>
              </div>
            )}
          </div>
          {/* secret + guesses */}
          <div className="absolute bottom-[4%] right-[4%] top-[20%] z-30 flex w-[32%] flex-col gap-[1.2vh]">
            <div className="rounded-[2.2vh] border-[0.5vh] border-white bg-violet-600/95 p-[1.4vh] text-center text-white shadow-xl">
              {showSecret && secret ? (
                <motion.div className="flex items-center justify-center gap-3" initial={reduce ? false : { rotateY: 90 }} animate={{ rotateY: 0 }}>
                  <img src={secret.img} alt="" draggable={false} className="h-[min(9vh,6vw)] w-auto object-contain" />
                  <span className="font-black" style={{ fontSize: 'min(3.2vh, 2.2vw)' }}>{state.guessed ? secret.say : `Draw: ${secret.label}! 🤫`}</span>
                </motion.div>
              ) : role === 'both' ? (
                <button type="button" onClick={() => setPeek(true)} className="font-black" style={{ fontSize: 'min(3vh, 2vw)' }}>🤫 Drawer: tap to peek at the secret</button>
              ) : (
                <span className="font-black" style={{ fontSize: 'min(3vh, 2vw)' }}>🤔 What is it? Guess!</span>
              )}
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-[1vh]">
              {r.options.map((o, i) => (
                <motion.button key={i} type="button" onClick={() => guess(i)} disabled={!canGuess} whileTap={{ scale: 0.94 }}
                  animate={state.wrong === i ? { x: [0, -10, 10, -6, 0] } : {}}
                  className={`flex min-h-0 flex-col items-center justify-center rounded-[2vh] border-[0.5vh] bg-[#fffaf0] p-[0.8vh] shadow-[0_0.6vh_0_rgba(0,0,0,0.2)] ${state.guessed && i === r.secret ? 'border-emerald-400' : 'border-white'} ${!canGuess && !state.guessed ? 'opacity-80' : ''}`}>
                  <img src={o.img} alt="" draggable={false} className="min-h-0 w-full flex-1 object-contain" />
                  <span className="font-black text-[#3b2410]" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>{o.label}</span>
                </motion.button>
              ))}
            </div>
            {state.guessed && (
              <button type="button" onClick={next} className={`${CLAY_BUTTON} py-2`} style={{ fontSize: 'min(3.2vh, 2.2vw)' }}>{round + 1 >= total ? 'Done! ⭐' : 'Next — swap! 🔄'}</button>
            )}
          </div>
        </>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
