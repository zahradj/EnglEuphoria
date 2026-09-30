import { useEffect, useRef } from 'react';
import { SpinWheel, SPIN_DURATION_MS, pickSpinWinner, spinTargetRotation } from '@/components/classroom/shared/SpinWheel';
import { type ActivitySync, useSyncedState } from './sceneActivitySync';
import { cueSpeak } from './unit1/audio';
import * as sfx from './unit1/sfx';

/**
 * `spin-wheel` — the universal "Spin!" activity, shared by every scene
 * library (Welcome Town / Magic Castle / Jungle Adventure and Pre-A1 Unit 1).
 *
 * A picture scene with numbered badges (1..N) placed on things in the art,
 * plus the same numbered spinner the teacher's classroom Spin Wheel tool
 * uses. Whoever has the floor presses SPIN; the wheel lands on a number, that
 * badge lights up, and the student says the word for it. Tapping a badge
 * picks it directly — the "do it without the spinner" route the teacher
 * notes usually offer.
 *
 * Authoring (see .claude/skills/activity-pattern-library):
 *  - 2-8 items; each `left`/`top` is a % position of its badge on `bg`.
 *  - `label` is the target word/phrase (spoken by 🔊 and revealed on demand).
 *  - Give `emoji`/`img` only when the picture isn't already painted in `bg`.
 *  - `teacher` is the private teacher note, e.g. "Have the student spin the
 *    wheel and say the word that matches the number. If you prefer, do the
 *    activity without the spinner."
 */
export interface SpinWheelItem {
  label: string;
  left: string;
  top: string;
  emoji?: string;
  img?: string;
}

export interface SpinWheelSceneData {
  id: string;
  kind: 'spin-wheel';
  bg: string;
  teacher: string;
  /** Banner text; defaults to "Spin!". Use '' when `bg` already has one. */
  title?: string;
  items: SpinWheelItem[];
  /** Wheel centre as % of the scene; defaults to the middle. */
  wheelAt?: { left: string; top: string };
}

interface SpinState {
  rotation: number;
  spinning: boolean;
  /** Number the wheel landed on / the badge that was picked (1-based). */
  result: number | null;
  /** Whether the word for `result` has been revealed. */
  revealed: boolean;
  /** Numbers already practised this round. */
  said: number[];
}

const INITIAL: SpinState = { rotation: 0, spinning: false, result: null, revealed: false, said: [] };

export function SpinWheelScene({ scene, onNext, onWin, sync }: {
  scene: SpinWheelSceneData;
  onNext: () => void;
  onWin: (gem: boolean) => void;
  sync?: ActivitySync;
}) {
  const items = scene.items.slice(0, 8);
  const count = Math.max(2, items.length);
  const [state, setState] = useSyncedState<SpinState>(sync, INITIAL);
  const { rotation, spinning, result, revealed, said } = state;
  const isMirror = !!sync?.isSynced && !sync.isAuthority;
  const landTimer = useRef<number | null>(null);
  const gemDone = useRef(false);

  useEffect(() => {
    setState(INITIAL);
    gemDone.current = false;
    return () => { if (landTimer.current) window.clearTimeout(landTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  const allSaid = said.length >= items.length;
  useEffect(() => {
    if (allSaid && !gemDone.current && !isMirror) {
      gemDone.current = true;
      sfx.gem();
      onWin(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSaid]);

  const markPicked = (n: number) =>
    setState((s) => ({ ...s, spinning: false, result: n, revealed: false, said: s.said.includes(n) ? s.said : [...s.said, n] }));

  const spin = () => {
    if (spinning || isMirror) return;
    // Prefer numbers not practised yet, so a round covers every picture.
    const winner = pickSpinWinner(count, said.length < items.length ? said : result ? [result] : []);
    const next = spinTargetRotation(rotation, winner, count, Math.random() * 2 - 1);
    sfx.click();
    setState((s) => ({ ...s, rotation: next, spinning: true, result: null, revealed: false }));
    if (landTimer.current) window.clearTimeout(landTimer.current);
    landTimer.current = window.setTimeout(() => {
      sfx.reveal();
      markPicked(winner);
    }, SPIN_DURATION_MS);
  };

  const pickDirectly = (n: number) => {
    if (spinning || isMirror) return;
    sfx.pop();
    markPicked(n);
  };

  const hear = () => {
    if (result == null) return;
    cueSpeak(items[result - 1]?.label ?? '', 'teacher');
    if (!isMirror) setState((s) => ({ ...s, revealed: true }));
  };

  const title = scene.title ?? 'Spin!';
  const wheelLeft = scene.wheelAt?.left ?? '50%';
  const wheelTop = scene.wheelAt?.top ?? '55%';
  const current = result != null ? items[result - 1] : null;

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      {title && (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4">
          <div
            className="rounded-2xl border-4 border-[#B98A45] bg-[#EACB8E] px-10 py-2 text-4xl text-[#3F3222] shadow-xl sm:text-5xl"
            style={{ fontFamily: "'Bungee', 'Fredoka', system-ui, sans-serif" }}
          >
            {title}
          </div>
        </div>
      )}

      {/* Numbered badges (tap = pick without the spinner) */}
      {items.map((item, i) => {
        const n = i + 1;
        const isResult = result === n && !spinning;
        const isSaid = said.includes(n);
        return (
          <button
            key={`${scene.id}-${n}`}
            type="button"
            onClick={() => pickDirectly(n)}
            disabled={isMirror || spinning}
            aria-label={`Number ${n}`}
            className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 disabled:cursor-default"
            style={{ left: item.left, top: item.top }}
          >
            {(item.img || item.emoji) && (
              <span className={`grid h-20 w-20 place-items-center rounded-2xl bg-white/90 shadow-lg transition ${isResult ? 'scale-110 ring-4 ring-amber-400' : ''}`}>
                {item.img ? <img src={item.img} alt="" className="h-16 w-16 object-contain" /> : <span className="text-5xl">{item.emoji}</span>}
              </span>
            )}
            <span
              className={`relative grid h-14 w-14 place-items-center rounded-full border-[3px] border-[#3B2F12] bg-[#FBC531] text-3xl font-black text-[#1F1A0E] shadow-lg transition ${
                isResult ? 'scale-125 ring-4 ring-white animate-pulse' : ''
              }`}
              style={{ fontFamily: "'Fredoka', 'Nunito', system-ui, sans-serif" }}
            >
              {n}
              {isSaid && !isResult && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-[11px] text-white ring-2 ring-white">✓</span>
              )}
            </span>
          </button>
        );
      })}

      {/* The shared spinner */}
      <div className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: wheelLeft, top: wheelTop }}>
        <SpinWheel
          count={count}
          rotation={rotation}
          spinning={spinning}
          highlight={result}
          size="min(36vh, 30vw)"
          onSpin={isMirror ? undefined : spin}
        />
      </div>

      {/* Result prompt: say the word; 🔊 models and reveals it */}
      {current && !spinning && (
        <div className="absolute inset-x-0 bottom-6 z-30 flex flex-col items-center gap-3 px-4">
          <div className="flex items-center gap-3 rounded-full bg-white/95 px-5 py-2.5 text-lg font-black text-slate-800 shadow-xl sm:text-xl">
            <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#3B2F12] bg-[#FBC531] text-lg">{result}</span>
            <span>{revealed ? current.label : 'What is it? Say it!'}</span>
            <button type="button" onClick={hear} className="rounded-full bg-orange-100 px-3 py-1 text-base text-orange-700 active:scale-95" aria-label="Hear the word">
              🔊
            </button>
          </div>
          {allSaid && (
            <button type="button" onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-3 text-xl font-black text-white shadow-2xl active:scale-95">
              Next ⭐
            </button>
          )}
        </div>
      )}
    </div>
  );
}
