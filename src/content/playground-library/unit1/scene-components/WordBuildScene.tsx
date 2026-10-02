import { useEffect, useState } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';

/* ---------- Word build ---------- */

export function WordBuildScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'word-build' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [filled, setFilled] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const r = scene.rounds[round];
  const total = scene.rounds.length;
  const complete = round >= total;

  useEffect(() => {
    if (complete) return;
    setFilled(null); setWrong(null);
    const t = window.setTimeout(() => void safeSpeak(r.word, 'pip'), 350);
    return () => window.clearTimeout(t);
  }, [round, complete]);

  const tap = async (letter: string) => {
    if (filled || complete) return;
    if (letter.toLowerCase() === r.answer.toLowerCase()) {
      sfx.match(); setFilled(letter); await safeSpeak(r.word, 'pip');
      window.setTimeout(() => {
        const next = round + 1;
        if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
        setRound(next);
      }, 900);
    } else { sfx.wrong(); onLose(); setWrong(letter); window.setTimeout(() => setWrong(null), 500); }
  };

  if (complete) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <button onClick={onNext} className="relative z-10 animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">You built {total} words! ⭐ Next</button>
      </div>
    );
  }

  const letters = r.word.split('');
  const side = scene.side;
  // Two different puzzle shapes share this one scene kind:
  //  (a) progressive spelling — every round has the SAME word, one more
  //      blank than the last (e.g. u5l1-word-build-mom: 'mom' at index 0,
  //      then 1, then 2). Here a not-yet-reached letter must stay hidden,
  //      or the hint gives the answer away before the student earns it.
  //  (b) first-letter-only recognition — every round is a DIFFERENT word
  //      testing just its own first letter (the far more common case in
  //      this file: circle/square/triangle, red/blue/yellow, etc.), where
  //      the non-blank letters were never meant to be a secret — the
  //      student reads the rest of the word to help predict the missing
  //      one. Reported live as "the word isn't written for the student to
  //      predict... all the letter blocks are empty" — case (b) was
  //      rendering every position as blank because the old logic only
  //      ever revealed a position once an EARLIER round's blankIndex
  //      solved it, which never happens when every round is a different
  //      word.
  // A position only needs to stay hidden if THIS SAME WORD tests it as a
  // blank in some round — current or upcoming. Otherwise it's just part
  // of the word and can show immediately. This reproduces case (a)'s
  // exact existing behavior (every position of a shared word is tested
  // eventually) while fixing case (b) (no other round ever shares that
  // word, so nothing stays hidden).
  const isTestedInThisWord = (i: number) => scene.rounds.some((rd) => rd.word === r.word && rd.blankIndex === i);
  const revealed = new Set<number>();
  for (let i = 0; i < round; i++) {
    const rd = scene.rounds[i];
    if (rd.word === r.word) revealed.add(rd.blankIndex);
  }
  const choiceGradients = [
    'linear-gradient(135deg,#FE6A2F,#FF8A4C)', // orange
    'linear-gradient(135deg,#4FA9E0,#6EC6F0)', // blue
    'linear-gradient(135deg,#B85CD1,#D57BE6)', // purple
    'linear-gradient(135deg,#4ADE80,#86EFAC)', // green
  ];
  return (
    <div className={`absolute inset-0 flex items-center bg-cover bg-center pb-24 ${side === 'right' ? 'justify-end' : side === 'left' ? 'justify-start' : 'justify-center'}`} style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">🧩 {scene.teacher} <span className="ml-1 opacity-70">({round + 1}/{total})</span></div>
      <div className={`relative z-10 flex w-full flex-col items-center px-4 ${side ? 'max-w-[420px]' : 'max-w-[520px]'}`}>
        <div className="w-full rounded-[2.25rem] bg-white/90 p-6 shadow-2xl ring-4 ring-white/60 backdrop-blur-sm">
          {/* Picture anchor — r.img/r.emoji were captured on every round's
              data but never actually rendered here, so a student building a
              word had no way to confirm WHICH word from just the letter
              tiles + audio. A non-reader needs this exactly as much as the
              audio does; text alone (even revealed letters) isn't meaning
              until the word is fully built. */}
          <div className="mb-4 flex justify-center">
            {r.img ? (
              <img src={r.img} alt={r.word} className="h-20 w-20 rounded-2xl object-cover shadow-md sm:h-24 sm:w-24" />
            ) : (
              <span className="text-6xl sm:text-7xl">{r.emoji}</span>
            )}
          </div>
          <div className="flex items-center justify-center gap-3">
            {letters.map((ch, i) => {
              const isCurrent = i === r.blankIndex;
              const isRevealed = revealed.has(i);
              const isGiven = !isCurrent && !isRevealed && !isTestedInThisWord(i);
              const display = isCurrent ? (filled ?? '_') : (isRevealed || isGiven) ? ch : '_';
              const tileTone = isCurrent
                ? (filled ? 'border-green-400 bg-green-50 text-green-600' : 'border-dashed border-amber-400 bg-amber-50 text-amber-400')
                : isRevealed
                ? 'border-green-300 bg-green-50 text-green-700'
                : isGiven
                ? 'border-neutral-200 bg-white text-neutral-700'
                : 'border-dashed border-neutral-300 bg-neutral-100 text-neutral-300';
              return <div key={i} className={`grid place-items-center rounded-3xl border-4 font-black uppercase shadow-md transition-colors ${tileTone}`} style={{ width: 66, height: 82, fontSize: 44 }}>{display}</div>;
            })}
          </div>
          <div className="mt-4 flex justify-center">
            <button onClick={() => void safeSpeak(r.word, 'pip')} className="rounded-full bg-orange-100 px-6 py-2 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔊 Listen</button>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {r.choices.map((L, i) => (
              <button key={L} onClick={() => tap(L)} disabled={!!filled} className={`grid h-20 w-20 place-items-center rounded-3xl border-4 border-white text-4xl font-black text-white shadow-xl transition active:scale-95 disabled:opacity-40 sm:h-24 sm:w-24 sm:text-5xl ${wrong === L ? 'animate-[lep1-shake_0.4s_ease-out]' : ''}`} style={{ background: choiceGradients[i % choiceGradients.length] }}>{L}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
