import { useEffect, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { changedWord, fixChoices, wordsOf } from './whisperRules';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Whisper Tube (Telephone / Chinese Whispers, made kind — docs/a1-activity-library.md §11) ----------
 * One friend whispers a sentence into a long, curly tube; a bubble travels along it to the other friend, who says
 * what they heard — with ONE word mixed up ("She is my fish!"). The child listens to both (🔊 replays the whisper),
 * taps the wrong word on the friend's line, then picks the right word, and the friend says the sentence again,
 * right this time. Mechanics: the Telephone game, "spot the mistake" listening tasks (Cambridge Starters listening
 * for detail), Duolingo "tap the word you hear". Better: the error is funny but the child must compare two spoken
 * sentences word by word; nobody is wrong for long — the friend thanks the child and the sentence is said again. */

type Whisper = Extract<Scene, { kind: 'whisper-tube' }>;
// the tube: a curly path across the top half (viewBox 1000 × 400)
const TUBE = 'M 120 330 C 120 120, 260 60, 330 160 S 420 320, 500 200 S 600 40, 680 150 S 840 330, 880 330';

export function WhisperTubeScene({ scene, onNext, onWin, onLose, sync }: { scene: Whisper; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, phase: 'whisper', wrong: -1, done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[round];
  const phase = String(state.phase) as 'whisper' | 'heard' | 'fix' | 'fixed';
  const changed = r ? changedWord(r.said, r.heard) : -1;
  const fix = useMemo(() => (r ? fixChoices(r.said, r.heard, r.choices) : { choices: [], answer: -1 }), [r]);
  const heardWords = r ? wordsOf(phase === 'fixed' ? r.said : r.heard) : [];
  const done = !!state.done;
  const gemDone = useRef(false);

  const whisper = () => { if (r) cueSpeak(r.said, voiceOf(r.from)); };
  useEffect(() => {
    if (done || !r || phase !== 'whisper') return undefined;
    const a = window.setTimeout(() => { whisper(); sfx.click(); }, 700);
    const b = window.setTimeout(() => {
      setState((s) => ({ ...s, phase: 'heard' }));
      cueSpeak(r.heard, voiceOf(r.to));
    }, 3900);
    return () => { window.clearTimeout(a); window.clearTimeout(b); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done, phase]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const tapWord = (i: number) => {
    if (!r || phase !== 'heard') return;
    if (i !== changed) {
      sfx.wrong(); onLose();
      cueSpeak('Listen again! Which word is wrong?', voiceOf(scene.who));
      setState((s) => ({ ...s, wrong: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, phase: 'fix', wrong: -1 }));
  };
  const pickFix = (i: number) => {
    if (!r || phase !== 'fix') return;
    if (i !== fix.answer) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: 100 + i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.whoop();
    cueSpeak(r.said, voiceOf(r.to));
    setState((s) => ({ ...s, phase: 'fixed', wrong: -1 }));
  };
  const next = () => {
    sfx.click();
    setState((s) => {
      const n = (Number(s.round) || 0) + 1;
      return n >= total ? { ...s, done: true } : { ...s, round: n, phase: 'whisper', wrong: -1 };
    });
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/15" />
      {done && <Confetti count={80} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `📞 ${scene.title}`}
        </span>
      </div>
      {!done && r && (
        <>
          <span className="absolute right-3 top-[13%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-teal-700 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>📞 {round + 1}/{total}</span>
          {/* the tube */}
          <svg viewBox="0 0 1000 400" className="pointer-events-none absolute inset-x-[4%] top-[14%] z-10 h-[48%] w-[92%]" preserveAspectRatio="none" aria-hidden>
            <path d={TUBE} fill="none" stroke="#0f766e" strokeWidth="46" strokeLinecap="round" />
            <path d={TUBE} fill="none" stroke="#2dd4bf" strokeWidth="34" strokeLinecap="round" />
            <path d={TUBE} fill="none" stroke="#99f6e4" strokeWidth="8" strokeLinecap="round" strokeDasharray="2 40" opacity="0.8" />
          </svg>
          {/* the whisper bubble travelling along the tube */}
          {phase === 'whisper' && !reduce && (
            <div className="pointer-events-none absolute inset-x-[4%] top-[14%] z-20 h-[48%] w-[92%]">
              <motion.span key={`b-${round}`} className="absolute left-0 top-0 grid h-[min(7vh,4.6vw)] w-[min(7vh,4.6vw)] place-items-center rounded-full bg-white text-[min(3.6vh,2.4vw)] shadow-xl"
                style={{ offsetPath: `path("${TUBE}")`, offsetRotate: '0deg' } as React.CSSProperties}
                initial={{ offsetDistance: '0%', opacity: 0 }} animate={{ offsetDistance: '100%', opacity: [0, 1, 1, 1, 0] }} transition={{ duration: 2.6, delay: 1, ease: 'easeInOut' }}>
                🤫
              </motion.span>
            </div>
          )}
          {/* the two friends */}
          <div className="absolute bottom-[30%] left-[2%] z-20 flex flex-col items-center">
            <motion.img src={r.fromImg} alt="" draggable={false} className="h-[min(26vh,17vw)] w-auto object-contain drop-shadow-xl"
              animate={phase === 'whisper' && !reduce ? { rotate: [0, -4, 0] } : { rotate: 0 }} transition={{ duration: 0.8, repeat: phase === 'whisper' ? 2 : 0 }} />
            <button type="button" onClick={() => { sfx.click(); whisper(); }} className="mt-[0.6vh] rounded-full bg-teal-600 px-3 py-1 font-black text-white shadow" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>🔊 The whisper</button>
          </div>
          <div className="absolute bottom-[30%] right-[2%] z-20 flex flex-col items-center">
            <motion.img src={r.toImg} alt="" draggable={false} className="h-[min(26vh,17vw)] w-auto object-contain drop-shadow-xl"
              animate={phase === 'heard' && !reduce ? { y: [0, -6, 0] } : { y: 0 }} transition={{ duration: 0.6, repeat: phase === 'heard' ? 2 : 0 }} />
            <button type="button" onClick={() => { sfx.click(); cueSpeak(phase === 'fixed' ? r.said : r.heard, voiceOf(r.to)); }} disabled={phase === 'whisper'}
              className="mt-[0.6vh] rounded-full bg-orange-500 px-3 py-1 font-black text-white shadow disabled:opacity-40" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>🔊 What I heard</button>
          </div>
          {/* the heard sentence as word chips */}
          <div className="absolute inset-x-[16%] bottom-[4%] z-30 flex flex-col items-center gap-[1.2vh] rounded-[3vh] border-[0.6vh] border-white bg-white/95 p-[1.8vh] shadow-2xl">
            {phase === 'whisper' ? (
              <span className="font-black text-teal-700" style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>👂 Shh… listen to the whisper!</span>
            ) : (
              <>
                <span className="font-black text-slate-500" style={{ fontSize: 'min(2.6vh, 1.8vw)' }}>
                  {phase === 'heard' ? '🤔 One word is wrong! Tap it.' : phase === 'fix' ? '✏️ What is the right word?' : '🎉 That’s right!'}
                </span>
                <div className="flex flex-wrap justify-center gap-[0.8vw]">
                  {heardWords.map((w, i) => (
                    <motion.button key={`${phase === 'fixed' ? 'f' : 'h'}-${i}`} type="button" onClick={() => tapWord(i)} disabled={phase !== 'heard'}
                      animate={state.wrong === i ? { x: [0, -8, 8, -5, 0] } : {}} whileTap={phase === 'heard' ? { scale: 0.92 } : {}}
                      className={`rounded-[1.4vh] border-[0.35vh] px-[1vw] py-[0.6vh] font-black shadow-[0_0.5vh_0_rgba(0,0,0,0.15)] ${
                        i === changed && phase === 'fix' ? 'border-rose-400 bg-rose-100 text-rose-600 line-through'
                          : i === changed && phase === 'fixed' ? 'border-emerald-400 bg-emerald-100 text-emerald-700'
                            : 'border-slate-200 bg-white text-[#3b2410]'}`}
                      style={{ fontSize: 'min(3.6vh, 2.4vw)' }}>{w}</motion.button>
                  ))}
                </div>
                {phase === 'fix' && (
                  <div className="flex flex-wrap justify-center gap-[1vw]">
                    {fix.choices.map((c, i) => (
                      <motion.button key={c} type="button" onClick={() => pickFix(i)} whileTap={{ scale: 0.93 }} animate={state.wrong === 100 + i ? { x: [0, -8, 8, -5, 0] } : {}}
                        className="rounded-[2vh] border-[0.4vh] border-white bg-gradient-to-b from-teal-400 to-teal-600 px-[2vw] py-[0.8vh] font-black text-white shadow-[0_0.6vh_0_rgba(0,0,0,0.25)]"
                        style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>{c}</motion.button>
                    ))}
                  </div>
                )}
                {phase === 'fixed' && (
                  <button type="button" onClick={next} className={`${CLAY_BUTTON} px-8 py-2`} style={{ fontSize: 'min(3.2vh, 2.2vw)' }}>{round + 1 >= total ? 'Done! ⭐' : 'Next whisper 📞'}</button>
                )}
              </>
            )}
          </div>
        </>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
