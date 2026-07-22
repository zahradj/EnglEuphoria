// src/pages/PlaygroundPolymorphicQuiz.tsx
// Polymorphic Unit Quiz. Maps to /playground/:unitId/quiz in App.tsx.
// Dynamic 24-question bank (audio/text/picture/spell), 3-tier stars,
// remediation link to /playground/:unitId/practice on <3 stars.

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Home } from "lucide-react";
import { CURRICULUM_REGISTRY } from "@/lib/lesson/registry";

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

function Shell({
  title, primary, accent, children,
}: { title: string; primary: string; accent: string; children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${accent} 0%, #ffffff 100%)` }}>
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <Link to="/playground" aria-label="Home"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 backdrop-blur-md border border-white/70 text-gray-700 transition hover:scale-105">
            <Home className="h-5 w-5" />
          </Link>
          <h1 className="flex-1 text-center text-xl sm:text-2xl font-black text-gray-800">{title}</h1>
          <div className="w-12" />
        </header>
        <main className="mt-6 flex-1">
          <div className="rounded-3xl border border-white/40 bg-white/70 p-6 backdrop-blur-xl shadow-xl min-h-[480px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

interface DynamicQuestion {
  id: string;
  type: "picture" | "text" | "audio" | "spell";
  prompt: string;
  audioText?: string;
  options?: string[];
  correctAnswer: string;
  scrambledLetters?: string[];
}

export default function PlaygroundPolymorphicQuiz() {
  const { unitId = "" } = useParams<{ unitId: string }>();
  const targetUnit = CURRICULUM_REGISTRY[unitId];

  const questionBank = useMemo<DynamicQuestion[]>(() => {
    if (!targetUnit) return [];
    const unitVocab = Object.values(targetUnit.lessons).reduce<string[]>((acc, lesson) => {
      lesson.vocab.forEach((w) => { if (!acc.includes(w)) acc.push(w); });
      return acc;
    }, []);
    const w1 = unitVocab[0] || "apple";
    const w2 = unitVocab[1] || "banana";
    const w3 = unitVocab[2] || "carrot";

    const questions: DynamicQuestion[] = [];

    for (let i = 1; i <= 6; i++) {
      const t = unitVocab[(i - 1) % unitVocab.length];
      questions.push({
        id: `aud_${i}`, type: "audio",
        prompt: "Tap the word you hear!",
        audioText: t, options: [t, "marker", "pencil"], correctAnswer: t,
      });
    }

    questions.push({
      id: "txt_1", type: "text",
      prompt: "Complete the sentence correctly:",
      options: ["It is a small red apple.", "It is a red small apple.", "It is an small red apple."],
      correctAnswer: "It is a small red apple.",
    });
    questions.push({
      id: "txt_2", type: "text",
      prompt: "What sound does the letter 'b' make?",
      options: ["/b/", "/m/", "/f/"], correctAnswer: "/b/",
    });
    for (let i = 3; i <= 6; i++) {
      questions.push({
        id: `txt_${i}`, type: "text",
        prompt: "Complete the template frame: 'This is a/an...'",
        options: [w1, "hello", "fine"], correctAnswer: w1,
      });
    }

    for (let i = 1; i <= 6; i++) {
      const t = unitVocab[(i + 1) % unitVocab.length];
      questions.push({
        id: `pic_${i}`, type: "picture",
        prompt: `Identify the target image matching: [${t.toUpperCase()}]`,
        options: [t, "house", "window"], correctAnswer: t,
      });
    }

    const spellTargets = [w1, w2, w3, w1, w2, w3];
    for (let i = 1; i <= 6; i++) {
      const word = spellTargets[i - 1];
      const scrambled = word.toUpperCase().split("").reverse();
      if (scrambled.join("") === word.toUpperCase()) {
        scrambled.push(scrambled.shift() || "X");
      }
      questions.push({
        id: `spl_${i}`, type: "spell",
        prompt: `Spell the word: ${word.toUpperCase()}`,
        scrambledLetters: scrambled, correctAnswer: word.toUpperCase(),
      });
    }

    return questions;
  }, [targetUnit]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [shake, setShake] = useState(false);
  const [spellingConstruct, setSpellingConstruct] = useState<string[]>([]);

  const activeQuestion = questionBank[currentIdx];
  const total = questionBank.length;

  useEffect(() => {
    if (activeQuestion?.type === "audio" && activeQuestion.audioText) {
      speak(activeQuestion.audioText);
    }
    setSpellingConstruct([]);
  }, [currentIdx, activeQuestion]);

  if (!targetUnit) {
    return <div className="p-8 text-center text-red-500 font-bold">Error: Topic Unit "{unitId}" not found.</div>;
  }

  const advance = () => {
    if (currentIdx < total - 1) setCurrentIdx((p) => p + 1);
    else setFinished(true);
  };

  const handleOption = (selected: string) => {
    if (selected === activeQuestion.correctAnswer) {
      setScore((p) => p + 1);
      advance();
    } else {
      setShake(true);
      if (activeQuestion.audioText) speak(activeQuestion.audioText, 0.75);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleLetter = (letter: string) => {
    const updated = [...spellingConstruct, letter];
    setSpellingConstruct(updated);
    if (updated.join("") === activeQuestion.correctAnswer) {
      setScore((p) => p + 1);
      advance();
    } else if (updated.length === activeQuestion.correctAnswer.length) {
      setShake(true);
      setSpellingConstruct([]);
      setTimeout(() => setShake(false), 500);
    }
  };

  const stars = score === total ? 3 : score >= total / 2 ? 2 : 1;

  if (finished) {
    return (
      <Shell title={`${targetUnit.unit_title} · Results`} primary={targetUnit.primary_color} accent={targetUnit.accent_color}>
        <div className="text-center py-8 space-y-8 max-w-xl mx-auto">
          <h2 className="text-4xl font-black text-gray-800">Evaluation Complete! 🎉</h2>
          <div className="flex justify-center space-x-4 text-6xl">
            <span className={stars >= 1 ? "text-amber-400" : "text-gray-200"}>⭐</span>
            <span className={stars >= 2 ? "text-amber-400" : "text-gray-200"}>⭐</span>
            <span className={stars === 3 ? "text-amber-400" : "text-gray-200"}>⭐</span>
          </div>
          <p className="text-2xl font-bold text-gray-700">
            Score: <span className="text-3xl" style={{ color: targetUnit.primary_color }}>{score}</span> / {total}
          </p>

          {stars < 3 ? (
            <div className="bg-[#FEFBDD] border-2 border-amber-300 rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xl font-bold text-amber-900">Let's Strengthen Your Skills! 🩹</h3>
              <p className="text-sm text-amber-800">A short booster will lock in those stars.</p>
              <Link to={`/playground/${unitId}/practice`}
                className="inline-block text-white px-8 py-3 rounded-full font-extrabold tracking-wide shadow-md transform active:scale-95 transition"
                style={{ backgroundColor: targetUnit.primary_color }}>
                Go to Extra Booster Room 🚀
              </Link>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-green-900">Outstanding! 👑</h3>
              <p className="text-sm text-green-700 mt-1">Flawless mastery across all unit semantic sets.</p>
            </div>
          )}

          <div className="pt-4">
            <Link to="/playground" className="text-sm font-bold text-gray-400 hover:text-gray-700 underline">
              Return to Main Hub
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title={`Unit Quiz · Q ${currentIdx + 1} / ${total}`} primary={targetUnit.primary_color} accent={targetUnit.accent_color}>
      <div className={`w-full max-w-2xl mx-auto space-y-8 pt-2 transition-transform ${shake ? "animate-shake bg-red-50/20 rounded-3xl" : ""}`}>
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
          <div className="h-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / total) * 100}%`, backgroundColor: targetUnit.primary_color }} />
        </div>

        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest bg-white text-gray-500 px-3 py-1 rounded-full border shadow-sm">
            Format: {activeQuestion.type}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">{activeQuestion.prompt}</h2>
        </div>

        {activeQuestion.type === "audio" && (
          <div className="flex justify-center py-4">
            <button onClick={() => activeQuestion.audioText && speak(activeQuestion.audioText, 0.8)}
              className="w-24 h-24 bg-white hover:bg-gray-50 border border-gray-200 text-3xl rounded-full shadow-sm flex items-center justify-center transition transform active:scale-90">
              🔊
            </button>
          </div>
        )}

        {activeQuestion.type !== "spell" && activeQuestion.options && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activeQuestion.options.map((option, idx) => (
              <button key={idx} onClick={() => handleOption(option)}
                className="bg-white/60 backdrop-blur-md border border-gray-200 hover:border-orange-400 text-gray-800 text-lg font-extrabold p-6 rounded-2xl shadow-sm text-center transition-all transform active:scale-95 min-h-[80px] flex items-center justify-center">
                {option}
              </button>
            ))}
          </div>
        )}

        {activeQuestion.type === "spell" && activeQuestion.scrambledLetters && (
          <div className="space-y-6">
            <div className="flex justify-center space-x-2 min-h-[60px] bg-gray-50/60 border border-dashed rounded-2xl p-3">
              {spellingConstruct.map((char, i) => (
                <div key={i} className="w-12 h-12 text-white flex items-center justify-center font-extrabold text-lg rounded-xl shadow-md"
                  style={{ backgroundColor: targetUnit.primary_color }}>
                  {char}
                </div>
              ))}
            </div>
            <div className="flex justify-center flex-wrap gap-3">
              {activeQuestion.scrambledLetters.map((letter, idx) => {
                const used = spellingConstruct.filter((c) => c === letter).length;
                const before = activeQuestion.scrambledLetters!.slice(0, idx).filter((c) => c === letter).length;
                const isUsed = before < used;
                return (
                  <button key={idx} disabled={isUsed} onClick={() => handleLetter(letter)}
                    className={`w-14 h-14 font-extrabold text-xl rounded-xl shadow-sm transition transform active:scale-90 flex items-center justify-center ${
                      isUsed
                        ? "bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed shadow-none"
                        : "bg-white border-2 border-gray-200 text-gray-800 hover:border-orange-400"
                    }`}>
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
