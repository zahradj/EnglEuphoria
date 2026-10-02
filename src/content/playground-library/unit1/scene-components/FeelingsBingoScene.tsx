import { useEffect, useMemo } from 'react';
import type { Scene } from '../scenes';
import { CAST, getEmotionSprite } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Feelings bingo ---------- */

export function FeelingsBingoScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'feelings-bingo' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  // `hits` is a plain number[] (not a Set) so it survives the JSON
  // broadcast round-trip.
  const [state, setState] = useSyncedState(sync, { callIdx: 0, hits: [] as number[], wrongTile: null as number | null, gemDone: false });
  const { callIdx, hits, wrongTile, gemDone } = state;
  const hitsSet = useMemo(() => new Set(hits), [hits]);
  const total = scene.rounds.length;
  const finished = callIdx >= total;
  const round = !finished ? scene.rounds[callIdx] : null;
  const cols = scene.tiles.length > 4 ? 3 : 2;

  useEffect(() => {
    if (!round) return;
    const t = window.setTimeout(() => void safeSpeak(round.prompt, 'teacher'), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callIdx]);

  const tapTile = async (i: number) => {
    if (!round || finished) return;
    const tile = scene.tiles[i];
    if (tile.who === round.who && tile.emotion === round.emotion) {
      sfx.match();
      const nextHits = hits.includes(i) ? hits : [...hits, i];
      setState((s) => ({ ...s, hits: nextHits }));
      await safeSpeak(`Yes! ${CAST[tile.who].name} is ${tile.emotion}!`, tile.who);
      const next = callIdx + 1;
      const awardGem = next >= total && !gemDone;
      if (awardGem) { sfx.gem(); onWin(true); }
      setState((s) => ({ ...s, callIdx: next, gemDone: s.gemDone || awardGem }));
    } else {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrongTile: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrongTile: null })), 500);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 bg-cover bg-center px-4 pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="relative z-20 max-w-lg rounded-full bg-white/95 px-5 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">
        {finished ? '🎉 BINGO! You found every friend!' : <>🔊 {round!.prompt} <span className="ml-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{callIdx + 1}/{total}</span></>}
      </div>
      <div className="relative z-10 grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
        {scene.tiles.map((tile, i) => {
          const c = CAST[tile.who];
          const isHit = hitsSet.has(i);
          return (
            <button key={i} onClick={() => tapTile(i)} disabled={finished}
              className={`relative grid aspect-square w-24 place-items-center rounded-3xl border-4 bg-white/90 p-2 shadow-xl transition active:scale-95 disabled:opacity-90 sm:w-28 ${wrongTile === i ? 'animate-[lep1-shake_0.4s_ease-out] border-rose-400' : isHit ? 'border-green-400 ring-4 ring-green-300/60' : 'border-white'}`}
            >
              <img src={getEmotionSprite(tile.who, tile.emotion)} alt={c.name} className="h-full w-full object-contain" draggable={false} />
              {isHit && <span className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-green-500 text-lg text-white shadow-lg">✓</span>}
            </button>
          );
        })}
      </div>
      {finished && (
        <div className="relative z-30 flex flex-col items-center">
          <Confetti />
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      )}
    </div>
  );
}
