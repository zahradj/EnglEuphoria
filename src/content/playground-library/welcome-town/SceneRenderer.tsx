import { useEffect, useMemo, useRef, useState } from 'react';
import { LiveStageFill, useStageDrop } from '../LiveStageFrame';
import type { CallRole } from '@/components/classroom/stage/callStreams';
import { ChatCloud } from '../ChatCloud';
import type { Scene, CharKey } from './scenes';
import { CAST, VOICE_KEY } from './scenes';
import { safeSpeak, cueSpeak, cueSpeakOnce, unlockAudio, playLetterPhonic } from '../unit1/audio';
import * as sfx from '../unit1/sfx';
import { Confetti } from '../unit1/fx';
import { Hearts, MAX_HEARTS, Lep1Keyframes } from '../unit1/SceneRenderer';
import engleuphoriaLogo from '@/assets/engleuphoria-logo.png';
import { type ActivitySync, useSyncedState } from '../sceneActivitySync';
import { SpinWheelScene } from '../SpinWheelScene';
import { PictureMatchScene } from '../PictureMatchScene';

export type { ActivitySync };

/** Shorthand: every audio call here takes a story CharKey (pip/marigold),
 *  but the shared voice pipeline is keyed by role/name (Character) — see
 *  scenes.ts's VOICE_KEY for why that mapping is a fixed, tiny table. */
const voiceOf = (who: CharKey) => VOICE_KEY[who];

export { Hearts, MAX_HEARTS, Lep1Keyframes };

/* ---------- Shared chrome (small, local copies — see unit1/SceneRenderer.tsx
   for the originals; kept local here so this module has no dependency on
   the Little Explorers cast beyond the CAST-independent fx/audio/chrome
   helpers imported above). ---------- */

export function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/40 bg-white/95 p-5 text-neutral-900 shadow-2xl backdrop-blur-2xl ring-1 ring-white/30 ${className}`}
      style={{ boxShadow: '0 20px 60px -20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.6)' }}
    >
      {children}
    </div>
  );
}

/** A persistent (non-tappable) bouncing arrow + glow marking exactly which
 *  character on screen a sentence/question refers to — for scenes whose
 *  background has more than one character in it and the text alone
 *  ("He is happy," "How do they feel?") doesn't say which one. Visually
 *  the same arrow VocabSpotScene uses for its hotspots, just without the
 *  tap-to-reveal behavior — this one only ever points, it never opens a
 *  flashcard. */
function CharacterPointer({ left, top, dir = 'down', color }: { left: string; top: string; dir?: 'down' | 'left' | 'right'; color: string }) {
  // GAP and the arrow's own size were tuned small enough that on a real
  // classroom-scaled frame (letterboxed well below full viewport size, see
  // useFrameScale) the arrow read as a barely-visible sliver — reported
  // live as "the arrows look very small." Both bumped ~45%; GAP grows with
  // the arrow so it still sits fully clear of whatever it's pointing at
  // rather than overlapping it.
  const GAP = 90;
  const pos = dir === 'down'
    ? { left, top: `calc(${top} - ${GAP}px)` }
    : dir === 'right'
    ? { left: `calc(${left} - ${GAP}px)`, top }
    : { left: `calc(${left} + ${GAP}px)`, top };
  const angle = dir === 'down' ? 0 : dir === 'right' ? -90 : 90;
  return (
    <>
      {/* A bright spotlight ring sits directly around the character itself
          (at their own left/top, not the arrow's offset position) — the
          arrow says "look here," the ring highlights the character once
          you do. Deliberately white+gold rather than the character's own
          color: a character-colored glow can blend right into a
          same-toned character or background (e.g. Leo's own warm brown-
          gold fur), while white+gold reads against any scene. */}
      <div
        className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ left, top, width: 200, height: 200, border: '6px solid white', boxShadow: '0 0 0 4px #FFD34E, 0 0 32px 10px rgba(255,211,78,0.75)', animation: 'lep1-ping 1.7s ease-in-out infinite' }}
      />
      <div className="pointer-events-none absolute z-20" style={{ ...pos, transform: `translate(-50%, -50%) rotate(${angle}deg)` }}>
        <span className="relative block" style={{ animation: 'lep1-hop 0.9s ease-in-out infinite' }}>
          <span className="pointer-events-none absolute bottom-0 left-1/2 h-16 w-16 -translate-x-1/2 translate-y-1/2 rounded-full" style={{ background: `radial-gradient(circle, ${color}88, transparent 65%)`, animation: 'lep1-ping 1.4s ease-out infinite' }} />
          {/* White fill + a thin dark outline (not the character/room's own
              color) so the arrow itself always reads as crisp and bright
              against any background — reported live as looking "black,
              dark" when filled with a darker accent colour like brown or
              teal. The colored glow just below still carries that per-item
              color cue. */}
          <svg width="76" height="110" viewBox="0 0 40 58" className="relative drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
            <path
              d="M13 3 C13 1.9 13.9 1 15 1 L25 1 C26.1 1 27 1.9 27 3 L27 21 L36 21 C37.9 21 38.8 23.3 37.4 24.6 L21.4 43.6 C20.6 44.5 19.4 44.5 18.6 43.6 L2.6 24.6 C1.2 23.3 2.1 21 4 21 L13 21 Z"
              fill="white"
              stroke="#2A2A2A"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </>
  );
}

function PrimaryButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-5 w-full rounded-full py-4 text-xl font-black text-white shadow-xl transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      style={{ background: 'linear-gradient(90deg, #FE6A2F, #FF8A4C, #FEBE4C)' }}
    >
      {children}
    </button>
  );
}

function TeacherTip({ instruction }: { instruction?: string }) {
  const [open, setOpen] = useState(false);
  if (!instruction) return null;
  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Hide teacher notes' : 'Show teacher notes'}
        className="fixed right-4 top-4 z-[9999] flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-black/40 text-lg text-white shadow-lg backdrop-blur-md transition hover:scale-105 active:scale-95"
        style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.35)' }}
        title="Teacher notes (only you can see this)"
      >
        {open ? '✕' : '\u{1F393}'}
      </button>
      {open && (
        <div
          className="fixed right-4 top-[68px] z-[9998] max-w-[340px] rounded-2xl border border-white/50 bg-neutral-900/90 p-4 text-sm leading-relaxed text-white shadow-2xl backdrop-blur-xl"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        >
          <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-orange-300">
            <span>{'\u{1F393}'}</span>
            <span>Teacher notes</span>
          </div>
          <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/60">Say to student</div>
          <div className="rounded-lg bg-white/10 px-3 py-2 text-white/95">{instruction}</div>
          <div className="mt-3 text-[10px] italic text-white/50">Only visible to you. Tap the icon to hide.</div>
        </div>
      )}
    </>
  );
}

/* ---------- Dispatcher ---------- */

export function SceneRenderer(props: {
  scene: Scene;
  onWin: (gem: boolean) => void;
  onLose: () => void;
  onNext: () => void;
  onRestart: () => void;
  gemsCollected: number;
  heartsRemaining: number;
  activitySync?: ActivitySync;
}) {
  const { scene } = props;
  const instruction = (scene as { teacher?: string }).teacher;
  const content = (() => {
    switch (scene.kind) {
      case 'title-card': return <TitleCardScene scene={scene} onNext={props.onNext} />;
      case 'cinematic': return <CinematicScene scene={scene} onNext={props.onNext} />;
      case 'meet': return <MeetScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
      case 'echo': return <EchoScene scene={scene} onWin={props.onWin} onNext={props.onNext} sync={props.activitySync} />;
      case 'memory': return <MemoryScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'drag-match': return <DragMatchScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
      case 'drag-sticker': return <DragStickerScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
      case 'vocab-spot': return <VocabSpotScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
      case 'choice': return <ChoiceScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'listen-tap': return <ListenTapScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'true-false': return <TrueFalseScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'frequency-ladder': return <FrequencyLadderScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'pronoun-sort': return <PronounSortScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
      case 'roleplay': return <RoleplayScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
      case 'join-stage': return <JoinStageScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
      case 'hello-doors': return <HelloDoorsScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'flipbook': return <FlipbookScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'song': return <SongScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
      case 'sound-model': return <SoundModelScene scene={scene} onNext={props.onNext} sync={props.activitySync} />;
      case 'trace': return <TraceScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
      case 'tongue-twister': return <TongueTwisterScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
      case 'word-build': return <WordBuildScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'letter-game': return <LetterGameScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'jigsaw-puzzle': return <JigsawPuzzleScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
      case 'spin-wheel': return <SpinWheelScene scene={scene} onNext={props.onNext} onWin={props.onWin} sync={props.activitySync} />;
      case 'picture-match': return <PictureMatchScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} sync={props.activitySync} />;
      case 'finale': return <FinaleScene scene={scene} hearts={props.heartsRemaining} gems={props.gemsCollected} onRestart={props.onRestart} />;
      default: return null;
    }
  })();
  return (
    <>
      {content}
      {instruction && <TeacherTip instruction={instruction} />}
    </>
  );
}

/* ---------- Title card ---------- */

function TitleCardScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'title-card' }>; onNext: () => void }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-5 top-5 flex items-center gap-3 animate-[lep1-fade-slide_0.5s_ease-out]">
        <img src={engleuphoriaLogo} alt="EnglEuphoria logo" className="h-16 w-16 rounded-full object-cover shadow-[0_10px_30px_rgba(0,0,0,0.4)] ring-2 ring-white/70" />
        <div className="hidden flex-col sm:flex">
          <span className="text-[11px] font-black uppercase tracking-widest text-white/90 drop-shadow">EnglEuphoria</span>
          <span className="text-[10px] font-bold text-white/80 drop-shadow">Playground Hub</span>
        </div>
      </div>
      <div className="absolute right-5 top-5 flex flex-wrap justify-end gap-2">
        <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">{scene.level}</span>
        <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">{scene.unit}</span>
        <span className="rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">{scene.lessonLabel}</span>
      </div>
      <div className="absolute inset-x-0 top-24 flex flex-col items-center px-6 text-center sm:top-20">
        <h1
          className="inline-block -rotate-2 leading-[1.05]"
          style={{
            fontFamily: "'Bungee', 'Fredoka', system-ui, sans-serif",
            background: 'linear-gradient(180deg, #FFF3B0 0%, #FFD34E 35%, #FF8A3D 70%, #E5561A 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', WebkitTextStroke: '5px #2A1200',
            paintOrder: 'stroke fill', filter: 'drop-shadow(0 8px 0 #B23A00) drop-shadow(0 12px 18px rgba(0,0,0,0.45))',
            letterSpacing: '0.02em', animation: 'lep1-hop 1.8s ease-in-out infinite',
            // Was three fixed Tailwind breakpoint jumps (5xl -> sm:7xl ->
            // md:8xl), flat at 96px from 768px all the way up. Reported
            // live: the same title read as oversized on a laptop screen
            // but properly proportioned on an external monitor. Two
            // devices both past the md: threshold get the identical fixed
            // 96px base size, and this scene is itself wrapped in
            // useFrameScale's own viewport-relative scaling (see that
            // hook's doc comment) that compensates differently per
            // device's own aspect ratio — a hard breakpoint cliff doesn't
            // track that smoothly, a continuous vw-based size does,
            // matching the same fluid-clamp pattern already used for
            // EchoScene's modeling-sentence text elsewhere in this file.
            fontSize: 'clamp(2.5rem, 1rem + 4 * var(--svw, 1vw), 4.5rem)',
          }}
        >
          {scene.title}
        </h1>
        <p className="mt-2 max-w-xl rounded-full bg-white/85 px-4 py-1 text-sm font-black text-orange-800 shadow-lg ring-2 ring-orange-200 sm:text-base" style={{ fontFamily: "'Fredoka', system-ui, sans-serif" }}>{scene.subtitle} ✨</p>
      </div>
      <div className="absolute inset-x-0 bottom-8 z-20 flex justify-center">
        <button onClick={() => { unlockAudio(); onNext(); }} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-12 py-5 text-2xl font-black text-white shadow-2xl ring-4 ring-white/60 transition hover:scale-105 active:scale-95 animate-pulse">
          {scene.cta ?? 'Start Lesson →'}
        </button>
      </div>
    </div>
  );
}

/* ---------- Cinematic ---------- */

function CinematicScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'cinematic' }>; onNext: () => void }) {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      await new Promise((r) => setTimeout(r, 400));
      if (cancelled) return;
      setStep(0);
      for (let i = 0; i < scene.script.length; i++) {
        if (cancelled) return;
        setStep(i);
        const lineStart = Date.now();
        await safeSpeak(scene.script[i].line, voiceOf(scene.script[i].who));
        if (cancelled) return;
        // Advancing the instant TTS finishes let short lines flash by
        // before a young reader could actually read them — floor each
        // line at a minimum on-screen time (scaled to length, so long
        // lines aren't held back once their audio already covers it).
        const minMs = Math.min(5500, Math.max(2200, scene.script[i].line.length * 60));
        const elapsed = Date.now() - lineStart;
        if (elapsed < minMs) await new Promise((r) => setTimeout(r, minMs - elapsed));
      }
      if (!cancelled) setStep(scene.script.length);
    }
    run();
    return () => { cancelled = true; };
  }, [scene.id]);

  const currentLine = step < 0 ? '…' : step < scene.script.length ? scene.script[step].line : 'Ready?';

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-1/2 top-8 -translate-x-1/2 text-center">
        <h1 className="text-4xl font-black text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.55)] sm:text-5xl">{scene.title}</h1>
        <p className="mt-1 text-sm font-semibold text-white/95 drop-shadow sm:text-base">{scene.subtitle}</p>
      </div>
      {step >= 0 && step < scene.script.length && (
        <div className="absolute bottom-[calc(52*var(--svh,1vh))] left-1/2 max-w-[520px] -translate-x-1/2 px-4">
          <div className="relative rounded-3xl bg-white px-6 py-4 text-center text-2xl font-black text-orange-800 shadow-2xl">
            “{currentLine}”
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 border-x-[14px] border-t-[16px] border-x-transparent border-t-white" />
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-8 z-50 flex justify-center">
        <button onClick={onNext} className="rounded-full bg-white px-8 py-4 text-base font-black uppercase tracking-widest text-orange-700 shadow-2xl transition hover:scale-[1.04]">
          🎮 {scene.cta}
        </button>
      </div>
    </div>
  );
}

/* ---------- Meet ---------- */

function MeetScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'meet' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
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

/* ---------- Vocab spot (arrow hotspots on one reused scene) ---------- */

function VocabSpotScene({ scene, onNext, onWin, sync }: {
  scene: Extract<Scene, { kind: 'vocab-spot' }>;
  onNext: () => void;
  onWin: (gem: boolean) => void;
  sync?: ActivitySync;
}) {
  // Real synced state (see PlayWelcomeTownLesson's REAL_SYNC_KINDS): whichever
  // side has the floor drives `local*` and publishes it via sync.setState;
  // the other side is a pure mirror, reading step/revealed straight off the
  // latest snapshot instead of reacting to its own (nonexistent, for this
  // kind) local clicks. Replaces the old generic DOM-click-mirror for
  // vocab-spot, which broke here because the student's screen renders an
  // extra "Watching your teacher" overlay the teacher's screen doesn't —
  // an asymmetry the raw click-path replay couldn't tolerate.
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;
  const syncedState = sync?.state as { step: number; revealed: boolean } | null | undefined;
  const [localStep, setLocalStep] = useState(0);
  const [localRevealed, setLocalRevealed] = useState(false);
  const gemDone = useRef(false);
  const total = scene.items.length;

  const step = isRemoteMirror ? (syncedState?.step ?? 0) : localStep;
  const revealed = isRemoteMirror ? (syncedState?.revealed ?? false) : localRevealed;
  const done = step >= total;
  const current = !done ? scene.items[step] : null;

  const publish = (nextStep: number, nextRevealed: boolean) => {
    setLocalStep(nextStep);
    setLocalRevealed(nextRevealed);
    sync?.setState({ step: nextStep, revealed: nextRevealed });
  };

  const tap = async () => {
    if (isRemoteMirror || !current || revealed) return;
    sfx.pop();
    publish(step, true);
    // Primary audio is the bare word — the example sentence is a secondary,
    // tap-to-hear extra on the flashcard, not something spoken automatically.
    await safeSpeak(current.label, current.who ? voiceOf(current.who) : 'teacher');
  };
  const hearSentence = async () => {
    if (!current) return;
    sfx.click();
    await safeSpeak(current.sentence, current.who ? voiceOf(current.who) : 'teacher');
  };
  const hearWord = async () => {
    if (!current) return;
    sfx.click();
    await safeSpeak(current.label, current.who ? voiceOf(current.who) : 'teacher');
  };
  const dismiss = () => {
    if (isRemoteMirror) return;
    publish(step + 1, false);
  };

  // Runs on whichever side's own `step` (local or mirrored) crosses into
  // "done", so the gem/onWin fires on both screens without the mirror side
  // needing to call dismiss() itself.
  useEffect(() => {
    if (done && !gemDone.current) {
      gemDone.current = true;
      sfx.gem();
      onWin(true);
    }
  }, [done, onWin]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">
        {scene.teacher} <span className="ml-1 opacity-60">({Math.min(step, total)}/{total})</span>
      </div>
      {/* Every word is already visibly drawn in scene.bg — only ONE arrow is
          ever on screen, pointing at the current word, so attention isn't
          split across the whole scene at once. It never carries a floating
          illustration of its own; it just marks where to look. The arrow
          sits a fixed gap away from the actual target (never touching it)
          and can approach from above, the left, or the right depending on
          `dir`, whichever side actually has room in that background. */}
      {current && (() => {
        const dir = current.dir ?? 'down';
        // Matches CharacterPointer's own bump (52x76 -> 76x110, GAP 62 ->
        // 90) — same "arrows look very small" report applied to this
        // scene's own separately-drawn arrow.
        const GAP = 90;
        const pos = dir === 'down'
          ? { left: current.left, top: `calc(${current.top} - ${GAP}px)` }
          : dir === 'right'
          ? { left: `calc(${current.left} - ${GAP}px)`, top: current.top }
          : { left: `calc(${current.left} + ${GAP}px)`, top: current.top };
        const angle = dir === 'down' ? 0 : dir === 'right' ? -90 : 90;
        return (
          <button
            onClick={tap}
            disabled={revealed}
            aria-label={`Learn the word ${current.label}`}
            className="absolute z-20 transition active:scale-90 disabled:pointer-events-none"
            style={{ ...pos, transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
          >
            {/* A chunky, thick-outlined cartoon arrow (matching this world's
                "Kawaii Comic Cartoon" style — bold dark outline, solid fill,
                rounded corners), with a pulsing glow at the tip plus a
                bouncing motion so the motion reads clearly at a glance. The
                bounce animates on this inner span, separately from the
                outer button's static rotation, so the two don't clobber
                each other on the shared `transform` property. */}
            <span className="relative block" style={{ animation: revealed ? undefined : 'lep1-hop 0.9s ease-in-out infinite' }}>
              {!revealed && (
                <span className="pointer-events-none absolute bottom-0 left-1/2 h-16 w-16 -translate-x-1/2 translate-y-1/2 rounded-full" style={{ background: `radial-gradient(circle, ${current.color}88, transparent 65%)`, animation: 'lep1-ping 1.4s ease-out infinite' }} />
              )}
              {/* White fill + thin dark outline, matching CharacterPointer's
                  identical fix — see its comment for why (reported live as
                  looking "black, dark" when filled with the item's own
                  accent color). */}
              <svg width="76" height="110" viewBox="0 0 40 58" className="relative drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
                <path
                  d="M13 3 C13 1.9 13.9 1 15 1 L25 1 C26.1 1 27 1.9 27 3 L27 21 L36 21 C37.9 21 38.8 23.3 37.4 24.6 L21.4 43.6 C20.6 44.5 19.4 44.5 18.6 43.6 L2.6 24.6 C1.2 23.3 2.1 21 4 21 L13 21 Z"
                  fill="white"
                  stroke="#2A2A2A"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        );
      })()}
      {/* Label, anchored back next to the arrow (same dir/GAP math it
          uses) per direct follow-up after the bottom-banner version —
          "back to anchored near the arrow." The word itself is now BARE
          on the image (white fill, thin black outline, Tajawal — same
          "kawaii" stroke-outline technique EchoScene's bare words use),
          not sitting inside a white card: white-on-white inside a pill
          would defeat the whole point of making it white. The small
          icon/replay/dismiss controls keep their own compact white pill
          just below it. */}
      {current && revealed && (() => {
        const dir = current.dir ?? 'down';
        const GAP = 150;
        const pos = dir === 'down'
          ? { left: current.left, top: `calc(${current.top} - ${GAP}px)` }
          : dir === 'right'
          ? { left: `calc(${current.left} - ${GAP}px)`, top: current.top }
          : { left: `calc(${current.left} + ${GAP}px)`, top: current.top };
        const leftPct = parseFloat(current.left);
        const translateX = leftPct < 25 ? '0%' : leftPct > 75 ? '-100%' : '-50%';
        return (
          <div
            className="pointer-events-none absolute z-40 flex flex-col items-center gap-2 px-2"
            style={{ ...pos, transform: `translate(${translateX}, -50%)`, animation: 'lep1-pop 0.25s ease-out' }}
          >
            <button onClick={hearWord} aria-label={`Hear "${current.label}" again`} className="pointer-events-auto flex items-center gap-2 transition active:scale-95">
              <span className="text-4xl drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)]" aria-hidden>{current.emoji}</span>
              {/* White fill + thin dark outline instead of a card: reads
                  clearly against any part of the scene without covering
                  it, matching the arrow's own white/thin-outline fix and
                  the bare-word treatment used elsewhere for modeling
                  text. Font changed from Chewy to Tajawal per direct
                  follow-up ("use this font better than chewy," pointing
                  at a screenshot of this app's own EchoScene "Castle!"
                  text) — Tajawal is already the page's own inherited
                  body font (see index.css), so this just states it
                  explicitly rather than introducing a new one. */}
              <span
                className="whitespace-nowrap text-4xl font-black leading-none sm:text-5xl"
                style={{
                  fontFamily: "'Tajawal', 'Cairo', 'Segoe UI', system-ui, sans-serif",
                  color: 'white',
                  WebkitTextStroke: '2px #1A1A1A',
                  paintOrder: 'stroke fill',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                }}
              >
                {current.label}
              </span>
            </button>
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border-2 border-white bg-white/95 py-1.5 pl-2 pr-2 shadow-xl backdrop-blur">
              <button onClick={hearSentence} aria-label={`Hear "${current.label}" in a sentence`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl text-neutral-400 transition active:scale-90 hover:text-neutral-600">🔊</button>
              <button onClick={dismiss} aria-label="Got it" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl text-white shadow transition active:scale-90" style={{ background: current.color }}>✓</button>
            </div>
          </div>
        );
      })()}
      {done && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">All found! ⭐ Next</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Echo ---------- */

function EchoScene({ scene, onWin, onNext, sync }: { scene: Extract<Scene, { kind: 'echo' }>; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { heard: 0, held: false, done: false });
  const { heard, held, done } = state;
  const holdTimer = useRef<number | null>(null);
  const c = CAST[scene.who];

  const hear = async () => { setState((s) => ({ ...s, heard: s.heard + 1 })); await safeSpeak(scene.word, voiceOf(scene.who)); };
  const startHold = () => {
    setState((s) => ({ ...s, held: true }));
    holdTimer.current = window.setTimeout(() => {
      setState((s) => ({ ...s, done: true, held: false }));
      onWin(true);
      cueSpeak('Amazing! Great voice!', 'pip');
    }, 1200);
  };
  const endHold = () => { setState((s) => ({ ...s, held: false })); if (holdTimer.current) window.clearTimeout(holdTimer.current); };

  // UNIVERSAL RULE for every modeling/vocabulary scene, not just this one
  // (see unit1/SceneRenderer.tsx's ListenRepeatCardsScene `bare`/`textSide`
  // mode, the proven original of this exact pattern): student clarity
  // comes first. The old layout put everything — instruction, word,
  // Listen, Hold&say, Next — inside one centered GlassCard sitting on top
  // of the full-bleed scene image already behind it, which (a) covered
  // the exact thing a modeling scene exists to show (e.g. "look, Wim is
  // really standing right there") and (b) is not how a young student
  // actually reads best — a small pill is easy to skip past, not a real
  // reading target. The word is now large enough to read at a glance and
  // placed on whichever side of the frame is actually empty, so it never
  // overlaps the character/subject it's paired with — never guess which
  // side is safe; look at the background and choose `textSide`
  // deliberately per scene.
  const side = scene.textSide ?? 'right';
  // This mode serves two different-length cases: a single vocabulary word
  // ("Hello!") and a full modeling sentence ("Wim is in the bedroom!").
  // One fixed huge size fits the first and wraps the second onto 2+ lines
  // at that same size — long enough to run down into the character it's
  // paired with. Scale down as word count grows so a full sentence still
  // reads clearly (still large, still high-contrast) without doing that.
  const wordCount = scene.word.trim().split(/\s+/).length;
  const fontSize =
    wordCount <= 1
      ? (side === 'top' ? 'clamp(3.5rem, calc(10*var(--svw,1vw)), 7rem)' : 'clamp(4.5rem, calc(13*var(--svw,1vw)), 10rem)')
      : wordCount <= 3
      ? (side === 'top' ? 'clamp(2.5rem, calc(7*var(--svw,1vw)), 4.5rem)' : 'clamp(2.75rem, calc(8*var(--svw,1vw)), 5rem)')
      : (side === 'top' ? 'clamp(2rem, calc(5.5*var(--svw,1vw)), 3.5rem)' : 'clamp(2.25rem, calc(6*var(--svw,1vw)), 4rem)');
  return (
    <div className="absolute inset-0">
      <div className="pointer-events-none absolute inset-x-0 top-4 z-30 flex justify-center px-4">
        <div className="max-w-lg rounded-2xl bg-white/95 px-5 py-3 text-center text-base font-bold text-orange-800 shadow-xl backdrop-blur sm:text-lg">
          {scene.teacher}
        </div>
      </div>
      <div className={
        side === 'top'
          ? 'absolute inset-x-0 top-24 z-20 flex flex-col items-center gap-6 px-4'
          : `absolute inset-y-0 z-20 flex w-1/2 flex-col items-center justify-center gap-8 px-1 ${side === 'right' ? 'right-0' : 'left-0'}`
      }>
        {/* A full modeling SENTENCE (wordColors set) gets a small stone-
            plaque frame — castle-themed (warm stone tones, a double-ring
            border evoking carved masonry), sized to fit the text only,
            not a background panel spanning extra image. A single
            vocabulary word (no wordColors, e.g. "Castle!"/"Garden!")
            stays fully bare as before. Per direct request: "a small
            frame or bricks to frame the parts of the sentence" — circled
            the whole multi-word sentence, not individual words. */}
        {scene.wordColors ? (
          <div
            className="inline-block rounded-2xl px-[calc(2.2*var(--svw,1vw))] py-[calc(1.1*var(--svw,1vw))]"
            style={{
              background: 'linear-gradient(135deg, rgba(58,38,22,0.55), rgba(30,18,10,0.55))',
              border: '3px solid rgba(222,196,152,0.9)',
              boxShadow: 'inset 0 0 0 3px rgba(46,28,16,0.85), 0 10px 24px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(1.5px)',
            }}
          >
            <p
              className="max-w-[calc(84*var(--svw,1vw))] text-center font-black leading-tight text-white"
              style={{ fontSize, filter: `drop-shadow(0 4px 10px rgba(0,0,0,0.6)) drop-shadow(0 0 18px ${c.color}88)` }}
            >
              {scene.word.split(' ').map((w, i) => (
                <span key={i} style={scene.wordColors![i] ? { color: scene.wordColors![i]! } : undefined}>
                  {w}{i < scene.word.split(' ').length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
          </div>
        ) : (
          <p
            className="max-w-[calc(90*var(--svw,1vw))] text-center font-black leading-tight text-white"
            style={{
              fontSize,
              // A dark contrast shadow (readability on any background) plus a
              // soft glow in the speaking character's own color underneath it
              // — same purpose as a card used to serve (giving the bare text
              // a "presence" of its own) without bringing back the card that
              // was covering the scene.
              filter: `drop-shadow(0 6px 14px rgba(0,0,0,0.7)) drop-shadow(0 0 22px ${c.color}88)`,
            }}
          >
            {scene.word}
          </p>
        )}
        {/* One grouped control cluster instead of a lone floating "PIP SAYS"
            label sitting disconnected above two generic white pills — the
            speaker chip (avatar + name, character-colored) now visually
            leads straight into the buttons below it, and both buttons pick
            up the character's own CAST color as their accent instead of a
            fixed orange, tying them to the rest of this lesson's chip
            language (e.g. the vocab-spot room labels). Reported as "still
            doesn't feel satisfying" on the plain flat-shadow-text version. */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white/95 py-1.5 pl-1.5 pr-4 shadow-xl backdrop-blur">
            <span className="grid h-7 w-7 place-items-center rounded-full text-base shadow-inner" style={{ background: c.color }}>
              {c.emoji}
            </span>
            <span className="text-xs font-black uppercase tracking-widest sm:text-sm" style={{ color: c.color }}>
              {c.name} says
            </span>
          </div>
          <div className={side === 'top' ? 'flex flex-row items-center gap-3' : 'flex flex-col items-center gap-3'}>
            <button
              onClick={hear}
              className="rounded-full border-2 bg-white px-6 py-3 text-sm font-bold shadow-xl transition active:scale-95 sm:text-base"
              style={{ color: c.color, borderColor: c.color }}
            >
              🔊 Listen {heard > 0 && <span className="opacity-60">({heard})</span>}
            </button>
            <button
              onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold} disabled={heard === 0}
              className={`rounded-full px-6 py-3 text-sm font-black text-white shadow-xl transition sm:text-base ${held ? 'scale-95' : ''} disabled:opacity-40`}
              style={{ background: done ? 'linear-gradient(90deg, #10B981, #34D399)' : `linear-gradient(90deg, ${c.color}, ${c.color}cc)` }}
            >
              {done ? '✅ Great job!' : held ? '🎤 Keep talking…' : '🎤 Hold & say it'}
            </button>
          </div>
        </div>
      </div>
      {done && (
        <div className="absolute inset-x-0 bottom-6 z-40 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next →</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Memory ---------- */

function MemoryScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'memory' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  type Card = { key: string; pairId: string; label: string; emoji: string };
  const deck = useMemo<Card[]>(() => {
    const base = scene.pairs.flatMap((p) => [{ key: `${p.id}-a`, pairId: p.id, label: p.label, emoji: p.emoji }, { key: `${p.id}-b`, pairId: p.id, label: p.label, emoji: p.emoji }]);
    return base.map((c, i) => ({ c, r: (i * 9301 + 49297) % 233280 })).sort((a, b) => a.r - b.r).map((x) => x.c);
  }, [scene.id]);
  // `matched` is a plain string[] (not a Set) because the synced snapshot
  // travels as JSON over the broadcast channel, which would silently
  // flatten a Set to `{}`.
  const [state, setState] = useSyncedState(sync, { flipped: [] as string[], matched: [] as string[], busy: false, gemDone: false });
  const { flipped, matched, busy, gemDone } = state;
  const matchedSet = useMemo(() => new Set(matched), [matched]);

  const tap = async (card: Card) => {
    if (busy || matchedSet.has(card.pairId) || flipped.includes(card.key)) return;
    const next = [...flipped, card.key];
    setState((s) => ({ ...s, flipped: next }));
    void safeSpeak(card.label, 'teacher');
    if (next.length === 2) {
      setState((s) => ({ ...s, busy: true }));
      const a = deck.find((c) => c.key === next[0])!, b = deck.find((c) => c.key === next[1])!;
      await new Promise((r) => setTimeout(r, 700));
      if (a.pairId === b.pairId) {
        sfx.match();
        setState((s) => {
          const nextMatched = s.matched.includes(a.pairId) ? s.matched : [...s.matched, a.pairId];
          const justCompleted = nextMatched.length === scene.pairs.length && !s.gemDone;
          if (justCompleted) { sfx.gem(); onWin(true); }
          return { ...s, matched: nextMatched, gemDone: s.gemDone || justCompleted, flipped: [], busy: false };
        });
      } else {
        sfx.wrong(); onLose();
        setState((s) => ({ ...s, flipped: [], busy: false }));
      }
    }
  };
  const complete = matched.length === scene.pairs.length;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">🧠 {scene.teacher}</div>
      <div className="relative z-10 grid w-full max-w-[860px] grid-cols-4 gap-5 px-4 sm:gap-6">
        {deck.map((card) => {
          const isMatched = matchedSet.has(card.pairId);
          const isFlipped = flipped.includes(card.key) || isMatched;
          return (
            <button key={card.key} onClick={() => tap(card)} disabled={busy || isMatched} className="relative aspect-square [perspective:800px]" aria-label={isFlipped ? card.label : 'Hidden card'}>
              <div className="absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: isFlipped ? 'rotateY(180deg)' : undefined }}>
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl border-4 border-white text-3xl font-black text-white shadow-xl [backface-visibility:hidden]" style={{ background: 'linear-gradient(135deg,#FE6A2F,#FF8A4C)' }}>?</div>
                <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-4 bg-white p-2 shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${isMatched ? 'border-green-400 ring-4 ring-green-300/60' : 'border-white'}`}>
                  <span className="text-4xl">{card.emoji}</span>
                  <span className="mt-1 text-[10px] font-black text-orange-700 sm:text-xs">{card.label}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {complete && <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center"><button onClick={onNext} className="animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-3 text-lg font-black text-white shadow-2xl active:scale-95">All pairs! ⭐ Next</button></div>}
    </div>
  );
}

/* ---------- Drag match (listen, then drag the word onto its object) ---------- */

function DragMatchScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'drag-match' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const total = scene.items.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<Set<number>>(new Set());
  // xPct/yPct: the drag ghost's position expressed as a percentage of the
  // scene container, NOT raw viewport pixels — see the ghost's render below
  // for why. x/y (raw client coords) are kept for the drop hit-test only,
  // which already measures everything in that same raw-viewport space and
  // is unaffected by this.
  const [drag, setDrag] = useState<{ idx: number; x: number; y: number; startX: number; startY: number; xPct: number; yPct: number } | null>(null);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const gemDone = useRef(false);
  // The tray's left-to-right order is scattered rather than matching each
  // item's index (which lines up with left-to-right position in the scene
  // itself) — otherwise tray order alone gives away which tile goes where.
  const trayOrder = useMemo(() => {
    const order = scene.items.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = (i * 7 + 3) % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }, [scene.id]);

  const hear = (idx: number) => {
    sfx.click();
    const item = scene.items[idx];
    void safeSpeak(item.label, item.who ? voiceOf(item.who) : 'teacher');
  };

  // Container-relative percentage for a raw viewport point — used for the
  // ghost chip's position (see its render below).
  const toPct = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { xPct: 50, yPct: 50 };
    return { xPct: ((clientX - rect.left) / rect.width) * 100, yPct: ((clientY - rect.top) / rect.height) * 100 };
  };

  const startDrag = (e: React.PointerEvent, idx: number) => {
    if (placed.has(idx)) return;
    e.preventDefault();
    hear(idx);
    setDrag({ idx, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, ...toPct(e.clientX, e.clientY) });
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY, ...toPct(e.clientX, e.clientY) } : d));
    const up = (e: PointerEvent) => {
      const movedDist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
      // A short tap (barely moved) is just "hear the word again," not a
      // drop attempt — only a real drag gesture gets scored as a match try.
      if (movedDist < 24) { setDrag(null); return; }
      const container = containerRef.current;
      const item = scene.items[drag.idx];
      if (container) {
        const rect = container.getBoundingClientRect();
        const targetX = rect.left + (parseFloat(item.targetLeft) / 100) * rect.width;
        const targetY = rect.top + (parseFloat(item.targetTop) / 100) * rect.height;
        // Vocab-matching drops (no showBlanks landing-zone box drawn) land
        // anywhere on a full illustration, not a pinpoint — 0.14 was tight
        // enough that dropping on a visibly-correct object still missed
        // and registered as wrong. Widened so a typical character/object's
        // rendered footprint is a comfortable hit area; sentence-builder
        // (showBlanks) drops stay tighter since those have a small drawn
        // blank to aim at, not a full illustration.
        //
        // When an item declares its own targetWidth/targetHeight (a wide,
        // short object like a table isn't well covered by ANY single
        // circle radius — too small and it misses the edges, too big and
        // it starts overlapping a neighboring item), test against that
        // rectangle instead, padded a little so a drop just outside the
        // drawn edge still counts.
        let hit: boolean;
        if (item.targetWidth && item.targetHeight) {
          // targetLeft/targetTop is where the OBJECT STANDS, not its
          // visual center — every *_SPOT convention in this app anchors
          // near an object's base/floor-contact point (same reason a
          // character's own left/top works for CharacterPointer). A box
          // centered on that anchor undershoots the top of anything tall
          // (a chair's backrest sits mostly ABOVE its anchor, almost none
          // below it) — confirmed live, a drop right on the chair's
          // backrest still missed. So the box extends the object's full
          // height UPWARD from the anchor, with only a small pad below
          // it, rather than splitting the height evenly both ways.
          const w = (parseFloat(item.targetWidth) / 100) * rect.width;
          const h = (parseFloat(item.targetHeight) / 100) * rect.height;
          const pad = Math.min(rect.width, rect.height) * 0.08;
          const withinX = Math.abs(e.clientX - targetX) <= w / 2 + pad;
          const withinY = e.clientY <= targetY + pad && e.clientY >= targetY - h - pad;
          hit = withinX && withinY;
        } else {
          const dist = Math.hypot(e.clientX - targetX, e.clientY - targetY);
          const tolerance = Math.min(rect.width, rect.height) * (scene.showBlanks ? 0.14 : 0.26);
          hit = dist <= tolerance;
        }
        if (hit) {
          sfx.match();
          setPlaced((prev) => {
            const next = new Set(prev).add(drag.idx);
            if (next.size === total && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
            return next;
          });
        } else {
          sfx.wrong(); onLose();
          setWrongIdx(drag.idx);
          window.setTimeout(() => setWrongIdx(null), 500);
        }
      }
      setDrag(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [drag, scene.items, total, onWin, onLose]);

  const done = placed.size === total;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-cover bg-center touch-none" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      {scene.pointTo?.map((p, i) => (
        <CharacterPointer key={`point-${i}`} left={p.left} top={p.top} dir={p.dir} color={CAST[p.who].color} />
      ))}
      {scene.showBlanks && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-30 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-center text-xs font-black uppercase tracking-widest text-white shadow-lg">
          📝 Sentence Builder
        </div>
      )}
      <div className={`pointer-events-none absolute left-1/2 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base ${scene.showBlanks ? 'top-14' : 'top-4'}`}>
        {scene.teacher} <span className="ml-1 opacity-60">({placed.size}/{total})</span>
      </div>
      {/* For vocab-matching drag-match scenes, no landing-zone hint is
          rendered — the student has to remember where the object is from
          the vocab-spot scene that just taught it, not read it off a
          dashed ring drawn in advance. For sentence-builder scenes
          (showBlanks), that same "recall the hidden spot" logic doesn't
          apply — there's no environmental anchor to remember, the target
          is just "the Nth word of the sentence" — so the blank itself must
          be visible from the start or the activity isn't legible as
          sentence-building at all. */}
      {scene.showBlanks && scene.items.map((item, i) => !placed.has(i) && (
        <div
          key={`blank-${i}`}
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-[5px] border-dashed border-white/85 bg-black/10 px-6 py-4"
          style={{ left: item.targetLeft, top: item.targetTop, minWidth: `${Math.max(3, item.label.length) * 1.7}ch` }}
        >
          <span className="invisible text-lg font-black uppercase tracking-wide sm:text-xl">{item.label}</span>
        </div>
      ))}
      {/* Unified to the same larger size as the tray buttons (below) —
          previously kept smaller here on the theory that a passive
          confirmation chip didn't need to match the interactive tray
          button's size, but reported live as still too small to read
          once placed. */}
      {scene.items.map((item, i) => placed.has(i) && (
        <div
          key={`placed-${i}`}
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-2xl px-7 py-5 shadow-xl ring-4 ring-white"
          style={{ left: item.targetLeft, top: item.targetTop, background: item.color, animation: 'lep1-pop 0.4s ease-out' }}
        >
          <span className="text-xl font-black uppercase tracking-wide text-white sm:text-2xl">{item.label}</span>
        </div>
      ))}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex flex-wrap justify-center gap-3 px-4">
        {trayOrder.map((i) => {
          const item = scene.items[i];
          if (placed.has(i)) return null;
          // The tray button for the item currently being dragged stays
          // MOUNTED (just visually hidden) rather than unmounting — see the
          // sticker-drag scene's identical fix just above this component
          // for why: the live-classroom DOM-tap mirror caches ONE element
          // reference from the initial pointerdown and dispatches every
          // later pointermove/pointerup straight at it. If that node
          // unmounts (or, worse, is fully removed from the tree like this
          // used to do), the cached reference goes fully detached —
          // dispatching events on a detached node never bubbles to the
          // `window` listeners this scene's own drag-move/up handlers are
          // registered on, so the OTHER participant's view of the drag
          // freezes after the very first frame. Reported live as "the
          // grab and drag / matching game doesn't work." The moving ghost
          // chip below is still what's visually shown while dragging;
          // this button just needs to keep existing at the same DOM path.
          const isBeingDragged = drag?.idx === i;
          return (
            <button
              key={`tray-${i}`}
              onPointerDown={(e) => startDrag(e, i)}
              aria-label={`Drag the word ${item.label}`}
              className={`touch-none shadow-2xl ring-4 ring-white transition active:scale-95 rounded-2xl px-7 py-5 ${wrongIdx === i ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''} ${isBeingDragged ? 'pointer-events-none opacity-0' : 'pointer-events-auto'}`}
              style={{ background: item.color, animation: isBeingDragged || wrongIdx === i ? undefined : 'lep1-hop 1.6s ease-in-out infinite' }}
            >
              {/* Unified to one large size regardless of showBlanks — the
                  smaller vocab-matching variant (text-sm, px-4 py-3) read
                  as a tiny target on a real classroom-scaled frame,
                  reported live as "the grab and drop buttons are too
                  small on the screen." */}
              <span className="text-xl font-black uppercase tracking-wide text-white sm:text-2xl">{item.label}</span>
            </button>
          );
        })}
      </div>
      {/* `absolute` + percentage left/top, NOT `fixed` + raw client pixels:
          this scene renders inside MainStage's scaled letterbox frame (see
          useFrameScale), and a `transform: scale(...)` on ANY ancestor makes
          that ancestor the containing block for every `position: fixed`
          descendant per the CSS spec — so a `fixed` ghost here was actually
          positioned relative to the SCALED frame, not the real viewport,
          while its left/top came from raw (unscaled) pointer coordinates.
          The two disagreed by roughly the frame's own scale factor, so the
          ghost visibly drifted away from the real cursor/finger the moment
          the frame was scaled at all — reported live as "the arrow is far
          away from the word I'm dragging." Percentages of the scene
          container (which IS inside the same scaled space as the pointer)
          track correctly regardless of scale. */}
      {drag && (
        <div
          className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-xl px-4 py-3 shadow-2xl ring-4 ring-white"
          style={{ left: `${drag.xPct}%`, top: `${drag.yPct}%`, background: scene.items[drag.idx].color }}
        >
          <span className="text-sm font-black uppercase tracking-wide text-white">{scene.items[drag.idx].label}</span>
        </div>
      )}
      {done && (
        <div className="absolute inset-x-0 bottom-8 z-40 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Great job! ⭐ Next</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Drag sticker (free teacher-placed characters, no scoring) ----------
 * Matches a real reference the user pointed to directly: a competitor's
 * house-cutaway slide where the teacher freely drags a character between
 * rooms while quizzing the student out loud — "Drag Sally into them as you
 * go." There is no quiz phase, no correct zone, nothing scored in-app; the
 * teacher IS the check. Each sticker in `scene.stickers` is independently,
 * repeatedly draggable — pick it up, drop it, pick it up again, as many
 * times as the conversation needs.
 *
 * Deliberately mirrors DragMatchScene's own plain-`useState` drag physics
 * (no `sync` prop, no ActivitySync/useSyncedState) — see
 * PlayWelcomeTownLesson.tsx's REAL_SYNC_KINDS comment: continuous pointer
 * gestures sync live via the generic DOM pointer-event tap/drag mirror
 * (sendSceneTap's pointerdown/pointermove/pointerup replay), not the
 * structured broadcast channel, so this scene must stay OFF
 * REAL_SYNC_KINDS and un-wrapped in `sync` for that mirror to apply at all. */

function DragStickerScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'drag-sticker' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, { xPct: number; yPct: number }>>({});
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ xPct: number; yPct: number } | null>(null);
  const gemDone = useRef(false);

  // Container-relative percentage — see DragMatchScene's identical helper/
  // comment for why this must be a percentage of the scene container, not
  // raw viewport pixels, inside the classroom's scaled letterbox frame.
  const toPct = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { xPct: 50, yPct: 50 };
    return { xPct: ((clientX - rect.left) / rect.width) * 100, yPct: ((clientY - rect.top) / rect.height) * 100 };
  };

  const startDrag = (e: React.PointerEvent, key: string) => {
    e.preventDefault();
    sfx.click();
    setDragKey(key);
    setDragPos(toPct(e.clientX, e.clientY));
  };

  useEffect(() => {
    if (!dragKey) return;
    const move = (e: PointerEvent) => setDragPos(toPct(e.clientX, e.clientY));
    const up = (e: PointerEvent) => {
      const p = toPct(e.clientX, e.clientY);
      setPositions((prev) => ({ ...prev, [dragKey]: p }));
      if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
      setDragKey(null);
      setDragPos(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragKey]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-cover bg-center touch-none" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">
        {scene.teacher}
      </div>

      {/* A real paper sticker, not an emoji chip: the source art already has
          its own white die-cut border baked in (see magic-castle/scenes.ts's
          sticker-wim.png/sticker-catcat.png generation) and a transparent
          background around it, so this just adds the physical
          "placed on the page" cues — a soft shadow and a slight tilt. */}
      {scene.stickers.map((s) => {
        const key = s.who;
        const isDragging = dragKey === key;
        const pos = isDragging && dragPos ? dragPos : (positions[key] ?? { xPct: parseFloat(s.startLeft), yPct: parseFloat(s.startTop) });
        // ALWAYS the same <button> element across the whole gesture — never
        // swap to a bare <img> while dragging. In a live classroom, the
        // teacher's raw pointerdown/move/up gets mirrored onto the other
        // side's matching DOM node by caching ONE element reference from
        // the initial pointerdown and dispatching every later move/up
        // event straight at it (see PlayWelcomeTownLesson's scene_tap
        // subscriber). Swapping the tag mid-drag makes React destroy that
        // node, so the cached reference on the OTHER participant's screen
        // goes stale after the very first frame — their view of the
        // sticker never follows the drag. Reported live as "the grab and
        // drag ('Where is Wim?') doesn't work."
        return (
          <button
            key={key}
            onPointerDown={(e) => startDrag(e, key)}
            aria-label={`Drag ${CAST[s.who].name}`}
            className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 touch-none transition-transform ${isDragging ? 'z-50 pointer-events-none' : 'pointer-events-auto active:scale-95'}`}
            style={{ left: `${pos.xPct}%`, top: `${pos.yPct}%` }}
          >
            <img
              src={s.stickerImg} alt={CAST[s.who].name}
              className={`object-contain sm:h-36 sm:w-36 ${isDragging ? 'h-28 w-28 drop-shadow-[0_16px_24px_rgba(0,0,0,0.5)]' : 'h-28 w-28 drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]'}`}
              style={{ transform: isDragging ? 'scale(1.08) rotate(-3deg)' : 'rotate(4deg)' }}
            />
          </button>
        );
      })}
      {/* No in-scene "Next" button here on purpose — this is an open-ended,
       *  teacher-paced free-drag scene with no completion state to gate on,
       *  so the button was ALWAYS visible from the moment the scene loaded.
       *  Both the solo player's own bottom nav bar and the classroom's
       *  external Back/Next controls already advance the lesson; this
       *  second, always-on button just sat permanently over the lower
       *  rooms of the castle, blocking exactly the content the teacher and
       *  student are dragging characters into. Reported live as "Great
       *  job! Next is covering the view." */}
    </div>
  );
}

/* ---------- Choice (new: simple multiple-choice tap) ---------- */

function ChoiceScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'choice' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { picked: null as string | null, correct: false });
  const { picked, correct } = state;
  const gemDone = useRef(false);

  useEffect(() => {
    setState({ picked: null, correct: false });
    gemDone.current = false;
    cueSpeakOnce(scene.prompt, voiceOf(scene.who));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  const pick = async (label: string, isCorrect: boolean) => {
    if (correct) return;
    if (!isCorrect) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, picked: label }));
      window.setTimeout(() => setState((s) => ({ ...s, picked: null })), 600);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, picked: label, correct: true }));
    if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
    await safeSpeak(`Yes! ${label}!`, voiceOf(scene.who));
  };

  return (
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-black/20" />
      {/* Only useful when the referenced character sits outside the
          options row's vertical band (roughly 42%-58% of the screen,
          where the big tappable option cards render) — otherwise the
          cards themselves cover whoever the arrow would point at. */}
      {scene.pointTo?.map((p, i) => (
        <CharacterPointer key={`point-${i}`} left={p.left} top={p.top} dir={p.dir} color={CAST[p.who].color} />
      ))}
      <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center px-4">
        <div className="rounded-full bg-white/95 px-5 py-3 text-center text-base font-bold text-orange-800 shadow-xl sm:text-lg">{scene.prompt}</div>
      </div>
      <button onClick={() => cueSpeak(scene.prompt, voiceOf(scene.who))} className="absolute right-4 top-4 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>
      <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 flex-wrap justify-center gap-6 px-4 sm:gap-10">
        {scene.options.map((opt) => {
          const isPicked = picked === opt.label;
          const showWrong = isPicked && !opt.correct;
          const showRight = correct && opt.correct;
          return (
            <button
              key={opt.label}
              onClick={() => pick(opt.label, !!opt.correct)}
              disabled={correct}
              className={`grid h-36 w-36 place-items-center rounded-3xl border-8 bg-white shadow-2xl transition active:scale-95 sm:h-44 sm:w-44 ${showWrong ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : showRight ? 'border-green-400' : 'border-white'}`}
              aria-label={opt.label}
            >
              <span className="text-5xl">{opt.emoji}</span>
              <span className="mt-2 text-lg font-black text-orange-700">{opt.label}</span>
            </button>
          );
        })}
      </div>
      {correct && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Listen & tap (multiple real objects/characters already
   painted in the background are all live hotspots at once; a line plays
   and the student must tap the ONE that matches — unlike vocab-spot's
   single guided arrow with no wrong-answer risk, a wrong tap here is a
   real possibility, closer to a genuine listening check than a discovery
   flashcard; see scenes.ts's `listen-tap` type comment for why this kind
   exists). ---------- */

function ListenTapScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'listen-tap' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
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

/* ---------- True / False (a spoken statement, judged True or False — a
   fast binary listening check, no scene-hotspot dependency, so it can
   freely mix content across topics/backgrounds in one scene). ---------- */

function TrueFalseScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'true-false' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, picked: null as 'true' | 'false' | null, correct: false });
  const { round, picked, correct } = state;
  const gemDone = useRef(false);
  const total = scene.rounds.length;
  const complete = round >= total;
  const r = !complete ? scene.rounds[round] : null;

  useEffect(() => {
    if (complete) return;
    setState((s) => ({ ...s, picked: null, correct: false }));
    cueSpeakOnce(r!.statement, voiceOf(r!.who));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, complete]);

  const answer = (guess: boolean) => {
    if (!r || correct) return;
    if (guess !== r.isTrue) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, picked: guess ? 'true' : 'false' }));
      window.setTimeout(() => setState((s) => ({ ...s, picked: null })), 600);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, picked: guess ? 'true' : 'false', correct: true }));
    if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
    window.setTimeout(() => setState((s) => ({ ...s, round: s.round + 1 })), 900);
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
      <div className="pointer-events-none absolute inset-0 bg-black/25" />
      <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center px-4">
        <div className="rounded-full bg-white/95 px-5 py-3 text-center text-base font-bold text-orange-800 shadow-xl sm:text-lg">
          {scene.teacher} <span className="ml-1 opacity-60">({round + 1}/{total})</span>
        </div>
      </div>
      <div className="absolute inset-x-0 top-1/3 z-10 flex justify-center px-6">
        <div className="max-w-md rounded-3xl border-4 border-white bg-white/95 px-6 py-5 text-center shadow-2xl">
          <p className="text-2xl font-black text-orange-800">“{r!.statement}”</p>
          <button onClick={() => cueSpeak(r!.statement, voiceOf(r!.who))} className="mt-2 text-sm font-semibold text-neutral-500 underline decoration-dotted active:scale-95">🔊 Hear it again</button>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-10 z-20 flex justify-center gap-6 px-4">
        <button
          onClick={() => answer(true)} disabled={correct}
          className={`grid h-24 w-32 place-items-center rounded-3xl border-8 bg-white text-2xl font-black text-emerald-600 shadow-2xl transition active:scale-95 sm:h-28 sm:w-40 ${picked === 'true' && !correct ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : picked === 'true' && correct ? 'border-green-400' : 'border-white'}`}
        >✅ True</button>
        <button
          onClick={() => answer(false)} disabled={correct}
          className={`grid h-24 w-32 place-items-center rounded-3xl border-8 bg-white text-2xl font-black text-rose-600 shadow-2xl transition active:scale-95 sm:h-28 sm:w-40 ${picked === 'false' && !correct ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : picked === 'false' && correct ? 'border-green-400' : 'border-white'}`}
        >❌ False</button>
      </div>
    </div>
  );
}

/* ---------- Frequency ladder ---------- */

const FREQUENCY_RUNGS: { key: 'never' | 'sometimes' | 'usually' | 'always'; label: string; color: string }[] = [
  { key: 'always', label: 'Always', color: '#FE6A2F' },
  { key: 'usually', label: 'Usually', color: '#FEBE4C' },
  { key: 'sometimes', label: 'Sometimes', color: '#4FA9E0' },
  { key: 'never', label: 'Never', color: '#94A3B8' },
];

function FrequencyLadderScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'frequency-ladder' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, picked: null as string | null, correct: false, wrong: null as string | null });
  const { round, picked, correct, wrong } = state;
  const gemDone = useRef(false);
  const total = scene.rounds.length;
  const complete = round >= total;
  const r = !complete ? scene.rounds[round] : null;

  useEffect(() => {
    if (complete) return;
    setState((s) => ({ ...s, picked: null, correct: false, wrong: null }));
    const t = window.setTimeout(() => void safeSpeak(`How often do you ${r!.action}?`, 'teacher'), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, complete]);

  const tap = async (key: string) => {
    if (!r || picked) return;
    if (key !== r.answer) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: key }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: null })), 500);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, picked: key, correct: true }));
    if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
    await safeSpeak(r.line, voiceOf(scene.who));
    window.setTimeout(() => setState((s) => ({ ...s, round: s.round + 1 })), 1400);
  };

  if (complete) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <Confetti count={50} />
        <button onClick={onNext} className="relative z-10 animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">You climbed the whole ladder! ⭐ Next</button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-black/15" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">
        🪜 {scene.teacher} <span className="ml-1 opacity-60">({round + 1}/{total})</span>
      </div>
      <div className="absolute left-1/2 top-24 z-20 flex -translate-x-1/2 flex-col items-center gap-2 rounded-3xl bg-white/95 px-6 py-4 text-center shadow-2xl">
        <div className="text-[11px] font-black uppercase tracking-[0.25em] text-orange-500">How often do you...?</div>
        <div className="text-5xl">{r!.emoji}</div>
        <div className="text-lg font-black text-orange-800 sm:text-xl">{r!.action}</div>
      </div>
      {/* Bottom (Never) to top (Always) — a real ordered scale, not a flat
          option list, since the four answers actually rank against each
          other and the visual should say so. */}
      <div className="absolute inset-x-0 bottom-8 z-20 flex flex-col-reverse items-center gap-3 px-4">
        {FREQUENCY_RUNGS.map((rung) => {
          const isPicked = picked === rung.key;
          const showWrong = wrong === rung.key;
          const showRight = correct && rung.key === r!.answer;
          return (
            <button
              key={rung.key}
              onClick={() => tap(rung.key)}
              disabled={!!picked}
              className={`w-full max-w-sm rounded-2xl border-8 py-4 text-center text-xl font-black uppercase tracking-wide text-white shadow-2xl transition active:scale-95 disabled:cursor-not-allowed ${showWrong ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : showRight || isPicked ? 'border-green-400 scale-105' : 'border-white'}`}
              style={{ background: rung.color }}
            >
              {rung.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Pronoun sort (He / She / They — drag a character, or a pair
   of characters for the "they" rounds, onto the pronoun that describes
   them) ---------- */

const PRONOUN_BINS = ['He', 'She', 'They'] as const;
type Pronoun = (typeof PRONOUN_BINS)[number];
const PRONOUN_COLOR: Record<Pronoun, string> = { He: '#4FA9E0', She: '#E76FA5', They: '#8ECAE6' };

function PronounSortScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'pronoun-sort' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<Pronoun | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });
  const [hotBox, setHotBox] = useState<Pronoun | null>(null);
  const boxRefs = useRef<Record<Pronoun, HTMLDivElement | null>>({ He: null, She: null, They: null });
  const start = useRef({ x: 0, y: 0 });
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;
  const isPair = (v: unknown): v is [CharKey, CharKey] => Array.isArray(v);

  useEffect(() => {
    if (!r) return;
    setPicked(null); setCorrect(null); setDragOffset({ dx: 0, dy: 0 });
    const speaker = isPair(r.who) ? r.who[0] : r.who;
    const line = isPair(r.who) ? `We are ${r.emotion}.` : `I am ${r.emotion}.`;
    const t = window.setTimeout(() => void safeSpeak(line, voiceOf(speaker)), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const hitTest = (x: number, y: number): Pronoun | null => {
    for (const p of PRONOUN_BINS) {
      const el = boxRefs.current[p];
      if (!el) continue;
      const b = el.getBoundingClientRect();
      const PAD = 20;
      if (x >= b.left - PAD && x <= b.right + PAD && y >= b.top - PAD && y <= b.bottom + PAD) return p;
    }
    return null;
  };

  const pick = async (choice: Pronoun) => {
    if (!r || picked) return;
    setPicked(choice);
    const ok = choice === r.answer;
    setCorrect(ok);
    const speaker = isPair(r.who) ? r.who[0] : r.who;
    if (ok) {
      sfx.match(); setScore((s) => s + 1);
      const verb = choice === 'They' ? 'are' : 'is';
      await safeSpeak(`Yes! ${choice} ${verb} ${r.emotion}!`, voiceOf(speaker));
      const next = round + 1;
      if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
      window.setTimeout(() => setRound(next), 400);
    } else {
      sfx.wrong(); onLose();
      window.setTimeout(() => { setPicked(null); setCorrect(null); setDragOffset({ dx: 0, dy: 0 }); }, 700);
    }
  };

  const onDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!r || picked) return;
    setDragging(true);
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    setDragOffset({ dx: e.clientX - start.current.x, dy: e.clientY - start.current.y });
    setHotBox(hitTest(e.clientX, e.clientY));
  };
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    setDragging(false);
    const target = hitTest(e.clientX, e.clientY);
    setHotBox(null);
    if (!target) { setDragOffset({ dx: 0, dy: 0 }); return; }
    void pick(target);
  };

  if (finished) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/30" />
        <button onClick={onNext} className="relative z-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Nice sorting! {score}/{total} ⭐ Next</button>
      </div>
    );
  }

  const imgs = isPair(r!.img) ? r!.img : [r!.img];
  const label = isPair(r!.who) ? `${CAST[r!.who[0]].name} and ${CAST[r!.who[1]].name}` : CAST[r!.who].name;
  const sayLine = isPair(r!.who) ? `We are ${r!.emotion}.` : `I am ${r!.emotion}.`;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between bg-cover bg-center px-4 py-4" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="relative z-20 mt-2 max-w-[92%] rounded-full bg-white/95 px-5 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">{scene.teacher} <span className="ml-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{round + 1}/{total}</span></div>
      <button
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        disabled={!!picked}
        aria-label={`Drag ${label} to He, She, or They`}
        className="relative z-10 flex touch-none select-none flex-col items-center border-0 bg-transparent p-0 disabled:cursor-default"
        style={{
          transform: dragging ? `translate(${dragOffset.dx}px, ${dragOffset.dy}px) scale(1.1)` : undefined,
          transition: dragging ? 'none' : 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
          animation: picked && !correct ? 'lep1-shake 0.4s ease-out' : undefined,
        }}
      >
        <div className="flex items-end">
          {imgs.map((src, i) => (
            <img key={i} src={src} alt={label} draggable={false} className={`pointer-events-none h-40 w-40 object-contain drop-shadow-2xl sm:h-52 sm:w-52 ${i > 0 ? '-ml-6' : ''}`} />
          ))}
        </div>
        <div className="pointer-events-none mt-2 rounded-full bg-white/95 px-4 py-1 text-lg font-black text-slate-700">“{sayLine}”</div>
      </button>
      <div className="relative z-10 flex w-full max-w-lg gap-3 pb-2">
        {PRONOUN_BINS.map((p) => (
          <div key={p} ref={(el) => { boxRefs.current[p] = el; }}
            className={`flex-1 rounded-3xl border-4 border-white py-6 text-center text-2xl font-black text-white shadow-2xl transition sm:py-8 sm:text-3xl ${hotBox === p ? 'scale-110 ring-4 ring-white' : ''} ${picked === p ? (correct ? 'ring-4 ring-green-300 scale-105' : '') : ''}`}
            style={{ background: `linear-gradient(135deg, ${PRONOUN_COLOR[p]}, ${PRONOUN_COLOR[p]}cc)` }}
          >{p}</div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Roleplay ---------- */

function RoleplayScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'roleplay' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { step: -1, awaitingRepeat: false, gemDone: false });
  const { step, awaitingRepeat, gemDone } = state;
  // Whether THIS side runs the self-driving script at all — the mirror side
  // renders whatever step/awaitingRepeat it receives instead of running its
  // own independent copy, since two independently-timed scripts would
  // immediately drift out of sync with each other.
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;
  const stopRef = useRef(false);
  const runRef = useRef<((i: number) => void) | null>(null);

  useEffect(() => {
    if (isRemoteMirror) return;
    stopRef.current = false;
    async function run(i: number) {
      if (stopRef.current) return;
      if (i >= scene.script.length) { setState((s) => ({ ...s, step: scene.script.length })); return; }
      setState((s) => ({ ...s, step: i }));
      const line = scene.script[i];
      await new Promise((r) => setTimeout(r, 350));
      if (stopRef.current) return;
      await safeSpeak(line.line, voiceOf(line.who));
      if (stopRef.current) return;
      if (line.repeat) setState((s) => ({ ...s, awaitingRepeat: true }));
      else { await new Promise((r) => setTimeout(r, 500)); run(i + 1); }
    }
    runRef.current = run;
    run(0);
    return () => { stopRef.current = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id, isRemoteMirror]);

  // Mirror side isn't running the script, so it needs its own cue to speak
  // each line as the synced `step` advances instead of staying silent.
  const lastSpokenStepRef = useRef(-2);
  useEffect(() => {
    if (!isRemoteMirror) return;
    if (step < 0 || step >= scene.script.length || lastSpokenStepRef.current === step) return;
    lastSpokenStepRef.current = step;
    const line = scene.script[step];
    void safeSpeak(line.line, voiceOf(line.who));
  }, [isRemoteMirror, step, scene.script]);

  const confirmRepeat = () => {
    if (!awaitingRepeat || isRemoteMirror) return;
    if (!gemDone) onWin(true);
    setState((s) => ({ ...s, awaitingRepeat: false, gemDone: true }));
    const next = step + 1;
    setTimeout(() => runRef.current?.(next), 250);
  };

  // bg-together.png paints both characters directly into the street (per
  // the art style contract's "never a pasted cut-out" rule for a scene
  // where they talk face to face), so only the bubble's anchor point needs
  // to roughly match where each of them stands in that painting — no
  // character image is rendered here.
  // bg-classroom-circle paints Pip and Miss Marigold facing each other on
  // the rug (left/right), with the other classmates gathered behind them —
  // only the two dialogue leads need a precise bubble anchor.
  // bg-classroom-peers paints Pip and Leo facing each other left/right
  // (added for Lesson 4's peer-to-peer roleplay per lesson-quality-gate's
  // Semantic pass — bg-classroom-circle never actually painted Leo).
  // mia/bella/willow still default to center — no roleplay scene uses them
  // as a speaker on a background that doesn't paint them yet; fix the same
  // way (a dedicated bg + a real anchor here) before ever doing so.
  // Flex justify (not a raw left:% + translateX) so the bubble is clamped by
  // inset-x-4 on every viewport — a long line anchored toward an edge can't
  // get clipped by this scene's overflow-hidden container on narrow phones.
  const bubbleAlign: Record<CharKey, 'start' | 'center' | 'end'> = { pip: 'start', marigold: 'end', mia: 'center', bella: 'center', willow: 'center', leo: 'end' };
  const current = step >= 0 && step < scene.script.length ? scene.script[step] : null;
  const replayCurrent = () => { if (current) void safeSpeak(current.line, voiceOf(current.who)); };

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-6 top-6 flex flex-col gap-2">
        <span className="w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">Roleplay · Say Hello</span>
        <span className="w-fit rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">Listen · Repeat · Play</span>
      </div>
      {current && <button onClick={replayCurrent} className="absolute right-6 top-6 z-30 flex items-center gap-2 rounded-full bg-white/95 px-5 py-3 text-sm font-black uppercase tracking-widest text-orange-700 shadow-2xl ring-2 ring-orange-200 active:scale-95" aria-label="Repeat what the character said">🔁 Play again</button>}
      {current && !awaitingRepeat && (
        <div
          className={`absolute inset-x-4 top-[30%] z-20 flex transition-all duration-300 ${
            bubbleAlign[current.who] === 'start' ? 'justify-start' : bubbleAlign[current.who] === 'end' ? 'justify-end' : 'justify-center'
          }`}
        >
          <div className="relative max-w-[420px] rounded-3xl bg-white px-5 py-3 text-center text-xl font-black text-orange-800 shadow-2xl sm:text-2xl">“{current.line}”</div>
        </div>
      )}
      {awaitingRepeat && current && (
        <>
          <div className="absolute inset-0 z-20 bg-black/35 backdrop-blur-[2px]" />
          <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
            <div className="relative w-full max-w-xl rounded-[36px] bg-white p-7 text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)] ring-4 ring-orange-300">
              <div className="mb-2 text-[11px] font-black uppercase tracking-[0.25em] text-orange-500">Your turn!</div>
              <div className="relative mx-auto mb-3 flex h-24 w-24 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-orange-400/40 animate-ping" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-4xl shadow-xl">🎤</div>
              </div>
              <div className="text-sm font-bold uppercase tracking-widest text-neutral-500">Say it like {CAST[current.who].name}</div>
              <div className="mt-1 text-3xl font-black text-orange-700 sm:text-4xl">“{current.line}”</div>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button onClick={replayCurrent} className="flex items-center gap-2 rounded-full bg-orange-100 px-5 py-3 text-sm font-black uppercase tracking-widest text-orange-700 ring-2 ring-orange-200 active:scale-95">🔁 Hear again</button>
                <button onClick={confirmRepeat} className="flex items-center gap-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-7 py-3 text-base font-black uppercase tracking-widest text-white shadow-xl active:scale-95">✅ I said it</button>
              </div>
            </div>
          </div>
        </>
      )}
      {step >= scene.script.length && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-orange-500 px-8 py-4 text-base font-black uppercase tracking-widest text-white shadow-2xl active:scale-95">✨ Next</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Join stage ---------- */

function JoinStageScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'join-stage' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { turnIdx: 0, gemDone: false, onStage: null as CallRole | null });
  const { turnIdx, gemDone } = state;
  // No camera of its own: whoever is dragged here from the call tiles is
  // shown (synced), see LiveStageFrame.
  const onStage = state.onStage ?? null;
  const placeOnStage = (role: CallRole | null) => setState((s) => ({ ...s, onStage: role }));
  const canControl = !sync?.isSynced || sync.isAuthority;
  const { over, dropProps } = useStageDrop(placeOnStage);

  const currentTurn = turnIdx < scene.turns.length ? scene.turns[turnIdx] : null;
  const isStudentTurn = currentTurn?.who === 'student';
  const isFriendTurn = !!currentTurn && !isStudentTurn;
  const friendKey = isFriendTurn ? (currentTurn!.who as CharKey) : null;
  const friendMeta = friendKey ? CAST[friendKey] : null;
  const done = turnIdx >= scene.turns.length;

  useEffect(() => { if (isFriendTurn && friendKey && currentTurn) cueSpeakOnce(currentTurn.line, voiceOf(friendKey)); }, [turnIdx, isFriendTurn, friendKey]);

  const advance = () => {
    const awardGem = isStudentTurn && !gemDone;
    if (awardGem) onWin(true);
    setState((s) => ({ ...s, turnIdx: s.turnIdx + 1, gemDone: s.gemDone || awardGem }));
  };

  return (
    <div className="absolute inset-0 overflow-hidden select-none" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.05) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-6 top-6 z-20 flex flex-col gap-2">
        <span className="w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">Live Stage · Your Turn</span>
        <span className="w-fit rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">🎤 Listen · Answer · Talk</span>
      </div>
      {currentTurn && isFriendTurn && (
        <div className="absolute inset-x-0 top-20 z-30 flex justify-center px-4">
          <div className="max-w-[720px] rounded-[28px] bg-white px-8 py-5 text-center shadow-[0_30px_80px_rgba(0,0,0,0.35)] ring-4 ring-orange-200">
            <div className="mb-1 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.25em]" style={{ color: friendMeta?.color ?? '#FE6A2F' }}><span className="text-lg">{friendMeta?.emoji ?? '🎓'}</span> {friendMeta?.name ?? 'Teacher'} asks</div>
            <div className="text-3xl font-black text-orange-800 sm:text-4xl">“{currentTurn.line}”</div>
            {friendKey && <button onClick={() => cueSpeakOnce(currentTurn.line, voiceOf(friendKey))} className="mt-3 mr-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-700 ring-2 ring-orange-300 shadow active:scale-95">🔊 Hear again</button>}
            <button onClick={advance} className="mt-3 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-7 py-3 text-sm font-black uppercase tracking-widest text-white shadow-xl active:scale-95">🎤 My turn</button>
          </div>
        </div>
      )}
      {currentTurn && isStudentTurn && (
        <div className="absolute inset-x-0 top-20 z-40 flex justify-center px-4">
          <div className="w-full max-w-[700px] rounded-[32px] bg-white p-6 text-center shadow-[0_30px_80px_rgba(0,0,0,0.4)] ring-4 ring-orange-300">
            <div className="text-[11px] font-black uppercase tracking-[0.25em] text-orange-500">Your turn — say it!</div>
            <div className="mt-1 text-3xl font-black text-orange-700 sm:text-4xl">“{currentTurn.line}”</div>
            <button onClick={advance} className="mt-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-7 py-3 text-base font-black uppercase tracking-widest text-white shadow-xl active:scale-95">✅ I answered</button>
          </div>
        </div>
      )}
      <div className="absolute left-1/2 z-30" style={{ top: '62%', transform: 'translate(-50%, -50%)' }}>
        <div {...dropProps} className={`relative flex items-center justify-center overflow-hidden rounded-full border-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.5)] transition-all ${isStudentTurn ? 'border-orange-400 ring-8 ring-orange-300/70' : 'border-white/95 ring-4 ring-white/40'}`} style={{ width: 'clamp(300px, calc(46*var(--svw,1vw)), 500px)', height: 'clamp(300px, calc(46*var(--svw,1vw)), 500px)', background: 'linear-gradient(135deg, #FE6A2F, #FEBE4C)' }}>
          <LiveStageFill onStage={onStage} onPlace={placeOnStage} over={over} canControl={canControl} />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '-48px' }}>
          <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 shadow-2xl ring-4 ring-white transition-transform ${isStudentTurn ? 'scale-110' : ''}`} style={{ width: 96, height: 96 }}>
            {isStudentTurn && <span className="absolute inset-0 rounded-full bg-orange-400/50 animate-ping" />}
            <span className="relative text-5xl drop-shadow-md">🎤</span>
          </div>
        </div>
      </div>
      {done && <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center"><button onClick={onNext} className="rounded-full bg-orange-500 px-8 py-4 text-base font-black uppercase tracking-widest text-white shadow-2xl active:scale-95">✨ Next</button></div>}
    </div>
  );
}

/* ---------- Hello doors ---------- */

function HelloDoorsScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'hello-doors' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    order: scene.cast as CharKey[],
    openIdx: null as number | null,
    wrongIdx: null as number | null,
    phase: 'reveal' as 'reveal' | 'shuffle' | 'prompt' | 'greet' | 'echo' | 'done',
    score: 0,
    gemDone: false,
  });
  const { round, order, openIdx, wrongIdx, phase, score, gemDone } = state;
  // The reveal/shuffle/prompt sequence below uses Math.random() — running it
  // independently on both screens would shuffle the doors differently on
  // each, so only the authority side runs it; the mirror just renders
  // whatever order/phase it receives.
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;
  const answeredRef = useRef(false);
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;
  // Door count follows the cast size (this world has only 2 characters, not
  // the 3-4 of the Little Explorers roster), so each round has exactly one
  // correct door.
  const doorPositions = scene.cast.length === 2 ? [30, 70] : scene.cast.length === 3 ? [17, 50, 83] : scene.cast.map((_, i) => 12 + (76 * i) / Math.max(1, scene.cast.length - 1));

  const shuffle = (arr: CharKey[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  useEffect(() => {
    if (isRemoteMirror) return;
    if (!r) return;
    let cancelled = false;
    answeredRef.current = false;
    setState((s) => ({ ...s, openIdx: null, wrongIdx: null }));
    (async () => {
      if (round === 0) {
        setState((s) => ({ ...s, order: scene.cast, phase: 'reveal' }));
        for (const who of scene.cast) { await safeSpeak(CAST[who].name, voiceOf(who)); if (cancelled) return; }
        await new Promise((res) => setTimeout(res, 400));
        if (cancelled) return;
      }
      setState((s) => ({ ...s, phase: 'shuffle' }));
      if (cancelled) return;
      for (let k = 0; k < 3; k++) {
        setState((s) => ({ ...s, order: shuffle(s.order) }));
        await new Promise((res) => setTimeout(res, 420));
        if (cancelled) return;
      }
      await new Promise((res) => setTimeout(res, 200));
      if (cancelled) return;
      setState((s) => ({ ...s, phase: 'prompt' }));
      await new Promise((res) => setTimeout(res, 200));
      await safeSpeak(r.prompt, voiceOf(r.target));
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, isRemoteMirror]);

  // Mirror side isn't running the reveal/shuffle sequence, so it needs its
  // own cue to speak the round's prompt once the synced phase reaches it.
  const lastPromptRoundRef = useRef(-1);
  useEffect(() => {
    if (!isRemoteMirror || !r || phase !== 'prompt' || lastPromptRoundRef.current === round) return;
    lastPromptRoundRef.current = round;
    void safeSpeak(r.prompt, voiceOf(r.target));
  }, [isRemoteMirror, phase, round, r]);

  const tap = async (idx: number) => {
    if (!r || answeredRef.current || isRemoteMirror) return;
    const who = order[idx];
    if (who !== r.target) {
      setState((s) => ({ ...s, wrongIdx: idx }));
      sfx.wrong(); onLose();
      window.setTimeout(() => setState((s) => ({ ...s, wrongIdx: null })), 500);
      return;
    }
    answeredRef.current = true;
    setState((s) => ({ ...s, openIdx: idx, phase: 'greet' }));
    sfx.match();
    await new Promise((res) => setTimeout(res, 500));
    await safeSpeak(r.helloLine, voiceOf(who));
    setState((s) => ({ ...s, phase: 'echo' }));
    await new Promise((res) => setTimeout(res, 250));
    await safeSpeak(r.echoLine, voiceOf(r.target));
    setState((s) => ({ ...s, score: s.score + 1 }));
    await new Promise((res) => setTimeout(res, 1400));
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) sfx.gem();
    if (awardGem) onWin(true);
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || awardGem }));
  };

  if (finished) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="rounded-3xl bg-white px-8 py-4 text-center shadow-2xl">
            <div className="text-2xl font-black text-orange-700">🎉 Wonderful hellos!</div>
            <div className="text-lg font-bold text-neutral-700">You greeted every friend! {score}/{total}</div>
          </div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/50" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-6 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur sm:text-xl">
        {r!.prompt}<span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </div>
      <button onClick={() => cueSpeak(r!.prompt, voiceOf(r!.target))} className="absolute right-4 top-4 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>
      {phase === 'echo' && <div className="pointer-events-none absolute left-1/2 top-24 z-40 -translate-x-1/2 rounded-3xl bg-white px-6 py-4 text-2xl font-black text-orange-600 shadow-2xl ring-4 ring-orange-200">🎤 {r!.echoLine}</div>}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
      {/* scene.bg already paints the cubby doors themselves — this world has
          no per-character illustration, so a name+emoji badge stands in for
          the door-opening reveal instead of a floating character image. */}
      <div className={`absolute inset-0 z-10 ${phase === 'shuffle' ? 'animate-[lep1-shuffleShake_0.42s_ease-in-out_infinite]' : ''}`}>
        {doorPositions.map((left, i) => {
          const who = order[i];
          const c = CAST[who];
          const isOpen = openIdx === i || phase === 'reveal';
          const isWrong = wrongIdx === i;
          const showBadge = openIdx === i || phase === 'reveal';
          return (
            <div key={i} className="absolute bottom-[8%] top-[8%]" style={{ left: `${left}%`, transform: 'translateX(-50%)', width: '28%', maxWidth: 320 }}>
              <div className="pointer-events-none absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2 transition-all duration-300" style={{ opacity: showBadge ? 1 : 0, transform: `translateY(${showBadge ? '0' : '10px'})` }}>
                <span className="grid h-20 w-20 place-items-center rounded-full text-4xl shadow-2xl ring-4 ring-white" style={{ background: `${c.color}33` }}>{c.emoji}</span>
                <span className="whitespace-nowrap rounded-2xl bg-white px-4 py-2 text-lg font-black shadow-xl ring-2 ring-white" style={{ color: c.color }}>{c.name}</span>
                {(phase === 'greet' || phase === 'echo') && openIdx === i && <span className="max-w-[220px] whitespace-normal rounded-2xl bg-white px-4 py-2 text-center text-sm font-black text-neutral-800 shadow-xl ring-2 ring-white">{r!.helloLine}</span>}
              </div>
              <button onClick={() => tap(i)} disabled={answeredRef.current || phase !== 'prompt'} aria-label={`Cubby ${i + 1}`} className={`absolute inset-0 rounded-3xl transition-transform active:scale-95 ${isWrong ? 'animate-[lep1-shake_0.5s]' : ''} ${isOpen ? 'ring-4' : ''}`} style={{ ['--tw-ring-color' as string]: c.color }}>
                {isWrong && <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center text-7xl font-black text-red-500 drop-shadow-lg">✗</div>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Flipbook ---------- */

function FlipbookScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'flipbook' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  // `solved` is a plain number[] (not a Set) so it survives the JSON
  // broadcast round-trip.
  const [state, setState] = useSyncedState(sync, {
    pageIdx: 0,
    flipping: false,
    checkpoint: null as (typeof scene.checkpoints)[number] | null,
    solved: [] as number[],
    wrongPick: null as string | null,
    done: false,
  });
  const { pageIdx, flipping, checkpoint, solved, wrongPick, done } = state;
  const solvedSet = useMemo(() => new Set(solved), [solved]);
  const gemDone = useRef(false);
  const page = scene.pages[pageIdx];
  const total = scene.pages.length;

  useEffect(() => { if (page) cueSpeakOnce(page.text, page.who ? voiceOf(page.who) : 'teacher'); }, [pageIdx]);

  const advance = () => {
    setState((s) => ({ ...s, flipping: true }));
    sfx.click();
    window.setTimeout(() => {
      if (pageIdx + 1 >= total) {
        setState((s) => ({ ...s, flipping: false, done: true }));
        if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
      } else {
        setState((s) => ({ ...s, flipping: false, pageIdx: s.pageIdx + 1 }));
      }
    }, 450);
  };

  const turnPage = () => {
    if (flipping || checkpoint || done) return;
    const pending = scene.checkpoints.find((c) => c.afterPage === pageIdx && !solvedSet.has(c.afterPage));
    if (pending) { setState((s) => ({ ...s, checkpoint: pending })); return; }
    advance();
  };

  const answer = (choice: string) => {
    if (!checkpoint) return;
    if (choice !== checkpoint.answer) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrongPick: choice }));
      window.setTimeout(() => setState((s) => ({ ...s, wrongPick: null })), 450);
      return;
    }
    sfx.match();
    setState((s) => ({
      ...s,
      solved: s.solved.includes(checkpoint.afterPage) ? s.solved : [...s.solved, checkpoint.afterPage],
      checkpoint: null,
    }));
    advance();
  };

  const sparkles = useMemo(
    () => Array.from({ length: 22 }, (_, i) => ({
      left: `${(i * 37) % 100}%`,
      top: `${(i * 53) % 100}%`,
      size: 3 + (i % 4) * 2,
      dur: 2200 + (i % 5) * 500,
      delay: (i % 7) * 300,
    })),
    [],
  );

  if (done) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 backdrop-blur-sm" />
        <Confetti count={60} />
        <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">
          <p className="max-w-md text-2xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] sm:text-3xl">{scene.pages[scene.pages.length - 1]?.text}</p>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl ring-4 ring-white/50 active:scale-95" style={{ animation: 'lep1-slide-up 0.4s ease-out' }}>
            📖 The End! Next →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at center 45%, rgba(20,10,45,0.15) 0%, rgba(10,5,30,0.55) 70%, rgba(5,2,18,0.78) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {sparkles.map((s, i) => (
          <span key={i} className="absolute rounded-full bg-amber-200" style={{ left: s.left, top: s.top, width: s.size, height: s.size, boxShadow: '0 0 8px 2px rgba(255,224,140,0.9)', animation: `lep1-twinkle ${s.dur}ms ease-in-out ${s.delay}ms infinite` }} />
        ))}
      </div>
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-100/95 via-white/95 to-amber-100/95 px-5 py-2 text-center text-sm font-black text-orange-800 shadow-xl backdrop-blur ring-1 ring-amber-300/70 sm:text-base">
        ✦ {scene.title} ✦ <span className="ml-1 opacity-60">({pageIdx + 1}/{total})</span>
      </div>

      {/* Storybook page: one full illustration per beat, framed like a
          page from a picture book — not chopped into comic/manga panels.
          That multi-panel layout was tried this session (diagonal hero +
          3 side panels, then an all-rectangle bordered grid) and reported
          as not looking good as a manga; the simpler single-illustration
          page reads better for this engine's one-beat-per-page unit and
          lets each full generated illustration (see mc-storybook/-2's
          story*-p*-main.png) be seen in full rather than sliced up. Still
          fills the whole lesson frame edge-to-edge (not a small centered
          card with dead margins) per the earlier "it should fit" note. */}
      {/* The story text lives ON the illustration itself — a caption band
          across the bottom of the framed picture, the way a real picture
          book prints its text over (or right under, inset into) the art
          on the same page — not as a second stacked block below the image.
          A separate below-image text row could grow past 1 line and, in a
          shorter embedded frame (e.g. the live classroom's scaled stage),
          get pushed below the visible area entirely. Keeping it INSIDE the
          same bounded, aspect-capped box as the art guarantees it's always
          on screen, whatever the surrounding frame's height is. */}
      <div onClick={turnPage} className="absolute inset-0 z-10 flex cursor-pointer select-none items-center justify-center overflow-hidden p-[2%]">
        <div
          key={pageIdx}
          className="relative w-full select-none overflow-hidden rounded-2xl"
          style={{
            aspectRatio: '16 / 10',
            maxHeight: '100%',
            boxShadow: '0 0 0 6px #FFF2D0, 0 0 0 9px #C9932F, 0 10px 30px rgba(0,0,0,0.45)',
            opacity: flipping ? 0 : 1,
            transform: flipping ? 'scale(0.96)' : 'scale(1)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          <img src={page.img} alt="" className="h-full w-full object-cover" />
          {/* Large, high-contrast story text — A1 students CAN read (unlike
              Pre-A1, which has no reading segment at all — see
              project_manga_panel_layout_a1_plus_only), so this sentence is
              the actual reading-practice target of the scene, not just a
              caption for the picture. */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#FFF2D0] via-[#FFF2D0]/97 to-[#FFF2D0]/0 px-4 pb-3 pt-10 text-center sm:px-6 sm:pb-4">
            <p className="mx-auto max-w-[94%] text-lg font-black leading-snug text-orange-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)] sm:text-2xl">{page.text}</p>
            {page.who && <span className="mt-1 block text-[11px] font-black uppercase tracking-widest text-amber-700 sm:text-xs">— {CAST[page.who].name}</span>}
          </div>
          {!flipping && (
            <div className="pointer-events-none absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-lg text-white shadow-xl ring-2 ring-white/70 animate-pulse sm:h-12 sm:w-12 sm:text-xl">▶</div>
          )}
        </div>
      </div>

      {checkpoint && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 px-6" style={{ animation: 'lep1-pop 0.3s ease-out' }}>
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#FFFBF0] to-[#FFF2D0] p-6 text-center shadow-2xl ring-4 ring-amber-300/70">
            <span className="mx-auto mb-2 block text-5xl">{CAST[checkpoint.who].emoji}</span>
            <div className="mb-1 text-3xl">🤔</div>
            <p className="mb-4 text-xl font-black text-orange-900">{checkpoint.question}</p>
            <div className="flex flex-col gap-2">
              {checkpoint.options.map((opt) => (
                <button key={opt} onClick={() => answer(opt)}
                  className={`rounded-2xl border-4 border-white py-3 text-lg font-black text-white shadow-lg transition active:scale-95 ${wrongPick === opt ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}
                  style={{ background: 'linear-gradient(135deg,#FE6A2F,#FF8A4C)' }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Song ---------- */

function SongScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'song' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [status, setStatus] = useState<'idle' | 'playing' | 'done' | 'error'>('idle');
  const [idx, setIdx] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const totalLines = scene.lyrics.length;
  const totalDuration = scene.durationSeconds ?? 30;

  const playSong = async () => {
    if (!scene.songUrl) { setStatus('error'); return; }
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.src = scene.songUrl;
    audio.currentTime = 0;
    audio.onended = () => { setStatus('done'); setIdx(totalLines - 1); if (rafRef.current) cancelAnimationFrame(rafRef.current); onWin(true); };
    try {
      await audio.play();
      setStatus('playing'); setIdx(0);
      const dur = () => (isFinite(audio.duration) && audio.duration > 0 ? audio.duration : totalDuration);
      // Real per-line cue START times (seconds) when the song was generated with them
      // — falls back to evenly dividing the audio's total length for older songs that
      // predate lineDurationsMs (see the field's own comment in scenes.ts for why even
      // division drifts out of sync with real sung pacing).
      let cueStarts: number[] | null = null;
      if (scene.lineDurationsMs) {
        cueStarts = [];
        let acc = 0;
        for (const ms of scene.lineDurationsMs) { cueStarts.push(acc); acc += ms / 1000; }
      }
      const tick = () => {
        if (!audioRef.current) return;
        const t = audioRef.current.currentTime;
        let i: number;
        if (cueStarts) {
          i = 0;
          for (let k = 0; k < cueStarts.length; k++) { if (t >= cueStarts[k]) i = k; }
        } else {
          const perLine = dur() / totalLines;
          i = Math.min(totalLines - 1, Math.floor(t / perLine));
        }
        setIdx(i);
        if (!audioRef.current.paused && !audioRef.current.ended) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch { setStatus('error'); }
  };

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; } }, []);

  const current = idx >= 0 ? scene.lyrics[idx] : null;
  const isPlaying = status === 'playing';
  const isDone = status === 'done';

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)' }} />
      <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-white/85 px-5 py-2 text-lg font-black text-[#FE6A2F] shadow-lg backdrop-blur-md ring-2 ring-white/70">{scene.title}</div>
      {isPlaying && (
        <div className="pointer-events-none absolute inset-0">
          {['🎵', '🎶', '🎵', '🎶', '🎵'].map((n, i) => <span key={i} className="absolute text-3xl" style={{ left: `${10 + i * 18}%`, bottom: '45%', animation: `lep1-noteFloat ${3 + (i % 3)}s ease-in-out ${i * 0.4}s infinite` }}>{n}</span>)}
        </div>
      )}
      <div className="absolute left-1/2 w-[94%] max-w-5xl -translate-x-1/2 rounded-[2rem] bg-white/95 p-8 text-center shadow-2xl ring-8 ring-[#FE6A2F]/40 backdrop-blur-md" style={{ top: 'calc(40*var(--svh,1vh))', zIndex: 15 }}>
        {status === 'error' ? (
          <div className="text-xl font-bold text-red-600">Song unavailable — try again in a moment.</div>
        ) : current ? (
          <>
            <div className="mb-3 text-sm font-black uppercase tracking-widest text-[#FE6A2F] sm:text-base">🎤 {CAST[current.who]?.name.toUpperCase() ?? current.who.toUpperCase()} sings</div>
            <div key={idx} className="font-black leading-tight text-slate-800" style={{ fontSize: 'clamp(28px, calc(5*var(--svw,1vw)), 64px)', animation: 'lep1-lyricPop 0.4s ease-out' }}>{current.text}</div>
            <div className="mt-5 flex justify-center gap-2">
              {scene.lyrics.map((_, i) => <span key={i} className={`h-3 w-10 rounded-full ${i <= idx ? 'bg-[#FE6A2F]' : 'bg-slate-200'}`} />)}
            </div>
          </>
        ) : isDone ? (
          <div className="text-3xl font-black text-slate-700">Amazing singing! 🎉</div>
        ) : (
          <div className="text-3xl font-black text-slate-700">Ready to sing? Tap ▶️ Play the Song</div>
        )}
      </div>
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
        {(status === 'idle' || status === 'done' || status === 'error') && (
          <button onClick={playSong} className="rounded-full bg-[#FE6A2F] px-6 py-3 text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95">
            {status === 'done' ? '🔁 Sing Again' : status === 'error' ? '🔁 Retry' : '▶️ Play the Song'}
          </button>
        )}
        {isDone && <button onClick={onNext} className="rounded-full bg-emerald-500 px-6 py-3 text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95">Continue ➜</button>}
        {status === 'error' && <button onClick={onNext} className="rounded-full bg-slate-400 px-6 py-3 text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95">Skip ➜</button>}
      </div>
    </div>
  );
}

/* ---------- Sound model (phonics: listen + explore anchor words) ---------- */

function SoundModelScene({ scene, onNext, sync }: { scene: Extract<Scene, { kind: 'sound-model' }>; onNext: () => void; sync?: ActivitySync }) {
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

/* ---------- Trace (finger-trace the letter) ---------- */

type TraceSegment = { from: { x: number; y: number }; to: { x: number; y: number } };
const TRACE_SEGMENTS: Record<string, TraceSegment[]> = {
  S: [{ from: { x: 400, y: 175 }, to: { x: 200, y: 175 } }, { from: { x: 200, y: 175 }, to: { x: 200, y: 295 } }, { from: { x: 200, y: 295 }, to: { x: 400, y: 295 } }, { from: { x: 400, y: 295 }, to: { x: 400, y: 415 } }, { from: { x: 400, y: 415 }, to: { x: 200, y: 415 } }],
  A: [{ from: { x: 300, y: 130 }, to: { x: 150, y: 470 } }, { from: { x: 300, y: 130 }, to: { x: 450, y: 470 } }, { from: { x: 205, y: 340 }, to: { x: 395, y: 340 } }],
  T: [{ from: { x: 150, y: 150 }, to: { x: 450, y: 150 } }, { from: { x: 300, y: 150 }, to: { x: 300, y: 470 } }],
  L: [{ from: { x: 220, y: 130 }, to: { x: 220, y: 470 } }, { from: { x: 220, y: 470 }, to: { x: 430, y: 470 } }],
  W: [{ from: { x: 120, y: 150 }, to: { x: 210, y: 460 } }, { from: { x: 210, y: 460 }, to: { x: 300, y: 260 } }, { from: { x: 300, y: 260 }, to: { x: 390, y: 460 } }, { from: { x: 390, y: 460 }, to: { x: 480, y: 150 } }],
};
const TRACE_HIT_RADIUS = 72;
const TRACE_BUCKETS_PER_SEGMENT = 16;
const TRACE_MIN_SEGMENT_COVERAGE = 0.38;

function TraceScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'trace' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [done, setDone] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [strokes, setStrokes] = useState<string[]>([]);
  const currentPath = useRef<string>('');

  const segments = TRACE_SEGMENTS[scene.letter.toUpperCase()] ?? TRACE_SEGMENTS.T;
  const segmentBuckets = useRef<Set<number>[]>(segments.map(() => new Set<number>()));
  const [zonesDone, setZonesDone] = useState(0);

  useEffect(() => {
    segmentBuckets.current = segments.map(() => new Set<number>());
    setZonesDone(0); setStrokes([]); setDone(false);
  }, [scene.id]);

  const localPoint = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * 600, y: ((e.clientY - rect.top) / rect.height) * 600 };
  };
  const segmentHit = (p: { x: number; y: number }, s: TraceSegment) => {
    const vx = s.to.x - s.from.x, vy = s.to.y - s.from.y;
    const lenSq = vx * vx + vy * vy;
    const rawT = lenSq === 0 ? 0 : ((p.x - s.from.x) * vx + (p.y - s.from.y) * vy) / lenSq;
    const t = Math.max(0, Math.min(1, rawT));
    const closest = { x: s.from.x + vx * t, y: s.from.y + vy * t };
    return { t, distance: Math.hypot(p.x - closest.x, p.y - closest.y) };
  };
  const start = (e: React.PointerEvent) => {
    if (done) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrawing(true);
    const p = localPoint(e);
    lastPoint.current = p;
    currentPath.current = `M ${p.x} ${p.y}`;
    setStrokes((s) => [...s, currentPath.current]);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing || done) return;
    const p = localPoint(e);
    const last = lastPoint.current;
    if (!last) return;
    const dx = p.x - last.x, dy = p.y - last.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 3) return;
    lastPoint.current = p;
    currentPath.current += ` L ${p.x} ${p.y}`;
    setStrokes((s) => { const copy = [...s]; copy[copy.length - 1] = currentPath.current; return copy; });
    let changed = false;
    const samples = Math.max(1, Math.ceil(dist / 12));
    for (let step = 0; step <= samples; step += 1) {
      const t = step / samples;
      const sample = { x: last.x + dx * t, y: last.y + dy * t };
      let best: { i: number; t: number; distance: number } | undefined;
      for (let i = 0; i < segments.length; i += 1) {
        const hit = segmentHit(sample, segments[i]);
        if (!best || hit.distance < best.distance) best = { i, ...hit };
      }
      if (best && best.distance <= TRACE_HIT_RADIUS) {
        const bucket = Math.max(0, Math.min(TRACE_BUCKETS_PER_SEGMENT - 1, Math.floor(best.t * TRACE_BUCKETS_PER_SEGMENT)));
        const before = segmentBuckets.current[best.i].size;
        segmentBuckets.current[best.i].add(bucket);
        if (segmentBuckets.current[best.i].size !== before) changed = true;
      }
    }
    const doneCount = segmentBuckets.current.filter((set) => set.size / TRACE_BUCKETS_PER_SEGMENT >= TRACE_MIN_SEGMENT_COVERAGE).length;
    if (changed) setZonesDone(doneCount);
    if (doneCount >= segments.length && !done) {
      setDone(true); sfx.gem(); onWin(true);
      void playLetterPhonic(scene.letter).then(() => safeSpeak(scene.word, voiceOf(scene.who)));
    }
  };
  const end = () => { setDrawing(false); lastPoint.current = null; };
  const reset = () => { setStrokes([]); segmentBuckets.current = segments.map(() => new Set<number>()); setZonesDone(0); setDone(false); };

  const pct = Math.round((zonesDone / segments.length) * 100);
  const c = CAST[scene.who];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">✍️ {scene.teacher}</div>
      <div className="relative z-10 flex w-full max-w-[560px] flex-col items-center px-4">
        <div className="relative aspect-square w-full touch-none rounded-3xl border-4 border-white/60 bg-white/25 shadow-2xl backdrop-blur" style={{ boxShadow: done ? `0 0 60px ${c.color}aa` : undefined }}>
          <svg ref={svgRef} viewBox="0 0 600 600" className="h-full w-full select-none" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
            <text x="300" y="470" textAnchor="middle" fontSize="520" fontWeight="900" fontFamily="system-ui, sans-serif" fill="none" stroke={c.color} strokeWidth="12" strokeDasharray="18 14" opacity="0.85">{scene.letter}</text>
            <text x="300" y="470" textAnchor="middle" fontSize="520" fontWeight="900" fontFamily="system-ui, sans-serif" fill={c.color} opacity={pct / 100}>{scene.letter}</text>
            {strokes.map((d, i) => <path key={i} d={d} fill="none" stroke="white" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />)}
          </svg>
          <div className="pointer-events-none absolute inset-x-4 bottom-3 h-3 overflow-hidden rounded-full bg-white/50">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${c.color}, #fff)` }} />
          </div>
        </div>
        <div className="mt-4 flex w-full items-center gap-2">
          <button onClick={reset} className="flex-1 rounded-full bg-white/95 py-3 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🧽 Erase</button>
          <button onClick={() => { void playLetterPhonic(scene.letter); }} className="flex-1 rounded-full bg-white/95 py-3 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔊 Listen</button>
        </div>
        <button
          onClick={() => { if (!done) { setDone(true); sfx.gem(); onWin(true); void playLetterPhonic(scene.letter).then(() => safeSpeak(scene.word, voiceOf(scene.who))); } onNext(); }}
          className="mt-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-3 text-lg font-black text-white shadow-2xl active:scale-95"
        >
          Great tracing! ⭐ Next
        </button>
      </div>
    </div>
  );
}

/* ---------- Word build (blend taught sounds into a real word) ---------- */

function WordBuildScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'word-build' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, filled: null as string | null, wrong: null as string | null, gemDone: false });
  const { round, filled, wrong, gemDone } = state;
  const r = scene.rounds[round];
  const total = scene.rounds.length;
  const complete = round >= total;

  useEffect(() => {
    if (complete) return;
    setState((s) => ({ ...s, filled: null, wrong: null }));
    const t = window.setTimeout(() => void safeSpeak(r.word, 'pip'), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, complete]);

  const tap = async (letter: string) => {
    if (filled || complete) return;
    if (letter.toLowerCase() === r.answer.toLowerCase()) {
      sfx.match();
      setState((s) => ({ ...s, filled: letter }));
      await safeSpeak(r.word, 'pip');
      window.setTimeout(() => {
        const next = round + 1;
        const awardGem = next >= total && !gemDone;
        if (awardGem) { sfx.gem(); onWin(true); }
        setState((s) => ({ ...s, round: next, gemDone: s.gemDone || awardGem }));
      }, 900);
    } else {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: letter }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: null })), 500);
    }
  };

  if (complete) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        {scene.magic ? <MagicLayer /> : <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />}
        <Confetti count={50} />
        <button onClick={onNext} className="relative z-10 animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">You read {total} words! ⭐ Next</button>
      </div>
    );
  }

  const letters = r.tiles ?? r.word.split('');
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      {scene.magic ? <MagicLayer /> : <div className="absolute inset-0 bg-black/15" />}
      <div className={`pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full px-4 py-2 text-center text-sm font-black shadow-xl backdrop-blur sm:text-base ${scene.magic ? 'text-white' : 'bg-white/95 text-orange-700'}`} style={scene.magic ? { background: MAGIC_GRADIENT } : undefined}>{scene.magic ? '🪄' : '🧩'} {scene.teacher} <span className="ml-1 opacity-70">({round + 1}/{total})</span></div>
      <div className="relative z-10 flex w-full max-w-[560px] flex-col items-center gap-6 px-4">
        <button onClick={() => void safeSpeak(r.word, 'pip')} className="grid h-44 w-44 place-items-center rounded-3xl p-2 transition active:scale-95 sm:h-52 sm:w-52" aria-label={`Hear ${r.word}`}>
          {r.img ? <img src={r.img} alt={r.word} className="h-full w-full object-contain drop-shadow-2xl" draggable={false} /> : <span className="text-7xl drop-shadow-2xl">{r.emoji}</span>}
        </button>
        <div className="flex items-end gap-2">
          {letters.map((ch, i) => {
            const isBlank = i === r.blankIndex;
            const display = isBlank ? (filled ?? '_') : ch;
            return <div key={i} className={`grid place-items-center rounded-2xl border-4 font-black uppercase shadow-lg ${isBlank ? (filled ? 'border-green-400 bg-green-100 text-green-700' : 'border-dashed border-white bg-white/70 text-orange-700') : 'border-white bg-white/90 text-orange-700'}`} style={{ minWidth: 62, padding: '0 8px', height: 78, fontSize: 42 }}>{display}</div>;
          })}
        </div>
        <button onClick={() => void safeSpeak(r.word, 'pip')} className="rounded-full bg-white/95 px-6 py-2 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔊 Listen</button>
        <div className="flex flex-wrap justify-center gap-3">
          {r.choices.map((L, i) => (
            <button key={L} onClick={() => tap(L)} disabled={!!filled} className={`grid h-20 w-20 place-items-center rounded-2xl border-4 border-white text-4xl font-black text-white shadow-2xl transition active:scale-95 disabled:opacity-40 sm:h-24 sm:w-24 sm:text-5xl ${wrong === L ? 'animate-[lep1-shake_0.4s_ease-out]' : ''}`} style={{ background: scene.magic ? (i % 2 === 0 ? 'linear-gradient(135deg,#6D28D9,#A855F7)' : 'linear-gradient(135deg,#B45309,#F59E0B)') : i % 2 === 0 ? 'linear-gradient(135deg,#FE6A2F,#FF8A4C)' : 'linear-gradient(135deg,#B85CD1,#D57BE6)' }}>{L}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Wizard / magic styling (phonics segment of Magic Castle) ---------- */

const MAGIC_PURPLE = '#6D28D9';
const MAGIC_GOLD = '#F5C542';
const MAGIC_GRADIENT = 'linear-gradient(90deg, #6D28D9, #A855F7 55%, #F59E0B)';
const MAGIC_GLOW = '0 0 0 4px rgba(245,197,66,0.55), 0 0 40px rgba(168,85,247,0.75)';
const MAGIC_STARS = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 37 + 7) % 100}%`, top: `${(i * 53 + 11) % 94}%`, size: 2 + (i % 3) * 2,
  dur: 1400 + (i % 5) * 320, delay: (i * 170) % 1700,
}));

/** Night-sky wash + twinkling stars + drifting sparkles over a scene bg. */
function MagicLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 38%, rgba(124,58,237,0.28), rgba(24,8,56,0.78) 78%)' }} />
      {MAGIC_STARS.map((st, i) => (
        <span key={i} className="absolute rounded-full bg-amber-100" style={{ left: st.left, top: st.top, width: st.size, height: st.size, boxShadow: '0 0 8px 2px rgba(255,230,160,0.9)', animation: `lep1-twinkle ${st.dur}ms ease-in-out ${st.delay}ms infinite` }} />
      ))}
      {['8%', '88%', '14%', '80%'].map((left, i) => (
        <span key={`sp-${i}`} className="absolute text-2xl" style={{ left, top: i < 2 ? '18%' : '70%', animation: `lep1-twinkle ${1800 + i * 400}ms ease-in-out ${i * 300}ms infinite` }}>✨</span>
      ))}
    </div>
  );
}

/** Splits `line` into words, marking the `focus` letters in each. */
function focusParts(word: string, focus: string): { text: string; hit: boolean }[] {
  if (!focus) return [{ text: word, hit: false }];
  const out: { text: string; hit: boolean }[] = [];
  // `focus` may list alternatives: 'l|w' marks every l and every w.
  const alts = focus.toLowerCase().split('|').filter(Boolean);
  const lower = word.toLowerCase();
  let i = 0;
  while (i < word.length) {
    let j = -1, f = '';
    for (const a of alts) { const k = lower.indexOf(a, i); if (k >= 0 && (j < 0 || k < j)) { j = k; f = a; } }
    if (j < 0) { out.push({ text: word.slice(i), hit: false }); break; }
    if (j > i) out.push({ text: word.slice(i, j), hit: false });
    out.push({ text: word.slice(j, j + f.length), hit: true });
    i = j + f.length;
  }
  return out;
}

const TWISTER_ROUNDS = [
  { label: 'Slow', icon: '🐢', msPerWord: 900 },
  { label: 'Faster', icon: '🐇', msPerWord: 560 },
  { label: 'Magic speed!', icon: '🚀', msPerWord: 330 },
] as const;

function TongueTwisterScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'tongue-twister' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  // step 0 = listen to the wizard; 1..3 = say it at each speed; 4 = done.
  // `run` bumps each time the wand should sweep the line, so both screens
  // animate the same sweep from the synced state.
  const [state, setState] = useSyncedState(sync, { step: 0, run: 0, gemDone: false });
  const { step, run, gemDone } = state;
  const words = useMemo(() => scene.line.split(/\s+/), [scene.line]);
  const [wandAt, setWandAt] = useState(-1);
  const round = step >= 1 && step <= 3 ? TWISTER_ROUNDS[step - 1] : null;
  const done = step >= 4;

  const hear = () => { sfx.reveal(); void safeSpeak(scene.line, voiceOf(scene.who)); setState((st) => ({ ...st, run: st.run + 1 })); };

  // Wand sweep: word by word at this round's pace (listen step uses the
  // slow pace alongside the voice).
  useEffect(() => {
    if (run === 0 || done) return;
    const ms = round?.msPerWord ?? TWISTER_ROUNDS[0].msPerWord;
    let i = 0;
    setWandAt(0);
    const iv = window.setInterval(() => { i += 1; if (i >= words.length) { window.clearInterval(iv); window.setTimeout(() => setWandAt(-1), ms); } else setWandAt(i); }, ms);
    return () => window.clearInterval(iv);
  }, [run, step, done, round, words.length]);

  const start = () => { sfx.pop(); setState((st) => ({ ...st, run: st.run + 1 })); };
  const saidIt = () => {
    sfx.match();
    const next = step + 1;
    const awardGem = next >= 4 && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((st) => ({ ...st, step: next, run: next <= 3 ? st.run + 1 : st.run, gemDone: st.gemDone || awardGem }));
  };

  return (
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <MagicLayer />
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center">
        <div className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-lg ring-2 ring-white/50" style={{ background: MAGIC_GRADIENT }}>
          🪄 Wizard’s Tongue Twister
        </div>
      </div>
      <div className="absolute inset-x-0 top-12 z-20 flex justify-center px-4">
        <div className="max-w-xl rounded-2xl px-4 py-2 text-center text-sm font-bold text-white shadow-2xl sm:text-base" style={{ background: 'rgba(20,6,48,0.6)', backdropFilter: 'blur(6px)' }}>
          {done ? 'Magic! You said it at magic speed! ⭐' : step === 0 ? scene.teacher : `Your turn — say it ${round!.label.toLowerCase()} ${round!.icon}`}
        </div>
      </div>

      {/* The spell scroll */}
      <div className="absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-center px-4">
        <div className="relative w-full max-w-[900px] rounded-[2rem] border-4 px-6 py-8 text-center shadow-2xl"
          style={{ borderColor: MAGIC_GOLD, background: 'linear-gradient(180deg, #FFF8E7, #FCEFC9)', boxShadow: MAGIC_GLOW }}>
          <span className="absolute -left-4 -top-5 text-4xl">🧙</span>
          <span className="absolute -right-3 -top-5 text-4xl" style={{ animation: 'lep1-twinkle 1.6s ease-in-out infinite' }}>✨</span>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 font-black leading-tight text-[#3B0764]" style={{ fontSize: 'clamp(28px, calc(5.2*var(--svh,1vh)), 54px)' }}>
            {words.map((w, i) => (
              <span key={i} className="relative inline-block rounded-xl px-1 transition-transform duration-150"
                style={{ transform: wandAt === i ? 'translateY(-8px) scale(1.12)' : undefined, background: wandAt === i ? 'rgba(168,85,247,0.18)' : undefined }}>
                {wandAt === i && <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-3xl">🪄</span>}
                {focusParts(w, scene.focus).map((p, k) => (
                  <span key={k} style={p.hit ? { color: MAGIC_PURPLE, textShadow: '0 0 12px rgba(245,197,66,0.95)', textDecoration: 'underline', textDecorationColor: MAGIC_GOLD, textUnderlineOffset: 6 } : undefined}>{p.text}</span>
                ))}
              </span>
            ))}
          </div>
          {/* Three potions fill as each speed is said */}
          <div className="mt-6 flex items-center justify-center gap-6">
            {TWISTER_ROUNDS.map((rd, i) => {
              const filled = step > i + 1 || done;
              const active = step === i + 1;
              return (
                <div key={rd.label} className={`flex flex-col items-center gap-1 transition ${active ? 'scale-110' : ''}`}>
                  <span className="text-4xl" style={{ filter: filled ? 'drop-shadow(0 0 10px rgba(245,197,66,0.95))' : active ? undefined : 'grayscale(0.8) opacity(0.55)' }}>{filled ? '🧪' : '⚗️'}</span>
                  <span className={`text-xs font-black ${active ? 'text-[#6D28D9]' : 'text-[#6B7280]'}`}>{rd.icon} {rd.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-5 z-30 mx-auto flex max-w-lg flex-wrap justify-center gap-2 px-4">
        <button onClick={hear} className="rounded-full bg-white/95 px-5 py-3 text-sm font-black text-[#6D28D9] shadow-xl ring-2 ring-purple-200 active:scale-95">🔊 Hear the wizard</button>
        {step === 0 && <button onClick={() => { sfx.pop(); setState((st) => ({ ...st, step: 1, run: st.run + 1 })); }} className="rounded-full px-6 py-3 text-sm font-black text-white shadow-xl active:scale-95" style={{ background: MAGIC_GRADIENT }}>🎤 My turn →</button>}
        {round && <button onClick={start} className="rounded-full bg-white/95 px-5 py-3 text-sm font-black text-[#6D28D9] shadow-xl ring-2 ring-purple-200 active:scale-95">{round.icon} Wand again</button>}
        {round && <button onClick={saidIt} className="rounded-full px-6 py-3 text-sm font-black text-white shadow-xl active:scale-95" style={{ background: MAGIC_GRADIENT }}>✨ I said it!</button>}
        {done && <button onClick={onNext} className="rounded-full px-8 py-3 text-base font-black text-white shadow-2xl active:scale-95" style={{ background: MAGIC_GRADIENT }}>⭐ Next</button>}
      </div>
    </div>
  );
}

/* ---------- Letter game (end-of-lesson review: name mode = "alphabet
   game", sound mode = "sound game" — same tap-the-right-letter mechanic as
   WordBuildScene's round progression, just matching a letter NAME or a
   PHONEME rather than filling a word's blank) ---------- */

function LetterGameScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'letter-game' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, correctPick: false, wrong: null as string | null, gemDone: false });
  const { round, correctPick, wrong, gemDone } = state;
  const total = scene.rounds.length;
  const complete = round >= total;
  const r = scene.rounds[round];
  const c = CAST[scene.who];

  const playPrompt = async () => {
    if (scene.mode === 'sound') await playLetterPhonic(r.letter);
    else await safeSpeak(`Find the letter ${r.letter}!`, voiceOf(scene.who));
  };

  useEffect(() => {
    if (complete) return;
    setState((s) => ({ ...s, correctPick: false, wrong: null }));
    const t = window.setTimeout(() => void playPrompt(), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, complete]);

  const tap = async (letter: string) => {
    if (correctPick || complete) return;
    if (letter === r.letter) {
      sfx.match();
      setState((s) => ({ ...s, correctPick: true }));
      await safeSpeak(`${r.letter}! Great job!`, voiceOf(scene.who));
      window.setTimeout(() => {
        const next = round + 1;
        const awardGem = next >= total && !gemDone;
        if (awardGem) { sfx.gem(); onWin(true); }
        setState((s) => ({ ...s, round: next, gemDone: s.gemDone || awardGem }));
      }, 900);
    } else {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: letter }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: null })), 500);
    }
  };

  if (complete) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <Confetti count={50} />
        <button onClick={onNext} className="relative z-10 animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">
          {scene.mode === 'sound' ? 'Great listening!' : 'Great letter hunting!'} ⭐ Next
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/15" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">
        {scene.mode === 'sound' ? '\u{1F50A}' : '\u{1F524}'} {scene.teacher} <span className="ml-1 opacity-70">({round + 1}/{total})</span>
      </div>
      <div className="relative z-10 flex w-full max-w-[560px] flex-col items-center gap-6 px-4">
        <button
          onClick={playPrompt}
          aria-label={scene.mode === 'sound' ? 'Hear the sound again' : 'Hear the letter name again'}
          className="grid h-32 w-32 place-items-center rounded-[2rem] border-8 bg-white/95 shadow-2xl transition active:scale-95"
          style={{ borderColor: c.color }}
        >
          <span className="text-5xl">{scene.mode === 'sound' ? '\u{1F50A}' : '\u{1F5E3}\u{FE0F}'}</span>
        </button>
        {scene.mode === 'sound' && r.phoneme && (
          <div className="rounded-2xl border-4 bg-white px-5 py-2 text-center text-xl font-black shadow-xl" style={{ color: c.color, borderColor: c.color }}>{r.phoneme} {r.phoneme}</div>
        )}
        <div className="flex flex-wrap justify-center gap-4">
          {r.choices.map((L, i) => (
            <button
              key={L}
              onClick={() => tap(L)}
              disabled={correctPick}
              className={`grid h-24 w-24 place-items-center rounded-3xl border-4 border-white text-5xl font-black text-white shadow-2xl transition active:scale-95 disabled:opacity-40 sm:h-28 sm:w-28 ${wrong === L ? 'animate-[lep1-shake_0.4s_ease-out]' : ''} ${correctPick && L === r.letter ? 'ring-4 ring-green-300' : ''}`}
              style={{ background: i % 2 === 0 ? 'linear-gradient(135deg,#FE6A2F,#FF8A4C)' : 'linear-gradient(135deg,#B85CD1,#D57BE6)' }}
            >
              {L}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Jigsaw puzzle (real drag-to-assemble puzzle — reuses drag-
   match's native PointerEvent + tolerance-radius drop pattern, but each
   piece is a CSS-cropped slice of one full image via percentage
   background-size/-position, so every piece renders correctly at any
   rendered pixel size without needing the image's real dimensions) ------- */

function JigsawPuzzleScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'jigsaw-puzzle' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const { rows, cols, image } = scene;
  const total = rows * cols;
  const containerRef = useRef<HTMLDivElement>(null);
  // The ghost piece renders as a child of the OUTER scene root (see its
  // render below), not of containerRef's inner framed box — so its
  // percentage position needs to be measured against that outer root, a
  // separate ref from containerRef (which stays scoped to the drop-tolerance
  // math against the inner box, unaffected by this).
  const outerRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<Set<number>>(new Set());
  // xPct/yPct: see DragMatchScene's identical comment — `position: fixed`
  // breaks once any ancestor (MainStage's letterbox scale) has a CSS
  // transform, so the ghost piece must be `absolute` + container-relative
  // percentage instead of `fixed` + raw client pixels.
  const [drag, setDrag] = useState<{ idx: number; x: number; y: number; startX: number; startY: number; xPct: number; yPct: number } | null>(null);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const gemDone = useRef(false);

  const pieces = useMemo(() => Array.from({ length: total }, (_, i) => ({ row: Math.floor(i / cols), col: i % cols })), [total, cols]);
  const trayOrder = useMemo(() => {
    const order = pieces.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = (i * 7 + 3) % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }, [scene.id]);

  const pieceStyle = (idx: number): React.CSSProperties => {
    const { row, col } = pieces[idx];
    return {
      backgroundImage: `url(${image})`,
      backgroundSize: `${cols * 100}% ${rows * 100}%`,
      backgroundPosition: `${cols > 1 ? (col / (cols - 1)) * 100 : 0}% ${rows > 1 ? (row / (rows - 1)) * 100 : 0}%`,
    };
  };

  const toPct = (clientX: number, clientY: number) => {
    const rect = outerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { xPct: 50, yPct: 50 };
    return { xPct: ((clientX - rect.left) / rect.width) * 100, yPct: ((clientY - rect.top) / rect.height) * 100 };
  };

  const startDrag = (e: React.PointerEvent, idx: number) => {
    if (placed.has(idx)) return;
    e.preventDefault();
    sfx.click();
    setDrag({ idx, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, ...toPct(e.clientX, e.clientY) });
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY, ...toPct(e.clientX, e.clientY) } : d));
    const up = (e: PointerEvent) => {
      const movedDist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
      if (movedDist < 20) { setDrag(null); return; }
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const { row, col } = pieces[drag.idx];
        const targetX = rect.left + ((col + 0.5) / cols) * rect.width;
        const targetY = rect.top + ((row + 0.5) / rows) * rect.height;
        const dist = Math.hypot(e.clientX - targetX, e.clientY - targetY);
        const tolerance = Math.min(rect.width / cols, rect.height / rows) * 0.6;
        if (dist <= tolerance) {
          sfx.match();
          setPlaced((prev) => {
            const next = new Set(prev).add(drag.idx);
            if (next.size === total && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
            return next;
          });
        } else {
          sfx.wrong(); onLose();
          setWrongIdx(drag.idx);
          window.setTimeout(() => setWrongIdx(null), 500);
        }
      }
      setDrag(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [drag, pieces, cols, rows, total, onWin, onLose]);

  const done = placed.size === total;

  return (
    <div ref={outerRef} className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-orange-50 to-pink-50 px-4 pb-28 pt-16 touch-none">
      <div className="pointer-events-none absolute inset-x-0 top-4 z-30 flex justify-center px-4">
        <div className="max-w-[92%] rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl sm:text-base">
          {'\u{1F9E9}'} {scene.teacher} <span className="ml-1 opacity-60">({placed.size}/{total})</span>
        </div>
      </div>
      <div ref={containerRef} className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-3xl border-4 border-white bg-white shadow-2xl">
        {/* A faint full-picture guide underneath — a real jigsaw box lid,
            not a vocabulary hint — so a young learner can see the shape
            they're building toward instead of placing pieces blind. */}
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" draggable={false} />
        <div className="pointer-events-none absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
          {pieces.map((_, i) => <div key={`slot-${i}`} className="border border-dashed border-white/50" />)}
        </div>
        {pieces.map((p, i) => placed.has(i) && (
          <div
            key={`placed-${i}`}
            className="absolute"
            style={{ left: `${(p.col / cols) * 100}%`, top: `${(p.row / rows) * 100}%`, width: `${100 / cols}%`, height: `${100 / rows}%`, ...pieceStyle(i), animation: 'lep1-pop 0.3s ease-out' }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex flex-wrap justify-center gap-3 px-4">
        {trayOrder.map((i) => {
          if (placed.has(i)) return null;
          // Stays mounted (just hidden) while dragged — same fix as
          // DragMatchScene's tray button, same reason: unmounting the
          // element the live-classroom DOM-tap mirror cached a reference
          // to detaches it, so the other participant's screen never
          // receives the pointermove/pointerup that would move it.
          const isBeingDragged = drag?.idx === i;
          return (
            <button
              key={`tray-${i}`}
              onPointerDown={(e) => startDrag(e, i)}
              aria-label={`Puzzle piece ${i + 1}`}
              className={`touch-none rounded-xl shadow-2xl ring-4 ring-white transition active:scale-95 ${wrongIdx === i ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''} ${isBeingDragged ? 'pointer-events-none opacity-0' : 'pointer-events-auto'}`}
              style={{ width: 64, height: 64, ...pieceStyle(i), animation: isBeingDragged || wrongIdx === i ? undefined : 'lep1-hop 1.6s ease-in-out infinite' }}
            />
          );
        })}
      </div>
      {/* absolute + percentage, not fixed + raw pixels — see DragMatchScene's
          comment on its own ghost for why (MainStage's scaled letterbox
          frame breaks `position: fixed`'s viewport-relative assumption). */}
      {drag && (
        <div className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-2xl ring-4 ring-white" style={{ left: `${drag.xPct}%`, top: `${drag.yPct}%`, width: 72, height: 72, ...pieceStyle(drag.idx) }} />
      )}
      {done && (
        <div className="absolute inset-x-0 bottom-8 z-40 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">You built it! ⭐ Next</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Finale ---------- */

function FinaleScene({ scene, hearts, gems, onRestart }: { scene: Extract<Scene, { kind: 'finale' }>; hearts: number; gems: number; onRestart: () => void }) {
  useEffect(() => { cueSpeak(scene.line, voiceOf(scene.who)); }, [scene.id]);
  const stars = 1 + Math.min(2, Math.floor(hearts / 2)) + (gems >= 3 ? 1 : 0);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center px-4" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
      <Confetti />
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/40 bg-white/95 p-5 text-center text-neutral-900 shadow-2xl backdrop-blur-2xl ring-1 ring-white/30">
        <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Lesson Complete!</p>
        <h2 className="mt-1 text-4xl font-black text-orange-800">You did it!</h2>
        <div className="my-4 flex justify-center gap-2 text-5xl">
          {[0, 1, 2, 3].map((i) => <span key={i} className={i < stars ? '' : 'opacity-20'}>⭐</span>)}
        </div>
        <div className="mx-auto grid grid-cols-3 gap-2 rounded-3xl bg-white/70 p-3">
          {(['marigold', 'pip', 'mia', 'bella', 'willow', 'leo'] as const).map((k, i) => {
            const c = CAST[k];
            return (
              <div key={k} className="grid place-items-center">
                <span className="text-3xl" style={{ animation: `lep1-hop 1.6s ease-in-out ${i * 0.1}s infinite` }}>{c.emoji}</span>
                <span className="text-[10px] font-black" style={{ color: c.color }}>{c.name}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-lg font-bold text-orange-700">"{scene.line}"</p>
        <button onClick={onRestart} className="mt-5 w-full rounded-full bg-white py-3 font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔁 Play again</button>
      </div>
    </div>
  );
}
