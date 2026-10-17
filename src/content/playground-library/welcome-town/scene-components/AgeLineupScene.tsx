import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { numWord, voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { Bursts, CalmBg, useBursts, useShake } from '../../unit1/scene-components/gameFx';
import { SKIN } from '../../gameSkin';

/* ---------- Age Line-Up: the birthday photo (A1 U1 L3, "How old are you? — I'm nine." — docs/a1-unit-1-welcome-town.md §5.3)
 * Time for the party photo! The friends must stand on the photo steps from the youngest (the smallest step) to the
 * oldest (the tallest step). Nobody's age is shown: the child taps a friend and ASKS "How old are you?" — the friend
 * answers ("I'm nine!") and a birthday badge pops up. Then the child taps a step to put the friend there. A friend on
 * the wrong step hops back ("Oops! Who is younger?"). When the row is right, the camera counts "Three, two, one…
 * cheese!", the flash goes off and the photo is framed — then the child says the photo: "Mia is six. Leo is seven…"
 * Researched mechanics (docs/research/playground-a1u1l3-research.md): the classroom "line up by age, youngest to oldest"
 * (ICAL TEFL, Language Advisor information line-up), ESL KidStuff "stand in the right order". Better: the line-up needs
 * the question (the child cannot win without asking and understanding the answer), the steps make "older" visible, and
 * the finished photo is a speaking prompt.
 * Look: painted Canva photo corner, wooden photo steps with a cream top and a gold number plate, birthday badges in the
 * brand shades, a camera flash and a polaroid frame for the reward. */

type Lineup = Extract<Scene, { kind: 'age-lineup' }>;

export function AgeLineupScene({ scene, onNext, onWin, onLose, sync }: { scene: Lineup; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const friends = scene.friends;
  const n = friends.length;
  const order = useMemo(() => friends.map((_, i) => i).sort((a, b) => friends[a].age - friends[b].age), [friends]);
  const [state, setState] = useSyncedState(sync, { asked: [] as number[], placed: Array.from({ length: n }, () => -1), sel: -1, wrong: -1, phase: 'line', said: 0, done: false });
  const asked = useMemo(() => new Set((Array.isArray(state.asked) ? state.asked : []).map(Number)), [state.asked]);
  const placed = Array.from({ length: n }, (_, k) => Number((Array.isArray(state.placed) ? state.placed : [])[k] ?? -1));
  const onStep = useMemo(() => new Set(placed.filter((x) => x >= 0)), [placed]);
  const sel = Number(state.sel);
  const phase = String(state.phase);
  const said = Math.max(0, Math.min(n, Number(state.said) || 0));
  const done = !!state.done;
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const gemDone = useRef(false);
  const timers = useRef<number[]>([]);
  const later = (ms: number, f: () => void) => { timers.current.push(window.setTimeout(f, ms)); };
  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)); }, []);

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak(scene.intro, voiceOf(scene.who)), 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const sentence = (i: number) => `${friends[i].name} is ${numWord(friends[i].age)}.`;
  const pick = (i: number) => {
    if (phase !== 'line' || onStep.has(i)) return;
    sfx.click();
    if (!asked.has(i)) {
      cueSpeak('How old are you?', 'teacher');
      later(1300, () => cueSpeak(`I’m ${numWord(friends[i].age)}!`, voiceOf(friends[i].who)));
      setState((s) => ({ ...s, sel: i, asked: [...(Array.isArray(s.asked) ? s.asked : []), i] }));
    } else {
      cueSpeak(`I’m ${numWord(friends[i].age)}!`, voiceOf(friends[i].who));
      setState((s) => ({ ...s, sel: i }));
    }
  };
  const putOn = (k: number) => {
    if (phase !== 'line' || sel < 0 || placed[k] >= 0) return;
    if (order[k] !== sel) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, wrong: k }));
      const younger = friends[sel].age > friends[order[k]].age;
      cueSpeak(younger ? 'Oops! I am older! Find a taller step!' : 'Oops! I am younger! Find a smaller step!', voiceOf(friends[sel].who));
      later(700, () => setState((s) => ({ ...s, wrong: -1 })));
      return;
    }
    sfx.match();
    fire(14 + k * (72 / Math.max(1, n - 1)), 62, 'stars');
    const next = placed.map((x, j) => (j === k ? sel : x));
    const full = next.every((x) => x >= 0);
    setState((s) => ({ ...s, placed: next, sel: -1, wrong: -1, phase: full ? 'photo' : 'line' }));
    if (full) {
      later(600, () => cueSpeak('Three, two, one… cheese!', voiceOf(scene.who)));
      later(2600, () => { sfx.gem(); setState((s) => ({ ...s, phase: 'say' })); });
    }
  };
  const sayNext = () => {
    if (phase !== 'say') return;
    const idx = order[said];
    if (idx === undefined) return;
    sfx.pop();
    cueSpeak(sentence(idx), voiceOf(friends[idx].who));
    const nx = said + 1;
    setState((s) => ({ ...s, said: nx }));
    if (nx >= n) later(1600, () => setState((s) => ({ ...s, done: true })));
  };

  const stepX = (k: number) => 14 + k * (72 / Math.max(1, n - 1)); // % centre of step k
  const stepH = (k: number) => 9 + k * 3.2; // % height of step k (the oldest is the tallest)
  const floorY = 95;
  const crowd = friends.map((_, i) => i).filter((i) => !onStep.has(i));
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-[#FDE7C2]">
      <CalmBg img={scene.bg} />
      <motion.div className="absolute inset-0" animate={shakeCtl}>
        {/* the photo steps */}
        {Array.from({ length: n }, (_, k) => (
          <button key={k} type="button" onClick={() => putOn(k)} aria-label={`step ${k + 1}`}
            className="absolute z-10 -translate-x-1/2 rounded-t-[1.4vh] border-[0.35vh] border-[#8A5A12] shadow-[0_1vh_1.6vh_rgba(60,30,10,0.35)]"
            style={{ left: `${stepX(k)}%`, width: `${Math.min(15, 70 / n)}%`, bottom: `${100 - floorY}%`, height: `${stepH(k)}%`,
              background: Number(state.wrong) === k ? 'linear-gradient(#FDA4AF,#E11D48)' : 'linear-gradient(180deg, #FEFBDD 0 14%, #E7B46A 14% 100%)',
              outline: sel >= 0 && placed[k] < 0 && phase === 'line' ? '0.4vh dashed #FE6A2F' : undefined, outlineOffset: '0.5vh' }}>
            <span className="absolute bottom-[12%] left-1/2 -translate-x-1/2 rounded-full bg-[#FEAF15] px-[0.7vw] font-black text-[#3B2410] shadow" style={{ fontSize: 'min(2.2vh,1.4vw)' }}>{k + 1}</span>
          </button>
        ))}
        <div className={`${SKIN.pill} pointer-events-none absolute bottom-[0.6%] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap px-[1.2vw] py-[0.2vh]`} style={{ fontSize: 'min(2.2vh,1.4vw)' }}>
          youngest ➜ ➜ ➜ oldest
        </div>

        {/* friends standing on the steps */}
        {placed.map((fi, k) => fi >= 0 && (
          <motion.div key={`on-${k}`} className="pointer-events-none absolute z-20 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${stepX(k)}%`, bottom: `${100 - floorY + stepH(k) - 1}%`, width: `${Math.min(9.5, 46 / n)}%` }}
            initial={reduce ? false : { y: -60, opacity: 0 }} animate={{ y: phase === 'photo' && !reduce ? [0, -10, 0] : 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
            <span className="mb-[0.4vh] rounded-full border-[0.3vh] border-white bg-[#FE6A2F] px-[0.7vw] font-black text-white shadow" style={{ fontSize: 'min(2.4vh,1.5vw)' }}>🎂 {friends[fi].age}</span>
            <img src={friends[fi].img} alt="" draggable={false} className="max-h-[24vh] w-full object-contain drop-shadow-[0_0.8vh_0.6vh_rgba(0,0,0,0.25)]" />
          </motion.div>
        ))}

        {/* the crowd: tap a friend to ask */}
        {phase === 'line' && (
          <div className="absolute inset-x-[4%] top-[13%] z-20 flex items-end justify-center gap-[2vw]" style={{ height: '34%' }}>
            {crowd.map((i) => {
              const isSel = sel === i;
              const known = asked.has(i);
              return (
                <motion.button key={i} type="button" onClick={() => pick(i)} className="relative flex h-full flex-col items-center justify-end"
                  style={{ width: `${Math.min(14, 70 / n)}vw` }}
                  animate={isSel && !reduce ? { y: [0, -10, 0] } : { y: 0 }} transition={{ duration: 0.6, repeat: isSel ? Infinity : 0 }} whileTap={{ scale: 0.94 }}>
                  <AnimatePresence mode="wait">
                    {known ? (
                      <motion.span key="age" className="mb-[0.6vh] rounded-full border-[0.3vh] border-white bg-[#FE6A2F] px-[0.9vw] py-[0.2vh] font-black text-white shadow-lg" style={{ fontSize: 'min(2.8vh,1.8vw)' }}
                        initial={{ scale: 0.2 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }}>
                        🎂 I’m {numWord(friends[i].age)}!
                      </motion.span>
                    ) : (
                      <motion.span key="ask" className={`${SKIN.panel} mb-[0.6vh] px-[0.9vw] py-[0.2vh] font-black ${SKIN.ink}`} style={{ fontSize: 'min(2.4vh,1.5vw)' }} exit={{ scale: 0.2, opacity: 0 }}>
                        ❓ How old?
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <img src={friends[i].img} alt={friends[i].name} draggable={false}
                    className={`max-h-[75%] w-full object-contain drop-shadow-[0_0.8vh_0.6vh_rgba(0,0,0,0.25)] ${isSel ? 'drop-shadow-[0_0_1.4vh_#FEAF15]' : ''}`} />
                  <span className={`mt-[0.3vh] rounded-full px-[0.8vw] font-black ${isSel ? 'bg-[#FEAF15] text-[#3B2410]' : 'bg-white/90 text-[#3B2410]'}`} style={{ fontSize: 'min(2.2vh,1.4vw)' }}>{friends[i].name}</span>
                </motion.button>
              );
            })}
          </div>
        )}
        {phase === 'line' && (
          <div className={`${SKIN.pill} pointer-events-none absolute start-[3%] top-[48%] z-20 px-[1vw] py-[0.4vh]`} style={{ fontSize: 'min(2.3vh,1.5vw)' }}>
            {sel >= 0 ? `👆 Now tap a step for ${friends[sel].name}!` : '👆 Tap a friend and ask: How old are you?'}
          </div>
        )}
      </motion.div>

      {/* the photo: flash, polaroid frame, then say it */}
      <AnimatePresence>
        {phase === 'photo' && !reduce && (
          <motion.div key="flash" className="pointer-events-none absolute inset-0 z-40 bg-white" initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 1, 0] }} transition={{ duration: 2, times: [0, 0.7, 0.75, 1] }} />
        )}
      </AnimatePresence>
      {(phase === 'say' || done) && (
        <div className="pointer-events-none absolute inset-x-[3%] bottom-[0%] top-[44%] z-30 rounded-[1.2vh] border-[1.4vh] border-b-[5vh] border-white shadow-[0_1.6vh_3vh_rgba(0,0,0,0.35)]" />
      )}
      {phase === 'say' && !done && (
        <div className="absolute inset-x-0 top-[14%] z-40 flex flex-col items-center gap-[1vh]">
          <div className={`${SKIN.panel} flex flex-wrap justify-center gap-x-[1.2vw] gap-y-[0.6vh] px-[1.6vw] py-[1vh] font-black ${SKIN.ink}`} style={{ fontSize: 'min(3vh,1.9vw)', maxWidth: '86%' }}>
            {order.map((idx, k) => (
              <span key={idx} className={k < said ? 'text-[#16A34A]' : k === said ? 'text-[#FE6A2F]' : 'opacity-30'}>{sentence(idx)}</span>
            ))}
          </div>
          <button type="button" onClick={sayNext} className={`${CLAY_BUTTON} px-8 py-2`} style={{ fontSize: 'min(3vh,1.9vw)' }}>
            🗣️ Say it: {order[said] !== undefined ? sentence(order[said]) : ''}
          </button>
        </div>
      )}

      <Bursts items={bursts} />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[3%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `📸 ${scene.title}`}
        </span>
      </div>
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
