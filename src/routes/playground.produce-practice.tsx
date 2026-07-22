// ⚠️ AUTOMATICALLY GENERATED FILE VIA UNIT FACTORY — DO NOT EDIT BY HAND
// Booster · Extra Practice (Produce unit). Unnumbered safety-net room with a
// 6-phase booster timeline (~20min) looping /c/, /m/, /f/ phonics and basic
// lexical frames. Adapted to react-router-dom with inline shells.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// ─── Inline minimal shells (mirrors playground.produce-l5.tsx) ───────────────
function LessonShell({
  title,
  phaseStrip,
  currentPhaseIndex,
  onNext,
  onPrev,
  primaryColor,
  accentColor,
  children,
}: {
  title: string;
  phaseStrip: string[];
  currentPhaseIndex: number;
  onNext: () => void;
  onPrev: () => void;
  primaryColor: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen p-6"
      style={{ background: `linear-gradient(135deg, ${accentColor}, #fff)` }}
    >
      <div className="max-w-5xl mx-auto space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-gray-800">{title}</h1>
          <div className="flex gap-2">
            <button
              onClick={onPrev}
              disabled={currentPhaseIndex === 0}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-bold disabled:opacity-40"
            >
              ← Back
            </button>
            <button
              onClick={onNext}
              disabled={currentPhaseIndex >= phaseStrip.length - 1}
              className="px-4 py-2 rounded-full text-white text-sm font-bold disabled:opacity-40"
              style={{ background: primaryColor }}
            >
              Next →
            </button>
          </div>
        </header>
        <nav className="flex flex-wrap gap-1.5">
          {phaseStrip.map((p, i) => (
            <span
              key={p}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                i === currentPhaseIndex
                  ? "text-white"
                  : "bg-white border border-gray-200 text-gray-500"
              }`}
              style={i === currentPhaseIndex ? { background: primaryColor } : undefined}
            >
              {i + 1}. {p}
            </span>
          ))}
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
}

function speak(text: string, opts: { rate?: number } = {}) {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate ?? 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* no-op */
  }
}

// ─── Phase configuration ─────────────────────────────────────────────────────
const PHASES = [
  "WARM_UP",
  "PHONICS_BOOSTER",
  "LISTEN_AND_POINT",
  "MATCH_WORD",
  "BUILD_BASICS",
  "ALL_DONE",
];

const STORAGE_KEY = "playground-produce-practice-progress";

export default function ExtraPracticeBoosterComponent() {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [activeTarget, setActiveTarget] = useState<string>("apple");
  const [highlightedWord, setHighlightedWord] = useState<string | null>(null);
  const [isCorrectMatch, setIsCorrectMatch] = useState<boolean>(false);

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, String(currentPhaseIndex)); } catch {}
    setIsCorrectMatch(false);
    setHighlightedWord(null);
  }, [currentPhaseIndex]);

  const activePhase = PHASES[currentPhaseIndex];
  const next = () => setCurrentPhaseIndex((p) => Math.min(p + 1, PHASES.length - 1));
  const prev = () => setCurrentPhaseIndex((p) => Math.max(p - 1, 0));

  const handleTargetMatch = (word: string) => {
    setHighlightedWord(word);
    if (word === activeTarget) {
      setIsCorrectMatch(true);
      speak(`Good job! This is a ${word}.`, { rate: 0.85 });
    } else {
      speak(activeTarget, { rate: 0.75 });
    }
  };

  return (
    <LessonShell
      title="Fruits & Vegetables · Extra Practice Booster"
      phaseStrip={PHASES}
      currentPhaseIndex={currentPhaseIndex}
      onNext={next}
      onPrev={prev}
      primaryColor="#FE6A2F"
      accentColor="#FEFBDD"
    >
      <div className="w-full bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-8 shadow-xl min-h-[550px]">

        {activePhase === "WARM_UP" && (
          <div className="text-center py-12 space-y-6 max-w-md mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-800">Welcome to the Booster Room! 🚀</h2>
            <p className="text-base text-gray-600 leading-relaxed">
              Let's slow things down and play some fun matching games together. We'll start by practicing our greetings!
            </p>
            <div className="bg-white/60 p-6 rounded-2xl border border-gray-200/50">
              <button
                onClick={() => speak("Hello! How are you? I am fine!", { rate: 0.8 })}
                className="text-2xl font-bold text-[#FE6A2F] hover:underline"
              >
                👋 "Hello! How are you?"
              </button>
            </div>
            <button onClick={next} className="w-full bg-[#FE6A2F] text-white py-3.5 rounded-full font-extrabold shadow-md">
              Let's Play Phonics Games!
            </button>
          </div>
        )}

        {activePhase === "PHONICS_BOOSTER" && (
          <div className="text-center py-12 space-y-4">
            <h2 className="text-2xl font-extrabold text-gray-800">Phonics Extra Practice</h2>
            <p className="text-sm text-gray-500">Tap target words slowly into their /c/, /m/, /f/ homes.</p>
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto pt-4">
              {[["/c/", ["carrot", "cat"]], ["/m/", ["monkey", "milk"]], ["/f/", ["fish", "fox"]]].map(([sound, words]) => (
                <div key={sound as string} className="p-4 bg-white border border-gray-200 rounded-2xl">
                  <div className="font-extrabold text-[#FE6A2F]">{sound}</div>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    {(words as string[]).map((w) => (
                      <li key={w}>
                        <button onClick={() => speak(w, { rate: 0.8 })} className="hover:underline">🔊 {w}</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold mt-6">
              Next Phase
            </button>
          </div>
        )}

        {activePhase === "LISTEN_AND_POINT" && (
          <div className="text-center py-12 space-y-6 max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-800">Listen & Point 🎧</h2>
            <p className="text-gray-600">Listen carefully and tap the item matching the sound:</p>

            <div className="flex justify-center py-4">
              <button
                onClick={() => speak(activeTarget, { rate: 0.8 })}
                className="w-20 h-24 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-3xl rounded-full flex items-center justify-center shadow-sm transition"
              >
                🔊
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {["apple", "banana", "baby"].map((word) => (
                <button
                  key={word}
                  onClick={() => {
                    if (word === activeTarget) {
                      speak(`Yes! ${word}`, { rate: 0.85 });
                      if (activeTarget === "apple") setActiveTarget("banana");
                      else if (activeTarget === "banana") setActiveTarget("baby");
                      else next();
                    } else {
                      speak(activeTarget, { rate: 0.75 });
                    }
                  }}
                  className="bg-white border-2 border-gray-100 hover:border-[#FE6A2F] p-6 rounded-2xl font-bold text-gray-700 shadow-sm transition"
                >
                  {word === "apple" ? "🍎" : word === "banana" ? "🍌" : "👶"} <br />
                  <span className="text-sm text-gray-400 mt-2 block">{word}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activePhase === "MATCH_WORD" && (
          <div className="text-center py-12 space-y-6 max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-800">Match the Word</h2>
            <p className="text-gray-600">Tap the option that matches the target item below:</p>

            <div className="text-6xl py-4 bg-gray-50 rounded-2xl w-32 mx-auto border border-gray-100">
              {activeTarget === "banana" ? "🍌" : "🍎"}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {["apple", "banana"].map((word) => (
                <button
                  key={word}
                  onClick={() => handleTargetMatch(word)}
                  className={`p-5 rounded-2xl font-extrabold text-lg border-2 transition ${
                    highlightedWord === word
                      ? word === activeTarget
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-red-300 bg-red-50 text-red-700"
                      : "border-gray-200 bg-white hover:border-[#FE6A2F]"
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>

            {isCorrectMatch && (
              <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold">
                Next: Build Sentences! →
              </button>
            )}
          </div>
        )}

        {activePhase === "BUILD_BASICS" && (
          <div className="text-center py-12 space-y-6 max-w-md mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-800">Build the Sentence</h2>
            <p className="text-gray-600">Tap to verify the core sentence frame:</p>

            <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 font-bold text-xl text-gray-700 min-h-[50px] flex items-center justify-center">
              "It is a boy."
            </div>

            <button
              onClick={() => {
                speak("It is a boy.", { rate: 0.85 });
                setTimeout(next, 500);
              }}
              className="w-full bg-[#FE6A2F] hover:bg-[#e0561f] text-white py-4 rounded-2xl font-extrabold shadow-md transition"
            >
              👉 Click to verify and record sentence
            </button>
          </div>
        )}

        {activePhase === "ALL_DONE" && (
          <div className="text-center py-12 max-w-md mx-auto space-y-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-gray-800">Booster Complete! 🏆</h2>
              <p className="text-base text-gray-500">You are ready to head back out to the core tracks.</p>
            </div>

            <div className="flex flex-col space-y-3 pt-4">
              <Link
                to="/playground/produce-quiz"
                className="w-full bg-[#FE6A2F] hover:bg-[#e0561f] text-white text-lg font-extrabold py-4 px-6 rounded-2xl shadow-lg transform active:scale-95 transition text-center"
              >
                🔄 Try the Unit Quiz again!
              </Link>

              <Link
                to="/playground/produce-l5"
                className="w-full bg-white border-2 border-gray-200 hover:border-gray-400 text-gray-700 text-lg font-extrabold py-4 px-6 rounded-2xl transform active:scale-95 transition text-center"
              >
                ↩️ Go back to Big Review
              </Link>
            </div>
          </div>
        )}

      </div>
    </LessonShell>
  );
}
