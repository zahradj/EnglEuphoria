import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CharKey, Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Whose Room? (Pre-A1 Unit 6 Lesson 4 signature game) ----------
 * Open House Day: three friends show their bedrooms. The rooms are the same
 * room with the same things — only the COLOURS are different. A friend
 * describes their room — "My bed is red and my chair is blue!" — and the
 * child finds it: two rooms have a red bed, only one also has a blue chair,
 * so the child must understand both sentences. The friend pops into the room
 * ("Yes! This is my room!") and the child says it back. Researched: Cambridge
 * Pre A1 Starters Listening Part 1 (listen and draw lines to the right
 * person / place), the Guess Who information game (one clue is not enough),
 * Lingokids / Khan Academy Kids "listen and find" picture tasks.
 * Better: the clue is a whole show-and-tell sentence (thing + colour), no
 * room can be found from one word, a wrong room is named back with what is
 * different ("No! That chair is green!"), the right room glows after two
 * tries, no clock, and every friend found stays in their room. */

type Whose = Extract<Scene, { kind: 'whose-room' }>;
export const whoseWrongLine = (thing: string, color: string) => `No! That ${thing} is ${color}!`;
export const WHOSE_YES = 'Yes! This is my room!';

/** The first thing whose colour differs between room `pick` and room `target` (what a wrong tap names back). */
function difference(scene: Whose, pick: number, target: number) {
  const a = scene.rooms[pick];
  const b = scene.rooms[target];
  if (!a || !b) return undefined;
  const k = scene.things.findIndex((_, i) => a.things[i]?.color !== b.things[i]?.color);
  return k < 0 ? undefined : { thing: scene.things[k].name, color: a.things[k]?.color ?? '' };
}

/** One bedroom: the room picture with each thing standing in its spot, in this room's colours. */
function RoomCard({ scene, index, owner }: { scene: Whose; index: number; owner?: CharKey }) {
  const room = scene.rooms[index];
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[18px] bg-white">
      <img src={scene.room} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
      {scene.things.map((t, k) => {
        const look = room?.things[k];
        if (!look) return null;
        return (
          <div key={k} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${t.x}%`, top: `${t.y}%`, width: `${t.w}%` }}>
            <img src={look.img} alt={`a ${look.color} ${t.name}`} draggable={false} className="w-full" style={{ filter: 'drop-shadow(0 4px 4px rgba(60,30,10,0.3))' }} />
          </div>
        );
      })}
      <AnimatePresence>
        {owner && (
          <motion.div key={owner} className="pointer-events-none absolute bottom-[3%] right-[3%] flex w-[30%] flex-col items-center"
            initial={{ y: '40%', scale: 0.4, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 13 }}>
            <img src={CAST[owner].img} alt={CAST[owner].name} draggable={false} className="w-full" style={{ filter: STICKER_FILTER }} />
            <span className="-mt-1 rounded-full px-2 text-[min(2.4vh,1.6vw)] font-black text-white shadow" style={{ background: CAST[owner].color }}>{CAST[owner].name}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function WhoseRoomScene({ scene, onWin, onNext, sync }: { scene: Whose; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, found: false, gemDone: false });
  const { round, found, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const speaker: CharKey = r ? scene.rooms[r.room]?.owner ?? scene.who : scene.who;
  const busy = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const aspect = scene.aspect ?? 1376 / 768;

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!r || found) return;
    const t = window.setTimeout(() => cueSpeak(r.line, speaker), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const pick = async (i: number) => {
    if (!r || found || busy.current || !scene.rooms[i]) return;
    busy.current = true;
    if (i !== r.room) {
      sfx.wrong(); shake(); setWrong(i);
      setMisses((m) => m + 1);
      const d = difference(scene, i, r.room);
      await sayWithin(d ? whoseWrongLine(d.thing, d.color) : WHOSE_YES, speaker, 2600);
      setWrong(-1);
      busy.current = false;
      return;
    }
    sfx.pop();
    window.setTimeout(() => sfx.match(), 300);
    setState((s) => ({ ...s, found: true }));
    await sayWithin(WHOSE_YES, speaker, 2400);
    busy.current = false;
  };

  /** The child said whose room it is — next friend. */
  const said = () => {
    if (!r || !found || busy.current) return;
    sfx.pop(); fire(50, 55, 'stars');
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 45, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, found: false, gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4500);
  };

  // Lay the rooms out in a row (wide screens) or a column (tall phones), whichever gives bigger rooms.
  const n = scene.rooms.length;
  const short = size.h > 0 && size.h < 450; // phone held sideways: the lesson bar leaves little height
  const top = short ? 104 : 132;
  const bottom = short ? 10 : 84;
  const freeH = Math.max(0, size.h - top - bottom);
  const rowW = Math.min((size.w - 24 - (n - 1) * 12) / n, freeH * aspect);
  const colW = Math.min(size.w - 32, ((freeH - (n - 1) * 10) / n) * aspect);
  const asRow = rowW >= colW;
  const cardW = Math.max(60, asRow ? rowW : colW);
  const owners = scene.rounds.slice(0, round).map((q) => q.room);
  const glow = r && !found && misses >= 2 ? r.room : -1;
  const bigW = Math.max(120, Math.min(size.w * 0.86, (size.h - (short ? 200 : 260)) * aspect));

  return (
    <motion.div ref={rootRef} className="absolute inset-0 select-none overflow-hidden" animate={shakeCtl}>
      <img src={scene.bg} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-white/25" />
      {done && <Confetti count={70} />}

      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.05rem, min(calc(3.2*var(--svw,1vw)), 5vh), 2.6rem)' }}>
          {r ? (found ? WHOSE_YES : `\u{1F3E0} ${r.line}`) : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>{'\u{1F6CF}\u{FE0F}'}</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(found ? WHOSE_YES : r.line, speaker)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">{'\u{1F50A}'}</button>}

      {size.w > 0 && (
        <div className={`absolute inset-x-0 z-10 flex items-center justify-center ${asRow ? 'flex-row gap-3' : 'flex-col gap-2.5'}`} style={{ top, bottom }}>
          {scene.rooms.map((_, i) => {
            const ownerIdx = owners.indexOf(i);
            return (
              <motion.button key={i} onClick={() => { void pick(i); }} aria-label={`Room ${i + 1}`} disabled={found || done}
                className={`relative shrink-0 rounded-[22px] border-[5px] p-0 shadow-[0_10px_22px_rgba(40,30,80,0.3)] ${glow === i ? 'animate-pulse border-yellow-300 ring-4 ring-yellow-300' : wrong === i ? 'border-red-400' : ownerIdx >= 0 ? 'border-lime-300' : 'border-white'}`}
                style={{ width: cardW, height: cardW / aspect }}
                animate={wrong === i ? { x: [0, -10, 10, -6, 6, 0] } : { y: [0, -3, 0] }}
                transition={wrong === i ? { duration: 0.4 } : { duration: 2.6 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                whileTap={{ scale: 0.97 }}>
                <RoomCard scene={scene} index={i} owner={ownerIdx >= 0 ? scene.rooms[i].owner : undefined} />
                {ownerIdx < 0 && <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-white/90 px-2.5 text-[min(3vh,2vw)] font-black text-violet-600 shadow">?</span>}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Found: the room comes forward with its owner inside, and the child says whose room it is. */}
      <AnimatePresence>
        {r && found && (
          <motion.div key={`found-${round}`} className={`absolute inset-0 z-40 flex flex-col items-center justify-center bg-violet-950/45 px-4 ${short ? 'gap-1.5 pt-[88px]' : 'gap-3 pt-24'}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="rounded-[24px] border-[6px] border-yellow-300 shadow-[0_16px_40px_rgba(0,0,0,0.4)]" style={{ width: bigW, height: bigW / aspect }}
              initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 16 }}>
              <RoomCard scene={scene} index={r.room} owner={scene.rooms[r.room]?.owner} />
            </motion.div>
            <motion.div className="flex flex-col items-center gap-2" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, type: 'spring' }}>
              <span className="rounded-full bg-white/90 px-4 py-1 text-base font-black text-sky-700 shadow">{'\u{1F64B}'} Your turn! Say it:</span>
              <button onClick={said} className={`${CLAY_BUTTON} px-6 py-3 text-xl sm:text-2xl`}>{'\u{1F3A4}'} {r.say}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
export function whoseRoomLines(scene: Whose) {
  const lines: [string, string][] = [];
  for (const r of scene.rounds) {
    const owner = scene.rooms[r.room]?.owner ?? scene.who;
    lines.push([owner, r.line], [owner, WHOSE_YES]);
    scene.rooms.forEach((_, i) => {
      if (i === r.room) return;
      const d = difference(scene, i, r.room);
      if (d) lines.push([owner, whoseWrongLine(d.thing, d.color)]);
    });
  }
  lines.push([scene.who, scene.doneLine]);
  return lines;
}
