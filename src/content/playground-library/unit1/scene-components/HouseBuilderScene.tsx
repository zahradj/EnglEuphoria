import { useEffect, useRef, useState } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin, useArtBox } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- House Builder (Pre-A1 Unit 6 Lesson 3 signature game) ----------
 * The house is empty. Pip asks for one thing in one room — "Put the bed in
 * the bedroom!" — and the child does it in two steps: tap the bed on the
 * tray, then tap the bedroom. The bed flies into place and stays; the child
 * says the whole sentence ("The bed is in the bedroom!"). Room by room the
 * child furnishes the whole house. Researched: Toca Boca / Lingokids "build
 * and decorate a house" play, Cambridge Pre A1 Starters "listen and draw a
 * line" (put the thing in the right place), Khan Academy Kids calm listening.
 * Better: one sentence carries TWO words the child must understand (the
 * thing AND the room), a wrong pick is named back ("No, that's the sofa!" /
 * "No, that's the kitchen!"), the right one glows after two tries, no clock,
 * and the furnished house is the child's own work at the end. */

type Builder = Extract<Scene, { kind: 'house-builder' }>;
export const builderWrongThing = (name: string) => `No, that's the ${name}! Try again!`;
export const builderWrongRoom = (name: string) => `No, that's the ${name}! Try again!`;
export const BUILDER_WHERE = 'Which room?';

export function HouseBuilderScene({ scene, onWin, onNext, sync }: { scene: Builder; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, picked: -1, placed: [] as number[], landed: false, gemDone: false });
  const { round, picked, placed, landed, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useArtBox(rootRef, scene.aspect ?? 1376 / 768);
  const [thingMisses, setThingMisses] = useState(0);
  const [roomMisses, setRoomMisses] = useState(0);
  const [wrongThing, setWrongThing] = useState(-1);
  const [wrongRoom, setWrongRoom] = useState(-1);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    busy.current = false;
    setThingMisses(0); setRoomMisses(0);
    if (!r || landed) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  /** Step 1: pick the thing on the tray. */
  const pickThing = async (i: number) => {
    const p = scene.pieces[i];
    if (!r || !p || landed || busy.current || placed.includes(i)) return;
    busy.current = true;
    if (i !== r.piece) {
      sfx.wrong(); shake(); setWrongThing(i);
      setThingMisses((m) => m + 1);
      await sayWithin(builderWrongThing(p.name), scene.who, 2600);
      setWrongThing(-1);
      busy.current = false;
      return;
    }
    sfx.pop();
    setState((s) => ({ ...s, picked: i }));
    await sayWithin(BUILDER_WHERE, scene.who, 1600);
    busy.current = false;
  };

  /** Step 2: tap the room it goes in. */
  const pickRoom = async (k: number) => {
    const room = scene.rooms[k];
    if (!r || !room || landed || picked !== r.piece || busy.current) return;
    busy.current = true;
    if (k !== r.room) {
      sfx.wrong(); shake(); setWrongRoom(k);
      setRoomMisses((m) => m + 1);
      await sayWithin(builderWrongRoom(room.name), scene.who, 2600);
      setWrongRoom(-1);
      busy.current = false;
      return;
    }
    sfx.pop();
    setState((s) => ({ ...s, placed: [...s.placed, r.piece], picked: -1, landed: true }));
    window.setTimeout(() => { sfx.match(); fire(r.x, r.y, 'stars'); }, 650);
    await sayWithin(r.reply, scene.who, 3200);
    busy.current = false;
  };

  /** The child said the sentence — next one. */
  const said = () => {
    if (!r || !landed || busy.current) return;
    sfx.pop();
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 45, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, landed: false, picked: -1, gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4500);
  };

  const thingGlow = r && !landed && picked < 0 && thingMisses >= 2 ? r.piece : -1;
  const roomGlow = r && !landed && picked >= 0 && roomMisses >= 2 ? r.room : -1;
  const waiting = scene.pieces.map((_, i) => i).filter((i) => !placed.includes(i));
  // Where a placed piece stands: the round that brought it in.
  const spotOf = (i: number) => scene.rounds.find((q) => q.piece === i);
  // Below the house when the screen has room (portrait), else along the bottom edge.
  const rootH = rootRef.current?.clientHeight ?? 0;
  const below = rootH > 0 && box.top + box.height + 150 < rootH;
  const trayStyle = below ? { top: box.top + box.height + 10 } : { bottom: '3%' };

  return (
    <motion.div ref={rootRef} className="absolute inset-0 select-none overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-lime-200" animate={shakeCtl}>
      {done && <Confetti count={70} />}
      <LayoutGroup>
        <div className="absolute" style={box}>
          <img src={scene.bg} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
          {scene.rooms.map((room, k) => (
            <button key={k} onClick={() => { void pickRoom(k); }} aria-label={`The ${room.name}`} disabled={landed || picked < 0}
              className={`absolute z-10 rounded-xl transition ${picked >= 0 && !landed ? 'ring-4 ring-inset ring-white/70 hover:bg-white/20' : ''} ${roomGlow === k ? 'animate-pulse bg-yellow-200/40 ring-[6px] ring-yellow-300' : ''} ${wrongRoom === k ? 'bg-red-300/40' : ''}`}
              style={{ left: `${room.x}%`, top: `${room.y}%`, width: `${room.w}%`, height: `${room.h}%` }} />
          ))}
          {placed.map((i) => {
            const p = scene.pieces[i];
            const q = spotOf(i);
            if (!p || !q) return null;
            return (
              <div key={i} className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${q.x}%`, top: `${q.y}%`, width: `${q.w}%` }}>
                <motion.img layoutId={`hb-${scene.id}-${i}`} src={p.img} alt={p.name} draggable={false} className="w-full"
                  style={{ filter: 'drop-shadow(0 6px 6px rgba(60,30,10,0.3))' }} transition={{ type: 'spring', stiffness: 120, damping: 16 }} />
              </div>
            );
          })}
        </div>

        {/* The tray: the things still to put in the house. */}
        {!done && !landed && (
          <div className="pointer-events-none absolute inset-x-0 z-30 flex justify-center px-3" style={trayStyle}>
            <div className="pointer-events-auto flex items-end gap-[min(2vw,2.5vh)] rounded-[26px] border-b-[7px] border-amber-700 bg-gradient-to-b from-amber-300 to-amber-500 px-[min(2.5vw,3.5vh)] pb-2 pt-2.5 shadow-[0_12px_24px_rgba(80,40,10,0.35)]">
              {waiting.map((i) => {
                const p = scene.pieces[i];
                const on = picked === i;
                return (
                  <motion.button key={i} onClick={() => { void pickThing(i); }} aria-label={p.name} disabled={picked >= 0}
                    className={`relative rounded-2xl p-1.5 ${on ? 'bg-yellow-200 ring-4 ring-yellow-400' : 'bg-white/90'} ${thingGlow === i ? 'animate-pulse ring-4 ring-yellow-300' : ''}`}
                    animate={wrongThing === i ? { x: [0, -10, 10, -6, 6, 0] } : on ? { y: -10, scale: 1.1 } : { y: [0, -4, 0] }}
                    transition={wrongThing === i ? { duration: 0.4 } : on ? { type: 'spring' } : { duration: 2.2 + (i % 3) * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                    whileTap={{ scale: 0.9 }}>
                    <motion.img layoutId={`hb-${scene.id}-${i}`} src={p.img} alt={p.name} draggable={false}
                      className="h-[min(12vh,10vw)] w-[min(12vh,10vw)] object-contain" style={{ filter: STICKER_FILTER }} />
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </LayoutGroup>

      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(3.4*var(--svw,1vw)), 5.6vh), 2.8rem)' }}>
          {r ? (landed ? r.reply : `\u{1F3E0} ${r.line}`) : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>{'\u{1F3E0}'}</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(landed ? r.reply : r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">{'\u{1F50A}'}</button>}

      {r && landed && (
        <motion.div className="pointer-events-none absolute inset-x-0 z-40 flex flex-col items-center gap-2 [&>*]:pointer-events-auto" style={trayStyle} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7, type: 'spring' }}>
          <span className="rounded-full bg-white/90 px-4 py-1 text-base font-black text-sky-700 shadow">{'\u{1F64B}'} Your turn! Say it:</span>
          <button onClick={said} className={`${CLAY_BUTTON} px-6 py-3 text-xl sm:text-2xl`}>{'\u{1F3A4}'} {r.say}</button>
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
export function houseBuilderLines(scene: Builder) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...scene.pieces.map((p) => [scene.who, builderWrongThing(p.name)]),
    ...scene.rooms.map((room) => [scene.who, builderWrongRoom(room.name)]),
    [scene.who, BUILDER_WHERE],
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
