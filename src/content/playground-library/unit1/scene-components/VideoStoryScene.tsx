import { useEffect, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../audio';

/* ---------- Video story (AI clip, then a still shine-reveal of the item) ---------- */

export function VideoStoryScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'video-story' }>; onNext: () => void }) {
  const [phase, setPhase] = useState<'video' | 'reveal'>('video');
  const [needsTap, setNeedsTap] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (phase !== 'reveal') return;
    void safeSpeak(scene.revealLabel, 'leo');
  }, [phase]);

  const playVideo = () => {
    setNeedsTap(false);
    void videoRef.current?.play().catch(() => setNeedsTap(true));
  };

  if (phase === 'reveal') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-200 via-orange-100 to-yellow-100">
        <div className="relative flex flex-col items-center gap-5">
          {/* Composed from existing keyframes (a bouncy pop-in + a radiating
              ping ring) rather than a new bespoke animation — see
              Lep1Keyframes for both. */}
          <div className="relative">
            <span className="absolute inset-0 -m-6 rounded-full bg-yellow-300/50 animate-[lep1-ping_1.4s_ease-out_infinite]" />
            <img
              src={scene.revealImg}
              alt={scene.revealLabel}
              className="relative h-40 w-40 object-contain drop-shadow-[0_0_25px_rgba(255,200,80,0.8)] sm:h-48 sm:w-48"
              style={{ animation: 'lep1-pop 0.5s ease-out' }}
            />
            <span className="absolute -right-2 -top-2 text-3xl" style={{ animation: 'lep1-float 1.8s ease-in-out infinite' }}>✨</span>
            <span className="absolute -bottom-1 -left-3 text-2xl" style={{ animation: 'lep1-float 2.2s ease-in-out infinite 0.3s' }}>✨</span>
          </div>
          <div className="rounded-full bg-white/95 px-6 py-2 text-xl font-black uppercase tracking-wide text-orange-700 shadow-xl">{scene.revealLabel}</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">Next →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black">
      <video
        ref={videoRef}
        src={scene.videoUrl}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        autoPlay
        onCanPlay={playVideo}
        onEnded={() => setPhase('reveal')}
      />
      {needsTap && (
        <button
          onClick={playVideo}
          className="absolute inset-0 flex items-center justify-center bg-black/40 text-2xl font-black text-white"
        >
          ▶ Tap to play
        </button>
      )}
      <button
        onClick={() => setPhase('reveal')}
        className="absolute bottom-4 right-4 z-20 rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-slate-700 shadow-lg backdrop-blur"
      >
        Skip ▶
      </button>
    </div>
  );
}
