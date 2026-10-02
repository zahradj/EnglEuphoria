import type { Scene } from '../scenes';
import { CAST, getEmotionSprite } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { PrimaryButton } from './shared';

/* ---------- Meet group (multi-character question chain) ---------- */

export function MeetGroupScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'meet-group' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  type Phase = 'idle' | 'asker-said' | 'student-asked' | 'answer-said' | 'student-answered' | 'done';
  const [state, setState] = useSyncedState(sync, {
    phase: 'idle' as Phase,
    step: 0,
    bubble: null as { who: string; line: string; color: string } | null,
    xpBurst: false,
  });
  const { phase, step, bubble, xpBurst } = state;


  const allAsked = step >= scene.askers.length;

  const tapAsker = async (i: number) => {
    if (i !== step || phase !== 'idle') return;
    sfx.pop();
    const c = CAST[scene.askers[i].who];
    setState((s) => ({ ...s, bubble: { who: c.name, line: scene.question, color: c.color }, phase: 'asker-said' }));
    await safeSpeak(scene.question, scene.askers[i].who);
    setState((s) => ({ ...s, phase: 'student-asked' }));
  };

  const repeatQuestion = async () => { sfx.click(); await safeSpeak(scene.question, 'teacher'); };

  const confirmStudentAsked = () => {
    sfx.gem();
    setState((s) => ({ ...s, xpBurst: true }));
    setTimeout(() => setState((s) => ({ ...s, xpBurst: false })), 900);
    const next = step + 1;
    setState((s) => ({ ...s, step: next, bubble: null, phase: 'idle' }));
    if (next >= scene.askers.length) setTimeout(() => tapNewcomer(), 400);
  };

  const tapNewcomer = async () => {
    if (!allAsked && step + 1 < scene.askers.length) return;
    sfx.pop();
    const c = CAST[scene.newcomer.who];
    setState((s) => ({ ...s, bubble: { who: c.name, line: scene.answer, color: c.color }, phase: 'answer-said' }));
    await safeSpeak(scene.answer, scene.newcomer.who);
    setState((s) => ({ ...s, phase: 'student-answered' }));
  };

  const repeatAnswer = async () => { sfx.click(); await safeSpeak(scene.answer, 'teacher'); };

  const confirmStudentAnswered = () => {
    sfx.gem();
    setState((s) => ({ ...s, xpBurst: true, phase: 'done' }));
    setTimeout(() => setState((s) => ({ ...s, xpBurst: false })), 1000);
    onWin(true);
  };

  const newcomerColor = CAST[scene.newcomer.who].color;

  return (
    <div className="relative h-full min-h-[400px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
        <div className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-lg ring-2 ring-white/50" style={{ background: `linear-gradient(90deg, ${newcomerColor}, #FEBE4C)` }}>⚔️ Quest · Meet {CAST[scene.newcomer.who].name}</div>
      </div>
      <div className="mx-auto mt-8 max-w-xl">
        <div className="rounded-2xl px-4 py-3 text-center text-lg font-bold text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.35))', backdropFilter: 'blur(8px)' }}>{scene.teacher}</div>
      </div>
      {scene.phonics && (
        <span className="absolute right-3 top-16 z-20 grid h-16 w-16 place-items-center rounded-full bg-white text-2xl font-black shadow-2xl ring-4" style={{ color: newcomerColor, borderColor: newcomerColor }}>{CAST[scene.newcomer.who].name[0]}</span>
      )}
      {scene.askers.map((a, i) => {
        const doneAsker = i < step;
        const active = i === step && phase === 'idle' && !allAsked;
        const c = CAST[a.who];
        return (
          <button key={a.who} onClick={() => tapAsker(i)} disabled={!active} aria-label={`Tap ${c.name}`} className="absolute z-10 -translate-x-1/2 -translate-y-full rounded-b-full"
            style={{ left: `${a.xPct}%`, top: `${a.yPct}%`, width: 'clamp(200px, calc(30*var(--svh,1vh)), 320px)', height: 'clamp(240px, calc(36*var(--svh,1vh)), 380px)' }}>
            {scene.showSprites && <img src={getEmotionSprite(a.who, 'happy')} alt={c.name} draggable={false} className="pointer-events-none absolute inset-0 mx-auto h-full w-full object-contain drop-shadow-2xl" />}
            {active && (
              <>
                <span className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${c.color}66, transparent 65%)`, animation: 'ping 2s ease-out infinite' }} />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-3 py-1 text-sm font-black shadow-xl" style={{ color: c.color }}>👆 Tap {c.name}</span>
              </>
            )}
            {doneAsker && <span className="absolute -top-2 left-1/2 -translate-x-1/2 grid h-9 w-9 place-items-center rounded-full bg-emerald-500 text-white text-xl font-black shadow-lg ring-2 ring-white">✓</span>}
          </button>
        );
      })}
      <button onClick={tapNewcomer} disabled={!(allAsked && phase === 'idle')} aria-label={`Tap ${CAST[scene.newcomer.who].name}`} className="absolute z-10 -translate-x-1/2 -translate-y-full rounded-b-full"
        style={{ left: `${scene.newcomer.xPct}%`, top: `${scene.newcomer.yPct}%`, width: 'clamp(220px, calc(34*var(--svh,1vh)), 360px)', height: 'clamp(260px, calc(40*var(--svh,1vh)), 420px)' }}>
        {scene.showSprites && <img src={getEmotionSprite(scene.newcomer.who, 'happy')} alt={CAST[scene.newcomer.who].name} draggable={false} className="pointer-events-none absolute inset-0 mx-auto h-full w-full object-contain drop-shadow-2xl" />}
        {allAsked && phase === 'idle' && (
          <>
            <span className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${newcomerColor}77, transparent 65%)`, animation: 'ping 1.5s ease-out infinite' }} />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-3 py-1 text-sm font-black shadow-xl" style={{ color: newcomerColor }}>👆 Tap {CAST[scene.newcomer.who].name}</span>
          </>
        )}
      </button>
      {bubble && (
        <div className="absolute top-[calc(14*var(--svh,1vh))] left-4 sm:left-8 z-20 max-w-[44%] sm:max-w-[36%]">
          <button onClick={() => (phase === 'answer-said' || phase === 'student-answered' ? repeatAnswer() : repeatQuestion())} className="relative w-full rounded-3xl border-4 bg-white px-5 py-4 text-left text-xl sm:text-2xl font-black shadow-2xl active:scale-95" style={{ color: bubble.color, borderColor: bubble.color }} aria-label="Hear again">
            <span className="mr-2 text-sm font-bold uppercase tracking-wider opacity-70">{bubble.who}</span><br />"{bubble.line}"
          </button>
        </div>
      )}
      {xpBurst && <div className="pointer-events-none absolute inset-x-0 top-[calc(32*var(--svh,1vh))] z-30 grid place-items-center"><div className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2 text-2xl font-black text-white shadow-2xl">+10 XP 💎</div></div>}
      {(phase === 'student-asked' || phase === 'student-answered') && (
        <div className="absolute inset-x-0 bottom-0 z-30 mx-auto max-w-lg">
          <div className="mx-3 mb-4 rounded-3xl border-4 border-white/60 bg-white/95 p-4 shadow-2xl">
            <div className="text-center text-sm font-bold uppercase tracking-widest text-slate-500">Your turn — repeat!</div>
            <div className="mt-1 text-center text-2xl font-black" style={{ color: newcomerColor }}>"{phase === 'student-asked' ? scene.question : scene.answer}"</div>
            <div className="mt-3 flex gap-2">
              <button onClick={phase === 'student-asked' ? repeatQuestion : repeatAnswer} className="flex-1 rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 active:scale-95">🔁 Hear it</button>
              <PrimaryButton onClick={phase === 'student-asked' ? confirmStudentAsked : confirmStudentAnswered}>✅ I said it!</PrimaryButton>
            </div>
          </div>
        </div>
      )}
      {phase === 'done' && (
        <div className="absolute inset-x-0 bottom-0 z-30 mx-auto max-w-md">
          <div className="mx-3 mb-4 rounded-3xl border-4 border-white/60 bg-white/95 p-4 shadow-2xl">
            <div className="text-center text-2xl font-black text-emerald-600">🎉 You met {CAST[scene.newcomer.who].name}!</div>
            <div className="mt-3"><PrimaryButton onClick={onNext}>Next Quest →</PrimaryButton></div>
          </div>
        </div>
      )}
    </div>
  );
}
