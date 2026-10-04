import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, ThingArt, sayWithin } from './shared';
import { Bursts, LivingBg, useBursts, useShake } from './gameFx';

/* ---------- Ring Toss ----------
 * The fairground ring toss, as a listening game (Wordwall's quick review
 * templates — Whack-a-mole, Open the box — show how fast a one-tap review
 * can be; the fair gives it a real-world frame). Each peg on the stall has
 * a prize toy; the voice says "Throw the ring on the kite!". The child taps
 * the peg (or its toy): the ring flies in a spinning arc and drops over the
 * peg with a wobble. Right: it stays there (rings pile up, permanence) and
 * the prize hops. Wrong: it bounces off and rolls back — no harsh penalty. */

type Toss = Extract<Scene, { kind: 'ring-toss' }>;
const START = { x: 50, y: 92 };

export function RingTossScene({ scene, onWin, onLose, onNext, sync }: { scene: Toss; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    flying: -1, // peg the ring is flying to
    bounced: -1, // peg the ring bounced off
    ringed: [] as number[], // pegs with a ring on them
    gemDone: false,
  });
  const { round, flying, bounced, ringed, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const busy = useRef(false);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const toss = async (peg: number) => {
    if (!r || busy.current || !scene.pegs[peg]) return;
    busy.current = true;
    sfx.pop();
    setState((s) => ({ ...s, flying: peg }));
    await wait(750);
    const p = scene.pegs[peg];
    if (peg === r.target) {
      sfx.match(); fire(p.x, p.y - 6, 'stars');
      setState((s) => ({ ...s, flying: -1, ringed: [...s.ringed, peg] }));
      await sayWithin(r.reply, scene.who, 4000);
      const next = round + 1;
      if (next >= total) { fire(50, 45, 'confetti'); if (!gemDone) { sfx.gem(); onWin(true); } }
      setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
    } else {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, flying: -1, bounced: peg }));
      await wait(900);
      setState((s) => ({ ...s, bounced: -1 }));
    }
    busy.current = false;
  };

  const ringW = 'min(13vh, 9vw)';
  const target = flying >= 0 ? scene.pegs[flying] : bounced >= 0 ? scene.pegs[bounced] : undefined;

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden" animate={shakeCtl}>
      <LivingBg img={scene.bg} video={scene.bgVideo} />
      {!r && <Confetti count={80} />}

      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {r ? `⭕ ${r.line}` : '🎉 Ring toss champion!'}
        {r && <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>}
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>}

      {/* Prize toys above the pegs + the pegs' tap areas. */}
      {scene.pegs.map((p, j) => {
        const prize = scene.prizes[j];
        const done = ringed.includes(j);
        return (
          <motion.button
            key={j}
            onClick={() => toss(j)}
            aria-label={prize?.label ?? `peg ${j + 1}`}
            className="absolute z-10 flex flex-col items-center"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: 'min(19vh, 13vw)', translateX: '-50%', translateY: '-100%' }}
            initial={{ scale: 0 }}
            animate={done ? { scale: 1, y: [0, -18, 0, -8, 0] } : { scale: 1, y: [0, -5, 0] }}
            transition={done ? { duration: 0.8 } : { scale: { type: 'spring', stiffness: 260, damping: 14, delay: j * 0.08 }, y: { duration: 2 + j * 0.3, repeat: Infinity, ease: 'easeInOut' } }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
          >
            {prize && <span className="block aspect-square w-[80%]"><ThingArt thing={prize} /></span>}
            <span className="block h-[min(10vh,7vw)] w-full" />
          </motion.button>
        );
      })}

      {/* Rings already on their pegs (they stay). */}
      {ringed.map((j, k) => (
        <motion.img key={`${j}-${k}`} src={scene.ringImg} alt="" draggable={false} className="pointer-events-none absolute z-20"
          style={{ left: `${scene.pegs[j].x}%`, top: `${scene.pegs[j].y - 2}%`, width: ringW, translateX: '-50%', translateY: '-50%', filter: STICKER_FILTER }}
          initial={{ scaleY: 0.2 }} animate={{ scaleY: [0.2, 0.5, 0.36, 0.42], rotate: [0, -8, 6, 0] }} transition={{ duration: 0.6 }} />
      ))}

      {/* The ring in the hand / in the air. */}
      {r && (
        <motion.img
          key={`ring-${round}-${bounced}`}
          src={scene.ringImg}
          alt=""
          draggable={false}
          className="pointer-events-none absolute z-30"
          style={{ width: ringW, translateX: '-50%', translateY: '-50%', filter: STICKER_FILTER }}
          initial={{ left: `${START.x}%`, top: `${START.y}%`, scaleY: 1, rotate: 0, opacity: 1 }}
          animate={target && flying >= 0
            ? { left: [`${START.x}%`, `${(START.x + target.x) / 2}%`, `${target.x}%`], top: [`${START.y}%`, `${Math.min(START.y, target.y) - 30}%`, `${target.y - 4}%`], rotate: [0, 540, 720], scaleY: [1, 0.7, 0.45] }
            : target && bounced >= 0
              ? { left: [`${target.x}%`, `${target.x + 8}%`, `${START.x}%`], top: [`${target.y - 4}%`, `${target.y - 16}%`, `${START.y}%`], rotate: [0, 200, 360], scaleY: [0.45, 0.8, 1] }
              : { left: `${START.x}%`, top: `${START.y}%`, rotate: [-6, 6, -6], scaleY: 1 }}
          transition={target ? { duration: flying >= 0 ? 0.75 : 0.9, times: [0, 0.5, 1], ease: ['easeOut', 'easeIn'] } : { rotate: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } }}
        />
      )}

      <Bursts items={bursts} />
      {!r && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function ringTossLines(scene: Toss) {
  return scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]) as [string, string][];
}
