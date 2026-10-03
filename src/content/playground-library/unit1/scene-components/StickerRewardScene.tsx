import { useEffect, useMemo, useState } from 'react';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, CLAY_CARD } from './shared';

/* ---------- Sticker Book reward ----------
 * The blueprint's "achievement" slide, built on the collect-and-keep reward
 * of Khan Academy Kids (children collect items for the characters) and the
 * classic sticker chart: a sticker pack wiggles, the child taps to open it,
 * the lesson's sticker shines, and it flies into their Sticker Book, which
 * keeps every sticker from earlier lessons (stored on this device). Effort is
 * rewarded — it never depends on a score. */

type Sticker = Extract<Scene, { kind: 'sticker-reward' }>;
const BOOK_KEY = 'lep1-sticker-book';
type Saved = { id: string; img: string; label: string };

function readBook(): Saved[] {
  try { const v = JSON.parse(localStorage.getItem(BOOK_KEY) ?? '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}
function saveToBook(s: Saved) {
  try {
    const book = readBook().filter((b) => b.id !== s.id);
    localStorage.setItem(BOOK_KEY, JSON.stringify([...book, s]));
  } catch { /* storage blocked: the sticker still shows in this lesson */ }
}

export function StickerRewardScene({ scene, onWin, onNext, sync }: { scene: Sticker; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { phase: 'pack' }); // pack → open → book
  const { phase } = state;
  const [book, setBook] = useState<Saved[]>([]);
  const mine: Saved = useMemo(() => ({ id: scene.id, img: scene.sticker.img, label: scene.sticker.label }), [scene.id, scene.sticker.img, scene.sticker.label]);

  useEffect(() => { setBook(readBook()); }, []);
  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak('You earned a sticker!', scene.who), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);
  useEffect(() => {
    if (phase === 'open') cueSpeak(scene.line, scene.who);
    if (phase === 'book') { saveToBook(mine); setBook(readBook()); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const open = () => { sfx.gem(); onWin(true); setState({ phase: 'open' }); };
  const keep = () => { sfx.match(); setState({ phase: 'book' }); };

  const shown = phase === 'book' ? (book.some((b) => b.id === mine.id) ? book : [...book, mine]) : book;
  const slots = Math.max(8, Math.ceil((shown.length + 1) / 4) * 4);

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-amber-200/40 via-transparent to-orange-900/30" />
      {phase !== 'pack' && <Confetti count={60} />}
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        🏅 You earned a sticker!
      </div>

      {phase === 'pack' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 pb-16">
          <button onClick={open} aria-label="Open the sticker pack" className={`${CLAY_CARD} relative grid h-[44vh] w-[34vh] place-items-center overflow-hidden`} style={{ animation: 'lep1-wobble 1.1s ease-in-out infinite' }}>
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#FDBA74_0_18px,#FB923C_18px_36px)] opacity-80" />
            <div className="absolute inset-x-0 top-0 h-6 bg-[radial-gradient(circle_at_8px_0,transparent_7px,#fff_8px)] bg-[length:16px_12px]" />
            <span className="relative rounded-full bg-white/95 px-4 py-2 text-5xl shadow-xl">🎁</span>
          </button>
          <div className={`${CLAY_BUTTON} pointer-events-none px-8 py-3 text-xl`}>Tap to open!</div>
        </div>
      )}

      {phase === 'open' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 pb-16">
          <div className="relative grid h-[46vh] w-[46vh] place-items-center rounded-full bg-white shadow-[0_0_0_10px_rgba(255,255,255,0.7),0_0_60px_20px_rgba(253,224,71,0.8)]" style={{ animation: 'lep1-pop 0.6s ease-out' }}>
            <img src={scene.sticker.img} alt={scene.sticker.label} draggable={false} className="h-[78%] w-[78%] object-contain drop-shadow-xl" />
            <span className="absolute -right-2 top-4 text-5xl" style={{ animation: 'lep1-wobble 1s ease-in-out infinite' }}>✨</span>
          </div>
          <div className={`${CLAY_CARD} px-6 py-2 text-2xl font-black text-orange-600`}>{scene.sticker.label}</div>
          <button onClick={keep} className={`${CLAY_BUTTON} px-8 py-3 text-xl`}>📒 Put it in my Sticker Book</button>
        </div>
      )}

      {phase === 'book' && (
        <div className="absolute inset-x-0 top-[12%] bottom-[14%] z-20 flex items-center justify-center px-4">
          <div className="relative rounded-[32px] border-[6px] border-amber-700 bg-amber-50 p-4 shadow-2xl" style={{ animation: 'lep1-pop 0.5s ease-out' }}>
            <div className="mb-2 text-center text-xl font-black text-amber-800">📒 My Sticker Book</div>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: slots }, (_, i) => {
                const s = shown[i];
                const isNew = s?.id === mine.id;
                return (
                  <div key={i} className={`grid h-[min(14vh,12vw)] w-[min(14vh,12vw)] place-items-center rounded-2xl ${s ? 'bg-white shadow-md' : 'border-[3px] border-dashed border-amber-300'} ${isNew ? 'ring-4 ring-yellow-300' : ''}`} style={isNew ? { animation: 'lep1-pop 0.6s ease-out 0.2s both' } : undefined}>
                    {s && <img src={s.img} alt={s.label} className="h-[85%] w-[85%] object-contain" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {phase === 'book' && (
        <div className="absolute inset-x-0 bottom-[4%] z-30 flex justify-center">
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </div>
      )}
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function stickerRewardLines(scene: Sticker) {
  return [[scene.who, 'You earned a sticker!'], [scene.who, scene.line]] as [string, string][];
}
