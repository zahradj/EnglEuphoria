import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Sand Prints (Pre-A1 Unit 4 Lesson 3 signature game) ----------
 * Body-part listening with a lasting result. Researched: Lingokids body-parts
 * games (tap the part you hear), the classroom handprint / footprint art
 * activity (paint prints on paper), and Khan Academy Kids' "make something
 * that stays" reward. Better than the apps: the child doesn't match a picture
 * to a picture — the word alone ("Make a footprint!") decides which body part
 * to press into the sand, the print it makes stays on the beach, and by the
 * end the sand is a picture the child made. A wrong part is named back
 * ("That's your hand! Try again!") and costs nothing. No clock. */

type Sand = Extract<Scene, { kind: 'sand-prints' }>;
type PrintShape = 'hand' | 'finger' | 'foot' | 'arm';

/** Where the prints land on the sand, in order (% of the board). */
const SPOTS = [
  { x: 24, y: 34, r: -12 }, { x: 50, y: 28, r: 6 }, { x: 76, y: 36, r: 14 },
  { x: 32, y: 66, r: 8 }, { x: 60, y: 64, r: -8 }, { x: 82, y: 70, r: -16 },
];

const shapeOf = (label: string): PrintShape => (/foot|feet|toe/i.test(label) ? 'foot' : /finger/i.test(label) ? 'finger' : /arm/i.test(label) ? 'arm' : 'hand');
export const sandWrongLine = (label: string) => `That's your ${label}! Try again!`;

export function SandPrintsScene({ scene, onWin, onNext, sync }: { scene: Sand; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, prints: [] as number[], wrong: -1, gemDone: false });
  const { round, prints, wrong, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  // Research rules (docs/research/young-learner-games.md): after 2 misses the right sticker glows;
  // 7 s with no tap replays the request.
  const [misses, setMisses] = useState(0);
  const printShapes = useMemo(() => prints.map((p) => shapeOf(scene.parts[p]?.label ?? 'hand')), [prints, scene.parts]);

  useEffect(() => {
    if (!r) return;
    busy.current = false;
    setMisses(0);
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 500);
    const idle = window.setInterval(() => { if (!busy.current) cueSpeak(r.line, scene.who); }, 7500);
    return () => { window.clearTimeout(t); window.clearInterval(idle); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const press = async (i: number) => {
    const part = scene.parts[i];
    if (!r || !part || busy.current) return;
    busy.current = true;
    if (i !== r.part) {
      sfx.wrong(); shake();
      setMisses((m) => m + 1);
      setState((s) => ({ ...s, wrong: i }));
      await sayWithin(sandWrongLine(part.label), scene.who, 3000);
      setState((s) => ({ ...s, wrong: -1 }));
      busy.current = false;
      return;
    }
    sfx.pop();
    window.setTimeout(() => sfx.match(), 200);
    const spot = SPOTS[prints.length % SPOTS.length];
    fire(spot.x, spot.y, 'stars');
    setState((s) => ({ ...s, prints: [...s.prints, i] }));
    await sayWithin(r.reply, scene.who, 3500);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 50, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4000);
  };

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}

      {/* The sand: every print the child makes stays here. */}
      <div className="absolute inset-x-0 top-[12%] bottom-[32%]">
        {printShapes.map((shape, k) => {
          const spot = SPOTS[k % SPOTS.length];
          return (
            <motion.div
              key={k}
              className="absolute"
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: 'min(18vh, 14vw)', height: 'min(18vh, 14vw)', x: '-50%', y: '-50%', rotate: spot.r }}
              initial={{ scale: 1.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            >
              <PrintArt shape={shape} />
            </motion.div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-16 z-20 flex justify-center px-4">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.6rem, calc(3.6*var(--svw,1vw)), 3rem)' }}>
          {r ? r.line : scene.doneLine}
        </span>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}
      <div className="absolute left-3 top-16 z-30 flex gap-1">
        {scene.rounds.map((_, i) => <span key={i} className={`text-2xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>⭐</span>)}
      </div>

      {/* The body-part stickers: press one into the sand. */}
      {!done && (
        <div className="absolute inset-x-0 bottom-[10%] z-20 flex items-end justify-center gap-[3vw] px-3">
          {scene.parts.map((p, i) => (
            <button
              key={i}
              onClick={() => { void press(i); }}
              aria-label={p.label}
              className={`relative grid aspect-square h-[min(19vh,21vw)] place-items-center transition active:scale-90 ${wrong === i ? 'animate-[lep1-shake_0.4s_ease-in-out]' : 'hover:-translate-y-1.5'}`}
              style={{ animation: wrong === i ? undefined : `lep1-card-in 0.45s ease-out ${i * 0.08}s both` }}
            >
              {wrong === i && <span className="absolute inset-[10%] rounded-full bg-red-400/60 blur-xl" />}
              {misses >= 2 && r && i === r.part && <span className="absolute inset-[4%] animate-pulse rounded-full bg-yellow-300/80 blur-lg" />}
              <img src={p.img} alt={p.label} draggable={false} className="relative h-full w-full object-contain" style={{ filter: STICKER_FILTER }} />
            </button>
          ))}
        </div>
      )}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** A print pressed into wet sand: a darker sand shape with a soft inner shadow. */
function PrintArt({ shape }: { shape: PrintShape }) {
  const fill = '#B98A4E';
  const common = { fill, stroke: '#8A6232', strokeWidth: 2.5, opacity: 0.85 } as const;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_2px_0_rgba(255,255,255,0.55)]">
      {shape === 'foot' && (
        <g>
          <path d="M50 92c-14 0-20-10-19-24 1-12 6-20 4-30-2-9 4-16 14-16s17 7 16 18c-1 10 4 17 4 28 0 14-6 24-19 24z" {...common} />
          {[[34, 14, 7.5], [46, 9, 6.5], [57, 9, 5.8], [66, 13, 5], [73, 19, 4.4]].map(([cx, cy, rr], k) => <circle key={k} cx={cx} cy={cy} r={rr} {...common} />)}
        </g>
      )}
      {shape === 'hand' && (
        <g>
          <path d="M28 52c0-10 8-16 22-16s22 6 22 16v14c0 16-10 26-22 26S28 82 28 66z" {...common} />
          {[[30, 18, 34], [41, 8, 34], [52, 6, 34], [63, 10, 34]].map(([x, y, h], k) => <rect key={k} x={x} y={y} width={9.5} height={h} rx={4.75} {...common} />)}
          <rect x={10} y={44} width={9.5} height={30} rx={4.75} transform="rotate(-38 15 59)" {...common} />
        </g>
      )}
      {shape === 'finger' && (
        <g>
          <ellipse cx={50} cy={50} rx={22} ry={28} {...common} />
          {[18, 12, 6].map((rr, k) => <ellipse key={k} cx={50} cy={52} rx={rr} ry={rr * 1.3} fill="none" stroke="#8A6232" strokeWidth={2.2} opacity={0.7} />)}
        </g>
      )}
      {shape === 'arm' && (
        <g>
          <rect x={14} y={42} width={58} height={18} rx={9} transform="rotate(-20 43 51)" {...common} />
          <path d="M66 26c8-4 18 2 20 10s-2 18-10 20-16-4-17-12 0-14 7-18z" {...common} />
        </g>
      )}
    </svg>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function sandPrintsLines(scene: Sand) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...scene.parts.map((p) => [scene.who, sandWrongLine(p.label)]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
