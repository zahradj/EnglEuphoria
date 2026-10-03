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
  const fish = scene.backdrop === 'fish';
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

      {/* The colouring page (Shelly's lesson: an underwater window instead of a worksheet card) */}
      <div className="absolute inset-x-0 top-[13%] z-10 flex justify-center px-4">
        <div
          className={fish ? 'relative overflow-hidden rounded-[2.5rem] p-2 shadow-2xl ring-[6px] ring-white/80' : 'rounded-[2rem] bg-white p-3 shadow-2xl ring-8 ring-orange-100'}
          style={fish ? { background: 'linear-gradient(180deg,#BAE6FD 0%,#7DD3FC 45%,#38BDF8 100%)' } : undefined}
        >
          {fish && (
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              {/* light rays, sand, seaweed, bubbles */}
              <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(105deg, rgba(255,255,255,.18) 0 4%, transparent 4% 13%)' }} />
              <div className="absolute inset-x-0 bottom-0 h-[14%] rounded-t-[50%] bg-gradient-to-b from-amber-200 to-amber-300" />
              <svg className="absolute bottom-0 left-[3%] h-[45%]" viewBox="0 0 20 60"><path d="M10 60 Q 2 45 10 32 T 10 4" fill="none" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" /><path d="M14 60 Q 20 48 13 36" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" /></svg>
              <svg className="absolute bottom-0 right-[4%] h-[38%]" viewBox="0 0 20 60"><path d="M10 60 Q 18 45 10 30 T 12 6" fill="none" stroke="#15803D" strokeWidth="4" strokeLinecap="round" /></svg>
              {[8, 22, 80, 92].map((l, k) => (
                <span key={l} className="absolute bottom-[10%] block rounded-full border-2 border-white/80 bg-white/30" style={{ left: `${l}%`, width: 8 + (k % 2) * 6, height: 8 + (k % 2) * 6, animation: `lep1-bubble-rise ${5 + k}s ease-in ${k * 1.1}s infinite` }} />
              ))}
            </div>
          )}
          <svg viewBox={fish ? '-4 -4 108 70' : '0 0 100 62'} className="relative h-[48vh] w-auto max-w-full" aria-label="Colouring page">
            {fish && (
              // Shelly behind her scales: tail, fins, a soft silver body, a big friendly eye.
              <g aria-hidden>
                <defs>
                  <linearGradient id="shellyBody" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#F8FAFC" />
                    <stop offset="0.55" stopColor="#E2E8F0" />
                    <stop offset="1" stopColor="#CBD5E1" />
                  </linearGradient>
                  <linearGradient id="shellyFin" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#94A3B8" />
                    <stop offset="1" stopColor="#CBD5E1" />
                  </linearGradient>
                </defs>
                <path d="M 13 31 L -2 12 Q -5 31 -2 50 Z" fill="url(#shellyFin)" stroke="#2B1E17" strokeWidth="0.8" strokeLinejoin="round" />
                <path d="M 2 20 L 9 31 L 2 42" fill="none" stroke="#64748B" strokeWidth="0.6" strokeLinecap="round" />
                <path d="M 36 5 Q 52 -6 72 5" fill="url(#shellyFin)" stroke="#2B1E17" strokeWidth="0.8" strokeLinejoin="round" />
                <ellipse cx="54" cy="31" rx="44" ry="28" fill="url(#shellyBody)" stroke="#2B1E17" strokeWidth="0.8" />
                <ellipse cx="58" cy="9" rx="22" ry="3" fill="#fff" opacity="0.7" />
                <path d="M 50 52 Q 56 64 66 54 Z" fill="url(#shellyFin)" stroke="#2B1E17" strokeWidth="0.7" strokeLinejoin="round" />
                <circle cx="88" cy="24" r="5" fill="#fff" stroke="#2B1E17" strokeWidth="0.7" />
                <circle cx="89" cy="24.5" r="3" fill="#2B1E17" />
                <circle cx="90" cy="23.2" r="1" fill="#fff" />
                <ellipse cx="91" cy="33" rx="2.6" ry="1.5" fill="#FDA4AF" opacity="0.8" />
                <path d="M 92 37 Q 95 40 98 36" fill="none" stroke="#2B1E17" strokeWidth="0.8" strokeLinecap="round" />
              </g>
            )}
            {scene.items.map((it) => {
              const done = !!fillOf[it.id];
              return (
                <g
                  key={it.id}
                  onClick={() => tapItem(it.id)}
                  className={`cursor-pointer ${wrong === it.id ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center', filter: done ? 'drop-shadow(0 0 1.2px rgba(255,255,255,.9))' : undefined }}
                >
                  <BoardShape shape={it.shape} x={it.x} y={it.y} w={it.w} h={it.h} flip={it.flip} fill={fillOf[it.id] ?? (fish ? 'rgba(255,255,255,.85)' : '#FFFFFF')} stroke="#2B1E17" dashed={fish && !done} />
                </g>
              );
            })}
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
            className={`relative flex flex-col items-center rounded-3xl px-2 pt-1 transition active:scale-95 ${brush === p.colorWord ? '-translate-y-3' : ''}`}
          >
            {/* a paint pot: coloured paint on top, a little drip, the jar below */}
            <span className={`relative block h-14 w-14 rounded-b-2xl rounded-t-lg border-[3px] border-[#2B1E17] bg-white shadow-xl ${brush === p.colorWord ? 'ring-4 ring-white' : ''}`}>
              <span className="absolute inset-x-0 top-0 block h-[55%] rounded-t-md" style={{ backgroundColor: p.colorHex }} />
              <span className="absolute left-[22%] top-[45%] block h-3 w-2.5 rounded-b-full" style={{ backgroundColor: p.colorHex }} />
              <span className="absolute right-1 top-1 block h-2 w-4 rounded-full bg-white/60" />
              {brush === p.colorWord && <span className="absolute -right-3 -top-5 rotate-[20deg] text-2xl drop-shadow">🖌️</span>}
            </span>
            <span className="mt-1 rounded-full bg-white/90 px-2 text-sm font-black text-neutral-700 shadow">{p.colorWord.toLowerCase()}</span>
          </button>
        )) : (
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        )}
      </div>
      {r && !brush && <div className="pointer-events-none absolute bottom-[19%] left-1/2 z-30 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-sm font-black text-white shadow-lg">1. Pick the paint · 2. Tap the shape</div>}
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
