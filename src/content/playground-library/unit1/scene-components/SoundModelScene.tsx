import { useCallback, useEffect, useMemo } from 'react';
import type { Scene } from '../scenes';
import { CAST, PROP_THEME } from '../scenes';
import { safeSpeak, playLetterPhonic } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Sound model ---------- */

export function SoundModelScene({ scene, onNext, sync }: { scene: Extract<Scene, { kind: 'sound-model' }>; onNext: () => void; sync?: ActivitySync }) {
  const c = CAST[scene.who];
  const theme = PROP_THEME[scene.prop ?? scene.who] ?? PROP_THEME.pip;
  const side: 'left' | 'right' = scene.who === 'mia' ? 'right' : 'left';
  // `opened` is a plain number[] (not a Set) so it survives the JSON
  // broadcast round-trip.
  const [state, setState] = useSyncedState(sync, { beat: -1, opened: [] as number[], phase: 'invite' as 'invite' | 'done', replays: 0 });
  const { beat, opened, phase, replays } = state;
  const openedSet = useMemo(() => new Set(opened), [opened]);

  // The teacher gives all spoken instructions live in the classroom — this
  // scene only ever plays the letter's actual recorded sound (never TTS
  // narration) and only ever on tap, never automatically on mount.
  const playLetterSound = useCallback(async () => {
    setState((s) => ({ ...s, beat: 0 }));
    await playLetterPhonic(scene.letter);
    setState((s) => ({ ...s, beat: -1 }));
  }, [scene.letter]);

  useEffect(() => {
    setState((s) => ({ ...s, opened: [], phase: 'invite' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  const openProp = async (i: number) => {
    if (openedSet.has(i)) { sfx.pop(); await safeSpeak(scene.anchors[i].word, scene.who); return; }
    sfx.reveal();
    const nextOpened = opened.includes(i) ? opened : [...opened, i];
    setState((s) => ({ ...s, opened: nextOpened }));
    await safeSpeak(scene.anchors[i].word, scene.who);
    if (nextOpened.length >= scene.anchors.length) { sfx.gem(); setState((s) => ({ ...s, phase: 'done' })); }
  };

  return (
    <div className="absolute inset-0">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
        <div className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-lg ring-2 ring-white/50" style={{ background: `linear-gradient(90deg, ${c.color}, #FEBE4C)` }}>
          🔊 Sound Quest · {scene.letter} says /{scene.phoneme.replace(/[/]/g, '')}/
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 z-30 flex w-[42%] flex-col items-center justify-center gap-4" style={{ [side]: 0 }}>
        <button
          type="button"
          onClick={playLetterSound}
          aria-label={`Hear the ${scene.letter} sound again`}
          className="pointer-events-auto grid place-items-center rounded-[2.5rem] border-8 bg-white/95 font-black shadow-2xl backdrop-blur transition active:scale-95"
          style={{ color: theme.tint, borderColor: theme.tint, width: 'min(calc(60*var(--svh,1vh)), 22rem)', height: 'min(calc(60*var(--svh,1vh)), 22rem)', fontSize: 'min(calc(48*var(--svh,1vh)), 18rem)', lineHeight: 1, animation: beat >= 0 ? 'lep1-pop 0.5s ease-out' : 'lep1-wiggle 4s ease-in-out infinite' }}
        >
          {scene.letter}
        </button>
        <div className="rounded-2xl border-4 bg-white px-5 py-2 text-center text-2xl font-black shadow-xl sm:text-3xl" style={{ color: theme.tint, borderColor: theme.tint }}>
          /{scene.phoneme.replace(/[/]/g, '')}/ /{scene.phoneme.replace(/[/]/g, '')}/
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-10 z-10 flex justify-center px-4">
        <div className="max-w-md rounded-2xl px-4 py-3 text-center text-base font-bold text-white shadow-2xl sm:text-lg" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.35))', backdropFilter: 'blur(8px)', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
          {phase === 'done' ? 'You found them all! Great listening! ⭐' : `Tap the letter or a picture to hear it!`}
        </div>
      </div>
      {scene.anchors.map((a, i) => {
        // Two columns on the anchors' side (near/far from the letter card),
        // stacked vertically with generous, even spacing — not the old
        // single-line-with-±12% jitter, which put anchors 0 and 2 only ~2%
        // of width apart and let them overlap outright on wide/short
        // viewports. Sizes are viewport-height-relative (clamp), not fixed
        // px jumps at sm:, so they can't outgrow a short frame either.
        const nearCol = side === 'left' ? 64 : 36;
        const farCol = side === 'left' ? 87 : 13;
        const cols = [nearCol, farCol, nearCol];
        // Shifted up from ['20%', '50%', '80%'] — the third anchor's icon (up to
        // clamp(...,20vh,...) tall) plus its opened-state label below it could push
        // past the bottom "Hear sound / Now you try" bar on shorter viewports,
        // clipping the label off-screen entirely. An intermediate ['16%','42%','66%']
        // still measured its 3rd label ~20px into the bottom bar — this leaves real
        // clearance, verified against the actual button-bar top in the live scene.
        const tops = ['15%', '38%', '60%'];
        const rots = [-6, 5, -3];
        const spot = { left: `${cols[i] ?? nearCol}%`, top: tops[i] ?? '50%', rot: rots[i] ?? 0 };
        const isOpen = openedSet.has(i);
        return (
          <div key={a.word} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: spot.left, top: spot.top, animation: `lep1-float 3s ease-in-out ${i * 0.3}s infinite` }}>
            <button
              onClick={() => openProp(i)}
              className={`relative grid place-items-center rounded-3xl bg-transparent p-0 transition-transform active:scale-90 ${!isOpen && phase === 'invite' ? 'animate-pulse' : ''}`}
              style={{ width: isOpen ? 'clamp(96px, calc(20*var(--svh,1vh)), 180px)' : 'clamp(76px, calc(14*var(--svh,1vh)), 140px)', height: isOpen ? 'clamp(96px, calc(20*var(--svh,1vh)), 180px)' : 'clamp(76px, calc(14*var(--svh,1vh)), 140px)', transform: `rotate(${spot.rot}deg)`, filter: `drop-shadow(0 0 18px ${theme.tint}) drop-shadow(0 12px 24px rgba(0,0,0,0.35))` }}
              aria-label={isOpen ? `Hear ${a.word} again` : `Open ${theme.label}`}
            >
              {isOpen ? (
                a.img ? (
                  <img src={a.img} alt={a.word} className="h-full w-full object-contain animate-[lep1-pop_0.6s_ease-out]" />
                ) : (
                  // Anchors are allowed to skip `img` and rely on `emoji` alone
                  // (per the Scene type) — this was rendering <img src={undefined}>
                  // for those instead, a broken-image icon indistinguishable from
                  // a genuinely missing asset.
                  <span className="animate-[lep1-pop_0.6s_ease-out]" style={{ fontSize: 'clamp(2.5rem, calc(7*var(--svh,1vh)), 4.5rem)' }}>{a.emoji}</span>
                )
              ) : theme.img ? (
                <img src={theme.img} alt={theme.label} className="h-full w-full object-contain" />
              ) : (
                <span style={{ fontSize: 'clamp(2.5rem, calc(7*var(--svh,1vh)), 4.5rem)' }}>{theme.closed}</span>
              )}
            </button>
            {isOpen && (
              <div className="mx-auto mt-2 w-max animate-[lep1-pop_0.5s_ease-out] rounded-2xl border-4 bg-white px-4 py-1.5 text-center text-xl font-black shadow-xl sm:px-6 sm:py-2 sm:text-2xl" style={{ color: theme.tint, borderColor: theme.tint }}>
                {a.word}
              </div>
            )}
          </div>
        );
      })}
      <div className="absolute inset-x-0 bottom-4 z-30 mx-auto flex max-w-md gap-2 px-4">
        <button onClick={() => { setState((s) => ({ ...s, replays: s.replays + 1 })); playLetterSound(); }} className="flex-1 rounded-full bg-white/95 py-3 text-sm font-bold text-orange-700 shadow-xl ring-2 ring-orange-200 backdrop-blur active:scale-95">
          🔁 Hear sound {replays > 0 && <span className="opacity-60">({replays})</span>}
        </button>
        <button onClick={onNext} disabled={phase !== 'done'} className={`flex-1 rounded-full py-3 text-sm font-black text-white shadow-xl transition ${phase === 'done' ? 'bg-gradient-to-r from-green-500 to-emerald-500 active:scale-95' : 'cursor-not-allowed bg-neutral-400/70'}`}>
          {phase === 'done' ? 'Now you try →' : `Find ${scene.anchors.length - opened.length} more`}
        </button>
      </div>
    </div>
  );
}
