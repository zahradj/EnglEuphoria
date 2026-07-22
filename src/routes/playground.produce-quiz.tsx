// ⚠️ AUTOMATICALLY GENERATED FILE VIA UNIT FACTORY — DO NOT EDIT BY HAND
// Lesson 6 · Unit Quiz (Produce). 24 questions across 4 formats
// (audio · text · picture · spell), 3-tier star scoring, remediation loop.
// Adapted to this project's stack: react-router-dom + inline LessonShell/speak.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// ─── Inline shells (project lacks /components/lesson/LessonShell) ────────────
function LessonShell({
  title,
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
          <span
            className="px-3 py-1 rounded-full text-white text-xs font-bold"
            style={{ background: primaryColor }}
          >
            Unit Quiz
          </span>
        </header>
        {children}
      </div>
    </div>
  );
}

function speak(text: string, opts: { rate?: number } = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = opts.rate ?? 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface QuizQuestion {
  id: string;
  type: "picture" | "text" | "audio" | "spell";
  prompt: string;
  audioText?: string;
  options?: string[];
  correctAnswer: string;
  scrambledLetters?: string[];
}

// ─── 24-question bank (6 per format) ─────────────────────────────────────────
const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Audio
  { id: "q1", type: "audio", prompt: "Tap the word you hear!", audioText: "apple", options: ["apple", "banana", "carrot"], correctAnswer: "apple" },
  { id: "q2", type: "audio", prompt: "Tap the word you hear!", audioText: "strawberry", options: ["broccoli", "strawberry", "lemon"], correctAnswer: "strawberry" },
  { id: "q3", type: "audio", prompt: "Tap the word you hear!", audioText: "watermelon", options: ["watermelon", "pumpkin", "cucumber"], correctAnswer: "watermelon" },
  { id: "q4", type: "audio", prompt: "Tap the word you hear!", audioText: "baby", options: ["boy", "girl", "baby"], correctAnswer: "baby" },
  { id: "q5", type: "audio", prompt: "Tap the word you hear!", audioText: "woman", options: ["man", "woman", "friend"], correctAnswer: "woman" },
  { id: "q6", type: "audio", prompt: "Tap the word you hear!", audioText: "family", options: ["friend", "family", "boy"], correctAnswer: "family" },
  // Text / grammar / phonics
  { id: "q7", type: "text", prompt: "Complete the sentence correctly:", options: ["It is a small red apple.", "It is a red small apple.", "It is an small red apple."], correctAnswer: "It is a small red apple." },
  { id: "q8", type: "text", prompt: "Complete the sentence correctly:", options: ["It is a big green watermelon.", "It is an green big watermelon.", "It is a green big watermelon."], correctAnswer: "It is a big green watermelon." },
  { id: "q9", type: "text", prompt: "What sound does the letter 'b' make?", options: ["/b/", "/m/", "/f/"], correctAnswer: "/b/" },
  { id: "q10", type: "text", prompt: "What sound does the letter 'm' make?", options: ["/b/", "/m/", "/f/"], correctAnswer: "/m/" },
  { id: "q11", type: "text", prompt: "What sound does the letter 'f' make?", options: ["/b/", "/m/", "/f/"], correctAnswer: "/f/" },
  { id: "q12", type: "text", prompt: "Complete with the correct word: 'This is a...'", options: ["boy", "hello", "fine"], correctAnswer: "boy" },
  // Picture
  { id: "q13", type: "picture", prompt: "What fruit is this? 🍎", options: ["apple", "tomato", "onion"], correctAnswer: "apple" },
  { id: "q14", type: "picture", prompt: "What vegetable is this? 🥦", options: ["broccoli", "cucumber", "potato"], correctAnswer: "broccoli" },
  { id: "q15", type: "picture", prompt: "What fruit is this? 🍋", options: ["lemon", "banana", "watermelon"], correctAnswer: "lemon" },
  { id: "q16", type: "picture", prompt: "Identify the picture: 👶", options: ["baby", "man", "woman"], correctAnswer: "baby" },
  { id: "q17", type: "picture", prompt: "Identify the picture: 👨", options: ["man", "boy", "girl"], correctAnswer: "man" },
  { id: "q18", type: "picture", prompt: "Identify the picture: 👩", options: ["woman", "girl", "baby"], correctAnswer: "woman" },
  // Spell (scramble must not equal target — anti-hallucination)
  { id: "q19", type: "spell", prompt: "Spell the word: APPLE", scrambledLetters: ["P", "L", "P", "A", "E"], correctAnswer: "APPLE" },
  { id: "q20", type: "spell", prompt: "Spell the word: BABY", scrambledLetters: ["Y", "B", "A", "B"], correctAnswer: "BABY" },
  { id: "q21", type: "spell", prompt: "Spell the word: BOY", scrambledLetters: ["Y", "O", "B"], correctAnswer: "BOY" },
  { id: "q22", type: "spell", prompt: "Spell the word: GIRL", scrambledLetters: ["R", "L", "G", "I"], correctAnswer: "GIRL" },
  { id: "q23", type: "spell", prompt: "Spell the word: MAN", scrambledLetters: ["N", "A", "M"], correctAnswer: "MAN" },
  { id: "q24", type: "spell", prompt: "Spell the word: LEMON", scrambledLetters: ["N", "O", "M", "E", "L"], correctAnswer: "LEMON" },
];

export default function UnitQuizComponent() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [shakeActive, setShakeActive] = useState(false);
  const [spellingConstruct, setSpellingConstruct] = useState<string[]>([]);

  const activeQuestion = QUIZ_QUESTIONS[currentIdx];
  const totalQuestions = QUIZ_QUESTIONS.length;

  useEffect(() => {
    if (activeQuestion?.type === "audio" && activeQuestion.audioText) {
      speak(activeQuestion.audioText, { rate: 0.85 });
    }
    setSpellingConstruct([]);
  }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const advanceQuiz = () => {
    if (currentIdx < totalQuestions - 1) setCurrentIdx((p) => p + 1);
    else setQuizFinished(true);
  };

  const handleOptionTap = (selected: string) => {
    if (selected === activeQuestion.correctAnswer) {
      setScore((p) => p + 1);
      advanceQuiz();
    } else {
      setShakeActive(true);
      if (activeQuestion.audioText) speak(activeQuestion.audioText, { rate: 0.75 });
      setTimeout(() => setShakeActive(false), 500);
    }
  };

  const handleLetterTap = (letter: string) => {
    const updated = [...spellingConstruct, letter];
    setSpellingConstruct(updated);
    if (updated.join("") === activeQuestion.correctAnswer) {
      setScore((p) => p + 1);
      advanceQuiz();
    } else if (updated.length === activeQuestion.correctAnswer.length) {
      setShakeActive(true);
      setSpellingConstruct([]);
      setTimeout(() => setShakeActive(false), 500);
    }
  };

  const calculateStars = (): 1 | 2 | 3 => {
    if (score >= totalQuestions - 1) return 3;
    if (score >= totalQuestions / 2) return 2;
    return 1;
  };

  if (quizFinished) {
    const stars = calculateStars();
    return (
      <LessonShell
        title="Fruits & Vegetables · Unit Quiz Results"
        phaseStrip={["QUIZ_FINISHED"]}
        currentPhaseIndex={0}
        onNext={() => {}}
        onPrev={() => {}}
        primaryColor="#FE6A2F"
        accentColor="#FEFBDD"
      >
        <div className="text-center py-12 space-y-8 max-w-xl mx-auto animate-fadeIn">
          <h2 className="text-4xl font-extrabold text-gray-800">Quiz Complete! 🎉</h2>
          <div className="flex justify-center space-x-4 text-6xl">
            <span className={stars >= 1 ? "text-amber-400" : "text-gray-200"}>⭐</span>
            <span className={stars >= 2 ? "text-amber-400" : "text-gray-200"}>⭐</span>
            <span className={stars === 3 ? "text-amber-400" : "text-gray-200"}>⭐</span>
          </div>
          <p className="text-2xl font-bold text-gray-700">
            You scored: <span className="text-[#FE6A2F] text-3xl">{score}</span> / {totalQuestions}
          </p>

          {stars < 3 ? (
            <div className="bg-[#FEFBDD] border-2 border-amber-300 rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xl font-bold text-amber-900">Need More Practice? 🩹</h3>
              <p className="text-sm text-amber-800 leading-relaxed">
                Let's practice your phonics /b/, /m/, /f/ and adjective sentences once more to lock in those stars!
              </p>
              <Link
                to="/playground/produce-practice"
                className="inline-block bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-extrabold tracking-wide shadow-md transform active:scale-95 transition"
              >
                Go to Extra Booster Room 🚀
              </Link>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-green-900">Perfect Mastery! 👑</h3>
              <p className="text-sm text-green-700 mt-1">Excellent sentence building and sound recognition skills.</p>
            </div>
          )}

          <div className="pt-4">
            <Link to="/" className="text-sm font-bold text-gray-500 hover:text-gray-800 underline">
              Return to Main Hub Screen
            </Link>
          </div>
        </div>
      </LessonShell>
    );
  }

  return (
    <LessonShell
      title={`Unit Evaluation · Question ${currentIdx + 1} of ${totalQuestions}`}
      phaseStrip={["QUIZ_RUNNING"]}
      currentPhaseIndex={0}
      onNext={() => {}}
      onPrev={() => {}}
      primaryColor="#FE6A2F"
      accentColor="#FEFBDD"
    >
      <div
        className={`w-full max-w-2xl mx-auto space-y-8 pt-4 transition-transform ${
          shakeActive ? "animate-shake bg-red-50/50 rounded-3xl" : ""
        }`}
      >
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#FE6A2F] h-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest bg-[#FEFBDD] text-[#e0561f] px-3 py-1 rounded-full border border-amber-200/40">
            Format: {activeQuestion.type}
          </span>
          <h2 className="text-3xl font-extrabold text-gray-800">{activeQuestion.prompt}</h2>
        </div>

        {activeQuestion.type === "audio" && (
          <div className="flex justify-center py-4">
            <button
              onClick={() => activeQuestion.audioText && speak(activeQuestion.audioText, { rate: 0.8 })}
              className="w-24 h-24 bg-amber-100 hover:bg-amber-200 border border-amber-200 text-3xl rounded-full shadow-inner flex items-center justify-center transition transform active:scale-90"
            >
              🔊
            </button>
          </div>
        )}

        {activeQuestion.type !== "spell" && activeQuestion.options && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activeQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionTap(option)}
                className="bg-white/40 backdrop-blur-md border border-gray-200/60 hover:border-[#FE6A2F] text-gray-800 text-lg font-extrabold p-6 rounded-2xl shadow-sm text-center transition-all transform active:scale-95 min-h-[80px] flex items-center justify-center"
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {activeQuestion.type === "spell" && activeQuestion.scrambledLetters && (
          <div className="space-y-6">
            <div className="flex justify-center space-x-2 min-h-[60px] bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl p-3">
              {spellingConstruct.map((char, i) => (
                <div
                  key={i}
                  className="w-12 h-12 bg-[#FE6A2F] text-white flex items-center justify-center font-extrabold text-lg rounded-xl shadow-md"
                >
                  {char}
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-3">
              {activeQuestion.scrambledLetters.map((letter, idx) => {
                const countInConstruct = spellingConstruct.filter((c) => c === letter).length;
                const matchesBefore = activeQuestion
                  .scrambledLetters!.slice(0, idx)
                  .filter((c) => c === letter).length;
                const isUsed = matchesBefore < countInConstruct;

                return (
                  <button
                    key={idx}
                    disabled={isUsed}
                    onClick={() => handleLetterTap(letter)}
                    className={`w-14 h-14 font-extrabold text-xl rounded-xl shadow-sm transition transform active:scale-90 flex items-center justify-center min-h-[56px] ${
                      isUsed
                        ? "bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed shadow-none"
                        : "bg-white border-2 border-gray-200 text-gray-800 hover:border-[#FE6A2F]"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </LessonShell>
  );
}
