import { useEffect, useMemo } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, playLetterPhonic } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf, MAGIC_PURPLE, MAGIC_GOLD, MAGIC_GRADIENT, MAGIC_GLOW, MagicLayer } from './shared';

/* ---------- Sound model (phonics: listen + explore anchor words) ---------- */

export function SoundModelScene({ scene, onNext, sync }: { scene: Extract<Scene, { kind: 'sound-model' }>; onNext: () => void; sync?: ActivitySync }) {
  const c = CAST[scene.who];
  // `opened` is a plain number[] (not a Set) so it survives the JSON
  // broadcast round-trip.
  const [state, setState] = useSyncedState(sync, { beat: -1, opened: [] as number[], phase: 'invite' as 'invite' | 'done', replays: 0 });
  const { beat, opened, phase, replays } = state;
  const openedSet = useMemo(() => new Set(opened), [opened]);

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
      <div className="absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-4">
        <button
          type="button"
          onClick={playLetterSound}
          aria-label={`Hear the ${scene.letter} sound again`}
          className="grid place-items-center rounded-[2.5rem] border-8 bg-white/95 font-black shadow-2xl backdrop-blur transition active:scale-95"
          style={{ color: scene.magic ? MAGIC_PURPLE : c.color, borderColor: scene.magic ? MAGIC_GOLD : c.color, boxShadow: scene.magic ? MAGIC_GLOW : undefined, width: 'clamp(140px, calc(26*var(--svh,1vh)), 220px)', height: 'clamp(140px, calc(26*var(--svh,1vh)), 220px)', fontSize: 'clamp(70px, calc(14*var(--svh,1vh)), 110px)', lineHeight: 1, animation: beat >= 0 ? 'lep1-pop 0.5s ease-out' : 'lep1-wiggle 4s ease-in-out infinite' }}
        >
          {scene.letter}
        </button>
        <div className="rounded-2xl border-4 bg-white px-5 py-2 text-center text-xl font-black shadow-xl sm:text-2xl" style={{ color: c.color, borderColor: c.color }}>
          {scene.phoneme} {scene.phoneme}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-24 z-20 flex justify-center gap-4 px-4 sm:gap-8">
        {scene.anchors.map((a, i) => {
          const isOpen = openedSet.has(i);
          return (
            <button
              key={a.word}
              onClick={() => openAnchor(i)}
              className={`relative grid place-items-center rounded-3xl bg-white/90 shadow-2xl transition-transform active:scale-90 ${isOpen ? 'h-28 w-28 sm:h-32 sm:w-32' : 'h-20 w-20 sm:h-24 sm:w-24 animate-pulse'}`}
              aria-label={isOpen ? `Hear ${a.word} again` : `Reveal a ${scene.letter} word`}
            >
              {a.img ? <img src={a.img} alt={a.word} className="h-full w-full object-contain p-2" /> : <span className="text-4xl sm:text-5xl">{a.emoji}</span>}
              {isOpen && <span className="absolute -bottom-6 whitespace-nowrap rounded-full bg-white px-3 py-0.5 text-xs font-black shadow" style={{ color: c.color }}>{a.word}</span>}
            </button>
          );
        })}
      </div>
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
