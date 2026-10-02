import { useEffect, useRef } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Train recall (the train's cars are covered one by one; recall which toy was in the one that stays hidden) ---------- */

export function TrainRecallScene({ scene, onWin, onLose, onNext, sync }: { scene: Extract<Scene, { kind: 'train-recall' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  type Phase = 'reveal' | 'hidden' | 'ask' | 'done';
  // missingIdx/choices are picked with Math.random() once per scene -- only
  // the authority runs that setup and it travels as synced state, same fix
  // as hello-doors' shuffle, or the mirror would end up quizzing on a
  // different missing car than the one actually shown as hidden.
  const [state, setState] = useSyncedState(sync, { phase: 'reveal' as Phase, missingIdx: null as number | null, choices: [] as string[], picked: null as string | null, wrong: false });
  const { phase, missingIdx, choices, picked, wrong } = state;
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;
  const gemDone = useRef(false);
  const started = useRef(false);

  useEffect(() => {
    if (isRemoteMirror || started.current) return;
    started.current = true;
    (async () => {
      for (const car of scene.cars) { await safeSpeak(car.word, 'pip'); await new Promise((r) => setTimeout(r, 250)); }
      await new Promise((r) => setTimeout(r, 300));
      setState((s) => ({ ...s, phase: 'hidden' }));
      await new Promise((r) => setTimeout(r, 700));
      const idx = Math.floor(Math.random() * scene.cars.length);
      const others = scene.cars.filter((_, i) => i !== idx).map((c) => c.word);
      const distractors = others.sort(() => Math.random() - 0.5).slice(0, 2);
      const nextChoices = [scene.cars[idx].word, ...distractors].sort(() => Math.random() - 0.5);
      setState((s) => ({ ...s, missingIdx: idx, choices: nextChoices, phase: 'ask' }));
      await safeSpeak('Choo choo! One car is empty. Which toy is missing?', 'pip');
    })();
  }, [isRemoteMirror]);

  const pick = async (word: string) => {
    if (isRemoteMirror || missingIdx === null || picked) return;
    if (word === scene.cars[missingIdx].word) {
      sfx.match(); sfx.gem();
      setState((s) => ({ ...s, picked: word, phase: 'done' }));
      if (!gemDone.current) { gemDone.current = true; onWin(true); }
      await safeSpeak(`Yes! It's the ${word.toLowerCase()}!`, 'pip');
    } else {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, picked: word, wrong: true }));
      window.setTimeout(() => setState((s) => ({ ...s, picked: null, wrong: false })), 700);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-x-0 top-4 z-30 flex justify-center px-4">
        <div className="max-w-lg rounded-2xl bg-white/95 px-5 py-3 text-center text-base font-bold text-orange-800 shadow-xl backdrop-blur sm:text-lg">
          {phase === 'ask' || phase === 'done' ? 'Choo choo! Which toy is missing?' : scene.teacher}
        </div>
      </div>
      <div className="absolute inset-x-0 top-[42%] z-10 flex -translate-y-1/2 items-center justify-center gap-3 px-4">
        {scene.cars.map((car, i) => {
          const isMissing = missingIdx === i;
          const showContents = phase === 'reveal' || (phase !== 'hidden' && !isMissing) || (phase === 'done' && isMissing);
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`relative flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-b from-orange-400 to-orange-600 shadow-xl sm:h-28 sm:w-28 ${isMissing && phase === 'ask' ? 'animate-pulse ring-4 ring-yellow-300' : ''}`}>
                {showContents ? (
                  car.img ? <img src={car.img} alt={car.word} className="h-3/4 w-3/4 object-contain" draggable={false} /> : <span className="text-3xl">{car.emoji}</span>
                ) : (
                  <span className="text-3xl font-black text-white">?</span>
                )}
              </div>
              <div className="h-3 w-16 rounded-b-lg bg-neutral-700" />
              <div className="flex gap-3">
                <span className="h-4 w-4 rounded-full bg-neutral-800" />
                <span className="h-4 w-4 rounded-full bg-neutral-800" />
              </div>
            </div>
          );
        })}
      </div>
      {phase === 'ask' && (
        <div className="absolute inset-x-0 bottom-10 z-30 flex flex-wrap justify-center gap-3 px-4">
          {choices.map((word) => {
            const isPicked = picked === word;
            return (
              <button
                key={word}
                onClick={() => pick(word)}
                disabled={!!picked}
                className={`rounded-2xl border-4 bg-white px-6 py-3 text-lg font-black uppercase text-orange-700 shadow-xl active:scale-95 ${isPicked && wrong ? 'border-red-400 animate-[lep1-shake_0.4s_ease-out]' : 'border-white'}`}
              >
                {word}
              </button>
            );
          })}
        </div>
      )}
      {phase === 'done' && (
        <div className="absolute inset-x-0 bottom-10 z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95" style={{ animation: 'lep1-slide-up 0.4s ease-out' }}>
            All aboard! Next →
          </button>
        </div>
      )}
    </div>
  );
}
