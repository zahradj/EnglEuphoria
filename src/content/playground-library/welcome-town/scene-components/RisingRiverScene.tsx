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
  const tide = scene.look === 'tide';
  return (
    <div className={`absolute inset-0 select-none overflow-hidden ${tide ? '' : 'bg-cover bg-center'}`} style={tide ? undefined : { backgroundImage: `url(${scene.bg})` }}>
      {/* Tide: the beach picture is calmed so the pier, the sea and the boat are the clearest things on screen. */}
      {tide && <CalmBg img={scene.bg} />}
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
        <div className={`absolute inset-0 bg-gradient-to-b ${tide ? 'from-cyan-200/90 via-[#38BDF8]/90 to-sky-700/90' : 'from-sky-300/90 to-blue-600/90'}`} />
        {/* the tide's foam edge */}
        {tide && <div className="absolute inset-x-0 top-0 h-[1.4vh] bg-[radial-gradient(circle_at_1vh_0,#fff_0.9vh,transparent_1vh)] bg-[length:2vh_1.4vh] opacity-90" />}
        {!reduce && [0, 1, 2].map((k) => (
          <motion.div key={k} className="absolute h-[0.6vh] w-[30%] rounded-full bg-white/60" style={{ top: `${20 + k * 25}%` }}
            animate={{ left: ['-30%', '110%'] }} transition={{ duration: 5 + k, repeat: Infinity, ease: 'linear', delay: k * 1.2 }} />
        ))}
      </motion.div>
      {/* banks */}
      <div className={`absolute bottom-[26%] left-0 z-10 h-[30%] w-[16%] rounded-tr-[6vh] bg-gradient-to-b shadow-xl ${tide ? 'from-[#FEFBDD] via-amber-200 to-amber-400' : 'from-stone-400 to-stone-600'}`} />
      {tide ? (
        /* the boat waits at the end of the pier, bobbing on the waves */
        <motion.img src={scene.goalImg || '/magic-castle/stickers/boat.png'} alt="" draggable={false}
          className="pointer-events-none absolute bottom-[44%] right-[1%] z-20 w-[16%] object-contain drop-shadow-xl"
          animate={reduce ? undefined : { y: [0, -6, 0], rotate: [-2, 2, -2] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
      ) : (
        <>
          <div className="absolute bottom-[26%] right-0 z-10 h-[30%] w-[14%] rounded-tl-[6vh] bg-gradient-to-b from-green-500 to-green-700 shadow-xl" />
          <div className="pointer-events-none absolute bottom-[56%] right-[5%] z-20 text-[min(7vh,5vw)]">🏠</div>
        </>
      )}
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
