import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, type TargetAndTransition, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Jungle Obstacle Run (A1 U2L2 signature, owner 2026-10-12: "choose the game that serves the purpose and the
 * objective of the lesson" — objective: "I can say what an animal can and can't do") ----------
 * Jungle Games Day: the friends race along an obstacle course to the golden banana at the waterfall. At each station
 * (the long path, the tall tree, the river, the vine gap, the waterfall) the announcer asks "Who can climb the tall
 * tree?" and the child sends a friend. The right friend DOES it (runs, climbs, swims, swings, flies) and the station
 * gets a flag that stays; the child then says the full sentence ("A monkey can climb!") — guided practice. A wrong
 * friend TRIES, flops and says "I can't climb!" — the "can't" is heard and seen, nothing is lost, the right card glows
 * after two misses. After the last station comes the free-practice round: the child picks ANY friend and makes their
 * own can + can't sentences with a frame ("A ___ can ___. It can't ___."); the teacher taps ✓ when it is said.
 * Sources (mechanic only): EnglishClub / British Council can-can't ability games ("Who can…?"), Cambridge Pre A1–A1
 * listen-and-choose tasks, Wordwall "Maze chase" route progress, Khan Academy Kids instant cause-and-effect feedback.
 * Better: the language IS the move (you only pass by matching the ability to the obstacle), the wrong choice is a funny
 * visible "can't" instead of a red cross, the course fills with flags (permanent progress), and the game ends in the
 * child's own sentences, not just taps. */

type Run = Extract<Scene, { kind: 'obstacle-run' }>;
type Act = Run['stations'][number]['action'];
const EMOJI: Record<Act, string> = { run: '🏃', climb: '🧗', swim: '🏊', swing: '🌿', fly: '🕊️', jump: '🦘' };
const DO: Record<Act, TargetAndTransition> = {
  run: { x: ['-40%', '40%', '0%'], y: [0, -14, 0, -14, 0, -14, 0], transition: { duration: 1.3 } },
  climb: { y: ['0%', '-55%', '-45%', '-90%'], rotate: [0, -6, 6, 0], transition: { duration: 1.8 } },
  swim: { x: ['-30%', '30%', '-10%', '0%'], y: [0, -8, 0, -8, 0], rotate: [-8, 8, -8, 0], transition: { duration: 1.9 } },
  swing: { rotate: [-35, 35, -25, 25, 0], x: ['-20%', '20%', '-10%', '0%'], transition: { duration: 2 } },
  fly: { y: ['0%', '-80%', '-60%', '-100%', '0%'], rotate: [0, -8, 8, -8, 0], transition: { duration: 2.2 } },
  jump: { y: [0, -120, 0, -80, 0], scaleY: [1, 1.1, 0.8, 1.05, 0.9, 1], transition: { duration: 1.3 } },
};
const FLOP: TargetAndTransition = { rotate: [0, -10, 12, 75], y: ['0%', '-10%', '0%', '18%'], scaleY: [1, 1, 1, 0.86], transition: { duration: 1.1 } };
const pct = (v: string) => Number.parseFloat(v) || 0;

export function ObstacleRunScene({ scene, onWin, onNext, sync }: { scene: Run; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.stations.length;
  const [state, setState] = useSyncedState(sync, {
    station: 0, phase: 'pick', misses: 0, freePick: -1, freeSaid: 0, gemDone: false,
  });
  const station = Math.max(0, Math.min(total, Number(state.station) || 0));
  const phase = state.phase === 'say' || state.phase === 'free' ? state.phase : 'pick';
  const st = station < total ? scene.stations[station] : undefined;
  const finished = station >= total;
  const busy = useRef(false);
  const [show, setShow] = useState<{ friend: number; kind: 'do' | 'flop'; k: number } | null>(null);
  const [bubble, setBubble] = useState<string | null>(null);
  const [bursts, fire] = useBursts();
  const freeFriend = state.freePick >= 0 ? scene.friends[state.freePick] : undefined;

  // where the active friend stands: the station's spot, or the start arch before the first pick
  const spot = useMemo(() => (st ? { left: st.left, top: st.top } : { left: '90%', top: '58%' }), [st]);

  useEffect(() => {
    busy.current = false;
    // the friend who passed stays on the obstacle while the child says the sentence; a new station starts empty
    if (phase !== 'say') { setShow(null); setBubble(null); }
    if (st && phase === 'pick') {
      const t = window.setTimeout(() => cueSpeak(st.ask, scene.who), 700);
      return () => window.clearTimeout(t);
    }
    if (finished && phase !== 'free') {
      const t = window.setTimeout(() => cueSpeak(scene.freePrompt, scene.who), 900);
      return () => window.clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station, phase, scene.id]);

  const wait = (ms: number) => new Promise((res) => window.setTimeout(res, reduce ? 0 : ms));

  const send = async (fi: number) => {
    if (!st || phase !== 'pick' || busy.current) return;
    busy.current = true;
    const f = scene.friends[fi];
    if (fi === st.answer) {
      sfx.whoop();
      setShow({ friend: fi, kind: 'do', k: Date.now() });
      fire(pct(st.left), pct(st.top), 'stars');
      await sayWithin(`I can ${st.action}!`, f.voice, 2400);
      sfx.match();
      setState((s) => ({ ...s, phase: 'say', misses: 0 }));
      busy.current = false;
      return;
    }
    sfx.wrong();
    setShow({ friend: fi, kind: 'flop', k: Date.now() });
    setBubble(fi === st.answer ? null : '?');
    await sayWithin(`Oops! I can't ${st.action}!`, f.voice, 2600);
    await wait(300); setBubble(null); setShow(null);
    setState((s) => ({ ...s, misses: (Number(s.misses) || 0) + 1 }));
    busy.current = false;
  };

  // guided: the child says the full sentence (model on 🔊), then the run goes on
  const sayDone = () => {
    if (!st || phase !== 'say') return;
    sfx.pop();
    const next = station + 1;
    setState((s) => ({ ...s, station: next, phase: 'pick', misses: 0 }));
  };

  // free practice: the child picks any friend and makes their own can / can't sentences; the teacher taps ✓ each time
  const freeTick = () => {
    sfx.match(); fire(50, 45, 'stars');
    const said = (Number(state.freeSaid) || 0) + 1;
    if (said >= scene.freeGoal && !state.gemDone) { fire(50, 35, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, freeSaid: said, gemDone: s.gemDone || said >= scene.freeGoal }));
  };

  const glowRight = st && phase === 'pick' && (Number(state.misses) || 0) >= 2 ? st.answer : -1;

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-emerald-900">
      {/* blurred fill behind the 16:9 course, so station spots stay exactly on the painted obstacles */}
      <div className="absolute inset-0 scale-110 bg-cover bg-center opacity-60 blur-xl" style={{ backgroundImage: `url(${scene.bg})` }} />
      <div className="absolute left-1/2 top-1/2 aspect-video w-[min(100vw,calc(100vh*16/9))] -translate-x-1/2 -translate-y-1/2">
        <img src={scene.bg} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        {state.gemDone && <Confetti count={70} />}

        {/* flags planted at passed stations (permanent progress) */}
        {scene.stations.map((s, i) => (i < station ? (
          <motion.span key={`flag-${i}`} className="pointer-events-none absolute z-10 text-[5vh]" style={{ left: s.left, top: `calc(${s.top} - 9%)`, translate: '-50% -50%' }}
            initial={reduce ? false : { scale: 0, y: -30 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }}>🚩</motion.span>
        ) : null))}

        {/* the station now: a glowing ring on the obstacle + its action chip */}
        {st && (
          <motion.div key={`ring-${station}`} className="pointer-events-none absolute z-10 rounded-full border-[0.6vh] border-yellow-200"
            style={{ left: st.left, top: st.top, width: '15%', aspectRatio: '1', translate: '-50% -50%', boxShadow: '0 0 4vh 1vh rgba(253,224,71,0.7)' }}
            animate={reduce ? {} : { scale: [0.92, 1.06, 0.92], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.6, repeat: Infinity }} />
        )}

        {/* the friend doing (or trying) the action at the station */}
        <AnimatePresence>
          {show && (
            <motion.div key={`act-${show.k}`} className="absolute z-20" style={{ left: spot.left, top: spot.top, width: '17%', aspectRatio: '1', translate: '-50% -60%' }}
              initial={reduce ? false : { scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
              <motion.img src={scene.friends[show.friend].img} alt={scene.friends[show.friend].name} draggable={false}
                className="h-full w-full object-contain drop-shadow-[0_1.4vh_1vh_rgba(0,0,0,0.35)]" style={{ transformOrigin: '50% 90%' }}
                animate={reduce ? {} : show.kind === 'flop' ? FLOP : DO[st?.action ?? 'run']} />
              <AnimatePresence>
                {bubble && (
                  <motion.span className="absolute -top-[8%] right-[2%] grid h-[28%] w-[28%] place-items-center rounded-full bg-gradient-to-b from-yellow-200 to-amber-300 text-[4.5vh] font-black text-amber-800 shadow-lg"
                    initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} exit={{ scale: 0 }}>{bubble}</motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* the question / the sentence to say */}
      <div className="pointer-events-none absolute inset-x-0 top-[9%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.8*var(--svw,1vw)), 4.8vh), 2.3rem)' }}>
          {st ? (phase === 'say' ? st.sentence : st.ask) : state.gemDone ? scene.doneLine : scene.freePrompt}
        </span>
      </div>
      {st && phase === 'pick' && (
        <div className="pointer-events-none absolute left-1/2 top-[19%] z-30 -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-300 to-orange-400 px-5 py-1 font-black text-white shadow-lg [text-shadow:0_0.3vh_0_rgba(0,0,0,0.3)]" style={{ fontSize: 'min(3.8vh, 2.5vw)' }}>
          {EMOJI[st.action]} {st.action}? · {station + 1}/{total}
        </div>
      )}

      {/* PICK: the friend cards */}
      {st && phase === 'pick' && (
        <div className="absolute inset-x-0 bottom-[3%] z-30 flex justify-center gap-[2.5vw]">
          {st.options.map((fi) => {
            const f = scene.friends[fi];
            const glow = glowRight === fi;
            return (
              <motion.button key={fi} type="button" aria-label={`Send ${f.name}`} onClick={() => { void send(fi); }}
                className="relative flex flex-col items-center rounded-[2.5vh] border-[0.5vh] border-white bg-gradient-to-b from-lime-100 to-emerald-200 px-[1.4vw] pb-[0.8vh] pt-[0.6vh] shadow-[0_0.8vh_0_rgba(0,0,0,0.25)]"
                whileTap={{ scale: 0.92 }} whileHover={reduce ? {} : { y: -6 }}
                animate={glow && !reduce ? { scale: [1, 1.08, 1] } : {}} transition={{ duration: 0.8, repeat: glow ? Infinity : 0 }}>
                {glow && <span className="pointer-events-none absolute -inset-[8%] -z-10 animate-pulse rounded-[3vh] bg-yellow-300/80 blur-lg" />}
                <img src={f.img} alt="" draggable={false} className="object-contain" style={{ height: 'min(15vh, 10vw)', width: 'min(15vh, 10vw)' }} />
                <span className="font-black text-emerald-900" style={{ fontSize: 'min(2.8vh, 1.8vw)' }}>{f.name}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* SAY: guided sentence step */}
      {st && phase === 'say' && (
        <motion.div className="absolute inset-x-0 bottom-[5%] z-30 flex items-center justify-center gap-4" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <button type="button" onClick={() => cueSpeak(st.sentence, scene.who)} aria-label="Hear the sentence"
            className="grid h-[9vh] w-[9vh] place-items-center rounded-full bg-white/90 text-[4.5vh] shadow-lg">🔊</button>
          <span className="rounded-full bg-white/90 px-5 py-2 font-black text-emerald-800 shadow-lg" style={{ fontSize: 'min(3.4vh, 2.2vw)' }}>🗣️ Say it!</span>
          <button type="button" onClick={sayDone} className={`${CLAY_BUTTON} px-8 py-3`} style={{ fontSize: 'min(3.4vh, 2.2vw)' }}>I said it! ➜</button>
        </motion.div>
      )}

      {/* FREE: the child's own sentences */}
      {finished && (
        <div className="absolute inset-x-0 bottom-[3%] z-30 flex flex-col items-center gap-[1.2vh]">
          <div className="flex justify-center gap-[2vw]">
            {scene.friends.map((f, fi) => (
              <motion.button key={fi} type="button" aria-label={f.name} onClick={() => { sfx.click(); setState((s) => ({ ...s, freePick: fi })); }}
                className={`flex flex-col items-center rounded-[2.5vh] border-[0.5vh] px-[1vw] pb-[0.6vh] shadow-[0_0.8vh_0_rgba(0,0,0,0.25)] ${state.freePick === fi ? 'border-yellow-300 bg-yellow-100' : 'border-white bg-white/85'}`}
                whileTap={{ scale: 0.92 }}>
                <img src={f.img} alt="" draggable={false} className="object-contain" style={{ height: 'min(12vh, 8vw)', width: 'min(12vh, 8vw)' }} />
                <span className="font-black text-emerald-900" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>{f.name}</span>
              </motion.button>
            ))}
          </div>
          {freeFriend && (
            <div className="flex items-center gap-3 rounded-[2vh] bg-white/90 px-4 py-2 shadow-lg">
              <span className="font-black text-emerald-900" style={{ fontSize: 'min(3.2vh, 2.1vw)' }}>
                {freeFriend.frame}
              </span>
              <button type="button" onClick={freeTick} aria-label="Said it" className={`${CLAY_BUTTON} px-6 py-2`} style={{ fontSize: 'min(3vh, 2vw)' }}>
                ✓ {Math.min(Number(state.freeSaid) || 0, scene.freeGoal)}/{scene.freeGoal}
              </button>
            </div>
          )}
        </div>
      )}

      <Bursts items={bursts} />
      <AnimatePresence>
        {state.gemDone && (
          <motion.div className="absolute right-[3%] top-[3%] z-40" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}>
            <button onClick={onNext} className={`${CLAY_BUTTON} px-8 py-3 text-xl`}>Next ⭐</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
