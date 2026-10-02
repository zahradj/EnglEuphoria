import { useEffect, useMemo, useRef } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak, cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { ShapeSwatchStyle } from './shared';

function buildShapeSentence(shapeWord: string, exampleWord: string): string {
  return `The ${exampleWord.toLowerCase()} is a ${shapeWord.toLowerCase()}.`;
}

/* ---------- Shape model (teach: tap the shape, repeat, learn the object, say the sentence) ---------- */

export function ShapeModelScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'shape-model' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  // Each *Done field is a plain number[] (not a Set) so it survives the
  // JSON broadcast round-trip.
  const [state, setState] = useSyncedState(sync, {
    activeIdx: null as number | null,
    heard: [] as number[],
    shapeDone: [] as number[],
    objectDone: [] as number[],
    sentenceDone: [] as number[],
    held: false,
  });
  const { activeIdx, heard, shapeDone, objectDone, sentenceDone, held } = state;
  const heardSet = useMemo(() => new Set(heard), [heard]);
  const shapeDoneSet = useMemo(() => new Set(shapeDone), [shapeDone]);
  const objectDoneSet = useMemo(() => new Set(objectDone), [objectDone]);
  const sentenceDoneSet = useMemo(() => new Set(sentenceDone), [sentenceDone]);
  const holdTimer = useRef<number | null>(null);
  const gemDone = useRef(false);
  const allDone = sentenceDone.length >= scene.items.length;

  useEffect(() => {
    if (allDone && !gemDone.current) {
      gemDone.current = true;
      onWin(true);
      const sentences = scene.items.map((it) => buildShapeSentence(it.shapeWord, it.exampleWord)).join(' ');
      cueSpeak(`Wonderful! ${sentences}`, 'pip');
    }
  }, [allDone]);

  const addOnce = (arr: number[], i: number) => (arr.includes(i) ? arr : [...arr, i]);

  const tapItem = async (i: number) => {
    if (held) return;
    setState((s) => ({ ...s, activeIdx: i, heard: addOnce(s.heard, i) }));
    sfx.pop();
    await safeSpeak(scene.items[i].shapeWord, scene.items[i].who);
  };

  const startHoldShape = (i: number) => {
    setState((s) => ({ ...s, held: true }));
    holdTimer.current = window.setTimeout(async () => {
      setState((s) => ({ ...s, held: false, shapeDone: addOnce(s.shapeDone, i) }));
      sfx.gem();
      const item = scene.items[i];
      await new Promise((r) => window.setTimeout(r, 400));
      await safeSpeak(item.exampleWord, item.who);
    }, 1200);
  };

  const startHoldObject = (i: number) => {
    setState((s) => ({ ...s, held: true }));
    holdTimer.current = window.setTimeout(async () => {
      setState((s) => ({ ...s, held: false, objectDone: addOnce(s.objectDone, i) }));
      sfx.gem();
      const item = scene.items[i];
      await new Promise((r) => window.setTimeout(r, 400));
      await safeSpeak(buildShapeSentence(item.shapeWord, item.exampleWord), item.who);
    }, 1200);
  };

  const startHoldSentence = (i: number) => {
    setState((s) => ({ ...s, held: true }));
    holdTimer.current = window.setTimeout(() => {
      setState((s) => ({ ...s, held: false, sentenceDone: addOnce(s.sentenceDone, i) }));
      sfx.gem();
    }, 1200);
  };
  const endHold = () => { setState((s) => ({ ...s, held: false })); if (holdTimer.current) window.clearTimeout(holdTimer.current); };

  return (
    <div className="absolute inset-0">
      <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center px-4">
        <div className="max-w-lg rounded-2xl bg-white/95 px-5 py-3 text-center text-base font-bold text-orange-800 shadow-xl backdrop-blur sm:text-lg">
          {allDone ? 'You know the words and the sentences! ⭐' : scene.teacher}
        </div>
      </div>

      <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 flex-wrap items-start justify-center gap-6 px-4 sm:gap-10">
        {scene.items.map((item, i) => {
          const isActive = activeIdx === i;
          const isHeard = heardSet.has(i);
          const isShapeDone = shapeDoneSet.has(i);
          const isObjectDone = objectDoneSet.has(i);
          const isSentenceDone = sentenceDoneSet.has(i);
          return (
            <div key={item.shapeWord} className="flex flex-col items-center gap-2">
              <button
                onClick={() => tapItem(i)}
                className={`grid h-36 w-36 place-items-center border-8 border-white shadow-2xl transition active:scale-95 sm:h-44 sm:w-44 ${isSentenceDone ? '' : 'animate-[lep1-wiggle_4s_ease-in-out_infinite]'}`}
                style={{ ...ShapeSwatchStyle(item.shapeWord, item.shapeColor), animationDelay: `${i * 0.4}s` }}
                aria-label={`Hear ${item.shapeWord}`}
              >
                <img src={item.exampleImg} alt={item.exampleWord} className="h-20 w-20 object-contain drop-shadow-lg sm:h-24 sm:w-24" />
              </button>
              <span className="rounded-full bg-white px-4 py-1 text-lg font-black uppercase shadow" style={{ color: item.shapeColor }}>{item.shapeWord}</span>
              {isShapeDone && (
                <span className="rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-slate-700 shadow">{item.exampleWord}</span>
              )}
              {isObjectDone && (
                <span className="max-w-[10rem] rounded-2xl bg-white px-3 py-1 text-center text-xs font-bold text-slate-800 shadow sm:text-sm">{buildShapeSentence(item.shapeWord, item.exampleWord)}</span>
              )}
              {isSentenceDone ? (
                <span className="text-2xl">✅</span>
              ) : isObjectDone ? (
                <button
                  onPointerDown={() => startHoldSentence(i)} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
                  className={`rounded-full px-5 py-2 text-sm font-black text-white shadow-lg transition ${held ? 'scale-95' : 'animate-pulse'}`}
                  style={{ background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)' }}
                >
                  🎤 Say the sentence!
                </button>
              ) : isShapeDone ? (
                <button
                  onPointerDown={() => startHoldObject(i)} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
                  className={`rounded-full px-5 py-2 text-sm font-black text-white shadow-lg transition ${held ? 'scale-95' : 'animate-pulse'}`}
                  style={{ background: 'linear-gradient(90deg, #22C55E, #34D399)' }}
                >
                  🎤 Say the word!
                </button>
              ) : isHeard && isActive ? (
                <button
                  onPointerDown={() => startHoldShape(i)} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
                  className={`rounded-full px-5 py-2 text-sm font-black text-white shadow-lg transition ${held ? 'scale-95' : 'animate-pulse'}`}
                  style={{ background: 'linear-gradient(90deg, #FE6A2F, #FF8A4C)' }}
                >
                  🎤 Hold & repeat
                </button>
              ) : (
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-orange-700 shadow">Tap to hear</span>
              )}
            </div>
          );
        })}
      </div>

      {allDone && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95" style={{ animation: 'lep1-slide-up 0.4s ease-out' }}>
            Now let's practice →
          </button>
        </div>
      )}
    </div>
  );
}
