import { useEffect, useRef } from 'react';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, CLAY_CARD, CountdownRing } from './shared';

/* ---------- Quick-Fire Flashcards ----------
 * The blueprint's "rapid recall (3 s)" step, and the flash-card warm-up every
 * young-learner course uses: a picture flips in, the child says it before the
 * ring runs out, then the word is revealed and spoken (self-check, no
 * penalty). Retrieval practice at speed — recall, not recognition. */

type Rapid = Extract<Scene, { kind: 'rapid-recall' }>;

export function RapidRecallScene({ scene, onWin, onNext, sync }: { scene: Rapid; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    card: 0,
    phase: 'idle', // idle → think → reveal
    gemDone: false,
  });
  const { card, phase, gemDone } = state;
  const total = scene.cards.length;
  const c = card < total ? scene.cards[card] : undefined;
  const secs = scene.seconds ?? 3;
  const timer = useRef<number[]>([]);
  const clear = () => { timer.current.forEach((t) => window.clearTimeout(t)); timer.current = []; };
  useEffect(() => clear, []);

  // think → (ring runs out) → reveal + say → next card
  useEffect(() => {
    if (!c) return;
    clear();
    if (phase === 'think') {
      timer.current.push(window.setTimeout(() => setState((s) => ({ ...s, phase: 'reveal' })), secs * 1000));
    } else if (phase === 'reveal') {
      sfx.pop();
      cueSpeak(c.say ?? c.word, scene.who);
      timer.current.push(window.setTimeout(() => {
        const n = card + 1;
        const awardGem = n >= total && !gemDone;
        if (awardGem) { sfx.gem(); onWin(true); }
        setState((s) => ({ ...s, card: n, phase: n < total ? 'think' : 'idle', gemDone: s.gemDone || awardGem }));
      }, 2200));
    }
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, phase]);

  const bgStyle = { backgroundImage: `url(${scene.bg})` };

  if (!c) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={bgStyle}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center gap-4 px-4">
          <div className={`${CLAY_CARD} px-8 py-4 text-center text-2xl font-black text-orange-600`}>⚡ Super fast! You said them all!</div>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-4 text-xl`}>Next ⭐</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={bgStyle}>
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900/20 to-black/25" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        ⚡ Quick! Say it!
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{card + 1}/{total}</span>
      </div>

      <div className="absolute inset-x-0 top-[13%] bottom-[16%] z-20 flex items-center justify-center">
        <div key={card} className={`${CLAY_CARD} relative grid aspect-[4/5] h-full max-h-[440px] place-items-center p-6`} style={{ animation: 'lep1-pop 0.4s ease-out' }}>
          {phase === 'think' && <div className="absolute -top-5 -right-5 h-20 w-20"><CountdownRing seconds={secs} runKey={card} /><span className="absolute inset-0 grid place-items-center text-2xl">🗣️</span></div>}
          <img src={c.img} alt="" draggable={false} className="h-[72%] w-[85%] object-contain" />
          <div className={`absolute inset-x-4 bottom-4 rounded-2xl py-2 text-center text-2xl font-black transition-all duration-300 sm:text-3xl ${phase === 'reveal' ? 'bg-emerald-500 text-white opacity-100' : 'bg-transparent text-transparent opacity-0'}`}>
            {c.word}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[5%] z-30 flex justify-center gap-3">
        {phase === 'idle' && <button onClick={() => { sfx.click(); setState((s) => ({ ...s, phase: 'think' })); }} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>▶ Start</button>}
        {phase === 'think' && <button onClick={() => setState((s) => ({ ...s, phase: 'reveal' }))} className="rounded-full bg-white/95 px-6 py-2 text-lg font-black text-emerald-600 shadow-lg active:scale-95">✅ I said it!</button>}
      </div>
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function rapidRecallLines(scene: Rapid) {
  return scene.cards.map((c) => [scene.who, c.say ?? c.word] as [string, string]);
}
