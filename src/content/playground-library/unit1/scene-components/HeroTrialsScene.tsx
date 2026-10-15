import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Hero Trials (the unit Boss Test, Lesson 7; owner 2026-10-12: "the last lesson of Unit 10, Lesson 7") ----------
 * The Boss Test that closes a unit. The child is a hero in training: every trial is ONE listening question
 * ("Find: swim!", "Can a fish walk?", "Who is she?", "Which sound: jam?") with picture or letter cards. It is a test,
 * so each trial gets ONE try: right = the hero's power bar jumps, stars burst and the answer is said in full; wrong =
 * a kind "Good try!", the right card glows and the answer is said — then the next trial (nobody is stuck, nothing is
 * lost). 🔊 replays the question as often as needed (listening, not memory). At the end the hero gets the medal and a
 * result board: stars for each skill of the unit (actions, can / can't, he / she / it, sounds) and, for the teacher,
 * the words to practise again. Sources (mechanic only): Cambridge Pre A1 Starters listening (listen and tick the
 * picture, one answer each), Duolingo / Lingokids unit checkpoints (a short mixed test that ends in a reward),
 * Khan Academy Kids mastery stars, Kahoot results screen. Better: the result is broken down BY SKILL (not one score),
 * the questions are spoken, picture-only and calm (no clock), and a miss still teaches the right answer. */

type Trials = Extract<Scene, { kind: 'hero-trials' }>;

export function HeroTrialsScene({ scene, onWin, onNext, sync }: { scene: Trials; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.items.length;
  const [state, setState] = useSyncedState(sync, { i: 0, results: scene.items.map(() => -1), gemDone: false });
  const { i, gemDone } = state;
  const results = useMemo(() => scene.items.map((_, k) => (typeof state.results[k] === 'number' ? state.results[k] : -1)), [state.results, scene.items]);
  const item = i < total ? scene.items[i] : undefined;
  const done = i >= total;
  const score = results.filter((r) => r === 1).length;
  const busy = useRef(false);
  const [picked, setPicked] = useState(-1);
  const [bursts, fire] = useBursts();

  useEffect(() => {
    busy.current = false; setPicked(-1);
    const t = window.setTimeout(() => cueSpeak(item ? item.ask : scene.doneLine, scene.who), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, scene.id]);

  const wait = (ms: number) => new Promise((res) => window.setTimeout(res, reduce ? 0 : ms));
  const choose = async (k: number) => {
    if (!item || busy.current) return;
    busy.current = true; setPicked(k);
    const right = k === item.answer;
    if (right) { sfx.match(); fire(50, 55, 'stars'); await sayWithin(item.reply, scene.who, 2800); }
    else { sfx.pop(); await sayWithin(`Good try! ${item.reply}`, scene.who, 3200); }
    await wait(500);
    const n = i + 1;
    if (n >= total && !gemDone) { fire(50, 35, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => {
      const res = scene.items.map((_, q) => (q === i ? (right ? 1 : 0) : typeof s.results[q] === 'number' ? s.results[q] : -1));
      return { ...s, i: n, results: res, gemDone: s.gemDone || n >= total };
    });
  };

  // per-skill result: stars out of 3 + the words to practise again
  const board = scene.skills.map((sk) => {
    const idx = scene.items.map((it, q) => (it.skill === sk.key ? q : -1)).filter((q) => q >= 0);
    const ok = idx.filter((q) => results[q] === 1).length;
    const stars = idx.length ? Math.round((ok / idx.length) * 3) : 0;
    const missed = idx.filter((q) => results[q] === 0).map((q) => scene.items[q].options[scene.items[q].answer].label);
    return { ...sk, ok, of: idx.length, stars, missed };
  });

  const power = total ? score / total : 0;
  const optW = item && item.options.length > 3 ? 'min(18vh, 13vw)' : 'min(24vh, 17vw)';

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-sky-950/30 via-transparent to-sky-950/30" />
      {done && <Confetti count={80} />}

      {/* hero power bar: the hero flies along it as the power grows */}
      {!done && (
        <div className="pointer-events-none absolute left-1/2 top-[13%] z-30 w-[56%] -translate-x-1/2">
          <div className="relative h-[3.2vh] rounded-full border-[0.4vh] border-white/80 bg-indigo-950/50 shadow-lg">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-rose-500" animate={{ width: `${Math.max(4, power * 100)}%` }} transition={{ type: 'spring', stiffness: 80, damping: 14 }} />
            <motion.img src={scene.hero.img} alt="" draggable={false} className="absolute top-1/2 h-[9vh] w-[9vh] object-contain drop-shadow-[0_0.6vh_0.6vh_rgba(0,0,0,0.35)]"
              style={{ translate: '-50% -60%' }} animate={{ left: `${Math.max(4, power * 100)}%`, y: reduce ? 0 : [0, -5, 0] }}
              transition={{ left: { type: 'spring', stiffness: 80, damping: 14 }, y: { duration: 1.4, repeat: Infinity } }} />
          </div>
          <div className="mt-[0.6vh] text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'min(2.4vh, 1.6vw)' }}>
            Trial {Math.min(i + 1, total)} / {total}
          </div>
        </div>
      )}

      {/* the trial */}
      {item && (
        <>
          <div className="absolute inset-x-0 top-[24%] z-30 flex items-center justify-center gap-3 px-14">
            <span className="rounded-full bg-indigo-700/85 px-3 py-[0.4vh] font-black text-yellow-200 shadow" style={{ fontSize: 'min(2.6vh, 1.8vw)' }}>
              {scene.skills.find((s) => s.key === item.skill)?.icon} {scene.skills.find((s) => s.key === item.skill)?.label}
            </span>
            <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.15rem, min(calc(3*var(--svw,1vw)), 5vh), 2.4rem)' }}>{item.ask}</span>
            <button type="button" aria-label="Hear it again" onClick={() => cueSpeak(item.ask, scene.who)}
              className="rounded-full bg-white/90 px-3 py-1 text-[3vh] shadow-lg active:scale-95">🔊</button>
          </div>
          <div className="absolute inset-x-0 top-[38%] z-20 flex justify-center gap-[2.5vw]">
            {item.options.map((o, k) => {
              const isRight = k === item.answer;
              const show = picked >= 0;
              return (
                <motion.button key={`${i}-${k}`} type="button" aria-label={o.label} onClick={() => { void choose(k); }} disabled={picked >= 0}
                  className={`relative flex flex-col items-center justify-center rounded-[3vh] border-[0.6vh] p-[1vh] ${show && isRight ? 'border-[#86EFAC] bg-gradient-to-b from-[#DCFCE7] to-[#86EFAC] shadow-[0_0.9vh_0_#16A34A,0_2vh_3vh_rgba(22,101,52,0.35)]' : show && k === picked ? 'border-[#FDA4AF] bg-gradient-to-b from-[#FFE4E6] to-[#FDA4AF] shadow-[0_0.9vh_0_#E11D48,0_2vh_3vh_rgba(159,18,57,0.3)]' : 'border-[#F3DDB3] bg-gradient-to-b from-[#FFFBF3] to-[#F7E8CF] shadow-[0_0.9vh_0_#D6AE78,0_2vh_3vh_rgba(46,16,101,0.3)]'}`}
                  style={{ width: optW, height: optW }}
                  initial={reduce ? false : { y: 60, opacity: 0, rotate: k % 2 ? 4 : -4 }}
                  animate={show && isRight && !reduce ? { y: [0, -16, 0], scale: [1, 1.08, 1], opacity: 1, rotate: 0 } : { y: 0, opacity: show && !isRight && k !== picked ? 0.45 : 1, rotate: 0 }}
                  transition={{ delay: show ? 0 : reduce ? 0 : 0.1 + k * 0.08, type: 'spring', stiffness: 160, damping: 14 }} whileTap={{ scale: 0.93 }}>
                  {o.img ? <img src={o.img} alt="" draggable={false} className="h-[78%] w-[78%] object-contain drop-shadow-[0_0.6vh_0.5vh_rgba(0,0,0,0.3)]" />
                    : <span className="font-black text-[#3B1E66]" style={{ fontSize: 'min(12vh, 8vw)', lineHeight: 1 }}>{o.text ?? o.label}</span>}
                  {o.img && o.text && <span className="font-black text-white" style={{ ...THICK_WORDS, fontSize: 'min(3vh, 2vw)' }}>{o.text}</span>}
                </motion.button>
              );
            })}
          </div>
        </>
      )}

      {/* the result board */}
      <AnimatePresence>
        {done && (
          <motion.div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-[1.6vh] px-[6%]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="flex items-end gap-[2vw]">
              <motion.img src={scene.hero.img} alt="" draggable={false} className="h-[24vh] w-[24vh] object-contain drop-shadow-[0_1.5vh_1vh_rgba(0,0,0,0.35)]"
                initial={reduce ? false : { y: 120, scale: 0.6 }} animate={{ y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 12 }} />
              <motion.img src={scene.medal} alt="" draggable={false} className="h-[16vh] w-[16vh] object-contain drop-shadow-[0_1vh_1vh_rgba(0,0,0,0.35)]"
                initial={reduce ? false : { y: -200, rotate: -30 }} animate={{ y: 0, rotate: [0, 10, -6, 0] }} transition={{ delay: 0.6, type: 'spring', stiffness: 140, damping: 10 }} />
            </div>
            <div className="rounded-full bg-indigo-800/85 px-5 py-1 font-black text-yellow-200 shadow-lg" style={{ fontSize: 'min(3.6vh, 2.4vw)' }}>
              {scene.hero.name} · {score} / {total}
            </div>
            <div className="grid w-full max-w-[92vh] grid-cols-2 gap-[1.2vh]">
              {board.map((b, k) => (
                <motion.div key={b.key} className="flex items-center gap-2 rounded-[2vh] border-[0.4vh] border-amber-200 bg-gradient-to-b from-amber-50 to-orange-100 px-3 py-[0.8vh] shadow-lg"
                  initial={reduce ? false : { x: k % 2 ? 60 : -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 + k * 0.15 }}>
                  <span style={{ fontSize: 'min(4vh, 2.8vw)' }}>{b.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-orange-800" style={{ fontSize: 'min(2.6vh, 1.8vw)' }}>{b.label}</div>
                    <div className="truncate text-orange-700/80" style={{ fontSize: 'min(1.8vh, 1.3vw)' }}>{b.missed.length ? `Practise: ${b.missed.join(', ')}` : 'All right!'}</div>
                  </div>
                  <span className="whitespace-nowrap" style={{ fontSize: 'min(3vh, 2vw)' }}>{'⭐'.repeat(b.stars)}{'☆'.repeat(3 - b.stars)}</span>
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.6 }}>
              <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Bursts items={bursts} />
    </div>
  );
}
