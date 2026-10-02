import { useMemo } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { BALLOONS_SPRITE } from './shared';

export function AgeBalloonsScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'age-balloons' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  // `tapped` is a plain number[] (not a Set) so it survives the JSON
  // broadcast round-trip.
  const [state, setState] = useSyncedState(sync, { tapped: [] as number[], active: null as number | null });
  const { tapped, active } = state;
  const tappedSet = useMemo(() => new Set(tapped), [tapped]);
  const total = scene.friends.length;
  const allDone = tapped.length >= total;

  const tapFriend = async (i: number) => {
    if (tappedSet.has(i)) return;
    const f = scene.friends[i];
    const nextTapped = [...tapped, i];
    setState((s) => ({ ...s, active: i, tapped: nextTapped }));
    sfx.pop();
    await safeSpeak(`${CAST[f.who].name} is ${f.age}!`, f.who);
    if (nextTapped.length >= total) { sfx.gem(); onWin(true); }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 px-4 text-center">
        <span className="w-fit rounded-full bg-white/90 px-4 py-1 text-xs font-black uppercase tracking-widest text-orange-700 shadow">🎈 {tapped.length}/{total}</span>
        <span className="max-w-lg rounded-full bg-white/95 px-5 py-2 text-sm font-bold text-orange-800 shadow-xl backdrop-blur sm:text-base">{scene.teacher}</span>
      </div>
      {scene.friends.map((f, i) => {
        const c = CAST[f.who];
        const isDone = tappedSet.has(i);
        const n = scene.friends.length;
        return (
          <button
            key={i}
            onClick={() => void tapFriend(i)}
            className="absolute bottom-0 flex flex-col items-center pb-4"
            style={{ left: `${(i / n) * 100}%`, width: `${(1 / n) * 100 * 1.35}%` }}
          >
            <img
              src={BALLOONS_SPRITE[f.who] ?? c.img}
              alt={c.name}
              className="pointer-events-none w-full object-contain drop-shadow-2xl"
              style={{ animation: active === i ? 'lep1-pop 0.4s ease-out' : undefined }}
            />
            <span className="mt-2 rounded-full bg-white/95 px-4 py-1 text-sm font-black shadow" style={{ color: isDone ? undefined : c.color }}>
              {isDone ? `${c.name} is ${f.age}! ⭐` : c.name}
            </span>
          </button>
        );
      })}
      {allDone && <button onClick={onNext} className="absolute inset-x-0 bottom-6 z-20 mx-auto w-fit rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">Next →</button>}
    </div>
  );
}
