import { useEffect } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { ShapeIcon } from './shared';

/* ---------- Shape Builders (Pre-A1 Unit 2 Lesson 3 signature game) ----------
 * The "make a picture with shapes" activity of ESL shape lessons (shape-collage
 * house, "Let's make shape art"), turned into a language game. Each picture
 * is built one piece at a time: the empty outline glows, Pip asks "What shape
 * is it?" and the child names it (say it, tap it); then Pip says the piece
 * with its colour ("A red triangle!") and the child picks that exact piece
 * from three of the same shape in different colours — Lessons 1-2's colours
 * reviewed by listening. The finished picture comes alive (the house bounces,
 * the rocket blasts off) and its owner names it. */

export type ShapeWord = 'circle' | 'square' | 'triangle';
export const SHAPE_WORDS: ShapeWord[] = ['circle', 'square', 'triangle'];
export const SHAPE_QUESTION = 'What shape is it?';
export function namedLine(shape: string) {
  return `It's a ${shape}!`;
}
export function pieceLine(colorWord: string, shape: string) {
  const c = colorWord.toLowerCase();
  return `${/^[aeiou]/.test(c) ? 'An' : 'A'} ${c} ${shape}!`;
}

const PALETTE: { colorWord: string; colorHex: string }[] = [
  { colorWord: 'RED', colorHex: '#EF4444' },
  { colorWord: 'BLUE', colorHex: '#3B82F6' },
  { colorWord: 'YELLOW', colorHex: '#FACC15' },
  { colorWord: 'GREEN', colorHex: '#22C55E' },
  { colorWord: 'ORANGE', colorHex: '#F97316' },
  { colorWord: 'PURPLE', colorHex: '#A855F7' },
];

type Round = Extract<Scene, { kind: 'shape-builder' }>['rounds'][number];
type Piece = Round['pieces'][number];

/** One shape drawn in the board's 100×70 coordinate space. */
function PieceShape({ p, fill, ghost }: { p: Piece; fill: string; ghost?: boolean }) {
  const common = ghost
    ? { fill: 'rgba(255,255,255,0.55)', stroke: '#FE6A2F', strokeWidth: 0.8, strokeDasharray: '2 1.4' }
    : { fill, stroke: '#2B1E17', strokeWidth: 0.7 };
  if (p.shape === 'circle') {
    return <ellipse cx={p.x + p.w / 2} cy={p.y + p.h / 2} rx={p.w / 2} ry={p.h / 2} {...common} />;
  }
  if (p.shape === 'square') {
    return <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={1.2} {...common} />;
  }
  const pts = p.flip
    ? `${p.x},${p.y} ${p.x + p.w},${p.y} ${p.x + p.w / 2},${p.y + p.h}`
    : `${p.x + p.w / 2},${p.y} ${p.x + p.w},${p.y + p.h} ${p.x},${p.y + p.h}`;
  return <polygon points={pts} strokeLinejoin="round" {...common} />;
}


function Board({ rd, placed, ghost, alive, small }: { rd: Round; placed: number; ghost?: number; alive?: boolean; small?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 70"
      overflow="visible"
      className={`${small ? 'h-[22vh]' : 'h-[46vh]'} w-auto max-w-full drop-shadow-xl transition-transform duration-[1400ms] ease-in`}
      style={alive && rd.alive === 'launch' ? { transform: 'translateY(-70vh)' } : undefined}
      aria-label={rd.label}
    >
      <g className={alive && rd.alive === 'bounce' ? 'animate-[lep1-hop_0.8s_ease-in-out_infinite]' : alive && rd.alive === 'wiggle' ? 'animate-[lep1-shake_0.6s_ease-in-out_infinite]' : ''} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        {rd.pieces.map((pc, i) => (i < placed ? <PieceShape key={i} p={pc} fill={pc.colorHex} /> : null))}
        {ghost != null && rd.pieces.map((pc, i) => (i > ghost ? <g key={`f${i}`} opacity={0.35}><PieceShape p={pc} fill="" ghost /></g> : null))}
        {ghost != null && rd.pieces[ghost] && <g className="animate-pulse"><PieceShape p={rd.pieces[ghost]} fill="" ghost /></g>}
      </g>
      {alive && rd.alive === 'launch' && (
        <polygon points="44,66 56,66 50,78" fill="#F97316" className="animate-pulse" />
      )}
    </svg>
  );
}

type Phase = 'name' | 'pick' | 'done';

export function ShapeBuilderScene({ scene, onWin, onLose, onNext, sync }: { scene: Extract<Scene, { kind: 'shape-builder' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    piece: 0,
    phase: 'name' as Phase,
    wrong: '',
    gemDone: false,
  });
  const { round, piece, phase, wrong, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const p = r && piece < r.pieces.length ? r.pieces[piece] : undefined;

  // Each round opens with its owner saying what they're building.
  useEffect(() => {
    if (!r) return;
    setState((s) => ({ ...s, piece: 0, phase: 'name', wrong: '' }));
    const t = window.setTimeout(async () => {
      await safeSpeak(r.intro, r.who);
      cueSpeak(SHAPE_QUESTION, scene.who);
    }, 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const shake = (w: string) => {
    sfx.wrong(); onLose();
    setState((s) => ({ ...s, wrong: w }));
    window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600);
  };

  const tapName = async (w: ShapeWord) => {
    if (!p || phase !== 'name') return;
    if (w !== p.shape) { shake(w); return; }
    sfx.pop();
    setState((s) => ({ ...s, phase: 'pick' }));
    await safeSpeak(namedLine(p.shape), scene.who);
    await safeSpeak(pieceLine(p.colorWord, p.shape), scene.who);
  };

  // Three pieces of the asked shape: the right colour + two others (fixed per
  // piece, so teacher and student see the same tray).
  const tray = (() => {
    if (!p) return [];
    const right = PALETTE.find((c) => c.colorWord === p.colorWord) ?? { colorWord: p.colorWord, colorHex: p.colorHex };
    const others = PALETTE.filter((c) => c.colorWord !== p.colorWord);
    const k = (round * 3 + piece) % others.length;
    const picks = [right, others[k], others[(k + 2) % others.length]];
    const shift = (round + piece) % 3;
    return [...picks.slice(shift), ...picks.slice(0, shift)];
  })();

  const tapPiece = async (colorWord: string) => {
    if (!r || !p || phase !== 'pick') return;
    if (colorWord !== p.colorWord) { shake(colorWord); return; }
    sfx.match();
    const nextPiece = piece + 1;
    if (nextPiece < r.pieces.length) {
      setState((s) => ({ ...s, piece: nextPiece, phase: 'name' }));
      window.setTimeout(() => cueSpeak(SHAPE_QUESTION, scene.who), 500);
      return;
    }
    setState((s) => ({ ...s, piece: nextPiece, phase: 'done' }));
    sfx.reveal();
    await safeSpeak(r.line, r.who);
    await new Promise((res) => setTimeout(res, 1200));
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, piece: 0, phase: 'name', gemDone: s.gemDone || awardGem }));
  };

  if (!r) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center gap-4 px-4">
          <div className="flex flex-wrap justify-center gap-4 rounded-3xl bg-white/80 p-3">
            {scene.rounds.map((x) => <Board key={x.label} rd={x} placed={x.pieces.length} small />)}
          </div>
          <div className="rounded-3xl bg-white px-8 py-3 text-center text-2xl font-black text-orange-600 shadow-2xl">🔺 You built them all with shapes!</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  const owner = CAST[r.who];
  const placed = phase === 'done' ? r.pieces.length : piece;

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/25" />

      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {phase === 'name' ? `🗣️ ${SHAPE_QUESTION} Say it, then tap it!` : phase === 'pick' && p ? `👂 ${pieceLine(p.colorWord, p.shape)}` : `✨ ${r.line}`}
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </div>
      <button onClick={() => cueSpeak(phase === 'pick' && p ? pieceLine(p.colorWord, p.shape) : SHAPE_QUESTION, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>

      {/* Whose picture this is */}
      <div className="absolute left-3 top-[14%] z-20 flex items-center gap-2 rounded-full bg-white/95 py-1 pl-1 pr-4 shadow-lg">
        <img src={owner.img} alt={owner.name} className="h-10 w-10 rounded-full object-cover" draggable={false} />
        <span className="text-base font-black" style={{ color: owner.color }}>{owner.name}'s {r.label.toLowerCase()}</span>
      </div>

      {/* The picture being built */}
      <div className="absolute inset-x-0 top-[16%] z-10 flex justify-center px-4">
        <div className="rounded-[2rem] bg-white/70 p-3 shadow-2xl backdrop-blur-sm">
          <Board rd={r} placed={placed} ghost={phase === 'done' ? undefined : piece} alive={phase === 'done'} />
        </div>
      </div>

      {/* Answers: the three shape words, then three pieces of that shape */}
      <div className="absolute inset-x-0 bottom-[5%] z-30 flex flex-wrap justify-center gap-4 px-4">
        {phase === 'name' && SHAPE_WORDS.map((w) => (
          <button
            key={w}
            onClick={() => tapName(w)}
            className={`flex min-h-[64px] flex-col items-center rounded-3xl border-4 bg-white px-5 py-2 shadow-2xl transition active:scale-95 ${wrong === w ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : 'border-white'}`}
          >
            <span className="block h-12 w-12"><ShapeIcon shape={w} fill="#FEFBDD" /></span>
            <span className="mt-1 text-lg font-black text-neutral-800">{w}</span>
          </button>
        ))}
        {phase === 'pick' && p && tray.map((c) => (
          <button
            key={c.colorWord}
            onClick={() => tapPiece(c.colorWord)}
            aria-label={`${c.colorWord.toLowerCase()} ${p.shape}`}
            className={`grid h-24 w-24 place-items-center rounded-3xl border-4 bg-white p-2 shadow-2xl transition active:scale-95 ${wrong === c.colorWord ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : 'border-white'}`}
          >
            <ShapeIcon shape={p.shape} fill={c.colorHex} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function shapeBuilderLines(scene: Extract<Scene, { kind: 'shape-builder' }>) {
  const out: [string, string][] = [[scene.who, SHAPE_QUESTION]];
  for (const r of scene.rounds) {
    out.push([r.who, r.intro], [r.who, r.line]);
    for (const p of r.pieces) out.push([scene.who, namedLine(p.shape)], [scene.who, pieceLine(p.colorWord, p.shape)]);
  }
  return out;
}
