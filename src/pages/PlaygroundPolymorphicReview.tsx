// src/pages/PlaygroundPolymorphicReview.tsx
// Polymorphic Big Review route. Maps to /playground/:unitId/review in App.tsx.
// Aggregates vocab across all lessons in the registry unit, runs the 10-phase
// review sequence, and branches to quiz or practice at cool-down.

import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { CURRICULUM_REGISTRY } from "@/lib/lesson/registry";

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

/* ---------- inline LessonShell ---------- */
function LessonShell({
  phases, currentIndex, onPrev, onNext, title, children, primary, accent,
}: {
  phases: string[]; currentIndex: number;
  onPrev: () => void; onNext: () => void;
  title: string; children: ReactNode;
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
            className="flex items-center gap-2 rounded-2xl px-5 py-3 font-bold text-white shadow-md disabled:opacity-40"
            style={{ background: primary }}>
            Next <ArrowRight className="h-4 w-4" />
          </button>
        </footer>
      </div>
    </div>
  );
}

const PHASES = [
  "FLASHCARDS", "COLOURS", "PHONICS_REVIEW", "MEMORY_MATCH", "SORT_BY_HOME",
  "ODD_ONE_OUT", "SENTENCE_MIXER", "SENTENCE_SCRAMBLE", "SPELL_IT", "COOL_DOWN",
];

export default function PlaygroundPolymorphicReview() {
  const { unitId = "" } = useParams<{ unitId: string }>();
  const targetUnit = CURRICULUM_REGISTRY[unitId];

  const storageKey = `playground-${unitId}-review-progress`;
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const saved = sessionStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [oddOneOutSolved, setOddOneOutSolved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, currentPhaseIndex.toString());
    }
    setOddOneOutSolved(false);
  }, [currentPhaseIndex, storageKey]);

  if (!targetUnit) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Error: Topic Unit "{unitId}" not found in Curriculum Registry.
      </div>
    );
  }

  const cumulativeVocab = Object.values(targetUnit.lessons).reduce<string[]>((acc, lesson) => {
    lesson.vocab.forEach((w) => { if (!acc.includes(w)) acc.push(w); });
    return acc;
  }, []);

  const targetSentenceFrame = targetUnit.lessons["1"]?.sentence_frame || "It is a [noun].";
  const activePhase = PHASES[currentPhaseIndex];
  const next = () => setCurrentPhaseIndex((p) => Math.min(p + 1, PHASES.length - 1));
  const prev = () => setCurrentPhaseIndex((p) => Math.max(p - 1, 0));
  const primary = targetUnit.primary_color;

  return (
    <LessonShell
      title={`${targetUnit.unit_title} · Big Review`}
      phases={PHASES}
      currentIndex={currentPhaseIndex}
      onPrev={prev}
      onNext={next}
      primary={primary}
      accent={targetUnit.accent_color}
    >
      {activePhase === "FLASHCARDS" && (
        <div className="text-center py-8 space-y-6">
          <h2 className="text-2xl font-extrabold text-gray-800">Unit Vocab Drill</h2>
          <p className="text-gray-600">Tap each word to hear it.</p>
          <div className="flex flex-wrap justify-center gap-3 max-w-xl mx-auto">
            {cumulativeVocab.map((word) => (
              <button key={word} onClick={() => speak(word)}
                className="px-5 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 hover:border-orange-400 shadow-sm transition">
                🔊 {word}
              </button>
            ))}
          </div>
        </div>
      )}

      {activePhase === "COLOURS" && (
        <div className="text-center py-12 space-y-3">
          <h2 className="text-2xl font-bold text-gray-800">Attribute Inspection</h2>
          <p className="text-gray-600">Review descriptors to support sentence stacking.</p>
        </div>
      )}

      {activePhase === "PHONICS_REVIEW" && (
        <div className="text-center py-12 space-y-3">
          <h2 className="text-2xl font-extrabold text-gray-800">Phonics Bank Board</h2>
          <p className="text-sm text-gray-500">Categorize sounds to verify letter-to-sound mappings.</p>
          {targetUnit.lessons["1"]?.phonic && (
            <button onClick={() => speak(targetUnit.lessons["1"].phonic!.sound)}
              className="mt-4 px-6 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 shadow-sm">
              🔊 {targetUnit.lessons["1"].phonic.letter} {targetUnit.lessons["1"].phonic.sound}
            </button>
          )}
        </div>
      )}

      {activePhase === "MEMORY_MATCH" && (
        <div className="text-center py-12 space-y-3">
          <h2 className="text-2xl font-bold text-gray-800">Silent Memory Match</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
            {cumulativeVocab.slice(0, 4).map((w) => (
              <div key={w} className="aspect-square rounded-2xl bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700">
                {w}
              </div>
            ))}
          </div>
        </div>
      )}

      {activePhase === "SORT_BY_HOME" && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800">Thematic Habitat Sorter</h2>
          <p className="text-gray-600 mt-2">Group items inside: "{targetUnit.container_theme}".</p>
        </div>
      )}

      {activePhase === "ODD_ONE_OUT" && (
        <div className="text-center py-12 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Identify the Variation 🧐</h2>
          <p className="text-gray-600">Which item does not match this unit?</p>
          <div className="flex justify-center flex-wrap gap-4">
            {[...cumulativeVocab.slice(0, 2), "airplane"].map((item) => (
              <button key={item}
                onClick={() => {
                  if (item === "airplane") {
                    setOddOneOutSolved(true);
                    speak("Correct! Airplane is transport.");
                  } else { speak(item); }
                }}
                className={`p-6 border-2 rounded-2xl font-bold text-lg transition ${
                  item === "airplane" && oddOneOutSolved
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white hover:border-orange-400"
                }`}>
                {item === "airplane" ? "✈️ airplane" : `🌱 ${item}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {activePhase === "SENTENCE_MIXER" && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800">Lexical Sentence Mixer</h2>
          <p className="text-gray-600 mt-2 italic">"{targetSentenceFrame}"</p>
        </div>
      )}

      {activePhase === "SENTENCE_SCRAMBLE" && (
        <div className="text-center py-12 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Structural Sentence Scramble</h2>
          <div className="bg-gray-50 p-4 rounded-xl font-bold text-gray-700 max-w-xs mx-auto italic">
            "{targetSentenceFrame}"
          </div>
        </div>
      )}

      {activePhase === "SPELL_IT" && (
        <div className="text-center py-12 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Spelling Board Review</h2>
          <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
            {cumulativeVocab.slice(0, 3).map((w) => (
              <span key={w} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-700">
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      {activePhase === "COOL_DOWN" && (
        <div className="text-center py-12 max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-gray-800">Review Complete! 🏁</h2>
            <p className="text-base text-gray-500">Ready to lock it in?</p>
          </div>
          <div className="flex flex-col space-y-3 pt-4">
            <Link to={`/playground/${unitId}/quiz`}
              className="w-full text-white text-lg font-extrabold py-4 px-6 rounded-2xl shadow-lg transform active:scale-95 transition text-center"
              style={{ backgroundColor: primary }}>
              😎 Easy! I'm ready for the Quiz.
            </Link>
            <Link to={`/playground/${unitId}/practice`}
              className="w-full bg-white border-2 border-gray-200 hover:border-gray-400 text-gray-700 text-lg font-extrabold py-4 px-6 rounded-2xl transform active:scale-95 transition text-center">
              🤔 I need more practice.
            </Link>
          </div>
        </div>
      )}
    </LessonShell>
  );
}
