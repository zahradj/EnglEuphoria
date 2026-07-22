// ⚠️ Lesson 2 · Expansion — Produce Unit (Pre-A1)
// 10-phase pipeline, 3-word lexical cap, single-color descriptor split across two sentences.
import { type ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home, Volume2 } from "lucide-react";

/* ------------------- inline speech helper ------------------- */
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
  { id: "PHONICS_M", label: "Phonics /m/" },
  { id: "LISTEN_CAGE", label: "Basket Sort" },
  { id: "SPELLING", label: "Spelling" },
  { id: "COLORING_PREVIEW", label: "Coloring" },
  { id: "CHANT", label: "Chant" },
  { id: "COOL_DOWN", label: "Cool Down" },
];

// Lexical cap — 3 new items max
const EXPANSION_VOCAB = [
  { word: "strawberry", emoji: "🍓", color: "red" },
  { word: "broccoli", emoji: "🥦", color: "green" },
  { word: "lemon", emoji: "🍋", color: "yellow" },
];
const VOCAB_WORDS = EXPANSION_VOCAB.map((v) => v.word);

const PHONICS_M = [
  { word: "monkey", emoji: "🐒" },
  { word: "moon", emoji: "🌙" },
  { word: "mouse", emoji: "🐭" },
];

const COLOR_SWATCHES = [
  { name: "red", hex: "#ef4444" },
  { name: "green", hex: "#22c55e" },
  { name: "yellow", hex: "#facc15" },
];

export default function PlaygroundProduceL2() {
  const storageKey = "playground-produce-l2-progress";
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
  const [describePicked, setDescribePicked] = useState<string | null>(null);
  const [phonicsHeard, setPhonicsHeard] = useState<Set<string>>(new Set());
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const [sortMistake, setSortMistake] = useState(false);
  const [spellIndex, setSpellIndex] = useState(0);
  const [colorPicks, setColorPicks] = useState<Record<string, string>>({});
  const [chantCount, setChantCount] = useState(0);

  /* spelling */
  const spellTarget = VOCAB_WORDS[spellIndex] ?? VOCAB_WORDS[0];
  function shuffle<T>(arr: T[]) {
    return [...arr].sort(() => Math.random() - 0.5);
  }
  const [letterBank, setLetterBank] = useState<string[]>(() => shuffle(spellTarget.split("")));
  const [assembled, setAssembled] = useState<string[]>([]);
  useEffect(() => {
    setLetterBank(shuffle(spellTarget.split("")));
    setAssembled([]);
  }, [spellTarget]);
  const pickLetter = (l: string, i: number) => {
    setAssembled((a) => [...a, l]);
    setLetterBank((b) => b.filter((_, idx) => idx !== i));
  };
  const resetSpelling = () => {
    setLetterBank(shuffle(spellTarget.split("")));
    setAssembled([]);
  };
  const spellingCorrect = assembled.join("") === spellTarget;

  const handleBasketTap = (word: string) => {
    if (placed.has(word)) return;
    if (VOCAB_WORDS.includes(word)) {
      speak(`Put the ${word} in the basket!`, { rate: 0.85 });
      setPlaced((s) => new Set(s).add(word));
    } else {
      setSortMistake(true);
      setTimeout(() => setSortMistake(false), 500);
    }
  };

  return (
    <LessonShell
      phases={PHASES}
      currentIndex={phaseIndex}
      onPrev={prev}
      onNext={next}
      title="Fruits & Vegetables · Lesson 2"
      subtitle="More words & colors"
    >
      {/* VOCABULARY */}
      {active === "VOCABULARY" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-center text-gray-800">
            Tap each picture to hear the word
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {EXPANSION_VOCAB.map((v) => (
              <button
                key={v.word}
                onClick={() => {
                  speak(v.word, { rate: 0.75 });
                  setVocabHeard((s) => new Set(s).add(v.word));
                }}
                className="flex flex-col items-center gap-2 bg-white/70 border border-white/80 rounded-3xl p-4 hover:scale-105 transition"
                style={{ outline: vocabHeard.has(v.word) ? "3px solid #FE6A2F" : "none" }}
              >
                <span className="text-7xl">{v.emoji}</span>
                <span className="text-xl font-extrabold capitalize text-gray-800">{v.word}</span>
                <Volume2 className="h-4 w-4 text-gray-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODELING */}
      {active === "MODELING" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-center text-gray-800">Listen to the model</h2>
          <p className="text-center text-gray-600">
            Frame: <span className="font-bold text-[#FE6A2F]">"It is a/an [noun]. It is [color]."</span>
          </p>
          <div className="grid grid-cols-3 gap-4">
            {EXPANSION_VOCAB.map((v) => {
              const article = /^[aeiou]/i.test(v.word) ? "an" : "a";
              const sentence = `It is ${article} ${v.word}. It is ${v.color}.`;
              return (
                <button
                  key={v.word}
                  onClick={() => {
                    speak(sentence, { rate: 0.75 });
                    setModelHeard((s) => new Set(s).add(v.word));
                  }}
                  className="flex flex-col items-center gap-2 bg-white/70 border border-white/80 rounded-3xl p-4 hover:scale-105 transition"
                  style={{ outline: modelHeard.has(v.word) ? "3px solid #FE6A2F" : "none" }}
                >
                  <span className="text-6xl">{v.emoji}</span>
                  <span className="text-sm font-bold text-gray-700">{sentence}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MEMORY MATCH */}
      {active === "MEMORY_MATCH" && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-black text-gray-800">Find the picture!</h2>
          <button
            onClick={() => speak(matchTarget, { rate: 0.75 })}
            className="mx-auto inline-flex items-center gap-2 bg-[#FE6A2F] text-white font-bold rounded-2xl px-6 py-3 shadow-md hover:scale-105 transition"
          >
            <Volume2 className="h-5 w-5" /> Listen
          </button>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {EXPANSION_VOCAB.map((v) => {
              const correct = matchPicked === v.word && v.word === matchTarget;
              const wrong = matchPicked === v.word && v.word !== matchTarget;
              return (
                <button
                  key={v.word}
                  onClick={() => setMatchPicked(v.word)}
                  className="bg-white/70 border border-white/80 rounded-3xl p-6 hover:scale-105 transition"
                  style={{
                    outline: correct ? "3px solid #16a34a" : wrong ? "3px solid #dc2626" : "none",
                  }}
                >
                  <span className="text-7xl">{v.emoji}</span>
                </button>
              );
            })}
          </div>
          {matchPicked === matchTarget && (
            <p className="text-green-600 font-bold">🎉 Yes! That's right.</p>
          )}
        </div>
      )}

      {/* DESCRIBE PREVIEW */}
      {active === "DESCRIBE_PREVIEW" && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-black text-gray-800">Describe the item</h2>
          <p className="text-gray-600">Pick one — listen to the two-sentence description.</p>
          <div className="grid grid-cols-3 gap-4">
            {EXPANSION_VOCAB.map((v) => {
              const article = /^[aeiou]/i.test(v.word) ? "an" : "a";
              const sentence = `It is ${article} ${v.word}. It is ${v.color}.`;
              return (
                <button
                  key={v.word}
                  onClick={() => {
                    setDescribePicked(v.word);
                    speak(sentence, { rate: 0.8 });
                  }}
                  className="bg-white/70 border border-white/80 rounded-3xl p-4 hover:scale-105 transition flex flex-col items-center gap-2"
                  style={{ outline: describePicked === v.word ? "3px solid #FE6A2F" : "none" }}
                >
                  <span className="text-6xl">{v.emoji}</span>
                  <span className="text-base font-extrabold capitalize">{v.word}</span>
                </button>
              );
            })}
          </div>
          {describePicked && (
            <div className="inline-block px-6 py-3 rounded-2xl bg-[#FEFBDD] border border-[#FE6A2F]/40 text-[#FE6A2F] font-extrabold text-lg">
              {(() => {
                const v = EXPANSION_VOCAB.find((x) => x.word === describePicked)!;
                const article = /^[aeiou]/i.test(v.word) ? "an" : "a";
                return `It is ${article} ${v.word}. It is ${v.color}.`;
              })()}
            </div>
          )}
        </div>
      )}

      {/* PHONICS /m/ */}
      {active === "PHONICS_M" && (
        <div className="space-y-6 text-center">
          <p className="text-lg font-semibold text-gray-700">Today's sound is /m/</p>
          <button
            onClick={() => speak("mmm, mmm, mmm, monkey", { rate: 0.65 })}
            className="mx-auto flex h-40 w-40 items-center justify-center rounded-[2rem] text-7xl font-black text-white shadow-lg hover:scale-105 transition"
            style={{ background: "#FE6A2F" }}
          >
            Mm
          </button>
          <p className="text-sm text-gray-500">Tap to hear the sound</p>
          <div className="grid grid-cols-3 gap-4">
            {PHONICS_M.map((w) => (
              <button
                key={w.word}
                onClick={() => {
                  speak(`mmm, ${w.word}`, { rate: 0.7 });
                  setPhonicsHeard((s) => new Set(s).add(w.word));
                }}
                className="flex flex-col items-center gap-2 bg-white/70 border border-white/80 rounded-3xl p-4 hover:scale-105 transition"
                style={{ outline: phonicsHeard.has(w.word) ? "3px solid #FE6A2F" : "none" }}
              >
                <span className="text-6xl">{w.emoji}</span>
                <span className="text-lg font-extrabold capitalize">
                  <span className="text-[#FE6A2F]">{w.word.charAt(0)}</span>
                  {w.word.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LISTEN & SORT (Basket) */}
      {active === "LISTEN_CAGE" && (
        <div
          className="space-y-6 text-center"
          style={sortMistake ? { animation: "shake 0.4s" } : undefined}
        >
          <h2 className="text-3xl font-black text-gray-800">Basket Sorting 🧺</h2>
          <p className="text-sm text-gray-500">Tap each fruit/veg to store it in the basket.</p>
          <div className="w-full max-w-md mx-auto bg-amber-50/70 border-4 border-dashed border-amber-300 rounded-3xl p-8 min-h-[140px] flex items-center justify-center gap-4 shadow-inner">
            <span className="text-6xl">🧺</span>
            <span className="text-xl font-extrabold text-amber-800">
              Stored: {placed.size} / {VOCAB_WORDS.length}
            </span>
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            {EXPANSION_VOCAB.map((v) => (
              <button
                key={v.word}
                disabled={placed.has(v.word)}
                onClick={() => handleBasketTap(v.word)}
                className="w-28 h-28 bg-white/80 border-2 border-gray-100 hover:border-[#FE6A2F] rounded-2xl shadow-sm font-extrabold text-gray-700 flex flex-col items-center justify-center transform active:scale-95 transition disabled:opacity-40"
              >
                <span className="text-4xl">{v.emoji}</span>
                <span className="mt-1 text-xs">{v.word}</span>
              </button>
            ))}
          </div>
          {placed.size === VOCAB_WORDS.length && (
            <p className="text-green-600 font-bold">🎉 Basket is full!</p>
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
          <div className="min-h-[64px] flex items-center justify-center gap-2 flex-wrap">
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
          {spellingCorrect && <p className="text-green-600 font-bold">🎉 Great spelling!</p>}
        </div>
      )}

      {/* COLORING PREVIEW */}
      {active === "COLORING_PREVIEW" && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-black text-gray-800">Color the picture 🎨</h2>
          <p className="text-gray-600">Tap a color, then tap the matching fruit.</p>
          <div className="flex justify-center gap-3">
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c.name}
                onClick={() => speak(c.name, { rate: 0.8 })}
                className="h-14 w-14 rounded-full border-4 border-white shadow-md hover:scale-110 transition"
                style={{ background: c.hex }}
                aria-label={c.name}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {EXPANSION_VOCAB.map((v) => {
              const picked = colorPicks[v.word];
              const isMatch = picked === v.color;
              return (
                <div
                  key={v.word}
                  className="flex flex-col items-center gap-2 bg-white/70 border border-white/80 rounded-3xl p-4"
                >
                  <span
                    className="text-7xl"
                    style={isMatch ? { filter: `drop-shadow(0 0 8px ${COLOR_SWATCHES.find((c) => c.name === picked)?.hex})` } : undefined}
                  >
                    {v.emoji}
                  </span>
                  <div className="flex gap-2">
                    {COLOR_SWATCHES.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          setColorPicks((p) => ({ ...p, [v.word]: c.name }));
                          speak(`${v.word} is ${c.name}`, { rate: 0.8 });
                        }}
                        className="h-6 w-6 rounded-full border-2 border-white shadow"
                        style={{
                          background: c.hex,
                          outline: picked === c.name ? "2px solid #111827" : "none",
                        }}
                        aria-label={`${v.word} ${c.name}`}
                      />
                    ))}
                  </div>
                  {isMatch && (
                    <span className="text-xs font-bold text-green-600">✓ {v.color}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CHANT */}
      {active === "CHANT" && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-black text-gray-800">Let's chant! 🎵</h2>
          <button
            onClick={() => {
              const chant =
                "It is a strawberry. It is red! It is a broccoli. It is green! It is a lemon. It is yellow!";
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
        </div>
      )}

      {/* COOL DOWN */}
      {active === "COOL_DOWN" && (
        <div className="space-y-6 text-center py-6">
          <h2 className="text-3xl font-black text-gray-800">Wonderful! 🌟</h2>
          <p className="text-gray-600">
            You learned <strong>strawberry</strong>, <strong>broccoli</strong>, and{" "}
            <strong>lemon</strong> with their colors.
          </p>
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <Link
              to="/playground/produce-l3"
              className="w-full text-center bg-[#FE6A2F] text-white text-lg font-extrabold py-4 px-6 rounded-2xl shadow-lg transform active:scale-95 transition"
            >
              ➡️ Continue to Lesson 3
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

      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }`}</style>
    </LessonShell>
  );
}
