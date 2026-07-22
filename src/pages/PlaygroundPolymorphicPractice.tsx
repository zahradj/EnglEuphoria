// src/pages/PlaygroundPolymorphicPractice.tsx
// Polymorphic Practice Booster. Maps to /playground/:unitId/practice.
// 6-phase booster sequence with slowed speech and remediation links.

import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { CURRICULUM_REGISTRY } from "@/lib/lesson/registry";

function speak(text: string, rate = 0.8) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* no-op */ }
}

function Shell({
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

const PHASES = ["WARM_UP", "PHONICS_BOOSTER", "LISTEN_AND_POINT", "MATCH_WORD", "BUILD_BASICS", "ALL_DONE"];

export default function PlaygroundPolymorphicPractice() {
  const { unitId = "" } = useParams<{ unitId: string }>();
  const targetUnit = CURRICULUM_REGISTRY[unitId];

  const storageKey = `playground-${unitId}-practice-progress`;
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const saved = sessionStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [activeTarget, setActiveTarget] = useState<string>("apple");
  const [highlightedWord, setHighlightedWord] = useState<string | null>(null);
  const [isCorrectMatch, setIsCorrectMatch] = useState(false);
  const [shake, setShake] = useState(false);

  const unitVocab = targetUnit
    ? Object.values(targetUnit.lessons).reduce<string[]>((acc, lesson) => {
        lesson.vocab.forEach((w) => { if (!acc.includes(w)) acc.push(w); });
        return acc;
      }, [])
    : [];

  useEffect(() => {
    if (unitVocab[0]) setActiveTarget(unitVocab[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, currentPhaseIndex.toString());
    }
    setIsCorrectMatch(false);
    setHighlightedWord(null);
  }, [currentPhaseIndex, storageKey]);

  useEffect(() => {
    if (PHASES[currentPhaseIndex] === "LISTEN_AND_POINT" && activeTarget) {
      speak(activeTarget, 0.8);
    }
  }, [currentPhaseIndex, activeTarget]);

  if (!targetUnit) {
    return <div className="p-8 text-center text-red-500 font-bold">Error: Topic Unit "{unitId}" not found.</div>;
  }

  const firstLesson = targetUnit.lessons["1"];
  const greetings = firstLesson?.greet_chunks || ["Hello!", "How are you?"];
  const baselineFrame = firstLesson?.sentence_frame || "It is a [noun].";
  const primary = targetUnit.primary_color;
  const activePhase = PHASES[currentPhaseIndex];

  const next = () => setCurrentPhaseIndex((p) => Math.min(p + 1, PHASES.length - 1));
  const prev = () => setCurrentPhaseIndex((p) => Math.max(p - 1, 0));

  const handleTargetMatch = (word: string) => {
    setHighlightedWord(word);
    if (word === activeTarget) {
      setIsCorrectMatch(true);
      speak(`Good job! This is ${word}.`, 0.85);
    } else {
      setShake(true);
      speak(activeTarget, 0.75);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <Shell
      phases={PHASES}
      currentIndex={currentPhaseIndex}
      onPrev={prev}
      onNext={next}
      title={`${targetUnit.unit_title} · Practice Booster`}
      primary={primary}
      accent={targetUnit.accent_color}
    >
      {activePhase === "WARM_UP" && (
        <div className="text-center py-8 space-y-6 max-w-md mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-800">Welcome to the Booster Room! 🚀</h2>
          <p className="text-base text-gray-600">Slow down and play some fun matching tasks. Let's review greetings!</p>
          <div className="bg-white/60 p-6 rounded-2xl border border-gray-200/40 shadow-inner">
            <button onClick={() => speak(greetings.join(" "), 0.8)}
              className="text-2xl font-bold hover:underline" style={{ color: primary }}>
              👋 "{greetings[0] || "Hello!"}"
            </button>
          </div>
        </div>
      )}

      {activePhase === "PHONICS_BOOSTER" && (
        <div className="text-center py-8 space-y-4">
          <h2 className="text-2xl font-extrabold text-gray-800">Phonics Booster Board</h2>
          <p className="text-sm text-gray-500">Tap to hear each target sound slowly.</p>
          {firstLesson?.phonic && (
            <div className="flex justify-center gap-3 flex-wrap pt-4">
              {firstLesson.phonic.words.map((w) => (
                <button key={w} onClick={() => speak(w, 0.7)}
                  className="px-5 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 hover:border-orange-400 shadow-sm">
                  🔊 {w}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activePhase === "LISTEN_AND_POINT" && (
        <div className="text-center py-8 space-y-6 max-w-xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-800">Listen & Point 🎧</h2>
          <p className="text-gray-600">Tap the card that matches the voice:</p>
          <div className="flex justify-center py-2">
            <button onClick={() => speak(activeTarget, 0.8)}
              className="w-20 h-20 bg-white/80 hover:bg-white border border-gray-200 text-3xl rounded-full flex items-center justify-center shadow-sm transition transform active:scale-90">
              🔊
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {unitVocab.slice(0, 3).map((word, i) => (
              <button key={word}
                onClick={() => {
                  if (word === activeTarget) {
                    speak(`Yes! This is ${word}.`, 0.85);
                    const nextWord = unitVocab[i + 1];
                    if (nextWord && i < 2) setActiveTarget(nextWord);
                    else next();
                  } else {
                    setShake(true);
                    speak(activeTarget, 0.75);
                    setTimeout(() => setShake(false), 500);
                  }
                }}
                className={`bg-white border-2 p-6 rounded-2xl font-bold text-gray-700 shadow-sm transition ${
                  shake && word !== activeTarget ? "border-red-200" : "border-gray-100 hover:border-orange-400"
                }`}>
                <span className="text-4xl">{targetUnit.brain_break_emojis[i] || "🌱"}</span>
                <span className="text-sm text-gray-500 mt-2 block font-extrabold">{word}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activePhase === "MATCH_WORD" && (
        <div className="text-center py-8 space-y-6 max-w-xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-800">Match the Word</h2>
          <p className="text-gray-600">Tap the text that matches the picture:</p>
          <div className="text-7xl py-4 bg-white/80 rounded-3xl w-32 mx-auto border shadow-inner">
            {targetUnit.brain_break_emojis[0] || "🌱"}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[unitVocab[0] || "apple", "airplane"].map((word) => (
              <button key={word} onClick={() => handleTargetMatch(word)}
                className={`p-5 rounded-2xl font-extrabold text-lg border-2 transition ${
                  highlightedWord === word
                    ? word === activeTarget
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-red-300 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white hover:border-orange-400"
                }`}>
                {word}
              </button>
            ))}
          </div>
          {isCorrectMatch && (
            <button onClick={next}
              className="text-white px-8 py-3 rounded-full font-bold text-base shadow-md mt-4"
              style={{ backgroundColor: primary }}>
              Next: Build Sentences! →
            </button>
          )}
        </div>
      )}

      {activePhase === "BUILD_BASICS" && (
        <div className="text-center py-8 space-y-6 max-w-md mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-800">Build the Sentence</h2>
          <p className="text-gray-600">Listen and confirm the baseline structure:</p>
          <div className="bg-white border-2 border-gray-100 rounded-3xl p-5 font-bold text-xl text-gray-700 min-h-[56px] flex items-center justify-center italic">
            "{baselineFrame.replace("[noun]", unitVocab[0] || "boy")}"
          </div>
          <button onClick={() => {
              speak(baselineFrame.replace("[noun]", unitVocab[0] || "boy"), 0.85);
              setTimeout(next, 600);
            }}
            className="w-full text-white py-4 rounded-2xl font-extrabold shadow-md transition text-base"
            style={{ backgroundColor: primary }}>
            👉 Tap to hear the sentence
          </button>
        </div>
      )}

      {activePhase === "ALL_DONE" && (
        <div className="text-center py-8 max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-gray-800">Practice Complete! 🏆</h2>
            <p className="text-base text-gray-500">Your conversational reflexes are fully optimized.</p>
          </div>
          <div className="flex flex-col space-y-3 pt-4">
            <Link to={`/playground/${unitId}/quiz`}
              className="w-full text-white text-lg font-extrabold py-4 px-6 rounded-2xl shadow-lg transform active:scale-95 transition text-center"
              style={{ backgroundColor: primary }}>
              🔄 Retry the Unit Quiz!
            </Link>
            <Link to={`/playground/${unitId}/review`}
              className="w-full bg-white border-2 border-gray-200 hover:border-gray-400 text-gray-700 text-lg font-extrabold py-4 px-6 rounded-2xl transform active:scale-95 transition text-center">
              ↩️ Return to Big Review
            </Link>
          </div>
        </div>
      )}
    </Shell>
  );
}
