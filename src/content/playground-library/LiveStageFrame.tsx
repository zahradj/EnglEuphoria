import { useEffect, useRef, useState, type DragEvent, type PointerEvent as RPointerEvent, type MouseEvent as RMouseEvent } from 'react';
import { PARTICIPANT_DRAG_TYPE, useCallStreams, type CallRole } from '@/components/classroom/stage/callStreams';

/**
 * Inside of the Playground "Live Stage" circle. It no longer opens a camera
 * of its own: the frame stays empty until someone drags a video-call tile
 * from the classroom sidebar onto it ("putting the student on the stage"),
 * then it shows that person's live call video. Who is on stage is part of
 * the scene's synced state, so both screens show the same person — the
 * student's own camera on their side, the received stream on the teacher's.
 */
export function useStageDrop(onPlace: (role: CallRole) => void) {
  const [over, setOver] = useState(false);
  const accepts = (e: DragEvent) => Array.from(e.dataTransfer.types).includes(PARTICIPANT_DRAG_TYPE);
  return {
    over,
    dropProps: {
      onDragOver: (e: DragEvent) => { if (accepts(e)) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setOver(true); } },
      onDragLeave: () => setOver(false),
      onDrop: (e: DragEvent) => {
        setOver(false);
        const role = e.dataTransfer.getData(PARTICIPANT_DRAG_TYPE);
        if (role === 'teacher' || role === 'student') { e.preventDefault(); onPlace(role); }
      },
    },
  };
}

export function LiveStageFill({ onStage, onPlace, over, canControl }: {
  onStage: CallRole | null;
  onPlace: (role: CallRole | null) => void;
  over: boolean;
  /** False on the mirror side (it can't change the synced state). */
  canControl: boolean;
}) {
  const streams = useCallStreams();
  const inClassroom = streams.self !== null;
  const stream = onStage ? streams[onStage] : null;
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.srcObject !== stream) v.srcObject = stream;
    if (stream) void v.play().catch(() => {});
  }, [stream]);

  const stop = (e: RPointerEvent | RMouseEvent) => e.stopPropagation();

  if (onStage) {
    return (
      <>
        {stream ? (
          <video ref={videoRef} muted playsInline autoPlay className="pointer-events-none h-full w-full object-cover"
            style={{ transform: onStage === streams.self ? 'scaleX(-1)' : undefined }} />
        ) : (
          <div className="pointer-events-none flex h-full w-full items-center justify-center text-7xl">{onStage === 'student' ? '🧒' : '🧑‍🏫'}</div>
        )}
        <span className="pointer-events-none absolute right-6 top-6 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> Live
        </span>
        {canControl && (
          <button type="button" onPointerDown={stop} onClick={(e) => { stop(e); onPlace(null); }} title="Take off the stage"
            className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-black text-white hover:bg-black/70">
            ✕
          </button>
        )}
        {over && <div className="pointer-events-none absolute inset-0 rounded-full bg-white/30" />}
      </>
    );
  }

  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-white transition ${over ? 'bg-white/25' : ''}`}>
      <span className="text-5xl drop-shadow">🎬</span>
      <span className="text-xs font-black uppercase tracking-widest drop-shadow">
        {inClassroom ? (over ? 'Drop to go on stage!' : 'Drag a video here') : 'Your stage'}
      </span>
      {inClassroom && canControl && (
        <span className="flex gap-2">
          {(['student', 'teacher'] as CallRole[]).map((r) => (
            <button key={r} type="button" onPointerDown={stop} onClick={(e) => { stop(e); onPlace(r); }}
              className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-orange-700 shadow active:scale-95">
              {r === 'student' ? '🧒 Student' : '🧑‍🏫 Teacher'}
            </button>
          ))}
        </span>
      )}
    </div>
  );
}
