import { useEffect, useMemo, useRef } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak, cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

function buildToySentence(colorWord: string, toyWord: string, plural?: boolean): string {
  if (plural) return `They are ${colorWord.toLowerCase()} ${toyWord.toLowerCase()}.`;
  return `It's a ${colorWord.toLowerCase()} ${toyWord.toLowerCase()}.`;
}

/* ---------- Toy model (teach: tap the toy, repeat, then say the combined color+toy sentence) ---------- */

export function ToyModelScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'toy-model' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  // Each *Done field is a plain number[] (not a Set) so it survives the
  // JSON broadcast round-trip.
  const [state, setState] = useSyncedState(sync, {
    activeIdx: null as number | null,
    heard: [] as number[],
    wordDone: [] as number[],
    sentenceDone: [] as number[],
    held: false,
  });
  const { activeIdx, heard, wordDone, sentenceDone, held } = state;
  const heardSet = useMemo(() => new Set(heard), [heard]);
  const wordDoneSet = useMemo(() => new Set(wordDone), [wordDone]);
  const sentenceDoneSet = useMemo(() => new Set(sentenceDone), [sentenceDone]);
  const holdTimer = useRef<number | null>(null);
  const gemDone = useRef(false);
  const allDone = sentenceDone.length >= scene.items.length;

  useEffect(() => {
    if (allDone && !gemDone.current) {
      gemDone.current = true;
      onWin(true);
      const sentences = scene.items.map((it) => buildToySentence(it.colorWord, it.toyWord, it.plural)).join(' ');
      cueSpeak(`Wonderful! ${sentences}`, 'pip');
    }
  }, [allDone]);

  const addOnce = (arr: number[], i: number) => (arr.includes(i) ? arr : [...arr, i]);

  const tapItem = async (i: number) => {
    if (held) return;
    setState((s) => ({ ...s, activeIdx: i, heard: addOnce(s.heard, i) }));
    sfx.pop();
    await safeSpeak(scene.items[i].toyWord, scene.items[i].who);
  };

  const startHoldWord = (i: number) => {
    setState((s) => ({ ...s, held: true }));
    holdTimer.current = window.setTimeout(async () => {
      setState((s) => ({ ...s, held: false, wordDone: addOnce(s.wordDone, i) }));
      sfx.gem();
      const item = scene.items[i];
      await new Promise((r) => window.setTimeout(r, 400));
      await safeSpeak(buildToySentence(item.colorWord, item.toyWord, item.plural), item.who);
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
          {allDone ? 'You know the toys and the sentences! ⭐' : scene.teacher}
        </div>
      </div>

      <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 flex-wrap items-start justify-center gap-6 px-4 sm:gap-10">
        {scene.items.map((item, i) => {
          const isActive = activeIdx === i;
          const isHeard = heardSet.has(i);
          const isWordDone = wordDoneSet.has(i);
          const isSentenceDone = sentenceDoneSet.has(i);
          return (
            <div key={item.toyWord} className="flex flex-col items-center gap-2">
              <button
                onClick={() => tapItem(i)}
                className="relative grid h-40 w-40 place-items-center bg-transparent transition active:scale-95 sm:h-48 sm:w-48"
                aria-label={`Hear ${item.toyWord}`}
              >
                <span className="absolute bottom-2 h-6 w-24 rounded-full blur-sm sm:w-28" style={{ background: 'rgba(0,0,0,0.22)' }} />
                <img
                  src={item.img} alt={item.toyWord}
                  className={`relative h-36 w-36 object-contain drop-shadow-xl sm:h-44 sm:w-44 ${isSentenceDone ? '' : 'animate-[lep1-hop_1.8s_ease-in-out_infinite]'}`}
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              </button>
              <span className="rounded-full bg-white px-4 py-1 text-lg font-black uppercase shadow" style={{ color: item.colorHex }}>{item.toyWord}</span>
              {isWordDone && (
                <span className="max-w-[10rem] rounded-2xl bg-white px-3 py-1 text-center text-xs font-bold text-slate-800 shadow sm:text-sm">{buildToySentence(item.colorWord, item.toyWord, item.plural)}</span>
              )}
              {isSentenceDone ? (
                <span className="text-2xl">✅</span>
              ) : isWordDone ? (
                <button
                  onPointerDown={() => startHoldSentence(i)} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
                  className={`rounded-full px-5 py-2 text-sm font-black text-white shadow-lg transition ${held ? 'scale-95' : 'animate-pulse'}`}
                  style={{ background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)' }}
                >
                  🎤 Say the sentence!
                </button>
              ) : isHeard && isActive ? (
                <button
                  onPointerDown={() => startHoldWord(i)} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
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
