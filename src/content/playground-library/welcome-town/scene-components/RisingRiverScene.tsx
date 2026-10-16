import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { QuestionCard, voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { CalmBg } from '../../unit1/scene-components/gameFx';

/* ---------- Rising River (Gimkit "The Floor is Lava", made cooperative and gentle — docs/a1-activity-library.md §12) ----------
 * The friends wait on a rock on one side of a river; home is on the other side. Every right answer lays one plank of
 * the bridge with a "thunk"; a wrong answer lets the water rise a little — the friends only get wet feet ("Splash!
 * Quick!"), nobody falls and the water never goes over the rock. When the last plank is down the friends walk across
 * and cheer. Mechanics: Gimkit The Floor is Lava (the whole class works together against a rising level), Blooket
 * Tower Defense. Better: cooperative (teacher + child are one team), visible progress (planks), gentle pressure. */

type River = Extract<Scene, { kind: 'rising-river' }>;

export function RisingRiverScene({ scene, onNext, onWin, onLose, sync }: { scene: River; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, planks: 0, rise: 0, wrong: -1, crossing: false, done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[round];
  const planks = Math.max(0, Math.min(total, Number(state.planks) || 0));
  const rise = Math.max(0, Math.min(4, Number(state.rise) || 0)); // max 4 steps: wet feet, never more
  const done = !!state.done;
  const gemDone = useRef(false);

  useEffect(() => {
    if (done || !r || state.crossing) return undefined;
    const t = window.setTimeout(() => cueSpeak(r.ask, voiceOf(scene.who)), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const answer = (c: number) => {
    if (!r || state.crossing || done) return;
    if (c !== r.answer) {
      sfx.wrong(); onLose();
      cueSpeak(rise >= 2 ? 'Splash! Wet feet! Quick, try again!' : 'Oh! The water is rising! Try again!', voiceOf(scene.who));
      setState((s) => ({ ...s, wrong: c, rise: Math.min(4, (Number(s.rise) || 0) + 1) }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.match(); sfx.click();
    cueSpeak(r.choices[c], 'teacher');
    const last = planks + 1 >= total;
    setState((s) => ({ ...s, planks: (Number(s.planks) || 0) + 1, wrong: -1, crossing: last, round: last ? s.round : (Number(s.round) || 0) + 1 }));
    if (last) window.setTimeout(() => setState((s) => ({ ...s, done: true })), 2800);
  };

  // river band: 46%-74% of the height; water level rises with `rise`
  const water = 46 - rise * 2.5;
  if (scene.look === 'tide') {
    return (
      <div className="absolute inset-0 select-none overflow-hidden">
        <TideStage scene={scene} planks={planks} total={total} rise={rise} crossing={!!state.crossing} done={done} reduce={!!reduce} />
        {!done && r && !state.crossing && (
          <QuestionCard className="absolute inset-x-[10%] bottom-[3%] z-40" ask={r.ask} choices={r.choices} img={r.img} wrong={Number(state.wrong)} onPick={answer} onHear={() => cueSpeak(r.ask, voiceOf(scene.who))} tone="sky" />
        )}
        {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
      </div>
    );
  }
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/10" />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🌊 ${scene.title}`}
        </span>
      </div>
      {!done && <span className="absolute right-3 top-[13%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-sky-700 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>🪵 {planks}/{total}</span>}
      {/* the river */}
      <motion.div className="absolute inset-x-0 z-10 overflow-hidden" animate={{ top: `${water}%`, bottom: '26%' }} transition={{ type: 'spring', stiffness: 60, damping: 12 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300/90 to-blue-600/90" />
        {!reduce && [0, 1, 2].map((k) => (
          <motion.div key={k} className="absolute h-[0.6vh] w-[30%] rounded-full bg-white/60" style={{ top: `${20 + k * 25}%` }}
            animate={{ left: ['-30%', '110%'] }} transition={{ duration: 5 + k, repeat: Infinity, ease: 'linear', delay: k * 1.2 }} />
        ))}
      </motion.div>
      {/* banks */}
      <div className="absolute bottom-[26%] left-0 z-10 h-[30%] w-[16%] rounded-tr-[6vh] bg-gradient-to-b from-stone-400 to-stone-600 shadow-xl" />
      <div className="absolute bottom-[26%] right-0 z-10 h-[30%] w-[14%] rounded-tl-[6vh] bg-gradient-to-b from-green-500 to-green-700 shadow-xl" />
      <div className="pointer-events-none absolute bottom-[56%] right-[5%] z-20 text-[min(7vh,5vw)]">🏠</div>
      {/* bridge planks */}
      <div className="absolute bottom-[50%] left-[16%] right-[14%] z-20 flex gap-[0.4vw]">
        {Array.from({ length: total }, (_, i) => (
          <motion.div key={i} className={`h-[min(4.5vh,3vw)] flex-1 rounded-[0.8vh] border-[0.3vh] ${i < planks ? 'border-amber-950 bg-gradient-to-b from-amber-500 to-amber-800 shadow-lg' : 'border-dashed border-white/70 bg-white/10'}`}
            animate={i < planks ? { y: [-40, 0], rotate: [-8, 0] } : { y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} />
        ))}
      </div>
      {/* the friends */}
      <motion.div className="absolute bottom-[54%] z-30 flex items-end" animate={{ left: state.crossing ? '74%' : '1%' }} transition={{ duration: 2.4, ease: 'easeInOut' }}>
        {scene.friends.map((f, i) => (
          <motion.img key={i} src={f} alt="" draggable={false} className="-ml-[1vw] h-[min(15vh,10vw)] object-contain drop-shadow-lg first:ml-0"
            animate={state.crossing && !reduce ? { y: [0, -10, 0] } : rise >= 2 && !reduce ? { y: [0, -4, 0] } : { y: 0 }} transition={{ duration: 0.4, repeat: state.crossing || rise >= 2 ? Infinity : 0, delay: i * 0.1 }} />
        ))}
        {rise >= 2 && !state.crossing && <span className="absolute -bottom-[2vh] left-1/2 -translate-x-1/2 text-[min(4vh,2.6vw)]">💦</span>}
      </motion.div>
      {!done && r && !state.crossing && (
        <QuestionCard className="absolute inset-x-[10%] bottom-[3%] z-40" ask={r.ask} choices={r.choices} img={r.img} wrong={Number(state.wrong)} onPick={answer} onHear={() => cueSpeak(r.ask, voiceOf(scene.who))} tone="sky" />
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}

/* ---------- The 'tide' look (owner 2026-10-16: "improve the design and the aesthetic of the game page") ----------
 * A drawn seaside in the Playground brand shades instead of a story picture with a band of water on it: a cream-to-sky
 * sky with a sun, soft clouds and two gliding seagulls; three layers of moving waves that come UP the posts when the
 * tide rises; a sand dune with shells where the friends wait; a real wooden pier on posts (tide marks painted on the
 * first post) whose planks drop in with a splash; the boat with a flag bobbing at the end. The story picture stays
 * only as a strongly calmed texture behind the sky. */
const SHELL = '/lep1/items/item-shell.png';
const STARFISH = '/lep1/items/item-starfish.png';
const PIER_L = 17; // % where the pier starts (end of the dune)
const PIER_R = 80; // % where the pier ends (the boat)
const DECK = 41; // % from the top: the pier deck

function Waves({ color, top, speed, amp, reduce, z }: { color: string; top: number; speed: number; amp: number; reduce: boolean; z: number }) {
  // a 200%-wide wave strip that slides left forever; the crest is an SVG path, the body a solid fill below it
  const path = `M0 ${amp} Q 12.5 0 25 ${amp} T 50 ${amp} T 75 ${amp} T 100 ${amp} T 125 ${amp} T 150 ${amp} T 175 ${amp} T 200 ${amp} V 40 H 0 Z`;
  const foam = `M0 ${amp} Q 12.5 0 25 ${amp} T 50 ${amp} T 75 ${amp} T 100 ${amp} T 125 ${amp} T 150 ${amp} T 175 ${amp} T 200 ${amp}`;
  return (
    <motion.div className="pointer-events-none absolute inset-x-0 bottom-0" style={{ zIndex: z }} animate={{ top: `${top}%` }} transition={{ type: 'spring', stiffness: 50, damping: 12 }}>
      <motion.svg viewBox="0 0 200 40" preserveAspectRatio="none" className="absolute left-0 top-0 h-[5vh] w-[200%]"
        animate={reduce ? undefined : { x: ['0%', '-50%'] }} transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}>
        <path d={path} fill={color} />
        <path d={foam} fill="none" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="2.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </motion.svg>
      <div className="absolute inset-x-0 bottom-0 top-[4.9vh]" style={{ background: `linear-gradient(${color}, ${color} 40%, #0369A1)` }} />
      {/* glints on the water */}
      {!reduce && [12, 38, 64, 86].map((l, k) => (
        <motion.span key={l} className="absolute h-[0.5vh] w-[3vw] rounded-full bg-white/70" style={{ left: `${l}%`, top: `${7 + (k % 2) * 4}vh` }}
          animate={{ opacity: [0, 0.9, 0], scaleX: [0.4, 1, 0.4] }} transition={{ duration: 2.4, repeat: Infinity, delay: k * 0.7 + speed / 10 }} />
      ))}
    </motion.div>
  );
}

function TideStage({ scene, planks, total, rise, crossing, done, reduce }: { scene: River; planks: number; total: number; rise: number; crossing: boolean; done: boolean; reduce: boolean }) {
  const sea = 55 - rise * 2.4; // the sea's top edge (% from the top): it comes up the posts with every miss (never over the deck)
  const slot = (PIER_R - PIER_L) / total;
  return (
    <>
      {/* sky: the story picture as a calm texture under a cream → sky blue gradient */}
      <CalmBg img={scene.bg} strength="strong" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#FEFBDD]/80 via-[#BAE6FD]/80 to-[#38BDF8]/70" />
      <style>{`@keyframes tide-splash-l { 0% { opacity: 1; transform: translate(0,0); } 60% { opacity: 1; transform: translate(-1.2vw,-3.5vh); } 100% { opacity: 0; transform: translate(-1.6vw,0.5vh); } }
        @keyframes tide-splash-r { 0% { opacity: 1; transform: translate(0,0); } 60% { opacity: 1; transform: translate(1.2vw,-3.5vh); } 100% { opacity: 0; transform: translate(1.6vw,0.5vh); } }
        @keyframes tide-sun-turn { to { transform: rotate(360deg); } }`}</style>
      {/* the sun: soft rays turning slowly behind a glowing disc */}
      <div className="absolute left-[calc(8%+min(7vh,4.5vw))] top-[calc(9%+min(7vh,4.5vw))] h-[min(30vh,19vw)] w-[min(30vh,19vw)] -translate-x-1/2 -translate-y-1/2">
        <div className="h-full w-full rounded-full opacity-60" style={{ background: 'repeating-conic-gradient(rgba(254,175,21,0.55) 0deg 8deg, transparent 8deg 22deg)', WebkitMaskImage: 'radial-gradient(circle, #000 25%, transparent 70%)', maskImage: 'radial-gradient(circle, #000 25%, transparent 70%)', animation: reduce ? undefined : 'tide-sun-turn 60s linear infinite' }} />
      </div>
      <div className="absolute left-[8%] top-[9%] h-[min(14vh,9vw)] w-[min(14vh,9vw)] rounded-full shadow-[0_0_6vh_2vh_rgba(254,175,21,0.55)]" style={{ background: 'radial-gradient(circle at 38% 35%, #FEF3C7 0, #FEAF15 55%, #FE6A2F 100%)' }} />
      {[{ l: 30, t: 12, w: 16, d: 40 }, { l: 62, t: 20, w: 12, d: 55 }].map((c, i) => (
        <motion.div key={i} className="absolute h-[5vh] rounded-full bg-white/90 shadow-[0_0.6vh_1vh_rgba(56,189,248,0.25)]" style={{ top: `${c.t}%`, width: `${c.w}%` }}
          animate={reduce ? { left: `${c.l}%` } : { left: [`${c.l}%`, `${c.l + 6}%`, `${c.l}%`] }} transition={{ duration: c.d, repeat: Infinity, ease: 'easeInOut' }}>
          <span className="absolute -top-[2.2vh] left-[22%] h-[5vh] w-[5vh] rounded-full bg-white/90" />
          <span className="absolute -top-[1.2vh] left-[48%] h-[3.6vh] w-[3.6vh] rounded-full bg-white/90" />
        </motion.div>
      ))}
      {[0, 1].map((k) => (
        <motion.svg key={k} viewBox="0 0 40 14" className="absolute w-[3.2vw] text-slate-600" style={{ top: `${24 + k * 6}%` }}
          animate={reduce ? { left: `${40 + k * 12}%` } : { left: ['-6%', '106%'], y: [0, -8, 0, 6, 0] }} transition={{ duration: 22 + k * 6, repeat: Infinity, ease: 'linear', delay: k * 7 }}>
          <path d="M2 10 Q 10 0 20 9 Q 30 0 38 10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </motion.svg>
      ))}
      {/* the far sea on the horizon */}
      <div className="absolute inset-x-0 top-[33%] h-[2.4vh] bg-gradient-to-b from-[#7DD3FC] to-[#38BDF8] opacity-80" />
      <div className="absolute inset-x-0 top-[33%] h-[0.3vh] bg-white/70" />

      {/* the title and the plank counter */}
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🌊 ${scene.title}`}
        </span>
      </div>
      {!done && (
        <span className="absolute right-3 top-[13%] z-30 flex items-center gap-2 rounded-full border-[0.3vh] border-[#FEAF15] bg-[#FEFBDD] px-4 py-1.5 font-black text-amber-800 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>
          <span className="inline-block h-[2.4vh] w-[4.4vh] rounded-[0.5vh] bg-[repeating-linear-gradient(90deg,#B45309_0_0.4vh,#D97706_0.4vh_1.2vh)] shadow-inner" />{planks}/{total}
        </span>
      )}

      {/* back wave (behind the posts) */}
      <Waves color="#7DD3FC" top={sea - 3} speed={14} amp={16} reduce={reduce} z={10} />

      {/* the pier: posts first (they stand in the sea), then the deck */}
      {Array.from({ length: total + 1 }, (_, i) => (
        <div key={`post-${i}`} className="absolute z-[11] w-[1.1vw] rounded-b-[0.4vw] bg-gradient-to-r from-[#92400E] via-[#B45309] to-[#78350F] shadow-md"
          style={{ left: `calc(${PIER_L + i * slot}% - 0.55vw)`, top: `${DECK + 2}%`, bottom: '0%' }}>
          {i === 0 && [0, 1, 2].map((m) => (
            /* tide marks: the child sees how high the water came */
            <span key={m} className="absolute inset-x-[-15%] h-[0.7vh] rounded-full bg-[#FE6A2F]" style={{ top: `${8 + m * 5}vh` }} />
          ))}
        </div>
      ))}
      <div className="absolute z-[12] h-[0.9vh] rounded-full bg-[#78350F]/70" style={{ left: `${PIER_L}%`, right: `${100 - PIER_R}%`, top: `calc(${DECK}% + 4.6vh)` }} />
      {Array.from({ length: total }, (_, i) => {
        const laid = i < planks;
        return (
          <div key={`plank-${i}`} className="absolute z-[13]" style={{ left: `calc(${PIER_L + i * slot}% + 0.2vw)`, width: `calc(${slot}% - 0.4vw)`, top: `${DECK}%`, height: '4.6vh' }}>
            {laid ? (
              <motion.div className="relative h-full w-full rounded-[0.8vh] border-[0.3vh] border-[#78350F] shadow-[0_0.8vh_0.8vh_rgba(120,53,15,0.35)]"
                style={{ background: 'repeating-linear-gradient(0deg, #D97706 0 0.9vh, #B45309 0.9vh 1.1vh), linear-gradient(#F59E0B, #B45309)' }}
                initial={reduce ? false : { y: -120, rotate: -10, opacity: 0 }} animate={{ y: 0, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 14 }}>
                <span className="absolute left-[8%] top-1/2 h-[0.8vh] w-[0.8vh] -translate-y-1/2 rounded-full bg-[#451A03]" />
                <span className="absolute right-[8%] top-1/2 h-[0.8vh] w-[0.8vh] -translate-y-1/2 rounded-full bg-[#451A03]" />
                {!reduce && i === planks - 1 && [0, 1, 2, 3].map((d) => (
                  /* the splash when the plank lands: drops fly up and fade away (CSS, ends invisible) */
                  <span key={d} className="absolute top-full h-[1.2vh] w-[1.2vh] rounded-full bg-white opacity-0"
                    style={{ left: `${20 + d * 20}%`, animation: `tide-splash-${d % 2 ? 'r' : 'l'} 0.75s ease-out 0.15s forwards` }} />
                ))}
              </motion.div>
            ) : (
              <div className="h-full w-full rounded-[0.8vh] border-[0.3vh] border-dashed border-white/80 bg-white/15" />
            )}
          </div>
        );
      })}

      {/* the dune where the friends wait (shells and a starfish in the sand) */}
      <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute left-0 z-[14] h-[56%] w-[22%]" style={{ top: `${DECK - 2.5}%` }}>
        <defs>
          <linearGradient id="tide-sand" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FEFBDD" /><stop offset="0.45" stopColor="#FDE68A" /><stop offset="1" stopColor="#F59E0B" /></linearGradient>
        </defs>
        <path d="M0 4 Q 40 -2 70 4 Q 88 8 100 20 L 100 60 L 0 60 Z" fill="url(#tide-sand)" />
        <path d="M6 14 q 6 -3 12 0 M 34 22 q 6 -3 12 0 M 60 12 q 5 -3 10 0" stroke="#D97706" strokeWidth="1" fill="none" opacity="0.6" />
      </svg>
      <img src={SHELL} alt="" draggable={false} className="pointer-events-none absolute left-[3%] z-[15] w-[3.4%] -rotate-12 drop-shadow" style={{ top: `${DECK + 6}%` }} />
      <img src={STARFISH} alt="" draggable={false} className="pointer-events-none absolute left-[11%] z-[15] w-[3.2%] rotate-12 drop-shadow" style={{ top: `${DECK + 8}%` }} />

      {/* the boat at the end of the pier */}
      {/* anchored by its keel to the waterline under the pier (outer box), bobbing inside it */}
      <div className="pointer-events-none absolute z-[16] w-[17%] -translate-y-full" style={{ left: `${PIER_R - 1}%`, top: `calc(${DECK}% + 6vh)` }}>
      <motion.div className="relative w-full"
        animate={reduce ? undefined : { y: [0, -7, 0], rotate: [-2.5, 2.5, -2.5] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}>
        <img src={scene.goalImg || '/magic-castle/stickers/boat.png'} alt="" draggable={false} className="w-full object-contain drop-shadow-xl" />
        <motion.span className="absolute left-[44%] top-[-6%] h-[3vh] w-[3.6vh] origin-left rounded-r-[0.6vh] bg-[#FE6A2F] shadow"
          animate={reduce ? undefined : { scaleX: [1, 0.8, 1], skewY: [0, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }} />
      </motion.div>
      </div>

      {/* the friends: they wait on the dune, hop when the water comes up, then walk the pier to the boat */}
      <motion.div className="absolute z-[17] flex items-end" style={{ top: `calc(${DECK}% - min(16vh,10.5vw) + 1.4vh)` }}
        animate={{ left: crossing || done ? `${PIER_R - 12}%` : '1%' }} transition={{ duration: 2.6, ease: 'easeInOut' }}>
        {scene.friends.map((f, i) => (
          <motion.img key={i} src={f} alt="" draggable={false} className="-ml-[0.8vw] h-[min(16vh,10.5vw)] object-contain drop-shadow-[0_0.8vh_0.6vh_rgba(0,0,0,0.25)] first:ml-0"
            animate={crossing && !reduce ? { y: [0, -12, 0] } : rise >= 2 && !reduce ? { y: [0, -5, 0] } : { y: 0 }}
            transition={{ duration: 0.45, repeat: crossing || rise >= 2 ? Infinity : 0, delay: i * 0.12 }} />
        ))}
        {rise >= 2 && !crossing && <span className="absolute -bottom-[2vh] left-1/2 -translate-x-1/2 text-[min(4vh,2.6vw)]">💦</span>}
      </motion.div>

      {/* front waves (in front of the posts and the dune's foot) */}
      <Waves color="#38BDF8" top={sea + 3} speed={10} amp={18} reduce={reduce} z={18} />
      <Waves color="#0EA5E9" top={sea + 9} speed={7} amp={14} reduce={reduce} z={19} />
      {rise >= 1 && !done && (
        <motion.span key={rise} className="absolute left-[34%] z-30 rounded-full bg-white/95 px-3 py-1 font-black text-sky-700 shadow" style={{ top: `${DECK - 9}%`, fontSize: 'min(2.4vh,1.6vw)' }}
          initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}>
          🌊 The tide is coming in!
        </motion.span>
      )}
    </>
  );
}
