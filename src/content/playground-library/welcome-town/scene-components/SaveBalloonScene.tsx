import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Save the Balloon (classic hangman, redesigned — docs/a1-activity-library.md §11 ⚠️) ----------
 * Hangman's mechanic (guess the letters of a hidden word, any order) without the gallows: Pip's hot-air balloon has
 * to float up over the hill. Every right letter fills its gaps and fires the burner — the balloon rises; a wrong
 * letter only puffs a little grey smoke and the balloon dips, then the child tries again. There is no losing state.
 * When the word is complete the balloon floats over the hilltop flag and the word is read in its sentence.
 * Mechanics: hangman (esl-kids.com, eslactive.com), Wordwall "Hangman", Duolingo ABC word puzzles. Better: no
 * violent picture, the picture + sentence clue come first (meaning before spelling), progress is a visible climb. */

type Balloon = Extract<Scene, { kind: 'save-balloon' }>;
const ABC = 'abcdefghijklmnopqrstuvwxyz';
const ENVELOPE = ['#F43F5E', '#FBBF24', '#3B82F6', '#22C55E'];

function tilesFor(word: string, extra?: string[]): string[] {
  const letters = [...new Set(word.toLowerCase().replace(/[^a-z]/g, '').split(''))];
  const ex = (extra?.length ? extra : letters.slice(0, 3).map((l) => ABC[(ABC.indexOf(l) + 7) % 26]))
    .map((l) => l.toLowerCase()).filter((l) => !letters.includes(l));
  return [...new Set([...letters, ...ex])].sort();
}

export function SaveBalloonScene({ scene, onNext, onWin, onLose, sync }: { scene: Balloon; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, guessed: [''] as string[], wrong: '', dips: 0, done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[round];
  const word = (r?.word ?? '').toLowerCase();
  const guessed = useMemo(() => (Array.isArray(state.guessed) ? state.guessed.filter((g) => typeof g === 'string' && g) : []), [state.guessed]);
  const tiles = useMemo(() => tilesFor(word, r?.extra), [word, r?.extra]);
  const need = [...new Set(word.replace(/[^a-z]/g, '').split(''))];
  const solved = need.length > 0 && need.every((l) => guessed.includes(l));
  const progress = need.length ? need.filter((l) => guessed.includes(l)).length / need.length : 0;
  const done = !!state.done;
  const gemDone = useRef(false);

  useEffect(() => {
    if (done || !r) return undefined;
    const t = window.setTimeout(() => cueSpeak(r.sentence, voiceOf(scene.who)), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done]);
  useEffect(() => {
    if (!solved || !r) return undefined;
    sfx.whoop();
    const t = window.setTimeout(() => cueSpeak(`${r.word}! ${r.sentence}`, voiceOf(scene.who)), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pick = (l: string) => {
    if (done || solved || guessed.includes(l)) return;
    if (!word.includes(l)) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, guessed: [...(Array.isArray(s.guessed) ? s.guessed.filter(Boolean) : []), l], wrong: l, dips: (Number(s.dips) || 0) + 1 }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 900);
      return;
    }
    sfx.pop(); sfx.match();
    setState((s) => ({ ...s, guessed: [...(Array.isArray(s.guessed) ? s.guessed.filter(Boolean) : []), l] }));
  };
  const next = () => {
    sfx.click();
    setState((s) => {
      const n = (Number(s.round) || 0) + 1;
      return n >= total ? { ...s, done: true } : { ...s, round: n, guessed: [''], wrong: '', dips: 0 };
    });
  };

  // balloon top: from 40% (start, basket near the grass) up to 3% (over the hill); a wrong letter dips it a little
  const y = 40 - progress * 37 + (state.wrong ? 4 : 0);
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300/30 to-transparent" />
      {done && <Confetti count={70} />}
      <div className="pointer-events-none absolute inset-x-0 top-[6%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🎈 ${scene.title}`}
        </span>
      </div>
      {/* the hill and its flag (the goal) */}
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="pointer-events-none absolute bottom-0 right-0 h-[46%] w-[46%]" aria-hidden>
        <path d="M0 40 C 25 8, 60 0, 100 6 L100 40 Z" fill="#4d8b3a" opacity="0.92" />
        <path d="M0 40 C 25 14, 60 6, 100 12 L100 40 Z" fill="#6aaa4b" opacity="0.9" />
      </svg>
      <div className="pointer-events-none absolute right-[16%] top-[47%] z-10 text-[min(7vh,5vw)]">🚩</div>
      {/* the balloon */}
      {!done && r && (
        <motion.div className="pointer-events-none absolute z-20 flex flex-col items-center" style={{ left: '12%', width: 'min(22vh,15vw)' }}
          animate={{ top: `${y}%`, x: solved ? '170%' : 0, rotate: state.wrong && !reduce ? [0, -6, 6, 0] : 0 }} transition={{ type: 'spring', stiffness: 60, damping: 14 }}>
          <div className="relative w-full">
            <svg viewBox="0 0 100 120" className="w-full drop-shadow-xl" aria-hidden>
              <defs><clipPath id={`env-${scene.id}`}><path d="M50 2 C 10 2, 2 40, 14 64 C 22 80, 36 90, 40 100 L60 100 C 64 90, 78 80, 86 64 C 98 40, 90 2, 50 2 Z" /></clipPath></defs>
              <g clipPath={`url(#env-${scene.id})`}>
                {ENVELOPE.map((c, i) => <rect key={c} x={i * 25} y="0" width="25" height="110" fill={c} />)}
                <ellipse cx="34" cy="30" rx="10" ry="18" fill="#fff" opacity="0.25" />
              </g>
              <path d="M50 2 C 10 2, 2 40, 14 64 C 22 80, 36 90, 40 100 L60 100 C 64 90, 78 80, 86 64 C 98 40, 90 2, 50 2 Z" fill="none" stroke="#7c2d12" strokeWidth="1.5" />
              <line x1="41" y1="100" x2="38" y2="114" stroke="#7c4a1e" strokeWidth="1.2" />
              <line x1="59" y1="100" x2="62" y2="114" stroke="#7c4a1e" strokeWidth="1.2" />
            </svg>
            {/* burner flame on every right letter */}
            <AnimatePresence>
              {!state.wrong && progress > 0 && (
                <motion.div key={guessed.length} className="absolute left-1/2 top-[84%] -translate-x-1/2 text-[min(4vh,2.6vw)]" initial={{ opacity: 1, scale: 1.4 }} animate={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.8 }}>🔥</motion.div>
              )}
              {state.wrong && <motion.div className="absolute left-[70%] top-[78%] text-[min(4vh,2.6vw)]" initial={{ opacity: 0.9, y: 0 }} animate={{ opacity: 0, y: -30 }} transition={{ duration: 0.9 }}>💨</motion.div>}
            </AnimatePresence>
          </div>
          <div className="-mt-[1vh] flex h-[min(9vh,6vw)] w-[48%] items-end justify-center overflow-hidden rounded-b-[1vh] border-[0.4vh] border-amber-900 bg-gradient-to-b from-amber-500 to-amber-700">
            {scene.balloonImg && <img src={scene.balloonImg} alt="" draggable={false} className="-mb-[1vh] h-[160%] object-contain" />}
          </div>
        </motion.div>
      )}
      {/* clue + word + letters */}
      {!done && r && (
        <div className="absolute bottom-[3%] left-[34%] right-[3%] z-30 rounded-[3vh] border-[0.6vh] border-white bg-white/95 p-[1.8vh] shadow-2xl">
          <div className="flex items-center gap-[1.4vw]">
            <img src={r.img} alt="" draggable={false} className="h-[min(14vh,9vw)] w-[min(14vh,9vw)] object-contain" />
            <div className="flex flex-1 flex-col gap-[1vh]">
              <button type="button" onClick={() => cueSpeak(r.sentence, voiceOf(scene.who))} className="text-start font-bold text-neutral-600" style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>
                🔊 {solved ? r.sentence : r.sentence.replace(new RegExp(r.word, 'i'), '____')}
              </button>
              <div className="flex gap-[0.8vw]">
                {word.split('').map((ch, i) => (
                  <span key={i} className={`grid h-[min(8vh,5.4vw)] w-[min(7vh,4.6vw)] place-items-center rounded-[1.2vh] border-b-[0.6vh] font-black ${guessed.includes(ch) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-300 bg-neutral-100 text-transparent'}`}
                    style={{ fontSize: 'min(5vh, 3.4vw)' }}>{ch}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-[1.4vh] flex flex-wrap gap-[0.7vw]">
            {solved ? (
              <button type="button" onClick={next} className={`${CLAY_BUTTON} px-8 py-2`} style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>{round + 1 >= total ? 'Done! ⭐' : 'Next word 🎈'}</button>
            ) : tiles.map((l) => {
              const used = guessed.includes(l);
              const bad = used && !word.includes(l);
              return (
                <motion.button key={l} type="button" onClick={() => pick(l)} disabled={used} whileTap={{ scale: 0.9 }}
                  animate={state.wrong === l ? { x: [0, -8, 8, -5, 0] } : {}}
                  className={`h-[min(8vh,5.4vw)] w-[min(8vh,5.4vw)] rounded-[1.4vh] border-[0.4vh] font-black shadow-[0_0.5vh_0_rgba(0,0,0,0.2)] ${bad ? 'border-neutral-200 bg-neutral-200 text-neutral-400' : used ? 'border-emerald-300 bg-emerald-400 text-white' : 'border-white bg-gradient-to-b from-sky-400 to-sky-600 text-white'}`}
                  style={{ fontSize: 'min(4vh, 2.8vw)' }}>{l}</motion.button>
              );
            })}
          </div>
        </div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
