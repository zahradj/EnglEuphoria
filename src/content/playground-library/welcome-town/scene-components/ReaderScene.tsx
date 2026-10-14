import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { CharKey, Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak, safeSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { SpriteMascot, type MascotProfile } from '../../unit1/SpriteMascot';

/** Talking cast (owner 2026-10-12: "can we use characters like in the Academy? They can move and they can talk"):
 *  the speaker of the line being read stands beside the text, breathes and blinks, and bobs while the voice plays.
 *  Eye bands measured on public/welcome-town/sprites/*-wave.png. */
const TALKER: Partial<Record<CharKey, MascotProfile>> = {
  pip: { src: '/welcome-town/sprites/pip-wave.png', eyeBand: { y: 0.38, halfHeight: 0.035, x: 0.6, halfWidth: 0.17 } },
  mia: { src: '/welcome-town/sprites/mia-wave.png', eyeBand: { y: 0.39, halfHeight: 0.035, x: 0.53, halfWidth: 0.16 } },
  leo: { src: '/welcome-town/sprites/leo-wave.png', eyeBand: { y: 0.33, halfHeight: 0.035, x: 0.52, halfWidth: 0.15 } },
  bella: { src: '/welcome-town/sprites/bella-wave.png', eyeBand: { y: 0.5, halfHeight: 0.03, x: 0.47, halfWidth: 0.2 } },
  willow: { src: '/welcome-town/sprites/willow-wave.png', eyeBand: { y: 0.33, halfHeight: 0.035, x: 0.46, halfWidth: 0.17 } },
  marigold: { src: '/welcome-town/sprites/marigold-wave.png', eyeBand: { y: 0.27, halfHeight: 0.04, x: 0.58, halfWidth: 0.22 } },
};

/* ---------- The Reader (A1 reading strand, owner 2026-10-12: "in A1 … they need to learn how to read full sentences,
 * so focus on the story") ----------
 * One story for the whole unit, read a bit more each lesson (Unit 1: "Leo's First Day"). Every page:
 *   1. LISTEN — the character voices read the page while each word lights up (read-along);
 *   2. YOUR TURN — the light goes off, the child reads the page aloud; any word can be tapped to hear it;
 *   3. the teacher taps "✓ Read it!" and the page turns.
 * The text sits on its own big plate under the picture (never on the art), speaker names in their colours.
 * Mechanics: Oxford Reading Tree (one growing story, decodable words + a few sight words), read-along e-books
 * (Epic / Reading Eggs word highlighting), Jolly Phonics tricky words. Better: the child always hears the page
 * first, then reads the same words; help is one tap away on any word; both screens turn the page together. */

type Reader = Extract<Scene, { kind: 'reader' }>;
type Phase = 'listen' | 'read';

const tidy = (w: string) => w.replace(/[^A-Za-z'’-]/g, '');

export function ReaderScene({ scene, onNext, onWin, sync }: { scene: Reader; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.pages.length;
  const [state, setState] = useSyncedState(sync, { page: 0, phase: 'listen', run: 0, done: false, gemDone: false });
  const pageIdx = Math.max(0, Math.min(total - 1, Number(state.page) || 0));
  const page = scene.pages[pageIdx];
  const phase: Phase = state.phase === 'read' ? 'read' : 'listen';
  const done = !!state.done;
  const [lit, setLit] = useState(-1);
  const [talking, setTalking] = useState<number>(-1); // index of the line being spoken
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  // Read-along: each line in its speaker's voice; the light walks the words at the speaking pace.
  useEffect(() => {
    if (done || phase !== 'listen' || !page) return undefined;
    let cancelled = false;
    let timer = 0;
    const run = async () => {
      let offset = 0;
      for (let li = 0; li < page.lines.length; li++) {
        const ln = page.lines[li];
        const count = ln.text.split(/\s+/).filter(Boolean).length;
        const start = offset;
        let k = 0;
        setLit(start); setTalking(li);
        timer = window.setInterval(() => { k += 1; if (k < count) setLit(start + k); }, reduce ? 0 : 430);
        await safeSpeak(ln.text, ln.who ? voiceOf(ln.who) : 'teacher');
        window.clearInterval(timer); setTalking(-1);
        if (cancelled || !alive.current) return;
        offset += count;
        await new Promise((r) => window.setTimeout(r, 250));
      }
      if (!cancelled && alive.current) setLit(-1);
    };
    void run();
    return () => { cancelled = true; window.clearInterval(timer); setTalking(-1); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIdx, phase, state.run, done]);

  const listenAgain = () => { sfx.pop(); setState((s) => ({ ...s, phase: 'listen', run: (Number(s.run) || 0) + 1 })); };
  const myTurn = () => { sfx.pop(); setLit(-1); setState((s) => ({ ...s, phase: 'read' })); };
  const readIt = () => {
    sfx.match();
    if (pageIdx + 1 >= total) {
      if (!state.gemDone) { sfx.gem(); onWin(true); }
      setState((s) => ({ ...s, done: true, gemDone: true }));
      return;
    }
    sfx.click();
    setState((s) => ({ ...s, page: pageIdx + 1, phase: 'listen', run: (Number(s.run) || 0) + 1 }));
  };

  if (done) {
    const last = scene.pages[total - 1];
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${last?.img ?? scene.bg})` }}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <Confetti count={70} />
        <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">
          <p className="text-3xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] sm:text-4xl">📖 You read {total === 1 ? 'the page' : `${total} pages`}!</p>
          <p className="max-w-lg text-lg font-bold text-white/90">{scene.doneLine}</p>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl ring-4 ring-white/50 active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }
  if (!page) return null;

  let n = -1;
  const speakerLine = talking >= 0 ? page.lines[talking] : page.lines.find((l) => l.who);
  const speaker = speakerLine?.who ? TALKER[speakerLine.who] : undefined;
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})`, containerType: 'size' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#2b1650]/55 via-[#2b1650]/35 to-[#2b1650]/70" />
      {/* ribbon */}
      <div className="absolute inset-x-0 top-[2.5%] z-30 flex justify-center">
        <div className="flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-100 via-white to-amber-100 px-5 py-1.5 font-black text-orange-800 shadow-xl ring-1 ring-amber-300" style={{ fontSize: 'clamp(0.85rem, 3.4cqh, 1.25rem)' }}>
          📖 {scene.title}
          <span className="flex gap-1">{scene.pages.map((_, i) => <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < pageIdx ? 'bg-amber-500' : i === pageIdx ? 'bg-orange-600 ring-2 ring-orange-300' : 'bg-amber-200'}`} />)}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={pageIdx} className="absolute inset-x-[4%] top-[11%] bottom-[16%] z-20 flex flex-col items-center gap-[2cqh]"
          initial={reduce ? false : { rotateY: -70, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={reduce ? undefined : { rotateY: 70, opacity: 0 }}
          transition={{ duration: 0.45 }} style={{ transformPerspective: 1200 }}>
          {/* the picture */}
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-[2.5cqh]" style={{ aspectRatio: '16 / 9', boxShadow: '0 0 0 0.6cqh #FFF2D0, 0 0 0 1cqh #C9932F, 0 1.5cqh 3cqh rgba(0,0,0,0.45)' }}>
            <img src={page.img} alt="" draggable={false} className="h-full w-full object-cover" />
            <span className="absolute bottom-[3%] right-[2%] rounded-full bg-white/90 px-3 py-0.5 text-xs font-black text-orange-700 shadow">{pageIdx + 1} / {total}</span>
          </div>
          {/* the text plate, with the talking speaker beside it */}
          <div className="relative w-full max-w-[96cqw] rounded-[2.5cqh] border-[0.5cqh] border-amber-300 bg-[#FFFBF0] px-[2.5cqw] py-[1.6cqh] shadow-2xl" style={{ paddingLeft: speaker ? 'min(16cqw, 29cqh)' : undefined }}>
            {page.lines.map((ln, li) => (
              <div key={li} className="flex flex-wrap items-baseline gap-x-[1.1cqw] gap-y-[0.4cqh] font-black leading-snug text-[#2a1a0a]" style={{ fontSize: 'clamp(1.05rem, 6.2cqh, 2.6rem)' }}>
                {ln.who && <span className="rounded-full px-[1.2cqw] text-white" style={{ background: CAST[ln.who].color, fontSize: '0.62em' }}>{CAST[ln.who].name}</span>}
                {ln.text.split(/\s+/).filter(Boolean).map((w) => {
                  n += 1; const idx = n;
                  const on = phase === 'listen' && lit === idx;
                  return (
                    <button key={idx} type="button" onClick={() => { const t = tidy(w); if (t) cueSpeak(t, ln.who ? voiceOf(ln.who) : 'teacher'); }}
                      className="rounded-[1cqh] px-[0.3cqw] transition-all duration-150"
                      style={{ background: on ? '#FDE047' : undefined, transform: on ? 'translateY(-0.6cqh) scale(1.08)' : undefined, boxShadow: on ? '0 0.5cqh 0 #EAB308' : undefined }}>
                      {w}
                    </button>
                  );
                })}
              </div>
            ))}
            {speaker && (
              <div key={speakerLine?.who} className="pointer-events-none absolute bottom-[0.4cqh] left-[0.8cqw] z-10" style={{ width: 'min(14cqw, 26cqh)' }}>
                <SpriteMascot profile={speaker} isTalking={talking >= 0} emotion="happy" />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-[3%] z-30 flex flex-wrap items-center justify-center gap-3 px-4">
        <button onClick={listenAgain} className="rounded-full bg-white/95 px-5 py-3 font-black text-orange-700 shadow-xl ring-2 ring-orange-200 active:scale-95" style={{ fontSize: 'clamp(0.85rem, 3.4cqh, 1.2rem)' }}>🔊 Listen</button>
        {phase === 'listen'
          ? <button onClick={myTurn} className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 font-black text-white shadow-xl active:scale-95" style={{ fontSize: 'clamp(0.85rem, 3.4cqh, 1.2rem)' }}>🎤 My turn to read</button>
          : <>
              <span className="rounded-full bg-white/90 px-4 py-2 font-black text-emerald-700 shadow" style={{ fontSize: 'clamp(0.8rem, 3cqh, 1.1rem)' }}>📖 Read it! Tap a word for help.</span>
              <button onClick={readIt} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-black text-white shadow-xl active:scale-95" style={{ fontSize: 'clamp(0.85rem, 3.4cqh, 1.2rem)' }}>✓ Read it!</button>
            </>}
      </div>
    </div>
  );
}
