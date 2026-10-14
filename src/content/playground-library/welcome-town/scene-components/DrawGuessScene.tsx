import { type PointerEvent as RPointerEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
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
 * both draws (meaning) and names, guesses come from the unit's words, the teacher plays too.
 * Look: a sketchbook clipped to a wooden easel, crayon-textured lines, crayons in the tray as the colour buttons.
 * On the teacher's turn a ready-made doodle (`doodle`) can draw itself line by line — automatically when a child plays
 * alone, on the teacher's "Draw it for me" button in a live class (synced, so both screens watch it appear). */

type Draw = Extract<Scene, { kind: 'draw-guess' }>;
const INKS = ['#1f2937', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b'];
// a crayon pointer (tip at the bottom-left = the hotspot)
const CRAYON_CURSOR = `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34"><g transform="rotate(45 17 17)"><rect x="12" y="4" width="10" height="22" rx="2" fill="#f59e0b" stroke="#7c2d12" stroke-width="1.5"/><rect x="12" y="10" width="10" height="8" fill="#fde68a" stroke="#7c2d12" stroke-width="1"/><path d="M12 26 L17 33 L22 26 Z" fill="#1f2937" stroke="#7c2d12" stroke-width="1"/></g></svg>')}") 3 31, crosshair`;
const enc = (color: string, pts: [number, number][]) => `${color}|${pts.map(([x, y]) => `${x},${y}`).join(' ')}`;
const dec = (s: string): { color: string; points: string } | null => {
  const [color, pts] = s.split('|');
  return pts ? { color: INKS.includes(color) ? color : INKS[0], points: pts } : null;
};

export function DrawGuessScene({ scene, onNext, onWin, onLose, sync }: { scene: Draw; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, strokes: [''] as string[], guessed: false, wrong: -1, auto: false, done: false });
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
  const auto = !!state.auto;
  const fid = useId().replace(/:/g, '');
  const canAuto = !!r?.doodle?.length && r.drawer === 'teacher' && !state.guessed && !auto;

  useEffect(() => {
    if (done || !r) return undefined;
    setPeek(false);
    // playing alone: the friend draws the teacher's turns with the ready-made doodle
    const solo = !sync?.isSynced && r.drawer === 'teacher' && !!r.doodle?.length;
    const t = window.setTimeout(() => cueSpeak(r.drawer === 'student' ? 'You draw! Don’t say it! Your teacher guesses.' : solo ? 'Look! I’m drawing! What is it? Guess and say it!' : 'Your teacher draws! What is it? Guess and say it!', voiceOf(scene.who)), 600);
    const d = solo && !state.guessed ? window.setTimeout(() => setState((s) => ({ ...s, auto: true })), 2400) : undefined;
    return () => { window.clearTimeout(t); if (d) window.clearTimeout(d); };
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
  const clear = () => { sfx.click(); setState((s) => ({ ...s, strokes: [''], auto: false })); };
  const drawForMe = () => { sfx.click(); setState((s) => ({ ...s, auto: true })); };

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
      return n >= total ? { ...s, done: true } : { ...s, round: n, strokes: [''], guessed: false, wrong: -1, auto: false };
    });
  };

  const liveStroke = live.current && live.current.length > 1 ? enc(ink, live.current) : null;
  // while drawing, the synced copy of the open stroke (pushed every 300 ms) is hidden behind the smooth local one
  const shown = liveStroke && lastPush.current > 0 ? strokes.slice(0, -1) : strokes;
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-amber-950/25 backdrop-blur-[3px]" />
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
          {/* the easel: legs, a sketchbook page, a crayon tray */}
          <div className="absolute bottom-[2%] left-[3%] top-[19%] z-20 w-[60%]">
            <div className="absolute bottom-0 left-[16%] top-[4%] w-[3.2%] origin-top rotate-[9deg] rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-800 shadow-lg" />
            <div className="absolute bottom-0 right-[16%] top-[4%] w-[3.2%] origin-top -rotate-[9deg] rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-800 shadow-lg" />
            <div className="absolute left-1/2 top-0 h-[5%] w-[30%] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500 to-amber-800 shadow" />
            <div className="absolute inset-x-[2%] bottom-[19%] top-[4%] flex items-center justify-center">
              <div ref={paperRef} className="relative aspect-[5/3] h-full max-w-full touch-none rounded-[1.2vh] shadow-[0_1.4vh_2.4vh_rgba(0,0,0,0.35)]"
                style={{ cursor: canDraw ? CRAYON_CURSOR : 'default', background: '#fffdf6', backgroundImage: 'radial-gradient(rgba(180,150,90,0.13) 1px, transparent 1.2px), linear-gradient(180deg, rgba(255,250,235,0) 70%, rgba(240,225,190,0.35))', backgroundSize: '1.6vh 1.6vh, 100% 100%' }}
                onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
                {/* spiral rings + tape */}
                <div className="pointer-events-none absolute inset-x-[6%] -top-[2.2vh] z-10 flex justify-between">
                  {Array.from({ length: 12 }, (_, i) => <span key={i} className="h-[4.4vh] w-[1.4vh] rounded-full border-[0.45vh] border-slate-500 bg-gradient-to-b from-slate-100 to-slate-400 shadow" />)}
                </div>
                <span className="pointer-events-none absolute -left-[1.5%] bottom-[6%] z-10 h-[3.2vh] w-[12%] -rotate-[35deg] bg-yellow-200/70 shadow-sm" />
                <span className="pointer-events-none absolute -right-[1.5%] bottom-[6%] z-10 h-[3.2vh] w-[12%] rotate-[35deg] bg-yellow-200/70 shadow-sm" />
                <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-hidden rounded-[1.2vh]" aria-hidden>
                  <defs>
                    <filter id={`crayon-${fid}`} x="-5%" y="-5%" width="110%" height="110%">
                      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" result="n" />
                      <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                  </defs>
                  <g filter={`url(#crayon-${fid})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
                    {auto && r.doodle?.map((d, i) => (
                      <motion.path key={`${round}-${i}`} d={d} stroke="#1f2937" strokeWidth="11" opacity={0.9}
                        initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, delay: i * 0.75, ease: 'easeInOut' }} />
                    ))}
                    {shown.map((s, i) => <polyline key={i} points={s.points} stroke={s.color} strokeWidth="11" opacity={0.9} />)}
                    {liveStroke && <polyline points={dec(liveStroke)!.points} stroke={ink} strokeWidth="11" opacity={0.9} />}
                  </g>
                </svg>
                {shown.length === 0 && !liveStroke && !auto && (
                  <span className="pointer-events-none absolute inset-0 grid place-items-center font-black text-amber-300/90" style={{ fontSize: 'min(4vh, 2.6vw)' }}>
                    {canDraw ? 'Draw here! ✏️' : 'Watch the drawing… 👀'}
                  </span>
                )}
                {canAuto && role !== 'student' && sync?.isSynced && (
                  <button type="button" onClick={drawForMe} className="absolute bottom-[4%] end-[4%] z-10 rounded-full bg-violet-600 px-4 py-1 font-black text-white shadow-lg" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>✨ Draw it for me</button>
                )}
              </div>
            </div>
            {/* the tray: crayons are the colours, the sponge clears */}
            <div className="absolute inset-x-0 bottom-[3%] h-[8%] rounded-[1vh] border-b-[0.8vh] border-amber-900 bg-gradient-to-b from-amber-500 to-amber-700 shadow-xl">
              <div className="absolute inset-x-[5%] -top-[4.2vh] flex items-end gap-[1.2vw]">
                {INKS.map((c) => (
                  <motion.button key={c} type="button" onClick={() => { if (canDraw) { sfx.click(); setInk(c); } }} disabled={!canDraw} aria-label={`crayon ${c}`}
                    animate={{ y: canDraw && ink === c ? -10 : 0, rotate: canDraw && ink === c ? -8 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className={`relative h-[min(6.4vh,4.2vw)] w-[min(2.4vh,1.6vw)] ${canDraw ? '' : 'opacity-70'}`}>
                    <span className="absolute inset-x-0 top-0 h-[22%]" style={{ background: c, clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />
                    <span className="absolute inset-x-0 bottom-0 top-[22%] rounded-b-[0.4vh] shadow" style={{ background: c }} />
                    <span className="absolute inset-x-0 top-[45%] h-[28%] bg-white/45" />
                  </motion.button>
                ))}
                {canDraw && (
                  <button type="button" onClick={clear} aria-label="clear" className="ms-auto mb-[0.4vh] rounded-[0.8vh] border-[0.3vh] border-sky-700 bg-gradient-to-b from-sky-200 to-sky-400 px-3 py-1 font-black text-sky-900 shadow" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>🧽 Clear</button>
                )}
              </div>
            </div>
          </div>
          {/* secret + guesses */}
          <div className="absolute bottom-[4%] right-[4%] top-[20%] z-30 flex w-[32%] flex-col gap-[1.2vh]">
            <div className="rounded-[2.2vh] border-[0.5vh] border-white bg-violet-600/95 p-[1.4vh] text-center text-white shadow-xl">
              {showSecret && secret ? (
                <motion.div className="flex items-center justify-center gap-3" initial={reduce ? false : { rotateY: 90 }} animate={{ rotateY: 0 }}>
                  <img src={secret.img} alt="" draggable={false} className="h-[min(9vh,6vw)] w-auto object-contain" />
                  <span className="font-black" style={{ fontSize: 'min(3.2vh, 2.2vw)' }}>{state.guessed ? secret.say : `Draw: ${secret.label}! 🤫`}</span>
                </motion.div>
              ) : role === 'both' && !(r.drawer === 'teacher' && r.doodle?.length && !sync?.isSynced) ? (
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
