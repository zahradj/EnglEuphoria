import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { STICKER_FILTER, ShapeIcon, sayWithin } from './shared';
import { Bursts, LivingBg, useBursts, useShake } from './gameFx';

/* ---------- Shape Fishing ----------
 * The classroom "go fishing" game (paper fish with a shape on each, caught
 * with a magnet rod while the child says the shape) as used in ESL classes
 * and kids' shape apps: fish swim past, each carrying a coloured shape; the
 * voice says "Catch a blue triangle!" and the child taps that fish. Every
 * catch is said back ("A blue triangle! Splash!"). Leads into Lesson 5's
 * Rainbow Fish. */

type Catch = Extract<Scene, { kind: 'shape-fishing' }>['fish'][number];
/** "the big red ball" for toys. */
const toyName = (f: Catch) => [f.size, f.colorWord.toLowerCase(), (f.word ?? '').toLowerCase()].filter(Boolean).join(' ');
export function catchLine(colorWord: string, shape: string, f?: Catch) {
  if (f?.word) return `Catch the ${toyName(f)}!`;
  return `Catch a ${colorWord.toLowerCase()} ${shape}!`;
}
export function caughtLine(colorWord: string, shape: string, f?: Catch) {
  if (f?.word) return `You caught the ${toyName(f)}!`;
  return `You caught a ${colorWord.toLowerCase()} ${shape}!`;
}
const same = (a: Catch, b: Catch) => (a.word || b.word ? a.word === b.word && a.colorWord === b.colorWord && a.size === b.size : a.colorWord === b.colorWord && a.shape === b.shape);

let fishUid = 0;
/** A friendly cartoon fish carrying one coloured shape on a white badge.
 *  The body stays pearly white so the only colour that matters is the shape's. */
function Fish({ shape, colorHex }: { shape: string; colorHex: string }) {
  const id = useMemo(() => `fish${++fishUid}`, []);
  return (
    <svg viewBox="0 0 130 80" className="h-full w-full" style={{ filter: 'drop-shadow(0 6px 8px rgba(15,40,90,.35))' }} aria-hidden>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFDF7" />
          <stop offset="0.6" stopColor="#FCEFD9" />
          <stop offset="1" stopColor="#F6D8B4" />
        </linearGradient>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FB923C" />
          <stop offset="1" stopColor="#FDBA74" />
        </linearGradient>
      </defs>
      {/* tail */}
      <g style={{ transformOrigin: '26px 40px', animation: 'lep1-tail 0.5s ease-in-out infinite' }}>
        <path d="M 26 40 L 4 18 Q 0 40 4 62 Z" fill={`url(#${id}f)`} stroke="#2B1E17" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M 9 28 L 20 40 L 9 52" fill="none" stroke="#EA580C" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      </g>
      {/* top fin */}
      <path d="M 52 14 Q 68 0 88 12" fill={`url(#${id}f)`} stroke="#2B1E17" strokeWidth="2.5" strokeLinejoin="round" />
      {/* body */}
      <ellipse cx="72" cy="42" rx="50" ry="30" fill={`url(#${id}b)`} stroke="#2B1E17" strokeWidth="2.5" />
      <ellipse cx="78" cy="26" rx="26" ry="6" fill="#fff" opacity="0.8" />
      {/* side fin */}
      <path d="M 66 56 Q 74 70 84 60 Z" fill={`url(#${id}f)`} stroke="#2B1E17" strokeWidth="2" strokeLinejoin="round" style={{ transformOrigin: '70px 57px', animation: 'lep1-tail 0.7s ease-in-out infinite reverse' }} />
      {/* little bubbles from the mouth */}
      <circle cx="124" cy="40" r="2.5" fill="#fff" opacity="0.8" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'lep1-smoke 2.4s ease-out infinite' }} />
      {/* eye, cheek, smile */}
      <circle cx="104" cy="34" r="7.5" fill="#fff" stroke="#2B1E17" strokeWidth="2" />
      <circle cx="105.5" cy="34.5" r="4.4" fill="#2B1E17" />
      <circle cx="107" cy="32.6" r="1.6" fill="#fff" />
      <ellipse cx="108" cy="47" rx="4" ry="2.4" fill="#FDA4AF" opacity="0.8" />
      <path d="M 112 50 Q 116 53 119 49" fill="none" stroke="#2B1E17" strokeWidth="2" strokeLinecap="round" />
      {/* the shape badge */}
      <circle cx="64" cy="41" r="21" fill="#fff" stroke="#2B1E17" strokeWidth="2" />
      <foreignObject x="47" y="24" width="34" height="34"><ShapeIcon shape={shape} fill={colorHex} /></foreignObject>
    </svg>
  );
}

export function ShapeFishingScene({ scene, onWin, onLose, onNext, sync }: { scene: Extract<Scene, { kind: 'shape-fishing' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    caught: [] as number[],
    wrong: -1,
    busy: false,
    gemDone: false,
  });
  const { round, caught, wrong, busy, gemDone } = state;
  const total = scene.targets.length;
  const targetIdx = round < total ? scene.targets[round] : undefined;
  const target = targetIdx != null ? scene.fish[targetIdx] : undefined;
  const caughtSet = useMemo(() => new Set(caught), [caught]);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    if (!target) return;
    const t = window.setTimeout(() => cueSpeak(catchLine(target.colorWord, target.shape, target), scene.who), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const tapFish = async (i: number, e?: React.MouseEvent) => {
    const f = scene.fish[i];
    if (!target || !f || busy || caughtSet.has(i)) return;
    if (!same(f, target)) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, wrong: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.match();
    if (e) {
      const box = (e.currentTarget as HTMLElement).closest('[data-fish-stage]')?.getBoundingClientRect();
      if (box) { const x = ((e.clientX - box.left) / box.width) * 100, y = ((e.clientY - box.top) / box.height) * 100; fire(x, y, 'splash'); fire(x, y - 6, 'stars'); }
    }
    setState((s) => ({ ...s, caught: [...s.caught, i], busy: true }));
    await sayWithin(caughtLine(f.colorWord, f.shape, f), scene.who);
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, busy: false, gemDone: s.gemDone || awardGem }));
  };

  return (
    <motion.div data-fish-stage className="absolute inset-0 overflow-hidden" animate={shakeCtl}>
      <LivingBg img={scene.bg} video={scene.bgVideo} />
      {/* Under the water: a soft wavy surface, deeper blue below (no hard band over the characters). */}
      {!scene.floating && <svg className="pointer-events-none absolute inset-x-0 top-[46%] h-[54%] w-full" viewBox="0 0 100 54" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="fishWater" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#38BDF8" stopOpacity="0.05" />
            <stop offset="0.25" stopColor="#0EA5E9" stopOpacity="0.28" />
            <stop offset="1" stopColor="#1E3A8A" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <path d="M0 3 Q 6 0 12 3 T 25 3 T 37 3 T 50 3 T 62 3 T 75 3 T 87 3 T 100 3 V 54 H 0 Z" fill="url(#fishWater)" />
        <path d="M0 3 Q 6 0 12 3 T 25 3 T 37 3 T 50 3 T 62 3 T 75 3 T 87 3 T 100 3" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.35" />
      </svg>}
      {/* rising bubbles */}
      {[12, 31, 54, 73, 90].map((l, k) => (
        <span key={l} className="pointer-events-none absolute bottom-[6%] z-10 block rounded-full border-2 border-white/70 bg-white/20" style={{ left: `${l}%`, width: 10 + (k % 3) * 6, height: 10 + (k % 3) * 6, animation: `lep1-bubble-rise ${5 + k}s ease-in ${k * 1.3}s infinite` }} />
      ))}

      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {target ? `🎣 ${catchLine(target.colorWord, target.shape, target)}` : '🪣 What a big catch!'}
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{Math.min(round + 1, total)}/{total}</span>
      </div>
      {target && (
        <button onClick={() => cueSpeak(catchLine(target.colorWord, target.shape, target), scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>
      )}

      {/* Floating toys bobbing and drifting in the paddling pool. */}
      {target && scene.floating && scene.fish.map((f, i) => {
        if (caughtSet.has(i)) return null;
        const n = scene.fish.length;
        const a = (i / n) * Math.PI * 2 + ((scene.pool?.turn ?? 0) * Math.PI) / 180;
        // A ring over the whole water of the pool painted in bg, wide enough that no two toys touch.
        const pool = scene.pool ?? { x: 51, y: 47, rx: 24, ry: 11 };
        const cx = pool.x + Math.cos(a) * pool.rx, cy = pool.y + Math.sin(a) * pool.ry;
        const sz = f.size === 'small' ? 7 : f.size === 'big' ? 11 : 9;
        return (
          <motion.button
            key={i}
            onClick={(e) => tapFish(i, e)}
            aria-label={toyName(f)}
            className="absolute z-20 grid place-items-center"
            style={{ left: `${cx}%`, top: `${cy}%`, width: `${sz}%`, aspectRatio: '1', translateX: '-50%', translateY: '-50%' }}
            initial={{ scale: 0 }}
            animate={wrong === i
              ? { scale: 1, x: [0, -12, 12, -8, 8, 0] }
              : { scale: 1, x: [0, 8 * Math.cos(a + 1), 0, -8 * Math.cos(a + 1), 0], y: [0, -8, 0, 6, 0], rotate: [-6, 6, -6] }}
            transition={wrong === i ? { duration: 0.45 } : { scale: { type: 'spring', stiffness: 260, damping: 14, delay: i * 0.08 }, x: { duration: 7 + (i % 3), repeat: Infinity, ease: 'easeInOut' }, y: { duration: 2.4 + (i % 2) * 0.6, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 3 + (i % 3) * 0.5, repeat: Infinity, ease: 'easeInOut' } }}
            whileTap={{ scale: 0.85 }}
          >
            {/* ripple ring on the water */}
            <motion.span className="absolute left-1/2 top-[72%] block h-[30%] w-[115%] -translate-x-1/2 rounded-[50%] border-[3px] border-white/70" animate={{ scale: [0.8, 1.2], opacity: [0.8, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.25 }} />
            {f.img
              ? <img src={f.img} alt="" draggable={false} className="relative h-full w-full object-contain" style={{ filter: STICKER_FILTER }} />
              : <span className="relative block h-[70%] w-[70%]"><ShapeIcon shape={f.shape} fill={f.colorHex} /></span>}
          </motion.button>
        );
      })}

      {/* Swimming fish: three lanes, alternating directions, staggered. */}
      {target && !scene.floating && scene.fish.map((f, i) => {
        if (caughtSet.has(i)) return null;
        const lane = i % 3;
        const dir = lane === 1 ? 'l' : 'r';
        // One speed per lane, fish evenly spaced along it, so they never overlap.
        const dur = [15, 18, 16][lane];
        const perLane = Math.ceil(scene.fish.length / 3);
        const slot = Math.floor(i / 3);
        return (
          <button
            key={i}
            onClick={(e) => tapFish(i, e)}
            aria-label={`${f.colorWord.toLowerCase()} ${f.shape} fish`}
            className="absolute left-0 z-20 h-[13vh] w-[21vh]"
            style={{ top: `${55 + lane * 12.5}%`, animation: `lep1-swim-${dir} ${dur}s linear ${-((slot / perLane) * dur + lane * 2)}s infinite` }}
          >
            <span className={`block h-full w-full ${wrong === i ? 'animate-[lep1-shake_0.4s_ease-in-out]' : 'animate-[lep1-bob_2s_ease-in-out_infinite]'}`}>
              <Fish shape={f.shape} colorHex={f.colorHex} />
            </span>
          </button>
        );
      })}

      {/* The bucket of catches */}
      <div className="absolute bottom-[3%] left-3 z-30 flex items-center gap-2 rounded-3xl bg-white/90 px-3 py-2 shadow-xl">
        <span className="text-2xl">🪣</span>
        {caught.map((i) => scene.fish[i] && (
          <span key={i} className="block h-8 w-8 animate-[lep1-pop_0.4s_ease-out]">{scene.fish[i].img ? <img src={scene.fish[i].img} alt="" className="h-full w-full object-contain" /> : <ShapeIcon shape={scene.fish[i].shape} fill={scene.fish[i].colorHex} />}</span>
        ))}
        {Array.from({ length: Math.max(0, total - caught.length) }, (_, k) => (
          <span key={`e${k}`} className="block h-8 w-8 rounded-full border-[3px] border-dashed border-sky-300 bg-sky-50" />
        ))}
      </div>
      {!target && (
        <div className="absolute inset-x-0 bottom-[30%] z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      )}
      <Bursts items={bursts} />
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function shapeFishingLines(scene: Extract<Scene, { kind: 'shape-fishing' }>) {
  return scene.targets.flatMap((i) => {
    const f = scene.fish[i];
    return f ? [[scene.who, catchLine(f.colorWord, f.shape, f)], [scene.who, caughtLine(f.colorWord, f.shape, f)]] : [];
  });
}
