import { useCallback, useEffect, useRef, useState } from 'react';
import type { Scene } from '../scenes';

/* ---------- Song ---------- */

export function SongScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'song' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [status, setStatus] = useState<'idle' | 'playing' | 'done' | 'error'>('idle');
  const [idx, setIdx] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const totalLines = scene.lyrics.length;
  const totalDuration = scene.durationSeconds ?? 30;

  const playSong = useCallback(async () => {
    if (!scene.songUrl) { setStatus('error'); return; }
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.src = scene.songUrl;
    audio.currentTime = 0;
    const video = videoRef.current;
    if (video) { video.currentTime = 0; video.play().catch(() => {}); }
    audio.onended = () => { setStatus('done'); setIdx(totalLines - 1); if (rafRef.current) cancelAnimationFrame(rafRef.current); onWin(true); };
    try {
      await audio.play();
      setStatus('playing'); setIdx(0);
      const dur = () => (isFinite(audio.duration) && audio.duration > 0 ? audio.duration : totalDuration);
      // Real per-line cue START times (seconds), when the song was generated with them
      // — falls back to evenly dividing the audio's total length only for older songs
      // that predate lineDurationsMs, since even division assumes a pacing real sung
      // audio never actually has (intro bars, uneven lines, an outro).
      let cueStarts: number[] | null = null;
      if (scene.lineDurationsMs) {
        cueStarts = [];
        let acc = 0;
        for (const ms of scene.lineDurationsMs) { cueStarts.push(acc); acc += ms / 1000; }
      }
      const tick = () => {
        if (!audioRef.current) return;
        const t = audioRef.current.currentTime;
        let i: number;
        if (cueStarts) {
          i = 0;
          for (let k = 0; k < cueStarts.length; k++) { if (t >= cueStarts[k]) i = k; }
        } else {
          const perLine = dur() / totalLines;
          i = Math.min(totalLines - 1, Math.floor(t / perLine));
        }
        setIdx(i);
        // Keep the song video in step with the sung audio (the audio is the clock).
        const v = videoRef.current;
        if (v && Math.abs(v.currentTime - t) > 0.25 && t < (v.duration || Infinity)) v.currentTime = t;
        if (!audioRef.current.paused && !audioRef.current.ended) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch { setStatus('error'); }
  }, [scene.songUrl, scene.lineDurationsMs, totalDuration, totalLines]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; } videoRef.current?.pause(); }, []);

  const current = idx >= 0 ? scene.lyrics[idx] : null;
  const isPlaying = status === 'playing';
  const isDone = status === 'done';

  if (scene.videoUrl) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-black">
        <video ref={videoRef} src={scene.videoUrl} poster={scene.bg} muted playsInline preload="auto" className="absolute inset-0 h-full w-full object-contain" />
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white/85 px-5 py-2 text-lg font-black text-[#FE6A2F] shadow-lg backdrop-blur-md ring-2 ring-white/70">{scene.title}</div>
        {(current || status === 'error') && (
          <div className="absolute inset-x-0 bottom-20 flex justify-center px-4" style={{ zIndex: 15 }}>
            <div key={idx} className="max-w-5xl rounded-3xl bg-white/90 px-6 py-3 text-center font-black leading-tight text-slate-800 shadow-2xl ring-4 ring-[#FE6A2F]/40"
              style={{ fontSize: 'clamp(18px, min(calc(3.2*var(--svw,1vw)), 5vh), 40px)', animation: 'lep1-lyricPop 0.4s ease-out' }}>
              {status === 'error' ? 'Sing it together — clap the beat!' : current?.text}
            </div>
          </div>
        )}
        {isDone && <div className="absolute inset-x-0 top-1/3 text-center text-4xl font-black text-white drop-shadow-lg">Amazing singing! 🎉</div>}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3">
          {(status === 'idle' || status === 'done' || status === 'error') && (
            <button onClick={playSong} className="rounded-full bg-[#FE6A2F] px-6 py-3 text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95">
              {status === 'done' ? '🔁 Sing Again' : status === 'error' ? '🔁 Try the music again' : '▶️ Play the Song'}
            </button>
          )}
          {(isDone || status === 'error') && <button onClick={onNext} className="rounded-full bg-emerald-500 px-6 py-3 text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95">Continue ➜</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)' }} />
      <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-white/85 px-5 py-2 text-lg font-black text-[#FE6A2F] shadow-lg backdrop-blur-md ring-2 ring-white/70">{scene.title}</div>
      {isPlaying && (
        <div className="pointer-events-none absolute inset-0">
          {['🎵', '🎶', '🎵', '🎶', '🎵'].map((n, i) => <span key={i} className="absolute text-3xl" style={{ left: `${10 + i * 18}%`, bottom: '45%', animation: `lep1-noteFloat ${3 + (i % 3)}s ease-in-out ${i * 0.4}s infinite` }}>{n}</span>)}
        </div>
      )}
      <div className="absolute left-1/2 w-[94%] max-w-5xl -translate-x-1/2 rounded-[2rem] bg-white/95 p-8 text-center shadow-2xl ring-8 ring-[#FE6A2F]/40 backdrop-blur-md" style={{ top: status === 'error' ? 'calc(16*var(--svh,1vh))' : 'calc(40*var(--svh,1vh))', zIndex: 15 }}>
        {status === 'error' ? (
          // No music file (not made yet, or it failed to load): the words still
          // work as a chant the teacher and child say together.
          <>
            <div className="mb-3 text-sm font-black uppercase tracking-widest text-[#FE6A2F] sm:text-base">🎤 Chant it together — clap the beat!</div>
            <div className="flex flex-col gap-2">
              {scene.lyrics.map((l, i) => (
                <div key={i} className="font-black leading-tight text-slate-800" style={{ fontSize: 'clamp(18px, calc(3*var(--svw,1vw)), 36px)' }}>{l.text}</div>
              ))}
            </div>
          </>
        ) : current ? (
          <>
            <div className="mb-3 text-sm font-black uppercase tracking-widest text-[#FE6A2F] sm:text-base">🎤 {current.who.toUpperCase()} sings</div>
            <div key={idx} className="font-black leading-tight text-slate-800" style={{ fontSize: 'clamp(28px, calc(5*var(--svw,1vw)), 64px)', animation: 'lep1-lyricPop 0.4s ease-out' }}>{current.text}</div>
            <div className="mt-5 flex justify-center gap-2">
              {scene.lyrics.map((_, i) => <span key={i} className={`h-3 w-10 rounded-full ${i <= idx ? 'bg-[#FE6A2F]' : 'bg-slate-200'}`} />)}
            </div>
          </>
        ) : isDone ? (
          <div className="text-3xl font-black text-slate-700">Amazing singing! 🎉</div>
        ) : (
          <div className="text-3xl font-black text-slate-700">Ready to sing? Tap ▶️ Play the Song</div>
        )}
      </div>
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
        {(status === 'idle' || status === 'done' || status === 'error') && (
          <button onClick={playSong} className="rounded-full bg-[#FE6A2F] px-6 py-3 text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95">
            {status === 'done' ? '🔁 Sing Again' : status === 'error' ? '🔁 Try the music again' : '▶️ Play the Song'}
          </button>
        )}
        {isDone && <button onClick={onNext} className="rounded-full bg-emerald-500 px-6 py-3 text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95">Continue ➜</button>}
        {status === 'error' && <button onClick={onNext} className="rounded-full bg-emerald-500 px-6 py-3 text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95">Continue ➜</button>}
      </div>
    </div>
  );
}
