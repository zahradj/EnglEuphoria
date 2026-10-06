import { useEffect, useMemo, useRef } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak, cueSpeakOnce } from '../../unit1/audio';
import { StoryPlate } from '../../StoryPlate';
import { useCaptionPos } from '../../captionPlacement';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';

/* ---------- Flipbook ---------- */

export function FlipbookScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'flipbook' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  // `solved` is a plain number[] (not a Set) so it survives the JSON
  // broadcast round-trip.
  const [state, setState] = useSyncedState(sync, {
    pageIdx: 0,
    flipping: false,
    checkpoint: null as (typeof scene.checkpoints)[number] | null,
    solved: [] as number[],
    wrongPick: null as string | null,
    done: false,
  });
  const { pageIdx, flipping, checkpoint, solved, wrongPick, done } = state;
  const solvedSet = useMemo(() => new Set(solved), [solved]);
  const gemDone = useRef(false);
  const page = scene.pages[pageIdx];
  const total = scene.pages.length;
  // The caption frame goes where the picture has calm space (top / bottom / left / right).
  const captionPos = useCaptionPos(page?.img, page?.textPos);

  useEffect(() => { if (page) cueSpeakOnce(page.text, page.who ? voiceOf(page.who) : 'teacher'); }, [pageIdx]);

  const advance = () => {
    setState((s) => ({ ...s, flipping: true }));
    sfx.click();
    window.setTimeout(() => {
      if (pageIdx + 1 >= total) {
        setState((s) => ({ ...s, flipping: false, done: true }));
        if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
      } else {
        setState((s) => ({ ...s, flipping: false, pageIdx: s.pageIdx + 1 }));
      }
    }, 450);
  };

  const turnPage = () => {
    if (flipping || checkpoint || done) return;
    const pending = scene.checkpoints.find((c) => c.afterPage === pageIdx && !solvedSet.has(c.afterPage));
    if (pending) { setState((s) => ({ ...s, checkpoint: pending })); return; }
    advance();
  };

  const answer = (choice: string) => {
    if (!checkpoint) return;
    if (choice !== checkpoint.answer) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrongPick: choice }));
      window.setTimeout(() => setState((s) => ({ ...s, wrongPick: null })), 450);
      return;
    }
    sfx.match();
    setState((s) => ({
      ...s,
      solved: s.solved.includes(checkpoint.afterPage) ? s.solved : [...s.solved, checkpoint.afterPage],
      checkpoint: null,
    }));
    advance();
  };

  const sparkles = useMemo(
    () => Array.from({ length: 22 }, (_, i) => ({
      left: `${(i * 37) % 100}%`,
      top: `${(i * 53) % 100}%`,
      size: 3 + (i % 4) * 2,
      dur: 2200 + (i % 5) * 500,
      delay: (i % 7) * 300,
    })),
    [],
  );

  if (done) {
    // Close on the story's own final illustration (the happy-ending beat
    // the student just read) rather than the scene's generic establishing
    // background — a blurred stock hallway behind "The End!" undersold the
    // dedicated closing artwork right after the student had just seen it
    // in full a moment earlier.
    const lastPageImg = scene.pages[scene.pages.length - 1]?.img ?? scene.bg;
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${lastPageImg})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 backdrop-blur-sm" />
        <Confetti count={60} />
        <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">
          <p className="max-w-md text-2xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] sm:text-3xl">{scene.pages[scene.pages.length - 1]?.text}</p>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl ring-4 ring-white/50 active:scale-95" style={{ animation: 'lep1-slide-up 0.4s ease-out' }}>
            📖 The End! Next →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at center 45%, rgba(20,10,45,0.15) 0%, rgba(10,5,30,0.55) 70%, rgba(5,2,18,0.78) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {sparkles.map((s, i) => (
          <span key={i} className="absolute rounded-full bg-amber-200" style={{ left: s.left, top: s.top, width: s.size, height: s.size, boxShadow: '0 0 8px 2px rgba(255,224,140,0.9)', animation: `lep1-twinkle ${s.dur}ms ease-in-out ${s.delay}ms infinite` }} />
        ))}
      </div>
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-100/95 via-white/95 to-amber-100/95 px-5 py-2 text-center text-sm font-black text-orange-800 shadow-xl backdrop-blur ring-1 ring-amber-300/70 sm:text-base">
        ✦ {scene.title} ✦ <span className="ml-1 opacity-60">({pageIdx + 1}/{total})</span>
      </div>

      {/* Storybook page: one full illustration per beat, framed like a
          page from a picture book — not chopped into comic/manga panels.
          That multi-panel layout was tried this session (diagonal hero +
          3 side panels, then an all-rectangle bordered grid) and reported
          as not looking good as a manga; the simpler single-illustration
          page reads better for this engine's one-beat-per-page unit and
          lets each full generated illustration (see mc-storybook/-2's
          story*-p*-main.png) be seen in full rather than sliced up. Still
          fills the whole lesson frame edge-to-edge (not a small centered
          card with dead margins) per the earlier "it should fit" note. */}
      {/* The story text lives ON the illustration itself — a caption band
          across the bottom of the framed picture, the way a real picture
          book prints its text over (or right under, inset into) the art
          on the same page — not as a second stacked block below the image.
          A separate below-image text row could grow past 1 line and, in a
          shorter embedded frame (e.g. the live classroom's scaled stage),
          get pushed below the visible area entirely. Keeping it INSIDE the
          same bounded, aspect-capped box as the art guarantees it's always
          on screen, whatever the surrounding frame's height is. */}
      <div onClick={turnPage} className="absolute inset-0 z-10 flex cursor-pointer select-none items-center justify-center overflow-hidden p-[2%]">
        <div
          key={pageIdx}
          className="relative w-full select-none overflow-hidden rounded-2xl"
          style={{
            aspectRatio: '16 / 10',
            maxHeight: '100%',
            containerType: 'inline-size', // StoryPlate sizes in cqw of THIS box (its own container, so no stray-ancestor cqw bug)
            boxShadow: '0 0 0 6px #FFF2D0, 0 0 0 9px #C9932F, 0 10px 30px rgba(0,0,0,0.45)',
            opacity: flipping ? 0 : 1,
            transform: flipping ? 'scale(0.96)' : 'scale(1)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          <img src={page.img} alt="" className="h-full w-full object-cover" />
          {/* The story line sits in the same framed plate as the character-introduction
              pages, on whichever side of THIS picture has calm space — never a faint
              band over the artwork. A1+ students read it (Pre-A1 has no reading
              segment — see project_manga_panel_layout_a1_plus_only). */}
          <StoryPlate
            pos={captionPos}
            name={page.who ? CAST[page.who].name : undefined}
            color={page.who ? CAST[page.who].color : '#E3A857'}
            text={page.text}
            onReplay={() => cueSpeak(page.text, page.who ? voiceOf(page.who) : 'teacher')}
          />
          {!flipping && (
            <div className="pointer-events-none absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-lg text-white shadow-xl ring-2 ring-white/70 animate-pulse sm:h-12 sm:w-12 sm:text-xl">▶</div>
          )}
        </div>
      </div>

      {checkpoint && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 px-6" style={{ animation: 'lep1-pop 0.3s ease-out' }}>
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#FFFBF0] to-[#FFF2D0] p-6 text-center shadow-2xl ring-4 ring-amber-300/70">
            <span className="mx-auto mb-2 block text-5xl">{CAST[checkpoint.who].emoji}</span>
            <div className="mb-1 text-3xl">🤔</div>
            <p className="mb-4 text-xl font-black text-orange-900">{checkpoint.question}</p>
            <div className="flex flex-col gap-2">
              {checkpoint.options.map((opt) => (
                <button key={opt} onClick={() => answer(opt)}
                  className={`rounded-2xl border-4 border-white py-3 text-lg font-black text-white shadow-lg transition active:scale-95 ${wrongPick === opt ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}
                  style={{ background: 'linear-gradient(135deg,#FE6A2F,#FF8A4C)' }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
