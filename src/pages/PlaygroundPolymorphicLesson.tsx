// src/pages/PlaygroundPolymorphicLesson.tsx
// Polymorphic, parameters-driven lesson route.
// Adds a unit/lesson topic by editing src/lib/lesson/registry.ts only —
// no UI changes required. Maps to /playground/:unitId/:lessonId in App.tsx.

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home, Volume2 } from "lucide-react";
import { CURRICULUM_REGISTRY } from "@/lib/lesson/registry";
import { BasketSortPhase } from "@/components/lesson/phases/BasketSort";
import { GreetingRoutine } from "@/components/lesson/phases/GreetingRoutine";

/* ---------- speech ---------- */
function speak(text: string, rate = 0.85) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* no-op */ }
}

/* ---------- inline layout (mirrors CurriculumQualityOfficer rules) ---------- */
function computeLayout(vocabCount: number) {
  let gridColsClass = "grid-cols-3";
  if (vocabCount === 2) gridColsClass = "grid-cols-2";
  else if (vocabCount === 4) gridColsClass = "grid-cols-2 sm:grid-cols-4";
  else if (vocabCount >= 5) gridColsClass = "grid-cols-3 sm:grid-cols-6";
  return { gridColsClass };
}

/* ---------- inline LessonShell ---------- */
function LessonShell({
  phases, currentIndex, onPrev, onNext, title, subtitle, children,
  primary, accent,
}: {
  phases: string[]; currentIndex: number;
  onPrev: () => void; onNext: () => void;
  title: string; subtitle?: string; children: ReactNode;
  primary: string; accent: string;
}) {
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= phases.length - 1;
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${accent} 0%, #ffffff 100%)` }}>
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <Link to="/playground" aria-label="Home"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 backdrop-blur-md border border-white/70 text-gray-700 transition hover:scale-105">
            <Home className="h-5 w-5" />
          </Link>
          <div className="flex flex-1 items-center justify-center gap-2">
            {phases.map((p, i) => (
              <div key={`${p}-${i}`} className="h-2.5 flex-1 max-w-16 rounded-full transition-all"
                style={{ background: i <= currentIndex ? primary : `${primary}2E` }} />
            ))}
          </div>
          <div className="w-12" />
        </header>

        <div className="mt-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: primary }}>
            {phases[currentIndex]} · Step {currentIndex + 1} of {phases.length}
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black text-gray-800">{title}</h1>
          {subtitle && <p className="mt-2 text-base text-gray-600 sm:text-lg">{subtitle}</p>}
        </div>

        <main className="mt-6 flex-1">
          <div className="rounded-3xl border border-white/40 bg-white/70 p-6 backdrop-blur-xl shadow-xl min-h-[480px]">
            {children}
          </div>
        </main>

        <footer className="mt-6 flex items-center justify-between">
          <button onClick={onPrev} disabled={isFirst}
            className="flex items-center gap-2 rounded-2xl bg-white/70 px-5 py-3 font-semibold text-gray-700 shadow-sm disabled:opacity-40">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button onClick={onNext} disabled={isLast}
            className="flex items-center gap-2 rounded-2xl px-5 py-3 font-bold text-white shadow-lg disabled:opacity-40"
            style={{ background: primary }}>
            Next <ArrowRight className="h-4 w-4" />
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ---------- lightweight inline phases ---------- */
function VocabularyPhase({ items, gridClass, onComplete }: { items: string[]; gridClass: string; onComplete: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-black text-gray-800">Listen and repeat</h2>
      <div className={`grid gap-4 ${gridClass}`}>
        {items.map((w) => (
          <button key={w} onClick={() => speak(w)}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-6 shadow hover:scale-105 transition">
            <span className="text-5xl">🔊</span>
            <span className="text-xl font-bold text-gray-800">{w}</span>
          </button>
        ))}
      </div>
      <button onClick={onComplete} className="rounded-2xl bg-gray-800 px-6 py-3 font-bold text-white">I got it</button>
    </div>
  );
}

function ModelingPhase({ frame, vocab, onComplete }: { frame: string; vocab: string[]; onComplete: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-black text-gray-800">Listen to the teacher</h2>
      <div className="rounded-2xl bg-white p-8 text-2xl font-bold text-gray-800 shadow">{frame}</div>
      <div className="flex flex-wrap justify-center gap-3">
        {vocab.map((w) => (
          <button key={w} onClick={() => speak(frame.replace(/\[\w+\]/g, w))}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold shadow">
            <Volume2 className="h-4 w-4" /> {w}
          </button>
        ))}
      </div>
      <button onClick={onComplete} className="rounded-2xl bg-gray-800 px-6 py-3 font-bold text-white">Next</button>
    </div>
  );
}

function ControlledOutPhase({ frame, vocab, onComplete }: { frame: string; vocab: string[]; onComplete: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-black text-gray-800">Your turn — say it out loud</h2>
      <div className="grid gap-3">
        {vocab.map((w) => (
          <div key={w} className="rounded-2xl bg-white p-4 text-xl font-bold text-gray-800 shadow">
            {frame.replace(/\[\w+\]/g, w)}
          </div>
        ))}
      </div>
      <button onClick={onComplete} className="rounded-2xl bg-gray-800 px-6 py-3 font-bold text-white">Done</button>
    </div>
  );
}

function PhonicsAnyPhase({ letter, sound, words, onComplete }: { letter: string; sound: string; words: string[]; onComplete: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-black text-gray-800">Sound of the day</h2>
      <div className="rounded-3xl bg-white p-8 shadow">
        <div className="text-7xl font-black text-gray-800">{letter.toUpperCase()}{letter.toLowerCase()}</div>
        <div className="mt-2 text-lg text-gray-500">{sound}</div>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {words.map((w) => (
          <button key={w} onClick={() => speak(w, 0.75)}
            className="rounded-xl bg-white px-4 py-3 font-semibold shadow">{w}</button>
        ))}
      </div>
      <button onClick={onComplete} className="rounded-2xl bg-gray-800 px-6 py-3 font-bold text-white">Next</button>
    </div>
  );
}

function ChantPhase({ frame, onComplete }: { frame: string; onComplete: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-black text-gray-800">Chant time! 🎵</h2>
      <div className="rounded-2xl bg-white p-8 text-2xl font-bold text-gray-800 shadow">{frame}</div>
      <button onClick={() => speak(frame, 0.7)} className="rounded-2xl bg-white px-6 py-3 font-bold shadow">▶ Sing it</button>
      <div><button onClick={onComplete} className="rounded-2xl bg-gray-800 px-6 py-3 font-bold text-white">Next</button></div>
    </div>
  );
}

function BrainBreakPhase({ emojis, onComplete }: { emojis: string[]; onComplete: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-black text-gray-800">Brain Break 🌟</h2>
      <div className="flex justify-center gap-4 text-6xl">{emojis.map((e, i) => <span key={i}>{e}</span>)}</div>
      <button onClick={onComplete} className="rounded-2xl bg-gray-800 px-6 py-3 font-bold text-white">I'm ready</button>
    </div>
  );
}

function CoolDownPhase({ nextRoute }: { nextRoute: string }) {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-3xl font-black text-gray-800">Great job! 🎉</h2>
      <p className="text-gray-600">You finished this lesson.</p>
      <Link to={nextRoute} className="inline-block rounded-2xl bg-gray-800 px-6 py-3 font-bold text-white">Continue</Link>
    </div>
  );
}

/* ---------- Polymorphic route ---------- */
export default function PlaygroundPolymorphicLesson() {
  const { unitId = "", lessonId = "" } = useParams();
  const unit = CURRICULUM_REGISTRY[unitId];
  const lesson = unit?.lessons?.[lessonId];

  const layout = useMemo(() => computeLayout(lesson?.vocab.length ?? 3), [lesson]);

  const storageKey = `playground-${unitId}-l${lessonId}-progress`;
  const [idx, setIdx] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const saved = sessionStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  useEffect(() => {
    if (typeof window !== "undefined") sessionStorage.setItem(storageKey, String(idx));
  }, [idx, storageKey]);

  if (!unit) {
    return <div className="p-8 text-center font-bold text-red-500">Topic Unit "{unitId}" not found.</div>;
  }
  if (!lesson) {
    return <div className="p-8 text-center font-bold text-red-500">Lesson "{lessonId}" not found in "{unitId}".</div>;
  }

  const phases = lesson.phases;
  const active = phases[idx];
  const next = () => setIdx((i) => Math.min(i + 1, phases.length - 1));
  const prev = () => setIdx((i) => Math.max(i - 1, 0));
  const nextLessonRoute = `/playground/${unitId}/${lesson.lesson_number + 1}`;

  return (
    <LessonShell
      phases={phases} currentIndex={idx} onPrev={prev} onNext={next}
      title={`${unit.unit_title} · Lesson ${lesson.lesson_number}`}
      subtitle={lesson.title}
      primary={unit.primary_color} accent={unit.accent_color}
    >
      {active === "GREETING" && lesson.greet_chunks && (
        <GreetingRoutine greetings={lesson.greet_chunks} onComplete={next} />
      )}
      {active === "VOCABULARY" && (
        <VocabularyPhase items={lesson.vocab} gridClass={layout.gridColsClass} onComplete={next} />
      )}
      {active === "QUIET_MATCH" && (
        <BasketSortPhase
          vocabList={lesson.vocab}
          gridClass={layout.gridColsClass}
          allowedEmojis={unit.brain_break_emojis}
          onPhaseComplete={next}
        />
      )}
      {active === "MODELING" && (
        <ModelingPhase frame={lesson.sentence_frame} vocab={lesson.vocab} onComplete={next} />
      )}
      {active === "CONTROLLED_OUT" && (
        <ControlledOutPhase frame={lesson.sentence_frame} vocab={lesson.vocab} onComplete={next} />
      )}
      {active === "FREE_OUT" && (
        <ControlledOutPhase frame={lesson.sentence_frame} vocab={lesson.vocab} onComplete={next} />
      )}
      {active === "PHONICS" && (
        <PhonicsAnyPhase letter={lesson.phonic.letter} sound={lesson.phonic.sound} words={lesson.phonic.words} onComplete={next} />
      )}
      {active === "SPELLING" && (
        <VocabularyPhase items={lesson.vocab} gridClass={layout.gridColsClass} onComplete={next} />
      )}
      {active === "CHANT" && (
        <ChantPhase frame={lesson.sentence_frame} onComplete={next} />
      )}
      {active === "BRAIN_BREAK" && (
        <BrainBreakPhase emojis={unit.brain_break_emojis} onComplete={next} />
      )}
      {active === "COOL_DOWN" && (
        <CoolDownPhase nextRoute={nextLessonRoute} />
      )}
    </LessonShell>
  );
}
