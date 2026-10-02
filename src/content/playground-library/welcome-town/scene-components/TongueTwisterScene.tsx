import { useEffect, useMemo, useState } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf, MAGIC_PURPLE, MAGIC_GOLD, MAGIC_GRADIENT, MAGIC_GLOW, MagicLayer } from './shared';

/** Splits `line` into words, marking the `focus` letters in each. */
function focusParts(word: string, focus: string): { text: string; hit: boolean }[] {
  if (!focus) return [{ text: word, hit: false }];
  const out: { text: string; hit: boolean }[] = [];
  // `focus` may list alternatives: 'l|w' marks every l and every w.
  const alts = focus.toLowerCase().split('|').filter(Boolean);
  const lower = word.toLowerCase();
  let i = 0;
  while (i < word.length) {
    let j = -1, f = '';
    for (const a of alts) { const k = lower.indexOf(a, i); if (k >= 0 && (j < 0 || k < j)) { j = k; f = a; } }
    if (j < 0) { out.push({ text: word.slice(i), hit: false }); break; }
    if (j > i) out.push({ text: word.slice(i, j), hit: false });
    out.push({ text: word.slice(j, j + f.length), hit: true });
    i = j + f.length;
  }
  return out;
}

const TWISTER_ROUNDS = [
  { label: 'Slow', icon: '🐢', msPerWord: 900 },
  { label: 'Faster', icon: '🐇', msPerWord: 560 },
  { label: 'Magic speed!', icon: '🚀', msPerWord: 330 },
] as const;

export function TongueTwisterScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'tongue-twister' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  // step 0 = listen to the wizard; 1..3 = say it at each speed; 4 = done.
  // `run` bumps each time the wand should sweep the line, so both screens
  // animate the same sweep from the synced state.
  const [state, setState] = useSyncedState(sync, { step: 0, run: 0, gemDone: false });
  const { step, run, gemDone } = state;
  const words = useMemo(() => scene.line.split(/\s+/), [scene.line]);
  const [wandAt, setWandAt] = useState(-1);
  const round = step >= 1 && step <= 3 ? TWISTER_ROUNDS[step - 1] : null;
  const done = step >= 4;

  const hear = () => { sfx.reveal(); void safeSpeak(scene.line, voiceOf(scene.who)); setState((st) => ({ ...st, run: st.run + 1 })); };

  // Wand sweep: word by word at this round's pace (listen step uses the
  // slow pace alongside the voice).
  useEffect(() => {
    if (run === 0 || done) return;
    const ms = round?.msPerWord ?? TWISTER_ROUNDS[0].msPerWord;
    let i = 0;
    setWandAt(0);
    const iv = window.setInterval(() => { i += 1; if (i >= words.length) { window.clearInterval(iv); window.setTimeout(() => setWandAt(-1), ms); } else setWandAt(i); }, ms);
    return () => window.clearInterval(iv);
  }, [run, step, done, round, words.length]);

  const start = () => { sfx.pop(); setState((st) => ({ ...st, run: st.run + 1 })); };
  const saidIt = () => {
    sfx.match();
    const next = step + 1;
    const awardGem = next >= 4 && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((st) => ({ ...st, step: next, run: next <= 3 ? st.run + 1 : st.run, gemDone: st.gemDone || awardGem }));
  };

  return (
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <MagicLayer />
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center">
        <div className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-lg ring-2 ring-white/50" style={{ background: MAGIC_GRADIENT }}>
          🪄 Wizard’s Tongue Twister
        </div>
      </div>
      <div className="absolute inset-x-0 top-12 z-20 flex justify-center px-4">
        <div className="max-w-xl rounded-2xl px-4 py-2 text-center text-sm font-bold text-white shadow-2xl sm:text-base" style={{ background: 'rgba(20,6,48,0.6)', backdropFilter: 'blur(6px)' }}>
          {done ? 'Magic! You said it at magic speed! ⭐' : step === 0 ? scene.teacher : `Your turn — say it ${round!.label.toLowerCase()} ${round!.icon}`}
        </div>
      </div>

      {/* The spell scroll */}
      <div className="absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-center px-4">
        <div className="relative w-full max-w-[900px] rounded-[2rem] border-4 px-6 py-8 text-center shadow-2xl"
          style={{ borderColor: MAGIC_GOLD, background: 'linear-gradient(180deg, #FFF8E7, #FCEFC9)', boxShadow: MAGIC_GLOW }}>
          <span className="absolute -left-4 -top-5 text-4xl">🧙</span>
          <span className="absolute -right-3 -top-5 text-4xl" style={{ animation: 'lep1-twinkle 1.6s ease-in-out infinite' }}>✨</span>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 font-black leading-tight text-[#3B0764]" style={{ fontSize: 'clamp(28px, calc(5.2*var(--svh,1vh)), 54px)' }}>
            {words.map((w, i) => (
              <span key={i} className="relative inline-block rounded-xl px-1 transition-transform duration-150"
                style={{ transform: wandAt === i ? 'translateY(-8px) scale(1.12)' : undefined, background: wandAt === i ? 'rgba(168,85,247,0.18)' : undefined }}>
                {wandAt === i && <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-3xl">🪄</span>}
                {focusParts(w, scene.focus).map((p, k) => (
                  <span key={k} style={p.hit ? { color: MAGIC_PURPLE, textShadow: '0 0 12px rgba(245,197,66,0.95)', textDecoration: 'underline', textDecorationColor: MAGIC_GOLD, textUnderlineOffset: 6 } : undefined}>{p.text}</span>
                ))}
              </span>
            ))}
          </div>
          {/* Three potions fill as each speed is said */}
          <div className="mt-6 flex items-center justify-center gap-6">
            {TWISTER_ROUNDS.map((rd, i) => {
              const filled = step > i + 1 || done;
              const active = step === i + 1;
              return (
                <div key={rd.label} className={`flex flex-col items-center gap-1 transition ${active ? 'scale-110' : ''}`}>
                  <span className="text-4xl" style={{ filter: filled ? 'drop-shadow(0 0 10px rgba(245,197,66,0.95))' : active ? undefined : 'grayscale(0.8) opacity(0.55)' }}>{filled ? '🧪' : '⚗️'}</span>
                  <span className={`text-xs font-black ${active ? 'text-[#6D28D9]' : 'text-[#6B7280]'}`}>{rd.icon} {rd.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-5 z-30 mx-auto flex max-w-lg flex-wrap justify-center gap-2 px-4">
        <button onClick={hear} className="rounded-full bg-white/95 px-5 py-3 text-sm font-black text-[#6D28D9] shadow-xl ring-2 ring-purple-200 active:scale-95">🔊 Hear the wizard</button>
        {step === 0 && <button onClick={() => { sfx.pop(); setState((st) => ({ ...st, step: 1, run: st.run + 1 })); }} className="rounded-full px-6 py-3 text-sm font-black text-white shadow-xl active:scale-95" style={{ background: MAGIC_GRADIENT }}>🎤 My turn →</button>}
        {round && <button onClick={start} className="rounded-full bg-white/95 px-5 py-3 text-sm font-black text-[#6D28D9] shadow-xl ring-2 ring-purple-200 active:scale-95">{round.icon} Wand again</button>}
        {round && <button onClick={saidIt} className="rounded-full px-6 py-3 text-sm font-black text-white shadow-xl active:scale-95" style={{ background: MAGIC_GRADIENT }}>✨ I said it!</button>}
        {done && <button onClick={onNext} className="rounded-full px-8 py-3 text-base font-black text-white shadow-2xl active:scale-95" style={{ background: MAGIC_GRADIENT }}>⭐ Next</button>}
      </div>
    </div>
  );
}
