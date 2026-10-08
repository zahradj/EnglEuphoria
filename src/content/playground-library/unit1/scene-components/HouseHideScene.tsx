import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin, useArtBox } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Where's Pip? (Pre-A1 Unit 6 Lesson 1 signature game) ----------
 * Hide and seek in a dollhouse. The lights are off in every room; Pip calls
 * from his hiding place — "I'm in the kitchen! Find me!" — and the child taps
 * that room: the light clicks on, Pip pops up from behind the furniture and
 * the child answers on the microphone ("In the kitchen!"). A wrong room lights
 * up empty and is named back ("No, that's the bathroom!"), then goes dark
 * again; the right room glows after two tries. Researched: the hide-and-seek
 * house of Lingokids / Toca-style dollhouse play (explore the rooms), Khan
 * Academy Kids "find it" listening, Cambridge Pre A1 "listen and point" on a
 * picture of a house. Better: the room word is the only way to find Pip (no
 * guessing by picture alone — every room is dark), the answer is said as a
 * whole phrase, and a wrong tap teaches the name of the room it opened. */

type Hide = Extract<Scene, { kind: 'house-hide' }>;
export const houseWrongLine = (name: string) => `No, that's the ${name}! Try again!`;
export const HOUSE_FOUND = 'You found me!';

export function HouseHideScene({ scene, onWin, onNext, sync }: { scene: Hide; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, found: false, gemDone: false });
  const { round, found, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useArtBox(rootRef, scene.aspect ?? 1376 / 768);
  const [misses, setMisses] = useState(0);
  const [peek, setPeek] = useState(-1);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    setPeek(-1);
    if (!r || found) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const look = async (i: number) => {
    const room = scene.rooms[i];
    if (!r || !room || found || busy.current) return;
    busy.current = true;
    sfx.pop();
    if (i !== r.room) {
      setPeek(i); shake();
      setMisses((m) => m + 1);
      await sayWithin(houseWrongLine(room.name), scene.who, 2600);
      setPeek(-1);
      busy.current = false;
      return;
    }
    window.setTimeout(() => { sfx.match(); fire(room.x + room.w / 2, room.y + room.h / 2, 'stars'); }, 300);
    setState((s) => ({ ...s, found: true }));
    await sayWithin(HOUSE_FOUND, scene.who, 2000);
    await sayWithin(r.reply, scene.who, 3200);
    busy.current = false;
  };

  /** The child said where Pip was — next round. */
  const said = () => {
    if (!r || !found || busy.current) return;
    sfx.pop();
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 50, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, found: false, gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4500);
  };

  const glow = r && !found && misses >= 2 ? r.room : -1;

  return (
    <motion.div ref={rootRef} className="absolute inset-0 select-none overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-lime-200" animate={shakeCtl}>
      {done && <Confetti count={60} />}

      <div className="absolute" style={box}>
        <img src={scene.bg} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
        {scene.rooms.map((room, i) => {
          const lit = done || peek === i || (found && r?.room === i);
          const here = !!r && found && r.room === i;
          return (
            <button key={i} onClick={() => { void look(i); }} aria-label={`The ${room.name}`} disabled={found || done}
              className="absolute z-10 overflow-hidden" style={{ left: `${room.x}%`, top: `${room.y}%`, width: `${room.w}%`, height: `${room.h}%` }}>
              {/* Lights off: a dark night-blue cover that fades when the light clicks on. */}
              <motion.span className="pointer-events-none absolute inset-0 bg-[#141a3a]" initial={false}
                animate={{ opacity: lit ? 0 : 0.72 }} transition={{ duration: lit ? 0.25 : 0.5 }} />
              {!lit && <span className="pointer-events-none absolute right-[6%] top-[6%] text-[min(4vh,2.6vw)] opacity-80">{'\u{1F4A1}'}</span>}
              {glow === i && <span className="pointer-events-none absolute inset-0 animate-pulse rounded-lg ring-[6px] ring-inset ring-yellow-300" />}
              <AnimatePresence>
                {here && (
                  <motion.img key={`pip-${round}`} src={scene.hider.img} alt={scene.hider.label} draggable={false}
                    className="pointer-events-none absolute bottom-[4%] h-[62%] w-auto drop-shadow-[0_6px_8px_rgba(0,0,0,0.35)]"
                    style={{ left: `${r?.at ?? 50}%`, x: '-50%' }}
                    initial={{ y: '60%', scale: 0.6, opacity: 0 }} animate={{ y: ['60%', '-12%', '0%'], scale: [0.6, 1.08, 1], opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.6, ease: 'easeOut' }} />
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(3.4*var(--svw,1vw)), 5.6vh), 2.8rem)' }}>
          {r ? (found ? r.reply : `\u{1F648} ${r.line}`) : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>{'\u{1F4A1}'}</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(found ? r.reply : r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">{'\u{1F50A}'}</button>}

      {r && found && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex flex-col items-center gap-2" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, type: 'spring' }}>
          <span className="rounded-full bg-white/90 px-4 py-1 text-base font-black text-sky-700 shadow">{'\u{1F64B}'} Your turn! Say it:</span>
          <button onClick={said} className={`${CLAY_BUTTON} px-8 py-3 text-2xl`}>{'\u{1F3A4}'} {r.say}</button>
        </motion.div>
      )}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next {'⭐'}</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function houseHideLines(scene: Hide) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...scene.rooms.map((room) => [scene.who, houseWrongLine(room.name)]),
    [scene.who, HOUSE_FOUND],
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
