import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Magic Mirror: "How are you?" (`answer-mirror`, A1 U1 L2 — owner 2026-10-14) ----------
 * The owner: "the student should answer the question How are you? — I am tired, I am happy, I am angry". The magic
 * mirror shows the child as a friend with a feeling; Pip asks "How are you?"; three answer bubbles (face + sentence)
 * wait below. The child taps a bubble to hear it, picks the one that matches the face in the mirror, then SAYS it and
 * taps "I said it!". A wrong bubble wiggles and Pip asks again ("Look at the mirror!").
 * Mechanics: Duolingo "tap the right response", Cambridge Pre A1/A1 "look and answer". Better: the question is a real
 * question to the child (it is "you" in the mirror), every answer is heard before choosing, and the turn ends with the
 * child saying the whole answer — no timer, nothing lost. */

type Mirror = Extract<Scene, { kind: 'answer-mirror' }>;
export const MIRROR_ASK = 'How are you?';
export const MIRROR_AGAIN = 'Look at the mirror! How are you?';

export function AnswerMirrorScene({ scene, onNext, onWin, onLose, sync }: { scene: Mirror; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, wrong: -1, right: false, done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[round];
  const right = !!state.right;
  const done = !!state.done;
  const gemDone = useRef(false);
  const ans = r ? scene.answers[r.answer] : undefined;

  useEffect(() => {
    if (done || !r) return undefined;
    const t = window.setTimeout(() => cueSpeak(MIRROR_ASK, voiceOf(scene.who)), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pick = (a: number) => {
    const c = scene.answers[a];
    if (!r || !c || right || done) return;
    cueSpeak(c.line, voiceOf(r.who));
    if (a !== r.answer) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: a }));
      window.setTimeout(() => { setState((s) => ({ ...s, wrong: -1 })); cueSpeak(MIRROR_AGAIN, voiceOf(scene.who)); }, 1600);
      return;
    }
    sfx.match(); window.setTimeout(() => sfx.whoop(), 250);
    setState((s) => ({ ...s, right: true }));
  };
  const said = () => {
    if (!right) return;
    sfx.click();
    setState((s) => {
      const n = (Number(s.round) || 0) + 1;
      return n >= total ? { ...s, right: false, done: true } : { ...s, round: n, right: false, wrong: -1 };
    });
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-indigo-950/20" />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[3%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.2rem, min(calc(3*var(--svw,1vw)), 5vh), 2.4rem)' }}>
          {done ? scene.doneLine : `\u{1FA9E} ${scene.title}`}
        </span>
      </div>

      {!done && r && ans && (
        <>
          {/* Pip asks */}
          <button type="button" onClick={() => { sfx.click(); cueSpeak(MIRROR_ASK, voiceOf(scene.who)); }}
            className="absolute left-[4%] top-[16%] z-30 flex flex-col items-center">
            <span className="mb-[1vh] rounded-[2vh] bg-white px-[1.4vw] py-[0.8vh] font-black text-indigo-900 shadow-xl" style={{ fontSize: 'min(3.4vh, 2.4vw)' }}>🔊 {MIRROR_ASK}</span>
            <img src={scene.askerImg} alt="" draggable={false} className="h-[min(30vh,20vw)] w-auto object-contain drop-shadow-2xl" />
          </button>
          {/* the magic mirror: this is you */}
          <motion.div key={`mirror-${round}`} className="absolute left-1/2 top-[12%] z-20 flex -translate-x-1/2 flex-col items-center"
            initial={reduce ? false : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 16 }}>
            <div className={`relative grid h-[min(40vh,26vw)] w-[min(32vh,21vw)] place-items-center overflow-hidden rounded-[50%] border-[1.2vh] bg-gradient-to-b from-sky-100 to-indigo-200 shadow-2xl ${right ? 'border-emerald-400' : 'border-amber-400'}`}>
              <img src={ans.img} alt="" draggable={false} className="h-[86%] w-auto object-contain" />
              {right && !reduce && <motion.span className="absolute inset-0 rounded-[50%] bg-white/40" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.8 }} />}
            </div>
            <span className="mt-[0.6vh] rounded-full bg-white/95 px-4 font-black text-amber-700 shadow" style={{ fontSize: 'min(2.6vh, 1.8vw)' }}>✨ {scene.mirrorNote} <span className="ms-1 text-amber-400">{round + 1}/{total}</span></span>
          </motion.div>
          {/* the answers */}
          <div className="absolute inset-x-[3%] bottom-[4%] z-30 flex items-end justify-center gap-[1.4vw]">
            {r.choices.map((a) => {
              const c = scene.answers[a];
              if (!c) return null;
              const isRight = right && a === r.answer;
              return (
                <motion.button key={`${round}-${a}`} type="button" onClick={() => pick(a)} disabled={right}
                  className={`flex items-center gap-[0.8vw] rounded-[2.4vh] border-[0.6vh] bg-white px-[1.2vw] py-[1vh] shadow-2xl ${isRight ? 'border-emerald-400' : 'border-white'} ${right && !isRight ? 'opacity-40' : ''}`}
                  animate={state.wrong === a ? { x: [0, -12, 12, -7, 0] } : isRight && !reduce ? { y: [0, -14, 0] } : {}} transition={{ duration: 0.45 }}>
                  <img src={c.img} alt="" draggable={false} className="h-[min(9vh,6vw)] w-auto object-contain" />
                  <span className="font-black text-indigo-900" style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>{c.line}</span>
                </motion.button>
              );
            })}
          </div>
          {right && (
            <motion.div className="absolute left-1/2 top-[60%] z-40 flex -translate-x-1/2 flex-col items-center gap-[1vh]" initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <button type="button" onClick={() => { sfx.click(); cueSpeak(ans.line, voiceOf(r.who)); }}
                className="rounded-[2vh] border-[0.5vh] border-emerald-500 bg-white px-[1.6vw] py-[0.8vh] font-black text-emerald-800 shadow-2xl" style={{ fontSize: 'min(4vh, 2.8vw)' }}>
                🗣️ {ans.line}
              </button>
              <button type="button" onClick={said} className={`${CLAY_BUTTON} px-8 py-2`} style={{ fontSize: 'min(3vh, 2vw)' }}>✓ I said it!</button>
            </motion.div>
          )}
        </>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute left-1/2 top-[45%] z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
