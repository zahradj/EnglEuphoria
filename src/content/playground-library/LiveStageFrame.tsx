import { useEffect, useRef, useState, type DragEvent, type PointerEvent as RPointerEvent, type MouseEvent as RMouseEvent } from 'react';
import { attachStream } from '@/lib/attachStream';
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
  // Camera off (track disabled/muted/ended) → show a picture, not a black disc.
  const [camOn, setCamOn] = useState(true);
  useEffect(() => {
    const check = () => {
      const t = stream?.getVideoTracks()[0];
      setCamOn(!!t && t.enabled && !t.muted && t.readyState === 'live');
    };
    check();
    const tracks = stream?.getVideoTracks() ?? [];
    tracks.forEach((t) => { t.addEventListener('mute', check); t.addEventListener('unmute', check); t.addEventListener('ended', check); });
    const iv = window.setInterval(check, 1000);
    return () => { window.clearInterval(iv); tracks.forEach((t) => { t.removeEventListener('mute', check); t.removeEventListener('unmute', check); t.removeEventListener('ended', check); }); };
  }, [stream]);
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
        {stream && camOn ? (
          <video ref={(el) => { videoRef.current = el; attachStream(el, stream); }} muted playsInline autoPlay className="pointer-events-none h-full w-full object-cover"
            style={{ transform: onStage === streams.self ? 'scaleX(-1)' : undefined }} />
        ) : (
          <div className="pointer-events-none flex h-full w-full items-center justify-center" style={{ fontSize: 'clamp(40px, 34%, 90px)' }}>{onStage === 'student' ? '🧒' : '🧑‍🏫'}</div>
        )}
        {over && <div className="pointer-events-none absolute inset-0 rounded-full bg-white/30" />}
      </>
    );
  }

  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-1.5 px-4 text-center text-white transition ${over ? 'bg-white/25' : ''}`}>
      <span className="text-3xl drop-shadow">🎬</span>
      <span className="text-[10px] font-black uppercase tracking-widest drop-shadow">
        {inClassroom ? (over ? 'Drop to go on stage!' : 'Drag a video here') : 'Your stage'}
      </span>
      {inClassroom && canControl && (
        <span className="flex flex-col gap-1">
          {(['student', 'teacher'] as CallRole[]).map((r) => (
            <button key={r} type="button" onPointerDown={stop} onClick={(e) => { stop(e); onPlace(r); }}
              className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-orange-700 shadow active:scale-95">
              {r === 'student' ? '🧒 Student' : '🧑‍🏫 Teacher'}
            </button>
          ))}
        </span>
      )}
    </div>
  );
}

/**
 * The Live Stage frame itself — one shared look for every lesson player.
 * A compact spotlight circle (≈ a fifth of the stage, not half of it) with a
 * glowing orange-gold ring, a LIVE tag on the rim, a small mic badge and a
 * name tag underneath, so the video sits beside the question card instead
 * of covering the scene. `active` = it's the student's turn (ring pulses).
 */
export function StageFrame({ onStage, onPlace, canControl, active, frameProps, children }: {
  onStage: CallRole | null;
  onPlace: (role: CallRole | null) => void;
  canControl: boolean;
  active: boolean;
  /** Extra props for the circle (drop target, drag-to-move handlers). */
  frameProps?: React.HTMLAttributes<HTMLDivElement>;
  children: React.ReactNode;
}) {
  const stop = (e: RPointerEvent | RMouseEvent) => e.stopPropagation();
  const size = 'clamp(150px, calc(19*var(--svw,1vw)), 260px)';
  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <style>{`@keyframes ee-stage-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(254,106,47,.55), 0 18px 40px rgba(0,0,0,.35); } 50% { box-shadow: 0 0 0 12px rgba(254,106,47,0), 0 18px 40px rgba(0,0,0,.35); } }`}</style>
      {/* gradient ring */}
      <div className="relative rounded-full p-[5px]" style={{
        width: size, height: size,
        background: 'conic-gradient(from 210deg, #FE6A2F, #FEBE4C, #FFE27A, #FE6A2F, #E7569E, #FE6A2F)',
        boxShadow: '0 18px 40px rgba(0,0,0,.35)',
        animation: active ? 'ee-stage-pulse 1.6s ease-in-out infinite' : undefined,
      }}>
        <div {...frameProps} className={`relative h-full w-full overflow-hidden rounded-full ring-[3px] ring-white ${frameProps?.className ?? ''}`}
          style={{ background: 'radial-gradient(circle at 35% 30%, #FFB27A, #FE6A2F 60%, #E7569E)', ...(frameProps?.style ?? {}) }}>
          {children}
        </div>
        {/* LIVE tag on the rim */}
        {onStage && (
          <span className="pointer-events-none absolute left-1/2 top-0 z-10 flex -translate-x-1/2 -translate-y-1/3 items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white shadow ring-2 ring-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
          </span>
        )}
        {/* take-off button, outside the picture */}
        {onStage && canControl && (
          <button type="button" onPointerDown={stop} onClick={(e) => { stop(e); onPlace(null); }} title="Take off the stage" aria-label="Take off the stage"
            className="absolute right-[6%] top-[6%] z-10 grid h-6 w-6 place-items-center rounded-full bg-white text-[11px] font-black text-slate-600 shadow ring-1 ring-black/10 hover:text-red-600">
            ✕
          </button>
        )}
        {/* mic badge */}
        <span className={`pointer-events-none absolute bottom-[2%] right-[2%] z-10 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-lg shadow-lg ring-[3px] ring-white ${active ? 'animate-bounce' : ''}`}>🎤</span>
      </div>
      {/* name tag */}
      <span className="pointer-events-none mt-2 rounded-full bg-white/95 px-3 py-0.5 text-[11px] font-black text-orange-700 shadow">
        {onStage === 'student' ? '⭐ Student on stage' : onStage === 'teacher' ? '⭐ Teacher on stage' : '🎬 Stage'}
      </span>
    </div>
  );
}

