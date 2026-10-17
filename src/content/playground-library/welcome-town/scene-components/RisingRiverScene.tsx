import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { QuestionCard, voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS, useArtBox } from '../../unit1/scene-components/shared';
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
          <QuestionCard className="absolute inset-x-[18%] top-[13%] z-40" ask={r.ask} choices={r.choices} img={r.img} wrong={Number(state.wrong)} onPick={answer} onHear={() => cueSpeak(r.ask, voiceOf(scene.who))} tone="sky" />
        )}
        {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
      </div>
    );
  }
  return (
    <div className="absolute inset-0 select-none overflow-hidden">
      {/* the river and the friends float over a story picture: calm it so they are the clearest things on screen */}
      <CalmBg img={scene.bg} />
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

/* ---------- The 'tide' look (owner 2026-10-16: "Animation looks very flat, so use Canva to generate well animated
 * illustrations") ----------
 * Scenario: docs/scenarios/a1u6-rising-tide-game.md. Every piece is painted in Canva in the Playground brand shades:
 * the seaside background (bg-a1u6-tide-wide.png: dune with shells, sea, sky, sun), the painted pier cut from the Canva
 * pier scene in five sections (tide-pier-1..5.png), and cut-out stickers for the sailboat, a seagull and a band of foamy
 * waves. The sea ripples in place (a 16-frame loop of the same painted sea), a right answer drops the next pier section
 * with a splash, a miss rolls the wave band up the posts, the boat floats up with it, gulls glide, the friends hop and
 * finally walk the pier. The background picture itself never moves (no zoom, no pan). Positions are % of the picture's
 * own box (useArtBox), so every piece sits on the painted sea and dune at any screen size. */
const TIDE_BG = '/lep1/scenes/bg-a1u6-tide-wide.png';
const TIDE = (n: string) => `/lep1/stickers/tide-${n}.png`;
const TIDE_GULL = '/lep1/gifs/a1u6-tide-gull.webp';
/** The sea of the background, gently rippling (frames of the same painted sea, each row nudged a few pixels: the
 *  frame never moves, only the water inside it). Covers the picture from the horizon down. */
const TIDE_SEA = { src: '/lep1/gifs/a1u6-tide-sea.webp', top: (376 / 768) * 100 };
/** The painted pier (Canva pier scene, cut out along its own outline) in five sections, near to far. Each right
 *  answer lays the next one. Box = % of the background picture. */
const PIER_SECTIONS = [
  { x: 5.89, y: 53.2, w: 32.66, h: 25.95 },
  { x: 38.54, y: 50.79, w: 15.62, h: 24.37 },
  { x: 54.17, y: 50.23, w: 8.33, h: 22.34 },
  { x: 62.5, y: 49.68, w: 11.67, h: 20.11 },
  { x: 74.17, y: 49.49, w: 11.88, h: 16.03 },
];
const BOX_ASPECT = 1376 / 768;
/** The water line along the pier slopes up into the distance (76 % at the near end, 65 % at the far end). */
const WATER_NEAR = 76;
const WATER_TILT = -5.6; // degrees

/** A band of painted waves, two copies side by side, sliding forever (the strip moves, not the picture). */
function WaveBand({ top, height, speed, dir, opacity, z, reduce }: { top: number; height: number; speed: number; dir: 1 | -1; opacity: number; z: number; reduce: boolean }) {
  return (
    <motion.div className="pointer-events-none absolute right-[-6%] origin-left overflow-hidden" style={{ zIndex: z, height: `${height}%`, left: '8%', rotate: WATER_TILT, WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%)', maskImage: 'linear-gradient(90deg, transparent, #000 8%)' }}
      animate={{ top: `${top}%`, opacity }} transition={{ type: 'spring', stiffness: 50, damping: 12 }}>
      <motion.div className="flex h-full w-[200%]" animate={reduce ? undefined : { x: dir > 0 ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}>
        <img src={TIDE('waves')} alt="" draggable={false} className="h-full w-1/2 object-fill" />
        <img src={TIDE('waves')} alt="" draggable={false} className="h-full w-1/2 object-fill" />
      </motion.div>
    </motion.div>
  );
}

function TideStage({ scene, planks, total, rise, crossing, done, reduce }: { scene: River; planks: number; total: number; rise: number; crossing: boolean; done: boolean; reduce: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useArtBox(rootRef, BOX_ASPECT);
  const tide = WATER_NEAR - 1 - Math.min(rise, 3) * 1.8; // the incoming tide's top: it climbs the posts with every miss (never over the deck)
  const laid = Math.round((planks / Math.max(1, total)) * PIER_SECTIONS.length);
  const boatSea = 66 - rise * 1.6; // the boat floats up with the tide
  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#7DD3FC] via-[#38BDF8] to-[#0EA5E9]">
      <style>{`@keyframes tide-splash-l { 0% { opacity: 1; transform: translate(0,0); } 60% { opacity: 1; transform: translate(-1.2vw,-3.5vh); } 100% { opacity: 0; transform: translate(-1.6vw,0.5vh); } }
        @keyframes tide-splash-r { 0% { opacity: 1; transform: translate(0,0); } 60% { opacity: 1; transform: translate(1.2vw,-3.5vh); } 100% { opacity: 0; transform: translate(1.6vw,0.5vh); } }`}</style>
      <div className="absolute" style={box}>
        {/* the painted seaside (Canva): never moves */}
        <img src={TIDE_BG} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
        {/* the same painted sea, rippling in place (the sand and sky stay still) */}
        {!reduce && <img src={TIDE_SEA.src} alt="" draggable={false} className="pointer-events-none absolute inset-x-0 bottom-0 w-full" style={{ top: `${TIDE_SEA.top}%`, height: `${100 - TIDE_SEA.top}%` }} />}

        {/* seagulls glide across the sky, gently rising and dipping */}
        {/* the gull flaps: two Canva frames (wings up / wings down) as an animated cut-out WebP */}
        {[{ t: 12, w: 4.6, d: 26, delay: 0, flip: false }, { t: 22, w: 3.4, d: 34, delay: 9, flip: false }].map((g, k) => (
          <motion.img key={k} src={TIDE_GULL} alt="" draggable={false} className="pointer-events-none absolute z-[5] drop-shadow-md"
            style={{ top: `${g.t}%`, width: `${g.w}%`, transform: g.flip ? 'scaleX(-1)' : undefined }}
            initial={{ left: '-8%' }}
            animate={reduce ? { left: `${30 + k * 30}%` } : { left: ['-8%', '108%'], y: [0, -12, 4, -8, 0], rotate: [-4, 3, -2, 4, -4] }}
            transition={{ duration: g.d, repeat: Infinity, ease: 'linear', delay: g.delay }} />
        ))}

        {/* the painted pier, far sections first so the near ones overlap them. A section still to build waits as a
            pale ghost; a right answer drops it in with a bounce and a splash */}
        {PIER_SECTIONS.map((sec, i) => ({ sec, i })).reverse().map(({ sec, i }) => {
          const built = i < laid;
          return (
            <div key={`pier-${i}`} className="pointer-events-none absolute" style={{ left: `${sec.x}%`, top: `${sec.y}%`, width: `${sec.w}%`, height: `${sec.h}%`, zIndex: 13 - i }}>
              {built ? (
                <motion.div className="relative h-full w-full" initial={reduce ? false : { y: '-70%', rotate: -6, opacity: 0 }} animate={{ y: 0, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 13 }}>
                  <img src={TIDE(`pier-${i + 1}`)} alt="" draggable={false} className="h-full w-full drop-shadow-[0_0.8vh_0.6vh_rgba(120,53,15,0.3)]" />
                  {!reduce && i === laid - 1 && [0, 1, 2, 3].map((d) => (
                    <span key={d} className="absolute bottom-[4%] h-[1.4vh] w-[1.4vh] rounded-full bg-white opacity-0"
                      style={{ left: `${18 + d * 20}%`, animation: `tide-splash-${d % 2 ? 'r' : 'l'} 0.75s ease-out 0.2s forwards` }} />
                  ))}
                </motion.div>
              ) : (
                <img src={TIDE(`pier-${i + 1}`)} alt="" draggable={false} className="h-full w-full opacity-35" style={{ filter: 'brightness(2.2) saturate(0)' }} />
              )}
            </div>
          );
        })}

        {/* the sailboat at the end of the pier, rocking on the water */}
        <motion.div className="pointer-events-none absolute z-[14] w-[13%] -translate-y-full" style={{ left: '84%' }} animate={{ top: `${boatSea}%` }} transition={{ type: 'spring', stiffness: 50, damping: 12 }}>
          <motion.img src={scene.goalImg || TIDE('boat')} alt="" draggable={false} className="w-full origin-bottom drop-shadow-xl"
            animate={reduce ? undefined : { y: [0, -8, 0], rotate: [-3, 3, -3] }} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }} />
        </motion.div>

        {/* the friends: they wait on the dune, hop when the water comes up, then walk the pier to the boat */}
        <motion.div className="absolute z-[15] flex origin-bottom items-end" style={{ height: '18%' }}
          initial={false}
          animate={crossing || done ? { left: '63%', top: '38%', scale: 0.72 } : { left: '1%', top: '47%', scale: 1 }} transition={{ duration: 2.6, ease: 'easeInOut' }}>
          {scene.friends.map((f, i) => (
            <motion.img key={i} src={f} alt="" draggable={false} className="-ml-[1%] h-full object-contain drop-shadow-[0_0.8vh_0.6vh_rgba(0,0,0,0.25)] first:ml-0"
              animate={crossing && !reduce ? { y: [0, -12, 0] } : rise >= 2 && !reduce ? { y: [0, -5, 0] } : { y: 0 }}
              transition={{ duration: 0.45, repeat: crossing || rise >= 2 ? Infinity : 0, delay: i * 0.12 }} />
          ))}
          {rise >= 2 && !crossing && <span className="absolute -bottom-[2vh] left-1/2 -translate-x-1/2 text-[min(4vh,2.6vw)]">💦</span>}
        </motion.div>

        {/* front wave band (in front of the posts), rolling the other way */}
        {/* the incoming tide: a band of painted waves along the water line, rolling and climbing the posts with every miss */}
        <WaveBand top={tide} height={8} speed={14} dir={-1} opacity={rise > 0 ? 1 : 0} z={16} reduce={reduce} />
      </div>

      {/* the title, the plank counter and the tide bubble */}
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🌊 ${scene.title}`}
        </span>
      </div>
      {!done && (
        <span className="absolute right-3 top-[13%] z-30 flex items-center gap-2 rounded-full border-[0.3vh] border-[#FEAF15] bg-[#FEFBDD] px-3 py-1 font-black text-amber-800 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>
          <img src={TIDE('plank')} alt="" className="h-[2.4vh] w-auto" />{planks}/{total}
        </span>
      )}
      {rise >= 1 && !done && (
        <motion.span key={rise} className="absolute bottom-[7%] left-1/2 z-30 -translate-x-1/2 rounded-full bg-white/95 px-3 py-1 font-black text-sky-700 shadow" style={{ fontSize: 'min(2.4vh,1.6vw)' }}
          initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}>
          🌊 The tide is coming in!
        </motion.span>
      )}
    </div>
  );
}
