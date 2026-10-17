import { type RefObject, useEffect, useRef, useState } from 'react';
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

/* ---------- Party Lift (A1 U1 L3, numbers 1-20 by listening — docs/a1-unit-1-welcome-town.md §5.3) ----------
 * The birthday party is on many floors of the Party Tower. A friend walks up to the lift and calls a floor: "Floor
 * fourteen, please!" The child presses that button on the brass panel (1-20). The friend steps in, the doors slide shut,
 * the floor dial above the door counts up floor by floor — the child counts along — and "Ding!" the friend has arrived.
 * In the last rounds the friend only SHOWS the number on a ticket and the child SAYS the floor ("Floor seventeen,
 * please!") before pressing. Tricky pairs (four / fourteen, six / sixteen, three / thirteen) are next to each other on
 * the panel, so the -TEEN ending decides.
 * Researched mechanics (docs/research/playground-a1u1l3-research.md): the TES "Elevator" floor-delivery listening game,
 * the toddler wall-panel "press the floor" game, NZ Maths teen/-ty listening bingo. Better: the number is heard, pressed,
 * then COUNTED on the dial (counting in context), the friend's trip is the reward, and the last rounds turn the child
 * into the caller (speaking).
 * Look: the Canva-painted Party Tower lobby (bg-a1u1-party-lift-wide.png) with its open lift; the sliding brass doors,
 * the glowing floor dial in the painted dial and the button panel are drawn on top of the picture's own box (useArtBox),
 * so they sit exactly in the painted door and dial at any screen size. */

type Lift = Extract<Scene, { kind: 'party-lift' }>;

// Measured on the painted lobby (1920 × 1080): the lift opening and the round floor dial above it.
const DOOR = { x: 33.9, y: 16.2, w: 28.9, h: 67.6 };
const DIAL = { x: 47.8, y: 8.3, d: 7.4 };
const BOX_ASPECT = 16 / 9;

/** The whole lobby must show (the dial at the top, the floor at the bottom), so the picture is fitted INSIDE the stage
 *  below the player's top bar; the margins show the same picture softly blurred. */
function useLobbyBox(ref: RefObject<HTMLDivElement>) {
  const [size, setSize] = useState({ w: 16, h: 9 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const read = () => setSize({ w: el.clientWidth || 16, h: el.clientHeight || 9 });
    read();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  const top = size.h * 0.08;
  const bw = Math.min(size.w, (size.h * 0.9) * BOX_ASPECT);
  const bh = bw / BOX_ASPECT;
  return { width: bw, height: bh, left: (size.w - bw) / 2, top: top + Math.max(0, (size.h * 0.9 - bh) / 2) } as const;
}

export function PartyLiftScene({ scene, onNext, onWin, onLose, sync }: { scene: Lift; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, phase: 'call', floor: 1, wrong: 0, stars: 0, done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[round];
  const phase = String(state.phase);
  const floor = Math.max(1, Math.min(20, Number(state.floor) || 1));
  const done = !!state.done;
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useLobbyBox(rootRef);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const timers = useRef<number[]>([]);
  const gemDone = useRef(false);
  const later = (ms: number, f: () => void) => { timers.current.push(window.setTimeout(f, ms)); };
  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)); }, []);

  const call = r ? `Floor ${numWord(r.floor)}, please!` : '';
  const sayMode = r?.mode === 'say';
  useEffect(() => {
    if (done || !r || phase !== 'call') return undefined;
    const t = window.setTimeout(() => cueSpeak(sayMode ? 'Your turn! Look at the ticket. Say the floor!' : call, sayMode ? voiceOf(scene.who) : voiceOf(r.guest)), round === 0 ? 900 : 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, phase, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const press = (n: number) => {
    if (!r || done || phase !== 'call') return;
    if (n !== r.floor) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, wrong: n }));
      cueSpeak(`Listen again! ${call}`, voiceOf(r.guest));
      later(700, () => setState((s) => ({ ...s, wrong: 0 })));
      return;
    }
    sfx.match();
    fire(84, 46, 'sparkle');
    // the friend steps in, the doors close, the dial counts up, ding
    setState((s) => ({ ...s, phase: 'board', wrong: 0 }));
    const start = floor;
    const steps = Math.abs(r.floor - start);
    const dir = r.floor >= start ? 1 : -1;
    later(1100, () => setState((s) => ({ ...s, phase: 'ride' })));
    for (let k = 1; k <= steps; k++) {
      later(1700 + k * 260, () => { sfx.pop(); setState((s) => ({ ...s, floor: start + dir * k })); });
    }
    const arrive = 1700 + steps * 260 + 400;
    later(arrive, () => {
      sfx.gem(); fire(DIAL.x, DIAL.y + 6, 'stars');
      setState((s) => ({ ...s, phase: 'ding', stars: (Number(s.stars) || 0) + 1 }));
      cueSpeak(`Ding! Floor ${numWord(r.floor)}! Thank you!`, voiceOf(r.guest));
    });
    later(arrive + 2200, () => setState((s) => {
      const nx = (Number(s.round) || 0) + 1;
      return nx >= total ? { ...s, phase: 'call', done: true } : { ...s, round: nx, phase: 'call' };
    }));
  };

  const doorsOpen = phase === 'call' || phase === 'ding' || done;
  const guestIn = phase === 'board' || phase === 'ride' || phase === 'ding';
  // 4 rows × 5: 1-5 / 6-10 / 11-15 / 16-20 — the tricky pairs sit right above each other (four / fourteen)
  const rows = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20]];
  return (
    <div ref={rootRef} className="absolute inset-0 select-none overflow-hidden bg-[#FDE7C2]">
      <CalmBg img={scene.bg} strength="strong" />
      <motion.div className="absolute overflow-hidden rounded-[1.6vh] shadow-[0_1vh_3vh_rgba(60,30,10,0.35)]" style={box} animate={shakeCtl}>
        <img src={scene.bg} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />

        {/* the friend riding: inside the lift car, behind the doors */}
        <AnimatePresence>
          {r && guestIn && (
            <motion.img key={`in-${round}`} src={r.img} alt="" draggable={false} className="pointer-events-none absolute z-[4] object-contain drop-shadow-xl"
              style={{ left: `${DOOR.x + DOOR.w * 0.22}%`, width: `${DOOR.w * 0.56}%`, bottom: `${100 - DOOR.y - DOOR.h + 1}%`, height: `${DOOR.h * 0.72}%` }}
              initial={{ opacity: 0, x: '-60%' }} animate={{ opacity: 1, x: 0, y: phase === 'ding' && !reduce ? [0, -14, 0] : 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }} />
          )}
        </AnimatePresence>

        {/* the sliding brass doors: they slide into the wall (clipped to the painted opening) */}
        <div className="pointer-events-none absolute z-[6] overflow-hidden" style={{ left: `${DOOR.x}%`, top: `${DOOR.y}%`, width: `${DOOR.w}%`, height: `${DOOR.h}%` }}>
        {[0, 1].map((side) => (
          <motion.div key={side} className="pointer-events-none absolute top-0 h-full w-1/2 overflow-hidden"
            style={{ left: side ? '50%' : '0%',
              background: 'linear-gradient(90deg, #A8741F 0%, #E9C36A 18%, #FBE3A0 38%, #E2B451 62%, #B98329 100%)',
              boxShadow: side ? 'inset 0.4vh 0 0 rgba(90,55,10,0.55)' : 'inset -0.4vh 0 0 rgba(90,55,10,0.55)' }}
            animate={{ x: doorsOpen ? (side ? '100%' : '-100%') : '0%' }} transition={{ type: 'spring', stiffness: 120, damping: 18 }}>
            {/* brushed lines and a party star on each door */}
            {[22, 44, 66].map((p) => <span key={p} className="absolute inset-y-[4%] w-[1px] bg-white/35" style={{ left: `${p}%` }} />)}
            <span className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 text-[min(5vh,3vw)] opacity-70">⭐</span>
          </motion.div>
        ))}
        </div>

        {/* the floor dial: a glowing number inside the painted round dial */}
        <div className="pointer-events-none absolute z-[7] flex items-center justify-center rounded-full border-[0.35vh] border-[#8A5A12] bg-[#2A1A05] shadow-[inset_0_0_1.4vh_rgba(0,0,0,0.8)]"
          style={{ left: `${DIAL.x - DIAL.d / 2}%`, top: `${DIAL.y - DIAL.d * 0.88}%`, width: `${DIAL.d}%`, aspectRatio: '1' }}>
          <motion.span key={floor} className="font-black text-[#FFB347]" style={{ fontSize: 'min(5vh, 3.2vw)', textShadow: '0 0 1.2vh #FE6A2F' }}
            initial={reduce ? false : { y: -8, opacity: 0.2 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.18 }}>
            {floor}
          </motion.span>
        </div>
        {phase === 'ride' && !reduce && (
          <motion.span className="pointer-events-none absolute z-[7] font-black text-[#FE6A2F]" style={{ left: `${DIAL.x + DIAL.d * 0.62}%`, top: `${DIAL.y - 3}%`, fontSize: 'min(4vh,2.6vw)' }}
            animate={{ y: [0, -8, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>▲</motion.span>
        )}

        {/* the friend waiting in the lobby, calling the floor */}
        <AnimatePresence>
          {r && phase === 'call' && !done && (
            <motion.div key={`wait-${round}`} className="absolute z-[8] flex flex-col items-center" style={{ left: '9%', width: '19%', bottom: '6%' }}
              initial={reduce ? false : { x: '-120%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '80%', opacity: 0 }} transition={{ type: 'spring', stiffness: 110, damping: 16 }}>
              <motion.button type="button" onClick={() => { sfx.click(); cueSpeak(sayMode ? numWord(r.floor) : call, voiceOf(r.guest)); }}
                className={`${SKIN.panel} relative mb-[1.2vh] px-[1.4vw] py-[0.8vh] font-black ${SKIN.ink}`} style={{ fontSize: 'min(3vh, 1.9vw)' }}
                animate={reduce ? undefined : { y: [0, -4, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
                {sayMode ? (
                  <span className="flex items-center gap-[0.6vw]">🎫 <span className="rounded-[1vh] bg-[#FE6A2F] px-[0.8vw] text-white" style={{ fontSize: 'min(4.4vh, 2.8vw)' }}>{r.floor}</span></span>
                ) : <>🔊 Floor … please!</>}
                <span className="absolute -bottom-[1.2vh] left-1/2 h-[1.4vh] w-[1.4vh] -translate-x-1/2 rotate-45 bg-[#FEFBDD]" />
              </motion.button>
              <motion.img src={r.img} alt="" draggable={false} className="w-full object-contain drop-shadow-[0_1vh_1vh_rgba(0,0,0,0.25)]"
                animate={reduce ? undefined : { y: [0, -6, 0], rotate: [-1.5, 1.5, -1.5] }} transition={{ duration: 1.4, repeat: Infinity }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* "Ding!" — the arrival card */}
        <AnimatePresence>
          {r && phase === 'ding' && (
            <motion.div key={`ding-${round}`} className={`${SKIN.panel} absolute z-[9] flex items-center gap-[0.8vw] px-[1.4vw] py-[1vh] font-black ${SKIN.ink}`}
              style={{ left: `${DOOR.x + DOOR.w / 2}%`, top: `${DOOR.y + 4}%`, x: '-50%', fontSize: 'min(3.4vh, 2.2vw)' }}
              initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 14 }}>
              🔔 Ding! <span className="text-[#FE6A2F]">{r.floor}</span> {numWord(r.floor)}!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* the button panel (brass plate, 1-20) */}
      {!done && (
        <div className="absolute right-[2.5%] top-1/2 z-20 -translate-y-1/2 rounded-[2.4vh] border-[0.5vh] border-[#8A5A12] p-[1.4vh] shadow-[0_1.6vh_3vh_rgba(60,30,10,0.45)]"
          style={{ background: 'linear-gradient(160deg, #FBE3A0, #E2B451 45%, #B98329)' }}>
          <div className="mb-[1vh] text-center font-black text-[#5B3A0A]" style={{ fontSize: 'min(2.4vh, 1.5vw)' }}>🎈 Party Tower</div>
          <div className="grid grid-cols-5 gap-[1vh]">
            {rows.flat().map((n) => {
              const lit = (phase !== 'call' && r?.floor === n) || Number(state.wrong) === n;
              return (
                <motion.button key={n} type="button" onClick={() => press(n)} whileTap={{ scale: 0.86 }}
                  animate={Number(state.wrong) === n ? { x: [0, -5, 5, -3, 0] } : {}}
                  className="flex aspect-square w-[min(7.2vh,4.4vw)] items-center justify-center rounded-full border-[0.35vh] font-black shadow-[inset_0_-0.5vh_0_rgba(0,0,0,0.25),0_0.5vh_0.8vh_rgba(0,0,0,0.3)]"
                  style={{
                    fontSize: 'min(3vh, 1.9vw)',
                    borderColor: '#7A4E0E',
                    color: lit ? '#fff' : '#3B2410',
                    background: Number(state.wrong) === n ? 'radial-gradient(circle at 35% 30%, #FDA4AF, #E11D48)'
                      : lit ? 'radial-gradient(circle at 35% 30%, #FFD38A, #FE6A2F)' : 'radial-gradient(circle at 35% 30%, #FFFDF2, #F3DDA6)',
                    boxShadow: lit && Number(state.wrong) !== n ? '0 0 2vh #FE6A2F, inset 0 -0.5vh 0 rgba(0,0,0,0.25)' : undefined,
                  }}>
                  {n}
                </motion.button>
              );
            })}
          </div>
          <div className="mt-[1vh] flex justify-center gap-[0.6vw]">
            {scene.rounds.map((_, i) => (
              <span key={i} className="text-[min(2.4vh,1.5vw)]" style={{ opacity: i < (Number(state.stars) || 0) ? 1 : 0.25 }}>⭐</span>
            ))}
          </div>
        </div>
      )}

      <Bursts items={bursts} />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute start-[2%] top-[3%] z-30 max-w-[38%]">
        <span className="font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🛗 ${scene.title}`}
        </span>
      </div>
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
