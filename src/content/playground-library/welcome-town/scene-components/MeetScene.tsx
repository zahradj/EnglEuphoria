import { ChatCloud } from '../../ChatCloud';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';

/* ---------- Meet ---------- */

export function MeetScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'meet' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  type Phase = 'idle' | 'talking' | 'repeat' | 'done';
  const [state, setState] = useSyncedState(sync, { phase: 'idle' as Phase, xpBurst: false, glow: false });
  const { phase, xpBurst, glow } = state;
  const c = CAST[scene.who];

  const tapCharacter = async () => {
    if (phase !== 'idle') return;
    sfx.pop();
    setState((s) => ({ ...s, glow: true, phase: 'talking' }));
    await safeSpeak(scene.line, voiceOf(scene.who));
    setTimeout(() => setState((s) => ({ ...s, phase: 'repeat' })), 500);
    setTimeout(() => setState((s) => ({ ...s, glow: false })), 1600);
  };
  // Tapping the cloud both replays the line AND, the first time (while
  // still in 'repeat'), completes the scene — no separate hold-to-talk
  // gesture or "Your turn" bar. Per direct request: a teacher wanting the
  // student to repeat the line just has them tap the cloud themselves;
  // a second production-practice step was redundant with that.
  const tapCloud = async () => {
    sfx.click();
    const completing = phase === 'repeat';
    setState((s) => ({ ...s, glow: true, ...(completing ? { phase: 'done', xpBurst: true } : {}) }));
    if (completing) { sfx.gem(); onWin(true); setTimeout(() => setState((s) => ({ ...s, xpBurst: false })), 1200); }
    await safeSpeak(scene.line, voiceOf(scene.who));
    setTimeout(() => setState((s) => ({ ...s, glow: false })), 1200);
  };

  // The character is painted into one side of `scene.bg` (left/right third),
  // leaving the opposite side open for these floating cards — dock them
  // there instead of centering over the character. Omit `cardSide` to keep
  // the original centered layout (existing scenes that reuse a shared,
  // symmetric background).
  const cardAlignClass = scene.cardSide === 'left' ? 'mr-auto ml-2 sm:ml-8'
    : scene.cardSide === 'right' ? 'ml-auto mr-2 sm:mr-8'
    : 'mx-auto';
  // Chat cloud beside the character, puffs pointing at them.
  const cloudPosClass = scene.cardSide === 'left' ? 'left-[5%]'
    : scene.cardSide === 'right' ? 'right-[5%]'
    : 'left-[56%]';
  const cloudTail: 'left' | 'right' = scene.cardSide === 'left' ? 'right' : 'left';
  const charJustifyClass = scene.cardSide === 'right' ? 'justify-start pl-6 sm:pl-14'
    : scene.cardSide === 'left' ? 'justify-end pr-6 sm:pr-14'
    : 'justify-center';
  // The cloud's own art is a fixed-aspect image stretched (object-fit:
  // fill) to whatever box the text forces — a longer line wrapping to
  // several lines grows that box tall and narrow, distorting the cloud
  // shape enough that the text can end up touching the outline. Sized
  // down for longer lines, same word-count-tiered approach already used
  // for EchoScene's modeling sentences, so a long line wraps to fewer,
  // wider lines instead of many narrow ones.
  const lineWordCount = scene.line.trim().split(/\s+/).length;
  const cloudFontSize = lineWordCount <= 2 ? 'calc(3.4 * var(--svh, 1vh))'
    : lineWordCount <= 4 ? 'calc(3 * var(--svh, 1vh))'
    : 'calc(2.5 * var(--svh, 1vh))';

  return (
    <div className="relative min-h-[calc(78*var(--svh,1vh))]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
        <div className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-lg ring-2 ring-white/50" style={{ background: `linear-gradient(90deg, ${c.color}, #FEBE4C)` }}>
          ⚔️ Quest · Meet {c.name}
        </div>
      </div>
      <div className={`mt-8 max-w-md ${cardAlignClass}`}>
        <div className="rounded-2xl px-4 py-3 text-center text-lg font-bold text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.35))', backdropFilter: 'blur(8px)', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
          {scene.teacher}
        </div>
      </div>
      {/* scene.bg already paints {c.name} directly into the classroom art —
          no separate sprite on top, just a broad tap affordance over the
          area where they're standing, with the same pulsing ring cue used
          for this exact idle-tap pattern in the Pre-A1 lessons. */}
      {phase === 'idle' && <button onClick={tapCharacter} aria-label={`Tap ${c.name} to say hello`} className="absolute inset-0 z-10 h-[calc(60*var(--svh,1vh))] w-full cursor-pointer bg-transparent" />}
      {phase === 'idle' && (
        <div className={`pointer-events-none absolute inset-x-0 top-[calc(26*var(--svh,1vh))] z-10 flex ${charJustifyClass}`}>
          <div className="relative h-40 w-40" style={{ animation: 'lep1-wiggle 3s ease-in-out infinite' }}>
            <span className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${c.color}55, transparent 65%)`, animation: 'lep1-ping 2s ease-out infinite' }} />
            <span className="absolute inset-6 rounded-full border-4" style={{ borderColor: c.color, animation: 'lep1-ping 2s ease-out 0.4s infinite' }} />
          </div>
        </div>
      )}
      {/* A bright glow washes over the general area {c.name} is standing in
          the painted background right as they speak, then the vocabulary
          card below pops up already illustrating the word on its own. */}
      {glow && (
        <div className={`pointer-events-none absolute inset-x-0 top-[calc(8*var(--svh,1vh))] z-10 h-[calc(55*var(--svh,1vh))] flex ${charJustifyClass}`} style={{ animation: 'lep1-twinkle 1.4s ease-in-out' }}>
          <div className="h-full w-full max-w-md rounded-full" style={{ background: `radial-gradient(circle, ${c.color}66 0%, ${c.color}22 45%, transparent 70%)` }} />
        </div>
      )}
      {xpBurst && (
        <div className={`pointer-events-none absolute inset-x-0 top-[calc(32*var(--svh,1vh))] z-30 flex ${charJustifyClass}`}>
          <div className="animate-[lep1-pop-fade_1.1s_ease-out_forwards] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2 text-2xl font-black text-white shadow-2xl">+10 XP 💎</div>
        </div>
      )}
      {/* The character's line as a chat cloud beside them — tap it to hear
          it again, and (per direct request) that same tap is also the
          student's "turn": the first tap while in 'repeat' completes the
          scene, no separate hold-to-talk bar needed. Just the one
          sentence now, not a short repeat-word line above a smaller
          quoted one — replaces the big white card that used to cover the
          character. */}
      {phase !== 'idle' && (
        <div className={`pointer-events-none absolute top-[calc(11*var(--svh,1vh))] z-20 max-w-[52%] ${cloudPosClass}`}>
          <ChatCloud color={c.color} tail={cloudTail} onClick={tapCloud} ariaLabel={`Hear ${c.name} again`}>
            <span className="block font-black leading-snug" style={{ fontSize: cloudFontSize }}>🔊 {scene.line}</span>
          </ChatCloud>
        </div>
      )}
      {phase === 'idle' && (
        <div className={`pointer-events-none absolute inset-x-0 top-[calc(44*var(--svh,1vh))] z-20 flex ${charJustifyClass}`}>
          <span className="animate-pulse rounded-full bg-white/95 px-5 py-2 text-base font-bold shadow-xl" style={{ color: c.color }}>👆 Tap {c.name} {c.emoji}</span>
        </div>
      )}
      {phase === 'done' && (
        <div className="absolute inset-x-0 bottom-[calc(1.5*var(--svh,1vh))] z-30 flex justify-center" style={{ animation: 'lep1-slide-up 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next →</button>
        </div>
      )}
    </div>
  );
}
