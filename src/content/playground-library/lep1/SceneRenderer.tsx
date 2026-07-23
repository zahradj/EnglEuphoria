import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Scene, CharKey } from './scenes';
import { CAST, PROP_THEME, getEmotionSprite, COLOR_SKETCH } from './scenes';
import { safeSpeak, cueSpeak, cueSpeakOnce, stopSpeaking, isSpeaking, speak, speakOnce, playLetterPhonic, playLetterName, type Character } from './audio';
import * as sfx from './sfx';
import { Confetti } from './fx';

/* ---------- Shared chrome ---------- */

export const MAX_HEARTS = 3;

export function Hearts({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${count} hearts remaining`}>
      {Array.from({ length: MAX_HEARTS }).map((_, i) => (
        <span key={i} className={`text-xl transition ${i < count ? '' : 'grayscale opacity-30'}`}>❤️</span>
      ))}
    </span>
  );
}

export function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/40 bg-white/25 p-5 text-neutral-900 shadow-2xl backdrop-blur-2xl ring-1 ring-white/30 ${className}`}
      style={{ boxShadow: '0 20px 60px -20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.6)' }}
    >
      {children}
    </div>
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
  switch (scene.kind) {
    case 'title-card': return <TitleCardScene scene={scene} onNext={props.onNext} />;
    case 'cinematic': return <CinematicScene scene={scene} onNext={props.onNext} />;
    case 'meet': return <MeetScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'sound-model': return <SoundModelScene scene={scene} onNext={props.onNext} />;
    case 'echo': return <EchoScene scene={scene} onWin={props.onWin} onNext={props.onNext} />;
    case 'basket': return <BasketScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} />;
    case 'trace': return <TraceScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'sound-sort': return <SoundSortScene scene={scene} onWin={props.onWin} onLose={props.onLose} onNext={props.onNext} />;
    case 'word-build': return <WordBuildScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'who-said-it': return <WhoSaidItScene scene={scene} onWin={props.onWin} onNext={props.onNext} />;
    case 'gather': return <GatherScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'memory': return <MemoryScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'dash': return <DashScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'feelings': return <FeelingsScene scene={scene} onNext={props.onNext} />;
    case 'puzzle': return <PuzzleScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'roleplay': return <RoleplayScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'join-stage': return <JoinStageScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'hello-doors': return <HelloDoorsScene scene={scene} onNext={props.onNext} onWin={props.onWin} onLose={props.onLose} />;
    case 'color-friends': return <ColorFriendsScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'alphabet-blocks': return <AlphabetBlocksScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'alphabet-order': return <AlphabetOrderScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'song': return <SongScene scene={scene} onNext={props.onNext} onWin={props.onWin} />;
    case 'finale': return <FinaleScene scene={scene} hearts={props.heartsRemaining} gems={props.gemsCollected} onRestart={props.onRestart} />;
    default: return null;
  }
}

/* ---------- Title card ---------- */

function TitleCardScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'title-card' }>; onNext: () => void }) {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute right-5 top-5 flex flex-wrap justify-end gap-2">
        <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">{scene.level}</span>
        <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">{scene.unit}</span>
        <span className="rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">{scene.lessonLabel}</span>
      </div>
      <div className="absolute inset-x-0 top-24 flex flex-col items-center px-6 text-center sm:top-20">
        <h1
          className="inline-block -rotate-2 text-6xl leading-[1] sm:text-8xl md:text-9xl"
          style={{
            fontFamily: "'Fredoka', system-ui, sans-serif",
            background: 'linear-gradient(180deg, #FFF3B0 0%, #FFD34E 35%, #FF8A3D 70%, #E5561A 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', WebkitTextStroke: '5px #2A1200',
            paintOrder: 'stroke fill', filter: 'drop-shadow(0 8px 0 #B23A00) drop-shadow(0 12px 18px rgba(0,0,0,0.45))',
            letterSpacing: '0.02em', animation: 'lep1-hop 1.8s ease-in-out infinite',
          }}
        >
          {scene.title}
        </h1>
        <p className="mt-2 max-w-xl rounded-full bg-white/85 px-4 py-1 text-sm font-black text-orange-800 shadow-lg ring-2 ring-orange-200 sm:text-base">{scene.subtitle} ✨</p>
      </div>
      <div className="absolute inset-x-0 bottom-8 z-20 flex justify-center">
        <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-12 py-5 text-2xl font-black text-white shadow-2xl ring-4 ring-white/60 transition hover:scale-105 active:scale-95 animate-pulse">
          Start Lesson →
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
        await safeSpeak(scene.script[i].line, scene.script[i].who);
      }
      if (!cancelled) setStep(scene.script.length);
    }
    run();
    return () => { cancelled = true; stopSpeaking(); };
  }, [scene.id]);

  const currentLine = step < 0 ? '…' : step < scene.script.length ? scene.script[step].line : 'Ready?';

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-1/2 top-8 -translate-x-1/2 text-center">
        <h1 className="text-4xl font-black text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.55)] sm:text-5xl">{scene.title}</h1>
        <p className="mt-1 text-sm font-semibold text-white/95 drop-shadow sm:text-base">{scene.subtitle}</p>
      </div>
      {scene.id !== 'intro' && (
        <img src={CAST.pip.img} alt="Pip" className="absolute bottom-[18vh] left-1/2 -translate-x-1/2 object-contain drop-shadow-2xl" style={{ height: 'clamp(220px, 34vh, 420px)', animation: 'lep1-walk 3.2s ease-in-out infinite' }} />
      )}
      {step >= 0 && step < scene.script.length && (
        <div className="absolute bottom-[52vh] left-1/2 max-w-[520px] -translate-x-1/2 px-4">
          <div className="relative rounded-3xl bg-white/95 px-6 py-4 text-center text-2xl font-black text-orange-800 shadow-2xl">
            “{currentLine}”
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 border-x-[14px] border-t-[16px] border-x-transparent border-t-white/95" />
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
  const holdTimer = useRef<number | null>(null);
  const c = CAST[scene.who];
  const repeatWord = scene.repeat ?? scene.line;

  useEffect(() => { cueSpeak(scene.teacher, 'teacher'); }, [scene.id]);

  const tapCharacter = async () => {
    if (phase !== 'idle') return;
    sfx.pop();
    setPhase('talking');
    await safeSpeak(scene.line, scene.who);
    setTimeout(() => setPhase('repeat'), 500);
  };
  const hearRepeat = async () => { sfx.click(); setHeardRepeat((n) => n + 1); await safeSpeak(repeatWord, scene.who); };
  const replayIntro = async () => { sfx.click(); await safeSpeak(scene.line, scene.who); };
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
      {phase === 'idle' && <button onClick={tapCharacter} aria-label={`Tap ${c.name} to say hello`} className="absolute inset-0 z-10 h-[60vh] w-full cursor-pointer bg-transparent" />}
      {phase === 'idle' && (
        <div className="pointer-events-none absolute inset-x-0 top-[26vh] z-10 grid place-items-center">
          <div className="relative grid h-40 w-40 place-items-center" style={{ animation: 'lep1-wiggle 3s ease-in-out infinite' }}>
            <span className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${c.color}55, transparent 65%)`, animation: 'lep1-ping 2s ease-out infinite' }} />
            <span className="absolute inset-6 rounded-full border-4" style={{ borderColor: c.color, animation: 'lep1-ping 2s ease-out 0.4s infinite' }} />
          </div>
        </div>
      )}
      {scene.phonics && (
        <span className="absolute right-3 top-16 z-20 grid h-16 w-16 place-items-center rounded-full bg-white text-3xl font-black shadow-2xl ring-4" style={{ color: c.color, borderColor: c.color, animation: 'lep1-wiggle 3s ease-in-out infinite' }}>
          {scene.phonics.toUpperCase()}
        </span>
      )}
      {xpBurst && (
        <div className="pointer-events-none absolute inset-x-0 top-[32vh] z-30 grid place-items-center">
          <div className="animate-[lep1-pop-fade_1.1s_ease-out_forwards] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2 text-2xl font-black text-white shadow-2xl">+10 XP 💎</div>
        </div>
      )}
      {phase !== 'idle' && (
        <div className="absolute top-[14vh] right-4 sm:right-8 z-20 max-w-[42%] sm:max-w-[34%]">
          <button onClick={replayIntro} className="group relative w-full rounded-3xl border-4 bg-white px-5 py-4 text-left text-xl sm:text-2xl font-black shadow-2xl active:scale-95" style={{ color: c.color, borderColor: c.color }}>
            <span className="mr-2 text-xl">{c.emoji}</span>“{scene.line}”
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

/* ---------- Sound model ---------- */

function SoundModelScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'sound-model' }>; onNext: () => void }) {
  const c = CAST[scene.who];
  const theme = PROP_THEME[scene.prop ?? scene.who] ?? PROP_THEME.pip;
  const side: 'left' | 'right' = scene.who === 'mia' ? 'right' : 'left';
  const [beat, setBeat] = useState(-1);
  const [opened, setOpened] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<'intro' | 'invite' | 'done'>('intro');
  const [replays, setReplays] = useState(0);

  const runModel = useCallback(async () => {
    setBeat(0);
    await safeSpeak(scene.sound, scene.who);
    setBeat(-1);
    setPhase('invite');
    await safeSpeak(`Now tap to find my /${scene.phoneme.replace(/[/]/g, '')}/ words!`, 'teacher');
  }, [scene.sound, scene.who, scene.phoneme]);

  useEffect(() => {
    setOpened(new Set());
    setPhase('intro');
    safeSpeak(scene.teacher, 'teacher').then(() => runModel());
  }, [scene.id]);

  const openProp = async (i: number) => {
    if (opened.has(i)) { sfx.pop(); await safeSpeak(scene.anchors[i].word, scene.who); return; }
    sfx.reveal();
    const next = new Set(opened); next.add(i); setOpened(next);
    await safeSpeak(scene.anchors[i].word, scene.who);
    if (next.size >= scene.anchors.length) { sfx.gem(); setPhase('done'); }
  };

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
        <div className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-lg ring-2 ring-white/50" style={{ background: `linear-gradient(90deg, ${c.color}, #FEBE4C)` }}>
          🔊 Sound Quest · {scene.letter} says /{scene.phoneme.replace(/[/]/g, '')}/
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 z-30 flex w-[42%] flex-col items-center justify-center gap-4" style={{ [side]: 0 }}>
        <div className="grid place-items-center rounded-[2.5rem] border-8 bg-white/95 font-black shadow-2xl backdrop-blur" style={{ color: theme.tint, borderColor: theme.tint, width: 'min(60vh, 22rem)', height: 'min(60vh, 22rem)', fontSize: 'min(48vh, 18rem)', lineHeight: 1, animation: beat >= 0 ? 'lep1-pop 0.5s ease-out' : 'lep1-wiggle 4s ease-in-out infinite' }}>
          {scene.letter}
        </div>
        <div className="rounded-2xl border-4 bg-white px-5 py-2 text-center text-2xl font-black shadow-xl sm:text-3xl" style={{ color: theme.tint, borderColor: theme.tint }}>
          /{scene.phoneme.replace(/[/]/g, '')}/ /{scene.phoneme.replace(/[/]/g, '')}/
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-10 z-10 flex justify-center px-4">
        <div className="max-w-md rounded-2xl px-4 py-3 text-center text-base font-bold text-white shadow-2xl sm:text-lg" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.35))', backdropFilter: 'blur(8px)', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
          {phase === 'done' ? 'You found them all! Great listening! ⭐' : phase === 'invite' ? `Tap to hear a /${scene.phoneme.replace(/[/]/g, '')}/ word!` : scene.teacher}
        </div>
      </div>
      {scene.anchors.map((a, i) => {
        const base = side === 'left' ? 72 : 28;
        const cols = side === 'left' ? [-8, 12, -6] : [-12, 8, -10];
        const tops = ['14%', '46%', '78%'];
        const rots = [-6, 5, -3];
        const spot = { left: `${base + (cols[i] ?? 0)}%`, top: tops[i] ?? '50%', rot: rots[i] ?? 0 };
        const isOpen = opened.has(i);
        return (
          <div key={a.word} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: spot.left, top: spot.top, animation: `lep1-float 3s ease-in-out ${i * 0.3}s infinite` }}>
            <button
              onClick={() => openProp(i)}
              className={`relative grid place-items-center rounded-3xl bg-transparent p-0 transition-transform active:scale-90 ${isOpen ? 'h-64 w-64 sm:h-80 sm:w-80' : 'h-40 w-40 sm:h-52 sm:w-52'} ${!isOpen && phase === 'invite' ? 'animate-pulse' : ''}`}
              style={{ transform: `rotate(${spot.rot}deg)`, filter: `drop-shadow(0 0 18px ${theme.tint}) drop-shadow(0 12px 24px rgba(0,0,0,0.35))` }}
              aria-label={isOpen ? `Hear ${a.word} again` : `Open ${theme.label}`}
            >
              {isOpen ? (
                <img src={a.img} alt={a.word} className="h-full w-full object-contain animate-[lep1-pop_0.6s_ease-out]" />
              ) : theme.img ? (
                <img src={theme.img} alt={theme.label} className="h-full w-full object-contain" />
              ) : (
                <span className="text-[9rem] sm:text-[11rem]">{theme.closed}</span>
              )}
            </button>
            {isOpen && (
              <div className="mx-auto mt-3 w-max animate-[lep1-pop_0.5s_ease-out] rounded-2xl border-4 bg-white px-6 py-2 text-center text-3xl font-black shadow-xl sm:text-4xl" style={{ color: theme.tint, borderColor: theme.tint }}>
                {a.word}
              </div>
            )}
          </div>
        );
      })}
      <div className="absolute inset-x-0 bottom-4 z-30 mx-auto flex max-w-md gap-2 px-4">
        <button onClick={() => { setReplays((r) => r + 1); runModel(); }} className="flex-1 rounded-full bg-white/95 py-3 text-sm font-bold text-orange-700 shadow-xl ring-2 ring-orange-200 backdrop-blur active:scale-95">
          🔁 Hear sound {replays > 0 && <span className="opacity-60">({replays})</span>}
        </button>
        <button onClick={onNext} disabled={phase !== 'done'} className={`flex-1 rounded-full py-3 text-sm font-black text-white shadow-xl transition ${phase === 'done' ? 'bg-gradient-to-r from-green-500 to-emerald-500 active:scale-95' : 'cursor-not-allowed bg-neutral-400/70'}`}>
          {phase === 'done' ? 'Now you try →' : `Find ${scene.anchors.length - opened.size} more`}
        </button>
      </div>
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

  useEffect(() => { cueSpeak(scene.teacher, 'teacher'); }, [scene.id]);

  const hear = async () => { setHeard((h) => h + 1); await safeSpeak(scene.hearWord ?? scene.word, scene.who); };
  const startHold = () => {
    setHeld(true);
    holdTimer.current = window.setTimeout(() => { setDone(true); setHeld(false); onWin(true); cueSpeak('Amazing! Great voice!', 'pip'); }, 1200);
  };
  const endHold = () => { setHeld(false); if (holdTimer.current) window.clearTimeout(holdTimer.current); };

  return (
    <GlassCard>
      <p className="text-center text-lg font-bold text-orange-700">{scene.teacher}</p>
      <div className="mt-4 grid place-items-center rounded-3xl bg-white/60 p-4">
        <img src={c.img} alt={c.name} width={128} height={128} className="h-32 w-32 object-contain animate-[lep1-hop_1.4s_ease-in-out_infinite]" />
        <p className="mt-2 text-3xl font-black" style={{ color: c.color }}>"{scene.word}"</p>
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

/* ---------- Basket ---------- */

function BasketScene({ scene, onWin, onLose, onNext }: { scene: Extract<Scene, { kind: 'basket' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void }) {
  type Slot = { idx: number; it: typeof scene.items[number]; collected: boolean; dragging: boolean; dx: number; dy: number; flash: 'none' | 'good' | 'bad' };
  const [slots, setSlots] = useState<Slot[]>(() => scene.items.map((it, idx) => ({ idx, it, collected: false, dragging: false, dx: 0, dy: 0, flash: 'none' })));
  const [basketHot, setBasketHot] = useState(false);
  const [gemAwarded, setGemAwarded] = useState(false);
  const basketRef = useRef<HTMLDivElement | null>(null);
  const dragIdx = useRef<number | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const c = CAST[scene.who];
  const got = slots.filter((s) => s.collected).length;
  const done = got >= scene.goal;

  useEffect(() => { cueSpeak(scene.teacher, 'teacher'); }, [scene.id]);
  useEffect(() => {
    if (done && !gemAwarded) { setGemAwarded(true); onWin(true); cueSpeak(`Yes! The ${scene.letter} portal is open!`, scene.who); }
  }, [done, gemAwarded]);

  function onDown(idx: number) {
    return (e: React.PointerEvent<HTMLButtonElement>) => {
      const s = slots.find((x) => x.idx === idx);
      if (!s || s.collected) return;
      sfx.pop();
      cueSpeakOnce(s.it.word, 'teacher');
      dragIdx.current = idx;
      start.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, dragging: true, dx: 0, dy: 0, flash: 'none' } : x)));
    };
  }
  function onMove(e: React.PointerEvent<HTMLButtonElement>) {
    const idx = dragIdx.current;
    if (idx === null) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, dx, dy } : x)));
    const b = basketRef.current?.getBoundingClientRect();
    if (b) setBasketHot(e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom);
  }
  function onUp(e: React.PointerEvent<HTMLButtonElement>) {
    const idx = dragIdx.current;
    dragIdx.current = null;
    setBasketHot(false);
    if (idx === null) return;
    const b = basketRef.current?.getBoundingClientRect();
    const dropped = b && e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom;
    setSlots((p) => p.map((x) => {
      if (x.idx !== idx) return x;
      if (!dropped) return { ...x, dragging: false, dx: 0, dy: 0 };
      if (x.it.hit) { sfx.match(); cueSpeak(`${scene.phoneme}! ${x.it.word}!`, scene.who); return { ...x, collected: true, dragging: false, dx: 0, dy: 0, flash: 'good' }; }
      sfx.wrong(); cueSpeak(`No, no ${scene.phoneme}. Try again!`, scene.who); onLose();
      return { ...x, dragging: false, dx: 0, dy: 0, flash: 'bad' };
    }));
    window.setTimeout(() => setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, flash: 'none' } : x))), 700);
  }

  const orbit = [
    { left: '12%', top: '42%', rot: -8 }, { left: '88%', top: '42%', rot: 7 },
    { left: '20%', top: '72%', rot: 4 }, { left: '80%', top: '72%', rot: -5 },
    { left: '50%', top: '84%', rot: -3 },
  ];

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full">
      <div className="pointer-events-none absolute left-4 top-4 z-30 max-w-[260px] rounded-2xl bg-white/95 px-3 py-2 text-sm font-bold text-neutral-800 shadow-xl backdrop-blur sm:max-w-[320px] sm:text-base">{scene.teacher}</div>
      <div ref={basketRef} className={`absolute left-1/2 top-16 z-10 grid h-56 w-56 -translate-x-1/2 place-items-center rounded-full border-4 border-dashed shadow-2xl backdrop-blur transition-all sm:h-72 sm:w-72 ${basketHot ? 'scale-110 border-green-400 bg-green-100/90' : 'border-white/80 bg-white/40'}`}>
        <div className={`absolute inset-0 rounded-full opacity-70 ${done ? '' : 'animate-pulse'}`} style={{ background: `radial-gradient(circle at center, ${c.color}cc, transparent 70%)` }} />
        <div className="relative flex flex-col items-center gap-1 text-center">
          <span className="grid h-28 w-28 place-items-center rounded-3xl text-7xl font-black text-white shadow-lg sm:h-36 sm:w-36 sm:text-8xl" style={{ background: `linear-gradient(135deg, ${c.color}, #FEBE4C)` }}>{scene.letter}</span>
          <p className="text-lg font-black leading-none" style={{ color: c.color }}>{scene.phoneme}</p>
          <p className="text-xs font-bold text-orange-700">⭐ {got}/{scene.goal}</p>
        </div>
      </div>
      {slots.map((s, i) => {
        const pos = orbit[i % orbit.length];
        if (s.collected) return <div key={s.idx} className="absolute grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-green-300/60 text-3xl opacity-60 ring-2 ring-green-400 backdrop-blur" style={{ left: pos.left, top: pos.top }}>✅</div>;
        const glow = s.flash === 'bad' ? 'drop-shadow-[0_0_14px_rgba(239,68,68,0.9)] animate-[lep1-shake_0.4s_ease-in-out]' : s.flash === 'good' ? 'drop-shadow-[0_0_18px_rgba(34,197,94,0.9)]' : 'drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)]';
        return (
          <button key={s.idx} onPointerDown={onDown(s.idx)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            className={`absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 touch-none select-none bg-transparent p-0 transition sm:h-48 sm:w-48 ${glow} ${s.dragging ? 'z-20 scale-125' : 'hover:scale-110 animate-[lep1-float_3s_ease-in-out_infinite]'}`}
            style={{ left: pos.left, top: pos.top, animationDelay: `${(i % 4) * 0.3}s`, transform: s.dragging ? `translate(calc(-50% + ${s.dx}px), calc(-50% + ${s.dy}px)) scale(1.25) rotate(-4deg)` : `translate(-50%, -50%) rotate(${pos.rot}deg)`, transition: s.dragging ? 'none' : 'transform 250ms cubic-bezier(0.34,1.56,0.64,1)' }}
            aria-label={s.it.word}
          >
            {s.it.img ? <img src={s.it.img} alt={s.it.word} draggable={false} className="pointer-events-none h-full w-full object-contain" /> : <span className="pointer-events-none grid h-full w-full place-items-center text-7xl">{s.it.emoji}</span>}
          </button>
        );
      })}
      {done && (
        <div className="absolute inset-x-0 top-4 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95 animate-[lep1-slide-up_0.4s_ease-out]">✨ Portal open! Next →</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Trace ---------- */

function TraceScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'trace' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [done, setDone] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [strokes, setStrokes] = useState<string[]>([]);
  const currentPath = useRef<string>('');

  type TraceSegment = { from: { x: number; y: number }; to: { x: number; y: number } };
  const TRACE_SEGMENTS: Record<string, TraceSegment[]> = {
    H: [{ from: { x: 170, y: 130 }, to: { x: 170, y: 470 } }, { from: { x: 430, y: 130 }, to: { x: 430, y: 470 } }, { from: { x: 175, y: 305 }, to: { x: 425, y: 305 } }],
    M: [{ from: { x: 155, y: 470 }, to: { x: 195, y: 130 } }, { from: { x: 195, y: 130 }, to: { x: 300, y: 455 } }, { from: { x: 300, y: 455 }, to: { x: 405, y: 130 } }, { from: { x: 405, y: 130 }, to: { x: 455, y: 235 } }],
  };
  const HIT_RADIUS = 72;
  const BUCKETS_PER_SEGMENT = 16;
  const MIN_SEGMENT_COVERAGE = 0.38;
  const segments = TRACE_SEGMENTS[scene.letter.toUpperCase()] ?? TRACE_SEGMENTS.H;
  const segmentBuckets = useRef<Set<number>[]>(segments.map(() => new Set<number>()));
  const [zonesDone, setZonesDone] = useState(0);

  useEffect(() => {
    segmentBuckets.current = segments.map(() => new Set<number>());
    setZonesDone(0); setStrokes([]); setDone(false);
    cueSpeak(scene.teacher, 'teacher');
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
      if (best && best.distance <= HIT_RADIUS) {
        const bucket = Math.max(0, Math.min(BUCKETS_PER_SEGMENT - 1, Math.floor(best.t * BUCKETS_PER_SEGMENT)));
        const before = segmentBuckets.current[best.i].size;
        segmentBuckets.current[best.i].add(bucket);
        if (segmentBuckets.current[best.i].size !== before) changed = true;
      }
    }
    const doneCount = segmentBuckets.current.filter((set) => set.size / BUCKETS_PER_SEGMENT >= MIN_SEGMENT_COVERAGE).length;
    if (changed) setZonesDone(doneCount);
    if (doneCount >= segments.length && !done) {
      setDone(true); sfx.gem(); onWin(true);
      void safeSpeak(`${scene.letter}! ${scene.phoneme} ${scene.word}!`, scene.who);
      void playLetterPhonic(scene.letter);
    }
  };
  const end = () => { setDrawing(false); lastPoint.current = null; };
  const reset = () => { setStrokes([]); segmentBuckets.current = segments.map(() => new Set<number>()); setZonesDone(0); setDone(false); };

  const pct = Math.round((zonesDone / segments.length) * 100);
  const c = CAST[scene.who];

  return (
    <div className="relative flex h-[calc(100vh-8rem)] w-full items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
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
          onClick={() => { if (!done) { setDone(true); sfx.gem(); onWin(true); void safeSpeak(`${scene.letter}! ${scene.phoneme} ${scene.word}!`, scene.who); } onNext(); }}
          className="mt-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-3 text-lg font-black text-white shadow-2xl active:scale-95"
        >
          Great tracing! ⭐ Next
        </button>
      </div>
    </div>
  );
}

/* ---------- Sound sort ---------- */

function SoundSortScene({ scene, onWin, onLose, onNext }: { scene: Extract<Scene, { kind: 'sound-sort' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void }) {
  type Slot = { idx: number; it: typeof scene.items[number]; collected: boolean; dragging: boolean; dx: number; dy: number; flash: 'none' | 'good' | 'bad' };
  const [slots, setSlots] = useState<Slot[]>(() => scene.items.map((it, idx) => ({ idx, it, collected: false, dragging: false, dx: 0, dy: 0, flash: 'none' })));
  const [hotLetter, setHotLetter] = useState<string | null>(null);
  const [gemAwarded, setGemAwarded] = useState(false);
  const targetRefs = useRef<Record<string, HTMLElement | null>>({});
  const dragIdx = useRef<number | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const done = slots.every((s) => s.collected);

  useEffect(() => { cueSpeak(scene.teacher, 'teacher'); }, [scene.id]);
  useEffect(() => { if (done && !gemAwarded) { setGemAwarded(true); onWin(true); cueSpeak('Amazing! All sounds sorted!', 'teacher'); } }, [done, gemAwarded]);

  function hitTest(x: number, y: number, itemEl?: Element | null): string | null {
    let cx = x, cy = y;
    if (itemEl) { const r = (itemEl as HTMLElement).getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
    const PAD = 48;
    let best: { letter: string; dist: number } | null = null;
    for (const t of scene.targets) {
      const el = targetRefs.current[t.letter];
      if (!el) continue;
      const b = el.getBoundingClientRect();
      const inside = (cx >= b.left - PAD && cx <= b.right + PAD && cy >= b.top - PAD && cy <= b.bottom + PAD) || (x >= b.left - PAD && x <= b.right + PAD && y >= b.top - PAD && y <= b.bottom + PAD);
      if (!inside) continue;
      const d = Math.hypot(cx - (b.left + b.width / 2), cy - (b.top + b.height / 2));
      if (!best || d < best.dist) best = { letter: t.letter, dist: d };
    }
    return best?.letter ?? null;
  }

  const onDown = (idx: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = slots.find((x) => x.idx === idx);
    if (!s || s.collected) return;
    sfx.pop();
    const speaker = scene.targets.find((t) => t.letter === s.it.letter)?.who ?? 'pip';
    cueSpeakOnce(s.it.word, speaker);
    dragIdx.current = idx;
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, dragging: true, dx: 0, dy: 0, flash: 'none' } : x)));
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const idx = dragIdx.current;
    if (idx === null) return;
    const dx = e.clientX - start.current.x, dy = e.clientY - start.current.y;
    setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, dx, dy } : x)));
    setHotLetter(hitTest(e.clientX, e.clientY, e.currentTarget));
  };
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const idx = dragIdx.current;
    dragIdx.current = null;
    const dropLetter = hitTest(e.clientX, e.clientY, e.currentTarget);
    setHotLetter(null);
    if (idx === null) return;
    setSlots((p) => p.map((x) => {
      if (x.idx !== idx) return x;
      if (!dropLetter) return { ...x, dragging: false, dx: 0, dy: 0 };
      if (dropLetter === x.it.letter) { sfx.match(); return { ...x, collected: true, dragging: false, dx: 0, dy: 0, flash: 'good' }; }
      sfx.wrong(); cueSpeak('Try another sound!', 'teacher'); onLose();
      return { ...x, dragging: false, dx: 0, dy: 0, flash: 'bad' };
    }));
    window.setTimeout(() => setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, flash: 'none' } : x))), 700);
  };

  const orbit = scene.items.length === 6
    ? [{ left: '16%', top: '18%', rot: -6 }, { left: '50%', top: '12%', rot: 4 }, { left: '84%', top: '20%', rot: -3 }, { left: '18%', top: '84%', rot: 5 }, { left: '50%', top: '90%', rot: -4 }, { left: '82%', top: '84%', rot: 3 }]
    : [{ left: '14%', top: '22%', rot: -6 }, { left: '38%', top: '16%', rot: 4 }, { left: '62%', top: '16%', rot: -3 }, { left: '86%', top: '22%', rot: 5 }, { left: '18%', top: '82%', rot: 4 }, { left: '42%', top: '88%', rot: -5 }, { left: '58%', top: '88%', rot: 3 }, { left: '82%', top: '82%', rot: -4 }];

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full">
      <div className="pointer-events-none absolute inset-0 z-0 bg-white/25 backdrop-blur-md" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-bold text-orange-700 shadow-xl backdrop-blur sm:text-base">🎧 {scene.teacher}</div>
      <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center gap-6 px-4 sm:gap-10">
        {scene.targets.map((t) => {
          const c = CAST[t.who];
          const hot = hotLetter === t.letter;
          const collected = slots.filter((s) => s.collected && s.it.letter === t.letter).length;
          const total = slots.filter((s) => s.it.letter === t.letter).length;
          return (
            <button key={t.letter} type="button" ref={(el) => { targetRefs.current[t.letter] = el; }} onClick={() => void playLetterPhonic(t.letter)}
              className={`relative grid h-40 w-40 place-items-center rounded-full border-4 border-dashed shadow-2xl backdrop-blur transition-all sm:h-48 sm:w-48 cursor-pointer active:scale-95 ${hot ? 'scale-110 border-green-400 bg-green-100/90' : 'border-white/80 bg-white/40'}`}>
              <div className="pointer-events-none absolute inset-0 animate-pulse rounded-full opacity-60" style={{ background: `radial-gradient(circle at center, ${c.color}cc, transparent 70%)` }} />
              <div className="pointer-events-none relative flex flex-col items-center gap-1">
                <span className="grid h-24 w-24 place-items-center rounded-3xl text-6xl font-black text-white shadow-lg sm:h-28 sm:w-28 sm:text-7xl" style={{ background: `linear-gradient(135deg, ${c.color}, #FEBE4C)` }}>{t.letter}</span>
                <p className="text-sm font-black leading-none" style={{ color: c.color }}>{t.phoneme}</p>
                <p className="text-[10px] font-bold text-orange-700">⭐ {collected}/{total}</p>
              </div>
            </button>
          );
        })}
      </div>
      {slots.map((s, i) => {
        const pos = orbit[i % orbit.length];
        if (s.collected) return <div key={s.idx} className="absolute grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-green-300/60 text-4xl opacity-70 ring-2 ring-green-400 backdrop-blur" style={{ left: pos.left, top: pos.top }}>✅</div>;
        const glow = s.flash === 'bad' ? 'drop-shadow-[0_0_14px_rgba(239,68,68,0.9)] animate-[lep1-shake_0.4s_ease-in-out]' : s.flash === 'good' ? 'drop-shadow-[0_0_18px_rgba(34,197,94,0.9)]' : 'drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)]';
        return (
          <button key={s.idx} onPointerDown={onDown(s.idx)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            className={`absolute h-56 w-56 sm:h-72 sm:w-72 -translate-x-1/2 -translate-y-1/2 touch-none select-none bg-transparent p-0 transition ${glow} ${s.dragging ? 'z-20 scale-125' : 'hover:scale-110 animate-[lep1-float_3s_ease-in-out_infinite]'}`}
            style={{ left: pos.left, top: pos.top, animationDelay: `${(i % 4) * 0.3}s`, transform: s.dragging ? `translate(calc(-50% + ${s.dx}px), calc(-50% + ${s.dy}px)) scale(1.25) rotate(-4deg)` : `translate(-50%, -50%) rotate(${pos.rot}deg)`, transition: s.dragging ? 'none' : 'transform 250ms cubic-bezier(0.34,1.56,0.64,1)' }}
            aria-label={s.it.word}
          >
            {s.it.img ? <img src={s.it.img} alt={s.it.word} draggable={false} className="pointer-events-none h-full w-full object-contain" /> : <span className="pointer-events-none grid h-full w-full place-items-center text-6xl">{s.it.emoji}</span>}
          </button>
        );
      })}
      {done && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95 animate-[lep1-slide-up_0.4s_ease-out]">✨ All sounds matched! Next →</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Word build ---------- */

function WordBuildScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'word-build' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [filled, setFilled] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const r = scene.rounds[round];
  const total = scene.rounds.length;
  const complete = round >= total;

  useEffect(() => { cueSpeak(scene.teacher, 'teacher'); }, [scene.id]);
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
      <div className="relative flex h-[calc(100vh-8rem)] w-full items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <button onClick={onNext} className="relative z-10 animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">You built {total} words! ⭐ Next</button>
      </div>
    );
  }

  const letters = r.word.split('');
  return (
    <div className="relative flex h-[calc(100vh-8rem)] w-full items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
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
          {r.choices.map((L) => (
            <button key={L} onClick={() => tap(L)} disabled={!!filled} className={`grid h-20 w-20 place-items-center rounded-2xl border-4 border-white text-4xl font-black text-white shadow-2xl transition active:scale-95 disabled:opacity-40 sm:h-24 sm:w-24 sm:text-5xl ${wrong === L ? 'animate-[lep1-shake_0.4s_ease-out]' : ''}`} style={{ background: L === 'H' ? 'linear-gradient(135deg,#FE6A2F,#FF8A4C)' : 'linear-gradient(135deg,#B85CD1,#D57BE6)' }}>{L}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Who said it ---------- */

function WhoSaidItScene({ scene, onWin, onNext }: { scene: Extract<Scene, { kind: 'who-said-it' }>; onWin: (gem: boolean) => void; onNext: () => void }) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<'prompt' | 'playing' | 'repeat' | 'done'>('prompt');
  const [tapped, setTapped] = useState<CharKey | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const total = scene.rounds.length;
  const finished = round >= total;

  const roster = useMemo(() => {
    const seen = new Set<string>();
    const list: CharKey[] = [];
    for (const r of scene.rounds) if (!seen.has(r.who)) { seen.add(r.who); list.push(r.who); }
    return list;
  }, [scene.rounds]);

  const spots = useMemo(() => {
    const n = roster.length;
    const leftPad = n <= 3 ? 18 : 10;
    const usable = 100 - leftPad * 2;
    const step = n > 1 ? usable / (n - 1) : 0;
    const sizeVh = n <= 3 ? 62 : 54;
    const widthVw = n <= 3 ? 30 : 24;
    return roster.map((who, i) => ({ who, leftPct: leftPad + step * i, bottomPct: 12, sizeVh, widthVw }));
  }, [roster]);

  const target = scene.rounds[round]?.who ?? null;
  const targetLine = scene.rounds[round]?.line ?? '';

  useEffect(() => {
    if (phase !== 'prompt' || finished || !target) return;
    cueSpeak(`Tap ${CAST[target].name}. Listen and repeat!`, 'teacher');
  }, [phase, finished, target]);

  const pick = async (choice: CharKey) => {
    if (phase !== 'prompt' || !target) return;
    setTapped(choice);
    if (choice !== target) { sfx.wrong(); await safeSpeak(`Try again. Tap ${CAST[target].name}.`, 'teacher'); setTapped(null); return; }
    sfx.match(); setPhase('playing');
    await safeSpeak(targetLine, target);
    setPhase('repeat');
    await new Promise((r) => window.setTimeout(r, 1600));
    const next = round + 1;
    if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
    setTapped(null); setRound(next); setPhase(next >= total ? 'done' : 'prompt');
  };

  const replayModel = async () => { if (target) await safeSpeak(targetLine, target); };

  return (
    <div className="fixed inset-0 z-10 h-screen w-screen overflow-hidden">
      {spots.map((s) => {
        const c = CAST[s.who];
        const isTarget = !finished && s.who === target;
        const isTapped = tapped === s.who;
        const speaking = (phase === 'playing' || phase === 'repeat') && s.who === target;
        const scale = isTapped ? 1.12 : speaking ? 1.08 : 1;
        return (
          <button key={s.who} onClick={() => pick(s.who)} disabled={phase !== 'prompt'} aria-label={`Tap ${c.name}`}
            className="absolute z-20 -translate-x-1/2 grid place-items-end cursor-pointer disabled:cursor-default"
            style={{ left: `${s.leftPct}%`, bottom: `${s.bottomPct}%`, height: `${s.sizeVh}vh`, width: `min(${s.widthVw}vw, ${s.sizeVh * 0.68}vh)`, transform: `translateX(-50%) scale(${scale})`, transition: 'transform 0.3s ease-out', transformOrigin: '50% 100%' }}
          >
            <img src={c.img} alt={c.name} className="pointer-events-none block h-full w-full select-none object-contain" style={{ filter: speaking ? 'drop-shadow(0 12px 18px rgba(254,106,47,0.85))' : 'drop-shadow(0 10px 14px rgba(0,0,0,0.4))' }} />
            <span className={`pointer-events-none absolute left-1/2 -bottom-6 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-black shadow-lg whitespace-nowrap ${isTarget && phase === 'prompt' ? 'bg-orange-500 text-white animate-pulse' : 'bg-white/90 text-neutral-800'}`}>{c.name}</span>
          </button>
        );
      })}
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
        <div className="pointer-events-auto rounded-full bg-white/90 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-lg backdrop-blur">🎧 Listen & repeat — Round {Math.min(round + 1, total)} / {total}</div>
      </div>
      <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 px-6">
        {!finished && phase === 'prompt' && target && (
          <div className="w-full max-w-md rounded-3xl bg-white/85 p-3 text-center shadow-2xl backdrop-blur-md">
            <p className="text-base font-bold text-neutral-800">👉 Tap <span className="text-orange-600">{CAST[target].name}</span> to hear them.</p>
          </div>
        )}
        {!finished && (phase === 'playing' || phase === 'repeat') && (
          <button onClick={replayModel} className="rounded-full bg-white/90 px-5 py-2 text-sm font-black text-orange-700 shadow-md backdrop-blur active:scale-95">🔊 Hear again</button>
        )}
        {finished && <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">Great job! Next →</button>}
      </div>
    </div>
  );
}

/* ---------- Gather ---------- */

function GatherScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'gather' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const IMG_W = 1920, IMG_H = 1152;
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [spoken, setSpoken] = useState<Set<CharKey>>(new Set());
  const [camActive, setCamActive] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const sync = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);
  useEffect(() => { cueSpeak(scene.teacher, 'teacher'); }, [scene.id]);
  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  const project = (x: number, y: number, r: number) => {
    const w = viewport.w || IMG_W, h = viewport.h || IMG_H;
    return { left: (x / IMG_W) * w, top: (y / IMG_H) * h, size: (r / IMG_W) * w * 2 };
  };
  const stagePos = project(scene.stage.x, scene.stage.y, scene.stage.r);

  const tapHotspot = async (h: (typeof scene.hotspots)[number]) => { sfx.match(); setSpoken((s) => new Set(s).add(h.who)); await safeSpeak(h.line, h.who); };

  const startCamera = async () => {
    setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); }
      setCamActive(true); sfx.gem();
      if (!gemDone) { setGemDone(true); onWin(true); }
      await safeSpeak('Your turn! Say: Hello, my name is...', 'teacher');
    } catch {
      setCamError('Camera unavailable — you can still say your name out loud!');
      setCamActive(true);
      if (!gemDone) { setGemDone(true); onWin(true); }
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => { if (camActive) return; (e.target as Element).setPointerCapture?.(e.pointerId); setDragging(true); setDragPos({ x: e.clientX, y: e.clientY }); };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => { if (!dragging) return; setDragPos({ x: e.clientX, y: e.clientY }); };
  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    setDragging(false);
    const dx = e.clientX - stagePos.left, dy = e.clientY - stagePos.top;
    const inside = Math.hypot(dx, dy) <= stagePos.size / 2 + 40;
    setDragPos(null);
    if (inside) void startCamera(); else sfx.wrong();
  };
  const allSpoken = spoken.size >= scene.hotspots.length;

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full">
      {scene.hotspots.map((h) => {
        const p = project(h.x, h.y, h.r);
        return <button key={h.who} onClick={() => tapHotspot(h)} aria-label={`Tap ${CAST[h.who].name}`} className="fixed z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent" style={{ left: p.left, top: p.top, width: p.size, height: p.size }}><span className="sr-only">{CAST[h.who].name}</span></button>;
      })}
      {scene.hotspots.map((h) => {
        if (!spoken.has(h.who)) return null;
        const p = project(h.x, h.y, h.r);
        const c = CAST[h.who];
        return (
          <div key={`bubble-${h.who}`} className="fixed z-30 -translate-x-1/2 animate-[lep1-slide-up_0.35s_ease-out]" style={{ left: p.left, top: p.top - p.size / 2 - 20 }}>
            <div className="relative max-w-[16rem] rounded-2xl bg-white/95 px-4 py-2 text-center text-sm font-black shadow-2xl ring-4 backdrop-blur sm:text-base" style={{ color: c.color, borderColor: c.color }}>{h.line}</div>
          </div>
        );
      })}
      <div className="fixed z-10 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: stagePos.left, top: stagePos.top, width: stagePos.size, height: stagePos.size, boxShadow: camActive ? '0 0 0 6px rgba(59,130,246,0.7), 0 0 60px rgba(59,130,246,0.55)' : dragging ? '0 0 0 8px rgba(254,106,47,0.85), 0 0 60px rgba(254,106,47,0.55)' : '0 0 0 4px rgba(255,255,255,0.7), 0 0 30px rgba(255,255,255,0.4)', transition: 'box-shadow 0.2s' }}>
        {camActive ? (
          <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white shadow-2xl bg-black">
            <video ref={videoRef} playsInline muted autoPlay className="h-full w-full object-cover" style={{ transform: 'scaleX(-1)' }} />
            <span className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-black uppercase text-white shadow-lg">You ⭐</span>
          </div>
        ) : (
          <div className="pointer-events-none flex h-full w-full items-center justify-center"><span className="text-4xl animate-bounce">📸</span></div>
        )}
      </div>
      {!camActive && (
        <button onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
          className="fixed z-30 flex select-none items-center gap-2 rounded-full bg-white/95 px-4 py-3 font-black text-orange-700 shadow-2xl backdrop-blur-md ring-4 ring-orange-400 active:scale-95"
          style={{ left: dragPos ? dragPos.x : 24, top: dragPos ? dragPos.y : (viewport.h || 600) - 120, transform: dragging ? 'translate(-50%, -50%) scale(1.1)' : undefined, touchAction: 'none', transition: dragging ? 'none' : 'transform 0.15s' }}
        >
          <span className="text-3xl">🎥</span><span className="text-sm">Drag me!</span>
        </button>
      )}
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
        <div className="pointer-events-auto max-w-lg rounded-3xl bg-white/90 px-5 py-3 text-center text-sm font-black text-orange-700 shadow-lg backdrop-blur">
          {camActive ? '🌟 Your turn! Say: Hello, my name is ______.' : allSpoken ? 'Great! Now drag 🎥 to the daisy circle for your turn.' : scene.teacher}
        </div>
      </div>
      {camError && <div className="absolute inset-x-0 bottom-24 flex justify-center px-4"><div className="rounded-2xl bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-900 shadow">{camError}</div></div>}
      <div className="absolute inset-x-0 bottom-6 flex justify-center">
        <button onClick={() => { streamRef.current?.getTracks().forEach((t) => t.stop()); onNext(); }} disabled={!camActive && !allSpoken} className="rounded-full bg-orange-500 px-8 py-3 text-lg font-black text-white shadow-2xl transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-orange-600">
          {camActive ? 'I did it! ➜' : 'Next ➜'}
        </button>
      </div>
    </div>
  );
}

/* ---------- Memory ---------- */

function MemoryScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'memory' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  type Card = { key: string; pairId: string; label: string; emoji: string; img?: string };
  const deck = useMemo<Card[]>(() => {
    const base = scene.pairs.flatMap((p) => [{ key: `${p.id}-a`, pairId: p.id, label: p.label, emoji: p.emoji, img: p.img }, { key: `${p.id}-b`, pairId: p.id, label: p.label, emoji: p.emoji, img: p.img }]);
    return base.map((c, i) => ({ c, r: (i * 9301 + 49297) % 233280 })).sort((a, b) => a.r - b.r).map((x) => x.c);
  }, [scene.id]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [gemDone, setGemDone] = useState(false);

  useEffect(() => { cueSpeak(scene.teacher, 'teacher'); }, [scene.id]);

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
    <div className="relative flex h-[calc(100vh-8rem)] w-full items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
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
                  {card.img ? <img src={card.img} alt="" className="h-3/4 w-3/4 object-contain" draggable={false} /> : <span className="text-4xl">{card.emoji}</span>}
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

/* ---------- Dash ---------- */

type DashItem = { id: number; word: string; letter: string; img?: string; emoji: string; lane: number; x: number; correct: boolean; taken: boolean };

function DashScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'dash' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [rings, setRings] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [time, setTime] = useState(scene.seconds);
  const [status, setStatus] = useState<'ready' | 'play' | 'win' | 'lose'>('ready');
  const [items, setItems] = useState<DashItem[]>([]);
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null);
  const nextIdRef = useRef(1);
  const gemDoneRef = useRef(false);
  const heroSrc = CAST[scene.who].img;

  useEffect(() => { cueSpeak(scene.teacher, 'teacher'); }, [scene.id]);

  const start = () => { setRings(0); setHearts(3); setTime(scene.seconds); setItems([]); gemDoneRef.current = false; setStatus('play'); };

  useEffect(() => {
    if (status !== 'play') return;
    const spawn = window.setInterval(() => {
      const pick = scene.items[Math.floor(Math.random() * scene.items.length)];
      setItems((prev) => [...prev, { id: nextIdRef.current++, word: pick.word, letter: pick.letter, img: pick.img, emoji: pick.emoji, lane: Math.floor(Math.random() * 3), x: -8, correct: pick.letter === scene.targetLetter, taken: false }]);
    }, 1100);
    return () => window.clearInterval(spawn);
  }, [status]);

  useEffect(() => {
    if (status !== 'play') return;
    const t = window.setInterval(() => {
      setItems((prev) => prev.map((it) => (it.taken ? it : { ...it, x: it.x + 1.6 })).filter((it) => it.x < 108));
      setTime((s) => (s > 0 ? s - 0.1 : 0));
    }, 100);
    return () => window.clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (status !== 'play') return;
    if (rings >= scene.goal) { setStatus('win'); sfx.gem(); if (!gemDoneRef.current) { gemDoneRef.current = true; onWin(true); } }
    else if (hearts <= 0 || time <= 0) { setStatus('lose'); sfx.wrong(); onLose(); }
  }, [rings, hearts, time, status]);

  const tap = (id: number) => {
    if (status !== 'play') return;
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (!it || it.taken) return prev;
      if (it.correct) { sfx.ring(); setRings((r) => r + 1); setFlash('good'); void safeSpeak(it.word, scene.who); }
      else { sfx.wrong(); setHearts((h) => h - 1); setFlash('bad'); }
      window.setTimeout(() => setFlash(null), 200);
      return prev.map((x) => (x.id === id ? { ...x, taken: true } : x));
    });
  };

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 40px, rgba(255,255,255,0.35) 40px 42px)', animation: 'lep1-dashScroll 0.6s linear infinite' }} />
      <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex items-center justify-between px-4">
        <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-black text-orange-700 shadow-xl backdrop-blur">💍 {rings} / {scene.goal}</div>
        <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-black text-pink-600 shadow-xl backdrop-blur">{'❤️'.repeat(Math.max(0, hearts))}</div>
        <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-black text-slate-700 shadow-xl backdrop-blur">⏱ {Math.ceil(time)}s</div>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-16 z-30 -translate-x-1/2 rounded-full bg-orange-500 px-5 py-2 text-base font-black text-white shadow-2xl">
        Tap only <span className="mx-1 rounded-lg bg-white px-2 py-0.5 text-orange-600">{scene.targetLetter}</span> {scene.targetPhoneme}
      </div>
      {flash && <div className={`pointer-events-none absolute inset-0 z-20 ${flash === 'good' ? 'bg-yellow-200/30' : 'bg-rose-500/25'}`} />}
      <div className="pointer-events-none absolute left-4 bottom-16 z-20 sm:left-8" style={{ animation: 'lep1-heroBounce 0.45s ease-in-out infinite' }}>
        <img src={heroSrc} alt={scene.who} className="h-40 w-40 object-contain drop-shadow-2xl sm:h-52 sm:w-52" draggable={false} />
      </div>
      {[0, 1, 2].map((lane) => (
        <div key={lane} className="absolute left-0 right-0" style={{ top: `${30 + lane * 20}%`, height: 0 }}>
          {items.filter((it) => it.lane === lane && !it.taken).map((it) => (
            <button key={it.id} onClick={() => tap(it.id)} className="absolute grid h-24 w-24 -translate-y-1/2 place-items-center rounded-3xl border-4 border-white bg-white/95 shadow-2xl active:scale-90 sm:h-28 sm:w-28" style={{ right: `${it.x}%`, animation: 'lep1-itemBob 0.8s ease-in-out infinite' }} aria-label={it.word}>
              {it.img ? <img src={it.img} alt={it.word} className="h-16 w-16 object-contain sm:h-20 sm:w-20" draggable={false} /> : <span className="text-4xl">{it.emoji}</span>}
              <span className="pointer-events-none absolute -bottom-6 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow">{it.word}</span>
            </button>
          ))}
        </div>
      ))}
      {status === 'ready' && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-black/40 backdrop-blur-sm">
          <button onClick={start} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">▶ Start Dash!</button>
        </div>
      )}
      {(status === 'win' || status === 'lose') && (
        <div className="absolute inset-x-0 bottom-6 z-40 flex flex-col items-center gap-3 px-6">
          <div className={`rounded-2xl px-5 py-2 text-lg font-black text-white shadow-xl ${status === 'win' ? 'bg-emerald-500' : 'bg-rose-500'}`}>{status === 'win' ? `⭐ Great dash! ${rings} rings!` : `Nice try! ${rings} rings.`}</div>
          <div className="flex gap-3">
            <button onClick={start} className="rounded-full bg-white/95 px-6 py-3 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔁 Again</button>
            <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-base font-black text-white shadow-2xl active:scale-95">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Feelings ---------- */

function FeelingsScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'feelings' }>; onNext: () => void }) {
  const [pick, setPick] = useState<number | null>(null);
  useEffect(() => { cueSpeak(scene.teacher, 'teacher'); }, [scene.id]);
  const choose = async (idx: number) => {
    setPick(idx);
    const label = scene.options[idx].label.toLowerCase();
    const voice: Character = label.includes('happy') ? 'mia' : label.includes('sad') ? 'bella' : 'pip';
    await safeSpeak(scene.options[idx].reply, voice);
  };
  return (
    <GlassCard>
      <p className="text-center text-lg font-bold text-orange-700">{scene.teacher}</p>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {scene.options.map((o, idx) => (
          <button key={idx} onClick={() => choose(idx)} className={`grid aspect-square place-items-center rounded-3xl shadow-md transition active:scale-95 ${pick === idx ? 'bg-orange-200 ring-4 ring-orange-500 scale-105' : 'bg-white hover:scale-105'}`}>
            <span className="text-6xl">{o.emoji}</span>
            <span className="mt-1 text-sm font-bold text-neutral-700">{o.label}</span>
          </button>
        ))}
      </div>
      <PrimaryButton onClick={onNext} disabled={pick === null}>Finish 🎉</PrimaryButton>
    </GlassCard>
  );
}

/* ---------- Puzzle ---------- */

function PuzzleScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'puzzle' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [pick, setPick] = useState<CharKey | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;
  const GRID = 9;

  useEffect(() => {
    if (finished) return;
    setRevealed(new Set()); setPick(null); setCorrect(null);
    if (round === 0) cueSpeak(scene.teacher, 'teacher');
  }, [round, finished]);

  const tapPiece = (i: number) => { if (!r || correct !== null) return; setRevealed((s) => { const c = new Set(s); c.add(i); return c; }); sfx.match(); };
  const guess = async (who: CharKey) => {
    if (!r || correct !== null) return;
    setPick(who);
    const ok = who === r.who;
    setCorrect(ok);
    if (ok) {
      sfx.match(); setRevealed(new Set(Array.from({ length: GRID }, (_, i) => i))); sfx.gem();
      window.setTimeout(() => { const next = round + 1; if (next >= total && !gemDone) { setGemDone(true); onWin(true); } setRound(next); }, 2200);
    } else { sfx.wrong(); onLose(); window.setTimeout(() => { setPick(null); setCorrect(null); }, 700); }
  };

  if (finished) {
    return (
      <div className="relative flex h-[calc(100vh-8rem)] w-full items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
        <button onClick={onNext} className="relative z-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">You guessed them all! ⭐ Next</button>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-8rem)] w-full flex-col items-center justify-center gap-5 bg-cover bg-center px-4" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">🧩 {scene.teacher} <span className="ml-1 opacity-70">({round + 1}/{total})</span></div>
      <div className="relative z-10 mt-16 h-[46vh] w-[46vh] max-w-[92vw] overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
        <img src={r!.emotion ? getEmotionSprite(r!.who, r!.emotion) : r!.img} alt="mystery friend" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {Array.from({ length: GRID }, (_, i) => {
            const isRev = revealed.has(i);
            return <button key={i} onClick={() => tapPiece(i)} disabled={isRev} className={`border border-white/50 transition-opacity duration-300 ${isRev ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ background: 'linear-gradient(135deg,#FE6A2F,#FEBE4C)' }} aria-label={`Reveal piece ${i + 1}`}><span className="text-2xl font-black text-white drop-shadow">?</span></button>;
          })}
        </div>
      </div>
      <p className="relative z-10 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-neutral-800 shadow backdrop-blur">💡 {r!.hint}</p>
      <div className="relative z-10 flex flex-wrap justify-center gap-3">
        {Array.from(new Set(scene.rounds.map((rd) => rd.who))).map((who) => {
          const c = CAST[who];
          const isPick = pick === who;
          const showWrong = isPick && correct === false;
          return (
            <button key={who} onClick={() => guess(who)} disabled={correct !== null} className={`flex flex-col items-center rounded-2xl border-4 bg-white/95 px-4 py-3 shadow-xl active:scale-95 ${isPick && correct ? 'border-green-400 ring-4 ring-green-300/60' : showWrong ? 'border-red-400 animate-[lep1-shake_0.4s_ease-out]' : 'border-white'}`}>
              <img src={c.img} alt={c.name} className="h-16 w-16 object-contain" draggable={false} />
              <span className="mt-1 text-sm font-black text-orange-700">{c.name}</span>
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
    cueSpeak(scene.teacher, 'teacher');
    async function run(i: number) {
      if (stopRef.current) return;
      if (i >= scene.script.length) { setStep(scene.script.length); return; }
      setStep(i);
      const line = scene.script[i];
      await new Promise((r) => setTimeout(r, 350));
      if (stopRef.current) return;
      await safeSpeak(line.line, line.who);
      if (stopRef.current) return;
      if (line.repeat) setAwaitingRepeat(true);
      else { await new Promise((r) => setTimeout(r, 500)); run(i + 1); }
    }
    runRef.current = run;
    run(0);
    return () => { stopRef.current = true; stopSpeaking(); };
  }, [scene.id]);

  const confirmRepeat = () => {
    if (!awaitingRepeat) return;
    setAwaitingRepeat(false);
    if (!gemDone) { onWin(true); setGemDone(true); }
    const next = step + 1;
    setTimeout(() => runRef.current?.(next), 250);
  };

  const positions: Record<string, { left: string; bottom: string; scale: number }> = {
    pip: { left: '12%', bottom: '10vh', scale: 1.35 },
    mia: { left: '34%', bottom: '9vh', scale: 1.15 },
    bella: { left: '58%', bottom: '10vh', scale: 1.3 },
    willow: { left: '82%', bottom: '11vh', scale: 1.2 },
  };
  const current = step >= 0 && step < scene.script.length ? scene.script[step] : null;
  const replayCurrent = () => { if (current) void safeSpeak(current.line, current.who); };

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-6 top-6 flex flex-col gap-2">
        <span className="w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">Roleplay · Say Hello</span>
        <span className="w-fit rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">Listen · Repeat · Play</span>
      </div>
      {current && <button onClick={replayCurrent} className="absolute right-6 top-6 z-30 flex items-center gap-2 rounded-full bg-white/95 px-5 py-3 text-sm font-black uppercase tracking-widest text-orange-700 shadow-2xl ring-2 ring-orange-200 active:scale-95" aria-label="Repeat what the character said">🔁 Play again</button>}
      {scene.cast.map((who) => {
        const c = CAST[who];
        const p = positions[who] ?? { left: '50%', bottom: '12vh', scale: 1 };
        const isSpeaking = current?.who === who;
        const sprite = c.img;
        const leftPct = parseFloat(p.left);
        const facingLeft = !Number.isNaN(leftPct) && leftPct >= 50;
        return (
          <img key={who} src={sprite} alt={c.name} draggable={false} className="absolute object-contain drop-shadow-2xl transition-all duration-300"
            style={{ left: p.left, bottom: p.bottom, height: `calc(clamp(240px, 40vh, 460px) * ${p.scale})`, transform: facingLeft ? 'scaleX(-1)' : undefined, filter: isSpeaking ? `drop-shadow(0 0 30px ${c.color})` : undefined }} />
        );
      })}
      {current && (
        <div className="absolute z-20 max-w-[520px] -translate-x-1/2 px-4 transition-all duration-300" style={{ left: positions[current.who]?.left ?? '50%', bottom: `calc(${positions[current.who]?.bottom ?? '12vh'} + clamp(240px, 40vh, 460px) * ${positions[current.who]?.scale ?? 1} + 20px)` }}>
          <div className="relative rounded-3xl bg-white/95 px-5 py-3 text-center text-xl font-black text-orange-800 shadow-2xl sm:text-2xl">“{current.line}”</div>
        </div>
      )}
      {awaitingRepeat && current && (
        <>
          <div className="absolute inset-0 z-20 bg-black/35 backdrop-blur-[2px]" />
          <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
            <div className="relative w-full max-w-xl rounded-[36px] bg-white/98 p-7 text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)] ring-4 ring-orange-300">
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

  useEffect(() => () => { stopSpeaking(); streamRef.current?.getTracks().forEach((t) => t.stop()); }, [scene.id]);
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

  useEffect(() => { if (isFriendTurn && friendKey && currentTurn) cueSpeakOnce(currentTurn.line, friendKey); }, [turnIdx, isFriendTurn, friendKey]);

  const advance = () => {
    if (isStudentTurn && !gemDone) { onWin(true); setGemDone(true); }
    stopSpeaking();
    setTurnIdx((i) => i + 1);
  };

  return (
    <div className="fixed inset-0 overflow-hidden select-none" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.05) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-6 top-6 z-20 flex flex-col gap-2">
        <span className="w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">Live Stage · Your Turn</span>
        <span className="w-fit rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">🎤 Listen · Answer · Talk</span>
      </div>
      {currentTurn && isFriendTurn && (
        <div className="absolute inset-x-0 top-20 z-30 flex justify-center px-4">
          <div className="max-w-[720px] rounded-[28px] bg-white/98 px-8 py-5 text-center shadow-[0_30px_80px_rgba(0,0,0,0.35)] ring-4 ring-orange-200">
            <div className="mb-1 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.25em]" style={{ color: friendMeta?.color ?? '#FE6A2F' }}><span className="text-lg">{friendMeta?.emoji ?? '🎓'}</span> {friendMeta?.name ?? 'Teacher'} asks</div>
            <div className="text-3xl font-black text-orange-800 sm:text-4xl">“{currentTurn.line}”</div>
            {friendKey && <button onClick={() => cueSpeakOnce(currentTurn.line, friendKey)} className="mt-3 mr-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-700 ring-2 ring-orange-300 shadow active:scale-95">🔊 Hear again</button>}
            <button onClick={advance} className="mt-3 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-7 py-3 text-sm font-black uppercase tracking-widest text-white shadow-xl active:scale-95">🎤 My turn</button>
          </div>
        </div>
      )}
      {currentTurn && isStudentTurn && (
        <div className="absolute inset-x-0 top-20 z-40 flex justify-center px-4">
          <div className="w-full max-w-[700px] rounded-[32px] bg-white/98 p-6 text-center shadow-[0_30px_80px_rgba(0,0,0,0.4)] ring-4 ring-orange-300">
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
        await safeSpeak('Look! Here are your friends.', 'teacher');
        if (cancelled) return;
        for (const who of scene.cast) { await safeSpeak(CAST[who].name, who); if (cancelled) return; }
        await new Promise((res) => setTimeout(res, 400));
        if (cancelled) return;
      }
      setPhase('shuffle');
      await safeSpeak('Now… shuffle!', 'teacher');
      if (cancelled) return;
      for (let k = 0; k < 3; k++) { setOrder((o) => shuffle(o)); await new Promise((res) => setTimeout(res, 420)); if (cancelled) return; }
      await new Promise((res) => setTimeout(res, 200));
      if (cancelled) return;
      setPhase('prompt');
      await new Promise((res) => setTimeout(res, 200));
      await safeSpeak(r.prompt, r.target);
    })();
    return () => { cancelled = true; };
  }, [round]);

  const tap = async (idx: number) => {
    if (!r || answeredRef.current) return;
    const who = order[idx];
    if (who !== r.target) { setWrongIdx(idx); sfx.wrong(); onLose(); window.setTimeout(() => setWrongIdx(null), 500); return; }
    answeredRef.current = true; setOpenIdx(idx); setPhase('greet'); sfx.match();
    await new Promise((res) => setTimeout(res, 500));
    await safeSpeak(r.helloLine, who);
    setPhase('echo');
    await new Promise((res) => setTimeout(res, 250));
    await safeSpeak(`Your turn! ${r.echoLine}`, 'teacher');
    setScore((s) => s + 1);
    await new Promise((res) => setTimeout(res, 1400));
    const next = round + 1;
    if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
    setRound(next);
  };

  if (finished) {
    return (
      <div className="relative flex h-[calc(100vh-8rem)] w-full items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="rounded-3xl bg-white/95 px-8 py-4 text-center shadow-2xl">
            <div className="text-2xl font-black text-orange-700">🎉 Wonderful hellos!</div>
            <div className="text-lg font-bold text-neutral-700">You greeted every friend! {score}/{total}</div>
          </div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  const doorPositions = [17, 50, 83];
  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/50" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-6 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur sm:text-xl">
        {r!.prompt}<span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </div>
      <button onClick={() => cueSpeak(r!.prompt, r!.target)} className="absolute right-4 top-4 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>
      {phase === 'echo' && <div className="pointer-events-none absolute left-1/2 top-24 z-40 -translate-x-1/2 rounded-3xl bg-white px-6 py-4 text-2xl font-black text-orange-600 shadow-2xl ring-4 ring-orange-200">🎤 {r!.echoLine}</div>}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
      <div className={`absolute bottom-0 left-0 right-0 z-10 h-[82%] ${phase === 'shuffle' ? 'animate-[lep1-shuffleShake_0.42s_ease-in-out_infinite]' : ''}`}>
        {doorPositions.map((left, i) => {
          const who = order[i];
          const c = CAST[who];
          const isOpen = openIdx === i || phase === 'reveal';
          const isWrong = wrongIdx === i;
          const isIdle = openIdx === null && !answeredRef.current && phase === 'prompt';
          const stepOutside = i === doorPositions.length - 1 ? '28%' : '72%';
          const showChar = openIdx === i || phase === 'reveal';
          return (
            <div key={i} className="absolute bottom-0" style={{ left: `${left}%`, transform: 'translateX(-50%)', width: '28%', maxWidth: 320, height: 'clamp(260px, 52vh, 480px)' }}>
              <div className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2" style={{ left: phase === 'reveal' ? '50%' : openIdx === i ? stepOutside : '50%', bottom: '-14%', width: 'clamp(420px, 42vw, 620px)', height: 'clamp(420px, 42vw, 620px)', transform: showChar ? 'translateY(0) scale(1)' : 'translateY(10%) scale(0.96)', opacity: showChar ? 1 : 0, transition: 'left 0.45s ease-out, transform 0.45s ease-out, opacity 0.25s ease-out', transitionDelay: openIdx === i ? '0.35s' : '0s' }}>
                <img src={c.img} alt={c.name} draggable={false} className="h-full w-full max-w-none object-contain" style={{ filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.45))' }} />
                {phase === 'reveal' && <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-white px-4 py-2 text-lg font-black text-neutral-800 shadow-xl ring-2 ring-white" style={{ color: c.color }}>{c.name}</div>}
                {(phase === 'greet' || phase === 'echo') && openIdx === i && <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-white px-4 py-2 text-base font-black text-neutral-800 shadow-xl ring-2 ring-white">{r!.helloLine}</div>}
              </div>
              <button onClick={() => tap(i)} disabled={answeredRef.current || phase !== 'prompt'} aria-label={`Door ${i + 1}`} className={`absolute inset-0 ${isWrong ? 'animate-[lep1-shake_0.5s]' : ''} ${isIdle ? 'hover:-translate-y-1' : ''} transition-transform active:scale-95`}>
                <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-t-full" style={{ width: '112%', height: '20%', background: `linear-gradient(180deg, ${c.color} 0%, ${c.color}dd 100%)`, boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }} />
                <div className="absolute left-1/2 top-[16%] h-[84%] w-[94%] -translate-x-1/2 overflow-hidden rounded-t-[46%] border-[7px] border-amber-950 shadow-2xl" style={{ background: 'radial-gradient(ellipse at 50% 70%, #4a2c14 0%, #1a0d05 100%)' }}>
                  <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: isOpen ? 1 : 0, background: `radial-gradient(circle at 50% 65%, ${c.color}ee 0%, ${c.color}88 35%, rgba(0,0,0,0.4) 90%)` }} />
                  <div className="absolute inset-y-0 left-0 w-1/2 origin-left transition-transform duration-[700ms]" style={{ transform: isOpen ? 'perspective(800px) rotateY(-110deg)' : 'rotateY(0deg)', background: 'linear-gradient(90deg, #8A5028 0%, #A76A3D 60%, #C68B58 100%)' }} />
                  <div className="absolute inset-y-0 right-0 w-1/2 origin-right transition-transform duration-[700ms]" style={{ transform: isOpen ? 'perspective(800px) rotateY(110deg)' : 'rotateY(0deg)', background: 'linear-gradient(270deg, #8A5028 0%, #A76A3D 60%, #C68B58 100%)' }} />
                </div>
                {isWrong && <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center text-8xl font-black text-red-500 drop-shadow-lg">✗</div>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Color friends ---------- */

function ColorFriendsScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'color-friends' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const CHARS = scene.cast;
  const PAINT_COLORS = ['#FE6A2F', '#F59E0B', '#FACC15', '#84CC16', '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#78350F', '#111827'];
  const BRUSHES = [18, 30, 46];
  const [idx, setIdx] = useState(0);
  const [color, setColor] = useState(PAINT_COLORS[0]);
  const [brush, setBrush] = useState(BRUSHES[1]);
  const [gemDone, setGemDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paintingRef = useRef(false);
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);
  const introRef = useRef(false);
  const who = CHARS[idx] ?? 'pip';
  const c = CAST[who];
  const sketch = COLOR_SKETCH[who];

  useEffect(() => {
    if (introRef.current) return;
    introRef.current = true;
    (async () => { await new Promise((r) => setTimeout(r, 250)); await safeSpeak(scene.teacher, 'teacher'); })();
  }, []);
  useEffect(() => { clearCanvas(); if (idx > 0) cueSpeak(`${c.name}!`, who); }, [idx]);

  const getCtx = () => canvasRef.current?.getContext('2d') ?? null;
  const clearCanvas = () => { const canvas = canvasRef.current; const ctx = getCtx(); if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); };
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  useEffect(() => { resizeCanvas(); const onResize = () => resizeCanvas(); window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize); }, [who]);

  const localPoint = (e: React.PointerEvent<HTMLCanvasElement>) => { const r = canvasRef.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const strokeTo = (x: number, y: number) => {
    const ctx = getCtx();
    if (!ctx) return;
    const from = lastPtRef.current ?? { x, y };
    ctx.strokeStyle = color; ctx.lineWidth = brush; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(x, y); ctx.stroke();
    lastPtRef.current = { x, y };
  };
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => { e.currentTarget.setPointerCapture(e.pointerId); paintingRef.current = true; const p = localPoint(e); lastPtRef.current = p; strokeTo(p.x, p.y); };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => { if (!paintingRef.current) return; const p = localPoint(e); strokeTo(p.x, p.y); };
  const endStroke = () => { paintingRef.current = false; lastPtRef.current = null; };
  const handleDone = () => { if (!gemDone) { setGemDone(true); onWin(true); } if (idx + 1 < CHARS.length) setIdx(idx + 1); else onNext(); };

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-white/15 to-white/50" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">🎨 Color {c.name}!</div>
      <div className="absolute inset-x-0 top-14 bottom-36 z-10 flex items-center justify-center">
        <div key={who} className="relative aspect-[400/520] h-full max-h-full max-w-[96vw] overflow-hidden rounded-3xl bg-[#FFFDF7] shadow-2xl ring-2 ring-white/70">
          <canvas ref={canvasRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endStroke} onPointerCancel={endStroke} onPointerLeave={endStroke} className="absolute inset-0 h-full w-full touch-none" style={{ cursor: 'crosshair' }} />
          <img src={sketch} alt={c.name} className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none" draggable={false} />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-3 z-30 flex flex-col items-center gap-2">
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-2xl">
          {PAINT_COLORS.map((col) => <button key={col} onClick={() => setColor(col)} aria-label={`Color ${col}`} className={`h-10 w-10 rounded-full transition-transform active:scale-90 ${col === color ? 'ring-4 ring-orange-500 scale-110' : 'ring-2 ring-white'}`} style={{ backgroundColor: col }} />)}
          <div className="mx-2 h-8 w-px bg-neutral-300" />
          {BRUSHES.map((size) => <button key={size} onClick={() => setBrush(size)} aria-label={`Brush ${size}`} className={`flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 transition-transform active:scale-90 ${size === brush ? 'ring-4 ring-orange-500 scale-110' : 'ring-2 ring-white'}`}><span className="block rounded-full bg-neutral-800" style={{ width: size * 0.5, height: size * 0.5 }} /></button>)}
          <button onClick={clearCanvas} className="ml-2 rounded-full bg-neutral-100 px-3 py-2 text-xs font-black text-neutral-700 shadow active:scale-95">↺ Clear</button>
        </div>
        <div className="flex items-center gap-2">
          {idx + 1 < CHARS.length && <button onClick={() => setIdx(idx + 1)} className="rounded-full bg-white/95 px-5 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">Next Friend →</button>}
          <button onClick={handleDone} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">Done ⭐</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Alphabet blocks ---------- */

function AlphabetBlocksScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'alphabet-blocks' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  type Phase = 'intro' | 'tap' | 'stack' | 'done';
  const [phase, setPhase] = useState<Phase>('intro');
  const [tapIdx, setTapIdx] = useState(0);
  const [tapWrong, setTapWrong] = useState<string | null>(null);
  const [tapWinLetter, setTapWinLetter] = useState<string | null>(null);
  const [wordIdx, setWordIdx] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrongBankIdx, setWrongBankIdx] = useState<number | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [gemDone, setGemDone] = useState(false);
  const introRef = useRef(false);

  const BLOCK_COLORS = ['#FE6A2F', '#F59E0B', '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444'];
  const colorFor = (letter: string) => { const i = scene.letters.indexOf(letter); return BLOCK_COLORS[Math.max(0, i) % BLOCK_COLORS.length]; };

  useEffect(() => {
    if (introRef.current) return;
    introRef.current = true;
    (async () => {
      await new Promise((r) => setTimeout(r, 200));
      await safeSpeak(scene.teacher, 'teacher');
      setPhase('tap');
      await new Promise((r) => setTimeout(r, 300));
      await safeSpeak('Listen! Tap the sound!', 'pip');
      await playLetterPhonic(scene.tapRounds[0].letter);
    })();
  }, []);

  const tapPromptRef = useRef(0);
  useEffect(() => {
    if (phase !== 'tap' || tapIdx === 0) return;
    tapPromptRef.current += 1;
    const token = tapPromptRef.current;
    (async () => { await new Promise((r) => setTimeout(r, 250)); if (token !== tapPromptRef.current) return; await playLetterPhonic(scene.tapRounds[tapIdx].letter); })();
  }, [tapIdx, phase]);

  const handleTapLetter = async (letter: string) => {
    if (phase !== 'tap' || tapWinLetter) return;
    const target = scene.tapRounds[tapIdx].letter;
    if (letter === target) {
      setTapWinLetter(letter); sfx.gem();
      await new Promise((r) => setTimeout(r, 700));
      setTapWinLetter(null);
      if (tapIdx + 1 < scene.tapRounds.length) setTapIdx(tapIdx + 1);
      else {
        setPhase('stack'); setWordIdx(0); setPlaced([]);
        await new Promise((r) => setTimeout(r, 300));
        await safeSpeak('Now stack the word!', 'pip');
        await safeSpeak(scene.words[0].word, 'pip');
      }
    } else { setTapWrong(letter); sfx.wrong(); window.setTimeout(() => setTapWrong(null), 450); }
  };

  const currentWord = scene.words[wordIdx]?.word ?? '';
  const bank = useMemo(() => {
    if (phase !== 'stack' || !currentWord) return [] as string[];
    const need = currentWord.split('');
    const distractors = scene.letters.filter((l) => !need.includes(l)).slice(0, 3);
    const arr = [...need, ...distractors];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }, [phase, wordIdx]);

  const [usedBank, setUsedBank] = useState<Set<number>>(new Set());
  useEffect(() => { setUsedBank(new Set()); setPlaced([]); }, [wordIdx, phase]);

  const handleBankTap = async (bIdx: number, letter: string) => {
    if (phase !== 'stack' || celebrate || usedBank.has(bIdx)) return;
    const target = currentWord[placed.length];
    if (letter === target) {
      const nextPlaced = [...placed, letter];
      setPlaced(nextPlaced);
      setUsedBank((s) => new Set(s).add(bIdx));
      sfx.pop();
      if (nextPlaced.length === currentWord.length) {
        setCelebrate(true); sfx.gem();
        await new Promise((r) => setTimeout(r, 350));
        await safeSpeak(currentWord, 'pip');
        await new Promise((r) => setTimeout(r, 700));
        setCelebrate(false);
        if (wordIdx + 1 < scene.words.length) { setWordIdx(wordIdx + 1); await new Promise((r) => setTimeout(r, 300)); await safeSpeak(scene.words[wordIdx + 1].word, 'pip'); }
        else { setPhase('done'); if (!gemDone) { setGemDone(true); onWin(true); } }
      }
    } else { setWrongBankIdx(bIdx); sfx.wrong(); window.setTimeout(() => setWrongBankIdx(null), 450); }
  };

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/35 via-white/10 to-white/40" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">
        🧱 Alphabet Blocks{phase === 'tap' && <span className="ml-2 text-orange-500">— Tap the sound!</span>}{phase === 'stack' && <span className="ml-2 text-orange-500">— Stack the word!</span>}
      </div>
      {phase === 'tap' && (
        <div className="absolute inset-x-0 top-20 bottom-24 z-10 flex flex-col items-center justify-center gap-6 px-4">
          <button onClick={() => playLetterPhonic(scene.tapRounds[tapIdx].letter)} className="rounded-full bg-white/95 px-6 py-3 text-lg font-black text-orange-700 shadow-xl active:scale-95">🔊 Play sound again</button>
          <div className="grid max-w-[92vw] grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {scene.letters.map((L) => (
              <button key={L} onClick={() => handleTapLetter(L)} className="relative flex h-28 w-28 items-center justify-center rounded-2xl text-6xl font-black text-white transition-transform active:scale-95 sm:h-32 sm:w-32"
                style={{ backgroundColor: colorFor(L), animation: tapWrong === L ? 'lep1-blockShake 0.4s ease-in-out' : tapWinLetter === L ? 'lep1-blockWin 0.7s ease-out' : undefined }}>
                {L}{tapWinLetter === L && <span className="absolute -right-2 -top-2 text-4xl">✨</span>}
              </button>
            ))}
          </div>
          <div className="text-sm font-black text-white drop-shadow-md">{tapIdx + 1} / {scene.tapRounds.length}</div>
        </div>
      )}
      {phase === 'stack' && (
        <div className="absolute inset-x-0 top-20 bottom-24 z-10 flex flex-col items-center justify-between gap-4 px-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="text-7xl drop-shadow-lg">{scene.words[wordIdx].emoji}</div>
            <button onClick={() => safeSpeak(currentWord, 'pip')} className="rounded-full bg-white/90 px-4 py-1 text-xs font-black text-orange-700 shadow active:scale-95">🔊 Hear word</button>
          </div>
          <div className="flex items-end gap-3 rounded-2xl px-6 pb-3 pt-8" style={{ background: 'linear-gradient(180deg, #b45309 0%, #7c2d12 100%)' }}>
            {currentWord.split('').map((tgt, i) => {
              const filled = placed[i];
              const bg = filled ? colorFor(filled) : '#3f2314';
              return <div key={i} className="relative flex h-24 w-20 items-center justify-center rounded-xl text-5xl font-black text-white sm:h-28 sm:w-24 sm:text-6xl" style={{ backgroundColor: bg, animation: filled ? 'lep1-blockDrop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' : undefined, opacity: filled ? 1 : 0.85 }}>{filled ?? <span className="text-2xl opacity-60">{tgt}</span>}</div>;
            })}
          </div>
          <div className="flex max-w-[92vw] flex-wrap items-center justify-center gap-3">
            {bank.map((L, i) => (
              <button key={`${i}-${L}`} onClick={() => handleBankTap(i, L)} disabled={usedBank.has(i)} className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl font-black text-white transition-transform active:scale-90 sm:h-24 sm:w-24 sm:text-5xl"
                style={{ backgroundColor: colorFor(L), opacity: usedBank.has(i) ? 0.25 : 1, animation: wrongBankIdx === i ? 'lep1-blockShake 0.4s ease-in-out' : undefined }}>{L}</button>
            ))}
          </div>
          <div className="text-sm font-black text-white drop-shadow-md">Word {wordIdx + 1} / {scene.words.length}</div>
        </div>
      )}
      {phase === 'done' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
          <div className="text-8xl animate-bounce">🏆</div>
          <div className="rounded-3xl bg-white/95 px-8 py-4 text-3xl font-black text-orange-600 shadow-2xl">All blocks stacked!</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">Continue ⭐</button>
        </div>
      )}
      {celebrate && <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"><div className="rounded-full bg-white/95 px-6 py-3 text-3xl font-black text-orange-600 shadow-2xl animate-bounce">✨ {currentWord}! ✨</div></div>}
    </div>
  );
}

/* ---------- Alphabet order ---------- */

function AlphabetOrderScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'alphabet-order' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [seqIdx, setSeqIdx] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrongLetter, setWrongLetter] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [done, setDone] = useState(false);
  const gemRef = useRef(false);
  const introRef = useRef(false);
  const current = scene.sequences[seqIdx];
  const target = current.split('');

  const shuffled = useMemo(() => {
    const arr = target.slice();
    for (let tries = 0; tries < 8; tries++) {
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; }
      if (arr.join('') !== current) break;
    }
    return arr;
  }, [seqIdx]);

  const [used, setUsed] = useState<Set<number>>(new Set());
  useEffect(() => { setPlaced([]); setUsed(new Set()); }, [seqIdx]);
  useEffect(() => {
    if (introRef.current) return;
    introRef.current = true;
    (async () => { await new Promise((r) => setTimeout(r, 200)); await safeSpeak(scene.teacher, 'teacher'); await safeSpeak('Tap the letters in A B C order!', 'pip'); })();
  }, []);

  const COLORS = ['#FE6A2F', '#22C55E', '#3B82F6', '#EC4899', '#F59E0B', '#8B5CF6'];
  const colorFor = (L: string) => COLORS[(L.charCodeAt(0) - 65) % COLORS.length];

  const handleTap = async (idx: number, L: string) => {
    if (used.has(idx) || celebrate || done) return;
    const nextExpected = target[placed.length];
    if (L === nextExpected) {
      const nextPlaced = [...placed, L];
      setPlaced(nextPlaced);
      setUsed((s) => new Set(s).add(idx));
      sfx.pop();
      await playLetterName(L);
      if (nextPlaced.length === target.length) {
        setCelebrate(true); sfx.gem();
        await new Promise((r) => setTimeout(r, 400));
        for (const ch of target) await playLetterName(ch);
        await new Promise((r) => setTimeout(r, 500));
        setCelebrate(false);
        if (seqIdx + 1 < scene.sequences.length) { setSeqIdx(seqIdx + 1); await new Promise((r) => setTimeout(r, 300)); await safeSpeak('Next one!', 'pip'); }
        else { setDone(true); if (!gemRef.current) { gemRef.current = true; onWin(true); } }
      }
    } else { setWrongLetter(L); sfx.wrong(); window.setTimeout(() => setWrongLetter(null), 450); }
  };

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/35 via-white/10 to-white/40" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">🔤 Alphabet Order — Tap A → B → C!</div>
      {!done && (
        <div className="absolute inset-x-0 top-20 bottom-24 z-10 flex flex-col items-center justify-between gap-3 px-3 py-3">
          <div className="flex flex-wrap items-end justify-center gap-3 rounded-2xl bg-white/40 px-6 py-4 backdrop-blur">
            {target.map((tgt, i) => {
              const filled = placed[i];
              const bg = filled ? colorFor(filled) : 'rgba(255,255,255,0.5)';
              return <div key={i} className="flex h-24 w-20 items-center justify-center rounded-xl text-5xl font-black text-white sm:h-28 sm:w-24 sm:text-6xl" style={{ backgroundColor: bg, animation: filled ? 'lep1-blockDrop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' : undefined, color: filled ? 'white' : 'rgba(0,0,0,0.35)' }}>{filled ?? tgt}</div>;
            })}
          </div>
          <div className="text-3xl font-black text-white drop-shadow-lg">↓ Next: <span className="text-orange-300">{target[placed.length] ?? '✓'}</span></div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {shuffled.map((L, i) => (
              <button key={`${i}-${L}`} onClick={() => handleTap(i, L)} disabled={used.has(i)} className="flex h-24 w-24 items-center justify-center rounded-2xl text-5xl font-black text-white transition-transform active:scale-90 sm:h-28 sm:w-28 sm:text-6xl"
                style={{ backgroundColor: colorFor(L), opacity: used.has(i) ? 0.25 : 1, animation: wrongLetter === L && !used.has(i) ? 'lep1-blockShake 0.4s ease-in-out' : undefined }}>{L}</button>
            ))}
          </div>
          <div className="text-sm font-black text-white drop-shadow-md">Round {seqIdx + 1} / {scene.sequences.length}</div>
        </div>
      )}
      {done && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
          <div className="text-8xl animate-bounce">🎉</div>
          <div className="rounded-3xl bg-white/95 px-8 py-4 text-3xl font-black text-orange-600 shadow-2xl">ABC master!</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">Continue ⭐</button>
        </div>
      )}
      {celebrate && <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"><div className="rounded-full bg-white/95 px-6 py-3 text-3xl font-black text-orange-600 shadow-2xl animate-bounce">✨ {current}! ✨</div></div>}
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

  const playSong = useCallback(async () => {
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
  }, [scene.songUrl, totalDuration, totalLines]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; } }, []);

  const current = idx >= 0 ? scene.lyrics[idx] : null;
  const isPlaying = status === 'playing';
  const isDone = status === 'done';

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
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
            <div className="mb-3 text-sm font-black uppercase tracking-widest text-[#FE6A2F] sm:text-base">🎤 {current.who.toUpperCase()} sings</div>
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

/* ---------- Finale ---------- */

function FinaleScene({ scene, hearts, gems, onRestart }: { scene: Extract<Scene, { kind: 'finale' }>; hearts: number; gems: number; onRestart: () => void }) {
  useEffect(() => { cueSpeak(scene.line, 'teacher'); }, [scene.id]);
  const stars = 1 + Math.min(2, Math.floor(hearts / 2)) + (gems >= 3 ? 1 : 0);

  return (
    <GlassCard className="text-center">
      <Confetti />
      <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Lesson Complete!</p>
      <h2 className="mt-1 text-4xl font-black text-orange-800">You did it!</h2>
      <div className="my-4 flex justify-center gap-2 text-5xl">
        {[0, 1, 2, 3].map((i) => <span key={i} className={i < stars ? '' : 'opacity-20'}>⭐</span>)}
      </div>
      <div className="mx-auto grid grid-cols-3 gap-2 rounded-3xl bg-white/70 p-3">
        {(['pip', 'mia', 'bella'] as const).map((k) => {
          const c = CAST[k];
          return (
            <div key={k} className="grid place-items-center">
              <img src={c.img} alt={c.name} width={72} height={72} className="h-16 w-16 object-contain animate-[lep1-hop_1.6s_ease-in-out_infinite]" />
              <span className="text-xs font-black" style={{ color: c.color }}>💎 {c.name}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-lg font-bold text-orange-700">"{scene.line}"</p>
      <button onClick={onRestart} className="mt-5 w-full rounded-full bg-white py-3 font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔁 Play again</button>
    </GlassCard>
  );
}

/* ---------- Shared keyframes ---------- */

export function Lep1Keyframes() {
  return (
    <style>{`
      @keyframes lep1-fade-slide { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes lep1-pop { 0% { opacity: 0; transform: scale(0.6) translateY(-10px); } 20% { opacity: 1; transform: scale(1.15) translateY(0); } 60% { transform: scale(1); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
      @keyframes lep1-pop-fade { 0% { opacity: 0; transform: scale(0.6) translateY(-10px); } 20% { opacity: 1; transform: scale(1.15) translateY(0); } 60% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1) translateY(-10px); } }
      @keyframes lep1-float { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-12px) rotate(1deg); } }
      @keyframes lep1-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-10px); } 40% { transform: translateX(10px); } 60% { transform: translateX(-8px); } 80% { transform: translateX(8px); } }
      @keyframes lep1-hop { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
      @keyframes lep1-walk { 0% { transform: translateX(-60%) rotate(-4deg); } 25% { transform: translateX(-20%) rotate(3deg) translateY(-6px); } 50% { transform: translateX(20%) rotate(-3deg); } 75% { transform: translateX(60%) rotate(3deg) translateY(-6px); } 100% { transform: translateX(-60%) rotate(-4deg); } }
      @keyframes lep1-wiggle { 0%,100% { transform: rotate(-3deg) translateY(0); } 25% { transform: rotate(3deg) translateY(-4px); } 50% { transform: rotate(-2deg) translateY(0); } 75% { transform: rotate(4deg) translateY(-4px); } }
      @keyframes lep1-ping { 75%, 100% { transform: scale(2); opacity: 0; } }
      @keyframes lep1-slide-up { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes lep1-dashScroll { from { background-position: 0 0; } to { background-position: -80px 0; } }
      @keyframes lep1-heroBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
      @keyframes lep1-itemBob { 0%,100% { transform: translateY(-50%) rotate(-4deg); } 50% { transform: translateY(-58%) rotate(4deg); } }
      @keyframes lep1-shuffleShake { 0%,100% { transform: translateX(0) rotate(0deg); } 25% { transform: translateX(-8px) rotate(-1deg); } 75% { transform: translateX(8px) rotate(1deg); } }
      @keyframes lep1-blockShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px) rotate(-3deg); } 75% { transform: translateX(6px) rotate(3deg); } }
      @keyframes lep1-blockWin { 0% { transform: scale(1); } 40% { transform: scale(1.25) rotate(-6deg); } 70% { transform: scale(1.15) rotate(6deg); } 100% { transform: scale(1); } }
      @keyframes lep1-blockDrop { 0% { transform: translateY(-40px) scale(1.1); opacity: 0; } 60% { transform: translateY(4px) scale(0.98); opacity: 1; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
      @keyframes lep1-lyricPop { 0% { transform: scale(0.85); opacity: 0; } 60% { transform: scale(1.06); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
      @keyframes lep1-noteFloat { 0% { transform: translateY(0) rotate(-8deg); opacity: 0; } 20% { opacity: 0.9; } 100% { transform: translateY(-160px) rotate(12deg); opacity: 0; } }
    `}</style>
  );
}
