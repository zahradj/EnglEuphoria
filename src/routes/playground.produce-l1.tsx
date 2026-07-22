// ⚠️ Lesson 1 · Introduction — Produce Unit (Pre-A1)
// Strict 10-phase pipeline with mandatory greeting wrapper and 3-word lexical cap.
import { type ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home, Volume2 } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Inline speech helper (Web Speech API, slow + clear for Pre-A1)            */
/* -------------------------------------------------------------------------- */
function speak(text: string, opts: { rate?: number } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate ?? 0.8;
    u.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* no-op */
  }
}

/* -------------------------------------------------------------------------- */
/*  Inline LessonShell (mirrors src/playground-blueprint/components/...)      */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/*  Phase contract                                                             */
/* -------------------------------------------------------------------------- */
const PHASES: PhaseDef[] = [
  { id: "GREETING_ROUTINE", label: "Greeting" },
  { id: "VOCABULARY", label: "Vocabulary" },
  { id: "QUIET_GAME", label: "Quiet Game" },
  { id: "MODELING", label: "Modeling" },
  { id: "CONTROLLED_OUTPUT", label: "Controlled Output" },
  { id: "PHONICS", label: "Phonics" },
  { id: "FREE_OUTPUT", label: "Free Output" },
  { id: "SPELLING", label: "Spelling" },
  { id: "CHANT", label: "Chant" },
  { id: "COOL_DOWN", label: "Cool Down" },
];

// Absolute Lexical Cap — 3 concrete nouns max for Pre-A1 L1
const CORE_VOCAB = [
  { word: "apple", emoji: "🍎" },
  { word: "banana", emoji: "🍌" },
  { word: "carrot", emoji: "🥕" },
];
const VOCAB_WORDS = CORE_VOCAB.map((v) => v.word);

const GREETING_CHUNKS = ["Hello!", "How are you?", "I am fine, thank you!"];

const PHONICS_WORDS = [
  { word: "apple", emoji: "🍎" },
  { word: "arrow", emoji: "🏹" },
  { word: "axe", emoji: "🪓" },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function PlaygroundProduceL1() {
  const storageKey = "playground-produce-l1-progress";
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

  /* ------------- per-phase local state ------------- */
  const [greetStep, setGreetStep] = useState(0);
  const [vocabHeard, setVocabHeard] = useState<Set<string>>(new Set());
  const [matchPicked, setMatchPicked] = useState<string | null>(null);
  const [matchTarget] = useState(VOCAB_WORDS[Math.floor(Math.random() * VOCAB_WORDS.length)]);
  const [modelHeard, setModelHeard] = useState<Set<string>>(new Set());
  const [builtSentence, setBuiltSentence] = useState<string | null>(null);
  const [phonicsHeard, setPhonicsHeard] = useState<Set<string>>(new Set());
  const [freePicked, setFreePicked] = useState<string | null>(null);
  const [spellIndex, setSpellIndex] = useState(0);
  const [chantCount, setChantCount] = useState(0);

  const handleGreetingTap = () => {
    if (greetStep < GREETING_CHUNKS.length - 1) {
      const n = greetStep + 1;
      setGreetStep(n);
      speak(GREETING_CHUNKS[n], { rate: 0.8 });
    } else {
      next();
    }
  };

  /* ------------- spelling utilities ------------- */
  const spellTarget = VOCAB_WORDS[spellIndex] ?? VOCAB_WORDS[0];
  const [letterBank, setLetterBank] = useState<string[]>(() => shuffle(spellTarget.split("")));
  const [assembled, setAssembled] = useState<string[]>([]);
  useEffect(() => {
    setLetterBank(shuffle(spellTarget.split("")));
    setAssembled([]);
  }, [spellTarget]);

  function shuffle<T>(arr: T[]) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  const pickLetter = (l: string, i: number) => {
    setAssembled((a) => [...a, l]);
    setLetterBank((b) => b.filter((_, idx) => idx !== i));
  };
  const resetSpelling = () => {
    setLetterBank(shuffle(spellTarget.split("")));
    setAssembled([]);
  };
  const spellingCorrect = assembled.join("") === spellTarget;

  return (
    <LessonShell
      phases={PHASES}
      currentIndex={phaseIndex}
      onPrev={prev}
      onNext={next}
      title="Fruits & Vegetables · Lesson 1"
      subtitle="Meet the words"
    >
      {/* GREETING */}
      {active === "GREETING_ROUTINE" && (
        <div className="flex flex-col items-center text-center space-y-6 py-6">
          <h2 className="text-3xl font-black text-gray-800">Let's Say Hello! 👋</h2>
          <button
            type="button"
            onClick={handleGreetingTap}
            className="w-full max-w-md bg-white/60 backdrop-blur-md border-2 border-white/80 rounded-3xl p-12 shadow-md transform active:scale-95 transition min-h-[180px] flex flex-col items-center justify-center gap-4 hover:border-[#FE6A2F]"
          >
            <span className="text-5xl font-extrabold tracking-wide text-[#FE6A2F]">
              {GREETING_CHUNKS[greetStep]}
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                speak(GREETING_CHUNKS[greetStep], { rate: 0.8 });
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full text-sm font-semibold text-gray-700 shadow-sm cursor-pointer"
            >
              <Volume2 className="h-4 w-4" /> Re-play
            </span>
          </button>
          <p className="text-xs text-gray-500 font-medium animate-pulse">
            Tap the card to continue
          </p>
        </div>
      )}

      {/* VOCABULARY */}
      {active === "VOCABULARY" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-center text-gray-800">
            Tap each picture to hear the word
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {CORE_VOCAB.map((v) => (
              <button
                key={v.word}
                onClick={() => {
                  speak(v.word, { rate: 0.75 });
                  setVocabHeard((s) => new Set(s).add(v.word));
                }}
                className="flex flex-col items-center gap-2 bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl p-4 hover:scale-105 transition"
                style={{
                  outline: vocabHeard.has(v.word) ? "3px solid #FE6A2F" : "none",
                }}
              >
                <span className="text-7xl" aria-hidden>
                  {v.emoji}
                </span>
                <span className="text-xl font-extrabold capitalize text-gray-800">
                  {v.word}
                </span>
                <Volume2 className="h-4 w-4 text-gray-500" />
              </button>
            ))}
          </div>
          {vocabHeard.size === CORE_VOCAB.length && (
            <p className="text-center text-sm font-semibold text-[#FE6A2F]">
              Great listening! Tap Next →
            </p>
          )}
        </div>
      )}

      {/* QUIET GAME (Memory Match) */}
      {active === "QUIET_GAME" && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-black text-gray-800">Find the picture!</h2>
          <button
            onClick={() => speak(matchTarget, { rate: 0.75 })}
            className="mx-auto inline-flex items-center gap-2 bg-[#FE6A2F] text-white font-bold rounded-2xl px-6 py-3 shadow-md hover:scale-105 transition"
          >
            <Volume2 className="h-5 w-5" /> Listen
          </button>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {CORE_VOCAB.map((v) => {
              const correct = matchPicked === v.word && v.word === matchTarget;
              const wrong = matchPicked === v.word && v.word !== matchTarget;
              return (
                <button
                  key={v.word}
                  onClick={() => setMatchPicked(v.word)}
                  className="bg-white/70 border border-white/80 rounded-3xl p-6 hover:scale-105 transition"
                  style={{
                    outline: correct
                      ? "3px solid #16a34a"
                      : wrong
                      ? "3px solid #dc2626"
                      : "none",
                  }}
                >
                  <span className="text-7xl" aria-hidden>
                    {v.emoji}
                  </span>
                </button>
              );
            })}
          </div>
          {matchPicked === matchTarget && (
            <p className="text-green-600 font-bold">🎉 Yes! That's right.</p>
          )}
          {matchPicked && matchPicked !== matchTarget && (
            <p className="text-red-500 font-semibold">Try again — listen and tap.</p>
          )}
        </div>
      )}

      {/* MODELING */}
      {active === "MODELING" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-center text-gray-800">Listen to the model</h2>
          <p className="text-center text-gray-600">
            Frame: <span className="font-bold text-[#FE6A2F]">"It is a/an [noun]."</span>
          </p>
          <div className="grid grid-cols-3 gap-4">
            {CORE_VOCAB.map((v) => {
              const article = /^[aeiou]/i.test(v.word) ? "an" : "a";
              const sentence = `It is ${article} ${v.word}.`;
              return (
                <button
                  key={v.word}
                  onClick={() => {
                    speak(sentence, { rate: 0.75 });
                    setModelHeard((s) => new Set(s).add(v.word));
                  }}
                  className="flex flex-col items-center gap-2 bg-white/70 border border-white/80 rounded-3xl p-4 hover:scale-105 transition"
                  style={{
                    outline: modelHeard.has(v.word) ? "3px solid #FE6A2F" : "none",
                  }}
                >
                  <span className="text-6xl" aria-hidden>
                    {v.emoji}
                  </span>
                  <span className="text-sm font-bold text-gray-700">{sentence}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTROLLED OUTPUT */}
      {active === "CONTROLLED_OUTPUT" && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-black text-gray-800">Build the sentence</h2>
          <p className="text-gray-600">Pick a word to finish: <em>It is a / an ___</em></p>
          <div className="grid grid-cols-3 gap-4">
            {CORE_VOCAB.map((v) => {
              const article = /^[aeiou]/i.test(v.word) ? "an" : "a";
              const sentence = `It is ${article} ${v.word}.`;
              return (
                <button
                  key={v.word}
                  onClick={() => {
                    setBuiltSentence(sentence);
                    speak(sentence, { rate: 0.8 });
                  }}
                  className="bg-white/70 border border-white/80 rounded-3xl p-4 hover:scale-105 transition flex flex-col items-center gap-2"
                >
                  <span className="text-6xl" aria-hidden>
                    {v.emoji}
                  </span>
                  <span className="text-base font-extrabold capitalize text-gray-800">
                    {v.word}
                  </span>
                </button>
              );
            })}
          </div>
          {builtSentence && (
            <div className="mt-4 inline-block px-6 py-3 rounded-2xl bg-[#FEFBDD] border border-[#FE6A2F]/40">
              <span className="text-xl font-extrabold text-[#FE6A2F]">{builtSentence}</span>
            </div>
          )}
        </div>
      )}

      {/* PHONICS */}
      {active === "PHONICS" && (
        <div className="space-y-6 text-center">
          <p className="text-lg font-semibold text-gray-700">Today's sound is /æ/</p>
          <button
            onClick={() => {
              speak("a, a, a, apple", { rate: 0.65 });
              setPhonicsHeard((s) => new Set(s).add("__sound__"));
            }}
            className="mx-auto flex h-40 w-40 items-center justify-center rounded-[2rem] text-7xl font-black text-white shadow-lg hover:scale-105 transition"
            style={{ background: "#FE6A2F" }}
          >
            Aa
          </button>
          <p className="text-sm text-gray-500">Tap to hear the sound</p>
          <div className="grid grid-cols-3 gap-4">
            {PHONICS_WORDS.map((w) => (
              <button
                key={w.word}
                onClick={() => {
                  speak(`a, ${w.word}`, { rate: 0.7 });
                  setPhonicsHeard((s) => new Set(s).add(w.word));
                }}
                className="flex flex-col items-center gap-2 bg-white/70 border border-white/80 rounded-3xl p-4 hover:scale-105 transition"
                style={{
                  outline: phonicsHeard.has(w.word) ? "3px solid #FE6A2F" : "none",
                }}
              >
                <span className="text-6xl" aria-hidden>
                  {w.emoji}
                </span>
                <span className="text-lg font-extrabold capitalize">
                  <span className="text-[#FE6A2F]">{w.word.charAt(0)}</span>
                  {w.word.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FREE OUTPUT */}
      {active === "FREE_OUTPUT" && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-black text-gray-800">Your turn! Say it out loud.</h2>
          <p className="text-gray-600">Pick any picture and say the sentence.</p>
          <div className="grid grid-cols-3 gap-4">
            {CORE_VOCAB.map((v) => (
              <button
                key={v.word}
                onClick={() => setFreePicked(v.word)}
                className="bg-white/70 border border-white/80 rounded-3xl p-4 hover:scale-105 transition flex flex-col items-center gap-2"
                style={{
                  outline: freePicked === v.word ? "3px solid #FE6A2F" : "none",
                }}
              >
                <span className="text-6xl" aria-hidden>
                  {v.emoji}
                </span>
                <span className="text-base font-extrabold capitalize">{v.word}</span>
              </button>
            ))}
          </div>
          {freePicked && (
            <div className="mt-4 inline-block px-6 py-3 rounded-2xl bg-[#FEFBDD] border border-[#FE6A2F]/40 text-[#FE6A2F] font-extrabold text-lg">
              🎤 Say: "It is {/^[aeiou]/i.test(freePicked) ? "an" : "a"} {freePicked}."
            </div>
          )}
        </div>
      )}

      {/* SPELLING */}
      {active === "SPELLING" && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-black text-gray-800">Tap the letters in order</h2>
          <p className="text-gray-600">
            Spell: <span className="font-bold text-[#FE6A2F] capitalize">{spellTarget}</span>
          </p>
          <div className="min-h-[64px] flex items-center justify-center gap-2">
            {assembled.map((l, i) => (
              <span
                key={i}
                className="h-14 w-14 flex items-center justify-center text-2xl font-black bg-[#FEFBDD] border-2 border-[#FE6A2F] rounded-xl"
              >
                {l}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {letterBank.map((l, i) => (
              <button
                key={`${l}-${i}`}
                onClick={() => pickLetter(l, i)}
                className="h-14 w-14 text-2xl font-black bg-white/70 border border-white/80 rounded-xl hover:scale-105 transition"
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={resetSpelling}
              className="px-4 py-2 rounded-xl bg-white/70 border border-white/80 font-semibold text-gray-700"
            >
              Reset
            </button>
            {spellingCorrect && spellIndex < VOCAB_WORDS.length - 1 && (
              <button
                onClick={() => setSpellIndex((i) => i + 1)}
                className="px-5 py-2 rounded-xl bg-[#FE6A2F] text-white font-extrabold shadow-md"
              >
                Next word →
              </button>
            )}
          </div>
          {spellingCorrect && (
            <p className="text-green-600 font-bold">🎉 Great spelling!</p>
          )}
        </div>
      )}

      {/* CHANT */}
      {active === "CHANT" && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-black text-gray-800">Let's chant together! 🎵</h2>
          <button
            onClick={() => {
              const chant = "It is an apple! It is a banana! It is a carrot!";
              speak(chant, { rate: 0.85 });
              setChantCount((c) => c + 1);
            }}
            className="mx-auto flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#FE6A2F] text-white text-xl font-extrabold shadow-lg hover:scale-105 transition"
          >
            <Volume2 className="h-6 w-6" /> Play the chant
          </button>
          <p className="text-gray-600 font-semibold">
            Played {chantCount} {chantCount === 1 ? "time" : "times"}
          </p>
          <p className="text-sm text-gray-500">Sing along as many times as you like!</p>
        </div>
      )}

      {/* COOL DOWN */}
      {active === "COOL_DOWN" && (
        <div className="space-y-6 text-center py-6">
          <h2 className="text-3xl font-black text-gray-800">Amazing job! 🌟</h2>
          <p className="text-gray-600">
            You learned <strong>apple</strong>, <strong>banana</strong>, and{" "}
            <strong>carrot</strong>. See you in Lesson 2!
          </p>
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <Link
              to="/playground/produce-l2"
              className="w-full text-center bg-[#FE6A2F] text-white text-lg font-extrabold py-4 px-6 rounded-2xl shadow-lg transform active:scale-95 transition"
            >
              ➡️ Continue to Lesson 2
            </Link>
            <Link
              to="/playground"
              className="w-full text-center bg-white border-2 border-gray-200 hover:border-gray-400 text-gray-700 text-lg font-extrabold py-4 px-6 rounded-2xl transform active:scale-95 transition"
            >
              🏠 Back to Playground
            </Link>
          </div>
        </div>
      )}
    </LessonShell>
  );
}
