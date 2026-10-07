import { useEffect, useMemo, useRef } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak, cueSpeakOnce } from '../audio';
import { StoryCaption } from '../../StoryCaption';
import { warmCaptionPlacement } from '../../captionPlacement';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { ShapeIcon } from './shared';

// Non-readers: an answer word gets a picture beside it (colour blob, shape, 👍/👎).
const OPTION_HEX: Record<string, string> = { red: '#EF4444', blue: '#3B82F6', yellow: '#FACC15', green: '#22C55E', orange: '#F97316', purple: '#A855F7', gray: '#9CA3AF', grey: '#9CA3AF', pink: '#F472B6', black: '#111827', white: '#FFFFFF', brown: '#92400E' };
function OptionPicture({ text }: { text: string }) {
  const words = text.toLowerCase().replace(/[^a-z' ]/g, '').split(' ');
  const color = words.find((w) => OPTION_HEX[w]);
  const shape = words.find((w) => w === 'circle' || w === 'square' || w === 'triangle');
  if (shape) return <span className="block h-10 w-10 shrink-0"><ShapeIcon shape={shape} fill={color ? OPTION_HEX[color] : '#FEFBDD'} /></span>;
  if (color) return <span className="block h-10 w-10 shrink-0 rounded-full border-4 border-white shadow" style={{ backgroundColor: OPTION_HEX[color] }} />;
  if (words[0] === 'yes') return <span className="text-3xl">👍</span>;
  if (words[0] === 'no') return <span className="text-3xl">👎</span>;
  return null;
}

/* ---------- Flipbook (page-flip storybook with comprehension checkpoints) ---------- */

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
  useEffect(() => { warmCaptionPlacement(scene.pages.map((p) => p.img)); }, [scene.id]); // measure every page's picture up front
  const page = scene.pages[pageIdx];
  const total = scene.pages.length;

  useEffect(() => { if (page) cueSpeakOnce(page.text, page.who ?? 'teacher'); }, [pageIdx]);
  // Pre-A1 children can't read the question yet: the character asks it.
  useEffect(() => { if (checkpoint) cueSpeak(checkpoint.question, checkpoint.who ?? 'teacher'); }, [checkpoint?.afterPage]);

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
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
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

      <div className="absolute inset-0 z-10 flex items-center justify-center px-4 pb-24 pt-16" style={{ perspective: 1400 }}>
        <div
          onClick={turnPage}
          className="relative w-full max-w-[600px] cursor-pointer select-none rounded-[30px] p-[7px]"
          style={{
            aspectRatio: '4 / 3',
            background: 'linear-gradient(135deg, #F5D67D 0%, #C9932F 45%, #8A5A1E 100%)',
            transformOrigin: 'right center',
            transform: flipping ? 'rotateY(-130deg) scaleX(0.85)' : 'rotateY(0deg)',
            transition: 'transform 0.45s cubic-bezier(0.45,0.05,0.55,0.95)',
            backfaceVisibility: 'hidden',
            animation: flipping ? undefined : 'lep1-bookGlow 3.2s ease-in-out infinite',
          }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-gradient-to-b from-[#FFFBF0] to-[#FFF2D0]">
            <img src={page.img} alt="" className="h-full w-full object-cover" />
            {/* The line sits in the framed plate on the calm side of THIS picture (StoryCaption). */}
            <StoryCaption
              img={page.img}
              pin={page.textPos}
              name={page.who ? CAST[page.who].name : undefined}
              color={page.who ? CAST[page.who].color : '#E3A857'}
              text={page.text}
              onReplay={() => cueSpeak(page.text, page.who ?? 'teacher')}
            />
            {/* Book spine/gutter shadow, sells the open-book illusion. */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 w-8 -translate-x-1/2" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.16) 45%, rgba(0,0,0,0.16) 55%, transparent)' }} />
            {/* Folded page corner, purely decorative. */}
            <div className="pointer-events-none absolute bottom-0 right-0 h-9 w-9" style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.18) 50%)', borderRadius: '0 0 24px 0' }} />
          </div>
          {!flipping && (
            <div className="absolute -right-4 top-1/2 grid h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-2xl text-white shadow-xl ring-2 ring-white/70 animate-pulse">▶</div>
          )}
        </div>
      </div>

      {checkpoint && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 px-6" style={{ animation: 'lep1-pop 0.3s ease-out' }}>
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#FFFBF0] to-[#FFF2D0] p-6 text-center shadow-2xl ring-4 ring-amber-300/70">
            {checkpoint.who && <img src={CAST[checkpoint.who].img} alt={CAST[checkpoint.who].name} className="mx-auto mb-2 h-16 w-16 object-contain" />}
            <div className="mb-1 text-3xl">🤔</div>
            <p className="mb-4 text-xl font-black text-orange-900">{checkpoint.question}</p>
            <div className="flex flex-col gap-2">
              {checkpoint.options.map((opt) => (
                <button key={opt} onClick={() => answer(opt)}
                  className={`flex items-center justify-center gap-3 rounded-2xl border-4 border-white py-2 text-lg font-black text-white shadow-lg transition active:scale-95 ${wrongPick === opt ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}
                  style={{ background: 'linear-gradient(135deg,#FE6A2F,#FF8A4C)' }}>
                  <OptionPicture text={opt} />{opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
