import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, ThingArt, sayWithin } from './shared';
import { Bursts, LivingBg, useBursts, useShake } from './gameFx';

/* ---------- Peekaboo Toys ----------
 * The classroom "hide the toy — where is it?" game (ESL hide-and-seek with
 * prepositions) and Lingokids' prepositions games, as a gentle whack-a-mole.
 * Toys peek out of hiding places painted in the room: up out of the box,
 * down onto the bed, out from under the chair. The voice says "The teddy is
 * under the chair!". The same toy also peeks from other places, so the child
 * must listen for the place word too, then tap the right one. Calm pace
 * (one wave every ~2.8 s) for four-year-olds; waves repeat until found.
 * The peeks run on each screen's own clock; only the rounds are synced. */

type Peek = Extract<Scene, { kind: 'peek-pop' }>;
const WAVE_MS = 2800;

/** Who peeks where in wave k of a round: the target in every other wave, decoys around it, never two in one place. */
function wave(r: Peek['rounds'][number], k: number): [number, number][] {
  const d = r.decoys;
  const pick: [number, number][] = k % 2 === 0
    ? [[r.toy, r.place], d[(k >> 1) % d.length]]
    : [d[k % d.length], d[(k + 1) % d.length]];
  const seen = new Set<number>();
  return pick.filter((p) => p && !seen.has(p[1]) && (seen.add(p[1]), true));
}

export function PeekPopScene({ scene, onWin, onLose, onNext, sync }: { scene: Peek; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, found: false, gemDone: false });
  const { round, found, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const [k, setK] = useState(0);
  const [missed, setMissed] = useState(''); // "toy-place" that ducks after a wrong tap
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    if (!r) return;
    setK(0);
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  useEffect(() => {
    if (!r || found) return;
    const t = window.setTimeout(() => setK((v) => v + 1), WAVE_MS);
    return () => window.clearTimeout(t);
  }, [r, found, k]);

  const tap = async (toy: number, place: number) => {
    if (!r || found) return;
    if (toy !== r.toy || place !== r.place) {
      sfx.wrong(); onLose(); shake();
      setMissed(`${toy}-${place}`);
      window.setTimeout(() => setMissed(''), 700);
      return;
    }
    sfx.match();
    const p = scene.places[place];
    fire(p.x, p.y - 6, 'stars');
    setState((s) => ({ ...s, found: true }));
    await sayWithin(r.reply, scene.who, 4000);
    const next = round + 1;
    if (next >= total) {
      window.setTimeout(() => { fire(50, 45, 'confetti'); sfx.gem(); }, 200);
      if (!gemDone) onWin(true);
      setState((s) => ({ ...s, round: next, found: false, gemDone: true }));
      return;
    }
    setState((s) => ({ ...s, round: next, found: false }));
  };

  const peeks = r ? (found ? [[r.toy, r.place] as [number, number]] : wave(r, k)) : [];

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden" animate={shakeCtl}>
      <LivingBg img={scene.bg} video={scene.bgVideo} />
      {!r && <Confetti count={70} />}

      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {r ? `👀 ${found ? r.reply : r.line}` : '🎉 You found them all!'}
        {r && <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>}
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>}

      {scene.places.map((p, j) => {
        const who = peeks.find((q) => q[1] === j);
        const toy = who ? scene.toys[who[0]] : undefined;
        const key = who ? `${round}-${k}-${who[0]}-${j}` : '';
        const ducking = who && missed === `${who[0]}-${j}`;
        const hidden = p.from === 'below' ? { y: '105%' } : p.from === 'left' ? { x: '-105%' } : p.from === 'right' ? { x: '105%' } : { y: '-60%', opacity: 0 };
        const clip = p.from !== 'above';
        return (
          <div
            key={j}
            className={`absolute z-20 ${clip ? 'overflow-hidden' : ''}`}
            // 'below': the bottom edge is the rim the toy rises from; 'left'/'right': the side it slides out of.
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: `min(${p.size ?? 19}vh, ${((p.size ?? 19) * 13) / 19}vw)`, aspectRatio: '1', transform: p.from === 'below' ? 'translate(-50%, -100%)' : 'translate(-50%, -50%)' }}
          >
            <AnimatePresence>
              {toy && who && (
                <motion.button
                  key={key}
                  onClick={() => tap(who[0], j)}
                  aria-label={`${toy.label} ${p.label}`}
                  className="absolute inset-0 grid place-items-center"
                  initial={hidden}
                  animate={ducking ? { ...hidden, transition: { duration: 0.3 } } : { x: 0, y: p.from === 'below' ? '28%' : 0, opacity: 1, scaleY: [0.8, 1.1, 1], rotate: found ? [0, -10, 10, 0] : [-4, 4, -4] }}
                  exit={{ ...hidden, transition: { duration: 0.35, ease: 'easeIn' } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 14, rotate: { duration: found ? 0.6 : 1.4, repeat: found ? 0 : Infinity } }}
                  whileTap={{ scale: 0.88 }}
                  style={{ transformOrigin: '50% 100%' }}
                >
                  <span className="block h-[86%] w-[86%]"><ThingArt thing={toy} /></span>
                  {found && <motion.span className="absolute -right-1 -top-1 grid h-9 w-9 place-items-center rounded-full bg-emerald-500 text-lg text-white shadow-lg" initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.span>}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <Bursts items={bursts} />
      {!r && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function peekPopLines(scene: Peek) {
  return scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]) as [string, string][];
}
