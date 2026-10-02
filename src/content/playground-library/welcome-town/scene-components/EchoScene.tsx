import { useRef } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, cueSpeak } from '../../unit1/audio';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';

/* ---------- Echo ---------- */

export function EchoScene({ scene, onWin, onNext, sync }: { scene: Extract<Scene, { kind: 'echo' }>; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { heard: 0, held: false, done: false });
  const { heard, held, done } = state;
  const holdTimer = useRef<number | null>(null);
  const c = CAST[scene.who];

  const hear = async () => { setState((s) => ({ ...s, heard: s.heard + 1 })); await safeSpeak(scene.word, voiceOf(scene.who)); };
  const startHold = () => {
    setState((s) => ({ ...s, held: true }));
    holdTimer.current = window.setTimeout(() => {
      setState((s) => ({ ...s, done: true, held: false }));
      onWin(true);
      cueSpeak('Amazing! Great voice!', 'pip');
    }, 1200);
  };
  const endHold = () => { setState((s) => ({ ...s, held: false })); if (holdTimer.current) window.clearTimeout(holdTimer.current); };

  // UNIVERSAL RULE for every modeling/vocabulary scene, not just this one
  // (see unit1/SceneRenderer.tsx's ListenRepeatCardsScene `bare`/`textSide`
  // mode, the proven original of this exact pattern): student clarity
  // comes first. The old layout put everything — instruction, word,
  // Listen, Hold&say, Next — inside one centered GlassCard sitting on top
  // of the full-bleed scene image already behind it, which (a) covered
  // the exact thing a modeling scene exists to show (e.g. "look, Wim is
  // really standing right there") and (b) is not how a young student
  // actually reads best — a small pill is easy to skip past, not a real
  // reading target. The word is now large enough to read at a glance and
  // placed on whichever side of the frame is actually empty, so it never
  // overlaps the character/subject it's paired with — never guess which
  // side is safe; look at the background and choose `textSide`
  // deliberately per scene.
  const side = scene.textSide ?? 'right';
  // This mode serves two different-length cases: a single vocabulary word
  // ("Hello!") and a full modeling sentence ("Wim is in the bedroom!").
  // One fixed huge size fits the first and wraps the second onto 2+ lines
  // at that same size — long enough to run down into the character it's
  // paired with. Scale down as word count grows so a full sentence still
  // reads clearly (still large, still high-contrast) without doing that.
  const wordCount = scene.word.trim().split(/\s+/).length;
  const fontSize =
    wordCount <= 1
      ? (side === 'top' ? 'clamp(3.5rem, calc(10*var(--svw,1vw)), 7rem)' : 'clamp(4.5rem, calc(13*var(--svw,1vw)), 10rem)')
      : wordCount <= 3
      ? (side === 'top' ? 'clamp(2.5rem, calc(7*var(--svw,1vw)), 4.5rem)' : 'clamp(2.75rem, calc(8*var(--svw,1vw)), 5rem)')
      : (side === 'top' ? 'clamp(2rem, calc(5.5*var(--svw,1vw)), 3.5rem)' : 'clamp(2.25rem, calc(6*var(--svw,1vw)), 4rem)');
  return (
    <div className="absolute inset-0">
      <div className="pointer-events-none absolute inset-x-0 top-4 z-30 flex justify-center px-4">
        <div className="max-w-lg rounded-2xl bg-white/95 px-5 py-3 text-center text-base font-bold text-orange-800 shadow-xl backdrop-blur sm:text-lg">
          {scene.teacher}
        </div>
      </div>
      <div className={
        side === 'top'
          ? 'absolute inset-x-0 top-24 z-20 flex flex-col items-center gap-6 px-4'
          : `absolute inset-y-0 z-20 flex w-1/2 flex-col items-center justify-center gap-8 px-1 ${side === 'right' ? 'right-0' : 'left-0'}`
      }>
        {/* A full modeling SENTENCE (wordColors set) gets a small stone-
            plaque frame — castle-themed (warm stone tones, a double-ring
            border evoking carved masonry), sized to fit the text only,
            not a background panel spanning extra image. A single
            vocabulary word (no wordColors, e.g. "Castle!"/"Garden!")
            stays fully bare as before. Per direct request: "a small
            frame or bricks to frame the parts of the sentence" — circled
            the whole multi-word sentence, not individual words. */}
        {scene.wordColors ? (
          <div
            className="inline-block rounded-2xl px-[calc(2.2*var(--svw,1vw))] py-[calc(1.1*var(--svw,1vw))]"
            style={{
              background: 'linear-gradient(135deg, rgba(58,38,22,0.55), rgba(30,18,10,0.55))',
              border: '3px solid rgba(222,196,152,0.9)',
              boxShadow: 'inset 0 0 0 3px rgba(46,28,16,0.85), 0 10px 24px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(1.5px)',
            }}
          >
            <p
              className="max-w-[calc(84*var(--svw,1vw))] text-center font-black leading-tight text-white"
              style={{ fontSize, filter: `drop-shadow(0 4px 10px rgba(0,0,0,0.6)) drop-shadow(0 0 18px ${c.color}88)` }}
            >
              {scene.word.split(' ').map((w, i) => (
                <span key={i} style={scene.wordColors![i] ? { color: scene.wordColors![i]! } : undefined}>
                  {w}{i < scene.word.split(' ').length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
          </div>
        ) : (
          <p
            className="max-w-[calc(90*var(--svw,1vw))] text-center font-black leading-tight text-white"
            style={{
              fontSize,
              // A dark contrast shadow (readability on any background) plus a
              // soft glow in the speaking character's own color underneath it
              // — same purpose as a card used to serve (giving the bare text
              // a "presence" of its own) without bringing back the card that
              // was covering the scene.
              filter: `drop-shadow(0 6px 14px rgba(0,0,0,0.7)) drop-shadow(0 0 22px ${c.color}88)`,
            }}
          >
            {scene.word}
          </p>
        )}
        {/* One grouped control cluster instead of a lone floating "PIP SAYS"
            label sitting disconnected above two generic white pills — the
            speaker chip (avatar + name, character-colored) now visually
            leads straight into the buttons below it, and both buttons pick
            up the character's own CAST color as their accent instead of a
            fixed orange, tying them to the rest of this lesson's chip
            language (e.g. the vocab-spot room labels). Reported as "still
            doesn't feel satisfying" on the plain flat-shadow-text version. */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white/95 py-1.5 pl-1.5 pr-4 shadow-xl backdrop-blur">
            <span className="grid h-7 w-7 place-items-center rounded-full text-base shadow-inner" style={{ background: c.color }}>
              {c.emoji}
            </span>
            <span className="text-xs font-black uppercase tracking-widest sm:text-sm" style={{ color: c.color }}>
              {c.name} says
            </span>
          </div>
          <div className={side === 'top' ? 'flex flex-row items-center gap-3' : 'flex flex-col items-center gap-3'}>
            <button
              onClick={hear}
              className="rounded-full border-2 bg-white px-6 py-3 text-sm font-bold shadow-xl transition active:scale-95 sm:text-base"
              style={{ color: c.color, borderColor: c.color }}
            >
              🔊 Listen {heard > 0 && <span className="opacity-60">({heard})</span>}
            </button>
            <button
              onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold} disabled={heard === 0}
              className={`rounded-full px-6 py-3 text-sm font-black text-white shadow-xl transition sm:text-base ${held ? 'scale-95' : ''} disabled:opacity-40`}
              style={{ background: done ? 'linear-gradient(90deg, #10B981, #34D399)' : `linear-gradient(90deg, ${c.color}, ${c.color}cc)` }}
            >
              {done ? '✅ Great job!' : held ? '🎤 Keep talking…' : '🎤 Hold & say it'}
            </button>
          </div>
        </div>
      </div>
      {done && (
        <div className="absolute inset-x-0 bottom-6 z-40 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next →</button>
        </div>
      )}
    </div>
  );
}
