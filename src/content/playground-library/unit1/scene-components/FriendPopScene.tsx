import { useEffect, useMemo, useRef } from 'react';
import type { Scene, CharKey } from '../scenes';
import { CAST, getEmotionSprite } from '../scenes';
import { safeSpeak, cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Friend pop ---------- */

export function FriendPopScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'friend-pop' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const GENDER: Record<string, 'she' | 'he'> = { bella: 'she', mia: 'she', willow: 'she', leo: 'he', pip: 'he' };
  const [state, setState] = useSyncedState(sync, { round: 0, score: 0, tapped: null as { who: CharKey; ok: boolean } | null, gemDone: false });
  const { round, score, tapped, gemDone } = state;
  const answeredRef = useRef(false);
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;

  const roundEmotion = (prompt: string, explicit?: 'happy' | 'sad' | 'angry' | 'neutral'): 'happy' | 'sad' | 'angry' | 'neutral' => {
    if (explicit) return explicit;
    if (/(angry|grrr|mad)/i.test(prompt)) return 'angry';
    if (/sad/i.test(prompt)) return 'sad';
    if (/happy/i.test(prompt)) return 'happy';
    return 'neutral';
  };

  const targetGender = r ? GENDER[r.target as string] ?? 'she' : 'she';
  const roundEmo = r ? roundEmotion(r.prompt, r.emotion) : 'happy';
  const helloMode = !!r && !!r.sayLine && /hello|hi\b/i.test(r.sayLine);
  const pronounMode = !!r && !helloMode && /^\s*(he|she)\b/i.test(r.prompt);

  const lineup: { who: CharKey; emo: 'happy' | 'sad' | 'angry' | 'neutral' }[] = useMemo(() => {
    if (!r) return [];
    const cast = scene.cast;
    if (helloMode) {
      const target = r.target;
      const others = cast.filter((c) => c !== target);
      const pickA = others[round % Math.max(1, others.length)] ?? target;
      const pickB = others[(round + 1) % Math.max(1, others.length)] ?? target;
      const arr: CharKey[] = [target, pickA, pickB];
      const swap = (a: number, b: number) => { const t = arr[a]; arr[a] = arr[b]; arr[b] = t; };
      swap(0, round % 3);
      return arr.map((who) => ({ who, emo: 'happy' as const }));
    }
    if (pronounMode) {
      const boys = cast.filter((c) => GENDER[c] === 'he');
      const girls = cast.filter((c) => GENDER[c] === 'she');
      const targetPool = targetGender === 'he' ? boys : girls;
      const otherPool = targetGender === 'he' ? girls : boys;
      const target = targetPool.includes(r.target) ? r.target : targetPool[round % Math.max(1, targetPool.length)];
      const others: CharKey[] = [];
      for (let i = 0; i < 2; i++) {
        const pool = otherPool.length ? otherPool : targetPool.filter((c) => c !== target);
        others.push(pool[(round + i) % pool.length]);
      }
      const arr = [target, ...others];
      const swap = (a: number, b: number) => { const t = arr[a]; arr[a] = arr[b]; arr[b] = t; };
      swap(0, round % 3); swap(1, (round + 1) % 3);
      const allEmos: ('happy' | 'sad' | 'angry')[] = ['happy', 'sad', 'angry'];
      const otherEmos = allEmos.filter((e) => e !== roundEmo);
      return arr.map((who) => ({ who, emo: who === target ? roundEmo : (otherEmos[(round + arr.indexOf(who)) % otherEmos.length] as 'happy' | 'sad' | 'angry') }));
    }
    const emotions: ('happy' | 'sad' | 'angry')[] = ['happy', 'sad', 'angry'];
    const target = r.target;
    const others = cast.filter((c) => c !== target).slice(0, 2);
    const otherEmos = emotions.filter((e) => e !== roundEmo);
    const arr = [
      { who: target, emo: roundEmo },
      { who: others[0] ?? target, emo: otherEmos[0] },
      { who: others[1] ?? target, emo: otherEmos[1] ?? otherEmos[0] },
    ];
    const swap = (a: number, b: number) => { const t = arr[a]; arr[a] = arr[b]; arr[b] = t; };
    swap(0, round % 3); swap(1, (round + 1) % 3);
    return arr;
  }, [round, r, targetGender, scene.cast, pronounMode, helloMode, roundEmo]);

  useEffect(() => {
    if (!r) return;
    answeredRef.current = false;
    setState((s) => ({ ...s, tapped: null }));
    void safeSpeak(r.prompt, r.target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, r]);

  const tap = async (who: CharKey, emo: 'happy' | 'sad' | 'angry' | 'neutral') => {
    if (!r || answeredRef.current) return;
    const isCorrect = helloMode ? who === r.target : pronounMode ? GENDER[who] === targetGender : emo === roundEmo;
    if (isCorrect) {
      answeredRef.current = true;
      sfx.match();
      setState((s) => ({ ...s, tapped: { who, ok: true }, score: s.score + 1 }));
      const line = helloMode ? (r.sayLine ?? `Hello, ${CAST[who].name}!`) : pronounMode ? `${GENDER[who] === 'he' ? 'He' : 'She'} is ${roundEmo}!` : `${CAST[who].name} is ${roundEmo}!`;
      await safeSpeak(line, who);
      window.setTimeout(() => {
        const next = round + 1;
        const awardGem = next >= total && !gemDone;
        if (awardGem) { sfx.gem(); onWin(true); }
        setState((s) => ({ ...s, round: next, gemDone: s.gemDone || awardGem }));
      }, 700);
    } else {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, tapped: { who, ok: false } }));
      window.setTimeout(() => setState((s) => ({ ...s, tapped: null })), 500);
    }
  };

  if (finished) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="rounded-3xl bg-white/95 px-8 py-4 text-center shadow-2xl">
            <div className="text-2xl font-black text-orange-700">🎉 Amazing!</div>
            <div className="text-lg font-bold text-neutral-700">You found all your friends! {score}/{total}</div>
          </div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-cover bg-center px-4 pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <button onClick={() => cueSpeak(r!.prompt, r!.target)} className="absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-6 py-3 text-center text-lg font-black text-orange-700 shadow-xl backdrop-blur active:scale-95 sm:text-2xl">
        🔊 {r!.prompt}<span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </button>
      <div className="relative z-10 mt-20 flex w-full items-end justify-center gap-2 sm:gap-6">
        {lineup.map((item, i) => {
          const { who, emo } = item;
          const isFlash = tapped?.who === who;
          return (
            <button key={`${round}-${i}-${who}`} onClick={() => tap(who, emo)} className="relative transition-transform active:scale-95" style={{ width: 'clamp(180px, calc(30*var(--svw,1vw)), 340px)', height: 'clamp(280px, calc(55*var(--svh,1vh)), 500px)' }} aria-label={CAST[who].name}>
              <img src={getEmotionSprite(who, emo)} alt={CAST[who].name} className="h-full w-full object-contain drop-shadow-2xl" draggable={false} />
              {isFlash && <div className={`pointer-events-none absolute inset-0 flex items-center justify-center text-8xl font-black ${tapped!.ok ? 'text-green-400' : 'text-red-500'}`}>{tapped!.ok ? '✓' : '✗'}</div>}
            </button>
          );
        })}
      </div>
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1 text-sm font-black text-orange-700 shadow">⭐ {score}/{total}</div>
    </div>
  );
}
