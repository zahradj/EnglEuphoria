// ⚠️ Lesson 3 · Ocean — Animal Friends Unit (Pre-A1 → A1 bridge)
// 11-phase pipeline, 3-word complex lexical cap (fish/octopus/crab),
// OSASCOMP (size before color) drill, /f/ phonics, ocean-locked brain break.
// Adapted to react-router-dom; self-contained shell + speech helper.
import { type ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
}: {
  phases: PhaseDef[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const phase = phases[currentIndex];
  return (
    <div
      className="min-h-screen w-full px-4 py-6"
      style={{
        background:
          "radial-gradient(circle at 20% 0%, #FEFBDD 0%, #FFE7C7 40%, #FFD0A8 100%)",
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/playground/produce"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#FE6A2F]"
          >
            <Home className="w-4 h-4" /> Hub
          </Link>
          <div className="text-xs font-extrabold uppercase tracking-wider text-gray-600">
            {phase.label} · Step {currentIndex + 1} of {phases.length}
          </div>
        </div>

        <header className="mb-4 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-500">{title}</p>
          {subtitle && <h1 className="text-2xl font-black text-gray-800">{subtitle}</h1>}
        </header>

        <div className="bg-white/30 backdrop-blur-md border border-white/40 rounded-3xl p-6 shadow-xl min-h-[520px] flex flex-col justify-between">
          <div className="flex-1">{children}</div>

          <div className="flex justify-between items-center pt-6 mt-4 border-t border-white/40">
            <button
              type="button"
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1 text-sm font-bold text-gray-600 disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-1 bg-[#FE6A2F] text-white font-bold px-5 py-2 rounded-full shadow-md"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------- lesson config ------------------- */
const PHASES: PhaseDef[] = [
  { id: "VOCABULARY", label: "Vocabulary" },
  { id: "MODELING", label: "Modeling" },
  { id: "MEMORY_MATCH", label: "Memory Match" },
  { id: "DESCRIBE_PREVIEW", label: "Preview" },
  { id: "PHONICS_F", label: "Phonics /f/" },
  { id: "BUILD_SENTENCE", label: "Build Sentence" },
  { id: "PRACTICE", label: "Practice" },
  { id: "SPELLING", label: "Spelling" },
  { id: "CHANT", label: "Chant" },
  { id: "BRAIN_BREAK", label: "Brain Break" },
  { id: "COOL_DOWN", label: "Cool Down" },
];

// Strict 3-word complex lexical cap.
const OCEAN_VOCAB = ["fish", "octopus", "crab"] as const;
const OCEAN_EMOJI: Record<(typeof OCEAN_VOCAB)[number], string> = {
  fish: "🐟",
  octopus: "🐙",
  crab: "🦀",
};

// Ocean-locked brain-break tokens; pets/jungle items intentionally excluded.
const OCEAN_BRAIN_BREAK = ["🐟", "🐠", "🦐", "🐳", "🐬"] as const;

const STORAGE_KEY = "playground-ocean-progress";

/* ------------------- component ------------------- */
export default function PlaygroundOceanLesson() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 && n < PHASES.length ? n : 0;
  });
  const [shake, setShake] = useState(false);
  const [built, setBuilt] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, String(idx));
    }
    setShake(false);
    setBuilt([]);
  }, [idx]);

  const next = () => setIdx((i) => Math.min(i + 1, PHASES.length - 1));
  const prev = () => setIdx((i) => Math.max(i - 1, 0));

  // Indefinite article — first letter of the size modifier.
  const articleFor = (size: string) => (/^[aeiou]/i.test(size) ? "an" : "a");

  // Tap a token. Correct order = size → color → noun.
  const onTokenTap = (token: string) => {
    const expected = ["small", "red", "crab"]; // OSASCOMP: size before color
    const nextBuilt = [...built, token];
    if (token !== expected[built.length]) {
      setShake(true);
      speak("Listen: a small red crab.", { rate: 0.75 });
      setTimeout(() => {
        setShake(false);
        setBuilt([]);
      }, 700);
      return;
    }
    setBuilt(nextBuilt);
    if (nextBuilt.length === expected.length) {
      const sentence = `It is ${articleFor("small")} small red crab.`;
      speak(`Fantastic! ${sentence}`, { rate: 0.85 });
      setTimeout(next, 1200);
    }
  };

  const phase = PHASES[idx].id;

  return (
    <LessonShell
      phases={PHASES}
      currentIndex={idx}
      onPrev={prev}
      onNext={phase === "COOL_DOWN" ? () => navigate("/playground/produce") : next}
      title="Animal Friends · Lesson 3 Ocean"
      subtitle="Stack the words: size before color."
    >
      {/* 1. Vocabulary */}
      {phase === "VOCABULARY" && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black text-gray-800">Meet three ocean friends!</h2>
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            {OCEAN_VOCAB.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => speak(w, { rate: 0.8 })}
                className="bg-white border-2 border-gray-100 hover:border-[#FE6A2F] p-4 rounded-2xl font-extrabold text-gray-700 shadow-sm transform active:scale-95"
              >
                <div className="text-4xl">{OCEAN_EMOJI[w]}</div>
                <div className="text-sm capitalize mt-1">{w}</div>
                <Volume2 className="w-4 h-4 mx-auto mt-1 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Modeling */}
      {phase === "MODELING" && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black text-gray-800">Model the frame</h2>
          <p className="text-sm text-gray-500">Size goes before color.</p>
          <div className="bg-white/70 rounded-2xl py-6 px-4 inline-block">
            <span className="text-2xl font-extrabold text-gray-800">
              It is a <span className="text-[#FE6A2F]">small red</span> crab.
            </span>
          </div>
          <div>
            <button
              type="button"
              onClick={() => speak("It is a small red crab.")}
              className="bg-[#FE6A2F] text-white font-bold px-5 py-2 rounded-full"
            >
              🔊 Hear it
            </button>
          </div>
        </div>
      )}

      {/* 3. Memory Match (simple flip count) */}
      {phase === "MEMORY_MATCH" && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black text-gray-800">Memory Match</h2>
          <p className="text-sm text-gray-500">Tap each card to hear it. Then continue.</p>
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            {OCEAN_VOCAB.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => speak(w)}
                className="aspect-square bg-white rounded-2xl shadow-sm text-5xl flex items-center justify-center active:scale-95"
              >
                {OCEAN_EMOJI[w]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Describe Preview */}
      {phase === "DESCRIBE_PREVIEW" && (
        <div className="text-center space-y-4 py-8">
          <h2 className="text-3xl font-extrabold text-gray-800">Complex Modification</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Combine dimensions: place size before color.
          </p>
        </div>
      )}

      {/* 5. Phonics /f/ */}
      {phase === "PHONICS_F" && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black text-gray-800">
            Letter <span className="text-[#FE6A2F]">F f</span> · /f/
          </h2>
          <div className="flex justify-center gap-3 flex-wrap">
            {[
              { w: "fish", e: "🐟" },
              { w: "frog", e: "🐸" },
              { w: "foot", e: "🦶" },
            ].map(({ w, e }) => (
              <button
                key={w}
                type="button"
                onClick={() => speak(w)}
                className="bg-white rounded-2xl p-4 font-bold shadow-sm active:scale-95"
              >
                <div className="text-4xl">{e}</div>
                <div className="text-sm capitalize">{w}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Build Sentence (OSASCOMP drill) */}
      {phase === "BUILD_SENTENCE" && (
        <div
          className={`space-y-6 text-center py-4 ${
            shake ? "animate-shake bg-red-50/20 rounded-3xl" : ""
          }`}
        >
          <h2 className="text-2xl font-black text-gray-800">Stack the Blocks 🏗️</h2>
          <p className="text-sm text-gray-500">Tap in order: size → color → noun.</p>

          <div className="flex justify-center gap-2 max-w-md mx-auto bg-white/60 p-4 rounded-2xl border min-h-[64px] items-center">
            {built.length === 0 ? (
              <span className="text-gray-400 text-sm italic">It is a …</span>
            ) : (
              <span className="text-lg font-extrabold text-gray-800">
                It is a {built.join(" ")}
                {built.length === 3 ? "." : ""}
              </span>
            )}
          </div>

          <div className="flex justify-center flex-wrap gap-2">
            {/* Shuffled order forces the learner to pick size first */}
            {["red", "small", "crab"].map((token) => (
              <button
                key={token}
                type="button"
                onClick={() => onTokenTap(token)}
                disabled={built.includes(token)}
                className="bg-white border-2 border-gray-200 hover:border-[#FE6A2F] disabled:opacity-40 text-gray-800 font-extrabold px-6 py-3 rounded-xl shadow-sm active:scale-95"
              >
                {token}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7. Practice */}
      {phase === "PRACTICE" && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black text-gray-800">Your turn</h2>
          <p className="text-sm text-gray-500">Say it out loud:</p>
          <div className="text-xl font-extrabold text-gray-800 bg-white/70 rounded-2xl py-4 px-4 inline-block">
            It is a [size] [color] [noun].
          </div>
        </div>
      )}

      {/* 8. Spelling */}
      {phase === "SPELLING" && (
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-black text-gray-800">Spell the words</h2>
          <ul className="text-lg font-extrabold text-gray-800 space-y-1">
            {OCEAN_VOCAB.map((w) => (
              <li key={w} className="tracking-widest">
                {w.split("").join(" · ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 9. Chant */}
      {phase === "CHANT" && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black text-gray-800">Chant time 🎵</h2>
          <p className="text-lg font-extrabold text-[#FE6A2F]">
            Small red crab — clap clap clap!
          </p>
          <button
            type="button"
            onClick={() => speak("Small red crab! Small red crab!", { rate: 0.9 })}
            className="bg-[#FE6A2F] text-white font-bold px-5 py-2 rounded-full"
          >
            🔊 Chant
          </button>
        </div>
      )}

      {/* 10. Brain Break — ocean-locked tokens only */}
      {phase === "BRAIN_BREAK" && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black text-gray-800">Reef Brain Break! 🌊</h2>
          <p className="text-sm text-gray-500">Tap the ocean friends.</p>
          <div className="flex justify-center flex-wrap gap-3">
            {OCEAN_BRAIN_BREAK.map((e) => (
              <button
                key={e}
                type="button"
                className="text-5xl bg-white/70 rounded-2xl w-16 h-16 flex items-center justify-center active:scale-90"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 11. Cool Down */}
      {phase === "COOL_DOWN" && (
        <div className="text-center space-y-4 py-8">
          <h2 className="text-3xl font-black text-gray-800">Great work! 🌟</h2>
          <p className="text-gray-600">You stacked size before color.</p>
          <Link
            to="/playground/produce-l4"
            className="inline-block bg-[#FE6A2F] text-white font-bold px-6 py-3 rounded-full shadow-md"
          >
            Go to the Storybook →
          </Link>
        </div>
      )}
    </LessonShell>
  );
}
