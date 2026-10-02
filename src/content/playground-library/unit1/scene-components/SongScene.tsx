import { useCallback, useEffect, useRef, useState } from 'react';
import type { Scene } from '../scenes';

/* ---------- Song ---------- */

export function SongScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'song' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [status, setStatus] = useState<'idle' | 'playing' | 'done' | 'error'>('idle');
  const [idx, setIdx] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const totalLines = scene.lyrics.length;
  const totalDuration = scene.durationSeconds ?? 30;

  const playSong = useCallback(async () => {
    if (!scene.songUrl) { setStatus('error'); return; }
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.src = scene.songUrl;
    audio.currentTime = 0;
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
        if (!audioRef.current.paused && !audioRef.current.ended) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch { setStatus('error'); }
  }, [scene.songUrl, scene.lineDurationsMs, totalDuration, totalLines]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; } }, []);

  const current = idx >= 0 ? scene.lyrics[idx] : null;
  const isPlaying = status === 'playing';
  const isDone = status === 'done';

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)' }} />
      <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-white/85 px-5 py-2 text-lg font-black text-[#FE6A2F] shadow-lg backdrop-blur-md ring-2 ring-white/70">{scene.title}</div>
      {isPlaying && (
        <div className="pointer-events-none absolute inset-0">
          {['🎵', '🎶', '🎵', '🎶', '🎵'].map((n, i) => <span key={i} className="absolute text-3xl" style={{ left: `${10 + i * 18}%`, bottom: '45%', animation: `lep1-noteFloat ${3 + (i % 3)}s ease-in-out ${i * 0.4}s infinite` }}>{n}</span>)}
        </div>
      )}
      <div className="absolute left-1/2 w-[94%] max-w-5xl -translate-x-1/2 rounded-[2rem] bg-white/95 p-8 text-center shadow-2xl ring-8 ring-[#FE6A2F]/40 backdrop-blur-md" style={{ top: 'calc(40*var(--svh,1vh))', zIndex: 15 }}>
        {status === 'error' ? (
          <div className="text-xl font-bold text-red-600">Song unavailable — try again in a moment.</div>
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
            {status === 'done' ? '🔁 Sing Again' : status === 'error' ? '🔁 Retry' : '▶️ Play the Song'}
          </button>
        )}
        {isDone && <button onClick={onNext} className="rounded-full bg-emerald-500 px-6 py-3 text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95">Continue ➜</button>}
        {status === 'error' && <button onClick={onNext} className="rounded-full bg-slate-400 px-6 py-3 text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95">Skip ➜</button>}
      </div>
    </div>
  );
}
