import { useEffect } from 'react';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { STICKER_TILTS, ShapeIcon, StickerButton, sayWithin } from './shared';

/* ---------- Which One Is Different? (odd one out) ----------
 * The "which one doesn't belong?" classification game from Khan Academy
 * Kids / Lingokids sorting activities and the classic preschool "odd one
 * out" worksheet: four pictures, three share a colour (or a shape), one is
 * different. The voice asks "Which one is different?"; the child taps it and
 * hears why ("It's blue! The others are red."). Trains noticing the colour /
 * shape word as the thing that groups objects — no reading needed. */

export const ODD_QUESTION = 'Which one is different?';

type Round = Extract<Scene, { kind: 'odd-one-out' }>['rounds'][number];

export function OddOneOutScene({ scene, onWin, onLose, onNext, sync }: { scene: Extract<Scene, { kind: 'odd-one-out' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    solved: false,
    wrong: -1,
    gemDone: false,
  });
  const { round, solved, wrong, gemDone } = state;
  const total = scene.rounds.length;
  const r: Round | undefined = round < total ? scene.rounds[round] : undefined;

  useEffect(() => {
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(ODD_QUESTION, scene.who), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const tap = async (i: number) => {
    if (!r || solved || !r.items[i]) return;
    if (i !== r.odd) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, solved: true }));
    await sayWithin(r.line, scene.who, 4500);
    await new Promise((res) => setTimeout(res, 900));
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, solved: false, wrong: -1, gemDone: s.gemDone || awardGem }));
  };

  if (!r) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center gap-4 px-4">
          <div className="rounded-3xl bg-white px-8 py-3 text-center text-2xl font-black text-orange-600 shadow-2xl">🔍 Super detective! You found them all!</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {solved ? `🎉 ${r.line}` : `🔍 ${ODD_QUESTION}`}
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </div>
      <button onClick={() => cueSpeak(solved ? r.line : ODD_QUESTION, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>

      {/* Cards on the open right side, so the character in the picture stays visible. */}
      <div className="absolute bottom-[9%] right-[4%] top-[14%] z-20 flex w-[58%] items-center justify-center">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {r.items.map((it, i) => {
            const isOdd = i === r.odd;
            return (
              <StickerButton
                key={`${round}-${i}`}
                onClick={() => tap(i)}
                label={it.label}
                tilt={STICKER_TILTS[(i + round) % STICKER_TILTS.length]}
                state={wrong === i ? 'wrong' : solved && isOdd ? 'right' : solved ? 'dim' : undefined}
                delay={i * 0.08}
              >
                {it.img
                  ? <img src={it.img} alt="" draggable={false} className="h-full w-full object-contain" />
                  : <span className="block h-full w-full p-[8%]"><ShapeIcon shape={it.shape ?? 'circle'} fill={it.colorHex ?? '#ccc'} /></span>}
              </StickerButton>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function oddOneOutLines(scene: Extract<Scene, { kind: 'odd-one-out' }>) {
  return [[scene.who, ODD_QUESTION] as [string, string], ...scene.rounds.map((r) => [scene.who, r.line] as [string, string])];
}
