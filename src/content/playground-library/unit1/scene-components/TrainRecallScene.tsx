import { useEffect, useRef } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { STICKER_TILTS, StickerButton, TrainEngine, TrainTrack, TrainWagon } from './shared';

const WAGON_COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#A855F7', '#14B8A6', '#EC4899'];

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
      {/* The toy train: rolls in while the toys are shown; one wagon is covered. */}
      <div className="absolute inset-x-0 top-[20%] z-10 flex flex-col items-center px-3">
        <div className="flex items-end gap-1" style={{ animation: 'lep1-card-in 0.9s ease-out' }}>
          <TrainEngine moving={phase === 'reveal' || phase === 'done'} className="h-[23vh] w-[28vh] shrink-0" />
          {scene.cars.map((car, i) => {
            const isMissing = missingIdx === i;
            const showContents = phase === 'reveal' || (phase !== 'hidden' && !isMissing) || (phase === 'done' && isMissing);
            return (
              <TrainWagon key={i} color={WAGON_COLORS[i % WAGON_COLORS.length]} moving={phase === 'done'} glow={isMissing && phase === 'ask'} className="h-[23vh] w-[21vh] shrink-0">
                {showContents ? (
                  car.img ? <img src={car.img} alt={car.word} className="h-full w-full object-contain" style={{ animation: phase === 'done' && isMissing ? 'lep1-pop 0.5s ease-out' : undefined }} draggable={false} /> : <span className="text-3xl">{car.emoji}</span>
                ) : (
                  <span className="grid h-full w-full place-items-center rounded-lg bg-gradient-to-b from-orange-300 to-orange-500 text-3xl font-black text-white">?</span>
                )}
              </TrainWagon>
            );
          })}
        </div>
        <TrainTrack moving={phase === 'reveal' || phase === 'done'} className="-mt-[1vh] w-[96%]" />
      </div>
      {phase === 'ask' && (
        <div className="absolute inset-x-0 bottom-[11%] z-30 flex flex-wrap justify-center gap-3 px-4">
          {choices.map((word) => {
            const isPicked = picked === word;
            return (
              <StickerButton
                key={word}
                onClick={() => pick(word)}
                disabled={!!picked}
                label={word.toLowerCase()}
                tilt={STICKER_TILTS[choices.indexOf(word) % STICKER_TILTS.length]}
                state={isPicked && wrong ? 'wrong' : undefined}
                size="h-[min(18vh,15vw)] w-[min(18vh,15vw)]"
              >
                {(() => { const c = scene.cars.find((x) => x.word === word); return c?.img ? <img src={c.img} alt="" className="h-full w-full object-contain" draggable={false} /> : <span className="text-4xl">{c?.emoji}</span>; })()}
              </StickerButton>
            );
          })}
        </div>
      )}
      {phase === 'done' && (
        <div className="absolute inset-x-0 bottom-[11%] z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95" style={{ animation: 'lep1-slide-up 0.4s ease-out' }}>
            All aboard! Next →
          </button>
        </div>
      )}
    </div>
  );
}
