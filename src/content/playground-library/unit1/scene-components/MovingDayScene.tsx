import { useEffect, useRef, useState } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin, useArtBox } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Moving Day (Pre-A1 Unit 6 Lesson 2 signature game) ----------
 * Pip's family moves into a new house. The furniture waits on the moving
 * truck; the new room is empty. Pip asks for one piece — "Bring the bed,
 * please!" — the child taps it on the truck and it flies to its own place in
 * the room, then the child names it ("It's a bed!"). The room fills up piece
 * by piece and stays furnished. Researched: Toca Boca / Lingokids "decorate
 * the room" play, Khan Academy Kids calm listening tasks, Cambridge Pre A1
 * "listen and draw a line" (put the thing where it goes). Better: the WORD
 * picks the piece (nothing on screen says which one), the finished room is
 * the child's own work, a wrong piece is named back ("No, that's the
 * chair!"), and the right one glows after two tries — no clock. */

type Moving = Extract<Scene, { kind: 'moving-day' }>;
export const movingWrongLine = (name: string) => `No, that's the ${name}! Try again!`;
export const MOVING_THANKS = 'Thank you!';

export function MovingDayScene({ scene, onWin, onNext, sync }: { scene: Moving; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, placed: [] as number[], landed: false, gemDone: false });
  const { round, placed, landed, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useArtBox(rootRef, scene.aspect ?? 1376 / 768);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!r || landed) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const pick = async (i: number) => {
    const piece = scene.pieces[i];
    if (!r || !piece || landed || busy.current || placed.includes(i)) return;
    busy.current = true;
    if (i !== r.piece) {
      sfx.wrong(); shake(); setWrong(i);
      setMisses((m) => m + 1);
      await sayWithin(movingWrongLine(piece.name), scene.who, 2600);
      setWrong(-1);
      busy.current = false;
      return;
    }
    sfx.pop();
    setState((s) => ({ ...s, placed: [...s.placed, i], landed: true }));
    window.setTimeout(() => { sfx.match(); fire(piece.x, piece.y, 'stars'); }, 650);
    await sayWithin(MOVING_THANKS, scene.who, 1800);
    await sayWithin(r.reply, scene.who, 3200);
    busy.current = false;
  };

  /** The child named the piece — next one. */
  const said = () => {
    if (!r || !landed || busy.current) return;
    sfx.pop();
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 45, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, landed: false, gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4500);
  };

  const glow = r && !landed && misses >= 2 ? r.piece : -1;
  const waiting = scene.pieces.map((_, i) => i).filter((i) => !placed.includes(i));

  return (
    <motion.div ref={rootRef} className="absolute inset-0 select-none overflow-hidden bg-gradient-to-b from-amber-100 via-orange-50 to-amber-200" animate={shakeCtl}>
      {done && <Confetti count={70} />}
      <LayoutGroup>
        {/* The new room, with every piece already moved in standing in its place. */}
        <div className="absolute" style={box}>
          <img src={scene.bg} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
          {placed.map((i) => {
            const p = scene.pieces[i];
            if (!p) return null;
            return (
              <div key={i} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%` }}>
                <motion.img layoutId={`mv-${scene.id}-${i}`} src={p.img} alt={p.name} draggable={false} className="w-full"
                  style={{ filter: 'drop-shadow(0 8px 8px rgba(60,30,10,0.3))' }} transition={{ type: 'spring', stiffness: 120, damping: 16 }} />
              </div>
            );
          })}
        </div>

        {/* The moving truck: the pieces still waiting to come in. */}
        {!done && !landed && (
          <div className="absolute inset-x-0 z-20 flex justify-center px-3" style={{ top: 'max(25%, 132px)' }}>
            <div className="flex items-end gap-[min(2.4vw,3vh)] rounded-[26px] border-b-[8px] border-sky-800 bg-gradient-to-b from-sky-400 to-sky-600 px-[min(3vw,4vh)] pb-2 pt-3 shadow-[0_14px_26px_rgba(20,40,80,0.35)]">
              <span className="self-center text-[min(7vh,5vw)]" aria-hidden>{'\u{1F69A}'}</span>
              {waiting.map((i) => {
                const p = scene.pieces[i];
                return (
                  <motion.button key={i} onClick={() => { void pick(i); }} aria-label={p.name} disabled={landed}
                    className={`relative rounded-2xl bg-white/90 p-1.5 ${glow === i ? 'ring-4 ring-yellow-300 animate-pulse' : ''}`}
                    animate={wrong === i ? { x: [0, -10, 10, -6, 6, 0] } : { y: [0, -4, 0] }}
                    transition={wrong === i ? { duration: 0.4 } : { duration: 2.2 + (i % 3) * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                    whileTap={{ scale: 0.9 }}>
                    <motion.img layoutId={`mv-${scene.id}-${i}`} src={p.img} alt={p.name} draggable={false}
                      className="h-[min(15vh,11vw)] w-[min(15vh,11vw)] object-contain" style={{ filter: STICKER_FILTER }} />
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </LayoutGroup>

      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(3.4*var(--svw,1vw)), 5.6vh), 2.8rem)' }}>
          {r ? (landed ? r.reply : `\u{1F4E6} ${r.line}`) : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>{'\u{1F4E6}'}</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(landed ? r.reply : r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">{'\u{1F50A}'}</button>}

      {r && landed && (
        <motion.div className="absolute inset-x-0 z-40 flex flex-col items-center gap-2" style={{ top: 'max(25%, 132px)' }} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7, type: 'spring' }}>
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
export function movingDayLines(scene: Moving) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...scene.pieces.map((p) => [scene.who, movingWrongLine(p.name)]),
    [scene.who, MOVING_THANKS],
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
