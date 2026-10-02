import { useEffect } from 'react';
import type { Scene, CharKey } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

const cakeSticker = '/lep1/items/cake-sticker.png';

const candleSticker = '/lep1/items/candle-sticker.png';

const BIRTHDAY_SPRITE: Partial<Record<CharKey, string>> = {
  bella: '/lep1/characters/bella-birthday.png',
  mia: '/lep1/characters/mia-birthday.png',
  pip: '/lep1/characters/pip-birthday.png',
};

export function CandleCakeScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'candle-cake' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, candles: 0, studentAge: null as number | null, celebrating: false, gemDone: false });
  const { round, candles, studentAge, celebrating, gemDone } = state;
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;
  const target = r?.isStudent ? (studentAge ?? 0) : (r?.target ?? 0);

  useEffect(() => {
    setState((s) => ({ ...s, candles: 0, studentAge: null, celebrating: false }));
    if (!r) return;
    const t = window.setTimeout(() => void safeSpeak(r.prompt, r.asker), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const tapCake = async () => {
    if (!r || celebrating || target <= 0 || candles >= target) return;
    sfx.pop();
    const next = candles + 1;
    setState((s) => ({ ...s, candles: next }));
    if (next >= target) {
      setState((s) => ({ ...s, celebrating: true }));
      sfx.gem();
      await safeSpeak(r.celebrate, r.asker);
      const awardGem = round === total - 1 && !gemDone;
      if (awardGem) onWin(true);
      setState((s) => ({ ...s, gemDone: s.gemDone || awardGem }));
      window.setTimeout(() => setState((s) => ({ ...s, round: s.round + 1 })), 900);
    }
  };

  if (finished) {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 bg-cover bg-center px-4 pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <Confetti />
        <div className="relative z-20 rounded-3xl bg-white/95 px-8 py-6 text-center text-2xl font-black text-orange-700 shadow-2xl">🎂 Happy birthday to YOU! 🎂</div>
        <button onClick={onNext} className="relative z-20 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
      </div>
    );
  }

  const askerColor = r!.isStudent ? '#FE6A2F' : CAST[r!.asker].color;
  const candleSpacing = Math.min(9, 30 / Math.max(target - 1, 1));

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex items-start justify-between px-4">
        <div className="rounded-2xl bg-white/95 px-4 py-2 text-sm font-black text-orange-700 shadow-xl">🎂 Round {round + 1}/{total}</div>
        <div className="flex items-center gap-2 rounded-full px-5 py-3 text-lg font-black text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${askerColor}, #FEBE4C)` }}>
          🕯️ {candles}/{target || '?'}
        </div>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-[16%] z-30 max-w-[92%] -translate-x-1/2 rounded-3xl bg-white/95 px-6 py-4 text-center shadow-2xl">
        <div className="text-xl font-black text-orange-700 sm:text-2xl">🔊 {r!.prompt}</div>
      </div>
      {r!.isStudent && studentAge === null ? (
        <div className="absolute inset-x-0 bottom-10 z-30 flex max-w-md flex-wrap justify-center gap-2 px-4" style={{ margin: '0 auto' }}>
          {[2, 3, 4, 5, 6, 7, 8].map((n) => (
            <button key={n} onClick={() => setState((s) => ({ ...s, studentAge: n }))} className="grid h-14 w-14 place-items-center rounded-2xl border-4 border-white bg-white/95 text-xl font-black text-orange-700 shadow-xl active:scale-95">{n}</button>
          ))}
        </div>
      ) : (
        <>
          {!r!.isStudent && BIRTHDAY_SPRITE[r!.asker] && (
            <img
              src={BIRTHDAY_SPRITE[r!.asker]}
              alt={CAST[r!.asker].name}
              className="pointer-events-none absolute bottom-[6%] left-[2%] z-20 drop-shadow-2xl"
              style={{ width: 'min(calc(46*var(--svh,1vh)), 460px)', animation: celebrating ? 'lep1-pop 0.5s ease-in-out 2' : 'lep1-cakeBounce 1.6s ease-in-out infinite' }}
            />
          )}
          <div className="absolute inset-x-0 bottom-[4%] z-10 grid place-items-center">
            <button
              onClick={() => void tapCake()}
              aria-label="Tap the cake to add a candle"
              className="relative cursor-pointer touch-none select-none"
              style={{ width: 'min(calc(88*var(--svw,1vw)), 760px)', height: 'min(calc(56*var(--svh,1vh)), 560px)', animation: 'lep1-cakeIdle 2.6s ease-in-out infinite', transformOrigin: '50% 100%' }}
            >
              <img src={cakeSticker} alt="Birthday cake" draggable={false} className="absolute inset-0 h-full w-full select-none" style={{ objectFit: 'contain', objectPosition: 'center bottom' }} />
              {candles < target && (
                <span
                  className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ border: '4px solid rgba(255,255,255,0.9)', animation: 'lep1-tapRipple 1.4s ease-out infinite' }}
                />
              )}
              {Array.from({ length: candles }).map((_, i) => (
                <div
                  key={i}
                  className="absolute z-[5]"
                  style={{ left: `${50 + (i - (target - 1) / 2) * candleSpacing}%`, bottom: '82%', transform: 'translateX(-50%)', width: 'clamp(70px, 13%, 120px)', transformOrigin: '50% 100%', animation: 'lep1-candleDrop 0.55s cubic-bezier(0.34,1.56,0.64,1)' }}
                >
                  <div className="relative w-full" style={{ animation: 'lep1-candleWiggle 2.4s ease-in-out infinite' }}>
                    <img src={candleSticker} alt="" draggable={false} className="block w-full select-none" style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.3))' }} />
                  </div>
                </div>
              ))}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
