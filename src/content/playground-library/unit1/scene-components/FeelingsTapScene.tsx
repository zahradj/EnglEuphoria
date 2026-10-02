import { useMemo } from 'react';
import type { Scene } from '../scenes';
import { CAST, getEmotionSprite } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { SpriteMascot, MASCOT_EYE_BANDS } from '../SpriteMascot';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { FEELING_EMOJI } from './shared';

/* ---------- Feelings tap ---------- */

export function FeelingsTapScene({ scene, onNext, sync }: { scene: Extract<Scene, { kind: 'feelings-tap' }>; onNext: () => void; sync?: ActivitySync }) {
  // `tapped` is a plain number[] (not a Set) so it survives the JSON
  // broadcast round-trip.
  const [state, setState] = useSyncedState(sync, { tapped: [] as number[], active: null as number | null, talkingIdx: null as number | null });
  const { tapped, active, talkingIdx } = state;
  const tappedSet = useMemo(() => new Set(tapped), [tapped]);
  const total = scene.cast.length;
  const spots = useMemo(() => {
    const leftPad = total <= 3 ? 18 : 12;
    const step = total > 1 ? (100 - leftPad * 2) / (total - 1) : 0;
    return scene.cast.map((_, i) => ({ leftPct: leftPad + step * i }));
  }, [scene.cast, total]);

  const tap = async (i: number) => {
    sfx.pop();
    setState((s) => ({ ...s, active: i, tapped: s.tapped.includes(i) ? s.tapped : [...s.tapped, i], talkingIdx: i }));
    const { who, label } = scene.cast[i];
    await safeSpeak(label, who);
    setState((s) => (s.talkingIdx === i ? { ...s, talkingIdx: null } : s));
  };

  const allTapped = tapped.length >= total;

  return (
    <div className="absolute inset-0 z-10 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
        <div className="pointer-events-auto max-w-lg rounded-3xl bg-white/90 px-5 py-3 text-center text-sm font-black text-orange-700 shadow-lg backdrop-blur sm:text-base">{scene.teacher}</div>
      </div>
      {scene.cast.map((c, i) => {
        const cast = CAST[c.who];
        const isActive = active === i;
        const isDone = tappedSet.has(i);
        return (
          <button key={i} onClick={() => tap(i)} aria-label={`Tap ${cast.name}`}
            className="absolute bottom-8 z-20 grid place-items-end"
            style={{ left: `${spots[i].leftPct}%`, height: '58%', width: 'auto', aspectRatio: '0.72', transform: `translateX(-50%) scale(${isActive ? 1.1 : 1})`, transition: 'transform 0.3s ease-out' }}
          >
            <div className="pointer-events-none h-full w-full" style={{ filter: isDone ? 'drop-shadow(0 12px 18px rgba(34,197,94,0.55))' : 'drop-shadow(0 10px 14px rgba(0,0,0,0.4))' }}>
              <SpriteMascot
                profile={{ src: getEmotionSprite(c.who, c.emotion), eyeBand: MASCOT_EYE_BANDS[c.who] }}
                emotion={c.emotion}
                isTalking={talkingIdx === i}
                alt={cast.name}
              />
            </div>
            {isDone && (
              <div className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 rounded-2xl bg-white/95 px-4 py-2 text-center shadow-2xl ring-2 ring-orange-200 animate-[lep1-pop_0.4s_ease-out]">
                <span className="text-2xl">{FEELING_EMOJI[c.emotion]}</span>
                <p className="text-sm font-black" style={{ color: cast.color }}>{c.label}</p>
              </div>
            )}
          </button>
        );
      })}
      <div className="absolute inset-x-0 bottom-4 flex justify-center">
        {allTapped
          ? <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95 animate-[lep1-slide-up_0.4s_ease-out]">Great job! Next →</button>
          : <div className="rounded-full bg-white/85 px-4 py-2 text-xs font-black text-orange-700 shadow">👉 Tap each friend ({tapped.length}/{total})</div>}
      </div>
    </div>
  );
}
