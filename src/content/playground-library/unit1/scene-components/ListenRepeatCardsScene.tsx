import { useEffect, useMemo, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Listen & Repeat cards (one sentence at a time, object image,
 * karaoke-style word highlight synced to playback, then hold-to-repeat) ---------- */

export function ListenRepeatCardsScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'listen-repeat-cards' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  // Only the core progression is synced. The karaoke word-highlight and the
  // hold-to-repeat gesture stay local/per-side polish — each side's own tap
  // of "Listen" already plays that side's own TTS at its own pace, so there
  // is nothing meaningful to mirror about their timing.
  const [state, setState] = useSyncedState(sync, { idx: 0, heard: false, repeated: false });
  const { idx, heard, repeated } = state;
  const [activeWord, setActiveWord] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [held, setHeld] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const karaokeTimer = useRef<number | null>(null);
  const gemDone = useRef(false);
  const total = scene.cards.length;
  const done = idx >= total;
  const card = !done ? scene.cards[idx] : null;
  const words = useMemo(() => (card ? card.sentence.split(' ') : []), [card]);

  useEffect(() => {
    setState((s) => ({ ...s, heard: false, repeated: false }));
    setActiveWord(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const play = async () => {
    if (!card || playing) return;
    setPlaying(true);
    setState((s) => ({ ...s, heard: true }));
    // Approximate karaoke: no per-word timing from TTS, so step through words
    // at a pace scaled to how long each one is, roughly tracking natural speech
    // rhythm instead of a flat interval.
    const totalChars = card.sentence.length;
    const estMs = Math.max(1400, totalChars * 55);
    const perWordMs = estMs / words.length;
    let i = 0;
    setActiveWord(0);
    karaokeTimer.current = window.setInterval(() => {
      i += 1;
      if (i < words.length) setActiveWord(i);
    }, perWordMs);
    await safeSpeak(card.sentence, card.who);
    if (karaokeTimer.current) window.clearInterval(karaokeTimer.current);
    setActiveWord(-1);
    setPlaying(false);
  };

  const startHold = () => {
    setHeld(true);
    holdTimer.current = window.setTimeout(() => {
      setHeld(false);
      setState((s) => ({ ...s, repeated: true }));
      sfx.gem();
    }, 1200);
  };
  const endHold = () => { setHeld(false); if (holdTimer.current) window.clearTimeout(holdTimer.current); };

  const next = () => {
    const n = idx + 1;
    if (n >= total && !gemDone.current) { gemDone.current = true; onWin(true); }
    setState((s) => ({ ...s, idx: n }));
  };

  if (done) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
          <Confetti />
          <button onClick={onNext} className="pointer-events-auto rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next →</button>
        </div>
      </div>
    );
  }

  const c = CAST[card!.who];

  if (scene.bare) {
    const side = scene.textSide ?? 'right';
    return (
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="pointer-events-none absolute inset-0 bg-black/10" />
        <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center px-4">
          <div className="max-w-lg rounded-2xl bg-white/95 px-5 py-3 text-center text-base font-bold text-orange-800 shadow-xl backdrop-blur sm:text-lg">
            🎧 {scene.teacher} <span className="opacity-60">({idx + 1}/{total})</span>
          </div>
        </div>

        {/* No enclosing card — the word floats directly on the background.
            'top' (a group shot with no single clean empty side) spans the
            word centered above everyone's heads instead of a left/right
            half-width column that would overlap whoever stands on that
            side; 'left'/'right' hug the one open side of a solo portrait
            (the character is already large in the photo, no need for a
            duplicate small thumbnail either way). */}
        <div className={
          side === 'top'
            ? 'absolute inset-x-0 top-24 z-10 flex flex-col items-center gap-6 px-4'
            : `absolute inset-y-0 z-10 flex w-1/2 flex-col items-center justify-center gap-8 px-1 ${side === 'right' ? 'right-0' : 'left-0'}`
        }>
          <p
            className="text-center font-black leading-none text-white drop-shadow-[0_6px_14px_rgba(0,0,0,0.7)]"
            style={{ fontSize: side === 'top' ? 'clamp(3.5rem, calc(10*var(--svw,1vw)), 7rem)' : 'clamp(4.5rem, calc(13*var(--svw,1vw)), 10rem)' }}
          >
            {words.map((w, i) => {
              const fixedColor = card!.wordColors?.[i];
              return (
                <span
                  key={i}
                  className={`transition-colors ${i === activeWord ? 'rounded bg-yellow-300 px-1 text-orange-900' : ''}`}
                  style={fixedColor && i !== activeWord ? { color: fixedColor } : undefined}
                >
                  {w}{i < words.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </p>
          <div className={side === 'top' ? 'flex flex-row items-center gap-3' : 'flex flex-col items-center gap-3'}>
            <button onClick={play} disabled={playing} className="rounded-full bg-white/95 px-6 py-3 text-sm font-bold text-orange-700 shadow-xl ring-2 ring-orange-200 active:scale-95 disabled:opacity-50">
              🔊 {playing ? 'Listening…' : 'Listen'}
            </button>
            <button
              onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
              disabled={!heard || repeated}
              className={`rounded-full px-6 py-3 text-sm font-black text-white shadow-xl transition disabled:opacity-40 ${held ? 'scale-95' : ''}`}
              style={{ background: repeated ? 'linear-gradient(90deg, #10B981, #34D399)' : 'linear-gradient(90deg, #FE6A2F, #FF8A4C)' }}
            >
              {repeated ? '✅ Great job!' : held ? '🎤 Keep talking…' : '🎤 Hold & repeat'}
            </button>
          </div>
        </div>

        {repeated && (
          <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
            <button onClick={next} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95" style={{ animation: 'lep1-slide-up 0.4s ease-out' }}>Next →</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-black/20" />
      <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center px-4">
        <div className="max-w-lg rounded-2xl bg-white/95 px-5 py-3 text-center text-base font-bold text-orange-800 shadow-xl backdrop-blur sm:text-lg">
          🎧 {scene.teacher} <span className="opacity-60">({idx + 1}/{total})</span>
        </div>
      </div>

      <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center px-4">
        <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-[2rem] bg-white/95 p-6 shadow-2xl ring-4 ring-white/70">
          <div className="flex items-center gap-3">
            <img src={c.img} alt={c.name} className="h-16 w-16 object-contain drop-shadow-lg" />
            <span className="rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest text-white shadow" style={{ background: c.color }}>{c.name}</span>
          </div>
          <div className="grid h-32 w-32 place-items-center rounded-3xl bg-orange-50 shadow-inner">
            <img src={card!.img} alt={card!.imgLabel} className="h-24 w-24 object-contain drop-shadow" />
          </div>
          <p className="text-center text-xl font-black leading-snug text-slate-800 sm:text-2xl">
            {words.map((w, i) => (
              <span key={i} className={`transition-colors ${i === activeWord ? 'rounded bg-yellow-300 px-1 text-orange-900' : ''}`}>{w}{i < words.length - 1 ? ' ' : ''}</span>
            ))}
          </p>
          <div className="flex w-full gap-2">
            <button onClick={play} disabled={playing} className="flex-1 rounded-full bg-white py-3 text-sm font-bold text-orange-700 shadow-md ring-2 ring-orange-200 active:scale-95 disabled:opacity-50">
              🔊 {playing ? 'Listening…' : 'Listen'}
            </button>
            <button
              onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
              disabled={!heard || repeated}
              className={`flex-1 rounded-full py-3 text-sm font-black text-white shadow-xl transition disabled:opacity-40 ${held ? 'scale-95' : ''}`}
              style={{ background: repeated ? 'linear-gradient(90deg, #10B981, #34D399)' : 'linear-gradient(90deg, #FE6A2F, #FF8A4C)' }}
            >
              {repeated ? '✅ Great job!' : held ? '🎤 Keep talking…' : '🎤 Hold & repeat'}
            </button>
          </div>
        </div>
      </div>

      {repeated && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button onClick={next} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95" style={{ animation: 'lep1-slide-up 0.4s ease-out' }}>Next →</button>
        </div>
      )}
    </div>
  );
}
