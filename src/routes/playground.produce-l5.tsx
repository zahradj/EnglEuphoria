// ⚠️ AUTOMATICALLY GENERATED FILE VIA UNIT FACTORY — DO NOT EDIT BY HAND
// Lesson 5 · Big Review (Produce unit). 10-phase cumulative review with
// branching cool-down (Quiz vs. Practice Booster). Adapted to this project's
// react-router-dom stack with inline shells so the file compiles standalone.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// ─── Inline minimal shells (mirrors playground.produce-l4.tsx) ───────────────
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
  "FLASHCARDS",
  "COLOURS",
  "PHONICS_REVIEW",
  "MEMORY_MATCH",
  "SORT_BY_HOME",
  "ODD_ONE_OUT",
  "SENTENCE_MIXER",
  "SENTENCE_SCRAMBLE",
  "SPELL_IT",
  "COOL_DOWN",
];

const CUMULATIVE_VOCAB = [
  "apple", "banana", "carrot", "tomato", "potato", "onion",
  "strawberry", "broccoli", "lemon", "boy", "girl", "baby",
];

const STORAGE_KEY = "playground-produce-l5-progress";

export default function BigReviewLessonComponent() {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [oddOneOutSolved, setOddOneOutSolved] = useState(false);
  const [scrambleInput, setScrambleInput] = useState<string[]>([]);
  const targetScrambleSentence = ["It", "is", "a", "small", "orange", "fish"]; // size → color

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, String(currentPhaseIndex)); } catch {}
    setOddOneOutSolved(false);
    setScrambleInput([]);
  }, [currentPhaseIndex]);

  const activePhase = PHASES[currentPhaseIndex];
  const next = () => setCurrentPhaseIndex((p) => Math.min(p + 1, PHASES.length - 1));
  const prev = () => setCurrentPhaseIndex((p) => Math.max(p - 1, 0));

  return (
    <LessonShell
      title="Fruits & Vegetables · Lesson 5 Big Review"
      phaseStrip={PHASES}
      currentPhaseIndex={currentPhaseIndex}
      onNext={next}
      onPrev={prev}
      primaryColor="#FE6A2F"
      accentColor="#FEFBDD"
    >
      <div className="w-full bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-8 shadow-xl min-h-[550px]">

        {activePhase === "FLASHCARDS" && (
          <div className="text-center py-12 space-y-6">
            <h2 className="text-3xl font-extrabold text-gray-800">Cumulative Flashcard Drill</h2>
            <p className="text-gray-600">Reviewing all 12 words from the unit.</p>
            <div className="flex flex-wrap justify-center gap-3 max-w-xl mx-auto">
              {CUMULATIVE_VOCAB.map((word) => (
                <button
                  key={word}
                  onClick={() => speak(word, { rate: 0.85 })}
                  className="px-5 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 hover:border-[#FE6A2F] shadow-sm transition"
                >
                  🔊 {word}
                </button>
              ))}
            </div>
            <button onClick={next} className="bg-[#FE6A2F] text-white px-10 py-3.5 rounded-full font-extrabold shadow-lg">
              Next Phase →
            </button>
          </div>
        )}

        {activePhase === "COLOURS" && (
          <div className="text-center py-12 space-y-4">
            <h2 className="text-3xl font-bold text-gray-800">Color Adjective Matching</h2>
            <p className="text-gray-600">Prepare for adjective stacking by recalling colors.</p>
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold mt-4">Next Phase</button>
          </div>
        )}

        {activePhase === "PHONICS_REVIEW" && (
          <div className="text-center py-12 space-y-4">
            <h2 className="text-3xl font-extrabold text-gray-800">Phonics Bank Board</h2>
            <p className="text-sm text-gray-500">Sort target words into /c/, /m/, /f/ containers.</p>
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto pt-4">
              {[["/c/", ["carrot", "cat"]], ["/m/", ["monkey", "milk"]], ["/f/", ["fish", "fox"]]].map(([sound, words]) => (
                <div key={sound as string} className="p-4 bg-white border border-gray-200 rounded-2xl">
                  <div className="font-extrabold text-[#FE6A2F]">{sound}</div>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    {(words as string[]).map((w) => <li key={w}>{w}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold mt-6">Next Phase</button>
          </div>
        )}

        {activePhase === "MEMORY_MATCH" && (
          <div className="text-center py-12 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Silent Memory Match</h2>
            <p className="text-gray-600">Flip pairs of apple, broccoli, lemon, baby.</p>
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold mt-4">Next Phase</button>
          </div>
        )}

        {activePhase === "SORT_BY_HOME" && (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-800">Sort By Topic Home</h2>
            <p className="text-gray-600 mt-2">Drag items into basket or house containers.</p>
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold mt-6">Next Phase</button>
          </div>
        )}

        {activePhase === "ODD_ONE_OUT" && (
          <div className="text-center py-12 space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Find the Odd One Out! 🧐</h2>
            <p className="text-gray-600">Which item does not fit the group?</p>
            <div className="flex justify-center flex-wrap gap-4">
              {["apple", "banana", "monkey", "strawberry"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (item === "monkey") {
                      setOddOneOutSolved(true);
                      speak("Correct! Monkey is an animal, not a fruit.", { rate: 0.85 });
                    } else {
                      speak("Try again!", { rate: 0.85 });
                    }
                  }}
                  className={`p-6 border-2 rounded-2xl font-bold text-lg transition ${
                    item === "monkey" && oddOneOutSolved
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 bg-white hover:border-[#FE6A2F]"
                  }`}
                >
                  {item === "monkey" ? "🐵 monkey" : item === "apple" ? "🍎 apple" : item === "banana" ? "🍌 banana" : "🍓 strawberry"}
                </button>
              ))}
            </div>
            {oddOneOutSolved && (
              <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold">
                Advance to Sentence Mixer →
              </button>
            )}
          </div>
        )}

        {activePhase === "SENTENCE_MIXER" && (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-800">Lexical Chunk Sentence Mixer</h2>
            <p className="text-gray-600 mt-2">Recombine learned chunks into new sentences.</p>
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold mt-6">Next Phase</button>
          </div>
        )}

        {activePhase === "SENTENCE_SCRAMBLE" && (
          <div className="space-y-6 text-center py-6">
            <h2 className="text-3xl font-extrabold text-gray-800">Unscramble the Sentence</h2>
            <p className="text-sm text-gray-500">Adjective stacking: Size before Color.</p>

            <div className="flex justify-center flex-wrap gap-2 min-h-[50px] bg-gray-50 border rounded-xl p-2 max-w-md mx-auto">
              {scrambleInput.map((word, i) => (
                <span key={i} className="bg-[#FE6A2F] text-white px-3 py-1.5 font-bold rounded-lg shadow-sm">{word}</span>
              ))}
            </div>

            <div className="flex justify-center flex-wrap gap-2">
              {["orange", "is", "small", "It", "fish", "a"].map((word, idx) => {
                const isUsed = scrambleInput.includes(word);
                return (
                  <button
                    key={idx}
                    disabled={isUsed}
                    onClick={() => {
                      const updated = [...scrambleInput, word];
                      setScrambleInput(updated);
                      if (updated.join(" ") === targetScrambleSentence.join(" ")) {
                        speak("Excellent order!", { rate: 0.85 });
                        setTimeout(next, 800);
                      } else if (updated.length === targetScrambleSentence.length) {
                        setScrambleInput([]);
                      }
                    }}
                    className={`px-4 py-2 border font-bold rounded-xl ${
                      isUsed
                        ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:border-[#FE6A2F]"
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activePhase === "SPELL_IT" && (
          <div className="text-center py-12 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Spelling Consolidation Pass</h2>
            <p className="text-gray-600">Spell: boy, girl, baby.</p>
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold mt-4">Next Phase</button>
          </div>
        )}

        {activePhase === "COOL_DOWN" && (
          <div className="text-center py-12 max-w-md mx-auto space-y-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-gray-800">Unit Review Complete! 🏁</h2>
              <p className="text-base text-gray-500">How do you feel about your sentence building skills?</p>
            </div>

            <div className="flex flex-col space-y-3 pt-4">
              <Link
                to="/playground/produce-quiz"
                className="w-full bg-[#FE6A2F] hover:bg-[#e0561f] text-white text-lg font-extrabold py-4 px-6 rounded-2xl shadow-lg shadow-orange-600/20 transform active:scale-95 transition text-center"
              >
                😎 Easy! I'm ready for the Quiz.
              </Link>

              <Link
                to="/playground/practice"
                className="w-full bg-white border-2 border-gray-200 hover:border-gray-400 text-gray-700 text-lg font-extrabold py-4 px-6 rounded-2xl transform active:scale-95 transition text-center"
              >
                🤔 I need more practice.
              </Link>
            </div>
          </div>
        )}

      </div>
    </LessonShell>
  );
}
