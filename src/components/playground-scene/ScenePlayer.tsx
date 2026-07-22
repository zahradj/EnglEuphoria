import React, { useState } from 'react';
import { ArrowLeft, Heart, Volume2 } from 'lucide-react';
import { SpriteMascot, CAST_PROFILES, MascotEmotion } from './SpriteMascot';

/**
 * ScenePlayer — full-bleed, cinematic scene-based lesson player for the
 * Playground Library's generalized ("Little Explorers Phonics"-style)
 * content. Distinct from PlaygroundLessonPlayer (card/button style) —
 * this renders every step as an immersive full-screen illustrated scene,
 * matching the reference implementation studied at early-ear-learners.
 *
 * Design language (observed from the live reference):
 *  - Full-bleed background image per scene (title/theme-specific).
 *  - Characters positioned in-scene via <SpriteMascot>, reacting with
 *    mood/talking/waving rather than sitting in a card.
 *  - Consistent HUD: back link (top-left), hearts (top-right),
 *    progress dots + counter (bottom-center), CTA pill button (bottom-center).
 *  - Each scene "kind" has its own overlay content.
 */

export type SceneCharacter = {
  who: keyof typeof CAST_PROFILES | string;
  emotion?: MascotEmotion;
  talking?: boolean;
  waving?: boolean;
  /** Position as % of scene width/height, from top-left. */
  x: number;
  y: number;
  size?: number;
  flip?: boolean;
};

export type SceneTapTarget = {
  id: string;
  emoji: string;
  label: string;
  x: number;
  y: number;
  isMatch: boolean;
};

export type Scene =
  | {
      id: string;
      kind: 'intro';
      background: string;
      characters?: SceneCharacter[];
      title: string;
      subtitle?: string;
      ctaLabel?: string;
    }
  | {
      id: string;
      kind: 'dialogue';
      background: string;
      characters?: SceneCharacter[];
      speaker?: string;
      line: string;
      ctaLabel?: string;
    }
  | {
      id: string;
      kind: 'sound_quest';
      background: string;
      letter: string;
      phoneme: string;
      prompt: string;
      targets: SceneTapTarget[];
      /** How many correct targets must be tapped to finish. */
      goal: number;
    }
  | {
      id: string;
      kind: 'drag_match';
      background: string;
      letter: string;
      prompt: string;
      items: { id: string; emoji: string; label: string; isMatch: boolean }[];
    }
  | {
      id: string;
      kind: 'trace';
      background: string;
      letter: string;
      phoneme: string;
      prompt: string;
    }
  | {
      id: string;
      kind: 'exit_ticket';
      background: string;
      prompt: string;
      options: { label: string; emoji?: string; correct?: boolean }[];
    };

const HUB_GRADIENTS: Record<string, string> = {
  playground: 'linear-gradient(135deg,#FFF3D6,#FFDDA8)',
};

function CharacterLayer({ characters }: { characters?: SceneCharacter[] }) {
  if (!characters?.length) return null;
  return (
    <>
      {characters.map((c, i) => {
        const profile = CAST_PROFILES[c.who];
        if (!profile) return null;
        return (
          <div
            key={`${c.who}-${i}`}
            className="absolute"
            style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <SpriteMascot
              profile={profile}
              emotion={c.emotion ?? 'happy'}
              isTalking={c.talking}
              waving={c.waving}
              flip={c.flip}
              size={c.size ?? 220}
            />
          </div>
        );
      })}
    </>
  );
}

function SceneChrome({
  onBack,
  lives,
  step,
  total,
  children,
}: {
  onBack: () => void;
  lives: number;
  step: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-full w-full">
      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-orange-900 shadow backdrop-blur hover:bg-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Map
        </button>
        <div className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 shadow backdrop-blur">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              className={`h-4 w-4 ${i < lives ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`}
            />
          ))}
        </div>
      </div>

      {children}

      {/* Bottom progress */}
      <div className="absolute inset-x-0 bottom-3 z-20 flex flex-col items-center gap-1">
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i < step ? 'bg-orange-500' : 'bg-white/60'}`}
            />
          ))}
        </div>
        <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-bold text-white">
          {step} / {total}
        </span>
      </div>
    </div>
  );
}

function CtaButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-gradient-to-r from-[#FE6A2F] to-amber-500 px-6 py-3 text-base font-black text-white shadow-lg transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}

function IntroScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'intro' }>; onNext: () => void }) {
  return (
    <div className="relative flex h-full flex-col items-center text-center">
      <div className="mt-14 px-6">
        <h1 className="text-4xl font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] sm:text-5xl">
          {scene.title}
        </h1>
        {scene.subtitle && (
          <p className="mt-2 text-sm font-bold text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
            {scene.subtitle}
          </p>
        )}
      </div>
      <CharacterLayer characters={scene.characters} />
      <div className="absolute inset-x-0 bottom-24 flex justify-center">
        <CtaButton label={scene.ctaLabel ?? "Let's go! →"} onClick={onNext} />
      </div>
    </div>
  );
}

function DialogueScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'dialogue' }>; onNext: () => void }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-end pb-20">
      <CharacterLayer characters={scene.characters} />
      <div className="mx-6 mb-4 max-w-md rounded-2xl bg-white/95 px-5 py-3 text-center shadow-lg">
        {scene.speaker && <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">{scene.speaker}</p>}
        <p className="text-lg font-extrabold text-[#3a1d0a]">{scene.line}</p>
      </div>
      <CtaButton label={scene.ctaLabel ?? 'Next →'} onClick={onNext} />
    </div>
  );
}

function SoundQuestScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'sound_quest' }>; onNext: () => void }) {
  const [found, setFound] = useState<Set<string>>(new Set());
  const done = found.size >= scene.goal;

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  return (
    <div className="relative flex h-full flex-col items-center pt-16">
      <div className="rounded-full bg-black/40 px-4 py-1.5 text-center text-sm font-bold text-white">
        {scene.prompt}
      </div>

      <div className="relative mt-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-xl ring-4 ring-white/50">
        <span className="text-5xl font-black text-[#FE6A2F]">{scene.letter}</span>
      </div>
      <span className="mt-2 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-orange-700">
        {scene.phoneme}
      </span>

      <div className="relative mt-6 h-full w-full flex-1">
        {scene.targets.map((t) => {
          const isFound = found.has(t.id);
          return (
            <button
              key={t.id}
              onClick={() => {
                speak(t.label);
                if (t.isMatch) setFound((prev) => new Set(prev).add(t.id));
              }}
              style={{ left: `${t.x}%`, top: `${t.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 text-5xl transition-transform hover:scale-110 ${
                isFound ? 'opacity-40 grayscale' : ''
              }`}
              aria-label={t.label}
            >
              {t.emoji}
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-16 flex flex-col items-center gap-2">
        <p className="text-xs font-bold text-white drop-shadow">
          Found {found.size} / {scene.goal}
        </p>
        <CtaButton label={done ? 'Great job! →' : `Find ${scene.goal - found.size} more`} onClick={onNext} disabled={!done} />
      </div>
    </div>
  );
}

function DragMatchScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'drag_match' }>; onNext: () => void }) {
  const [dropped, setDropped] = useState<Set<string>>(new Set());
  const [dragging, setDragging] = useState<string | null>(null);
  const needed = scene.items.filter((i) => i.isMatch).length;
  const done = dropped.size >= needed;

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-10 px-6">
      <p className="rounded-full bg-black/40 px-4 py-1.5 text-sm font-bold text-white">{scene.prompt}</p>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => {
          if (dragging) {
            const item = scene.items.find((i) => i.id === dragging);
            if (item?.isMatch) setDropped((prev) => new Set(prev).add(dragging));
            setDragging(null);
          }
        }}
        className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-dashed border-orange-300 bg-white/80 text-4xl font-black text-orange-500 shadow-lg"
      >
        {scene.letter}
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {scene.items.map((item) => (
          <div
            key={item.id}
            draggable={!dropped.has(item.id)}
            onDragStart={() => setDragging(item.id)}
            className={`flex flex-col items-center gap-1 text-5xl ${dropped.has(item.id) ? 'opacity-30' : 'cursor-grab active:cursor-grabbing'}`}
          >
            <span>{item.emoji}</span>
            <span className="text-xs font-bold text-white drop-shadow">{item.label}</span>
          </div>
        ))}
      </div>

      <CtaButton label={done ? 'Great job! →' : 'Drag the matching words'} onClick={onNext} disabled={!done} />
    </div>
  );
}

function TraceScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'trace' }>; onNext: () => void }) {
  // Real finger/stylus stroke-path tracing is a separate, not-yet-built
  // feature (see task backlog). This is an honest placeholder: a
  // "listen + confirm" step in the same visual language, not a fake
  // tracing canvas that pretends to validate strokes it can't check.
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 px-6">
      <p className="rounded-full bg-black/40 px-4 py-1.5 text-sm font-bold text-white">{scene.prompt}</p>
      <div className="flex h-56 w-56 items-center justify-center rounded-3xl border-4 border-dashed border-white/70 bg-white/20 backdrop-blur-sm">
        <span className="text-8xl font-black text-white/90">{scene.letter}</span>
      </div>
      <button
        onClick={() => {
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(scene.phoneme));
          }
        }}
        className="flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-orange-700"
      >
        <Volume2 className="h-4 w-4" /> Listen
      </button>
      <CtaButton label="Great tracing! ✓ Next" onClick={onNext} />
    </div>
  );
}

function ExitTicketScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'exit_ticket' }>; onNext: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked !== null && scene.options[picked]?.correct;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
      <p className="rounded-full bg-black/40 px-4 py-1.5 text-center text-sm font-bold text-white">{scene.prompt}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {scene.options.map((opt, i) => (
          <button
            key={opt.label}
            onClick={() => setPicked(i)}
            className={`rounded-2xl border-2 bg-white/95 px-5 py-4 text-lg font-black transition ${
              picked === i
                ? opt.correct
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : 'border-rose-400 bg-rose-50 text-rose-700'
                : 'border-transparent text-[#3a1d0a] hover:border-orange-200'
            }`}
          >
            {opt.emoji && <span className="mr-1">{opt.emoji}</span>}
            {opt.label}
          </button>
        ))}
      </div>
      <CtaButton label="Finish lesson 🎉" onClick={onNext} disabled={!correct} />
    </div>
  );
}

export function ScenePlayer({
  scenes,
  hub = 'playground',
  onExit,
  onComplete,
}: {
  scenes: Scene[];
  hub?: string;
  onExit: () => void;
  onComplete: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [lives] = useState(3);
  const scene = scenes[index];

  const advance = () => {
    if (index >= scenes.length - 1) {
      onComplete();
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (!scene) return null;

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: scene.background
          ? `url(${scene.background})`
          : HUB_GRADIENTS[hub] ?? HUB_GRADIENTS.playground,
      }}
    >
      <SceneChrome onBack={onExit} lives={lives} step={index + 1} total={scenes.length}>
        {scene.kind === 'intro' && <IntroScene scene={scene} onNext={advance} />}
        {scene.kind === 'dialogue' && <DialogueScene scene={scene} onNext={advance} />}
        {scene.kind === 'sound_quest' && <SoundQuestScene scene={scene} onNext={advance} />}
        {scene.kind === 'drag_match' && <DragMatchScene scene={scene} onNext={advance} />}
        {scene.kind === 'trace' && <TraceScene scene={scene} onNext={advance} />}
        {scene.kind === 'exit_ticket' && <ExitTicketScene scene={scene} onNext={advance} />}
      </SceneChrome>
    </div>
  );
}
