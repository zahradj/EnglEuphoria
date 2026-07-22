// Produce Unit Hub Dashboard — adapted from the playground produce contract.
// Mounted at /playground/produce (the app's `/` is the marketing landing).
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

interface LessonCardItem {
  lessonNumber: number;
  title: string;
  topic: string;
  path: string;
  vocabPreview: string;
  icon: string;
  description: string;
}

const LESSONS_CATALOG: LessonCardItem[] = [
  {
    lessonNumber: 1,
    title: "Lesson 1 · Greetings & Core",
    topic: "Pets / People",
    path: "/playground/produce-l1",
    vocabPreview: "hello, boy, girl",
    icon: "👋",
    description: "Meet your first friends and learn the core conversational greeting routines.",
  },
  {
    lessonNumber: 2,
    title: "Lesson 2 · Jungle Expansion",
    topic: "Colors + Nouns",
    path: "/playground/produce-l2",
    vocabPreview: "strawberry, broccoli, lemon",
    icon: "🌿",
    description: "Expand your vocabulary and build two-part sentences matching simple colors.",
  },
  {
    lessonNumber: 3,
    title: "Lesson 3 · Complexity",
    topic: "Size + Color Stack",
    path: "/playground/produce-l3",
    vocabPreview: "watermelon, pumpkin, cucumber",
    icon: "🍉",
    description: "Master complex nested adjective stacking using strict size-before-color rules.",
  },
  {
    lessonNumber: 4,
    title: "Lesson 4 · Storybook",
    topic: "Reading",
    path: "/playground/produce-l4",
    vocabPreview: "The Magic Garden Rescue",
    icon: "📚",
    description: "Engage with an immersive multi-tier CEFR interactive reading panel.",
  },
  {
    lessonNumber: 5,
    title: "Lesson 5 · Big Review",
    topic: "Consolidation",
    path: "/playground/produce-l5",
    vocabPreview: "All 12 words & 3 sounds",
    icon: "🏁",
    description: "Consolidate your knowledge across revision games and choose your path.",
  },
  {
    lessonNumber: 6,
    title: "Lesson 6 · Unit Quiz",
    topic: "Mastery",
    path: "/playground/produce-quiz",
    vocabPreview: "24-question evaluation pass",
    icon: "🏆",
    description: "Test your skills across 4 distinct formats and unlock your mastery stars.",
  },
];

export default function PlaygroundProduceHub() {
  const [completedTracks, setCompletedTracks] = useState<string[]>([]);

  useEffect(() => {
    const finished: string[] = [];
    LESSONS_CATALOG.forEach((l) => {
      const key =
        l.lessonNumber === 6
          ? "playground-produce-quiz-progress"
          : `playground-produce-l${l.lessonNumber}-progress`;
      const prog = sessionStorage.getItem(key);
      if (prog && parseInt(prog, 10) >= 7) finished.push(l.path);
    });
    setCompletedTracks(finished);
  }, []);

  return (
    <div
      className="min-h-screen w-full bg-[#FEFBDD]/40 p-6 md:p-12 space-y-10 font-sans"
      style={{
        backgroundImage:
          "radial-gradient(circle at 10% 20%, rgba(254, 106, 47, 0.05) 0%, transparent 40%)",
      }}
    >
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-3xl shadow-sm space-y-4 md:space-y-0">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs uppercase font-black tracking-widest text-[#FE6A2F] bg-white px-4 py-1.5 rounded-full border shadow-sm">
            Unit 1 · Friends & Produce
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
            Playground Hub Dashboard 🏰
          </h1>
          <p className="text-base text-gray-500 font-medium">
            Ages 4–9 · Pre-A1 / A1 level immersive track sequence
          </p>
        </div>

        <button
          onClick={() =>
            speak("Welcome to the Playground! Choose a lesson block below.", { rate: 0.85 })
          }
          className="w-16 h-14 bg-white hover:bg-gray-50 border border-gray-200 text-2xl rounded-2xl flex items-center justify-center transition shadow-sm transform active:scale-95"
          title="Play welcome audio guide"
        >
          🔊
        </button>
      </header>

      <main className="max-w-6xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LESSONS_CATALOG.map((lesson) => {
            const isDone = completedTracks.includes(lesson.path);
            return (
              <div
                key={lesson.lessonNumber}
                className="bg-white/50 backdrop-blur-md border border-white/80 rounded-3xl p-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-4 hover:border-[#FE6A2F] relative group overflow-hidden"
              >
                {isDone && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                    ✓
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl w-14 h-14 rounded-2xl bg-[#FEFBDD] flex items-center justify-center border border-amber-200/50">
                      {lesson.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-800 leading-tight group-hover:text-[#FE6A2F] transition-colors">
                        {lesson.title}
                      </h3>
                      <span className="text-xs font-bold text-gray-400 block mt-0.5">
                        Focus: {lesson.topic}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed min-h-[40px]">
                    {lesson.description}
                  </p>

                  <div className="bg-white/60 rounded-xl p-2.5 border border-gray-100/50">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                      Vocab Preview
                    </span>
                    <span className="text-xs font-bold text-[#e0561f] italic">
                      {lesson.vocabPreview}
                    </span>
                  </div>
                </div>

                <Link
                  to={lesson.path}
                  className="w-full h-[80px] bg-[#FE6A2F] hover:bg-[#e0561f] text-white font-black tracking-wide rounded-2xl shadow-md flex items-center justify-center transition-all transform active:scale-95 text-center min-h-[80px]"
                >
                  Enter Lesson {lesson.lessonNumber} 🚀
                </Link>
              </div>
            );
          })}
        </div>

        <section className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-amber-200/60 rounded-3xl p-8 shadow-inner flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <div className="inline-block bg-amber-200/50 text-amber-950 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-300/40 uppercase tracking-widest">
              🩹 Extra Remediation Booster
            </div>
            <h2 className="text-2xl font-black text-gray-800">The Extra Practice Room</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Struggling with the quiz score thresholds or letter-sound connections? Enter the
              unnumbered practice booster block to review /b/, /m/, and /f/ sounds at a slower pace.
            </p>
          </div>

          <Link
            to="/playground/produce-practice"
            className="w-full md:w-auto px-10 h-[80px] bg-white border-2 border-gray-200 hover:border-[#FE6A2F] text-gray-700 hover:text-[#FE6A2F] font-black tracking-wide rounded-2xl flex items-center justify-center shadow-sm transition-all transform active:scale-95 text-center min-h-[80px]"
          >
            Launch Extra Practice 🚀
          </Link>
        </section>
      </main>
    </div>
  );
}
