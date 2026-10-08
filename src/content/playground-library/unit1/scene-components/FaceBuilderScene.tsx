import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Pancake Faces (Pre-A1 Unit 4 Lesson 2 signature game) ----------
 * Lingokids "put the features back on the face" / Face Scramble and the
 * classroom Mr. Potato Head, made a LISTENING game: Pip names a face part
 * ("Where do the eyes go?") and the child taps the place on the plain
 * pancake where it belongs. Right: the fruit pops on (blueberry eyes,
 * strawberry nose, banana smile, apple ears). Wrong place: the place is
 * named back ("Not there! That's for the nose!") so every mistake teaches.
 * The finished pancake smiles and wiggles. Better than the apps: no picture
 * of the part to match — the word alone tells the child where to tap.
 * The pieces are cut from `doneImg` (the same picture with the face on), so
 * they sit exactly where they belong; each spot is one or more boxes (two
 * eyes, two ears) in % of the picture. */

type Face = Extract<Scene, { kind: 'face-builder' }>;

/** CSS that shows the box (x,y,w,h in % of a 16:9 picture) of `img`, filling its element. */
function cropStyle(img: string, b: { x: number; y: number; w: number; h: number }): React.CSSProperties {
  return {
    backgroundImage: `url(${img})`,
    backgroundSize: `${(100 / b.w) * 100}% ${(100 / b.h) * 100}%`,
    backgroundPosition: `${b.w >= 100 ? 0 : (b.x / (100 - b.w)) * 100}% ${b.h >= 100 ? 0 : (b.y / (100 - b.h)) * 100}%`,
    backgroundRepeat: 'no-repeat',
  };
}

export function FaceBuilderScene({ scene, onWin, onLose, onNext, sync }: { scene: Face; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    placed: [] as number[], // spots with their piece on
    wrong: -1,
    gemDone: false,
  });
  const { round, placed, wrong, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const placedSet = useMemo(() => new Set(placed), [placed]);
  const busy = useRef(false);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    if (!r) return;
    busy.current = false;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const tap = async (i: number) => {
    const sp = scene.spots[i];
    if (!r || !sp || busy.current || placedSet.has(i)) return;
    busy.current = true;
    if (i !== r.spot) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, wrong: i }));
      await sayWithin(wrongLine(sp.label), scene.who, 3000);
      setState((s) => ({ ...s, wrong: -1 }));
      busy.current = false;
      return;
    }
    sfx.pop();
    window.setTimeout(() => sfx.match(), 250);
    const b0 = sp.boxes[0];
    if (b0) fire(b0.x + b0.w / 2, b0.y + b0.h / 2, 'stars');
    setState((s) => ({ ...s, placed: [...s.placed, i] }));
    await sayWithin(r.reply, scene.who, 3500);
    const next = round + 1;
    if (next >= total) { fire(50, 50, 'confetti'); if (!gemDone) { sfx.gem(); onWin(true); } }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4000);
  };

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-amber-100" animate={shakeCtl}>
      {/* Soft fill behind the board on screens that are not 16:9 */}
      <div className="absolute inset-0 scale-110 bg-cover bg-center opacity-60 blur-md" style={{ backgroundImage: `url(${scene.bg})` }} />
      {done && <Confetti count={70} />}

      {/* The board: the picture at its own 16:9 shape, so the spots line up on every screen.
          On a phone held upright it is up to twice the screen width (the plate edges are cut
          off) so the face in the middle stays big enough to tap. */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 'min(177.78vh, 200vw)', aspectRatio: '16 / 9' }}>
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${scene.bg})` }}
          animate={done ? { rotate: [0, -2, 2, -1.5, 1.5, 0], scale: [1, 1.03, 1] } : { rotate: 0, scale: 1 }}
          transition={done ? { duration: 1.2, delay: 0.4 } : { duration: 0.2 }}
        >
          {scene.spots.flatMap((sp, i) => sp.boxes.map((b, k) => {
            const on = placedSet.has(i);
            return (
              <button
                key={`${i}-${k}`}
                onClick={() => tap(i)}
                aria-label={on ? sp.label : `Spot ${i + 1}`}
                className="absolute rounded-[40%]"
                style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
              >
                {/* The piece pops on in its exact place. */}
                <motion.span
                  className="pointer-events-none absolute inset-0"
                  style={cropStyle(scene.doneImg, b)}
                  initial={false}
                  animate={on ? { opacity: 1, scale: [1.6, 0.9, 1], y: [-30, 0] } : { opacity: 0, scale: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut', delay: k * 0.12 }}
                />
                {/* An empty place glows softly so the child knows it can be tapped. */}
                {!on && !done && (
                  <motion.span
                    className="pointer-events-none absolute inset-[8%] rounded-[40%] border-[3px] border-dashed border-white/80"
                    animate={wrong === i ? { x: [0, -8, 8, -5, 5, 0], borderColor: '#f87171' } : { opacity: [0.35, 0.9, 0.35] }}
                    transition={wrong === i ? { duration: 0.4 } : { duration: 1.8, repeat: Infinity, delay: i * 0.3 }}
                  />
                )}
              </button>
            );
          }))}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[86%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {r ? `${scene.icon ?? '🥞'} ${r.line}` : `🎉 ${scene.doneLine}`}
        {r && <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>}
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[12%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Said when the child taps another part's place: the place is named back. */
export function wrongLine(label: string) {
  return `Not there! That's for the ${label}!`;
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function faceBuilderLines(scene: Face) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...scene.spots.map((sp) => [scene.who, wrongLine(sp.label)]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
