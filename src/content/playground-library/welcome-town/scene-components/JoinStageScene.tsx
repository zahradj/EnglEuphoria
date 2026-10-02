import { useEffect } from 'react';
import { LiveStageFill, StageFrame, useStageDrop } from '../../LiveStageFrame';
import type { CallRole } from '@/components/classroom/stage/callStreams';
import type { Scene, CharKey } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeakOnce } from '../../unit1/audio';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';

/* ---------- Join stage ---------- */

export function JoinStageScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'join-stage' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { turnIdx: 0, gemDone: false, onStage: null as CallRole | null });
  const { turnIdx, gemDone } = state;
  // No camera of its own: whoever is dragged here from the call tiles is
  // shown (synced), see LiveStageFrame.
  const onStage = state.onStage ?? null;
  const placeOnStage = (role: CallRole | null) => setState((s) => ({ ...s, onStage: role }));
  const canControl = !sync?.isSynced || sync.isAuthority;
  const { over, dropProps } = useStageDrop(placeOnStage);

  const currentTurn = turnIdx < scene.turns.length ? scene.turns[turnIdx] : null;
  const isStudentTurn = currentTurn?.who === 'student';
  const isFriendTurn = !!currentTurn && !isStudentTurn;
  const friendKey = isFriendTurn ? (currentTurn!.who as CharKey) : null;
  const friendMeta = friendKey ? CAST[friendKey] : null;
  const done = turnIdx >= scene.turns.length;

  useEffect(() => { if (isFriendTurn && friendKey && currentTurn) cueSpeakOnce(currentTurn.line, voiceOf(friendKey)); }, [turnIdx, isFriendTurn, friendKey]);

  const advance = () => {
    const awardGem = isStudentTurn && !gemDone;
    if (awardGem) onWin(true);
    setState((s) => ({ ...s, turnIdx: s.turnIdx + 1, gemDone: s.gemDone || awardGem }));
  };

  return (
    <div className="absolute inset-0 overflow-hidden select-none" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.05) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-6 top-6 z-20 flex flex-col gap-2">
        <span className="w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">Live Stage · Your Turn</span>
        <span className="w-fit rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">🎤 Listen · Answer · Talk</span>
      </div>
      {currentTurn && isFriendTurn && (
        <div className="absolute inset-x-0 top-20 z-30 flex justify-center px-4">
          <div className="max-w-[720px] rounded-[28px] bg-white px-8 py-5 text-center shadow-[0_30px_80px_rgba(0,0,0,0.35)] ring-4 ring-orange-200">
            <div className="mb-1 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.25em]" style={{ color: friendMeta?.color ?? '#FE6A2F' }}><span className="text-lg">{friendMeta?.emoji ?? '🎓'}</span> {friendMeta?.name ?? 'Teacher'} asks</div>
            <div className="text-3xl font-black text-orange-800 sm:text-4xl">“{currentTurn.line}”</div>
            {friendKey && <button onClick={() => cueSpeakOnce(currentTurn.line, voiceOf(friendKey))} className="mt-3 mr-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-700 ring-2 ring-orange-300 shadow active:scale-95">🔊 Hear again</button>}
            <button onClick={advance} className="mt-3 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-7 py-3 text-sm font-black uppercase tracking-widest text-white shadow-xl active:scale-95">🎤 My turn</button>
          </div>
        </div>
      )}
      {currentTurn && isStudentTurn && (
        <div className="absolute inset-x-0 top-20 z-40 flex justify-center px-4">
          <div className="w-full max-w-[700px] rounded-[32px] bg-white p-6 text-center shadow-[0_30px_80px_rgba(0,0,0,0.4)] ring-4 ring-orange-300">
            <div className="text-[11px] font-black uppercase tracking-[0.25em] text-orange-500">Your turn — say it!</div>
            <div className="mt-1 text-3xl font-black text-orange-700 sm:text-4xl">“{currentTurn.line}”</div>
            <button onClick={advance} className="mt-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-7 py-3 text-base font-black uppercase tracking-widest text-white shadow-xl active:scale-95">✅ I answered</button>
          </div>
        </div>
      )}
      {/* Compact Live Stage frame on the right, below the question card. */}
      <div className="absolute z-30" style={{ right: '5%', bottom: '9%' }}>
        <StageFrame onStage={onStage} onPlace={placeOnStage} canControl={canControl} active={isStudentTurn} frameProps={dropProps}>
          <LiveStageFill onStage={onStage} onPlace={placeOnStage} over={over} canControl={canControl} />
        </StageFrame>
      </div>
      {done && <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center"><button onClick={onNext} className="rounded-full bg-orange-500 px-8 py-4 text-base font-black uppercase tracking-widest text-white shadow-2xl active:scale-95">✨ Next</button></div>}
    </div>
  );
}
