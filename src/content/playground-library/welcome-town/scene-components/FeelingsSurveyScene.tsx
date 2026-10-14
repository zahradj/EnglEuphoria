import { useEffect, useMemo, useState } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf, CARD_FONT } from './shared';

/* ---------- Feelings Survey ("Find Someone Who" / class survey, A1 roadmap ★ new game).
   The child picks a friend, ASKS "How are you, Leo?" out loud, hears the friend's own answer
   ("I am hungry!") and fills that friend's row on the clipboard by tapping the matching face.
   Friends show a neutral picture until their row is filled, so the answer has to be heard, not
   guessed from a face; their feelings differ from the word pages, so it isn't memory either.
   At the end the host reads the finished chart back ("Leo is hungry!").
   Sources (mechanic only): Find Someone Who / class surveys (teach-this.com speaking
   activities), Cambridge Pre A1 Starters / A1 Movers "ask and answer" speaking tasks. ---------- */

export const lineOf = (feeling: string) => `I am ${feeling}!`;
export const askOf = (name: string) => `How are you, ${name}?`;
export const reportOf = (name: string, feeling: string) => `${name} is ${feeling}!`;

export function FeelingsSurveyScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'feelings-survey' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    done: [] as string[], active: '' as string, phase: 'pick' as string, wrong: '' as string, finished: false, gemDone: false,
  });
  const { done, active, phase, wrong, finished } = state;
  const doneSet = useMemo(() => new Set(done), [done]);
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;
  const [reporting, setReporting] = useState(-1);
  const friend = scene.friends.find((f) => f.who === active);
  const allDone = scene.friends.every((f) => doneSet.has(f.who));

  useEffect(() => { cueSpeak(scene.intro, voiceOf(scene.who)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const pick = (who: string) => {
    if (isRemoteMirror || doneSet.has(who) || phase === 'mark') return;
    const f = scene.friends.find((x) => x.who === who);
    if (!f) return;
    sfx.pop();
    setState((s) => ({ ...s, active: who, phase: 'ask', wrong: '' }));
    void safeSpeak(askOf(f.name), voiceOf(scene.who));
  };
  const asked = async () => {
    if (isRemoteMirror || !friend) return;
    setState((s) => ({ ...s, phase: 'mark' }));
    await safeSpeak(lineOf(friend.feeling), voiceOf(friend.who));
  };
  const mark = async (feeling: string) => {
    if (isRemoteMirror || !friend || phase !== 'mark') return;
    if (feeling !== friend.feeling) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: feeling }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 500);
      void safeSpeak(lineOf(friend.feeling), voiceOf(friend.who));
      return;
    }
    sfx.match();
    const nextDone = [...done, friend.who];
    const complete = scene.friends.every((f) => nextDone.includes(f.who));
    setState((s) => ({ ...s, done: nextDone, active: '', phase: 'pick', wrong: '' }));
    if (complete) {
      if (!state.gemDone) { sfx.gem(); onWin(true); setState((s) => ({ ...s, gemDone: true })); }
      for (let i = 0; i < scene.friends.length; i++) {
        setReporting(i);
        const f = scene.friends[i];
        await safeSpeak(reportOf(f.name, f.feeling), voiceOf(scene.who));
      }
      setReporting(-1);
      setState((s) => ({ ...s, finished: true }));
    }
  };

  const faceOf = (feeling: string) => scene.faces.find((x) => x.feeling === feeling);

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})`, fontFamily: CARD_FONT }}>
      <div className="pointer-events-none absolute inset-0 bg-black/20" />
      {finished && <Confetti count={50} />}
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl sm:text-base">
        📋 {scene.title} <span className="ml-1 opacity-60">({done.length}/{scene.friends.length})</span>
      </div>

      {/* Friends: tap one to ask them */}
      <div className="absolute left-[3%] top-[16%] z-20 grid w-[52%] grid-cols-2 gap-[2.5%]">
        {scene.friends.map((f) => {
          const isDone = doneSet.has(f.who);
          const isActive = active === f.who;
          const face = faceOf(f.feeling);
          return (
            <button
              key={f.who}
              onClick={() => pick(f.who)}
              disabled={isDone || (phase === 'mark' && !isActive)}
              aria-label={`Ask ${f.name}`}
              className={`relative flex h-[calc(27*var(--svh,1vh))] flex-col items-center justify-end rounded-3xl border-[5px] bg-white/90 pb-2 shadow-xl transition active:scale-95 ${isActive ? 'scale-[1.03]' : ''}`}
              style={{ borderColor: isActive ? '#FE6A2F' : isDone ? '#22C55E' : CAST[f.who].color }}
            >
              <img src={isDone && f.feelImg ? f.feelImg : f.img} alt={f.name} className="h-[78%] object-contain drop-shadow-lg" style={{ maxWidth: 'none' }} />
              <span className="text-lg font-black sm:text-xl" style={{ color: CAST[f.who].color }}>{f.name}</span>
              {isDone && face && (
                <span className="absolute right-2 top-2 grid h-12 w-12 place-items-center rounded-full text-3xl shadow-lg ring-4 ring-white" style={{ background: face.color, animation: 'lep1-pop 0.35s ease-out' }}>{face.emoji}</span>
              )}
              {!isDone && !isActive && phase === 'pick' && (
                <span className="absolute left-2 top-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-black text-white shadow">Ask me!</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Clipboard chart */}
      <div className="absolute right-[3%] top-[14%] z-20 w-[40%] rounded-3xl border-[6px] border-[#B07A3B] bg-[#FFF6DF] p-3 shadow-2xl">
        <div className="mb-1 text-center text-xl font-black text-[#2A1459] sm:text-2xl">How are you?</div>
        <div className="mb-1 flex items-center gap-2 px-2">
          <span className="w-[26%]" />
          <div className="flex flex-1 justify-between gap-1">
            {scene.faces.map((face) => <span key={face.feeling} className="w-11 text-center text-[11px] font-black sm:w-12 sm:text-xs" style={{ color: face.color }}>{face.feeling}</span>)}
          </div>
        </div>
        {scene.friends.map((f, i) => {
          const isDone = doneSet.has(f.who);
          const isActive = active === f.who && phase === 'mark';
          return (
            <div key={f.who} className={`mb-1.5 flex items-center gap-2 rounded-2xl px-2 py-1 ${isActive ? 'bg-orange-100 ring-4 ring-orange-400' : reporting === i ? 'bg-green-100 ring-4 ring-green-400' : ''}`}>
              <span className="w-[26%] truncate text-base font-black sm:text-lg" style={{ color: CAST[f.who].color }}>{f.name}</span>
              <div className="flex flex-1 justify-between gap-1">
                {scene.faces.map((face) => {
                  const chosen = isDone && face.feeling === f.feeling;
                  const isWrong = isActive && wrong === face.feeling;
                  return (
                    <button
                      key={face.feeling}
                      onClick={() => mark(face.feeling)}
                      disabled={!isActive}
                      aria-label={face.feeling}
                      title={face.feeling}
                      className={`grid h-11 w-11 place-items-center rounded-full text-2xl transition active:scale-90 sm:h-12 sm:w-12 sm:text-3xl ${isWrong ? 'animate-[lep1-shake_0.4s_ease-in-out] bg-red-200' : chosen ? 'ring-4 ring-green-500' : ''} ${!isActive && !chosen ? 'opacity-35' : ''}`}
                      style={{ background: chosen ? face.color : isWrong ? undefined : 'white' }}
                    >
                      {face.emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ask / answer bar */}
      {friend && phase === 'ask' && (
        <div className="absolute bottom-[9%] left-[3%] z-30 flex w-[52%] items-center gap-3 rounded-full bg-white/95 px-4 py-2 shadow-2xl" style={{ animation: 'lep1-slide-up 0.3s ease-out' }}>
          <button onClick={() => cueSpeak(askOf(friend.name), voiceOf(scene.who))} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#FFD978] text-2xl shadow active:scale-95" aria-label="Hear the question">🔊</button>
          <span className="flex-1 text-lg font-black text-[#2A1459] sm:text-2xl">Ask: “{askOf(friend.name)}”</span>
          <button onClick={asked} className="shrink-0 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 text-base font-black text-white shadow-lg active:scale-95 sm:text-lg">🎤 I asked!</button>
        </div>
      )}
      {friend && phase === 'mark' && (
        <div className="absolute bottom-[9%] left-[3%] z-30 flex w-[52%] items-center gap-3 rounded-full bg-white/95 px-4 py-2 shadow-2xl" style={{ animation: 'lep1-slide-up 0.3s ease-out' }}>
          <button onClick={() => cueSpeak(lineOf(friend.feeling), voiceOf(friend.who))} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#FFD978] text-2xl shadow active:scale-95" aria-label="Hear the answer again">🔊</button>
          <span className="flex-1 text-base font-black text-[#2A1459] sm:text-xl">Listen to {friend.name}. Tap the face on the chart!</span>
        </div>
      )}
      {allDone && finished && (
        <div className="absolute bottom-[9%] left-[3%] z-30 flex w-[52%] justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95" style={{ animation: 'lep1-slide-up 0.4s ease-out' }}>Survey done! ⭐ Next</button>
        </div>
      )}
    </div>
  );
}
