import { useEffect } from 'react';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { STICKER_TILTS, StickerButton, sayWithin } from './shared';

/* ---------- The Mystery Bag ----------
 * The ESL "feely bag / mystery bag" game (games4esl.com and eslkidsgames
 * "What's in the bag?"), made for a screen: a cloth bag wiggles and the dark
 * silhouette of a toy peeks out. Pip asks "What's in the bag?", the child
 * taps the toy ("It's a ball!"), it jumps out in colour, and Pip models the
 * full phrase ("It's a red ball!") for the child to say back. Guessing the
 * noun from its shape, then hearing it joined to a colour — Unit 3's
 * colour + toy combination, no reading. */

export const BAG_QUESTION = "What's in the bag?";
const art = (w: string) => (/^[aeiou]/i.test(w) ? 'an' : 'a');
export function toyLine(toyWord: string) {
  return `It's ${art(toyWord)} ${toyWord.toLowerCase()}!`;
}
export function colorToyLine(colorWord: string, toyWord: string) {
  return `It's ${art(colorWord)} ${colorWord.toLowerCase()} ${toyWord.toLowerCase()}!`;
}

type Bag = Extract<Scene, { kind: 'mystery-bag' }>;

function Sack({ front }: { front?: boolean }) {
  // Back half (with the open mouth) and front half are drawn separately so the
  // toy can sit "inside" the bag between them.
  return front ? (
    <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="sackFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D9A066" />
          <stop offset="1" stopColor="#B7793F" />
        </linearGradient>
      </defs>
      <path d="M 30 92 Q 20 160 45 186 Q 100 200 155 186 Q 180 160 170 92 Q 100 110 30 92 Z" fill="url(#sackFront)" stroke="#2B1E17" strokeWidth="4" strokeLinejoin="round" />
      <path d="M 60 130 q 10 6 20 0 M 115 150 q 10 6 20 0 M 70 170 q 8 5 16 0" fill="none" stroke="#8B5A2B" strokeWidth="3" strokeLinecap="round" />
      <text x="100" y="160" textAnchor="middle" fontSize="44" fontWeight="900" fill="#7C4A1E" opacity="0.55">?</text>
    </svg>
  ) : (
    <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
      <ellipse cx="100" cy="94" rx="72" ry="16" fill="#5B3A1E" stroke="#2B1E17" strokeWidth="4" />
    </svg>
  );
}

export function MysteryBagScene({ scene, onWin, onLose, onNext, sync }: { scene: Bag; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    phase: 'guess', // 'guess' → 'reveal'
    wrong: -1,
    gemDone: false,
  });
  const { round, phase, wrong, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const revealed = phase === 'reveal';
  const question = scene.question ?? BAG_QUESTION;

  useEffect(() => {
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(question, scene.who), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const guess = async (i: number) => {
    const o = r?.options[i];
    if (!r || !o || revealed) return;
    if (o.toyWord !== r.toyWord) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, phase: 'reveal' }));
    await sayWithin(toyLine(r.toyWord), scene.who);
    cueSpeak(colorToyLine(r.colorWord, r.toyWord), scene.who);
  };

  const next = () => {
    sfx.click();
    const n = round + 1;
    const awardGem = n >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: n, phase: 'guess', wrong: -1, gemDone: s.gemDone || awardGem }));
  };

  if (!r) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center gap-4 px-4">
          <div className="rounded-3xl bg-white px-8 py-3 text-center text-2xl font-black text-orange-600 shadow-2xl">🎒 {scene.doneText ?? 'The bag is empty! You found every toy!'}</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {revealed ? `🎉 ${colorToyLine(r.colorWord, r.toyWord)}` : `🎒 ${question}`}
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </div>
      <button onClick={() => cueSpeak(revealed ? colorToyLine(r.colorWord, r.toyWord) : question, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>

      {/* The bag, on the open right side of the picture */}
      <div key={round} className="absolute right-[8%] top-[16%] z-20 aspect-square h-[52vh] max-h-[420px]" style={{ animation: revealed ? undefined : 'lep1-bag-wiggle 1.6s ease-in-out infinite' }}>
        <Sack />
        <img
          src={r.img}
          alt=""
          draggable={false}
          className="absolute left-1/2 w-[46%] -translate-x-1/2 object-contain transition-all duration-700 ease-out"
          style={{
            top: revealed ? '-18%' : '30%',
            filter: revealed ? 'drop-shadow(0 8px 14px rgba(0,0,0,.35))' : 'brightness(0) opacity(0.85)',
            transform: `translateX(-50%) ${revealed ? 'scale(1.25) rotate(-4deg)' : 'scale(1)'}`,
          }}
        />
        <Sack front />
        {revealed && <div className="pointer-events-none absolute -top-[18%] left-1/2 h-[40%] w-[60%] -translate-x-1/2 rounded-full bg-yellow-200/50 blur-2xl" />}
      </div>

      {/* Picture answers (guess) / say-it card (reveal) */}
      <div className="absolute bottom-[5%] right-[4%] z-30 flex w-[60%] flex-wrap justify-center gap-4">
        {!revealed ? r.options.map((o, i) => (
          <StickerButton
            key={`${round}-${i}`}
            onClick={() => guess(i)}
            label={o.toyWord.toLowerCase()}
            tilt={STICKER_TILTS[i % STICKER_TILTS.length]}
            state={wrong === i ? 'wrong' : undefined}
            size="h-[min(17vh,14vw)] w-[min(17vh,14vw)]"
            delay={i * 0.08}
          >
            <img src={o.img} alt="" draggable={false} className="h-full w-full object-contain" />
          </StickerButton>
        )) : (
          <div className="flex flex-col items-center gap-2" style={{ animation: 'lep1-slide-up 0.4s ease-out' }}>
            <div className="rounded-3xl bg-white/95 px-5 py-2 text-center shadow-2xl">
              <div className="text-[11px] font-black uppercase tracking-widest text-emerald-600">🎤 Now you say it!</div>
              <div className="text-2xl font-black text-neutral-800">It&apos;s {art(r.colorWord)} <span style={{ color: r.colorHex }}>{r.colorWord.toLowerCase()}</span> {r.toyWord.toLowerCase()}!</div>
            </div>
            <button onClick={next} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-xl active:scale-95">I said it! ▶</button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function mysteryBagLines(scene: Bag) {
  return [
    [scene.who, scene.question ?? BAG_QUESTION] as [string, string],
    ...scene.rounds.flatMap((r) => [[scene.who, toyLine(r.toyWord)], [scene.who, colorToyLine(r.colorWord, r.toyWord)]] as [string, string][]),
  ];
}
