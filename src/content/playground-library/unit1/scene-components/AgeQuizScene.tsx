import { useEffect } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { NUMBER_WORDS } from './shared';

/** Hand-drawn wrapped present — pink box, cream lid band, ribbon + bow, big "?" — the tap-to-reveal box for the age-quiz game. */
function PresentBox() {
  return (
    <svg viewBox="0 0 220 240" style={{ width: 'clamp(220px, calc(34*var(--svw,1vw)), 360px)', height: 'auto', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.35))' }}>
      <rect x="10" y="60" width="200" height="40" rx="10" fill="#E76FA5" stroke="#3b1e08" strokeWidth={4} />
      <rect x="20" y="100" width="180" height="130" rx="10" fill="#FEFBDD" stroke="#3b1e08" strokeWidth={4} />
      <rect x="100" y="60" width="20" height="170" fill="#E76FA5" stroke="#3b1e08" strokeWidth={3} />
      <rect x="10" y="75" width="200" height="12" fill="#FEFBDD" stroke="#3b1e08" strokeWidth={2} />
      <ellipse cx="90" cy="55" rx="26" ry="18" fill="#E76FA5" stroke="#3b1e08" strokeWidth={3} />
      <ellipse cx="130" cy="55" rx="26" ry="18" fill="#E76FA5" stroke="#3b1e08" strokeWidth={3} />
      <circle cx="110" cy="55" r="10" fill="#FEFBDD" stroke="#3b1e08" strokeWidth={3} />
      <text x="110" y="170" textAnchor="middle" fontSize="70" fontWeight={900} fill="#3b1e08">?</text>
    </svg>
  );
}

/** Mini candle cake — the age-quiz answer cards draw one live cake per choice, candle count matching the number. */
function MiniCake({ candles }: { candles: number }) {
  return (
    <svg viewBox="0 0 140 110" style={{ width: 'clamp(120px, calc(15*var(--svw,1vw)), 170px)', height: 'auto' }} className="mt-1">
      <rect x="10" y="60" width="120" height="40" rx="6" fill="#f4a3c7" stroke="#3b1e08" strokeWidth={3} />
      <rect x="10" y="72" width="120" height="6" fill="#fff" opacity={0.7} />
      <rect x="10" y="40" width="120" height="24" rx="6" fill="#fde68a" stroke="#3b1e08" strokeWidth={3} />
      {Array.from({ length: candles }).map((_, i) => {
        const x = 22 + i * 15;
        return (
          <g key={i}>
            <rect x={x} y="20" width="6" height="22" fill="#fff" stroke="#3b1e08" strokeWidth={1.5} />
            <path d={`M ${x + 3} 8 Q ${x + 7} 14 ${x + 3} 20 Q ${x - 1} 14 ${x + 3} 8`} fill="#FE6A2F" stroke="#3b1e08" strokeWidth={1.5} />
          </g>
        );
      })}
    </svg>
  );
}

export function AgeQuizScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'age-quiz' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { idx: 0, opened: false, pickedAge: null as number | null, gemDone: false });
  const { idx, opened, pickedAge, gemDone } = state;
  const total = scene.friends.length + 1;
  const isStudentTurn = idx >= scene.friends.length;
  const f = !isStudentTurn ? scene.friends[idx] : null;
  const finished = idx >= total;
  const askLine = isStudentTurn ? 'What is your age?' : `How old is ${f ? CAST[f.who].name : ''}? \u{1F382}`;
  const sayPrefix = isStudentTurn ? 'I am' : `${f ? CAST[f.who].name : ''} is`;

  useEffect(() => {
    setState((s) => ({ ...s, opened: false, pickedAge: null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const openPresent = async () => {
    setState((s) => ({ ...s, opened: true }));
    sfx.pop();
    await safeSpeak(askLine, 'teacher');
  };

  const pickAge = async (age: number) => {
    if (pickedAge !== null) return;
    setState((s) => ({ ...s, pickedAge: age }));
    sfx.match();
    if (f) await safeSpeak(`${CAST[f.who].name} is ${age}!`, f.who);
    else await safeSpeak(`I am ${age}!`, 'teacher');
  };

  const advance = () => {
    const next = idx + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, idx: next, gemDone: s.gemDone || awardGem }));
  };

  if (finished) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
          <Confetti />
          <button onClick={onNext} className="pointer-events-auto rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="absolute left-6 top-6 z-30 flex flex-col gap-2">
        <span className="w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">Age Party · Guess My Candles</span>
        <span className="w-fit rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">Present {idx + 1} / {total}</span>
      </div>

      {!opened ? (
        <div className="absolute inset-x-0 bottom-[18%] top-[20%] z-20 flex items-end justify-center">
          <button onClick={() => void openPresent()} aria-label="Open the present" className="relative outline-none active:scale-95" style={{ animation: 'lep1-wiggle 1.4s ease-in-out infinite' }}>
            <PresentBox />
            <div className="mt-3 rounded-full bg-orange-500 px-4 py-1 text-center text-[11px] font-black uppercase tracking-widest text-white shadow">Tap to open!</div>
          </button>
        </div>
      ) : (
        <>
          <button onClick={() => void safeSpeak(askLine, 'teacher')} className="absolute left-1/2 top-24 z-30 -translate-x-1/2 rounded-[2rem] bg-white/95 px-8 py-5 text-center shadow-2xl ring-4 ring-orange-300 active:scale-95">
            <div className="text-[10px] font-black uppercase tracking-widest text-orange-700">You ask</div>
            <div className="text-2xl font-black text-slate-800">{askLine}</div>
            <div className="mt-1 text-[10px] font-bold text-slate-500">🔁 tap to replay</div>
          </button>
          <div className="absolute left-1/2 top-44 z-30 -translate-x-1/2 rounded-[2rem] bg-gradient-to-b from-yellow-100 to-orange-100 px-8 py-4 text-center shadow-xl ring-4 ring-orange-200">
            <div className="text-[10px] font-black uppercase tracking-widest text-orange-600">You say</div>
            <div className="flex items-center gap-3 text-3xl font-black text-orange-800">
              <span>{sayPrefix}</span>
              <span className="inline-flex h-14 w-20 items-center justify-center rounded-2xl border-4 border-dashed border-orange-300 bg-white/70 text-2xl">{pickedAge ?? '___'}</span>
              <span>!</span>
            </div>
          </div>
          {!isStudentTurn && (
            <img src={CAST[f!.who].img} alt={CAST[f!.who].name} className="absolute inset-x-0 bottom-[16%] mx-auto object-contain drop-shadow-2xl" style={{ width: 'clamp(200px, calc(32*var(--svw,1vw)), 325px)', animation: 'lep1-float 3s ease-in-out infinite' }} />
          )}
          {pickedAge === null ? (
            <div className="absolute inset-x-0 bottom-6 z-30 flex flex-wrap items-center justify-center gap-4 px-6">
              {scene.studentAges.map((age) => (
                <button key={age} onClick={() => void pickAge(age)}
                  className="relative flex flex-col items-center rounded-3xl bg-white/95 px-4 pb-2 pt-3 shadow-2xl ring-4 ring-orange-100 transition active:scale-95"
                >
                  <span className="text-6xl font-black leading-none text-orange-700 drop-shadow-sm">{age}</span>
                  <MiniCake candles={age} />
                  <span className="mt-1 text-[11px] font-black uppercase tracking-widest text-orange-600">{NUMBER_WORDS[age - 1]?.toLowerCase()}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
              <button onClick={advance} className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 text-lg font-black text-white shadow-2xl active:scale-95">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
