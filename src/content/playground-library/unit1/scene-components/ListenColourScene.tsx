import { useEffect, useMemo } from 'react';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { BoardShape, sayWithin } from './shared';

/* ---------- Listen and Colour ----------
 * Cambridge Pre A1 Starters Listening Part 5 ("Listen and colour"), as a game:
 * a picture of outline shapes, big and small; the voice says "Color the big
 * circle red!", the child dips the brush in that paint and taps that shape.
 * Trains listening for three things at once — size, shape, colour. */

export function colourLine(size: string, shape: string, colorWord: string) {
  return `Color the ${size} ${shape} ${colorWord.toLowerCase()}!`;
}
export function colouredLine(size: string, shape: string, colorWord: string) {
  return `Yes! The ${size} ${shape} is ${colorWord.toLowerCase()}!`;
}

const PAINTS = [
  { colorWord: 'RED', colorHex: '#EF4444' },
  { colorWord: 'BLUE', colorHex: '#3B82F6' },
  { colorWord: 'YELLOW', colorHex: '#FACC15' },
  { colorWord: 'GREEN', colorHex: '#22C55E' },
  { colorWord: 'ORANGE', colorHex: '#F97316' },
  { colorWord: 'PURPLE', colorHex: '#A855F7' },
];

export function ListenColourScene({ scene, onWin, onLose, onNext, sync }: { scene: Extract<Scene, { kind: 'listen-colour' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    brush: '',
    filled: [] as string[], // "itemId:COLOR"
    wrong: '',
    gemDone: false,
  });
  const { round, brush, filled, wrong, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const target = r ? scene.items.find((it) => it.id === r.item) : undefined;
  const fillOf = useMemo(() => {
    const m: Record<string, string> = {};
    for (const f of filled) {
      const [id, c] = f.split(':');
      m[id] = PAINTS.find((p) => p.colorWord === c)?.colorHex ?? '#fff';
    }
    return m;
  }, [filled]);

  useEffect(() => {
    if (!r || !target) return;
    const t = window.setTimeout(() => cueSpeak(colourLine(target.size, target.shape, r.colorWord), scene.who), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const shake = (w: string) => {
    sfx.wrong(); onLose();
    setState((s) => ({ ...s, wrong: w }));
    window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600);
  };

  const tapItem = async (id: string) => {
    if (!r || !target) return;
    if (!brush) { sfx.click(); setState((s) => ({ ...s, wrong: 'brush' })); window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600); return; }
    if (id !== target.id || brush !== r.colorWord) { shake(id); return; }
    sfx.match();
    setState((s) => ({ ...s, filled: [...s.filled, `${id}:${r.colorWord}`], brush: '' }));
    await sayWithin(colouredLine(target.size, target.shape, r.colorWord), scene.who);
    await new Promise((res) => setTimeout(res, 500));
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || awardGem }));
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {r && target ? `🖌️ ${colourLine(target.size, target.shape, r.colorWord)}` : '🎨 Beautiful picture!'}
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{Math.min(round + 1, total)}/{total}</span>
      </div>
      {r && target && (
        <button onClick={() => cueSpeak(colourLine(target.size, target.shape, r.colorWord), scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>
      )}

      {/* The colouring page */}
      <div className="absolute inset-x-0 top-[13%] z-10 flex justify-center px-4">
        <div className="rounded-[2rem] bg-white p-3 shadow-2xl ring-8 ring-orange-100">
          <svg viewBox="0 0 100 62" className="h-[48vh] w-auto max-w-full" aria-label="Colouring page">
            {scene.backdrop === 'fish' && (
              // Shelly's outline behind her scales.
              <g aria-hidden>
                <polygon points="12,31 0,14 0,48" fill="#F1F5F9" stroke="#2B1E17" strokeWidth="0.8" strokeLinejoin="round" />
                <ellipse cx="54" cy="31" rx="44" ry="28" fill="#F1F5F9" stroke="#2B1E17" strokeWidth="0.8" />
                <circle cx="88" cy="24" r="3" fill="#2B1E17" />
                <path d="M 90 34 Q 93 37 96 34" fill="none" stroke="#2B1E17" strokeWidth="0.8" strokeLinecap="round" />
              </g>
            )}
            {scene.items.map((it) => (
              <g
                key={it.id}
                onClick={() => tapItem(it.id)}
                className={`cursor-pointer ${wrong === it.id ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              >
                <BoardShape shape={it.shape} x={it.x} y={it.y} w={it.w} h={it.h} flip={it.flip} fill={fillOf[it.id] ?? '#FFFFFF'} stroke="#2B1E17" />
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Paint pots */}
      <div className={`absolute inset-x-0 bottom-[4%] z-30 flex flex-wrap justify-center gap-3 px-4 ${wrong === 'brush' ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}>
        {r ? PAINTS.map((p) => (
          <button
            key={p.colorWord}
            onClick={() => { sfx.pop(); setState((s) => ({ ...s, brush: p.colorWord })); }}
            aria-label={p.colorWord.toLowerCase()}
            className={`flex min-h-[60px] flex-col items-center rounded-3xl border-4 bg-white px-3 py-1 shadow-2xl transition active:scale-95 ${brush === p.colorWord ? '-translate-y-2 border-orange-400 ring-4 ring-orange-200' : 'border-white'}`}
          >
            <span className="block h-9 w-9 rounded-full border-4 border-white shadow-inner" style={{ backgroundColor: p.colorHex }} />
            <span className="text-sm font-black text-neutral-700">{p.colorWord.toLowerCase()}</span>
          </button>
        )) : (
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        )}
      </div>
      {r && !brush && <div className="pointer-events-none absolute bottom-[17%] left-1/2 z-30 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-sm font-black text-white shadow-lg">1. Pick the paint · 2. Tap the shape</div>}
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function listenColourLines(scene: Extract<Scene, { kind: 'listen-colour' }>) {
  return scene.rounds.flatMap((r) => {
    const it = scene.items.find((i) => i.id === r.item);
    return it ? [[scene.who, colourLine(it.size, it.shape, r.colorWord)], [scene.who, colouredLine(it.size, it.shape, r.colorWord)]] : [];
  });
}
