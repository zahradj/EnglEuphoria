import { useEffect, useMemo, useRef } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak, playLetterPhonic } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Alphabet blocks ---------- */

export function AlphabetBlocksScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'alphabet-blocks' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  type Phase = 'intro' | 'tap' | 'stack' | 'done';
  // `bank` (the shuffled letter choices for the stack phase) is synced state
  // rather than a local useMemo — it's built with Math.random(), so the
  // mirror side computing its own copy would get a different letter order
  // than the authority, breaking the tap-by-index mapping between screens.
  // `usedBank` is a plain number[] (not a Set) to survive the JSON
  // broadcast round-trip.
  const [state, setState] = useSyncedState(sync, {
    phase: 'intro' as Phase,
    tapIdx: 0,
    tapWrong: null as string | null,
    tapWinLetter: null as string | null,
    wordIdx: 0,
    placed: [] as string[],
    wrongBankIdx: null as number | null,
    celebrate: false,
    gemDone: false,
    bank: [] as string[],
    usedBank: [] as number[],
  });
  const { phase, tapIdx, tapWrong, tapWinLetter, wordIdx, placed, wrongBankIdx, celebrate, gemDone, bank, usedBank } = state;
  const usedBankSet = useMemo(() => new Set(usedBank), [usedBank]);
  // The two async sequences below (tap-phonics prompts, stack-phase intro)
  // only run on the authority side; the mirror renders whatever state it
  // receives instead of driving its own independent timers.
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;
  const introRef = useRef(false);

  const BLOCK_COLORS = ['#FE6A2F', '#F59E0B', '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444'];
  const colorFor = (letter: string) => { const i = scene.letters.indexOf(letter); return BLOCK_COLORS[Math.max(0, i) % BLOCK_COLORS.length]; };

  const buildBank = (word: string) => {
    const need = word.split('');
    const distractors = scene.letters.filter((l) => !need.includes(l)).slice(0, 3);
    const arr = [...need, ...distractors];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  };

  useEffect(() => {
    if (isRemoteMirror || introRef.current) return;
    introRef.current = true;
    (async () => {
      await new Promise((r) => setTimeout(r, 200));
      setState((s) => ({ ...s, phase: 'tap' }));
      await new Promise((r) => setTimeout(r, 300));
      await playLetterPhonic(scene.tapRounds[0].letter);
    })();
  }, [isRemoteMirror]);

  const tapPromptRef = useRef(0);
  useEffect(() => {
    if (isRemoteMirror || phase !== 'tap' || tapIdx === 0) return;
    tapPromptRef.current += 1;
    const token = tapPromptRef.current;
    (async () => { await new Promise((r) => setTimeout(r, 250)); if (token !== tapPromptRef.current) return; await playLetterPhonic(scene.tapRounds[tapIdx].letter); })();
  }, [tapIdx, phase, isRemoteMirror]);

  const handleTapLetter = async (letter: string) => {
    if (isRemoteMirror || phase !== 'tap' || tapWinLetter) return;
    const target = scene.tapRounds[tapIdx].letter;
    if (letter === target) {
      setState((s) => ({ ...s, tapWinLetter: letter }));
      sfx.gem();
      await new Promise((r) => setTimeout(r, 700));
      if (tapIdx + 1 < scene.tapRounds.length) {
        setState((s) => ({ ...s, tapWinLetter: null, tapIdx: s.tapIdx + 1 }));
      } else {
        const firstWord = scene.words[0].word;
        setState((s) => ({ ...s, tapWinLetter: null, phase: 'stack', wordIdx: 0, placed: [], usedBank: [], bank: buildBank(firstWord) }));
        await new Promise((r) => setTimeout(r, 300));
        await safeSpeak(firstWord, 'pip');
      }
    } else {
      sfx.wrong();
      setState((s) => ({ ...s, tapWrong: letter }));
      window.setTimeout(() => setState((s) => ({ ...s, tapWrong: null })), 450);
    }
  };

  const currentWord = scene.words[wordIdx]?.word ?? '';

  const handleBankTap = async (bIdx: number, letter: string) => {
    if (isRemoteMirror || phase !== 'stack' || celebrate || usedBankSet.has(bIdx)) return;
    const target = currentWord[placed.length];
    if (letter === target) {
      const nextPlaced = [...placed, letter];
      sfx.pop();
      setState((s) => ({ ...s, placed: nextPlaced, usedBank: [...s.usedBank, bIdx] }));
      if (nextPlaced.length === currentWord.length) {
        setState((s) => ({ ...s, celebrate: true }));
        sfx.gem();
        await new Promise((r) => setTimeout(r, 350));
        await safeSpeak(currentWord, 'pip');
        await new Promise((r) => setTimeout(r, 700));
        if (wordIdx + 1 < scene.words.length) {
          const nextWord = scene.words[wordIdx + 1].word;
          setState((s) => ({ ...s, celebrate: false, wordIdx: s.wordIdx + 1, placed: [], usedBank: [], bank: buildBank(nextWord) }));
          await new Promise((r) => setTimeout(r, 300));
          await safeSpeak(nextWord, 'pip');
        } else {
          const awardGem = !gemDone;
          if (awardGem) onWin(true);
          setState((s) => ({ ...s, celebrate: false, phase: 'done', gemDone: s.gemDone || awardGem }));
        }
      }
    } else {
      sfx.wrong();
      setState((s) => ({ ...s, wrongBankIdx: bIdx }));
      window.setTimeout(() => setState((s) => ({ ...s, wrongBankIdx: null })), 450);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/35 via-white/10 to-white/40" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">
        🧱 Alphabet Blocks{phase === 'tap' && <span className="ml-2 text-orange-500">— Tap the sound!</span>}{phase === 'stack' && <span className="ml-2 text-orange-500">— Stack the word!</span>}
      </div>
      {phase === 'tap' && (
        <div className="absolute inset-x-0 top-20 bottom-24 z-10 flex flex-col items-center justify-center gap-6 px-4">
          <button onClick={() => playLetterPhonic(scene.tapRounds[tapIdx].letter)} className="rounded-full bg-white/95 px-6 py-3 text-lg font-black text-orange-700 shadow-xl active:scale-95">🔊 Play sound again</button>
          <div className="grid max-w-[calc(92*var(--svw,1vw))] grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {scene.letters.map((L) => (
              <button key={L} onClick={() => handleTapLetter(L)} className="relative flex h-28 w-28 items-center justify-center rounded-2xl text-6xl font-black text-white transition-transform active:scale-95 sm:h-32 sm:w-32"
                style={{ backgroundColor: colorFor(L), animation: tapWrong === L ? 'lep1-blockShake 0.4s ease-in-out' : tapWinLetter === L ? 'lep1-blockWin 0.7s ease-out' : undefined }}>
                {L}{tapWinLetter === L && <span className="absolute -right-2 -top-2 text-4xl">✨</span>}
              </button>
            ))}
          </div>
          <div className="text-sm font-black text-white drop-shadow-md">{tapIdx + 1} / {scene.tapRounds.length}</div>
        </div>
      )}
      {phase === 'stack' && (
        <div className="absolute inset-x-0 top-20 bottom-24 z-10 flex flex-col items-center justify-between gap-4 px-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="text-7xl drop-shadow-lg">{scene.words[wordIdx].emoji}</div>
            <button onClick={() => safeSpeak(currentWord, 'pip')} className="rounded-full bg-white/90 px-4 py-1 text-xs font-black text-orange-700 shadow active:scale-95">🔊 Hear word</button>
          </div>
          <div className="flex items-end gap-3 rounded-2xl px-6 pb-3 pt-8" style={{ background: 'linear-gradient(180deg, #b45309 0%, #7c2d12 100%)' }}>
            {currentWord.split('').map((tgt, i) => {
              const filled = placed[i];
              const bg = filled ? colorFor(filled) : '#3f2314';
              return <div key={i} className="relative flex h-24 w-20 items-center justify-center rounded-xl text-5xl font-black text-white sm:h-28 sm:w-24 sm:text-6xl" style={{ backgroundColor: bg, animation: filled ? 'lep1-blockDrop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' : undefined, opacity: filled ? 1 : 0.85 }}>{filled ?? <span className="text-2xl opacity-60">{tgt}</span>}</div>;
            })}
          </div>
          <div className="flex max-w-[calc(92*var(--svw,1vw))] flex-wrap items-center justify-center gap-3">
            {bank.map((L, i) => (
              <button key={`${i}-${L}`} onClick={() => handleBankTap(i, L)} disabled={usedBankSet.has(i)} className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl font-black text-white transition-transform active:scale-90 sm:h-24 sm:w-24 sm:text-5xl"
                style={{ backgroundColor: colorFor(L), opacity: usedBankSet.has(i) ? 0.25 : 1, animation: wrongBankIdx === i ? 'lep1-blockShake 0.4s ease-in-out' : undefined }}>{L}</button>
            ))}
          </div>
          <div className="text-sm font-black text-white drop-shadow-md">Word {wordIdx + 1} / {scene.words.length}</div>
        </div>
      )}
      {phase === 'done' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
          <div className="text-8xl animate-bounce">🏆</div>
          <div className="rounded-3xl bg-white/95 px-8 py-4 text-3xl font-black text-orange-600 shadow-2xl">All blocks stacked!</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">Continue ⭐</button>
        </div>
      )}
      {celebrate && <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"><div className="rounded-full bg-white/95 px-6 py-3 text-3xl font-black text-orange-600 shadow-2xl animate-bounce">✨ {currentWord}! ✨</div></div>}
    </div>
  );
}
