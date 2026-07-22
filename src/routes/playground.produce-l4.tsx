// ⚠️ AUTOMATICALLY GENERATED FILE VIA UNIT FACTORY — DO NOT EDIT BY HAND
// Lesson 4 · Storybook (Produce unit). Phase 0 is locked to SIGNED_STORY.
// Adapted to this project's stack: react-router-dom (no TanStack), with
// lightweight inline phase shells so the file compiles standalone.

import { useEffect, useState } from "react";

// ─── Inline minimal shells (project has no LessonShell/SignedStory yet) ──────
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
                  : i < currentPhaseIndex
                  ? "bg-gray-200 text-gray-600"
                  : "bg-white border border-gray-200 text-gray-500"
              }`}
              style={i === currentPhaseIndex ? { background: primaryColor } : undefined}
            >
              {p.replace(/_/g, " ")}
            </span>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}

function SignedStoryPhase({ storyKey, onComplete }: { storyKey: string; onComplete: () => void }) {
  return (
    <div className="text-center py-12 space-y-4">
      <span className="text-5xl">📖</span>
      <h2 className="text-3xl font-extrabold text-gray-800">Signed Story Opener</h2>
      <p className="text-gray-600">Watch Pip sign the story: <code>{storyKey}</code></p>
      <button
        onClick={onComplete}
        className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold shadow-lg"
      >
        Start the Storybook
      </button>
    </div>
  );
}

function CoolDownPhase({ nextRoute }: { nextRoute: string }) {
  return (
    <div className="text-center py-12 space-y-4">
      <span className="text-5xl">🌙</span>
      <h2 className="text-3xl font-extrabold text-gray-800">Cool-Down</h2>
      <p className="text-gray-600">Great work! Stretch, breathe, and celebrate.</p>
      <a
        href={nextRoute}
        className="inline-block bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold shadow-lg"
      >
        Continue →
      </a>
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

// ─── Phase timeline (SignedStory MUST be index 0) ────────────────────────────
const PHASES = [
  "SIGNED_STORY",
  "WARM_UP",
  "VOCAB_REFRESHER",
  "SEQUENCE_SCENES",
  "COMPREHENSION_QA",
  "LOOK_AND_SAY",
  "RETELL",
  "COOL_DOWN",
] as const;

// ─── Immutable Level-Specific Scaffolding (A2 / B1 / B2) ─────────────────────
const LOOK_AND_SAY_TIERS = {
  A2: {
    label: "Pre-A1 / A1 / A2 (Basic)",
    desc: "One short sentence per slot using baseline frames.",
    who: { frame: "It is a [fruit/veg].", model: "It is a big red apple." },
    where: { frame: "They go to the [place].", model: "They go to the green garden." },
    what: { frame: "The characters are [feeling].", model: "The characters are happy." },
  },
  B1: {
    label: "B1 (Independent)",
    desc: "Two ideas per slot explicitly joined with 'and' or 'because'.",
    who: { frame: "This is a... and it is...", model: "This is a small red strawberry and it is sweet." },
    where: { frame: "They arrive at... because...", model: "They arrive at the big vegetable market because they need food." },
    what: { frame: "They feel... because...", model: "They feel excited and hungry because everything looks delicious." },
  },
  B2: {
    label: "B2 (Vantage/Proficient)",
    desc: "3-4 sentence detailed retell using sequencing markers, cause/effect, and sensory info.",
    who: { frame: "Introduce the elements with vivid modifiers...", model: "First, the children discover a massive, vibrant green watermelon resting under the shade." },
    where: { frame: "Set the scene using complex spatial clauses...", model: "Then, they bring it over to the kitchen table while observing how the sunlight hits the fresh produce." },
    what: { frame: "Synthesize the resolution with cause & effect clauses...", model: "Finally, they share a delicious meal together, feeling immensely satisfied because their garden harvest was highly successful." },
  },
} as const;

type CEFRTier = keyof typeof LOOK_AND_SAY_TIERS;
type Slot = "WHO" | "WHERE" | "WHAT";

export default function StorybookLessonComponent() {
  const storageKey = "playground-produce-l4-progress";
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const saved = window.sessionStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [selectedTier, setSelectedTier] = useState<CEFRTier>("A2");
  const [activeSlot, setActiveSlot] = useState<Slot>("WHO");
  const [showModel, setShowModel] = useState(false);
  const [studentInputs, setStudentInputs] = useState<Record<Slot, string>>({
    WHO: "",
    WHERE: "",
    WHAT: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(storageKey, currentPhaseIndex.toString());
    }
    setShowModel(false);
  }, [currentPhaseIndex]);

  const activePhase = PHASES[currentPhaseIndex];
  const next = () => setCurrentPhaseIndex((p) => Math.min(p + 1, PHASES.length - 1));
  const prev = () => setCurrentPhaseIndex((p) => Math.max(p - 1, 0));

  const tier = LOOK_AND_SAY_TIERS[selectedTier];
  const slotData = activeSlot === "WHO" ? tier.who : activeSlot === "WHERE" ? tier.where : tier.what;

  return (
    <LessonShell
      title="Fruits & Vegetables · Lesson 4 Storybook"
      phaseStrip={[...PHASES]}
      currentPhaseIndex={currentPhaseIndex}
      onNext={next}
      onPrev={prev}
      primaryColor="#FE6A2F"
      accentColor="#FEFBDD"
    >
      <div className="w-full bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-8 shadow-xl min-h-[550px]">
        {activePhase === "SIGNED_STORY" && (
          <SignedStoryPhase storyKey="produce_magic_garden" onComplete={next} />
        )}

        {activePhase === "WARM_UP" && (
          <div className="text-center py-12 space-y-4">
            <h2 className="text-3xl font-bold text-gray-800">Storybook Warm-Up</h2>
            <p className="text-lg text-gray-600">Greeting chunks: "Hello! How are you?"</p>
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold shadow-lg">
              Start Story Tasks
            </button>
          </div>
        )}

        {activePhase === "VOCAB_REFRESHER" && (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-800">Vocabulary Refresher Gaps</h2>
            <p className="text-gray-600 mt-2 mb-6">Drag and fill missing text gaps from scenes 1–3.</p>
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold">
              Next Phase
            </button>
          </div>
        )}

        {activePhase === "SEQUENCE_SCENES" && (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-800">Sequence the Story Scenes</h2>
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold mt-6">
              Next Phase
            </button>
          </div>
        )}

        {activePhase === "COMPREHENSION_QA" && (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-800">Comprehension Q&amp;A</h2>
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold mt-6">
              Launch Graphic Organizer
            </button>
          </div>
        )}

        {activePhase === "LOOK_AND_SAY" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-800">Look &amp; Say Panel</h2>
                <p className="text-sm text-gray-500 mt-1">{tier.desc}</p>
              </div>
              <div className="flex bg-gray-100 p-1.5 rounded-full space-x-1 mt-4 md:mt-0">
                {(["A2", "B1", "B2"] as CEFRTier[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedTier(t);
                      setShowModel(false);
                    }}
                    className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
                      selectedTier === t
                        ? "bg-[#FE6A2F] text-white shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t === "A2" ? "A2 Starters" : t === "B1" ? "B1 Movers" : "B2 Flyers"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded-2xl">
              {(["WHO", "WHERE", "WHAT"] as Slot[]).map((slot) => (
                <button
                  key={slot}
                  onClick={() => {
                    setActiveSlot(slot);
                    setShowModel(false);
                  }}
                  className={`py-3 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center space-x-2 ${
                    activeSlot === slot
                      ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                      : "text-gray-500 hover:bg-gray-100/50"
                  }`}
                >
                  <span>
                    {slot === "WHO" ? "👤 Who" : slot === "WHERE" ? "📍 Where" : "❓ What"}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-white/80 border border-gray-100 rounded-3xl p-6 space-y-4 shadow-inner">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#FE6A2F]">
                  Target Sentence Frame
                </span>
                <p className="text-lg font-bold text-gray-700 mt-1 italic">"{slotData.frame}"</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-wider text-gray-400">
                  Your Answer
                </label>
                <textarea
                  value={studentInputs[activeSlot]}
                  onChange={(e) =>
                    setStudentInputs({ ...studentInputs, [activeSlot]: e.target.value })
                  }
                  placeholder="Type or speak complete connecting sentences here..."
                  className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FE6A2F] text-gray-800 bg-white"
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={() => speak(slotData.model, { rate: 0.85 })}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition"
                >
                  🔊 Hear Model
                </button>
                <button
                  onClick={() => setShowModel((s) => !s)}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl text-sm transition"
                >
                  {showModel ? "Hide Model" : "👁️ Show Model"}
                </button>
              </div>

              {showModel && (
                <div className="bg-[#FEFBDD]/80 border border-amber-200 rounded-2xl p-4 animate-slideDown">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-amber-800">
                    Ideal Model Answer Comparison:
                  </span>
                  <p className="text-base font-medium text-amber-950 mt-1">"{slotData.model}"</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={next}
                className="px-10 py-3.5 bg-[#FE6A2F] hover:bg-[#e0561f] text-white font-bold rounded-full shadow-lg text-base transition"
              >
                Advance to Story Retell →
              </button>
            </div>
          </div>
        )}

        {activePhase === "RETELL" && (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-800">Story Retell Session</h2>
            <p className="text-gray-600 mt-2">Use your notes from the slots to tell the whole story.</p>
            <button onClick={next} className="bg-[#FE6A2F] text-white px-8 py-3 rounded-full font-bold mt-6">
              Finish Story
            </button>
          </div>
        )}

        {activePhase === "COOL_DOWN" && <CoolDownPhase nextRoute="/playground/review" />}
      </div>
    </LessonShell>
  );
}
