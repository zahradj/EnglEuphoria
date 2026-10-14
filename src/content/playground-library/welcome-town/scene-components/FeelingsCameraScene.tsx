import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Feelings Camera (`feelings-camera`, A1 U1 L2 — owner 2026-10-14) ----------
 * The owner: "the student should know how to say He is, She is — He is tired, She is happy". Click! The camera takes a
 * photo of a friend and Pip asks "How is Mia?". The child BUILDS the answer: taps He or She, then the feeling face —
 * the sentence snaps together word by word ("She · is · hungry."), is spoken, and the child says it and taps
 * "I said it!". The photo goes into the class album at the bottom. A wrong word wiggles and drops out (no penalty).
 * Mechanics: sentence builders (Duolingo word bank), Cambridge A1 "look and say", photo-booth apps. Better: two
 * meaningful choices only (the pronoun and the feeling — exactly the lesson's two decisions), the sentence is built,
 * heard AND said, and the album shows what the child has done. */

type Camera = Extract<Scene, { kind: 'feelings-camera' }>;
export const cameraAsk = (name: string) => `How is ${name}?`;
export const cameraSentence = (pronoun: string, feeling: string) => `${pronoun} is ${feeling}.`;

export function FeelingsCameraScene({ scene, onNext, onWin, onLose, sync }: { scene: Camera; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.friends.length;
  const [state, setState] = useSyncedState(sync, { round: 0, pronoun: '', feeling: '', wrong: '', album: [-1], done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const f = scene.friends[round];
  const pronoun = typeof state.pronoun === 'string' ? state.pronoun : '';
  const feeling = typeof state.feeling === 'string' ? state.feeling : '';
  const album = useMemo(() => (Array.isArray(state.album) ? state.album.filter((n) => n >= 0) : []), [state.album]);
  const done = !!state.done;
  const built = !!f && pronoun === f.pronoun && feeling === f.feeling;
  const gemDone = useRef(false);

  useEffect(() => {
    if (done || !f) return undefined;
    const t = window.setTimeout(() => { sfx.pop(); cueSpeak(cameraAsk(f.name), voiceOf(scene.who)); }, 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done]);
  useEffect(() => {
    if (built && f) { sfx.match(); window.setTimeout(() => cueSpeak(cameraSentence(f.pronoun, f.feeling), voiceOf(scene.who)), 250); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [built]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const miss = (key: string) => {
    sfx.wrong(); onLose();
    setState((s) => ({ ...s, wrong: key }));
    window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600);
  };
  const choosePronoun = (p: 'He' | 'She') => {
    if (!f || built || done) return;
    if (p !== f.pronoun) return miss(p);
    sfx.click(); setState((s) => ({ ...s, pronoun: p }));
  };
  const chooseFeeling = (fe: string) => {
    if (!f || built || done) return;
    if (!pronoun) { sfx.click(); cueSpeak(cameraAsk(f.name), voiceOf(scene.who)); return; }
    if (fe !== f.feeling) return miss(fe);
    sfx.click(); setState((s) => ({ ...s, feeling: fe }));
  };
  const said = () => {
    if (!built) return;
    sfx.click();
    setState((s) => {
      const n = (Number(s.round) || 0) + 1;
      const nextAlbum = [...album, round];
      return n >= total ? { ...s, album: nextAlbum, done: true } : { ...s, album: nextAlbum, round: n, pronoun: '', feeling: '', wrong: '' };
    });
  };

  const word = (slot: string, text: string, filled: boolean) => (
    <motion.span key={`${slot}-${filled ? text : 'blank'}`} className={`rounded-[1.4vh] px-[1vw] py-[0.6vh] font-black shadow ${filled ? 'bg-emerald-500 text-white' : 'border-[0.4vh] border-dashed border-indigo-300 bg-white/70 text-indigo-300'}`}
      initial={filled && !reduce ? { y: -30, scale: 0.6 } : false} animate={{ y: 0, scale: 1 }} style={{ fontSize: 'min(4.2vh, 3vw)' }}>{text}</motion.span>
  );
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-indigo-950/25" />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[3%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.2rem, min(calc(3*var(--svw,1vw)), 5vh), 2.4rem)' }}>
          {done ? scene.doneLine : `\u{1F4F8} ${scene.title}`}
        </span>
      </div>
      {!done && f && (
        <>
          {/* the photo */}
          <AnimatePresence mode="wait">
            <motion.div key={`photo-${round}`} className="absolute left-[6%] top-[13%] z-20 flex flex-col items-center rounded-[1vh] bg-white p-[1vh] pb-[1.6vh] shadow-2xl"
              initial={reduce ? false : { rotate: -12, scale: 0.4, opacity: 0 }} animate={{ rotate: -3, scale: 1, opacity: 1 }} exit={{ x: 300, opacity: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 15 }}>
              <div className="grid h-[min(38vh,25vw)] w-[min(34vh,22vw)] place-items-center bg-gradient-to-b from-amber-50 to-orange-100">
                <img src={f.img} alt={f.name} draggable={false} className="h-[92%] w-auto object-contain" />
              </div>
              <span className="mt-[0.6vh] font-black text-slate-700" style={{ fontSize: 'min(3vh, 2vw)' }}>{f.name}</span>
            </motion.div>
          </AnimatePresence>
          {!reduce && <motion.div key={`flash-${round}`} className="pointer-events-none absolute inset-0 z-30 bg-white" initial={{ opacity: 0.85 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }} />}
          {/* question + sentence being built */}
          <div className="absolute left-[38%] right-[3%] top-[14%] z-30 flex flex-col items-center gap-[1.6vh]">
            <button type="button" onClick={() => { sfx.click(); cueSpeak(cameraAsk(f.name), voiceOf(scene.who)); }}
              className="rounded-[2vh] bg-white px-[1.4vw] py-[0.8vh] font-black text-indigo-900 shadow-xl" style={{ fontSize: 'min(3.6vh, 2.5vw)' }}>🔊 {cameraAsk(f.name)}</button>
            <div className="flex items-center gap-[0.8vw] rounded-[2vh] bg-white/85 px-[1.2vw] py-[1vh] shadow-xl">
              {word('p', pronoun || '___', !!pronoun)}{word('is', 'is', true)}{word('f', feeling ? `${feeling}.` : '___', !!feeling)}
            </div>
            {!built && (
              <div className="flex gap-[1.2vw]">
                {(['He', 'She'] as const).map((p) => (
                  <motion.button key={p} type="button" onClick={() => choosePronoun(p)}
                    className={`rounded-[2vh] border-[0.6vh] px-[2vw] py-[1vh] font-black shadow-xl ${pronoun === p ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-white bg-sky-500 text-white'}`}
                    animate={state.wrong === p ? { x: [0, -12, 12, -7, 0] } : {}} transition={{ duration: 0.45 }} style={{ fontSize: 'min(4.4vh, 3vw)' }}>
                    {p === 'He' ? '\u{1F466}' : '\u{1F467}'} {p}
                  </motion.button>
                ))}
              </div>
            )}
            {!built && (
              <div className={`flex flex-wrap justify-center gap-[0.8vw] transition-opacity ${pronoun ? '' : 'opacity-50'}`}>
                {scene.feelings.map((fe) => (
                  <motion.button key={fe.feeling} type="button" onClick={() => chooseFeeling(fe.feeling)}
                    className="flex flex-col items-center rounded-[1.8vh] border-[0.5vh] border-white bg-white px-[0.6vw] py-[0.5vh] shadow-lg"
                    animate={state.wrong === fe.feeling ? { x: [0, -12, 12, -7, 0] } : {}} transition={{ duration: 0.45 }}>
                    <img src={fe.img} alt="" draggable={false} className="h-[min(9vh,6vw)] w-auto object-contain" />
                    <span className="font-black text-indigo-900" style={{ fontSize: 'min(2.4vh, 1.7vw)' }}>{fe.feeling}</span>
                  </motion.button>
                ))}
              </div>
            )}
            {built && (
              <motion.div className="flex flex-col items-center gap-[1vh]" initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <button type="button" onClick={() => { sfx.click(); cueSpeak(cameraSentence(f.pronoun, f.feeling), voiceOf(scene.who)); }}
                  className="rounded-[2vh] border-[0.5vh] border-emerald-500 bg-white px-[1.6vw] py-[0.8vh] font-black text-emerald-800 shadow-2xl" style={{ fontSize: 'min(3.6vh, 2.5vw)' }}>🗣️ Say it!</button>
                <button type="button" onClick={said} className={`${CLAY_BUTTON} px-8 py-2`} style={{ fontSize: 'min(3vh, 2vw)' }}>✓ I said it!</button>
              </motion.div>
            )}
          </div>
        </>
      )}
      {/* the class album */}
      <div className="absolute inset-x-[4%] bottom-[3%] z-30 flex justify-center gap-[0.8vw]">
        {scene.friends.map((fr, k) => (
          <div key={k} className={`grid h-[min(9vh,6vw)] w-[min(8vh,5.4vw)] place-items-center rounded-[0.8vh] border-[0.4vh] ${album.includes(k) ? 'border-white bg-white shadow-lg' : 'border-dashed border-white/60 bg-white/15'}`}>
            {album.includes(k) && <img src={fr.img} alt={fr.name} draggable={false} className="h-[88%] w-auto object-contain" />}
          </div>
        ))}
      </div>
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute left-1/2 top-[45%] z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
