import { useEffect, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { type ActivitySync } from '../../sceneActivitySync';
import { voiceOf } from './shared';

/* ---------- Vocab spot (arrow hotspots on one reused scene) ---------- */

export function VocabSpotScene({ scene, onNext, onWin, sync }: {
  scene: Extract<Scene, { kind: 'vocab-spot' }>;
  onNext: () => void;
  onWin: (gem: boolean) => void;
  sync?: ActivitySync;
}) {
  // Real synced state (see PlayWelcomeTownLesson's REAL_SYNC_KINDS): whichever
  // side has the floor drives `local*` and publishes it via sync.setState;
  // the other side is a pure mirror, reading step/revealed straight off the
  // latest snapshot instead of reacting to its own (nonexistent, for this
  // kind) local clicks. Replaces the old generic DOM-click-mirror for
  // vocab-spot, which broke here because the student's screen renders an
  // extra "Watching your teacher" overlay the teacher's screen doesn't —
  // an asymmetry the raw click-path replay couldn't tolerate.
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;
  const syncedState = sync?.state as { step: number; revealed: boolean } | null | undefined;
  const [localStep, setLocalStep] = useState(0);
  const [localRevealed, setLocalRevealed] = useState(false);
  const gemDone = useRef(false);
  const total = scene.items.length;

  const step = isRemoteMirror ? (syncedState?.step ?? 0) : localStep;
  const revealed = isRemoteMirror ? (syncedState?.revealed ?? false) : localRevealed;
  const done = step >= total;
  const current = !done ? scene.items[step] : null;

  const publish = (nextStep: number, nextRevealed: boolean) => {
    setLocalStep(nextStep);
    setLocalRevealed(nextRevealed);
    sync?.setState({ step: nextStep, revealed: nextRevealed });
  };

  const tap = async () => {
    if (isRemoteMirror || !current || revealed) return;
    sfx.pop();
    publish(step, true);
    // Primary audio is the bare word — the example sentence is a secondary,
    // tap-to-hear extra on the flashcard, not something spoken automatically.
    await safeSpeak(current.label, current.who ? voiceOf(current.who) : 'teacher');
  };
  const hearSentence = async () => {
    if (!current) return;
    sfx.click();
    await safeSpeak(current.sentence, current.who ? voiceOf(current.who) : 'teacher');
  };
  const hearWord = async () => {
    if (!current) return;
    sfx.click();
    await safeSpeak(current.label, current.who ? voiceOf(current.who) : 'teacher');
  };
  const dismiss = () => {
    if (isRemoteMirror) return;
    publish(step + 1, false);
  };

  // Runs on whichever side's own `step` (local or mirrored) crosses into
  // "done", so the gem/onWin fires on both screens without the mirror side
  // needing to call dismiss() itself.
  useEffect(() => {
    if (done && !gemDone.current) {
      gemDone.current = true;
      sfx.gem();
      onWin(true);
    }
  }, [done, onWin]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">
        {scene.teacher} <span className="ml-1 opacity-60">({Math.min(step, total)}/{total})</span>
      </div>
      {/* Picture-card variant (current.img set): for introducing a word
          that has no real counterpart drawn in `bg` to point an arrow at
          (an abstract concept like a preposition) — the illustration IS
          the content. A first pass showed it as a small 132px card, which
          read as cramped for a single-word introduction; per direct
          follow-up ("full screen... light images") this now uses the
          same big, bright, golden-framed single-illustration treatment
          as the storybook pages (FlipbookScene) — large, unmissable, one
          picture at a time — instead of a small floating card. */}
      {current?.img && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-[4%] pt-20">
          <button
            onClick={tap}
            disabled={revealed}
            aria-label={`Learn the word ${current.label}`}
            className="relative w-full overflow-hidden rounded-2xl transition active:scale-[0.98] disabled:pointer-events-none"
            style={{
              aspectRatio: '1 / 1',
              maxHeight: '100%',
              boxShadow: '0 0 0 6px #FFF2D0, 0 0 0 9px #C9932F, 0 10px 30px rgba(0,0,0,0.45)',
            }}
          >
            {!revealed && (
              <span className="pointer-events-none absolute inset-0 z-10" style={{ boxShadow: `inset 0 0 0 10px ${current.color}66`, animation: 'lep1-ping 1.6s ease-out infinite' }} />
            )}
            <img src={current.img} alt={current.label} className="h-full w-full object-cover" />
            {/* The word is printed on the card from the start — this is an
                introduction (pairing word + picture + audio together is
                the whole point), not a listening test like the review
                scene, where hiding the label until a correct tap is
                deliberate so reading can't substitute for listening. */}
            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-[#FFF2D0] via-[#FFF2D0]/97 to-[#FFF2D0]/0 px-4 pb-10 pt-4 text-center">
              {/* White fill + dark brown outline reads far better at this size
                  than a solid brown fill on the cream band (direct feedback:
                  "remove the brown... should be white with a brown border").
                  paintOrder keeps the stroke from eating into the fill at
                  the letterforms' sharp corners. */}
              <span
                className="text-5xl font-black leading-snug sm:text-6xl"
                style={{ color: '#FFFFFF', WebkitTextStroke: '3px #5C3A1E', paintOrder: 'stroke fill', textShadow: '0 3px 0 rgba(0,0,0,0.25)' }}
              >
                {current.label}
              </span>
            </div>
          </button>
          {revealed && (
            <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border-2 border-white bg-white/95 py-1.5 pl-2 pr-2 shadow-xl backdrop-blur" style={{ animation: 'lep1-pop 0.25s ease-out' }}>
              <button onClick={hearSentence} aria-label={`Hear "${current.label}" in a sentence`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl text-neutral-400 transition active:scale-90 hover:text-neutral-600">🔊</button>
              <button onClick={dismiss} aria-label="Got it" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl text-white shadow transition active:scale-90" style={{ background: current.color }}>✓</button>
            </div>
          )}
        </div>
      )}
      {/* Every word is already visibly drawn in scene.bg — only ONE arrow is
          ever on screen, pointing at the current word, so attention isn't
          split across the whole scene at once. It never carries a floating
          illustration of its own; it just marks where to look. The arrow
          sits a fixed gap away from the actual target (never touching it)
          and can approach from above, the left, or the right depending on
          `dir`, whichever side actually has room in that background. */}
      {current && !current.img && (() => {
        const dir = current.dir ?? 'down';
        // Matches CharacterPointer's own bump (52x76 -> 76x110, GAP 62 ->
        // 90) — same "arrows look very small" report applied to this
        // scene's own separately-drawn arrow.
        const GAP = 90;
        const pos = dir === 'down'
          ? { left: current.left, top: `calc(${current.top} - ${GAP}px)` }
          : dir === 'right'
          ? { left: `calc(${current.left} - ${GAP}px)`, top: current.top }
          : { left: `calc(${current.left} + ${GAP}px)`, top: current.top };
        const angle = dir === 'down' ? 0 : dir === 'right' ? -90 : 90;
        return (
          <button
            onClick={tap}
            disabled={revealed}
            aria-label={`Learn the word ${current.label}`}
            className="absolute z-20 transition active:scale-90 disabled:pointer-events-none"
            style={{ ...pos, transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
          >
            {/* A chunky, thick-outlined cartoon arrow (matching this world's
                "Kawaii Comic Cartoon" style — bold dark outline, solid fill,
                rounded corners), with a pulsing glow at the tip plus a
                bouncing motion so the motion reads clearly at a glance. The
                bounce animates on this inner span, separately from the
                outer button's static rotation, so the two don't clobber
                each other on the shared `transform` property. */}
            <span className="relative block" style={{ animation: revealed ? undefined : 'lep1-hop 0.9s ease-in-out infinite' }}>
              {!revealed && (
                <span className="pointer-events-none absolute bottom-0 left-1/2 h-16 w-16 -translate-x-1/2 translate-y-1/2 rounded-full" style={{ background: `radial-gradient(circle, ${current.color}88, transparent 65%)`, animation: 'lep1-ping 1.4s ease-out infinite' }} />
              )}
              {/* White fill + thin dark outline, matching CharacterPointer's
                  identical fix — see its comment for why (reported live as
                  looking "black, dark" when filled with the item's own
                  accent color). */}
              <svg width="76" height="110" viewBox="0 0 40 58" className="relative drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
                <path
                  d="M13 3 C13 1.9 13.9 1 15 1 L25 1 C26.1 1 27 1.9 27 3 L27 21 L36 21 C37.9 21 38.8 23.3 37.4 24.6 L21.4 43.6 C20.6 44.5 19.4 44.5 18.6 43.6 L2.6 24.6 C1.2 23.3 2.1 21 4 21 L13 21 Z"
                  fill="white"
                  stroke="#2A2A2A"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        );
      })()}
      {/* Label, anchored back next to the arrow (same dir/GAP math it
          uses) per direct follow-up after the bottom-banner version —
          "back to anchored near the arrow." The word itself is now BARE
          on the image (white fill, thin black outline, Tajawal — same
          "kawaii" stroke-outline technique EchoScene's bare words use),
          not sitting inside a white card: white-on-white inside a pill
          would defeat the whole point of making it white. The small
          icon/replay/dismiss controls keep their own compact white pill
          just below it. */}
      {current && !current.img && revealed && (() => {
        const dir = current.dir ?? 'down';
        const GAP = 150;
        const pos = dir === 'down'
          ? { left: current.left, top: `calc(${current.top} - ${GAP}px)` }
          : dir === 'right'
          ? { left: `calc(${current.left} - ${GAP}px)`, top: current.top }
          : { left: `calc(${current.left} + ${GAP}px)`, top: current.top };
        const leftPct = parseFloat(current.left);
        const translateX = leftPct < 25 ? '0%' : leftPct > 75 ? '-100%' : '-50%';
        return (
          <div
            className="pointer-events-none absolute z-40 flex flex-col items-center gap-2 px-2"
            style={{ ...pos, transform: `translate(${translateX}, -50%)`, animation: 'lep1-pop 0.25s ease-out' }}
          >
            <button onClick={hearWord} aria-label={`Hear "${current.label}" again`} className="pointer-events-auto flex items-center gap-2 transition active:scale-95">
              <span className="text-4xl drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)]" aria-hidden>{current.emoji}</span>
              {/* White fill + thin dark outline instead of a card: reads
                  clearly against any part of the scene without covering
                  it, matching the arrow's own white/thin-outline fix and
                  the bare-word treatment used elsewhere for modeling
                  text. Font changed from Chewy to Tajawal per direct
                  follow-up ("use this font better than chewy," pointing
                  at a screenshot of this app's own EchoScene "Castle!"
                  text) — Tajawal is already the page's own inherited
                  body font (see index.css), so this just states it
                  explicitly rather than introducing a new one. */}
              <span
                className="whitespace-nowrap text-4xl font-black leading-none sm:text-5xl"
                style={{
                  fontFamily: "'Tajawal', 'Cairo', 'Segoe UI', system-ui, sans-serif",
                  color: 'white',
                  WebkitTextStroke: '2px #1A1A1A',
                  paintOrder: 'stroke fill',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                }}
              >
                {current.label}
              </span>
            </button>
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border-2 border-white bg-white/95 py-1.5 pl-2 pr-2 shadow-xl backdrop-blur">
              <button onClick={hearSentence} aria-label={`Hear "${current.label}" in a sentence`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl text-neutral-400 transition active:scale-90 hover:text-neutral-600">🔊</button>
              <button onClick={dismiss} aria-label="Got it" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl text-white shadow transition active:scale-90" style={{ background: current.color }}>✓</button>
            </div>
          </div>
        );
      })()}
      {done && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">All found! ⭐ Next</button>
        </div>
      )}
    </div>
  );
}
