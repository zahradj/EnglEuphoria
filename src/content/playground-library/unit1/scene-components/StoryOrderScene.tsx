import { useMemo } from 'react';
import type { Scene } from '../scenes';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { sayWithin } from './shared';

/* ---------- Story Order (jumbled pictures → retell) ----------
 * The post-story retell task from storytelling-with-young-learners practice:
 * the story's pictures are jumbled; the child taps them in order (first,
 * then, then, last), each one slots into the story strip, and when it is
 * complete the story is told back in that order. */

const ORDINALS = ['First', 'Then', 'Then', 'Last'];

export function StoryOrderScene({ scene, onWin, onLose, onNext, sync }: { scene: Extract<Scene, { kind: 'story-order' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { placed: [] as number[], wrong: -1, retelling: -1, done: false, gemDone: false });
  const { placed, wrong, retelling, done, gemDone } = state;
  const n = scene.frames.length;
  const placedSet = useMemo(() => new Set(placed), [placed]);
  // A fixed jumble (same on every screen): reverse, then swap the middle pair.
  const jumbled = useMemo(() => {
    const idx = scene.frames.map((_, i) => i).reverse();
    if (idx.length >= 4) [idx[1], idx[2]] = [idx[2], idx[1]];
    return idx;
  }, [scene.frames]);

  const tap = async (i: number) => {
    if (done || retelling >= 0 || placedSet.has(i)) return;
    if (i !== placed.length) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.pop();
    const next = [...placed, i];
    setState((s) => ({ ...s, placed: next }));
    if (next.length < n) return;
    // Complete: tell the story back, picture by picture.
    sfx.reveal();
    for (let k = 0; k < n; k++) {
      setState((s) => ({ ...s, retelling: k }));
      const f = scene.frames[k];
      if (f) await sayWithin(f.caption, f.who ?? scene.who, 6000);
    }
    const awardGem = !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, retelling: -1, done: true, gemDone: true }));
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-black/30" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-lg">
        {done ? '📖 You told the whole story!' : retelling >= 0 ? '📖 Listen to your story!' : `🧩 What happens ${placed.length === 0 ? 'first' : placed.length === n - 1 ? 'last' : 'next'}? Tap the picture!`}
      </div>

      {/* The story strip */}
      <div className="absolute inset-x-0 top-[12%] z-20 flex justify-center gap-3 px-4">
        {scene.frames.map((f, k) => {
          const filled = k < placed.length;
          return (
            <div key={k} className={`flex w-[22%] max-w-[260px] flex-col items-center gap-1 transition ${retelling === k ? 'scale-110' : ''}`}>
              <div className="rounded-full bg-orange-500 px-3 py-0.5 text-xs font-black uppercase tracking-widest text-white shadow">{k + 1} · {ORDINALS[Math.min(k, 3)] ?? ''}</div>
              <div className={`aspect-[16/10] w-full overflow-hidden rounded-2xl border-4 shadow-xl ${filled ? 'border-white' : 'border-dashed border-white/70 bg-white/20'} ${retelling === k ? 'ring-8 ring-yellow-300' : ''}`}>
                {filled && <img src={f.img} alt="" className="h-full w-full object-cover animate-[lep1-pop_0.3s_ease-out]" draggable={false} />}
              </div>
              {filled && <div className="rounded-xl bg-white/95 px-2 py-1 text-center text-xs font-bold text-slate-700 shadow sm:text-sm">{f.caption}</div>}
            </div>
          );
        })}
      </div>

      {/* Jumbled pictures */}
      {!done && (
        <div className="absolute inset-x-0 bottom-[5%] z-30 flex flex-wrap justify-center gap-3 px-4">
          {jumbled.map((i) => {
            const f = scene.frames[i];
            if (!f || placedSet.has(i)) return <div key={i} className="aspect-[16/10] w-[20%] max-w-[230px]" />;
            return (
              <button
                key={i}
                onClick={() => tap(i)}
                aria-label={f.caption}
                className={`aspect-[16/10] w-[20%] max-w-[230px] overflow-hidden rounded-2xl border-4 border-white shadow-2xl transition active:scale-95 ${wrong === i ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : 'hover:-translate-y-1'}`}
              >
                <img src={f.img} alt="" className="h-full w-full object-cover" draggable={false} />
              </button>
            );
          })}
        </div>
      )}
      {done && (
        <div className="absolute inset-x-0 bottom-[8%] z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      )}
    </div>
  );
}
