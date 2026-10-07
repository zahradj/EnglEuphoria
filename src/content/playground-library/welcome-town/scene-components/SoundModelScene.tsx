import { useEffect, useMemo, useState } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, playLetterPhonic } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { anchorSpot, letterX } from './soundAnchors';
import { voiceOf, MAGIC_PURPLE, MAGIC_GOLD, MAGIC_GRADIENT, MAGIC_GLOW, MagicLayer } from './shared';

/* ---------- Sound model (phonics: listen + explore anchor words) ---------- */

/** True on a phone-width screen (the words then float in the corners instead of beside the letter). */
function useNarrowScreen(): boolean {
  const q = '(max-width: 639px)';
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(q).matches);
  useEffect(() => {
    const m = window.matchMedia?.(q);
    if (!m) return;
    const on = () => setNarrow(m.matches);
    on();
    m.addEventListener?.('change', on);
    return () => m.removeEventListener?.('change', on);
  }, []);
  return narrow;
}

export function SoundModelScene({ scene, onNext, sync }: { scene: Extract<Scene, { kind: 'sound-model' }>; onNext: () => void; sync?: ActivitySync }) {
  const c = CAST[scene.who];
  // `opened` is a plain number[] (not a Set) so it survives the JSON
  // broadcast round-trip.
  const [state, setState] = useSyncedState(sync, { beat: -1, opened: [] as number[], phase: 'invite' as 'invite' | 'done', replays: 0 });
  const { beat, opened, phase, replays } = state;
  const openedSet = useMemo(() => new Set(opened), [opened]);
  const narrow = useNarrowScreen();

  const playLetterSound = async () => {
    setState((s) => ({ ...s, beat: 0 }));
    await playLetterPhonic(scene.letter);
    setState((s) => ({ ...s, beat: -1 }));
  };

  useEffect(() => {
    setState((s) => ({ ...s, opened: [], phase: 'invite' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  const openAnchor = async (i: number) => {
    if (openedSet.has(i)) { sfx.pop(); await safeSpeak(scene.anchors[i].word, voiceOf(scene.who)); return; }
    sfx.reveal();
    const nextOpened = opened.includes(i) ? opened : [...opened, i];
    setState((s) => ({ ...s, opened: nextOpened }));
    await safeSpeak(scene.anchors[i].word, voiceOf(scene.who));
    if (nextOpened.length >= scene.anchors.length) { sfx.gem(); setState((s) => ({ ...s, phase: 'done' })); }
  };

  return (
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      {scene.magic ? <MagicLayer /> : <div className="pointer-events-none absolute inset-0 bg-black/15" />}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
        <div className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-lg ring-2 ring-white/50" style={{ background: scene.magic ? MAGIC_GRADIENT : `linear-gradient(90deg, ${c.color}, #FEBE4C)` }}>
          {scene.magic ? '🪄 Magic Sound' : '🔊 Sound Quest'} · {scene.letter} says {scene.phoneme}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-10 z-10 flex justify-center px-4">
        <div className="max-w-md rounded-2xl px-4 py-3 text-center text-base font-bold text-white shadow-2xl sm:text-lg" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.35))', backdropFilter: 'blur(8px)', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
          {phase === 'done' ? 'You found them all! Great listening! ⭐' : scene.teacher}
        </div>
      </div>
      <div className="pointer-events-none absolute top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4" style={{ left: `${letterX(scene.soundSide ?? 'center', narrow)}%` }}>
        <button
          type="button"
          onClick={playLetterSound}
          aria-label={`Hear the ${scene.letter} sound again`}
          className="pointer-events-auto grid place-items-center rounded-[2.5rem] border-8 bg-white/95 font-black shadow-2xl backdrop-blur transition active:scale-95"
          style={{ color: scene.magic ? MAGIC_PURPLE : c.color, borderColor: scene.magic ? MAGIC_GOLD : c.color, boxShadow: scene.magic ? MAGIC_GLOW : undefined, width: 'clamp(140px, calc(26*var(--svh,1vh)), 220px)', height: 'clamp(140px, calc(26*var(--svh,1vh)), 220px)', fontSize: scene.letter.length > 1 ? 'clamp(54px, calc(10*var(--svh,1vh)), 84px)' : 'clamp(70px, calc(14*var(--svh,1vh)), 110px)', lineHeight: 1, animation: beat >= 0 ? 'lep1-pop 0.5s ease-out' : 'lep1-wiggle 4s ease-in-out infinite' }}
        >
          {scene.letter}
        </button>
        <div className="rounded-2xl border-4 bg-white px-5 py-2 text-center text-xl font-black shadow-xl sm:text-2xl" style={{ color: c.color, borderColor: c.color }}>
          {scene.phoneme} {scene.phoneme}
        </div>
      </div>

      {/* The sound's words float around the letter card — two on the left, two on the right (A1 has four),
          the same look as the Pre-A1 sound lessons: a big "?" mystery card that opens into a flat picture
          with its word. Wide, staggered spots keep every picture clear of the letter and of each other. */}
      {scene.anchors.map((a, i) => {
        const spot = anchorSpot(i, scene.anchors.length, narrow, scene.soundSide ?? 'center');
        const isOpen = openedSet.has(i);
        const nextClosed = i === scene.anchors.findIndex((_, k) => !openedSet.has(k));
        const size = isOpen ? 'min(clamp(96px, calc(21*var(--svh,1vh)), 190px), 23vw)' : 'min(clamp(72px, calc(14*var(--svh,1vh)), 130px), 18vw)';
        return (
          // The float animation owns `transform`, so the centring lives on an OUTER box and the bob on an inner one.
          <div key={a.word} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
           <div style={{ animation: `lep1-float 3s ease-in-out ${i * 0.3}s infinite` }}>
            <button
              type="button"
              onClick={() => openAnchor(i)}
              className="relative grid place-items-center rounded-3xl bg-transparent p-0 transition-transform active:scale-90"
              style={{ width: size, height: size }}
              aria-label={isOpen ? `Hear ${a.word} again` : `Reveal a ${scene.letter} word`}
            >
              {isOpen ? (
                a.img
                  ? <img src={a.img} alt={a.word} draggable={false} style={{ width: size, height: size }} className="animate-[lep1-pop_0.6s_ease-out] object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.35)]" />
                  : <span className="animate-[lep1-pop_0.6s_ease-out]" style={{ fontSize: 'clamp(2.5rem, calc(9*var(--svh,1vh)), 5rem)' }}>{a.emoji}</span>
              ) : (
                <span
                  className="relative grid h-full w-full place-items-center rounded-[28%] border-[6px] border-white font-black text-white"
                  style={{ background: scene.magic ? 'linear-gradient(160deg, #A78BFA, #7C3AED 60%, #4C1D95)' : 'linear-gradient(160deg, #FF9F45, #FE6A2F 60%, #EC4899)', boxShadow: 'inset 0 6px 0 rgba(255,255,255,0.45), inset 0 -8px 0 rgba(0,0,0,0.15), 0 10px 22px rgba(20,10,40,0.45)', fontSize: 'clamp(2rem, calc(8*var(--svh,1vh)), 4rem)' }}
                >
                  ?
                  {nextClosed && (
                    <span className="pointer-events-none absolute -bottom-3 -right-3 animate-bounce" style={{ fontSize: 'clamp(1.6rem, calc(5.5*var(--svh,1vh)), 2.8rem)' }}>{'\u{1F446}'}</span>
                  )}
                </span>
              )}
            </button>
            {isOpen && (
              <div className="mx-auto mt-2 w-max animate-[lep1-pop_0.5s_ease-out] rounded-2xl border-4 bg-white px-4 py-1.5 text-center text-xl font-black shadow-xl sm:px-6 sm:py-2 sm:text-2xl" style={{ color: c.color, borderColor: c.color }}>
                {a.word}
              </div>
            )}
           </div>
          </div>
        );
      })}
      <div className="absolute inset-x-0 bottom-4 z-30 mx-auto flex max-w-md gap-2 px-4">
        <button onClick={() => { setState((s) => ({ ...s, replays: s.replays + 1 })); void playLetterSound(); }} className="flex-1 rounded-full bg-white/95 py-3 text-sm font-bold text-orange-700 shadow-xl ring-2 ring-orange-200 backdrop-blur active:scale-95">
          🔁 Hear sound {replays > 0 && <span className="opacity-60">({replays})</span>}
        </button>
        <button onClick={onNext} disabled={phase !== 'done'} className={`flex-1 rounded-full py-3 text-sm font-black text-white shadow-xl transition ${phase === 'done' ? 'bg-gradient-to-r from-green-500 to-emerald-500 active:scale-95' : 'cursor-not-allowed bg-neutral-400/70'}`}>
          {phase === 'done' ? 'Now you try →' : `Find ${scene.anchors.length - opened.length} more`}
        </button>
      </div>
    </div>
  );
}
