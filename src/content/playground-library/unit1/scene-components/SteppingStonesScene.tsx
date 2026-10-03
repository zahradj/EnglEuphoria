import { useEffect } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, ThingArt, sayWithin } from './shared';

/* ---------- Stepping Stones ----------
 * The classic classroom floor game ("Jump on the red circle!") and the
 * river-crossing levels of kids' apps: the character must cross a river.
 * Each round three stones float ahead, each carrying a picture or a
 * coloured shape; the voice names one. Tap it and the character hops on;
 * the wrong stone wobbles and sinks back (no lives lost for good). On the
 * far bank waits the goal. Listening = moving forward. */

type Stones = Extract<Scene, { kind: 'stepping-stones' }>;
const LANES = [42, 61, 80]; // y % of the three stones in a column

export function SteppingStonesScene({ scene, onWin, onLose, onNext, sync }: { scene: Stones; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    step: 0, // rounds crossed
    path: [] as number[], // lane picked in each crossed round
    wrong: -1,
    hopping: false,
    arrived: false,
    gemDone: false,
  });
  const { step, path, wrong, hopping, arrived, gemDone } = state;
  const total = scene.rounds.length;
  const r = step < total ? scene.rounds[step] : undefined;
  const colX = (k: number) => 12 + ((k + 1) * 76) / (total + 1); // column k centre (%)

  useEffect(() => {
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, scene.id]);

  const tap = async (lane: number) => {
    if (!r || hopping || !r.options[lane]) return;
    if (lane !== r.answer) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: lane }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 800);
      return;
    }
    sfx.pop();
    setState((s) => ({ ...s, hopping: true, path: [...s.path.slice(0, step), lane] }));
    await sayWithin(r.reply, scene.who, 3500);
    const next = step + 1;
    if (next >= total) {
      setState((s) => ({ ...s, step: next, hopping: false, arrived: true }));
      sfx.gem();
      await sayWithin(scene.goal.line, scene.who, 4500);
      if (!gemDone) { onWin(true); setState((s) => ({ ...s, gemDone: true })); }
      return;
    }
    setState((s) => ({ ...s, step: next, hopping: false }));
  };

  // Where the character stands: the bank, or the last stone it hopped on.
  const at = arrived
    ? { x: 91, y: 58 }
    : step === 0 && !hopping
      ? { x: 7, y: 58 }
      : (() => { const k = hopping ? step : step - 1; const lane = path[k] ?? 1; return { x: colX(k), y: LANES[lane] }; })();
  const walker = CAST[scene.walker];

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      {arrived && <Confetti count={70} />}
      {/* The river */}
      <div className="absolute inset-x-[12%] bottom-[4%] top-[30%] overflow-hidden rounded-[48px] shadow-inner" style={{ background: 'linear-gradient(180deg,#7DD3FC 0%,#38BDF8 45%,#0EA5E9 100%)' }}>
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(ellipse 40px 6px at 50% 50%, #fff 40%, transparent 60%)', backgroundSize: '120px 46px', animation: 'lep1-track 6s linear infinite' }} />
      </div>
      {/* Banks */}
      <div className="absolute bottom-[4%] left-0 top-[30%] w-[13%] rounded-r-[40px] bg-gradient-to-b from-lime-300 to-green-500 shadow-lg" />
      <div className="absolute bottom-[4%] right-0 top-[30%] w-[13%] rounded-l-[40px] bg-gradient-to-b from-lime-300 to-green-500 shadow-lg" />

      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {r ? `🐸 ${r.line}` : `🎉 ${scene.goal.line}`}
        {r && <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{step + 1}/{total}</span>}
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>}

      {/* Stones already crossed stay; the current column floats in. */}
      {scene.rounds.map((round, k) => {
        if (k > step) return null;
        return round.options.map((o, lane) => {
          const crossed = k < step || (k === step && hopping);
          const chosen = path[k] === lane;
          if (crossed && !chosen) return null;
          const isNow = k === step && !hopping;
          return (
            <button
              key={`${k}-${lane}`}
              onClick={() => isNow && tap(lane)}
              disabled={!isNow}
              aria-label={o.label}
              className={`absolute z-10 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ${wrong === lane && isNow ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}
              style={{
                left: `${colX(k)}%`, top: `${LANES[lane]}%`, width: 'min(15vh,11vw)', aspectRatio: '1',
                background: 'radial-gradient(circle at 35% 30%, #F5F5F4 0, #A8A29E 60%, #78716C 100%)',
                boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.18), 0 8px 0 rgba(12,74,110,0.35)',
                animation: isNow ? `lep1-bob ${1.4 + lane * 0.2}s ease-in-out infinite` : undefined,
                transform: wrong === lane && isNow ? 'translate(-50%,-38%)' : undefined,
                opacity: wrong === lane && isNow ? 0.6 : 1,
              }}
            >
              <span className="block h-[68%] w-[68%]"><ThingArt thing={o} /></span>
            </button>
          );
        });
      })}

      {/* The goal on the far bank */}
      <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: '93.5%', top: '44%', width: '9%' }}>
        <img src={scene.goal.img} alt={scene.goal.label} draggable={false} className="w-full" style={{ filter: STICKER_FILTER, animation: arrived ? 'lep1-wobble 1s ease-in-out infinite' : undefined }} />
      </div>

      {/* The character hops (transition) to where it stands */}
      <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[88%] transition-all duration-700" style={{ left: `${at.x}%`, top: `${at.y}%`, width: '9%', transitionTimingFunction: 'cubic-bezier(.3,1.6,.5,1)' }}>
        <img src={walker.img} alt={walker.name} draggable={false} className="w-full" style={{ filter: STICKER_FILTER }} />
      </div>

      {arrived && (
        <div className="absolute inset-x-0 bottom-[8%] z-30 flex justify-center">
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </div>
      )}
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function steppingStonesLines(scene: Stones) {
  return [...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]), [scene.who, scene.goal.line]] as [string, string][];
}
