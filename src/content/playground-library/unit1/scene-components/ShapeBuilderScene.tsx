import { useEffect } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { STICKER_TILTS, ShapeIcon, StickerButton, sayWithin, shade } from './shared';

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
const gradId = (hex: string) => `pg-${hex.replace('#', '')}`;

/** Glossy toy-piece look (lighter top, shine, darker edge); ghosts stay dashed outlines. */
function PieceShape({ p, fill, ghost, pop }: { p: Piece; fill: string; ghost?: boolean; pop?: boolean }) {
  const common = ghost
    ? { fill: 'rgba(255,255,255,0.55)', stroke: '#FE6A2F', strokeWidth: 0.8, strokeDasharray: '2 1.4' }
    : { fill: `url(#${gradId(fill)})`, stroke: shade(fill, -0.45), strokeWidth: 0.9 };
  const shine = { fill: '#fff', opacity: 0.45 };
  const anim = pop ? { style: { transformBox: 'fill-box' as const, transformOrigin: 'center', animation: 'lep1-pop 0.5s ease-out' } } : {};
  if (p.shape === 'circle') {
    return (
      <g {...anim}>
        <ellipse cx={p.x + p.w / 2} cy={p.y + p.h / 2} rx={p.w / 2} ry={p.h / 2} {...common} />
        {!ghost && <ellipse cx={p.x + p.w * 0.36} cy={p.y + p.h * 0.3} rx={p.w * 0.16} ry={p.h * 0.09} {...shine} transform={`rotate(-25 ${p.x + p.w * 0.36} ${p.y + p.h * 0.3})`} />}
      </g>
    );
  }
  if (p.shape === 'square') {
    return (
      <g {...anim}>
        <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={Math.min(p.w, p.h) * 0.12} {...common} />
        {!ghost && <rect x={p.x + p.w * 0.12} y={p.y + p.h * 0.12} width={p.w * 0.42} height={Math.max(1, p.h * 0.12)} rx={p.h * 0.06} {...shine} />}
      </g>
    );
  }
  const pts = p.flip
    ? `${p.x},${p.y} ${p.x + p.w},${p.y} ${p.x + p.w / 2},${p.y + p.h}`
    : `${p.x + p.w / 2},${p.y} ${p.x + p.w},${p.y + p.h} ${p.x},${p.y + p.h}`;
  return (
    <g {...anim}>
      <polygon points={pts} strokeLinejoin="round" {...common} />
      {!ghost && !p.flip && <line x1={p.x + p.w * 0.46} y1={p.y + p.h * 0.22} x2={p.x + p.w * 0.3} y2={p.y + p.h * 0.6} stroke="#fff" strokeWidth={Math.max(0.8, p.w * 0.05)} strokeLinecap="round" opacity={0.45} />}
    </g>
  );
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
      <defs>
        {[...new Set(rd.pieces.map((pc) => pc.colorHex))].map((hex) => (
          <linearGradient key={hex} id={gradId(hex)} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={shade(hex, 0.35)} />
            <stop offset="0.55" stopColor={hex} />
            <stop offset="1" stopColor={shade(hex, -0.12)} />
          </linearGradient>
        ))}
      </defs>
      <g className={alive && rd.alive === 'bounce' ? 'animate-[lep1-hop_0.8s_ease-in-out_infinite]' : alive && rd.alive === 'wiggle' ? 'animate-[lep1-shake_0.6s_ease-in-out_infinite]' : ''} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        {rd.pieces.map((pc, i) => (i < placed ? <PieceShape key={i} p={pc} fill={pc.colorHex} pop={i === placed - 1} /> : null))}
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
      await sayWithin(r.intro, r.who);
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
    await sayWithin(namedLine(p.shape), scene.who);
    await sayWithin(pieceLine(p.colorWord, p.shape), scene.who);
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
    await sayWithin(r.line, r.who);
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
          <div key={w} className="flex flex-col items-center">
            <StickerButton onClick={() => tapName(w)} label={w} tilt={STICKER_TILTS[SHAPE_WORDS.indexOf(w)]} state={wrong === w ? 'wrong' : undefined} size="h-20 w-20 sm:h-24 sm:w-24">
              <span className="block h-full w-full p-[6%]"><ShapeIcon shape={w} fill="#E7E5E4" /></span>
            </StickerButton>
            <span className="-mt-1 rounded-full bg-white/85 px-2 text-sm font-black text-neutral-700 shadow">{w}</span>
          </div>
        ))}
        {phase === 'pick' && p && tray.map((c) => (
          <StickerButton key={c.colorWord} onClick={() => tapPiece(c.colorWord)} label={`${c.colorWord.toLowerCase()} ${p.shape}`} tilt={STICKER_TILTS[tray.indexOf(c) % STICKER_TILTS.length]} state={wrong === c.colorWord ? 'wrong' : undefined} size="h-24 w-24 sm:h-28 sm:w-28">
            <span className="block h-full w-full p-[6%]"><ShapeIcon shape={p.shape} fill={c.colorHex} /></span>
          </StickerButton>
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
