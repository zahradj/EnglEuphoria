import { type ReactNode, useEffect, useState } from 'react';
import { DialoguePlate, plateFontSize } from '../../DialoguePlate';
import { warmCaptionPlacement } from '../../captionPlacement';
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
  // Measure the picture now so the dialogue plate is placed the moment the character speaks.
  useEffect(() => { warmCaptionPlacement([scene.bg]); }, [scene.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // Local on purpose (not synced): each screen shows its own equalizer while its own voice plays.
  const [speaking, setSpeaking] = useState(false);
  const speakLine = async () => {
    setSpeaking(true);
    try { await safeSpeak(scene.line, voiceOf(scene.who)); } finally { setSpeaking(false); }
  };

  const tapCharacter = async () => {
    if (phase !== 'idle') return;
    sfx.pop();
    setState((s) => ({ ...s, glow: true, phase: 'talking' }));
    await speakLine();
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
    await speakLine();
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
  const charJustifyClass = scene.cardSide === 'right' ? 'justify-start pl-6 sm:pl-14'
    : scene.cardSide === 'left' ? 'justify-end pr-6 sm:pr-14'
    : 'justify-center';
  const lineFontSize = plateFontSize(scene.line);

  return (
    <div className="relative min-h-[calc(78*var(--svh,1vh))]">
      {/* Quest tag and the teacher's instruction share one column, so a wrapped
          instruction can never run underneath the tag. */}
      <div className={`relative z-20 flex max-w-md flex-col items-center gap-2 pt-1 ${cardAlignClass}`}>
        <div className="pointer-events-none">
        <div className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-lg ring-2 ring-white/50" style={{ background: `linear-gradient(90deg, ${c.color}, #FEBE4C)` }}>
            ⚔️ Quest · Meet {c.name}
          </div>
        </div>
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
      {/* The character's line on a dialogue plate along the bottom — tap it to hear it
          again, and (per direct request) that same tap is also the student's "turn":
          the first tap while in 'repeat' completes the scene. The Next button
          lives on the plate once the scene is done. */}
      {/* Vocabulary page (look 'word', owner 2026-10-09: "remove that green box"): the character stays on
          its side of the picture; the word, big, and the line sit straight on the open side, outlined so
          they read on any background. Tapping the word or the speaker replays it (and is the student's turn). */}
      {phase !== 'idle' && scene.look === 'word' && (
        <WordPanel scene={scene} color={c.color} speaking={speaking} nudge={phase === 'repeat'} onTap={tapCloud}
          action={phase === 'done' ? (
            <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-[calc(4*var(--svh,1vh))] py-[calc(2*var(--svh,1vh))] text-[calc(2.6*var(--svh,1vh))] font-black text-white shadow-2xl active:scale-95" style={{ animation: 'lep1-slide-up 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
              Next ▶
            </button>
          ) : undefined} />
      )}
      {phase !== 'idle' && scene.look !== 'word' && (
        <DialoguePlate
          img={scene.bg}
          name={c.name}
          color={c.color}
          look={scene.look ?? 'paper'}
          onTap={tapCloud}
          speaking={speaking}
          nudge={phase === 'repeat'}
          fontSize={lineFontSize}
          ariaLabel={`Hear ${c.name} again`}
          focusLine={{ text: scene.line, focus: scene.focus, reveal: (phase === 'repeat' || phase === 'done') && !speaking }}
          action={phase === 'done' ? (
            <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-[calc(4*var(--svh,1vh))] py-[calc(2*var(--svh,1vh))] text-[calc(2.6*var(--svh,1vh))] font-black text-white shadow-2xl active:scale-95" style={{ animation: 'lep1-slide-up 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
              Next ▶
            </button>
          ) : undefined}
        >
          {scene.line}
        </DialoguePlate>
      )}
      {phase === 'idle' && (
        <div className={`pointer-events-none absolute inset-x-0 top-[calc(44*var(--svh,1vh))] z-20 flex ${charJustifyClass}`}>
          <span className="animate-pulse rounded-full bg-white/95 px-5 py-2 text-base font-bold shadow-xl" style={{ color: c.color }}>👆 Tap {c.name} {c.emoji}</span>
        </div>
      )}
    </div>
  );
}

const OUTLINE = (px: number) => ({ WebkitTextStroke: `${px}px #fff`, paintOrder: 'stroke fill' as const, textShadow: '0 4px 14px rgba(0,0,0,0.18)' });

/** The words of `line`, with the focus words in the character's colour (shown once the voice has read them). */
function FocusLine({ line, focus, color, reveal }: { line: string; focus: string[]; color: string; reveal: boolean }) {
  const parts = focus.length ? line.split(new RegExp(`(\\b(?:${focus.map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b)`, 'i')) : [line];
  return (
    <>
      {parts.map((p, i) => focus.some((f) => f.toLowerCase() === p.toLowerCase())
        ? <span key={i} style={{ color: reveal ? color : undefined, transition: 'color 0.4s' }}>{p}</span>
        : <span key={i}>{p}</span>)}
    </>
  );
}

function WordPanel({ scene, color, speaking, nudge, onTap, action }: {
  scene: Extract<Scene, { kind: 'meet' }>; color: string; speaking: boolean; nudge: boolean; onTap: () => void; action?: ReactNode;
}) {
  const word = scene.word ?? scene.focus?.[0] ?? scene.repeat;
  // No side given (two characters in the picture): centred above their heads, the note on the word's line.
  const centred = !scene.cardSide;
  const side = scene.cardSide === 'right' ? 'right-[3%] top-[calc(20*var(--svh,1vh))] w-[46%]' : scene.cardSide === 'left' ? 'left-[3%] top-[calc(20*var(--svh,1vh))] w-[46%]'
    : 'left-1/2 -translate-x-1/2 top-[calc(17*var(--svh,1vh))] w-[70%]';
  return (
    <div className={`absolute z-20 flex flex-col items-center gap-[calc(1.6*var(--svh,1vh))] text-center ${side}`} style={{ animation: 'lep1-slide-up 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
      {scene.wordNote && !centred && (
        <div className="font-black leading-none text-[#2b1e17]" style={{ fontSize: 'calc(6*var(--svh,1vh))', ...OUTLINE(6) }}>{scene.wordNote}</div>
      )}
      <button onClick={onTap} aria-label={`Hear ${word} again`} className="flex items-center gap-[calc(2*var(--svh,1vh))] active:scale-95">
        {scene.wordNote && centred && <span className="font-black leading-none text-[#2b1e17]" style={{ fontSize: 'calc(8*var(--svh,1vh))', ...OUTLINE(7) }}>{scene.wordNote}</span>}
        <span className="font-black leading-none" style={{ fontSize: 'calc(13*var(--svh,1vh))', color, ...OUTLINE(10) }}>{word}</span>
        <span className={`flex h-[calc(9*var(--svh,1vh))] w-[calc(9*var(--svh,1vh))] shrink-0 items-center justify-center rounded-full bg-[#FFD978] text-[calc(4.4*var(--svh,1vh))] shadow-xl ring-4 ring-white ${nudge && !speaking ? 'animate-bounce' : ''}`}>
          {speaking ? '🎶' : '🔊'}
        </span>
      </button>
      <button onClick={onTap} className="font-black leading-tight text-[#2b1e17] active:scale-[0.98]" style={{ fontSize: 'calc(4.8*var(--svh,1vh))', ...OUTLINE(7) }}>
        <FocusLine line={scene.line} focus={scene.focus ?? [word]} color={color} reveal={!speaking} />
      </button>
      {action}
    </div>
  );
}
