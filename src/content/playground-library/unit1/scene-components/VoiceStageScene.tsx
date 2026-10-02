import { useCallback } from 'react';
import { LiveStageFill, useStageDrop } from '../../LiveStageFrame';
import type { CallRole } from '@/components/classroom/stage/callStreams';
import type { Scene, CharKey } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Voice stage ---------- */

export function VoiceStageScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'voice-stage' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  type Phase = 'ready' | 'listening' | 'guess' | 'reveal' | 'pleasantry' | 'done';
  const [state, setState] = useSyncedState(sync, {
    round: 0, phase: 'ready' as Phase, feedback: null as null | { who: CharKey; ok: boolean }, gemDone: false, onStage: null as CallRole | null,
  });
  const { round, phase, feedback, gemDone } = state;
  const setRound = (round: number) => setState((st) => ({ ...st, round }));
  const setPhase = (phase: Phase) => setState((st) => ({ ...st, phase }));
  const setFeedback = (feedback: null | { who: CharKey; ok: boolean }) => setState((st) => ({ ...st, feedback }));
  const setGemDone = (gemDone: boolean) => setState((st) => ({ ...st, gemDone }));
  // The drop circle shows a video-call tile dragged onto it (synced, see
  // LiveStageFrame) — no camera of its own.
  const onStage = state.onStage ?? null;
  const placed = onStage !== null;
  const canControl = !sync?.isSynced || sync.isAuthority;
  const placeOnStage = (role: CallRole | null) => setState((st) => ({ ...st, onStage: role }));
  const { over, dropProps } = useStageDrop(placeOnStage);

  const stageSpots = [{ left: '22%', top: '48%' }, { left: '50%', top: '44%' }, { left: '78%', top: '48%' }];

  const playRound = useCallback(async () => {
    const current = scene.rounds[round];
    if (!current || phase === 'listening') return;
    setFeedback(null); setPhase('listening');
    await safeSpeak(scene.question, 'teacher');
    await safeSpeak(current.answer, current.who);
    setPhase('guess');
  }, [phase, round, scene.question, scene.rounds]);

  const advanceAfterRound = useCallback(() => {
    const next = round + 1;
    if (next >= scene.rounds.length) {
      setPhase('done');
      if (!gemDone) { setGemDone(true); sfx.gem(); onWin(true); }
    } else { setRound(next); setPhase('ready'); }
  }, [round, scene.rounds.length, gemDone, onWin]);

  const finishPleasantry = useCallback(() => { if (phase !== 'pleasantry') return; sfx.match(); advanceAfterRound(); }, [phase, advanceAfterRound]);

  const choose = async (who: CharKey) => {
    if (phase !== 'guess') return;
    const current = scene.rounds[round];
    const ok = current.who === who;
    setFeedback({ who, ok });
    setPhase('reveal');
    if (ok) {
      sfx.match();
      await safeSpeak('Yes! My name!', who);
      if (scene.niceToMeet) { await safeSpeak('Nice to meet you!', who); setFeedback(null); setPhase('pleasantry'); return; }
    } else { sfx.wrong(); onLose(); }
    window.setTimeout(() => {
      setFeedback(null);
      if (!ok) { setPhase('ready'); return; }
      advanceAfterRound();
    }, 950);
  };

  const currentRound = scene.rounds[Math.min(round, scene.rounds.length - 1)];

  return (
    <div className="absolute inset-0 z-10 overflow-hidden select-none">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/45" />
      <div className="absolute inset-x-0 top-5 z-30 flex justify-center px-4">
        <div className="rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-2xl ring-2 ring-orange-200 sm:text-base">🎤 Name Stage · Round {Math.min(round + 1, scene.rounds.length)}/{scene.rounds.length}</div>
      </div>
      {scene.rounds.map((r, idx) => {
        const c = CAST[r.who];
        const spot = stageSpots[idx] ?? stageSpots[0];
        const fb = feedback?.who === r.who ? feedback : null;
        const isTarget = currentRound?.who === r.who;
        return (
          <button key={`${r.who}-${idx}`} onClick={() => choose(r.who)} disabled={phase !== 'guess'} className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent p-0 transition active:scale-95 disabled:cursor-default" style={{ left: spot.left, top: spot.top }} aria-label={`Choose ${c.name}`}>
            <div className="relative grid h-56 w-56 place-items-center rounded-full border-4 bg-white/90 shadow-2xl sm:h-64 sm:w-64" style={{ borderColor: fb ? (fb.ok ? '#22C55E' : '#EF4444') : c.color, boxShadow: phase === 'guess' && isTarget ? `0 0 45px ${c.color}` : '0 24px 44px rgba(0,0,0,0.35)' }}>
              <span className="absolute -top-6 rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-white shadow">🎙️ {r.cue}</span>
              <img src={c.img} alt={c.name} className="h-44 w-44 object-contain drop-shadow-xl sm:h-52 sm:w-52" />
              {fb && <span className="absolute -bottom-5 rounded-full px-4 py-1 text-sm font-black text-white shadow-lg" style={{ backgroundColor: fb.ok ? '#22C55E' : '#EF4444' }}>{fb.ok ? 'Yes!' : 'Try again'}</span>}
            </div>
          </button>
        );
      })}
      <div {...dropProps} className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-4 transition ${placed ? 'border-orange-400 ring-4 ring-orange-300/60' : 'border-dashed border-white/85'} ${over ? 'scale-105' : ''}`} style={{ left: '50%', top: '78%', width: 'calc(24*var(--svw,1vw))', height: 'calc(24*var(--svw,1vw))', maxWidth: 220, maxHeight: 220, minWidth: 140, minHeight: 140, background: 'linear-gradient(135deg, #FE6A2F, #FEBE4C)' }}>
        <LiveStageFill onStage={onStage} onPlace={placeOnStage} over={over} canControl={canControl} />
      </div>
      <div className="absolute right-4 top-1/2 z-30 flex w-[240px] -translate-y-1/2 flex-col items-stretch gap-3 sm:right-8 sm:w-[280px]">
        <div className="rounded-3xl bg-white/95 px-4 py-3 text-center shadow-2xl ring-2 ring-orange-200">
          <div className="text-[10px] font-black uppercase tracking-widest text-orange-500">Listen & Repeat</div>
          <div className="mt-1 text-base font-black text-orange-800 sm:text-lg">
            {phase === 'guess' ? 'Who answered? Tap a friend.' : phase === 'pleasantry' ? 'Say: Nice to meet you too!' : phase === 'done' ? 'Great job! ⭐' : `“${scene.question}”`}
          </div>
        </div>
        {phase === 'done' ? (
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-3 text-base font-black text-white shadow-2xl ring-4 ring-white/50 active:scale-95">⭐ Stage complete →</button>
        ) : phase === 'pleasantry' ? (
          <button onClick={finishPleasantry} className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-base font-black text-white shadow-2xl ring-4 ring-white/50 active:scale-95">🎤 I said it! →</button>
        ) : (
          <button onClick={() => void playRound()} disabled={phase === 'listening' || phase === 'guess'} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-3 text-base font-black text-white shadow-2xl ring-4 ring-white/50 active:scale-95 disabled:opacity-60">
            {phase === 'listening' ? 'Listening…' : phase === 'guess' ? 'Your turn 🎤' : '🔊 Ask & repeat'}
          </button>
        )}
        {!placed && <div className="rounded-2xl bg-black/50 px-3 py-2 text-center text-[11px] font-black uppercase tracking-widest text-white shadow">⬇ Drag the student’s video into the circle</div>}
      </div>
      {phase === 'pleasantry' && currentRound && (
        <div className="pointer-events-none absolute inset-x-0 bottom-32 z-40 flex justify-center px-4">
          <div className="rounded-[36px] bg-white/95 px-8 py-5 text-center shadow-2xl ring-4 ring-emerald-300">
            <div className="text-[11px] font-black uppercase tracking-widest text-emerald-600">{CAST[currentRound.who].name} said: “Nice to meet you!”</div>
            <div className="mt-2 text-2xl font-black text-emerald-800 sm:text-3xl">🎤 Say: “Nice to meet you too!”</div>
          </div>
        </div>
      )}
    </div>
  );
}
