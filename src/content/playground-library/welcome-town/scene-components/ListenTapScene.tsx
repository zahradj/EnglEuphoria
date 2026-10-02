import { useEffect, useRef } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, cueSpeak, cueSpeakOnce } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';

/* ---------- Listen & tap (multiple real objects/characters already
   painted in the background are all live hotspots at once; a line plays
   and the student must tap the ONE that matches — unlike vocab-spot's
   single guided arrow with no wrong-answer risk, a wrong tap here is a
   real possibility, closer to a genuine listening check than a discovery
   flashcard; see scenes.ts's `listen-tap` type comment for why this kind
   exists). ---------- */

export function ListenTapScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'listen-tap' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, correct: false, wrongLabel: null as string | null, misses: 0 });
  const { round, correct, wrongLabel, misses } = state;
  const gemDone = useRef(false);
  const total = scene.rounds.length;
  const complete = round >= total;
  const r = !complete ? scene.rounds[round] : null;

  useEffect(() => {
    if (complete) return;
    setState((s) => ({ ...s, correct: false, wrongLabel: null, misses: 0 }));
    cueSpeakOnce(r!.prompt, voiceOf(r!.who ?? 'marigold'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, complete]);

  const tap = async (label: string) => {
    if (!r || correct) return;
    if (label !== r.answerLabel) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, misses: s.misses + 1, wrongLabel: label }));
      window.setTimeout(() => setState((s) => ({ ...s, wrongLabel: null })), 500);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, correct: true }));
    if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
    await safeSpeak(`Yes! ${label}!`, voiceOf(r.who ?? 'marigold'));
    window.setTimeout(() => setState((s) => ({ ...s, round: s.round + 1 })), 1000);
  };

  if (complete) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <Confetti count={50} />
        <button onClick={onNext} className="relative z-10 animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Great listening! ⭐ Next</button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">
        👂 {scene.teacher} <span className="ml-1 opacity-60">({round + 1}/{total})</span>
      </div>
      <button onClick={() => cueSpeak(r!.prompt, voiceOf(r!.who ?? 'marigold'))} className="absolute right-4 top-16 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>
      {scene.targets.map((t) => {
        const isWrong = wrongLabel === t.label;
        const isRight = correct && t.label === r!.answerLabel;
        // After two wrong taps on the same round, gently ring the correct
        // spot — same "a stuck student always has a way forward" pattern
        // as the Pre-A1 find-in-scene game this mechanic was modeled on.
        const revealCorrect = misses >= 2 && t.label === r!.answerLabel && !correct;

        // Illustrated-card variant (t.img set): the target itself IS the
        // concept being taught (e.g. a picture for "under"/"on"/"in"), so
        // it must be visible the whole time — there's no real background
        // object to avoid spoiling by showing it early (see the invisible-
        // hotspot note just below, which is about the OTHER variant).
        if (t.img) {
          return (
            <button
              key={t.label}
              onClick={() => tap(t.label)}
              disabled={correct}
              aria-label={t.label}
              className={`absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 transition active:scale-95 ${isWrong ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}
              style={{ left: t.left, top: t.top }}
            >
              <div
                className="h-40 w-40 overflow-hidden rounded-3xl border-[6px] bg-white shadow-xl sm:h-52 sm:w-52"
                style={{
                  borderColor: isRight ? '#22C55E' : isWrong ? '#EF4444' : revealCorrect ? '#FFFFFF' : t.color,
                  animation: revealCorrect && !isRight ? 'lep1-ping 1s ease-in-out infinite' : isRight ? 'lep1-pop 0.35s ease-out' : undefined,
                }}
              >
                <img src={t.img} alt={t.label} className="h-full w-full object-cover" />
              </div>
              {/* The word label only appears AFTER a correct tap (as
                  reading reinforcement), not before — showing it up front
                  would let a student match by reading the word instead of
                  by listening to the spoken prompt, undermining the one
                  thing this activity is meant to check. */}
              {isRight && (
                <span className="rounded-full bg-[#22C55E] px-3 py-1 text-sm font-black text-white shadow-lg sm:text-base" style={{ animation: 'lep1-pop 0.35s ease-out' }}>
                  {t.label} ✓
                </span>
              )}
            </button>
          );
        }

        // Resting state is now a fully invisible hit-zone — the old
        // permanently-visible ring (border-white/70 bg-white/10) marked
        // every tappable spot before the student ever listened, turning a
        // listening check into a "click the circle you can already see"
        // game. Reported live: "remove the circles... to not be
        // visible." The only circle a student ever sees now is transient
        // feedback: red on a wrong tap, or the revealCorrect hint after
        // they've genuinely struggled — never a standing giveaway.
        return (
          <button
            key={t.label}
            onClick={() => tap(t.label)}
            disabled={correct}
            aria-label={t.label}
            className={`absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border-4 transition active:scale-[0.98] ${t.hitWidth ? 'rounded-3xl' : 'rounded-full'} ${isWrong ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400 bg-red-400/20' : revealCorrect ? 'border-white bg-white/25' : 'border-transparent bg-transparent'}`}
            style={{
              left: t.left, top: t.top,
              width: t.hitWidth ?? 88, height: t.hitHeight ?? 88,
              animation: revealCorrect && !isRight ? 'lep1-ping 1s ease-in-out infinite' : undefined,
            }}
          >
            {/* On the correct tap, the character the prompt was ABOUT
                (r.who — e.g. "Where is Cat-cat? She is in the living
                room!") visibly appears right where the student tapped,
                instead of just a colored ring — per direct request: "when
                the student clicks a place, the character appears."
                Three tiers, cleanest available wins: a real sticker image
                (r.stickerImg, matching drag-sticker's own art convention —
                "more clean, more presentable" per direct follow-up) when
                one exists for this round; the CAST emoji in a colored
                badge when it doesn't (works for every character in every
                world with zero new art); a plain checkmark when the round
                names no character at all, so feedback never silently
                disappears. */}
            {isRight && (
              r.stickerImg ? (
                <img
                  src={r.stickerImg}
                  alt={r.who ? CAST[r.who].name : t.label}
                  className="h-40 w-40 object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.5)] sm:h-48 sm:w-48"
                  // The parent button is a fixed 88x88 hit-box (t's tap
                  // target size) — Tailwind's own preflight reset sets
                  // `img { max-width: 100% }`, which silently capped this
                  // image's rendered width to that 88px box regardless of
                  // the h-40/sm:h-48 classes above, no matter how large
                  // they said to render. Overriding max-width/max-height
                  // here lets the sticker render at its actual intended
                  // size, free to visually overflow the (now-invisible,
                  // already-tapped) hit-box beneath it.
                  style={{ animation: 'lep1-pop 0.35s ease-out', maxWidth: 'none', maxHeight: 'none' }}
                />
              ) : r.who ? (
                <span
                  className="grid h-20 w-20 place-items-center rounded-full text-4xl shadow-2xl ring-4 ring-white"
                  style={{ background: CAST[r.who].color, animation: 'lep1-pop 0.35s ease-out' }}
                >
                  {CAST[r.who].emoji}
                </span>
              ) : (
                <span
                  className="grid h-16 w-16 place-items-center rounded-full text-3xl font-black text-white shadow-2xl ring-4 ring-white"
                  style={{ background: t.color, animation: 'lep1-pop 0.35s ease-out' }}
                >
                  ✓
                </span>
              )
            )}
          </button>
        );
      })}
    </div>
  );
}
