import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { CalmBg, Bursts, FloatText, useBursts } from '../../unit1/scene-components/gameFx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON } from '../../unit1/scene-components/shared';
import { SKIN, PILL_FONT, jewel } from '../../gameSkin';
import { reefAsk, reefSentence, REEF_START, REEF_WRONG } from './liveReefRules';

/* ---------- Live Reef ★ (docs/a1-unit-6-ocean.md §6.2) ----------
 * The reef sleeps under a soft blue fog. Each round one animal peeks out of its corner of the reef and the voice asks
 * "What's the crab doing?". 1 PICK the action (three verb chips). 2 SAY the whole sentence ("The crab is walking.") and
 * tap 🎤 — that part of the reef lights up and stays alive (the animal keeps moving). A wrong verb: the animal shrugs
 * and the voice says "Look again!". Done when the whole reef is lit.
 * Mechanics (docs/research/playground-a1u6-research.md): Twinkl "What are they doing? Reveal the picture" (a picture
 * uncovered bit by bit), teach-this present-continuous picture cards, video-game "fog of war". Better: the reef is
 * uncovered only by the child's English — the right -ing sentence, said aloud — and every lit corner stays alive,
 * so the child sees what they have said; no timer, no lives, a wrong verb only makes the animal shrug. */

type Reef = Extract<Scene, { kind: 'live-reef' }>;
type Phase = 'pick' | 'say';

export function LiveReefScene({ scene, onNext, onWin, onLose, sync }: { scene: Reef; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { r: 0, phase: 'pick', wrong: '', done: false });
  const total = scene.rounds.length;
  const r = Math.max(0, Math.min(total - 1, Number(state.r) || 0));
  const round = scene.rounds[r];
  const phase = (state.phase === 'say' ? 'say' : 'pick') as Phase;
  const done = !!state.done;
  const wrong = String(state.wrong || '');
  const [bursts, fire] = useBursts();
  const [star, setStar] = useState(false);
  const gemDone = useRef(false);

  const spot = round ? scene.spots[round.spot] : undefined;
  const sentence = round && spot ? reefSentence(spot.name, round.doing, spot.plural) : '';
  /** Spots the child has already lit (every round before this one, or all of them at the end). */
  const lit = new Set(scene.rounds.slice(0, done ? total : r + (phase === 'say' ? 1 : 0)).map((x) => x.spot));

  useEffect(() => {
    if (done || !spot) return undefined;
    const t = window.setTimeout(() => cueSpeak(r === 0 ? `${REEF_START} ${reefAsk(spot.name)}` : reefAsk(spot.name), voiceOf(scene.who)), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  if (!round || !spot) return null;

  const pick = (verb: string) => {
    if (phase !== 'pick' || done) return;
    if (verb !== round.doing) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: verb }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 700);
      cueSpeak(REEF_WRONG, voiceOf(scene.who));
      return;
    }
    sfx.match(); sfx.reveal();
    fire(spot.left, spot.top, 'sparkle');
    setState((s) => ({ ...s, phase: 'say', wrong: '' }));
    window.setTimeout(() => cueSpeak(sentence, 'teacher'), 400);
  };
  const said = () => {
    if (phase !== 'say' || done) return;
    sfx.gem();
    fire(spot.left, spot.top, 'stars');
    setStar(true);
    window.setTimeout(() => setStar(false), 900);
    window.setTimeout(() => setState((s) => {
      const n = (Number(s.r) || 0) + 1;
      return n >= total ? { ...s, done: true } : { ...s, r: n, phase: 'pick', wrong: '' };
    }), 900);
  };

  const shown = (i: number) => lit.has(i) || (!done && i === round.spot);
  return (
    <div className="absolute inset-0 select-none overflow-hidden" style={{ background: '#0C2A3F' }}>
      <CalmBg img={scene.bg} />
      {/* the fog: a soft blue veil with a clear window over every lit corner (and a small one where the animal peeks) */}
      <svg className="pointer-events-none absolute inset-0 z-[6] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <radialGradient id="reef-hole"><stop offset="55%" stopColor="black" /><stop offset="100%" stopColor="white" /></radialGradient>
          <mask id="reef-fog">
            <rect width="100" height="100" fill="white" />
            {scene.spots.map((sp, i) => {
              const open = lit.has(i) ? sp.size * 0.9 : !done && i === round.spot ? sp.size * 0.55 : 0;
              return <motion.ellipse key={i} cx={sp.left} cy={sp.top} fill="url(#reef-hole)" initial={false}
                animate={{ rx: open, ry: open * 1.78 }} transition={{ duration: reduce ? 0 : 0.9, ease: 'easeOut' }} />;
            })}
          </mask>
        </defs>
        <rect width="100" height="100" fill="#0B2540" opacity={done ? 0 : 0.62} mask="url(#reef-fog)" style={{ transition: 'opacity 1.2s' }} />
      </svg>

      {/* the animals: lit ones stay alive, the current one peeks and bobs */}
      {scene.spots.map((sp, i) => (
        <AnimatePresence key={i}>
          {shown(i) && (
            <motion.div className="pointer-events-none absolute z-[8] -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${sp.left}%`, top: `${sp.top}%`, width: `${sp.size}%` }}
              initial={reduce ? false : { opacity: 0, scale: 0.6, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 16 }}>
              <motion.img src={sp.img} alt={sp.name} draggable={false} className="w-full drop-shadow-[0_1.2vh_1.4vh_rgba(5,25,45,0.45)]"
                animate={wrong && i === round.spot ? { rotate: [0, -10, 10, -6, 0], y: 0 } : reduce ? {} : lit.has(i) ? { y: [0, -8, 0], rotate: [0, 2, -2, 0] } : { y: [0, -5, 0] }}
                transition={wrong && i === round.spot ? { duration: 0.5 } : { duration: 2.6 + (i % 3) * 0.4, repeat: Infinity, ease: 'easeInOut' }} />
              {lit.has(i) && <span className="absolute -top-[1vh] end-0 grid h-[3.6vh] w-[3.6vh] place-items-center rounded-full bg-[#22C55E] text-[2vh] font-black text-white shadow">✓</span>}
            </motion.div>
          )}
        </AnimatePresence>
      ))}

      {done && <Confetti count={100} />}
      <Bursts items={bursts} />
      <FloatText show={star} x={spot.left} y={spot.top}>+⭐</FloatText>

      {/* title + progress */}
      <div className="pointer-events-none absolute inset-x-0 top-[3%] z-30 flex justify-center px-16">
        <span className={`px-6 py-1.5 text-center ${SKIN.pill}`} style={{ fontSize: PILL_FONT }}>
          {done ? scene.doneLine : `🪸 ${scene.title}`}
        </span>
      </div>
      <span className={`absolute end-3 top-[12%] z-30 px-4 py-2 ${SKIN.pill}`} style={{ fontSize: 'min(3vh, 2vw)' }}>
        🪸 {done ? total : r}/{total}
      </span>

      {/* the question, the verb chips and the sentence to say */}
      {!done && (
        <div className="absolute inset-x-0 bottom-[3%] z-30 flex justify-center px-4">
          <motion.div key={`${r}-${phase}`} className={`flex w-[min(60vw,100vh)] flex-col items-center gap-[1.2vh] px-[1.6vw] py-[1.4vh] ${SKIN.panel}`}
            initial={reduce ? false : { y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            {phase === 'pick' ? (
              <>
                <button type="button" onClick={() => cueSpeak(reefAsk(spot.name), voiceOf(scene.who))} className={`font-black ${SKIN.ink}`} style={{ fontSize: 'min(3.8vh, 2.6vw)' }}>
                  {reefAsk(spot.name)} <span className="text-[0.7em]">🔊</span>
                </button>
                <div className="flex flex-wrap justify-center gap-[1.2vw]">
                  {round.choices.map((v, ci) => (
                    <motion.button key={v} type="button" onClick={() => pick(v)} whileTap={{ scale: 0.93 }}
                      animate={wrong === v ? { x: [0, -10, 10, -6, 0] } : {}}
                      className={`rounded-[2vh] px-[2vw] py-[1vh] font-black ${jewel(ci)}`} style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>
                      {v}
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <span className={`text-center font-black ${SKIN.ink}`} style={{ fontSize: 'min(4.2vh, 2.8vw)' }}>{sentence}</span>
                <div className="flex gap-[1vw]">
                  <button type="button" onClick={() => cueSpeak(sentence, 'teacher')} className={`rounded-full px-5 py-2 font-black ${jewel(1)}`} style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>🔊 Listen</button>
                  <button type="button" onClick={said} className={`rounded-full px-7 py-2 font-black ${jewel(0)}`} style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>🎤 I said it!</button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[6%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
