import { useEffect } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

export function MeetGreetScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'meet-greet' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { idx: 0, step: 0, gemDone: false });
  const { idx, step, gemDone } = state;
  const total = scene.friends.length;
  const finished = idx >= total;
  const f = !finished ? scene.friends[idx] : null;
  const c = f ? CAST[f.who] : null;

  const steps = f ? [
    { line: "What's your name?", who: 'teacher' as const },
    { line: `My name is ${c!.name}.`, who: f.who },
    { line: 'How old are you?', who: 'teacher' as const },
    { line: `I am ${f.age}.`, who: f.who },
    { line: 'Nice to meet you!', who: 'teacher' as const },
  ] : [];

  useEffect(() => {
    if (!f) return;
    const t = window.setTimeout(() => void safeSpeak(steps[step].line, steps[step].who), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, step]);

  const advance = () => {
    if (step < steps.length - 1) { setState((s) => ({ ...s, step: s.step + 1 })); return; }
    const nextIdx = idx + 1;
    const awardGem = nextIdx >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, idx: nextIdx, step: 0, gemDone: s.gemDone || awardGem }));
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

  const current = steps[step];
  const isTeacherLine = current.who === 'teacher';
  const bubbleColor = isTeacherLine ? '#FE6A2F' : c!.color;

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="absolute left-6 top-6 z-30 flex flex-col gap-2">
        <span className="w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">Age Stage · Meet &amp; Greet</span>
        <span className="w-fit rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">Friend {idx + 1}/{total} · {c!.name}</span>
      </div>
      <img
        src={c!.img}
        alt={c!.name}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-2xl"
        style={{ width: 'clamp(220px, calc(46*var(--svw,1vw)), 460px)', animation: 'lep1-float 3.4s ease-in-out infinite' }}
      />
      <div className="absolute inset-x-0 top-24 z-20 mx-auto flex max-w-lg flex-col gap-3 px-6">
        <button
          key={step}
          onClick={() => void safeSpeak(current.line, current.who)}
          className="group relative flex justify-start text-left outline-none"
          style={{ animation: 'lep1-pop 0.35s ease-out' }}
        >
          <div className="max-w-[85%] rounded-3xl px-5 py-3 text-left shadow-2xl ring-2 ring-white/40" style={{ background: bubbleColor }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/80">{isTeacherLine ? 'You ask' : `${c!.name} answers`}</div>
            <div className="text-lg font-bold text-white">{current.line}</div>
            <div className="mt-1 text-[10px] font-bold text-white/80">🔁 tap to replay</div>
          </div>
        </button>
      </div>
      <button onClick={advance} className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-full bg-white px-8 py-4 text-lg font-black uppercase text-orange-700 shadow-2xl transition hover:scale-105 active:scale-95">
        {step < steps.length - 1 ? '🎤 Your turn — say it, then tap ▶' : idx < total - 1 ? 'Next friend →' : 'Finish →'}
      </button>
    </div>
  );
}
