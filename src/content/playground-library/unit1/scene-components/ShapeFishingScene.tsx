import { useEffect, useMemo } from 'react';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { ShapeIcon, sayWithin } from './shared';

/* ---------- Shape Fishing ----------
 * The classroom "go fishing" game (paper fish with a shape on each, caught
 * with a magnet rod while the child says the shape) as used in ESL classes
 * and kids' shape apps: fish swim past, each carrying a coloured shape; the
 * voice says "Catch a blue triangle!" and the child taps that fish. Every
 * catch is said back ("A blue triangle! Splash!"). Leads into Lesson 5's
 * Rainbow Fish. */

export function catchLine(colorWord: string, shape: string) {
  return `Catch a ${colorWord.toLowerCase()} ${shape}!`;
}
export function caughtLine(colorWord: string, shape: string) {
  return `You caught a ${colorWord.toLowerCase()} ${shape}!`;
}

function Fish({ shape, colorHex }: { shape: string; colorHex: string }) {
  return (
    <svg viewBox="0 0 120 70" className="h-full w-full drop-shadow-lg" aria-hidden>
      <polygon points="18,35 0,12 0,58" fill="#FDBA74" stroke="#2B1E17" strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="66" cy="35" rx="50" ry="30" fill="#FEF3C7" stroke="#2B1E17" strokeWidth="3" />
      <circle cx="98" cy="28" r="5" fill="#2B1E17" />
      <circle cx="99.5" cy="26.5" r="1.6" fill="#fff" />
      <foreignObject x="44" y="14" width="42" height="42"><ShapeIcon shape={shape} fill={colorHex} /></foreignObject>
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

  useEffect(() => {
    if (!target) return;
    const t = window.setTimeout(() => cueSpeak(catchLine(target.colorWord, target.shape), scene.who), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const tapFish = async (i: number) => {
    const f = scene.fish[i];
    if (!target || !f || busy || caughtSet.has(i)) return;
    if (f.colorWord !== target.colorWord || f.shape !== target.shape) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, caught: [...s.caught, i], busy: true }));
    await sayWithin(caughtLine(f.colorWord, f.shape), scene.who);
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, busy: false, gemDone: s.gemDone || awardGem }));
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[30%] bg-gradient-to-b from-sky-400/30 to-blue-700/50" />

      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {target ? `🎣 ${catchLine(target.colorWord, target.shape)}` : '🪣 What a big catch!'}
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{Math.min(round + 1, total)}/{total}</span>
      </div>
      {target && (
        <button onClick={() => cueSpeak(catchLine(target.colorWord, target.shape), scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>
      )}

      {/* Swimming fish: three lanes, alternating directions, staggered. */}
      {target && scene.fish.map((f, i) => {
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
            onClick={() => tapFish(i)}
            aria-label={`${f.colorWord.toLowerCase()} ${f.shape} fish`}
            className="absolute left-0 z-20 h-[15vh] w-[26vh]"
            style={{ top: `${36 + lane * 19}%`, animation: `lep1-swim-${dir} ${dur}s linear ${-((slot / perLane) * dur + lane * 2)}s infinite` }}
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
          <span key={i} className="block h-8 w-8 animate-[lep1-pop_0.4s_ease-out]"><ShapeIcon shape={scene.fish[i].shape} fill={scene.fish[i].colorHex} /></span>
        ))}
      </div>
      {!target && (
        <div className="absolute inset-x-0 bottom-[30%] z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      )}
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function shapeFishingLines(scene: Extract<Scene, { kind: 'shape-fishing' }>) {
  return scene.targets.flatMap((i) => {
    const f = scene.fish[i];
    return f ? [[scene.who, catchLine(f.colorWord, f.shape)], [scene.who, caughtLine(f.colorWord, f.shape)]] : [];
  });
}
