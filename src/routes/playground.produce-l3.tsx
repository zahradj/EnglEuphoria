// ⚠️ Lesson 3 · Complex Stacking — Produce Unit (Pre-A1 → A1 bridge)
// 10-phase pipeline, 3-word complex lexical cap, OSASCOMP (size before color) drill.
import { type ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home, Volume2 } from "lucide-react";

/* ------------------- inline speech helper ------------------- */
function speak(text: string, opts: { rate?: number } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate ?? 0.85;
    u.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* no-op */
  }
}

/* ------------------- inline LessonShell ------------------- */
type PhaseDef = { id: string; label: string };

function LessonShell({
  phases,
  currentIndex,
  onPrev,
  onNext,
  title,
  subtitle,
  children,
  canAdvance = true,
}: {
  phases: PhaseDef[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  canAdvance?: boolean;
}) {
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= phases.length - 1;
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#FEFBDD 0%,#FFE6CF 100%)" }}>
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/playground"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 backdrop-blur-md border border-white/70 text-gray-700 transition hover:scale-105"
            aria-label="Back to Playground"
          >
            <Home className="h-5 w-5" />
          </Link>
          <div className="flex flex-1 items-center justify-center gap-2">
            {phases.map((p, i) => (
              <div
                key={p.id}
                className="h-2.5 flex-1 max-w-16 rounded-full transition-all"
                style={{ background: i <= currentIndex ? "#FE6A2F" : "rgba(254,106,47,0.18)" }}
              />
            ))}
          </div>
          <div className="w-12" />
        </header>

        <div className="mt-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#FE6A2F]">
            {phases[currentIndex]?.label} · Step {currentIndex + 1} of {phases.length}
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black text-gray-800">{title}</h1>
          {subtitle && <p className="mt-2 text-base text-gray-600 sm:text-lg">{subtitle}</p>}
        </div>

        <main className="mt-6 flex-1">
          <div className="rounded-[2rem] bg-white/40 backdrop-blur-md border border-white/60 shadow-xl p-5 sm:p-8">
            {children}
          </div>
        </main>

        <footer className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="flex h-14 items-center gap-2 rounded-2xl bg-white/60 border border-white/70 px-5 text-base font-bold text-gray-700 transition hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-5 w-5" /> Back
          </button>
          <button
            onClick={onNext}
            disabled={!canAdvance || isLast}
            className="flex h-14 items-center gap-2 rounded-2xl px-7 text-lg font-extrabold text-white shadow-lg transition hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#FE6A2F" }}
          >
            {isLast ? "Finish" : "Next"} <ArrowRight className="h-5 w-5" />
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ------------------- phase contract ------------------- */
const PHASES: PhaseDef[] = [
  { id: "VOCABULARY", label: "Vocabulary" },
  { id: "MODELING", label: "Modeling" },
  { id: "MEMORY_MATCH", label: "Memory Match" },
  { id: "DESCRIBE_PREVIEW", label: "Describe" },
  { id: "PHONICS_F", label: "Phonics /f/" },
  { id: "BUILD_SENTENCE", label: "Stack Adjectives" },
  { id: "PRACTICE", label: "Practice" },
  { id: "SPELLING", label: "Spelling" },
  { id: "CHANT", label: "Chant" },
  { id: "COOL_DOWN", label: "Cool Down" },
];

// Complex tier — 3 multi-syllable items, all paired with size+color descriptors.
const COMPLEX_VOCAB = [
  { word: "watermelon", emoji: "🍉", size: "big", color: "green" },
  { word: "pumpkin", emoji: "🎃", size: "big", color: "orange" },
  { word: "cucumber", emoji: "🥒", size: "long", color: "green" },
];
const VOCAB_WORDS = COMPLEX_VOCAB.map((v) => v.word);

const PHONICS_F = [
  { word: "fish", emoji: "🐟" },
  { word: "frog", emoji: "🐸" },
  { word: "foot", emoji: "🦶" },
];

// OSASCOMP article rule — article tracks the FIRST descriptor's leading sound.
function getArticle(size: string): string {
  return /^[aeiou]/i.test(size.trim()) ? "an" : "a";
}
function buildPhrase(size: string, color: string, noun: string) {
  return `${getArticle(size)} ${size} ${color} ${noun}`;
}

export default function PlaygroundProduceL3() {
  const storageKey = "playground-produce-l3-progress";
  const [phaseIndex, setPhaseIndex] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const saved = window.sessionStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) : 0;
  });
  useEffect(() => {
    window.sessionStorage.setItem(storageKey, String(phaseIndex));
  }, [phaseIndex]);

  const next = () => setPhaseIndex((i) => Math.min(i + 1, PHASES.length - 1));
  const prev = () => setPhaseIndex((i) => Math.max(i - 1, 0));
  const active = PHASES[phaseIndex].id;

  /* per-phase state */
  const [vocabHeard, setVocabHeard] = useState<Set<string>>(new Set());
  const [modelHeard, setModelHeard] = useState<Set<string>>(new Set());
  const [matchPicked, setMatchPicked] = useState<string | null>(null);
  const [matchTarget] = useState(VOCAB_WORDS[Math.floor(Math.random() * VOCAB_WORDS.length)]);
  const [describePicked, setDescribePicked] = useState<number | null>(null);
  const [phonicsHeard, setPhonicsHeard] = useState<Set<string>>(new Set());
  const [stack, setStack] = useState<string[]>([]);
  const [stackError, setStackError] = useState(false);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [spellingInput, setSpellingInput] = useState("");
  const [spellingDone, setSpellingDone] = useState<Set<string>>(new Set());
  const [spellingIndex, setSpellingIndex] = useState(0);
  const [chantHeard, setChantHeard] = useState(false);

  const stackTarget = COMPLEX_VOCAB[0]; // big green watermelon
  const stackTokens = ["green", "big", "watermelon"]; // intentionally scrambled

  const handleStackTap = (token: string) => {
    if (stack.includes(token)) return;
    const nextStack = [...stack, token];
    setStack(nextStack);
    if (nextStack.length === 3) {
      const correct =
        nextStack[0] === stackTarget.size &&
        nextStack[1] === stackTarget.color &&
        nextStack[2] === stackTarget.word;
      if (correct) {
        speak(`Excellent! It is ${buildPhrase(stackTarget.size, stackTarget.color, stackTarget.word)}.`, { rate: 0.85 });
      } else {
        setStackError(true);
        speak(`Listen: ${buildPhrase(stackTarget.size, stackTarget.color, stackTarget.word)}.`, { rate: 0.75 });
        setTimeout(() => {
          setStack([]);
          setStackError(false);
        }, 1400);
      }
    }
  };

  const stackComplete =
    stack.length === 3 &&
    stack[0] === stackTarget.size &&
    stack[1] === stackTarget.color &&
    stack[2] === stackTarget.word;

  return (
    <LessonShell
      phases={PHASES}
      currentIndex={phaseIndex}
      onPrev={prev}
      onNext={next}
      title="Fruits & Vegetables · Lesson 3"
      subtitle="Stack the words: size before color."
    >
      {/* 1 — Vocabulary */}
      {active === "VOCABULARY" && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-black text-gray-800">Meet three big words!</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {COMPLEX_VOCAB.map((v) => (
              <button
                key={v.word}
                onClick={() => {
                  speak(v.word, { rate: 0.7 });
                  setVocabHeard((s) => new Set(s).add(v.word));
                }}
                className="rounded-2xl bg-white border-2 border-white/80 shadow-md p-5 hover:scale-105 transition"
              >
                <div className="text-6xl">{v.emoji}</div>
                <div className="mt-3 text-xl font-extrabold text-gray-800 capitalize">{v.word}</div>
                <div className="mt-1 text-xs text-[#FE6A2F] flex items-center justify-center gap-1">
                  <Volume2 className="h-3.5 w-3.5" /> Tap to hear
                </div>
              </button>
            ))}
          </div>
          {vocabHeard.size >= VOCAB_WORDS.length && (
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold shadow-md">
              Continue →
            </button>
          )}
        </div>
      )}

      {/* 2 — Modeling */}
      {active === "MODELING" && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-black text-gray-800">Listen to the full sentence</h2>
          <p className="text-sm text-gray-500">Frame: It is <b>a/an</b> <b>[size]</b> <b>[color]</b> [noun].</p>
          <div className="space-y-3 max-w-md mx-auto">
            {COMPLEX_VOCAB.map((v) => {
              const phrase = `It is ${buildPhrase(v.size, v.color, v.word)}.`;
              return (
                <button
                  key={v.word}
                  onClick={() => {
                    speak(phrase, { rate: 0.75 });
                    setModelHeard((s) => new Set(s).add(v.word));
                  }}
                  className="w-full flex items-center gap-4 rounded-2xl bg-white/80 border border-white p-4 shadow-sm hover:scale-[1.02] transition text-left"
                >
                  <span className="text-4xl">{v.emoji}</span>
                  <span className="flex-1 text-lg font-bold text-gray-800">{phrase}</span>
                  <Volume2 className="h-5 w-5 text-[#FE6A2F]" />
                </button>
              );
            })}
          </div>
          {modelHeard.size >= VOCAB_WORDS.length && (
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold shadow-md">
              Continue →
            </button>
          )}
        </div>
      )}

      {/* 3 — Memory Match */}
      {active === "MEMORY_MATCH" && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-black text-gray-800">Which one did you hear?</h2>
          <button
            onClick={() => speak(matchTarget, { rate: 0.7 })}
            className="inline-flex items-center gap-2 bg-white/80 px-5 py-3 rounded-full font-bold text-gray-700 shadow"
          >
            <Volume2 className="h-5 w-5 text-[#FE6A2F]" /> Play word
          </button>
          <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto">
            {COMPLEX_VOCAB.map((v) => {
              const picked = matchPicked === v.word;
              const correct = matchPicked && v.word === matchTarget;
              return (
                <button
                  key={v.word}
                  onClick={() => setMatchPicked(v.word)}
                  className={`rounded-2xl p-4 border-2 transition ${
                    picked && correct
                      ? "bg-green-100 border-green-400"
                      : picked
                      ? "bg-red-100 border-red-300"
                      : "bg-white border-white/80 hover:border-[#FE6A2F]"
                  }`}
                >
                  <div className="text-5xl">{v.emoji}</div>
                  <div className="mt-2 text-sm font-bold capitalize">{v.word}</div>
                </button>
              );
            })}
          </div>
          {matchPicked === matchTarget && (
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold shadow-md">
              Continue →
            </button>
          )}
        </div>
      )}

      {/* 4 — Describe preview */}
      {active === "DESCRIBE_PREVIEW" && (
        <div className="space-y-5 text-center">
          <h2 className="text-2xl font-black text-gray-800">Pick a fruit, then describe it</h2>
          <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto">
            {COMPLEX_VOCAB.map((v, i) => (
              <button
                key={v.word}
                onClick={() => {
                  setDescribePicked(i);
                  speak(`It is ${buildPhrase(v.size, v.color, v.word)}.`, { rate: 0.8 });
                }}
                className={`rounded-2xl p-4 border-2 transition ${
                  describePicked === i ? "bg-[#FFE6CF] border-[#FE6A2F]" : "bg-white border-white/80 hover:border-[#FE6A2F]"
                }`}
              >
                <div className="text-5xl">{v.emoji}</div>
                <div className="mt-2 text-xs font-bold capitalize text-gray-700">{v.size} · {v.color}</div>
              </button>
            ))}
          </div>
          {describePicked !== null && (
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold shadow-md">
              Continue →
            </button>
          )}
        </div>
      )}

      {/* 5 — Phonics /f/ */}
      {active === "PHONICS_F" && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-black text-gray-800">The /f/ sound</h2>
          <button
            onClick={() => speak("fff... fish, frog, foot.", { rate: 0.7 })}
            className="inline-flex items-center gap-2 bg-white/80 px-5 py-3 rounded-full font-bold text-gray-700 shadow"
          >
            <Volume2 className="h-5 w-5 text-[#FE6A2F]" /> Listen: /f/
          </button>
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            {PHONICS_F.map((p) => (
              <button
                key={p.word}
                onClick={() => {
                  speak(p.word, { rate: 0.7 });
                  setPhonicsHeard((s) => new Set(s).add(p.word));
                }}
                className="rounded-2xl bg-white border-2 border-white/80 p-4 shadow-sm hover:scale-105 transition"
              >
                <div className="text-5xl">{p.emoji}</div>
                <div className="mt-2 font-bold capitalize">{p.word}</div>
              </button>
            ))}
          </div>
          {phonicsHeard.size >= PHONICS_F.length && (
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold shadow-md">
              Continue →
            </button>
          )}
        </div>
      )}

      {/* 6 — Build Sentence (OSASCOMP stacking) */}
      {active === "BUILD_SENTENCE" && (
        <div className={`space-y-6 text-center ${stackError ? "animate-shake" : ""}`}>
          <div>
            <h2 className="text-2xl font-black text-gray-800">Order the words: size → color → noun</h2>
            <p className="text-sm text-gray-500 mt-1">Target: {stackTarget.emoji} {buildPhrase(stackTarget.size, stackTarget.color, stackTarget.word)}</p>
          </div>
          <div className="flex justify-center items-center gap-2 max-w-md mx-auto bg-white/60 p-4 rounded-2xl border border-white min-h-[72px]">
            <span className="text-gray-500 font-bold">It is {stack.length > 0 ? getArticle(stack[0]) : "…"}</span>
            {stack.length === 0 && <span className="text-gray-400 italic text-sm">Tap words below ↓</span>}
            {stack.map((t, i) => (
              <span key={i} className="px-3 py-1 rounded-lg bg-[#FE6A2F] text-white font-extrabold">
                {t}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {stackTokens.map((token) => {
              const used = stack.includes(token);
              return (
                <button
                  key={token}
                  disabled={used}
                  onClick={() => handleStackTap(token)}
                  className={`px-6 py-3 rounded-xl font-extrabold border-2 transition transform active:scale-95 ${
                    used
                      ? "bg-gray-100 text-gray-400 border-gray-200"
                      : "bg-white text-gray-800 border-gray-200 hover:border-[#FE6A2F] shadow-sm"
                  }`}
                >
                  {token}
                </button>
              );
            })}
          </div>
          {stackComplete && (
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold shadow-md">
              Continue →
            </button>
          )}
        </div>
      )}

      {/* 7 — Practice */}
      {active === "PRACTICE" && (() => {
        const item = COMPLEX_VOCAB[practiceIndex];
        const phrase = `It is ${buildPhrase(item.size, item.color, item.word)}.`;
        const done = practiceIndex >= COMPLEX_VOCAB.length - 1;
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-black text-gray-800">Say it out loud!</h2>
            <div className="text-7xl">{item.emoji}</div>
            <p className="text-xl font-bold text-gray-800">{phrase}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => speak(phrase, { rate: 0.75 })}
                className="inline-flex items-center gap-2 bg-white/80 px-5 py-3 rounded-full font-bold text-gray-700 shadow"
              >
                <Volume2 className="h-5 w-5 text-[#FE6A2F]" /> Hear again
              </button>
              <button
                onClick={() => (done ? next() : setPracticeIndex((i) => i + 1))}
                className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold shadow-md"
              >
                {done ? "Continue →" : "Next fruit"}
              </button>
            </div>
          </div>
        );
      })()}

      {/* 8 — Spelling */}
      {active === "SPELLING" && (() => {
        const target = VOCAB_WORDS[spellingIndex];
        const allDone = spellingDone.size >= VOCAB_WORDS.length;
        return (
          <div className="space-y-5 text-center">
            <h2 className="text-2xl font-black text-gray-800">Type the word</h2>
            <button
              onClick={() => speak(target, { rate: 0.7 })}
              className="inline-flex items-center gap-2 bg-white/80 px-5 py-3 rounded-full font-bold text-gray-700 shadow"
            >
              <Volume2 className="h-5 w-5 text-[#FE6A2F]" /> Hear word {spellingIndex + 1}/{VOCAB_WORDS.length}
            </button>
            <input
              value={spellingInput}
              onChange={(e) => setSpellingInput(e.target.value)}
              className="block mx-auto px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FE6A2F] outline-none text-center text-lg font-bold w-64"
              placeholder="type here…"
            />
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  if (spellingInput.trim().toLowerCase() === target) {
                    const newDone = new Set(spellingDone).add(target);
                    setSpellingDone(newDone);
                    setSpellingInput("");
                    if (spellingIndex < VOCAB_WORDS.length - 1) setSpellingIndex(spellingIndex + 1);
                    speak("Yes!", { rate: 0.9 });
                  } else {
                    speak(`Try again. ${target}.`, { rate: 0.7 });
                  }
                }}
                className="bg-white border-2 border-[#FE6A2F] text-[#FE6A2F] px-6 py-3 rounded-full font-bold"
              >
                Check
              </button>
              {allDone && (
                <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold shadow-md">
                  Continue →
                </button>
              )}
            </div>
            <div className="text-sm text-gray-500">Done: {[...spellingDone].join(", ") || "—"}</div>
          </div>
        );
      })()}

      {/* 9 — Chant */}
      {active === "CHANT" && (
        <div className="space-y-5 text-center">
          <h2 className="text-2xl font-black text-gray-800">Chant together! 🎵</h2>
          <p className="text-lg font-bold text-gray-700 max-w-md mx-auto leading-relaxed">
            {COMPLEX_VOCAB.map((v) => `${buildPhrase(v.size, v.color, v.word)}!`).join(" · ")}
          </p>
          <button
            onClick={() => {
              const line = COMPLEX_VOCAB.map((v) => buildPhrase(v.size, v.color, v.word)).join(", ") + "!";
              speak(line, { rate: 0.8 });
              setChantHeard(true);
            }}
            className="inline-flex items-center gap-2 bg-white/80 px-5 py-3 rounded-full font-bold text-gray-700 shadow"
          >
            <Volume2 className="h-5 w-5 text-[#FE6A2F]" /> Sing it
          </button>
          {chantHeard && (
            <div>
              <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold shadow-md mt-2">
                Continue →
              </button>
            </div>
          )}
        </div>
      )}

      {/* 10 — Cool down (topic-locked brain break) */}
      {active === "COOL_DOWN" && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-black text-gray-800">Garden Brain Break! 🥕</h2>
          <p className="text-sm text-gray-500">You stacked your first big descriptions. Tap a basket friend to celebrate.</p>
          <div className="flex justify-center gap-4 text-6xl">
            {["🍎", "🥕", "🍓", "🥦"].map((e) => (
              <button
                key={e}
                onClick={() => speak("Yum!", { rate: 0.9 })}
                className="rounded-2xl bg-white/70 border border-white p-4 shadow hover:scale-110 transition"
              >
                {e}
              </button>
            ))}
          </div>
          <div className="pt-4">
            <Link
              to="/playground/produce-l4"
              className="inline-block bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-extrabold shadow-md"
            >
              Next: Lesson 4 Storybook →
            </Link>
          </div>
        </div>
      )}
    </LessonShell>
  );
}
