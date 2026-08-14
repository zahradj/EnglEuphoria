import { useEffect, useMemo, useRef, useState } from 'react';
import type { Scene, CharKey } from './scenes';
import { CAST, VOICE_KEY } from './scenes';
import { safeSpeak, cueSpeak, cueSpeakOnce, unlockAudio, playLetterPhonic } from '../unit1/audio';
import * as sfx from '../unit1/sfx';
import { Confetti } from '../unit1/fx';
import { Hearts, MAX_HEARTS, Lep1Keyframes } from '../unit1/SceneRenderer';
import engleuphoriaLogo from '@/assets/engleuphoria-logo.png';

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
  const GAP = 62;
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
          <span className="pointer-events-none absolute bottom-0 left-1/2 h-12 w-12 -translate-x-1/2 translate-y-1/2 rounded-full" style={{ background: `radial-gradient(circle, ${color}88, transparent 65%)`, animation: 'lep1-ping 1.4s ease-out infinite' }} />
          <svg width="52" height="76" viewBox="0 0 40 58" className="relative drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
            <path
              d="M13 3 C13 1.9 13.9 1 15 1 L25 1 C26.1 1 27 1.9 27 3 L27 21 L36 21 C37.9 21 38.8 23.3 37.4 24.6 L21.4 43.6 C20.6 44.5 19.4 44.5 18.6 43.6 L2.6 24.6 C1.2 23.3 2.1 21 4 21 L13 21 Z"
              fill={color}
              stroke="white"
              strokeWidth="3"
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
}) {
  const { scene } = props;
  const instruction = (scene as { teacher?: string }).teacher;
  const content = (() => {
    switch (scene.kind) {
      case 'title-card': return <TitleCardScene scene={scene} onNext={props.onNext} />;
      case 'cinematic': return <CinematicScene scene={scene} onNext={props.onNext} />;
      case 'meet': return <MeetScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
      case 'echo': return <EchoScene scene={scene} onWin={props.onWin} onNext={props.onNext} />;
      case 'memory': return <MemoryScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
      case 'drag-match': return <DragMatchScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
      case 'vocab-spot': return <VocabSpotScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
      case 'choice': return <ChoiceScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
      case 'frequency-ladder': return <FrequencyLadderScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
      case 'roleplay': return <RoleplayScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
      case 'join-stage': return <JoinStageScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
      case 'hello-doors': return <HelloDoorsScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
      case 'flipbook': return <FlipbookScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
      case 'song': return <SongScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
      case 'sound-model': return <SoundModelScene scene={scene} onNext={props.onNext} />;
      case 'trace': return <TraceScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
      case 'word-build': return <WordBuildScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
      case 'letter-game': return <LetterGameScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
      case 'jigsaw-puzzle': return <JigsawPuzzleScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
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
          className="inline-block -rotate-2 text-5xl leading-[1.05] sm:text-7xl md:text-8xl"
          style={{
            fontFamily: "'Bungee', 'Fredoka', system-ui, sans-serif",
            background: 'linear-gradient(180deg, #FFF3B0 0%, #FFD34E 35%, #FF8A3D 70%, #E5561A 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', WebkitTextStroke: '5px #2A1200',
            paintOrder: 'stroke fill', filter: 'drop-shadow(0 8px 0 #B23A00) drop-shadow(0 12px 18px rgba(0,0,0,0.45))',
            letterSpacing: '0.02em', animation: 'lep1-hop 1.8s ease-in-out infinite',
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
        await safeSpeak(scene.script[i].line, voiceOf(scene.script[i].who));
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
        <div className="absolute bottom-[52vh] left-1/2 max-w-[520px] -translate-x-1/2 px-4">
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

function MeetScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'meet' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  type Phase = 'idle' | 'talking' | 'repeat' | 'done';
  const [phase, setPhase] = useState<Phase>('idle');
  const [held, setHeld] = useState(false);
  const [heardRepeat, setHeardRepeat] = useState(0);
  const [xpBurst, setXpBurst] = useState(false);
  const [glow, setGlow] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const c = CAST[scene.who];
  const repeatWord = scene.repeat ?? scene.line;

  const tapCharacter = async () => {
    if (phase !== 'idle') return;
    sfx.pop();
    setGlow(true);
    setPhase('talking');
    await safeSpeak(scene.line, voiceOf(scene.who));
    setTimeout(() => setPhase('repeat'), 500);
    setTimeout(() => setGlow(false), 1600);
  };
  const hearRepeat = async () => { sfx.click(); setHeardRepeat((n) => n + 1); await safeSpeak(repeatWord, voiceOf(scene.who)); };
  const replayIntro = async () => { sfx.click(); setGlow(true); await safeSpeak(scene.line, voiceOf(scene.who)); setTimeout(() => setGlow(false), 1200); };
  const startHold = () => {
    if (phase !== 'repeat') return;
    setHeld(true);
    holdTimer.current = window.setTimeout(async () => {
      setHeld(false); setPhase('done'); setXpBurst(true); sfx.gem();
      setTimeout(() => setXpBurst(false), 1200);
      onWin(true);
      await safeSpeak('Awesome voice! Great job!', 'pip');
    }, 1300);
  };
  const endHold = () => { setHeld(false); if (holdTimer.current) window.clearTimeout(holdTimer.current); };

  return (
    <div className="relative min-h-[78vh]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
        <div className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-lg ring-2 ring-white/50" style={{ background: `linear-gradient(90deg, ${c.color}, #FEBE4C)` }}>
          ⚔️ Quest · Meet {c.name}
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-md">
        <div className="rounded-2xl px-4 py-3 text-center text-lg font-bold text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.35))', backdropFilter: 'blur(8px)', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
          {scene.teacher}
        </div>
      </div>
      {/* scene.bg already paints {c.name} directly into the classroom art —
          no separate sprite on top, just a broad tap affordance over the
          area where they're standing, with the same pulsing ring cue used
          for this exact idle-tap pattern in the Pre-A1 lessons. */}
      {phase === 'idle' && <button onClick={tapCharacter} aria-label={`Tap ${c.name} to say hello`} className="absolute inset-0 z-10 h-[60vh] w-full cursor-pointer bg-transparent" />}
      {phase === 'idle' && (
        <div className="pointer-events-none absolute inset-x-0 top-[26vh] z-10 grid place-items-center">
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
        <div className="pointer-events-none absolute inset-x-0 top-[8vh] z-10 h-[55vh] grid place-items-center" style={{ animation: 'lep1-twinkle 1.4s ease-in-out' }}>
          <div className="h-full w-full rounded-full" style={{ background: `radial-gradient(circle, ${c.color}66 0%, ${c.color}22 45%, transparent 70%)` }} />
        </div>
      )}
      {xpBurst && (
        <div className="pointer-events-none absolute inset-x-0 top-[32vh] z-30 grid place-items-center">
          <div className="animate-[lep1-pop-fade_1.1s_ease-out_forwards] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2 text-2xl font-black text-white shadow-2xl">+10 XP 💎</div>
        </div>
      )}
      {phase !== 'idle' && (
        <div className="pointer-events-none absolute inset-x-0 top-[12vh] z-20 flex justify-center px-4">
          <button onClick={replayIntro} className="group pointer-events-auto relative flex w-full max-w-sm flex-col items-center gap-2 rounded-[2rem] border-4 bg-white px-6 py-5 text-center shadow-2xl active:scale-95" style={{ borderColor: c.color, animation: 'lep1-pop 0.4s ease-out' }}>
            <span className="grid h-16 w-16 place-items-center rounded-full text-4xl shadow-inner" style={{ background: `${c.color}22` }}>{c.emoji}</span>
            <span className="text-2xl font-black sm:text-3xl" style={{ color: c.color }}>{repeatWord}</span>
            <span className="text-sm font-semibold text-neutral-500">🔊 “{scene.line}”</span>
          </button>
        </div>
      )}
      {phase === 'idle' && (
        <div className="pointer-events-none absolute inset-x-0 top-[44vh] z-20 grid place-items-center">
          <span className="animate-pulse rounded-full bg-white/95 px-5 py-2 text-base font-bold shadow-xl" style={{ color: c.color }}>👆 Tap {c.name} {c.emoji}</span>
        </div>
      )}
      {(phase === 'repeat' || phase === 'done') && (
        <div className="absolute inset-x-0 bottom-0 z-30 mx-auto max-w-md" style={{ animation: 'lep1-slide-up 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <div className="rounded-t-[2rem] border-t-4 p-4 shadow-2xl" style={{ borderColor: c.color, background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center justify-between">
              <span className="rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest text-white" style={{ background: c.color }}>🎤 Your turn</span>
              <span className="text-xs font-bold text-neutral-500">Hold & repeat</span>
            </div>
            <p className="mt-2 text-center text-2xl font-black" style={{ color: c.color }}>“{repeatWord}”</p>
            <button onClick={hearRepeat} className="mt-3 w-full rounded-full bg-white py-2 text-sm font-bold text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">
              🔊 Hear it {heardRepeat > 0 && <span className="opacity-60">({heardRepeat})</span>}
            </button>
            <button
              onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
              className={`mt-2 w-full rounded-full py-5 text-xl font-black text-white shadow-xl transition ${held ? 'scale-95' : ''}`}
              style={{ background: phase === 'done' ? 'linear-gradient(90deg, #10B981, #34D399)' : `linear-gradient(90deg, ${c.color}, #FEBE4C)` }}
            >
              {phase === 'done' ? '✅ Nailed it!' : held ? '🎤 Keep talking…' : '🎤 Hold to say it'}
            </button>
            <PrimaryButton onClick={onNext} disabled={phase !== 'done'}>{phase === 'done' ? 'Next Quest →' : 'Say it first!'}</PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Vocab spot (arrow hotspots on one reused scene) ---------- */

function VocabSpotScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'vocab-spot' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const gemDone = useRef(false);
  const total = scene.items.length;
  const done = step >= total;
  const current = !done ? scene.items[step] : null;

  const tap = async () => {
    if (!current || revealed) return;
    sfx.pop();
    setRevealed(true);
    // Primary audio is the bare word — the example sentence is a secondary,
    // tap-to-hear extra on the flashcard, not something spoken automatically.
    await safeSpeak(current.label, current.who ? voiceOf(current.who) : 'teacher');
  };
  const hearSentence = async () => {
    if (!current) return;
    sfx.click();
    await safeSpeak(current.sentence, current.who ? voiceOf(current.who) : 'teacher');
  };
  const dismiss = () => {
    setRevealed(false);
    const next = step + 1;
    if (next >= total && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
    setStep(next);
  };

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
        const GAP = 62;
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
                <span className="pointer-events-none absolute bottom-0 left-1/2 h-12 w-12 -translate-x-1/2 translate-y-1/2 rounded-full" style={{ background: `radial-gradient(circle, ${current.color}88, transparent 65%)`, animation: 'lep1-ping 1.4s ease-out infinite' }} />
              )}
              <svg width="52" height="76" viewBox="0 0 40 58" className="relative drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
                <path
                  d="M13 3 C13 1.9 13.9 1 15 1 L25 1 C26.1 1 27 1.9 27 3 L27 21 L36 21 C37.9 21 38.8 23.3 37.4 24.6 L21.4 43.6 C20.6 44.5 19.4 44.5 18.6 43.6 L2.6 24.6 C1.2 23.3 2.1 21 4 21 L13 21 Z"
                  fill={current.color}
                  stroke="white"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        );
      })()}
      {current && revealed && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 px-6" onClick={dismiss} style={{ animation: 'lep1-pop 0.25s ease-out' }}>
          <div className="flex w-full max-w-sm flex-col items-center gap-2 rounded-[2rem] border-4 border-white bg-white px-6 py-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <span className="grid h-16 w-16 place-items-center rounded-full text-4xl" style={{ background: `${current.color}22` }}>{current.emoji}</span>
            <span className="text-3xl font-black" style={{ color: current.color }}>{current.label}</span>
            <button onClick={hearSentence} className="text-sm font-semibold text-neutral-500 underline decoration-dotted active:scale-95">🔊 Hear it in a sentence: “{current.sentence}”</button>
            <button onClick={dismiss} className="mt-2 rounded-full px-6 py-2 text-sm font-black uppercase tracking-widest text-white shadow active:scale-95" style={{ background: current.color }}>Got it!</button>
          </div>
        </div>
      )}
      {done && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">All found! ⭐ Next</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Echo ---------- */

function EchoScene({ scene, onWin, onNext }: { scene: Extract<Scene, { kind: 'echo' }>; onWin: (gem: boolean) => void; onNext: () => void }) {
  const [heard, setHeard] = useState(0);
  const [held, setHeld] = useState(false);
  const [done, setDone] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const c = CAST[scene.who];

  const hear = async () => { setHeard((h) => h + 1); await safeSpeak(scene.word, voiceOf(scene.who)); };
  const startHold = () => {
    setHeld(true);
    holdTimer.current = window.setTimeout(() => { setDone(true); setHeld(false); onWin(true); cueSpeak('Amazing! Great voice!', 'pip'); }, 1200);
  };
  const endHold = () => { setHeld(false); if (holdTimer.current) window.clearTimeout(holdTimer.current); };

  return (
    <GlassCard>
      <p className="text-center text-lg font-bold text-orange-700">{scene.teacher}</p>
      <div className="mt-4 grid place-items-center rounded-3xl bg-white/60 p-6">
        <span className="text-5xl" style={{ animation: 'lep1-hop 1.4s ease-in-out infinite' }}>{c.emoji}</span>
        <p className="mt-2 text-sm font-black uppercase tracking-widest" style={{ color: c.color }}>{c.name} says</p>
        <p className="mt-1 text-3xl font-black" style={{ color: c.color }}>"{scene.word}"</p>
      </div>
      <button onClick={hear} className="mt-4 w-full rounded-full bg-white py-3 text-lg font-bold text-orange-700 shadow-md ring-2 ring-orange-200 active:scale-95">
        🔊 Listen {heard > 0 && <span className="text-sm opacity-60">({heard})</span>}
      </button>
      <button
        onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold} disabled={heard === 0}
        className={`mt-3 w-full rounded-full py-6 text-2xl font-black text-white shadow-xl transition ${held ? 'scale-95' : ''} disabled:opacity-40`}
        style={{ background: done ? 'linear-gradient(90deg, #10B981, #34D399)' : 'linear-gradient(90deg, #FE6A2F, #FF8A4C)' }}
      >
        {done ? '✅ Great job!' : held ? '🎤 Keep talking…' : '🎤 Hold & say it'}
      </button>
      <PrimaryButton onClick={onNext} disabled={!done}>Next →</PrimaryButton>
    </GlassCard>
  );
}

/* ---------- Memory ---------- */

function MemoryScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'memory' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  type Card = { key: string; pairId: string; label: string; emoji: string };
  const deck = useMemo<Card[]>(() => {
    const base = scene.pairs.flatMap((p) => [{ key: `${p.id}-a`, pairId: p.id, label: p.label, emoji: p.emoji }, { key: `${p.id}-b`, pairId: p.id, label: p.label, emoji: p.emoji }]);
    return base.map((c, i) => ({ c, r: (i * 9301 + 49297) % 233280 })).sort((a, b) => a.r - b.r).map((x) => x.c);
  }, [scene.id]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [gemDone, setGemDone] = useState(false);

  const tap = async (card: Card) => {
    if (busy || matched.has(card.pairId) || flipped.includes(card.key)) return;
    const next = [...flipped, card.key];
    setFlipped(next);
    void safeSpeak(card.label, 'teacher');
    if (next.length === 2) {
      setBusy(true);
      const a = deck.find((c) => c.key === next[0])!, b = deck.find((c) => c.key === next[1])!;
      await new Promise((r) => setTimeout(r, 700));
      if (a.pairId === b.pairId) {
        sfx.match();
        setMatched((m) => {
          const copy = new Set(m); copy.add(a.pairId);
          if (copy.size === scene.pairs.length && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
          return copy;
        });
      } else { sfx.wrong(); onLose(); }
      setFlipped([]); setBusy(false);
    }
  };
  const complete = matched.size === scene.pairs.length;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">🧠 {scene.teacher}</div>
      <div className="relative z-10 grid w-full max-w-[860px] grid-cols-4 gap-5 px-4 sm:gap-6">
        {deck.map((card) => {
          const isMatched = matched.has(card.pairId);
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
  const [drag, setDrag] = useState<{ idx: number; x: number; y: number; startX: number; startY: number } | null>(null);
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

  const startDrag = (e: React.PointerEvent, idx: number) => {
    if (placed.has(idx)) return;
    e.preventDefault();
    hear(idx);
    setDrag({ idx, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY });
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
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
        const dist = Math.hypot(e.clientX - targetX, e.clientY - targetY);
        const tolerance = Math.min(rect.width, rect.height) * 0.14;
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
      {scene.items.map((item, i) => placed.has(i) && (
        <div
          key={`placed-${i}`}
          className={`pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 grid place-items-center shadow-xl ring-4 ring-white ${scene.showBlanks ? 'rounded-2xl px-6 py-4' : 'rounded-xl px-3 py-2'}`}
          style={{ left: item.targetLeft, top: item.targetTop, background: item.color, animation: 'lep1-pop 0.4s ease-out' }}
        >
          <span className={`font-black uppercase tracking-wide text-white ${scene.showBlanks ? 'text-lg sm:text-xl' : 'text-sm'}`}>{item.label}</span>
        </div>
      ))}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex flex-wrap justify-center gap-3 px-4">
        {trayOrder.map((i) => {
          const item = scene.items[i];
          if (placed.has(i) || drag?.idx === i) return null;
          return (
            <button
              key={`tray-${i}`}
              onPointerDown={(e) => startDrag(e, i)}
              aria-label={`Drag the word ${item.label}`}
              className={`pointer-events-auto touch-none shadow-2xl ring-4 ring-white transition active:scale-95 ${scene.showBlanks ? 'rounded-2xl px-6 py-4' : 'rounded-xl px-4 py-3'} ${wrongIdx === i ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}
              style={{ background: item.color, animation: wrongIdx === i ? undefined : 'lep1-hop 1.6s ease-in-out infinite' }}
            >
              <span className={`font-black uppercase tracking-wide text-white ${scene.showBlanks ? 'text-lg sm:text-xl' : 'text-sm'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
      {drag && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-xl px-4 py-3 shadow-2xl ring-4 ring-white"
          style={{ left: drag.x, top: drag.y, background: scene.items[drag.idx].color }}
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

/* ---------- Choice (new: simple multiple-choice tap) ---------- */

function ChoiceScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'choice' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const gemDone = useRef(false);

  useEffect(() => {
    setPicked(null); setCorrect(false); gemDone.current = false;
    cueSpeakOnce(scene.prompt, voiceOf(scene.who));
  }, [scene.id]);

  const pick = async (label: string, isCorrect: boolean) => {
    if (correct) return;
    setPicked(label);
    if (!isCorrect) { sfx.wrong(); onLose(); window.setTimeout(() => setPicked(null), 600); return; }
    sfx.match(); setCorrect(true);
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

/* ---------- Frequency ladder ---------- */

const FREQUENCY_RUNGS: { key: 'never' | 'sometimes' | 'usually' | 'always'; label: string; color: string }[] = [
  { key: 'always', label: 'Always', color: '#FE6A2F' },
  { key: 'usually', label: 'Usually', color: '#FEBE4C' },
  { key: 'sometimes', label: 'Sometimes', color: '#4FA9E0' },
  { key: 'never', label: 'Never', color: '#94A3B8' },
];

function FrequencyLadderScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'frequency-ladder' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const gemDone = useRef(false);
  const total = scene.rounds.length;
  const complete = round >= total;
  const r = !complete ? scene.rounds[round] : null;

  useEffect(() => {
    if (complete) return;
    setPicked(null); setCorrect(false); setWrong(null);
    const t = window.setTimeout(() => void safeSpeak(`How often do you ${r!.action}?`, 'teacher'), 350);
    return () => window.clearTimeout(t);
  }, [round, complete]);

  const tap = async (key: string) => {
    if (!r || picked) return;
    if (key !== r.answer) { sfx.wrong(); onLose(); setWrong(key); window.setTimeout(() => setWrong(null), 500); return; }
    setPicked(key); sfx.match(); setCorrect(true);
    if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
    await safeSpeak(r.line, voiceOf(scene.who));
    window.setTimeout(() => setRound((n) => n + 1), 1400);
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

/* ---------- Roleplay ---------- */

function RoleplayScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'roleplay' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [step, setStep] = useState(-1);
  const [awaitingRepeat, setAwaitingRepeat] = useState(false);
  const [gemDone, setGemDone] = useState(false);
  const stopRef = useRef(false);
  const runRef = useRef<((i: number) => void) | null>(null);

  useEffect(() => {
    stopRef.current = false;
    async function run(i: number) {
      if (stopRef.current) return;
      if (i >= scene.script.length) { setStep(scene.script.length); return; }
      setStep(i);
      const line = scene.script[i];
      await new Promise((r) => setTimeout(r, 350));
      if (stopRef.current) return;
      await safeSpeak(line.line, voiceOf(line.who));
      if (stopRef.current) return;
      if (line.repeat) setAwaitingRepeat(true);
      else { await new Promise((r) => setTimeout(r, 500)); run(i + 1); }
    }
    runRef.current = run;
    run(0);
    return () => { stopRef.current = true; };
  }, [scene.id]);

  const confirmRepeat = () => {
    if (!awaitingRepeat) return;
    setAwaitingRepeat(false);
    if (!gemDone) { onWin(true); setGemDone(true); }
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
  const bubbleLeft: Record<CharKey, string> = { pip: '22%', marigold: '78%', mia: '50%', bella: '50%', willow: '50%', leo: '50%' };
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
        <div className="absolute top-[30%] z-20 max-w-[420px] -translate-x-1/2 px-4 transition-all duration-300" style={{ left: bubbleLeft[current.who] ?? '50%' }}>
          <div className="relative rounded-3xl bg-white px-5 py-3 text-center text-xl font-black text-orange-800 shadow-2xl sm:text-2xl">“{current.line}”</div>
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

function JoinStageScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'join-stage' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [turnIdx, setTurnIdx] = useState(0);
  const [gemDone, setGemDone] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, [scene.id]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 480 }, audio: false });
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = s;
        if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play().catch(() => {}); }
      } catch { /* fallback: no video */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const currentTurn = turnIdx < scene.turns.length ? scene.turns[turnIdx] : null;
  const isStudentTurn = currentTurn?.who === 'student';
  const isFriendTurn = !!currentTurn && !isStudentTurn;
  const friendKey = isFriendTurn ? (currentTurn!.who as CharKey) : null;
  const friendMeta = friendKey ? CAST[friendKey] : null;
  const done = turnIdx >= scene.turns.length;

  useEffect(() => { if (isFriendTurn && friendKey && currentTurn) cueSpeakOnce(currentTurn.line, voiceOf(friendKey)); }, [turnIdx, isFriendTurn, friendKey]);

  const advance = () => {
    if (isStudentTurn && !gemDone) { onWin(true); setGemDone(true); }
    setTurnIdx((i) => i + 1);
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
      <div className="absolute left-1/2 z-30" style={{ top: '58%', transform: 'translate(-50%, -50%)' }}>
        <div className={`relative flex items-center justify-center overflow-hidden rounded-full border-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.5)] transition-all ${isStudentTurn ? 'border-orange-400 ring-8 ring-orange-300/70' : 'border-white/95 ring-4 ring-white/40'}`} style={{ width: 'clamp(300px, 46vw, 500px)', height: 'clamp(300px, 46vw, 500px)', background: 'linear-gradient(135deg, #FE6A2F, #FEBE4C)' }}>
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
          <span className="absolute right-6 top-6 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white"><span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> Live</span>
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

function HelloDoorsScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'hello-doors' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [order, setOrder] = useState<CharKey[]>(scene.cast);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [phase, setPhase] = useState<'reveal' | 'shuffle' | 'prompt' | 'greet' | 'echo' | 'done'>('reveal');
  const [score, setScore] = useState(0);
  const [gemDone, setGemDone] = useState(false);
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
    if (!r) return;
    let cancelled = false;
    answeredRef.current = false; setOpenIdx(null); setWrongIdx(null);
    (async () => {
      if (round === 0) {
        setOrder(scene.cast); setPhase('reveal');
        for (const who of scene.cast) { await safeSpeak(CAST[who].name, voiceOf(who)); if (cancelled) return; }
        await new Promise((res) => setTimeout(res, 400));
        if (cancelled) return;
      }
      setPhase('shuffle');
      if (cancelled) return;
      for (let k = 0; k < 3; k++) { setOrder((o) => shuffle(o)); await new Promise((res) => setTimeout(res, 420)); if (cancelled) return; }
      await new Promise((res) => setTimeout(res, 200));
      if (cancelled) return;
      setPhase('prompt');
      await new Promise((res) => setTimeout(res, 200));
      await safeSpeak(r.prompt, voiceOf(r.target));
    })();
    return () => { cancelled = true; };
  }, [round]);

  const tap = async (idx: number) => {
    if (!r || answeredRef.current) return;
    const who = order[idx];
    if (who !== r.target) { setWrongIdx(idx); sfx.wrong(); onLose(); window.setTimeout(() => setWrongIdx(null), 500); return; }
    answeredRef.current = true; setOpenIdx(idx); setPhase('greet'); sfx.match();
    await new Promise((res) => setTimeout(res, 500));
    await safeSpeak(r.helloLine, voiceOf(who));
    setPhase('echo');
    await new Promise((res) => setTimeout(res, 250));
    await safeSpeak(r.echoLine, voiceOf(r.target));
    setScore((s) => s + 1);
    await new Promise((res) => setTimeout(res, 1400));
    const next = round + 1;
    if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
    setRound(next);
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

function FlipbookScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'flipbook' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [pageIdx, setPageIdx] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [checkpoint, setCheckpoint] = useState<(typeof scene.checkpoints)[number] | null>(null);
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const gemDone = useRef(false);
  const page = scene.pages[pageIdx];
  const total = scene.pages.length;

  useEffect(() => { if (page) cueSpeakOnce(page.text, page.who ? voiceOf(page.who) : 'teacher'); }, [pageIdx]);

  const advance = () => {
    setFlipping(true);
    sfx.click();
    window.setTimeout(() => {
      setFlipping(false);
      if (pageIdx + 1 >= total) {
        setDone(true);
        if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
      } else {
        setPageIdx((p) => p + 1);
      }
    }, 450);
  };

  const turnPage = () => {
    if (flipping || checkpoint || done) return;
    const pending = scene.checkpoints.find((c) => c.afterPage === pageIdx && !solved.has(c.afterPage));
    if (pending) { setCheckpoint(pending); return; }
    advance();
  };

  const answer = (choice: string) => {
    if (!checkpoint) return;
    if (choice !== checkpoint.answer) { sfx.wrong(); onLose(); setWrongPick(choice); window.setTimeout(() => setWrongPick(null), 450); return; }
    sfx.match();
    setSolved((prev) => new Set(prev).add(checkpoint.afterPage));
    setCheckpoint(null);
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

      <div className="absolute inset-0 z-10 flex items-center justify-center px-4 pb-24 pt-16" style={{ perspective: 1400 }}>
        <div
          onClick={turnPage}
          className="relative w-full max-w-[600px] cursor-pointer select-none rounded-[30px] p-[7px]"
          style={{
            aspectRatio: '4 / 3',
            background: 'linear-gradient(135deg, #F5D67D 0%, #C9932F 45%, #8A5A1E 100%)',
            transformOrigin: 'right center',
            transform: flipping ? 'rotateY(-130deg) scaleX(0.85)' : 'rotateY(0deg)',
            transition: 'transform 0.45s cubic-bezier(0.45,0.05,0.55,0.95)',
            backfaceVisibility: 'hidden',
            animation: flipping ? undefined : 'lep1-bookGlow 3.2s ease-in-out infinite',
          }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-gradient-to-b from-[#FFFBF0] to-[#FFF2D0]">
            <div className="h-[68%] w-full overflow-hidden">
              <img src={page.img} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="flex h-[32%] flex-col items-center justify-center gap-1 px-6 text-center">
              <p className="text-base font-bold text-orange-900 sm:text-lg">{page.text}</p>
              {page.who && <span className="text-xs font-black uppercase tracking-widest text-amber-600">— {CAST[page.who].name}</span>}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-1/2 w-8 -translate-x-1/2" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.16) 45%, rgba(0,0,0,0.16) 55%, transparent)' }} />
            <div className="pointer-events-none absolute bottom-0 right-0 h-9 w-9" style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.18) 50%)', borderRadius: '0 0 24px 0' }} />
          </div>
          {!flipping && (
            <div className="absolute -right-4 top-1/2 grid h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-2xl text-white shadow-xl ring-2 ring-white/70 animate-pulse">▶</div>
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
      const tick = () => {
        if (!audioRef.current) return;
        const t = audioRef.current.currentTime;
        const perLine = dur() / totalLines;
        const i = Math.min(totalLines - 1, Math.floor(t / perLine));
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
      <div className="absolute left-1/2 w-[94%] max-w-5xl -translate-x-1/2 rounded-[2rem] bg-white/95 p-8 text-center shadow-2xl ring-8 ring-[#FE6A2F]/40 backdrop-blur-md" style={{ top: '40vh', zIndex: 15 }}>
        {status === 'error' ? (
          <div className="text-xl font-bold text-red-600">Song unavailable — try again in a moment.</div>
        ) : current ? (
          <>
            <div className="mb-3 text-sm font-black uppercase tracking-widest text-[#FE6A2F] sm:text-base">🎤 {CAST[current.who]?.name.toUpperCase() ?? current.who.toUpperCase()} sings</div>
            <div key={idx} className="font-black leading-tight text-slate-800" style={{ fontSize: 'clamp(28px, 5vw, 64px)', animation: 'lep1-lyricPop 0.4s ease-out' }}>{current.text}</div>
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
      </div>
    </div>
  );
}

/* ---------- Sound model (phonics: listen + explore anchor words) ---------- */

function SoundModelScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'sound-model' }>; onNext: () => void }) {
  const c = CAST[scene.who];
  const [beat, setBeat] = useState(-1);
  const [opened, setOpened] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<'invite' | 'done'>('invite');
  const [replays, setReplays] = useState(0);

  const playLetterSound = async () => {
    setBeat(0);
    await playLetterPhonic(scene.letter);
    setBeat(-1);
  };

  useEffect(() => { setOpened(new Set()); setPhase('invite'); }, [scene.id]);

  const openAnchor = async (i: number) => {
    if (opened.has(i)) { sfx.pop(); await safeSpeak(scene.anchors[i].word, voiceOf(scene.who)); return; }
    sfx.reveal();
    const next = new Set(opened); next.add(i); setOpened(next);
    await safeSpeak(scene.anchors[i].word, voiceOf(scene.who));
    if (next.size >= scene.anchors.length) { sfx.gem(); setPhase('done'); }
  };

  return (
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-black/15" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
        <div className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-lg ring-2 ring-white/50" style={{ background: `linear-gradient(90deg, ${c.color}, #FEBE4C)` }}>
          🔊 Sound Quest · {scene.letter} says {scene.phoneme}
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
          style={{ color: c.color, borderColor: c.color, width: 'clamp(140px, 26vh, 220px)', height: 'clamp(140px, 26vh, 220px)', fontSize: 'clamp(70px, 14vh, 110px)', lineHeight: 1, animation: beat >= 0 ? 'lep1-pop 0.5s ease-out' : 'lep1-wiggle 4s ease-in-out infinite' }}
        >
          {scene.letter}
        </button>
        <div className="rounded-2xl border-4 bg-white px-5 py-2 text-center text-xl font-black shadow-xl sm:text-2xl" style={{ color: c.color, borderColor: c.color }}>
          {scene.phoneme} {scene.phoneme}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-24 z-20 flex justify-center gap-4 px-4 sm:gap-8">
        {scene.anchors.map((a, i) => {
          const isOpen = opened.has(i);
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
        <button onClick={() => { setReplays((r) => r + 1); void playLetterSound(); }} className="flex-1 rounded-full bg-white/95 py-3 text-sm font-bold text-orange-700 shadow-xl ring-2 ring-orange-200 backdrop-blur active:scale-95">
          🔁 Hear sound {replays > 0 && <span className="opacity-60">({replays})</span>}
        </button>
        <button onClick={onNext} disabled={phase !== 'done'} className={`flex-1 rounded-full py-3 text-sm font-black text-white shadow-xl transition ${phase === 'done' ? 'bg-gradient-to-r from-green-500 to-emerald-500 active:scale-95' : 'cursor-not-allowed bg-neutral-400/70'}`}>
          {phase === 'done' ? 'Now you try →' : `Find ${scene.anchors.length - opened.size} more`}
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
      void safeSpeak(`${scene.letter}! ${scene.phoneme} ${scene.word}!`, voiceOf(scene.who));
      void playLetterPhonic(scene.letter);
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
          onClick={() => { if (!done) { setDone(true); sfx.gem(); onWin(true); void safeSpeak(`${scene.letter}! ${scene.phoneme} ${scene.word}!`, voiceOf(scene.who)); } onNext(); }}
          className="mt-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-3 text-lg font-black text-white shadow-2xl active:scale-95"
        >
          Great tracing! ⭐ Next
        </button>
      </div>
    </div>
  );
}

/* ---------- Word build (blend taught sounds into a real word) ---------- */

function WordBuildScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'word-build' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [filled, setFilled] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const r = scene.rounds[round];
  const total = scene.rounds.length;
  const complete = round >= total;

  useEffect(() => {
    if (complete) return;
    setFilled(null); setWrong(null);
    const t = window.setTimeout(() => void safeSpeak(r.word, 'pip'), 350);
    return () => window.clearTimeout(t);
  }, [round, complete]);

  const tap = async (letter: string) => {
    if (filled || complete) return;
    if (letter.toLowerCase() === r.answer.toLowerCase()) {
      sfx.match(); setFilled(letter); await safeSpeak(r.word, 'pip');
      window.setTimeout(() => {
        const next = round + 1;
        if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
        setRound(next);
      }, 900);
    } else { sfx.wrong(); onLose(); setWrong(letter); window.setTimeout(() => setWrong(null), 500); }
  };

  if (complete) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <Confetti count={50} />
        <button onClick={onNext} className="relative z-10 animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">You read {total} words! ⭐ Next</button>
      </div>
    );
  }

  const letters = r.word.split('');
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/15" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">🧩 {scene.teacher} <span className="ml-1 opacity-70">({round + 1}/{total})</span></div>
      <div className="relative z-10 flex w-full max-w-[560px] flex-col items-center gap-6 px-4">
        <button onClick={() => void safeSpeak(r.word, 'pip')} className="grid h-44 w-44 place-items-center rounded-3xl p-2 transition active:scale-95 sm:h-52 sm:w-52" aria-label={`Hear ${r.word}`}>
          {r.img ? <img src={r.img} alt={r.word} className="h-full w-full object-contain drop-shadow-2xl" draggable={false} /> : <span className="text-7xl drop-shadow-2xl">{r.emoji}</span>}
        </button>
        <div className="flex items-end gap-2">
          {letters.map((ch, i) => {
            const isBlank = i === r.blankIndex;
            const display = isBlank ? (filled ?? '_') : ch;
            return <div key={i} className={`grid place-items-center rounded-2xl border-4 font-black uppercase shadow-lg ${isBlank ? (filled ? 'border-green-400 bg-green-100 text-green-700' : 'border-dashed border-white bg-white/70 text-orange-700') : 'border-white bg-white/90 text-orange-700'}`} style={{ width: 62, height: 78, fontSize: 42 }}>{display}</div>;
          })}
        </div>
        <button onClick={() => void safeSpeak(r.word, 'pip')} className="rounded-full bg-white/95 px-6 py-2 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔊 Listen</button>
        <div className="flex flex-wrap justify-center gap-3">
          {r.choices.map((L, i) => (
            <button key={L} onClick={() => tap(L)} disabled={!!filled} className={`grid h-20 w-20 place-items-center rounded-2xl border-4 border-white text-4xl font-black text-white shadow-2xl transition active:scale-95 disabled:opacity-40 sm:h-24 sm:w-24 sm:text-5xl ${wrong === L ? 'animate-[lep1-shake_0.4s_ease-out]' : ''}`} style={{ background: i % 2 === 0 ? 'linear-gradient(135deg,#FE6A2F,#FF8A4C)' : 'linear-gradient(135deg,#B85CD1,#D57BE6)' }}>{L}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Letter game (end-of-lesson review: name mode = "alphabet
   game", sound mode = "sound game" — same tap-the-right-letter mechanic as
   WordBuildScene's round progression, just matching a letter NAME or a
   PHONEME rather than filling a word's blank) ---------- */

function LetterGameScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'letter-game' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [correctPick, setCorrectPick] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const [gemDone, setGemDone] = useState(false);
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
    setCorrectPick(false); setWrong(null);
    const t = window.setTimeout(() => void playPrompt(), 350);
    return () => window.clearTimeout(t);
  }, [round, complete]);

  const tap = async (letter: string) => {
    if (correctPick || complete) return;
    if (letter === r.letter) {
      sfx.match(); setCorrectPick(true);
      await safeSpeak(`${r.letter}! Great job!`, voiceOf(scene.who));
      window.setTimeout(() => {
        const next = round + 1;
        if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
        setRound(next);
      }, 900);
    } else { sfx.wrong(); onLose(); setWrong(letter); window.setTimeout(() => setWrong(null), 500); }
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
  const [placed, setPlaced] = useState<Set<number>>(new Set());
  const [drag, setDrag] = useState<{ idx: number; x: number; y: number; startX: number; startY: number } | null>(null);
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

  const startDrag = (e: React.PointerEvent, idx: number) => {
    if (placed.has(idx)) return;
    e.preventDefault();
    sfx.click();
    setDrag({ idx, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY });
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
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
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-orange-50 to-pink-50 px-4 pb-28 pt-16 touch-none">
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
          if (placed.has(i) || drag?.idx === i) return null;
          return (
            <button
              key={`tray-${i}`}
              onPointerDown={(e) => startDrag(e, i)}
              aria-label={`Puzzle piece ${i + 1}`}
              className={`pointer-events-auto touch-none rounded-xl shadow-2xl ring-4 ring-white transition active:scale-95 ${wrongIdx === i ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}
              style={{ width: 64, height: 64, ...pieceStyle(i), animation: wrongIdx === i ? undefined : 'lep1-hop 1.6s ease-in-out infinite' }}
            />
          );
        })}
      </div>
      {drag && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-2xl ring-4 ring-white" style={{ left: drag.x, top: drag.y, width: 72, height: 72, ...pieceStyle(drag.idx) }} />
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
