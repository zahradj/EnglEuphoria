import { useEffect, useRef, useState } from 'react';
import { LiveStageFill, StageFrame, useStageDrop } from '../../LiveStageFrame';
import type { CallRole } from '@/components/classroom/stage/callStreams';
import type { Scene, CharKey } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeakOnce, stopSpeaking } from '../audio';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Join stage ---------- */

export function JoinStageScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'join-stage' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { turnIdx: 0, gemDone: false, onStage: null as CallRole | null });
  const { turnIdx, gemDone } = state;
  // No camera of its own: whoever is dragged here from the call tiles is
  // shown (synced), see LiveStageFrame. The circle's position below is a
  // per-device UI preference (each screen's own open space differs).
  const onStage = state.onStage ?? null;
  const placeOnStage = (role: CallRole | null) => setState((s) => ({ ...s, onStage: role }));
  const canControl = !sync?.isSynced || sync.isAuthority;
  const { over, dropProps } = useStageDrop(placeOnStage);
  const stageRef = useRef<HTMLDivElement | null>(null);
  // Defaults to the open right-side space the scene art was built to leave
  // clear (see u2l3-join-stage's *-solo backgrounds) — draggable so the
  // student can move it if a particular scene's open space is elsewhere.
  const [circlePos, setCirclePos] = useState({ xPct: 82, yPct: 64 });
  const draggingRef = useRef(false);

  const moveCircleTo = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xPct = Math.min(88, Math.max(12, ((clientX - rect.left) / rect.width) * 100));
    const yPct = Math.min(90, Math.max(28, ((clientY - rect.top) / rect.height) * 100));
    setCirclePos({ xPct, yPct });
  };
  const onCirclePointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onCirclePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    moveCircleTo(e.clientX, e.clientY);
  };
  const onCirclePointerUp = () => { draggingRef.current = false; };

  useEffect(() => () => { stopSpeaking(); }, [scene.id]);

  const currentTurn = turnIdx < scene.turns.length ? scene.turns[turnIdx] : null;
  const isStudentTurn = currentTurn?.who === 'student';
  const isFriendTurn = !!currentTurn && !isStudentTurn;
  const friendKey = isFriendTurn ? (currentTurn!.who as CharKey) : null;
  const friendMeta = friendKey ? CAST[friendKey] : null;
  const done = turnIdx >= scene.turns.length;
  const bg = currentTurn?.bg ?? scene.bg;

  useEffect(() => { if (isFriendTurn && friendKey && currentTurn) cueSpeakOnce(currentTurn.line, friendKey); }, [turnIdx, isFriendTurn, friendKey]);

  const advance = () => {
    const awardGem = isStudentTurn && !gemDone;
    if (awardGem) onWin(true);
    stopSpeaking();
    setState((s) => ({ ...s, turnIdx: s.turnIdx + 1, gemDone: s.gemDone || awardGem }));
  };

  // The card must never cover what the child is talking about: when the turn
  // points at an object, the card goes to the other side of the picture.
  const arrowX = currentTurn?.arrow ? parseFloat(currentTurn.arrow.left) : NaN;
  const place = currentTurn?.bubble ?? (Number.isNaN(arrowX) ? 'top' : arrowX > 55 ? 'left' : 'right');
  const side = place === 'left' || place === 'right';
  const bubblePos = place === 'bottom' ? 'inset-x-0 bottom-20 justify-center px-4'
    : place === 'left' ? 'left-[3%] top-[14%] w-[36%] max-w-[440px]'
    : place === 'right' ? 'right-[3%] top-[14%] w-[36%] max-w-[440px]'
    : 'inset-x-0 top-20 justify-center px-4';
  const lineSize = side ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl';

  return (
    <div ref={stageRef} className="absolute inset-0 overflow-hidden select-none" style={{ backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.05) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-6 top-6 z-20 flex flex-col gap-2">
        <span className="w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">Live Stage · Your Turn</span>
        <span className="w-fit rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">🎤 Listen · Answer · Talk</span>
      </div>
      {currentTurn?.arrow && (() => {
        const { left, top, dir = 'down' } = currentTurn.arrow!;
        const GAP = 62;
        const pos = dir === 'down'
          ? { left, top: `calc(${top} - ${GAP}px)` }
          : dir === 'right'
          ? { left: `calc(${left} - ${GAP}px)`, top }
          : { left: `calc(${left} + ${GAP}px)`, top };
        const angle = dir === 'down' ? 0 : dir === 'right' ? -90 : 90;
        return (
          <span
            className="pointer-events-none absolute z-20"
            style={{ ...pos, transform: `translate(-50%, -50%) rotate(${angle}deg)`, animation: 'lep1-hop 0.9s ease-in-out infinite' }}
          >
            <svg width="52" height="76" viewBox="0 0 40 58" className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
              <path
                d="M13 3 C13 1.9 13.9 1 15 1 L25 1 C26.1 1 27 1.9 27 3 L27 21 L36 21 C37.9 21 38.8 23.3 37.4 24.6 L21.4 43.6 C20.6 44.5 19.4 44.5 18.6 43.6 L2.6 24.6 C1.2 23.3 2.1 21 4 21 L13 21 Z"
                fill="#FE6A2F"
                stroke="white"
                strokeWidth="3"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        );
      })()}
      {currentTurn && isFriendTurn && (
        <div className={`absolute ${bubblePos} z-30 flex`}>
          <div className={`${side ? "w-full px-5 py-4" : "max-w-[720px] px-8 py-5"} rounded-[28px] bg-white text-center shadow-[0_30px_80px_rgba(0,0,0,0.35)] ring-4 ring-orange-200`}>
            <div className="mb-1 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.25em]" style={{ color: friendMeta?.color ?? '#FE6A2F' }}><span className="text-lg">{friendMeta?.emoji ?? '🎓'}</span> {friendMeta?.name ?? 'Teacher'} asks</div>
            <div className={`${lineSize} font-black text-orange-800`}>“{currentTurn.line}”</div>
            {friendKey && <button onClick={() => cueSpeakOnce(currentTurn.line, friendKey)} className="mt-3 mr-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-700 ring-2 ring-orange-300 shadow active:scale-95">🔊 Hear again</button>}
            <button onClick={advance} className="mt-3 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-7 py-3 text-sm font-black uppercase tracking-widest text-white shadow-xl active:scale-95">🎤 My turn</button>
          </div>
        </div>
      )}
      {currentTurn && isStudentTurn && (
        <div className={`absolute ${bubblePos} z-40 flex`}>
          <div className="w-full max-w-[700px] rounded-[32px] bg-white p-6 text-center shadow-[0_30px_80px_rgba(0,0,0,0.4)] ring-4 ring-orange-300">
            <div className="text-[11px] font-black uppercase tracking-[0.25em] text-orange-500">Your turn — say it!</div>
            <div className={`mt-1 ${lineSize} font-black text-orange-700`}>“{currentTurn.line}”</div>
            <button onClick={advance} className="mt-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-7 py-3 text-base font-black uppercase tracking-widest text-white shadow-xl active:scale-95">✅ I answered</button>
          </div>
        </div>
      )}
      {/* Draggable, defaulting to the open side of the scene art (not
          dead-center) so the background's own object/color/shape stays
          visible while the student looks at and answers about it — drag
          the circle itself to reposition it over whichever empty patch of
          the scene fits best. */}
      <div
        className="absolute z-30 touch-none"
        style={{ left: `${circlePos.xPct}%`, top: `${circlePos.yPct}%`, transform: 'translate(-50%, -50%)' }}
      >
        <StageFrame onStage={onStage} onPlace={placeOnStage} canControl={canControl} active={isStudentTurn}
          frameProps={{ ...dropProps, onPointerDown: onCirclePointerDown, onPointerMove: onCirclePointerMove, onPointerUp: onCirclePointerUp, onPointerCancel: onCirclePointerUp, className: 'cursor-grab active:cursor-grabbing', title: 'Drag to move the stage' }}>
          <LiveStageFill onStage={onStage} onPlace={placeOnStage} over={over} canControl={canControl} />
        </StageFrame>
      </div>
      {done && <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center"><button onClick={onNext} className="rounded-full bg-orange-500 px-8 py-4 text-base font-black uppercase tracking-widest text-white shadow-2xl active:scale-95">✨ Next</button></div>}
    </div>
  );
}
