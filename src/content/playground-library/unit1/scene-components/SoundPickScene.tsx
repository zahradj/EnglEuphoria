import { useEffect, useMemo, useRef } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak, playLetterPhonic } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_TILTS, StickerButton, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Which one? (calm first-sound pick) ----------
 * Replaces the fast N Dash in Pre-A1 Unit 4 Lesson 2 (owner, 2026-10-05: the
 * dash was too fast and too hard to focus on). Same skill, no clock and nothing
 * moving: the REAL recorded letter sound plays twice (never a voice reading
 * "/n/"), the character asks "Which one starts with this sound?", and three
 * big still pictures wait. Right: the picture glows and the word is said
 * ("Yes! Nest!"). Wrong: a gentle wobble, the tapped word is named ("Egg! Try
 * again!") and the child simply tries again — no hearts lost. Mechanic: the
 * Cambridge Pre A1 / Khan Academy Kids "find the one that starts with…" pick,
 * one decision at a time. */

type Pick = Extract<Scene, { kind: 'sound-pick' }>;

export const SOUND_PICK_LINE = 'Which one starts with this sound?';
const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
export const soundPickRight = (word: string) => `Yes! ${cap(word)}!`;
export const soundPickWrong = (word: string) => `${cap(word)}! Try again!`;

export function SoundPickScene({ scene, onWin, onNext, sync }: { scene: Pick; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, right: -1, wrong: [] as number[], gemDone: false });
  const { round, right, wrong, gemDone } = state;
  const wrongSet = useMemo(() => new Set(wrong), [wrong]);
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const busy = useRef(false);
  const [bursts, fire] = useBursts();

  const ask = async () => {
    if (!r) return;
    await playLetterPhonic(r.sound);
    await wait(450);
    await playLetterPhonic(r.sound);
    await wait(350);
    cueSpeak(SOUND_PICK_LINE, scene.who);
  };
  useEffect(() => {
    if (!r) return;
    busy.current = false;
    const t = window.setTimeout(() => { void ask(); }, 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const pick = async (i: number) => {
    const o = r?.options[i];
    if (!r || !o || busy.current || right >= 0 || wrongSet.has(i)) return;
    busy.current = true;
    if (i !== r.answer) {
      sfx.wrong();
      setState((s) => ({ ...s, wrong: [...s.wrong, i] }));
      await sayWithin(soundPickWrong(o.word), scene.who, 3000);
      busy.current = false;
      return;
    }
    sfx.match();
    fire(25 + i * 25, 50, 'stars');
    setState((s) => ({ ...s, right: i }));
    await sayWithin(soundPickRight(o.word), scene.who, 3000);
    await wait(500);
    const next = round + 1;
    if (next >= total && !gemDone) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, right: -1, wrong: [], gemDone: s.gemDone || next >= total }));
  };

  if (!r) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/15" />
        <Confetti count={60} />
        <div className="relative z-10 flex flex-col items-center gap-5 px-4">
          <div className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(2rem, calc(4.5*var(--svw,1vw)), 3.6rem)' }}>🌟 Great listening!</div>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-4 text-xl`}>Next ⭐</button>
        </div>
      </div>
    );
  }

  const c = CAST[scene.who];
  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/15" />
      <div className="absolute left-1/2 top-16 z-20 flex -translate-x-1/2 items-center gap-3">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.5rem, calc(3.2*var(--svw,1vw)), 2.6rem)' }}>Which one starts with this sound?</span>
      </div>
      <button onClick={() => { void ask(); }} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>
      <div className="absolute left-3 top-16 z-30 flex gap-1">
        {scene.rounds.map((_, i) => <span key={i} className={`text-2xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>⭐</span>)}
      </div>

      {/* Three still pictures: nothing moves, no clock — one calm decision. */}
      <div key={round} className="absolute inset-x-0 top-[24%] bottom-[22%] z-10 flex items-center justify-center gap-[4vw] px-4 portrait:flex-col portrait:gap-3">
        {r.options.map((o, i) => (
          <StickerButton
            key={i}
            onClick={() => { void pick(i); }}
            label={o.word}
            tilt={STICKER_TILTS[(round * 3 + i) % STICKER_TILTS.length]}
            state={right === i ? 'right' : wrongSet.has(i) ? 'wrong' : right >= 0 ? 'dim' : undefined}
            size="h-[min(34vh,26vw)] w-[min(34vh,26vw)] portrait:h-[min(17vh,44vw)] portrait:w-[min(17vh,44vw)]"
            delay={i * 0.12}
          >
            {o.img
              ? <img src={o.img} alt={o.word} draggable={false} className="h-full w-full object-contain" />
              : <span className="grid h-full w-full place-items-center text-[min(20vh,16vw)] leading-none">{o.emoji}</span>}
          </StickerButton>
        ))}
      </div>

      <img src={c.img} alt={c.name} className="pointer-events-none absolute bottom-[8%] left-[3%] z-10 h-[22vh] object-contain drop-shadow-xl portrait:hidden" />
      <Bursts items={bursts} />
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function soundPickLines(scene: Pick) {
  return [
    [scene.who, SOUND_PICK_LINE],
    ...scene.rounds.flatMap((r) => r.options.map((o, i) => [scene.who, i === r.answer ? soundPickRight(o.word) : soundPickWrong(o.word)])),
  ] as [string, string][];
}

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
