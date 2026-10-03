import { useEffect, useRef } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak, stopSpeaking } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { ShapeIcon, sayWithin } from './shared';

/* ---------- Story video (animated, narrated, no reading needed) ----------
 * Pre-A1 children can't read yet, so the story plays like a cartoon: each
 * picture fills the screen and moves (slow zoom / pan), with animated
 * effects (bubbles, sparkles, a tear, a falling scale), while the character
 * tells that part; then it moves on by itself. It pauses for picture
 * questions — the answers are colour blobs, shapes or pictures, never words
 * to read. Teacher and student see the same frame (page index is synced; an
 * auto-advance only moves from the page it was started on, so two screens
 * never skip a page). */

type Page = Extract<Scene, { kind: 'story-video' }>['pages'][number];
type Option = Extract<Scene, { kind: 'story-video' }>['checkpoints'][number]['options'][number];

const MOTION: Record<string, string> = {
  'zoom-in': 'lep1-kb-zoom-in',
  'zoom-out': 'lep1-kb-zoom-out',
  'pan-left': 'lep1-kb-pan-left',
  'pan-right': 'lep1-kb-pan-right',
};

function Fx({ fx }: { fx?: Page['fx'] }) {
  if (fx === 'bubbles') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="absolute bottom-[-8%] block rounded-full border-2 border-white/80 bg-white/20" style={{ left: `${(i * 37) % 100}%`, width: `${14 + (i % 4) * 8}px`, height: `${14 + (i % 4) * 8}px`, animation: `lep1-bubble-up ${5 + (i % 5)}s linear ${-(i * 0.7)}s infinite` }} />
        ))}
      </div>
    );
  }
  if (fx === 'sparkles') {
    return (
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="absolute text-3xl" style={{ left: `${8 + ((i * 29) % 84)}%`, top: `${8 + ((i * 41) % 70)}%`, animation: `lep1-twinkle ${1.4 + (i % 3) * 0.5}s ease-in-out ${i * 0.2}s infinite` }}>✨</span>
        ))}
      </div>
    );
  }
  if (fx === 'tear') {
    return <span className="pointer-events-none absolute left-[63%] top-[38%] text-4xl" style={{ animation: 'lep1-tear 2.2s ease-in infinite' }}>💧</span>;
  }
  if (fx === 'hearts') {
    return (
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className="absolute bottom-[10%] text-3xl" style={{ left: `${20 + i * 8}%`, animation: `lep1-bubble-up ${4 + (i % 3)}s ease-out ${i * 0.5}s infinite` }}>💖</span>
        ))}
      </div>
    );
  }
  return null;
}

function OptionFace({ o }: { o: Option }) {
  if (o.img) return <img src={o.img} alt={o.label} className="h-full w-full object-contain" draggable={false} />;
  if (o.shape) return <ShapeIcon shape={o.shape} fill={o.colorHex ?? '#FEFBDD'} />;
  if (o.colorHex) return <span className="block h-full w-full rounded-full border-4 border-white shadow-inner" style={{ backgroundColor: o.colorHex }} />;
  return <span className="text-2xl font-black">{o.label}</span>;
}

export function StoryVideoScene({ scene, onWin, onLose, onNext, sync }: { scene: Extract<Scene, { kind: 'story-video' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    page: -1, // -1 = poster (press play)
    playing: false,
    quiz: -1, // index into checkpoints while a question is open
    solved: [] as number[],
    wrong: '',
    done: false,
    gemDone: false,
  });
  const { page, playing, quiz, solved, wrong, done, gemDone } = state;
  const total = scene.pages.length;
  const p = page >= 0 && page < total ? scene.pages[page] : undefined;
  const cp = quiz >= 0 ? scene.checkpoints[quiz] : undefined;
  const runId = useRef(0);

  // Play the current page: narrate, hold, then advance (or open its question).
  useEffect(() => {
    if (!playing || !p || cp || done) return;
    const id = ++runId.current;
    const startedOn = page;
    (async () => {
      const t0 = Date.now();
      await sayWithin(p.line, p.who, 9000);
      const left = (p.holdMs ?? 4500) - (Date.now() - t0);
      if (left > 0) await new Promise((res) => setTimeout(res, left));
      if (id !== runId.current) return;
      const qi = scene.checkpoints.findIndex((c, i) => c.afterPage === startedOn && !solved.includes(i));
      if (qi >= 0) {
        setState((s) => (s.page === startedOn && s.quiz < 0 ? { ...s, quiz: qi } : s));
        return;
      }
      setState((s) => {
        if (s.page !== startedOn) return s;
        if (startedOn + 1 >= total) return { ...s, playing: false, done: true };
        return { ...s, page: startedOn + 1 };
      });
    })();
    return () => { runId.current++; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, playing, quiz, done]);

  // Ask the open question aloud.
  useEffect(() => {
    if (!cp) return;
    const t = window.setTimeout(() => cueSpeak(cp.question, cp.who), 300);
    return () => window.clearTimeout(t);
  }, [quiz]);

  // The gem, once, when the film ends.
  useEffect(() => {
    if (done && !gemDone) { sfx.gem(); onWin(true); setState((s) => ({ ...s, gemDone: true })); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const start = () => { sfx.click(); setState((s) => ({ ...s, page: 0, playing: true, done: false, quiz: -1, solved: [] })); };
  const togglePause = () => { if (playing) stopSpeaking(); setState((s) => ({ ...s, playing: !s.playing })); };
  const replayPage = () => { stopSpeaking(); runId.current++; setState((s) => ({ ...s, playing: true })); if (p) cueSpeak(p.line, p.who); };

  const answer = async (o: Option) => {
    if (!cp) return;
    if (o.label !== cp.answer) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: o.label }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600);
      return;
    }
    sfx.match();
    const qi = quiz;
    await sayWithin(`Yes! ${cp.answer}!`, cp.who, 3000);
    setState((s) => {
      if (s.quiz !== qi) return s;
      const solvedNext = [...s.solved, qi];
      if (s.page + 1 >= total) return { ...s, quiz: -1, solved: solvedNext, playing: false, done: true };
      return { ...s, quiz: -1, solved: solvedNext, page: s.page + 1 };
    });
  };

  // Poster
  if (page < 0) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-black">
        <img src={scene.pages[0]?.img ?? scene.bg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" style={{ animation: 'lep1-kb-zoom-in 20s ease-in-out infinite alternate' }} draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50" />
        <div className="absolute inset-x-0 top-[10%] text-center text-4xl font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)] sm:text-6xl">🎬 {scene.title}</div>
        <button onClick={start} aria-label="Play the story" className="absolute left-1/2 top-1/2 grid h-36 w-36 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-7xl text-orange-500 shadow-2xl ring-8 ring-orange-400/60 transition active:scale-95" style={{ animation: 'lep1-hop 1.6s ease-in-out infinite' }}>▶</button>
      </div>
    );
  }

  // The end card
  if (done || !p) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-black">
        <img src={scene.pages[total - 1]?.img ?? scene.bg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" draggable={false} />
        <Fx fx="sparkles" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
          <div className="rounded-3xl bg-white/95 px-8 py-4 text-4xl font-black text-orange-600 shadow-2xl">🎬 The End! ⭐</div>
          <div className="flex gap-3">
            <button onClick={start} className="rounded-full bg-white px-6 py-3 text-lg font-black text-orange-600 shadow-xl active:scale-95">🔁 Watch again</button>
            <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-xl active:scale-95">Next ⭐</button>
          </div>
        </div>
      </div>
    );
  }

  const speaker = CAST[p.who];

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {/* The moving picture */}
      <img
        key={page}
        src={p.img}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ animation: `${MOTION[p.motion ?? 'zoom-in']} ${(p.holdMs ?? 4500) / 1000 + 6}s ease-in-out forwards, lep1-fade-in 0.8s ease-out`, animationPlayState: playing ? 'running' : 'paused' }}
        draggable={false}
      />
      <Fx fx={p.fx} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/35" />

      {/* Who is talking (picture, no reading needed) */}
      {speaker && !cp && (
        <div className="absolute bottom-[12%] left-4 z-20 flex items-center gap-2 rounded-full bg-white/90 py-1 pl-1 pr-4 shadow-xl">
          <img src={speaker.img} alt={speaker.name} className={`h-14 w-14 rounded-full object-cover ${playing ? 'animate-[lep1-hop_0.9s_ease-in-out_infinite]' : ''}`} draggable={false} />
          <span className="text-2xl">🔊</span>
        </div>
      )}
      {/* A small caption for the grown-up */}
      {scene.captions !== false && !cp && <div className="absolute bottom-[3%] left-1/2 z-20 max-w-[70%] -translate-x-1/2 rounded-xl bg-black/45 px-3 py-1 text-center text-sm font-semibold text-white/90">{p.line}</div>}

      {/* Film strip + controls */}
      <div className="absolute right-3 top-3 z-30 flex gap-2">
        <button onClick={replayPage} aria-label="Hear it again" className="grid h-12 w-12 place-items-center rounded-full bg-white/95 text-xl shadow-lg active:scale-95">🔁</button>
        <button onClick={togglePause} aria-label={playing ? 'Pause' : 'Play'} className="grid h-12 w-12 place-items-center rounded-full bg-white/95 text-xl shadow-lg active:scale-95">{playing ? '⏸' : '▶'}</button>
      </div>
      <div className="absolute left-1/2 top-4 z-30 flex -translate-x-1/2 gap-1.5">
        {scene.pages.map((_, i) => <span key={i} className={`h-2.5 w-7 rounded-full ${i < page ? 'bg-orange-400' : i === page ? 'bg-white' : 'bg-white/40'}`} />)}
      </div>

      {/* Picture question */}
      {cp && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-black/45 px-4">
          <button onClick={() => cueSpeak(cp.question, cp.who)} className="flex items-center gap-3 rounded-full bg-white px-5 py-2 shadow-2xl active:scale-95">
            {CAST[cp.who] && <img src={CAST[cp.who].img} alt="" className="h-12 w-12 rounded-full object-cover" />}
            <span className="text-3xl">🔊❓</span>
          </button>
          <div className="flex flex-wrap justify-center gap-5">
            {cp.options.map((o) => (
              <button
                key={o.label}
                onClick={() => answer(o)}
                aria-label={o.label}
                className={`grid h-32 w-32 place-items-center rounded-3xl border-8 bg-white p-3 shadow-2xl transition active:scale-95 sm:h-36 sm:w-36 ${wrong === o.label ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : 'border-white'}`}
              >
                <OptionFace o={o} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Every voiced line, for the clip baker. */
export function storyVideoLines(scene: Extract<Scene, { kind: 'story-video' }>) {
  return [
    ...scene.pages.map((p) => [p.who, p.line] as [string, string]),
    ...scene.checkpoints.flatMap((c) => [[c.who, c.question], [c.who, `Yes! ${c.answer}!`]] as [string, string][]),
  ];
}
