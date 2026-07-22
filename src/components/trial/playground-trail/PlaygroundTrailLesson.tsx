import { useEffect, useMemo, useRef, useState } from "react";
import { useTrailSync } from "../useTrailSync";


import logo from "@/assets/playground-trail/logo.png";
import mascot from "@/assets/playground-trail/mascot.png";
import apple from "@/assets/playground-trail/apple.png";
import ball from "@/assets/playground-trail/ball.png";
import cat from "@/assets/playground-trail/cat.png";
import dog from "@/assets/playground-trail/dog.png";
import elephant from "@/assets/playground-trail/elephant.png";
import fish from "@/assets/playground-trail/fish.png";
import bird from "@/assets/playground-trail/bird.png";
import sun from "@/assets/playground-trail/sun.png";
import starImg from "@/assets/playground-trail/star.png";
import cake from "@/assets/playground-trail/cake.png";
import balloon from "@/assets/playground-trail/balloon.png";
import trophy from "@/assets/playground-trail/trophy.png";
import kidBody from "@/assets/playground-trail/kid-body.png";
import faceHappy from "@/assets/playground-trail/face-happy.png";
import faceSad from "@/assets/playground-trail/face-sad.png";
import faceAngry from "@/assets/playground-trail/face-angry.png";
import pizza from "@/assets/playground-trail/pizza.png";
import broccoli from "@/assets/playground-trail/broccoli.png";
import iceCream from "@/assets/playground-trail/ice-cream.png";
import spider from "@/assets/playground-trail/spider.png";
import pig from "@/assets/playground-trail/pig.png";
import hat from "@/assets/playground-trail/hat.png";
import bus from "@/assets/playground-trail/bus.png";



// ---------- helpers ----------
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- types ----------
type StageKey =
  | "greetings"
  | "numbers"
  | "alphabet"
  | "cvc"
  | "colors"
  | "shapes"
  | "feelings"
  | "animals"
  | "body"
  | "actions"
  | "family"
  | "likes"
  | "memory"
  | "celebration";

type StageScore = Partial<Record<StageKey, { earned: number; max: number }>>;

const STAGE_ORDER: StageKey[] = [
  "greetings",
  "numbers",
  "alphabet",
  "cvc",
  "colors",
  "shapes",
  "feelings",
  "animals",
  "body",
  "actions",
  "family",
  "likes",
  "memory",
  "celebration",
];

const STAGE_LABEL: Record<StageKey, string> = {
  greetings: "Hello!",
  numbers: "Numbers",
  alphabet: "ABC",
  cvc: "Read it!",
  colors: "Colors",
  shapes: "Shapes",
  feelings: "Feelings",
  animals: "Animals",
  body: "My Body",
  actions: "Actions",
  family: "Family",
  likes: "I Like",
  memory: "Memory",
  celebration: "Yay!",
};


// ---------- difficulty levels (CEFR) ----------
type Difficulty = "pre-a1" | "a1" | "a2" | "b1" | "b2";

const LEVELS: Record<
  Difficulty,
  {
    cefr: string;
    label: string;
    short: string;
    emoji: string;
    tagline: string;
    blurb: string;
    stages: StageKey[];
  }
> = {
  "pre-a1": {
    cefr: "Pre-A1",
    label: "Tiny Seedling",
    short: "Seedling",
    emoji: "🌱",
    tagline: "True starter • first English words",
    blurb: "Lots of pictures, gentle pace, only the easiest activities.",
    stages: ["greetings", "numbers", "colors", "body", "celebration"],
  },
  a1: {
    cefr: "A1",
    label: "Happy Sprout",
    short: "Sprout",
    emoji: "🌼",
    tagline: "A1 • building first vocabulary",
    blurb: "Adds letters, animals and feelings. Still very friendly.",
    stages: [
      "greetings",
      "numbers",
      "alphabet",
      "colors",
      "feelings",
      "animals",
      "body",
      "celebration",
    ],
  },
  a2: {
    cefr: "A2",
    label: "Brave Explorer",
    short: "Explorer",
    emoji: "🚀",
    tagline: "A2 • the classic adventure",
    blurb: "Reading CVC words, shapes, actions and family.",
    stages: [
      "greetings",
      "numbers",
      "alphabet",
      "cvc",
      "colors",
      "shapes",
      "feelings",
      "animals",
      "body",
      "actions",
      "family",
      "celebration",
    ],
  },
  b1: {
    cefr: "B1",
    label: "Sky Voyager",
    short: "Voyager",
    emoji: "🦅",
    tagline: "B1 • trickier and faster",
    blurb: "Full vocabulary set plus 'I like / I don't like' opinions.",
    stages: [
      "greetings",
      "numbers",
      "alphabet",
      "cvc",
      "colors",
      "shapes",
      "feelings",
      "animals",
      "body",
      "actions",
      "family",
      "likes",
      "celebration",
    ],
  },
  b2: {
    cefr: "B2",
    label: "Star Champion",
    short: "Champion",
    emoji: "🏆",
    tagline: "B2 • for confident readers",
    blurb: "Every quest plus a memory challenge to push fast thinking.",
    stages: [
      "greetings",
      "numbers",
      "alphabet",
      "cvc",
      "colors",
      "shapes",
      "feelings",
      "animals",
      "body",
      "actions",
      "family",
      "likes",
      "memory",
      "celebration",
    ],
  },
};

const DIFFICULTY_ORDER: Difficulty[] = ["pre-a1", "a1", "a2", "b1", "b2"];

// Score → level mapping for the placement test (5 questions, ramping CEFR).
// 0 correct → pre-a1, 1 → a1, 2 → a2, 3 → b1, 4–5 → b2.
function placementToLevel(correct: number): Difficulty {
  return DIFFICULTY_ORDER[Math.min(correct, DIFFICULTY_ORDER.length - 1)];
}




// ---------- page ----------
type Phase = "intro" | "placement" | "result" | "lesson";

export function PlaygroundTrailLesson({
  roomId,
  role,
}: { roomId?: string; role?: "teacher" | "student" } = {}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [difficulty, setDifficulty] = useState<Difficulty>("a1");
  const [placementCorrect, setPlacementCorrect] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const [scores, setScores] = useState<StageScore>({});

  const { isFollower } = useTrailSync({
    roomId,
    role,
    hub: "playground",
    state: { phase, difficulty, stageIdx },
    onRemote: (s) => {
      if (s.phase && s.phase !== phase) setPhase(s.phase);
      if (s.difficulty && s.difficulty !== difficulty) setDifficulty(s.difficulty);
      if (typeof s.stageIdx === "number" && s.stageIdx !== stageIdx) setStageIdx(s.stageIdx);
    },
  });

  const stages = LEVELS[difficulty].stages;
  const safeIdx = Math.min(stageIdx, stages.length - 1);
  const stage = stages[safeIdx];

  const totalStars = useMemo(
    () => Object.values(scores).reduce((sum, s) => sum + (s?.earned ?? 0), 0),
    [scores],
  );

  const recordScore = (key: StageKey, earned: number, max: number) => {
    setScores((prev) => ({ ...prev, [key]: { earned, max } }));
  };

  const goNext = () => {
    if (isFollower) return;
    setStageIdx((i) => Math.min(i + 1, stages.length - 1));
  };
  const restart = () => {
    if (isFollower) return;
    setScores({});
    setStageIdx(0);
    setPhase("intro");
  };

  const changeDifficulty = (d: Difficulty) => {
    if (isFollower) return;
    setDifficulty(d);
    setStageIdx(0);
  };


  if (phase === "intro") {
    return (
      <IntroScreen
        onTakePlacement={() => setPhase("placement")}
        onSkip={(d) => {
          setDifficulty(d);
          setStageIdx(0);
          setScores({});
          setPhase("lesson");
        }}
      />
    );
  }

  if (phase === "placement") {
    return (
      <PlacementTest
        onDone={(correct) => {
          setPlacementCorrect(correct);
          setDifficulty(placementToLevel(correct));
          setPhase("result");
        }}
      />
    );
  }

  if (phase === "result") {
    return (
      <PlacementResult
        difficulty={difficulty}
        correct={placementCorrect}
        setDifficulty={setDifficulty}
        onStart={() => {
          setStageIdx(0);
          setScores({});
          setPhase("lesson");
        }}
      />
    );
  }


  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FEFBDD]">
      {/* mesh gradient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(at 20% 10%, rgba(254,106,47,0.35) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(254,251,221,0.9) 0px, transparent 50%), radial-gradient(at 80% 90%, rgba(254,106,47,0.25) 0px, transparent 50%), radial-gradient(at 10% 90%, rgba(255,221,120,0.6) 0px, transparent 50%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-6">
        {/* top bar */}
        <header className="mb-6 flex flex-wrap items-center gap-3 rounded-3xl border border-white/60 bg-white/50 px-5 py-3 shadow-lg backdrop-blur-xl">
          <LogoBubble size={84} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-[#FE6A2F]">
              Engleuphoria · Welcome Adventure
            </div>
            <ProgressDots
              current={safeIdx}
              total={stages.length}
              labels={stages.map((s) => STAGE_LABEL[s])}
            />
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-[#FE6A2F]/20 bg-white/70 px-2.5 py-1.5 shadow-sm">
            <span className="hidden text-[10px] font-extrabold uppercase tracking-wider text-[#FE6A2F]/80 sm:inline">
              👩‍🏫 Level
            </span>
            <LevelPills value={difficulty} onChange={changeDifficulty} />
          </div>
          <StarCounter count={totalStars} />
        </header>


        {/* stage */}
        <main className="flex flex-1 items-center justify-center">
          <div key={`${difficulty}-${stage}`} className="w-full animate-fade-in">
            {stage === "greetings" && (
              <StageGreetings onComplete={(e, m) => { recordScore("greetings", e, m); goNext(); }} />
            )}
            {stage === "numbers" && (
              <StageNumbers onComplete={(e, m) => { recordScore("numbers", e, m); goNext(); }} />
            )}
            {stage === "alphabet" && (
              <StageAlphabet onComplete={(e, m) => { recordScore("alphabet", e, m); goNext(); }} />
            )}
            {stage === "cvc" && (
              <StageCVC onComplete={(e, m) => { recordScore("cvc", e, m); goNext(); }} />
            )}
            {stage === "colors" && (
              <StageColors onComplete={(e, m) => { recordScore("colors", e, m); goNext(); }} />
            )}
            {stage === "shapes" && (
              <StageShapes onComplete={(e, m) => { recordScore("shapes", e, m); goNext(); }} />
            )}
            {stage === "feelings" && (
              <StageFeelings onComplete={(e, m) => { recordScore("feelings", e, m); goNext(); }} />
            )}
            {stage === "animals" && (
              <StageAnimals onComplete={(e, m) => { recordScore("animals", e, m); goNext(); }} />
            )}
            {stage === "body" && (
              <StageBody onComplete={(e, m) => { recordScore("body", e, m); goNext(); }} />
            )}
            {stage === "actions" && (
              <StageActions onComplete={(e, m) => { recordScore("actions", e, m); goNext(); }} />
            )}
            {stage === "family" && (
              <StageFamily onComplete={(e, m) => { recordScore("family", e, m); goNext(); }} />
            )}
            {stage === "likes" && (
              <StageLikes onComplete={(e, m) => { recordScore("likes", e, m); goNext(); }} />
            )}
            {stage === "memory" && (
              <StageMemory onComplete={(e, m) => { recordScore("memory", e, m); goNext(); }} />
            )}
            {stage === "celebration" && (
              <StageCelebration
                scores={scores}
                totalStars={totalStars}
                onRestart={restart}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ---------- Intro / Welcome Card ----------
function IntroScreen({
  onTakePlacement,
  onSkip,
}: {
  onTakePlacement: () => void;
  onSkip: (d: Difficulty) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [manual, setManual] = useState<Difficulty>("a1");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FEFBDD]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(at 15% 10%, rgba(254,106,47,0.45) 0px, transparent 55%), radial-gradient(at 85% 5%, rgba(255,221,120,0.8) 0px, transparent 55%), radial-gradient(at 80% 95%, rgba(254,106,47,0.35) 0px, transparent 55%), radial-gradient(at 10% 90%, rgba(254,251,221,0.9) 0px, transparent 55%)",
        }}
      />
      <main className="relative mx-auto grid min-h-screen max-w-4xl place-items-center px-4 py-8">
        <div className="w-full overflow-hidden rounded-[2.5rem] border-2 border-white/70 bg-white/80 shadow-[0_30px_80px_-30px_rgba(254,106,47,0.55)] backdrop-blur-xl">
          <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
            {/* hero panel */}
            <div
              className="relative overflow-hidden p-7 text-white sm:p-10"
              style={{
                background:
                  "linear-gradient(135deg, #FFB37A 0%, #FE6A2F 55%, #C84810 100%)",
              }}
            >
              <div className="mb-6 flex items-center gap-3">
                <LogoBubble size={84} />
                <span className="text-xs font-extrabold uppercase tracking-widest opacity-90">
                  Engleuphoria · Playground
                </span>
              </div>
              <h1 className="text-4xl font-black leading-tight sm:text-5xl">
                Hi superstar! ✨
              </h1>
              <p className="mt-4 text-base leading-relaxed opacity-95 sm:text-lg">
                I'm <strong>Buddy</strong>, your friend today. First we'll play
                5 quick questions to find your level — then we start a fun
                English adventure made just for you.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-white/25 px-3 py-1.5 backdrop-blur">
                  🧭 5-question placement
                </span>
                <span className="rounded-full bg-white/25 px-3 py-1.5 backdrop-blur">
                  🎯 Auto-pick your CEFR level
                </span>
                <span className="rounded-full bg-white/25 px-3 py-1.5 backdrop-blur">
                  🏆 Earn stars
                </span>
              </div>
            </div>

            {/* mascot panel */}
            <div className="relative grid place-items-center bg-[#FEFBDD] p-6">
              <img
                src={mascot}
                alt="Buddy, the Engleuphoria mascot"
                className="w-full max-w-xs drop-shadow-2xl"
                style={{ animation: "float 3s ease-in-out infinite" }}
                width={1024}
                height={1024}
              />
              <style>{`@keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }`}</style>
            </div>
          </div>

          {/* CEFR overview + CTAs */}
          <div className="border-t-2 border-[#FE6A2F]/15 bg-white/70 p-6 sm:p-8">
            <p className="mb-1 text-base font-black text-[#FE6A2F]">
              🧭 5 CEFR levels — we'll match the right one
            </p>
            <p className="mb-4 text-xs text-[#FE6A2F]/70">
              From true starter to confident reader. The placement test takes
              about 1 minute.
            </p>

            <div className="grid gap-2 sm:grid-cols-5">
              {DIFFICULTY_ORDER.map((d) => {
                const meta = LEVELS[d];
                return (
                  <div
                    key={d}
                    className="rounded-2xl border-2 border-[#FE6A2F]/20 bg-white p-3 text-center"
                  >
                    <div className="text-2xl" aria-hidden>
                      {meta.emoji}
                    </div>
                    <div className="mt-1 text-[10px] font-extrabold uppercase tracking-wide text-[#FE6A2F]/70">
                      {meta.cefr}
                    </div>
                    <div className="text-xs font-black text-[#FE6A2F]">
                      {meta.short}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <button
                onClick={() => setPickerOpen((v) => !v)}
                className="text-xs font-bold text-[#FE6A2F]/80 underline-offset-4 hover:underline"
              >
                {pickerOpen ? "Hide manual picker" : "Teacher: skip & pick level manually"}
              </button>
              <BigButton onClick={onTakePlacement}>
                Start placement test →
              </BigButton>
            </div>

            {pickerOpen && (
              <div className="mt-4 animate-fade-in rounded-2xl border-2 border-[#FE6A2F]/20 bg-white p-4">
                <p className="mb-2 text-xs font-bold text-[#FE6A2F]/80">
                  Pick a level and jump straight in:
                </p>
                <LevelPills value={manual} onChange={setManual} />
                <div className="mt-3 flex justify-end">
                  <BigButton variant="ghost" onClick={() => onSkip(manual)}>
                    Start at {LEVELS[manual].emoji} {LEVELS[manual].cefr} →
                  </BigButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ---------- Placement Test ----------
type PlacementQ = {
  cefr: string;
  prompt: string;
  hint?: string;
  options: { label: string; correct?: boolean }[];
};

const PLACEMENT_QUESTIONS: PlacementQ[] = [
  {
    cefr: "Pre-A1",
    prompt: "Which one is a cat? 🐾",
    options: [
      { label: "🐶 Dog" },
      { label: "🐱 Cat", correct: true },
      { label: "🐟 Fish" },
    ],
  },
  {
    cefr: "A1",
    prompt: "Which letter is B?",
    options: [
      { label: "D" },
      { label: "P" },
      { label: "B", correct: true },
    ],
  },
  {
    cefr: "A2",
    prompt: "I have ___ apple. 🍎",
    options: [
      { label: "a" },
      { label: "an", correct: true },
      { label: "the" },
    ],
  },
  {
    cefr: "B1",
    prompt: "She ___ to school every day.",
    options: [
      { label: "go" },
      { label: "going" },
      { label: "goes", correct: true },
    ],
  },
  {
    cefr: "B2",
    prompt: "If I ___ rich, I would travel the world.",
    options: [
      { label: "am" },
      { label: "was" },
      { label: "were", correct: true },
    ],
  },
];

function PlacementTest({ onDone }: { onDone: (correct: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const q = PLACEMENT_QUESTIONS[idx];

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const isRight = !!q.options[i].correct;
    const nextCorrect = correct + (isRight ? 1 : 0);
    setTimeout(() => {
      if (idx + 1 >= PLACEMENT_QUESTIONS.length) {
        onDone(nextCorrect);
      } else {
        setCorrect(nextCorrect);
        setIdx(idx + 1);
        setPicked(null);
      }
    }, 800);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FEFBDD]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(at 20% 10%, rgba(254,106,47,0.35) 0px, transparent 50%), radial-gradient(at 80% 90%, rgba(255,221,120,0.6) 0px, transparent 50%)",
        }}
      />
      <main className="relative mx-auto grid min-h-screen max-w-2xl place-items-center px-4 py-8">
        <GlassCard className="w-full">
          <div className="mb-4 flex items-center justify-between text-xs font-bold text-[#FE6A2F]/80">
            <span>🧭 Placement · Question {idx + 1} / {PLACEMENT_QUESTIONS.length}</span>
            <span className="rounded-full bg-[#FE6A2F]/15 px-2 py-1">{q.cefr}</span>
          </div>
          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-[#FE6A2F]/15">
            <div
              className="h-full bg-[#FE6A2F] transition-all"
              style={{ width: `${((idx + (picked !== null ? 1 : 0)) / PLACEMENT_QUESTIONS.length) * 100}%` }}
            />
          </div>
          <h2 className="mb-6 text-center text-2xl font-black text-[#FE6A2F] sm:text-3xl">
            {q.prompt}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {q.options.map((o, i) => {
              const isPicked = picked === i;
              const reveal = picked !== null;
              const right = !!o.correct;
              const klass = reveal
                ? right
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : isPicked
                    ? "border-rose-400 bg-rose-50 text-rose-600"
                    : "border-[#FE6A2F]/20 bg-white text-[#FE6A2F]/60"
                : "border-[#FE6A2F]/30 bg-white text-[#FE6A2F] hover:border-[#FE6A2F] hover:bg-[#FE6A2F]/5";
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={reveal}
                  className={`rounded-2xl border-2 p-5 text-lg font-extrabold shadow-sm transition-all active:scale-95 ${klass}`}
                >
                  {o.label}
                  {reveal && right && <span className="ml-2">✅</span>}
                  {reveal && isPicked && !right && <span className="ml-2">❌</span>}
                </button>
              );
            })}
          </div>
          <p className="mt-6 text-center text-xs text-[#FE6A2F]/60">
            Don't worry — there's no wrong answer. We just want to find your level!
          </p>
        </GlassCard>
      </main>
    </div>
  );
}

// ---------- Placement Result ----------
function PlacementResult({
  difficulty,
  correct,
  setDifficulty,
  onStart,
}: {
  difficulty: Difficulty;
  correct: number;
  setDifficulty: (d: Difficulty) => void;
  onStart: () => void;
}) {
  const level = LEVELS[difficulty];
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FEFBDD]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(at 20% 10%, rgba(254,106,47,0.4) 0px, transparent 55%), radial-gradient(at 80% 90%, rgba(255,221,120,0.7) 0px, transparent 55%)",
        }}
      />
      <main className="relative mx-auto grid min-h-screen max-w-2xl place-items-center px-4 py-8">
        <GlassCard className="w-full text-center">
          <div className="text-xs font-extrabold uppercase tracking-widest text-[#FE6A2F]/70">
            Placement complete
          </div>
          <div className="my-3 text-7xl" aria-hidden>{level.emoji}</div>
          <h2 className="text-3xl font-black text-[#FE6A2F] sm:text-4xl">
            You're at {level.cefr} — {level.label}!
          </h2>
          <p className="mt-2 text-sm font-bold text-[#FE6A2F]/80">
            {correct} / {PLACEMENT_QUESTIONS.length} correct · {level.tagline}
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm text-[#5b3a26]">
            {level.blurb}
          </p>

          <div className="mt-6">
            <p className="mb-2 text-xs font-bold text-[#FE6A2F]/70">
              Not quite right? Tap to change:
            </p>
            <LevelPills value={difficulty} onChange={setDifficulty} />
          </div>

          <div className="mt-8">
            <BigButton onClick={onStart}>
              Start my {LEVELS[difficulty].cefr} lesson →
            </BigButton>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}


function LevelPills({
  value,
  onChange,
}: {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full border border-[#FE6A2F]/30 bg-white/70 p-1">
      {DIFFICULTY_ORDER.map((d) => {
        const meta = LEVELS[d];
        const active = d === value;
        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            title={meta.label}
            className={`rounded-full px-3 py-1 text-xs font-extrabold transition-all ${
              active
                ? "bg-[#FE6A2F] text-white shadow"
                : "text-[#FE6A2F] hover:bg-[#FE6A2F]/10"
            }`}
          >
            {meta.emoji} {meta.short}
          </button>
        );
      })}
    </div>
  );
}

// ---------- shared UI ----------
export function LogoBubble({ size = 84 }: { size?: number }) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <style>{`@keyframes logo-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }`}</style>
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-white/40"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, #FFD0A8 0%, #FE6A2F 55%, #B5400C 100%)",
          boxShadow:
            "0 14px 28px -10px rgba(254,106,47,0.6), inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -8px 14px rgba(0,0,0,0.18)",
          animation: "logo-float 3s ease-in-out infinite",
        }}
      >
        {/* glossy highlight */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-[18%] top-[10%] h-[28%] w-[40%] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
        <img
          src={logo}
          alt="Engleuphoria logo"
          className="relative z-10 object-contain drop-shadow"
          style={{ width: size * 0.72, height: size * 0.72 }}
        />
      </div>
    </div>
  );
}




function ProgressDots({
  current,
  total,
  labels,
}: {
  current: number;
  total: number;
  labels?: string[];
}) {
  const label = labels ? labels[current] : STAGE_LABEL[STAGE_ORDER[current]];
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all ${
            i < current
              ? "w-3 bg-[#FE6A2F]"
              : i === current
                ? "w-6 bg-[#FE6A2F]"
                : "w-3 bg-[#FE6A2F]/25"
          }`}
        />
      ))}
      <span className="ml-2 text-xs font-medium text-[#FE6A2F]/80">{label}</span>
    </div>
  );
}

function StarCounter({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-[#FE6A2F] px-4 py-2 text-white shadow-lg">
      <img src={starImg} alt="" className="h-5 w-5" width={1024} height={1024} />
      <span className="text-lg font-extrabold tabular-nums">{count}</span>
    </div>
  );
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-2xl backdrop-blur-xl sm:p-10 ${className}`}
    >
      {children}
    </div>
  );
}

function BigButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
}) {
  const base =
    "rounded-full px-8 py-4 text-lg font-extrabold shadow-lg transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-[#FE6A2F] text-white hover:scale-105"
      : "bg-white/80 text-[#FE6A2F] border-2 border-[#FE6A2F]/30 hover:bg-white";
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

function StageHeader({
  title,
  subtitle,
  emoji,
}: {
  title: string;
  subtitle?: string;
  emoji?: string;
}) {
  return (
    <div className="mb-6 text-center">
      <h2 className="text-3xl font-black text-[#FE6A2F] sm:text-4xl">
        {emoji && <span className="mr-2">{emoji}</span>}
        {title}
      </h2>
      {subtitle && <p className="mt-1 text-base text-[#FE6A2F]/80">{subtitle}</p>}
    </div>
  );
}

// ---------- Stage 1: Greetings ----------
const GREETINGS = [
  { en: "Hello!", hint: "👋" },
  { en: "My name is...", hint: "🙋" },
  { en: "I am 6 years old.", hint: "✋☝️" },
  { en: "Nice to meet you!", hint: "😊" },
];

function StageGreetings({ onComplete }: { onComplete: (e: number, m: number) => void }) {
  const [revealed, setRevealed] = useState<boolean[]>(GREETINGS.map(() => false));
  const allRevealed = revealed.every(Boolean);

  const toggle = (i: number) => {
    setRevealed((r) => {
      const next = [...r];
      next[i] = true;
      return next;
    });
  };

  return (
    <GlassCard>
      <div className="mb-6 flex flex-col items-center text-center">
        <img
          src={mascot}
          alt="Foxy waving hello"
          className="h-32 w-32 animate-fade-in drop-shadow-xl"
          width={1024}
          height={1024}
        />
        <h1 className="mt-2 text-3xl font-black text-[#FE6A2F] sm:text-4xl">
          Hi! I'm Foxy 🦊
        </h1>
        <p className="mt-1 text-base text-[#FE6A2F]/80">Let's sing the Hello Song!</p>
      </div>

      <div className="mb-6 overflow-hidden rounded-3xl border-4 border-[#FE6A2F] bg-black shadow-xl">
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            className="absolute inset-0 h-full w-full"
            src="https://www.youtube-nocookie.com/embed/32ysrBC6B6k?rel=0&modestbranding=1"
            title="Hello Song"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      <p className="mb-3 text-center text-base font-semibold text-[#FE6A2F]/80">
        Now tap each card to learn the words!
      </p>


      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {GREETINGS.map((g, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={`flex items-center gap-3 rounded-3xl border-2 p-5 text-left transition-all active:scale-95 ${
              revealed[i]
                ? "border-[#FE6A2F] bg-white shadow-lg"
                : "border-[#FE6A2F]/30 bg-white/60 hover:bg-white"
            }`}
          >
            <span className="text-3xl">{g.hint}</span>
            <span className="text-xl font-extrabold text-[#FE6A2F]">{g.en}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <BigButton
          onClick={() => onComplete(allRevealed ? 4 : revealed.filter(Boolean).length, 4)}
        >
          Next ➡️
        </BigButton>
      </div>
    </GlassCard>
  );
}

// ---------- Stage 2: Numbers 1-10 ----------
const NUMBER_EMOJIS = ["🍎", "⚽", "⭐", "🎂", "🎈", "🐞", "🌸", "🍩", "🐠", "🚀"];
const NUMBER_WORDS = [
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
];

function StageNumbers({ onComplete }: { onComplete: (e: number, m: number) => void }) {
  const [tapped, setTapped] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);

  const tap = (n: number) => {
    if (tapped.includes(n)) return;
    const expected = tapped.length + 1;
    if (n === expected) {
      setTapped((t) => [...t, n]);
    } else {
      setWrong(n);
      setTimeout(() => setWrong(null), 500);
    }
  };

  const done = tapped.length === 10;

  return (
    <GlassCard>
      <StageHeader title="Numbers 1 to 10" subtitle="Tap them in order: 1 → 10" emoji="🔢" />

      <div className="grid grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
          const isTapped = tapped.includes(n);
          const isWrong = wrong === n;
          const emoji = NUMBER_EMOJIS[n - 1];
          return (
            <button
              key={n}
              onClick={() => tap(n)}
              className={`flex aspect-[3/4] flex-col items-center justify-between rounded-3xl border-4 bg-white p-2 shadow-md transition-all active:scale-95 ${
                isTapped
                  ? "border-[#FE6A2F] bg-[#FEFBDD]"
                  : isWrong
                    ? "animate-pulse border-red-400"
                    : "border-[#FE6A2F]/20 hover:border-[#FE6A2F]/60"
              }`}
            >
              <div className="text-3xl font-black text-[#FE6A2F] sm:text-4xl">{n}</div>
              <div className="flex flex-1 flex-wrap items-center justify-center gap-0.5 text-lg leading-none">
                {Array.from({ length: n }).map((_, i) => (
                  <span key={i}>{emoji}</span>
                ))}
              </div>
              <div className="text-[10px] font-bold text-[#FE6A2F] sm:text-xs">
                {NUMBER_WORDS[n - 1]}
              </div>
            </button>
          );
        })}
      </div>


      <div className="mt-8 flex justify-center">
        <BigButton onClick={() => onComplete(tapped.length, 10)} disabled={!done && tapped.length === 0}>
          {done ? "Next ➡️" : "Next ➡️"}
        </BigButton>
      </div>
    </GlassCard>
  );
}

// ---------- Stage 3: Alphabet A-Z ----------
type AlphaItem = { letter: string; word: string; img?: string; emoji?: string };
const ALPHABET: AlphaItem[] = [
  { letter: "A", word: "Apple", img: apple },
  { letter: "B", word: "Ball", img: ball },
  { letter: "C", word: "Cat", img: cat },
  { letter: "D", word: "Dog", img: dog },
  { letter: "E", word: "Elephant", img: elephant },
  { letter: "F", word: "Fish", img: fish },
  { letter: "G", word: "Goat", emoji: "🐐" },
  { letter: "H", word: "Hat", img: hat },
  { letter: "I", word: "Ice cream", img: iceCream },
  { letter: "J", word: "Juice", emoji: "🧃" },
  { letter: "K", word: "Kite", emoji: "🪁" },
  { letter: "L", word: "Lion", emoji: "🦁" },
  { letter: "M", word: "Moon", emoji: "🌙" },
  { letter: "N", word: "Nest", emoji: "🪺" },
  { letter: "O", word: "Orange", emoji: "🍊" },
  { letter: "P", word: "Pig", img: pig },
  { letter: "Q", word: "Queen", emoji: "👑" },
  { letter: "R", word: "Rabbit", emoji: "🐰" },
  { letter: "S", word: "Sun", img: sun },
  { letter: "T", word: "Tree", emoji: "🌳" },
  { letter: "U", word: "Umbrella", emoji: "☂️" },
  { letter: "V", word: "Van", emoji: "🚐" },
  { letter: "W", word: "Whale", emoji: "🐳" },
  { letter: "X", word: "Xylophone", emoji: "🎹" },
  { letter: "Y", word: "Yo-yo", emoji: "🪀" },
  { letter: "Z", word: "Zebra", emoji: "🦓" },
];

function StageAlphabet({ onComplete }: { onComplete: (e: number, m: number) => void }) {
  const [tapped, setTapped] = useState<Set<number>>(new Set());

  return (
    <GlassCard>
      <StageHeader title="Letters A – Z" subtitle="Tap each letter to learn the word!" emoji="🔤" />

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
        {ALPHABET.map((item, i) => {
          const isTapped = tapped.has(i);
          return (
            <button
              key={i}
              onClick={() => setTapped((s) => new Set(s).add(i))}
              className={`group flex flex-col items-center rounded-2xl border-2 bg-white p-2 shadow-md transition-all active:scale-95 ${
                isTapped
                  ? "border-[#FE6A2F]"
                  : "border-[#FE6A2F]/20 hover:border-[#FE6A2F]/60"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FE6A2F] text-xl font-black text-white shadow-md sm:h-12 sm:w-12 sm:text-2xl">
                {item.letter}
              </div>
              {item.img ? (
                <img
                  src={item.img}
                  alt={item.word}
                  loading="lazy"
                  className="my-1 h-12 w-12 object-contain transition-transform group-hover:scale-110 sm:h-16 sm:w-16"
                  width={1024}
                  height={1024}
                />
              ) : (
                <div className="my-1 flex h-12 w-12 items-center justify-center text-3xl sm:h-16 sm:w-16 sm:text-4xl">
                  {item.emoji}
                </div>
              )}
              <div className="text-[11px] font-extrabold text-[#FE6A2F] sm:text-sm">
                {item.word}
              </div>
              {isTapped && (
                <img
                  src={starImg}
                  alt=""
                  className="mt-0.5 h-3 w-3 animate-scale-in sm:h-4 sm:w-4"
                  width={1024}
                  height={1024}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <BigButton onClick={() => onComplete(tapped.size, ALPHABET.length)}>Next ➡️</BigButton>
      </div>
    </GlassCard>
  );
}


// ---------- Stage 4: Colors ----------
const COLOR_ROUNDS = [
  { target: "red", swatches: ["red", "blue", "yellow", "green"] },
  { target: "blue", swatches: ["yellow", "blue", "green", "red"] },
  { target: "yellow", swatches: ["green", "red", "yellow", "blue"] },
  { target: "green", swatches: ["blue", "green", "red", "yellow"] },
];

const COLOR_HEX: Record<string, string> = {
  red: "#EF4444",
  blue: "#3B82F6",
  yellow: "#FACC15",
  green: "#22C55E",
};

// ---------- Stage 3b: CVC words ----------
const CVC_WORDS: { word: string; img: string }[] = [
  { word: "cat", img: cat },
  { word: "dog", img: dog },
  { word: "sun", img: sun },
  { word: "pig", img: pig },
  { word: "hat", img: hat },
  { word: "bus", img: bus },
];

function StageCVC({ onComplete }: { onComplete: (e: number, m: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const item = CVC_WORDS[idx];

  const next = (gotStar: boolean) => {
    const newStars = stars + (gotStar ? 1 : 0);
    setStars(newStars);
    setRevealed(false);
    if (idx + 1 < CVC_WORDS.length) {
      setIdx(idx + 1);
    } else {
      onComplete(newStars, CVC_WORDS.length);
    }
  };

  const letters = item.word.split("");
  const colors = ["#FE6A2F", "#3B82F6", "#22C55E"];

  return (
    <GlassCard>
      <StageHeader
        title="Can you read it?"
        subtitle="Sound out each letter, then say the word"
        emoji="📖"
      />

      <div className="mx-auto flex max-w-md flex-col items-center gap-5">
        <div className="flex items-center gap-2 rounded-3xl border-4 border-[#FE6A2F]/40 bg-white px-8 py-6 shadow-xl">
          {letters.map((l, i) => (
            <span
              key={i}
              className="text-7xl font-black sm:text-8xl"
              style={{ color: colors[i % colors.length] }}
            >
              {l}
            </span>
          ))}
        </div>

        {revealed ? (
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <img
              src={item.img}
              alt={item.word}
              className="h-40 w-40 object-contain drop-shadow-xl"
              width={768}
              height={768}
              loading="lazy"
            />
            <div className="rounded-full bg-[#22C55E] px-6 py-2 text-lg font-extrabold text-white shadow-lg">
              ⭐ Great reading!
            </div>
            <BigButton onClick={() => next(true)}>Next ➡️</BigButton>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setRevealed(true)}
              className="rounded-full bg-[#22C55E] px-6 py-3 text-lg font-extrabold text-white shadow-xl transition-all hover:brightness-110 active:scale-95"
            >
              I read it! ⭐
            </button>
            <button
              onClick={() => next(false)}
              className="rounded-full border-2 border-[#FE6A2F]/40 bg-white/70 px-5 py-3 text-base font-bold text-[#FE6A2F] shadow-sm transition-all hover:bg-white active:scale-95"
            >
              Skip ⏭️
            </button>
          </div>
        )}

        <div className="mt-2 flex items-center gap-2 text-[#FE6A2F]">
          <span className="font-bold">
            Word {idx + 1} / {CVC_WORDS.length}
          </span>
          <span>•</span>
          <span className="font-bold">⭐ {stars}</span>
        </div>
      </div>
    </GlassCard>
  );
}



function StageColors({ onComplete }: { onComplete: (e: number, m: number) => void }) {
  const [round, setRound] = useState(0);
  const [stars, setStars] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [correct, setCorrect] = useState<string | null>(null);
  const r = COLOR_ROUNDS[round];

  useEffect(() => {
    setWrong(null);
    setCorrect(null);
  }, [round]);

  const pick = (c: string) => {
    if (correct) return;
    if (c === r.target) {
      setCorrect(c);
      setStars((s) => s + 1);
      setTimeout(() => {
        if (round + 1 < COLOR_ROUNDS.length) setRound((n) => n + 1);
        else onComplete(stars + 1, COLOR_ROUNDS.length);
      }, 800);
    } else {
      setWrong(c);
      setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <GlassCard>
      <StageHeader title="Find the Color" emoji="🎨" />
      <p className="mb-6 text-center text-xl text-[#FE6A2F]/80">
        Tap the{" "}
        <span
          className="inline-block rounded-full px-3 py-1 text-white"
          style={{ backgroundColor: COLOR_HEX[r.target] }}
        >
          {r.target.toUpperCase()}
        </span>{" "}
        one!
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {r.swatches.map((c) => (
          <button
            key={c}
            onClick={() => pick(c)}
            className={`aspect-square rounded-3xl border-4 shadow-xl transition-all active:scale-95 ${
              correct === c
                ? "scale-110 border-white ring-4 ring-[#FE6A2F]"
                : wrong === c
                  ? "animate-pulse border-red-300"
                  : "border-white/80 hover:scale-105"
            }`}
            style={{ backgroundColor: COLOR_HEX[c] }}
            aria-label={c}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-[#FE6A2F]">
        <span className="font-bold">
          Round {round + 1} / {COLOR_ROUNDS.length}
        </span>
        <span>•</span>
        <span className="font-bold">⭐ {stars}</span>
      </div>
    </GlassCard>
  );
}

// ---------- Stage 5: Feelings ----------
const FEELINGS = [
  { id: "happy", label: "Happy", img: faceHappy, emoji: "😄" },
  { id: "sad", label: "Sad", img: faceSad, emoji: "😢" },
  { id: "angry", label: "Angry", img: faceAngry, emoji: "😠" },
];

function StageFeelings({ onComplete }: { onComplete: (e: number, m: number) => void }) {
  const [rounds] = useState(() => shuffle(FEELINGS).concat(shuffle(FEELINGS)).slice(0, 3));
  const [idx, setIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const target = rounds[idx];

  useEffect(() => {
    setPicked(null);
    setWrong(null);
  }, [idx]);

  const pick = (id: string) => {
    if (picked) return;
    if (id === target.id) {
      setPicked(id);
      setStars((s) => s + 1);
      setTimeout(() => {
        if (idx + 1 < rounds.length) setIdx((n) => n + 1);
        else onComplete(stars + 1, rounds.length);
      }, 800);
    } else {
      setWrong(id);
      setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <GlassCard>
      <StageHeader title="How do they feel?" emoji="💛" />
      <p className="mb-6 text-center text-xl text-[#FE6A2F]/80">
        Show me{" "}
        <span className="inline-block rounded-full bg-[#FE6A2F] px-4 py-1 text-white">
          {target.label.toUpperCase()} {target.emoji}
        </span>
      </p>

      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        {FEELINGS.map((f) => (
          <button
            key={f.id}
            onClick={() => pick(f.id)}
            className={`flex flex-col items-center rounded-3xl border-4 bg-white p-3 shadow-lg transition-all active:scale-95 ${
              picked === f.id
                ? "scale-110 border-[#FE6A2F] ring-4 ring-[#FE6A2F]/30"
                : wrong === f.id
                  ? "animate-pulse border-red-300"
                  : "border-[#FE6A2F]/20 hover:scale-105 hover:border-[#FE6A2F]/60"
            }`}
          >
            <img
              src={f.img}
              alt={f.label}
              loading="lazy"
              className="h-28 w-28 object-contain sm:h-36 sm:w-36"
              width={1024}
              height={1024}
            />
            <span className="mt-1 text-lg font-extrabold text-[#FE6A2F]">{f.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-[#FE6A2F]">
        <span className="font-bold">
          Round {idx + 1} / {rounds.length}
        </span>
        <span>•</span>
        <span className="font-bold">⭐ {stars}</span>
      </div>
    </GlassCard>
  );
}

// ---------- Stage 6: Animals drag & drop ----------
const ANIMALS = [
  { word: "Cat", img: cat },
  { word: "Dog", img: dog },
  { word: "Bird", img: bird },
  { word: "Fish", img: fish },
];

function StageAnimals({ onComplete }: { onComplete: (e: number, m: number) => void }) {
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [dragged, setDragged] = useState<string | null>(null);
  const [shakeWord, setShakeWord] = useState<string | null>(null);
  const [wordOrder] = useState(() => shuffle(ANIMALS.map((a) => a.word)));
  const [picOrder] = useState(() => shuffle(ANIMALS));

  useEffect(() => {
    if (matched.size === ANIMALS.length) {
      const t = setTimeout(() => onComplete(ANIMALS.length, ANIMALS.length), 1000);
      return () => clearTimeout(t);
    }
  }, [matched, onComplete]);

  const onDrop = (target: string) => {
    if (!dragged) return;
    if (dragged === target) {
      setMatched((m) => new Set(m).add(target));
    } else {
      setShakeWord(dragged);
      setTimeout(() => setShakeWord(null), 500);
    }
    setDragged(null);
  };

  return (
    <GlassCard>
      <StageHeader title="Match the Animals" subtitle="Drag the word onto the picture." emoji="🐾" />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {picOrder.map((a) => {
          const isMatched = matched.has(a.word);
          return (
            <div
              key={a.word}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(a.word)}
              className={`flex aspect-square flex-col items-center justify-center rounded-3xl border-4 border-dashed bg-white/80 p-2 transition-all ${
                isMatched
                  ? "border-[#FE6A2F] bg-[#FEFBDD]"
                  : "border-[#FE6A2F]/40 hover:border-[#FE6A2F]"
              }`}
            >
              <img
                src={a.img}
                alt={a.word}
                loading="lazy"
                className="h-20 w-20 object-contain sm:h-24 sm:w-24"
                width={1024}
                height={1024}
              />
              {isMatched && (
                <span className="mt-1 rounded-full bg-[#FE6A2F] px-3 py-0.5 text-sm font-bold text-white">
                  {a.word} ✓
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {wordOrder.map((w) => {
          const done = matched.has(w);
          return (
            <div
              key={w}
              draggable={!done}
              onDragStart={() => setDragged(w)}
              onClick={() => {
                if (done) return;
                const next = ANIMALS.find((a) => !matched.has(a.word));
                if (!next) return;
                setDragged(w);
                setTimeout(() => onDrop(next.word), 50);
              }}
              className={`cursor-grab select-none rounded-full border-2 px-6 py-3 text-lg font-extrabold shadow-md transition-all active:cursor-grabbing ${
                done
                  ? "border-[#FE6A2F]/20 bg-[#FE6A2F]/10 text-[#FE6A2F]/40 line-through"
                  : "border-[#FE6A2F] bg-white text-[#FE6A2F] hover:scale-105"
              } ${shakeWord === w ? "animate-pulse" : ""}`}
            >
              {w}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <BigButton variant="ghost" onClick={() => onComplete(matched.size, ANIMALS.length)}>
          Skip ➡️
        </BigButton>
      </div>
    </GlassCard>
  );
}

// ---------- Stage 7: Body parts ----------
type BodyPart = {
  id: string;
  label: string;
  emoji: string;
  // percentages relative to the image box
  top: number;
  left: number;
  width: number;
  height: number;
};

const BODY_PARTS: BodyPart[] = [
  { id: "head", label: "Head", emoji: "🧠", top: 6, left: 28, width: 44, height: 20 },
  { id: "hands", label: "Hands", emoji: "🖐️", top: 50, left: 14, width: 72, height: 18 },
  { id: "mouth", label: "Mouth", emoji: "👄", top: 38, left: 38, width: 24, height: 7 },
  { id: "eyes", label: "Eyes", emoji: "👀", top: 24, left: 30, width: 40, height: 7 },
  { id: "nose", label: "Nose", emoji: "👃", top: 30, left: 42, width: 16, height: 9 },
];


function StageBody({ onComplete }: { onComplete: (e: number, m: number) => void }) {
  const [rounds] = useState(() => shuffle(BODY_PARTS));
  const [idx, setIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [sparkle, setSparkle] = useState(false);
  const [wrong, setWrong] = useState(false);
  const target = rounds[idx];

  const tap = (id: string) => {
    if (sparkle) return;
    if (id === target.id) {
      setSparkle(true);
      setStars((s) => s + 1);
      setTimeout(() => {
        setSparkle(false);
        if (idx + 1 < rounds.length) setIdx((n) => n + 1);
        else onComplete(stars + 1, rounds.length);
      }, 800);
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 500);
    }
  };

  return (
    <GlassCard>
      <StageHeader title="Tap my Body!" emoji="🧍" />

      <div className="mx-auto flex max-w-md flex-col items-center">
        <div
          className={`relative aspect-square w-full overflow-hidden rounded-3xl bg-[#FEFBDD] shadow-inner ${
            wrong ? "animate-pulse ring-4 ring-red-300" : ""
          }`}
        >
          <img
            src={kidBody}
            alt="A cartoon kid"
            className="absolute inset-0 h-full w-full object-contain"
            width={1024}
            height={1024}
          />
          {BODY_PARTS.map((p) => (
            <button
              key={p.id}
              onClick={() => tap(p.id)}
              aria-label={p.label}
              className={`absolute rounded-full transition-all ${
                sparkle && p.id === target.id
                  ? "bg-[#FE6A2F]/30 ring-4 ring-[#FE6A2F]"
                  : "hover:bg-[#FE6A2F]/10"
              }`}
              style={{
                top: `${p.top}%`,
                left: `${p.left}%`,
                width: `${p.width}%`,
                height: `${p.height}%`,
              }}
            />
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-full bg-[#FE6A2F] px-6 py-3 text-white shadow-xl">
          <span className="text-2xl">{target.emoji}</span>
          <span className="text-xl font-extrabold">Tap the {target.label.toUpperCase()}</span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[#FE6A2F]">
          <span className="font-bold">
            Round {idx + 1} / {rounds.length}
          </span>
          <span>•</span>
          <span className="font-bold">⭐ {stars}</span>
        </div>

        <button
          onClick={() => {
            if (sparkle) return;
            if (idx + 1 < rounds.length) setIdx((n) => n + 1);
            else onComplete(stars, rounds.length);
          }}
          className="mt-4 rounded-full border-2 border-[#FE6A2F]/40 bg-white/70 px-5 py-2 text-sm font-bold text-[#FE6A2F] shadow-sm transition-all hover:bg-white active:scale-95"
        >
          Skip ⏭️
        </button>
      </div>

    </GlassCard>
  );
}

// ---------- Stage 8: I like / I don't like ----------
const LIKE_ITEMS = [
  { word: "pizza", img: pizza },
  { word: "broccoli", img: broccoli },
  { word: "ice cream", img: iceCream },
  { word: "spiders", img: spider },
];

function StageLikes({ onComplete }: { onComplete: (e: number, m: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [sentence, setSentence] = useState<string | null>(null);
  const item = LIKE_ITEMS[idx];

  const choose = (likes: boolean) => {
    if (sentence) return;
    const s = likes ? `I like ${item.word}.` : `I don't like ${item.word}.`;
    setSentence(s);
    setStars((n) => n + 1);
    setTimeout(() => {
      setSentence(null);
      if (idx + 1 < LIKE_ITEMS.length) setIdx((n) => n + 1);
      else onComplete(stars + 1, LIKE_ITEMS.length);
    }, 1500);
  };

  return (
    <GlassCard>
      <StageHeader
        title="I like / I don't like"
        subtitle="Say it in a full sentence!"
        emoji="💬"
      />

      <div className="mx-auto flex max-w-md flex-col items-center">
        {/* mascot + speech bubble */}
        <div className="relative flex w-full justify-center">
          <div
            className={`absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full rounded-3xl border-2 border-[#FE6A2F]/40 bg-white px-5 py-3 text-xl font-extrabold text-[#FE6A2F] shadow-lg transition-all ${
              sentence ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
          >
            {sentence ?? "…"}
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-2xl">▼</span>
          </div>
          <img
            src={mascot}
            alt="Foxy"
            className="h-24 w-24 drop-shadow-lg"
            width={1024}
            height={1024}
          />
        </div>

        {/* item card */}
        <div className="mt-6 flex flex-col items-center rounded-3xl border-4 border-[#FE6A2F]/30 bg-white p-5 shadow-lg">
          <img
            src={item.img}
            alt={item.word}
            loading="lazy"
            className="h-40 w-40 object-contain sm:h-48 sm:w-48"
            width={1024}
            height={1024}
          />
          <div className="mt-2 text-2xl font-extrabold capitalize text-[#FE6A2F]">
            {item.word}
          </div>
        </div>

        {/* sentence buttons */}
        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
          <button
            onClick={() => choose(true)}
            disabled={!!sentence}
            className="flex-1 rounded-full bg-green-500 px-6 py-4 text-xl font-extrabold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            👍 I like it
          </button>
          <button
            onClick={() => choose(false)}
            disabled={!!sentence}
            className="flex-1 rounded-full bg-red-400 px-6 py-4 text-xl font-extrabold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            👎 I don't like it
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[#FE6A2F]">
          <span className="font-bold">
            {idx + 1} / {LIKE_ITEMS.length}
          </span>
          <span>•</span>
          <span className="font-bold">⭐ {stars}</span>
        </div>
      </div>
    </GlassCard>
  );
}

// ---------- Stage 9: Memory pairs ----------
const MEMORY_ITEMS = [
  { id: "sun", img: sun, label: "Sun" },
  { id: "star", img: starImg, label: "Star" },
  { id: "cake", img: cake, label: "Cake" },
  { id: "balloon", img: balloon, label: "Balloon" },
];

type MemCard = { uid: number; id: string; img: string; label: string };

function StageMemory({ onComplete }: { onComplete: (e: number, m: number) => void }) {
  const [cards] = useState<MemCard[]>(() =>
    shuffle(
      MEMORY_ITEMS.flatMap((it, i) => [
        { uid: i * 2, id: it.id, img: it.img, label: it.label },
        { uid: i * 2 + 1, id: it.id, img: it.img, label: it.label },
      ]),
    ),
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const lock = useRef(false);

  useEffect(() => {
    if (matched.size === MEMORY_ITEMS.length) {
      const earned = Math.max(2, 6 - Math.max(0, moves - MEMORY_ITEMS.length));
      const t = setTimeout(() => onComplete(Math.min(earned, 6), 6), 1200);
      return () => clearTimeout(t);
    }
  }, [matched, moves, onComplete]);

  const flip = (uid: number) => {
    if (lock.current) return;
    if (flipped.includes(uid)) return;
    const card = cards.find((c) => c.uid === uid)!;
    if (matched.has(card.id)) return;

    const next = [...flipped, uid];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((u) => cards.find((c) => c.uid === u)!);
      if (a.id === b.id) {
        setMatched((m) => new Set(m).add(a.id));
        setTimeout(() => setFlipped([]), 600);
      } else {
        lock.current = true;
        setTimeout(() => {
          setFlipped([]);
          lock.current = false;
        }, 900);
      }
    }
  };

  return (
    <GlassCard>
      <StageHeader
        title="Memory Match"
        subtitle={`Find all 4 pairs! Moves: ${moves}`}
        emoji="🧠"
      />

      <div className="mx-auto grid max-w-xl grid-cols-4 gap-3">
        {cards.map((c) => {
          const isOpen = flipped.includes(c.uid) || matched.has(c.id);
          return (
            <button
              key={c.uid}
              onClick={() => flip(c.uid)}
              className="aspect-square [perspective:600px]"
              aria-label={isOpen ? c.label : "Hidden card"}
            >
              <div
                className={`relative h-full w-full rounded-2xl shadow-lg transition-transform duration-500 [transform-style:preserve-3d] ${
                  isOpen ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl border-4 border-white bg-[#FE6A2F] text-3xl text-white [backface-visibility:hidden]">
                  ?
                </div>
                <div
                  className={`absolute inset-0 flex items-center justify-center rounded-2xl border-4 bg-white p-2 [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    matched.has(c.id) ? "border-[#FE6A2F]" : "border-[#FEFBDD]"
                  }`}
                >
                  <img
                    src={c.img}
                    alt={c.label}
                    loading="lazy"
                    className="h-full w-full object-contain"
                    width={1024}
                    height={1024}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <BigButton variant="ghost" onClick={() => onComplete(matched.size, 6)}>
          Skip ➡️
        </BigButton>
      </div>
    </GlassCard>
  );
}

// ---------- Stage: Shapes ----------
const SHAPES = [
  { id: "circle", label: "Circle", svg: <circle cx="50" cy="50" r="40" /> },
  {
    id: "square",
    label: "Square",
    svg: <rect x="12" y="12" width="76" height="76" rx="6" />,
  },
  {
    id: "triangle",
    label: "Triangle",
    svg: <polygon points="50,10 92,88 8,88" />,
  },
  {
    id: "star",
    label: "Star",
    svg: (
      <polygon points="50,8 61,38 93,38 67,57 77,88 50,69 23,88 33,57 7,38 39,38" />
    ),
  },
  {
    id: "heart",
    label: "Heart",
    svg: (
      <path d="M50 86 L14 50 a20 20 0 0 1 36 -18 a20 20 0 0 1 36 18 Z" />
    ),
  },
];
const SHAPE_COLORS = ["#FE6A2F", "#3B82F6", "#22C55E", "#FACC15", "#EF4444"];

function StageShapes({ onComplete }: { onComplete: (e: number, m: number) => void }) {
  const [rounds] = useState(() => shuffle(SHAPES));
  const [idx, setIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const target = rounds[idx];

  useEffect(() => {
    setPicked(null);
    setWrong(null);
  }, [idx]);

  const pick = (id: string) => {
    if (picked) return;
    if (id === target.id) {
      setPicked(id);
      setStars((s) => s + 1);
      setTimeout(() => {
        if (idx + 1 < rounds.length) setIdx((n) => n + 1);
        else onComplete(stars + 1, rounds.length);
      }, 700);
    } else {
      setWrong(id);
      setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <GlassCard>
      <StageHeader title="Find the Shape" emoji="🔺" />
      <p className="mb-6 text-center text-xl text-[#FE6A2F]/80">
        Tap the{" "}
        <span className="inline-block rounded-full bg-[#FE6A2F] px-4 py-1 text-white">
          {target.label.toUpperCase()}
        </span>
      </p>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
        {SHAPES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => pick(s.id)}
            className={`aspect-square rounded-3xl border-4 bg-white p-3 shadow-lg transition-all active:scale-95 ${
              picked === s.id
                ? "scale-110 border-[#FE6A2F] ring-4 ring-[#FE6A2F]/30"
                : wrong === s.id
                  ? "animate-pulse border-red-300"
                  : "border-[#FE6A2F]/20 hover:scale-105 hover:border-[#FE6A2F]/60"
            }`}
            aria-label={s.label}
          >
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full"
              fill={SHAPE_COLORS[i % SHAPE_COLORS.length]}
            >
              {s.svg}
            </svg>
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-[#FE6A2F]">
        <span className="font-bold">
          Round {idx + 1} / {rounds.length}
        </span>
        <span>•</span>
        <span className="font-bold">⭐ {stars}</span>
      </div>
    </GlassCard>
  );
}

// ---------- Stage: Actions ----------
const ACTIONS = [
  { id: "jump", label: "Jump", emoji: "🤾" },
  { id: "run", label: "Run", emoji: "🏃" },
  { id: "clap", label: "Clap", emoji: "👏" },
  { id: "dance", label: "Dance", emoji: "💃" },
  { id: "sleep", label: "Sleep", emoji: "😴" },
  { id: "eat", label: "Eat", emoji: "🍽️" },
];

function StageActions({ onComplete }: { onComplete: (e: number, m: number) => void }) {
  const [rounds] = useState(() => shuffle(ACTIONS).slice(0, 5));
  const [idx, setIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const target = rounds[idx];

  useEffect(() => {
    setPicked(null);
    setWrong(null);
  }, [idx]);

  const pick = (id: string) => {
    if (picked) return;
    if (id === target.id) {
      setPicked(id);
      setStars((s) => s + 1);
      setTimeout(() => {
        if (idx + 1 < rounds.length) setIdx((n) => n + 1);
        else onComplete(stars + 1, rounds.length);
      }, 700);
    } else {
      setWrong(id);
      setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <GlassCard>
      <StageHeader title="Action Words" subtitle="Can you do the action too?" emoji="🤸" />
      <p className="mb-6 text-center text-xl text-[#FE6A2F]/80">
        Tap{" "}
        <span className="inline-block rounded-full bg-[#FE6A2F] px-4 py-1 text-white">
          {target.label.toUpperCase()}
        </span>
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => pick(a.id)}
            className={`flex flex-col items-center rounded-3xl border-4 bg-white p-4 shadow-lg transition-all active:scale-95 ${
              picked === a.id
                ? "scale-105 border-[#FE6A2F] ring-4 ring-[#FE6A2F]/30"
                : wrong === a.id
                  ? "animate-pulse border-red-300"
                  : "border-[#FE6A2F]/20 hover:scale-105 hover:border-[#FE6A2F]/60"
            }`}
          >
            <span className="text-6xl">{a.emoji}</span>
            <span className="mt-2 text-lg font-extrabold text-[#FE6A2F]">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-[#FE6A2F]">
        <span className="font-bold">
          Round {idx + 1} / {rounds.length}
        </span>
        <span>•</span>
        <span className="font-bold">⭐ {stars}</span>
      </div>
    </GlassCard>
  );
}

// ---------- Stage: Family ----------
const FAMILY = [
  { id: "mom", label: "Mom", emoji: "👩" },
  { id: "dad", label: "Dad", emoji: "👨" },
  { id: "brother", label: "Brother", emoji: "👦" },
  { id: "sister", label: "Sister", emoji: "👧" },
  { id: "baby", label: "Baby", emoji: "👶" },
  { id: "grandma", label: "Grandma", emoji: "👵" },
  { id: "grandpa", label: "Grandpa", emoji: "👴" },
];

function StageFamily({ onComplete }: { onComplete: (e: number, m: number) => void }) {
  const [tapped, setTapped] = useState<Set<string>>(new Set());

  return (
    <GlassCard>
      <StageHeader title="My Family" subtitle="Tap each one to learn the word!" emoji="👨‍👩‍👧‍👦" />

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {FAMILY.map((f) => {
          const isTapped = tapped.has(f.id);
          return (
            <button
              key={f.id}
              onClick={() => setTapped((s) => new Set(s).add(f.id))}
              className={`flex flex-col items-center rounded-3xl border-2 bg-white p-3 shadow-md transition-all active:scale-95 ${
                isTapped
                  ? "border-[#FE6A2F] bg-[#FEFBDD]"
                  : "border-[#FE6A2F]/20 hover:border-[#FE6A2F]/60"
              }`}
            >
              <span className="text-5xl sm:text-6xl">{f.emoji}</span>
              <span className="mt-1 text-base font-extrabold text-[#FE6A2F]">{f.label}</span>
              {isTapped && (
                <img
                  src={starImg}
                  alt=""
                  className="mt-1 h-4 w-4 animate-scale-in"
                  width={1024}
                  height={1024}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <BigButton onClick={() => onComplete(tapped.size, FAMILY.length)}>Next ➡️</BigButton>
      </div>
    </GlassCard>
  );
}

// ---------- Stage 10: Celebration ----------

function StageCelebration({
  scores,
  totalStars,
  onRestart,
}: {
  scores: StageScore;
  totalStars: number;
  onRestart: () => void;
}) {
  const [showSummary, setShowSummary] = useState(false);

  const breakdown: { key: StageKey; label: string }[] = [
    { key: "greetings", label: "Greetings" },
    { key: "numbers", label: "Numbers 1–10" },
    { key: "alphabet", label: "Letters A–Z" },
    { key: "cvc", label: "CVC Reading" },
    { key: "colors", label: "Colors" },
    { key: "shapes", label: "Shapes" },
    { key: "feelings", label: "Feelings" },
    { key: "animals", label: "Animals" },
    { key: "body", label: "Body Parts" },
    { key: "actions", label: "Action Words" },
    { key: "family", label: "Family" },
    { key: "likes", label: "I like / don't like" },
    { key: "memory", label: "Memory" },
  ];

  const strongest = [...breakdown]
    .map((b) => {
      const s = scores[b.key];
      const pct = s ? s.earned / s.max : 0;
      return { ...b, pct, s };
    })
    .filter((b) => b.s)
    .sort((a, b) => b.pct - a.pct);

  return (
    <GlassCard className="relative overflow-hidden">
      <Confetti />
      <div className="relative flex flex-col items-center text-center">
        <img
          src={trophy}
          alt="Champion trophy"
          className="h-40 w-40 animate-scale-in drop-shadow-2xl"
          width={1024}
          height={1024}
        />
        <h2 className="mt-2 text-4xl font-black text-[#FE6A2F] sm:text-5xl">
          You're a Champion!
        </h2>
        <p className="mt-2 text-lg text-[#FE6A2F]/80">First Lesson Complete 🎉</p>

        <div className="mt-6 flex items-center gap-2 rounded-full bg-[#FE6A2F] px-6 py-3 text-white shadow-xl">
          <img src={starImg} alt="" className="h-7 w-7" width={1024} height={1024} />
          <span className="text-3xl font-extrabold tabular-nums">{totalStars}</span>
          <span className="font-bold">stars</span>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <BigButton onClick={onRestart}>Play Again 🔁</BigButton>
          <BigButton variant="ghost" onClick={() => setShowSummary((s) => !s)}>
            {showSummary ? "Hide" : "Teacher Notes 📋"}
          </BigButton>
        </div>

        {showSummary && (
          <div className="mt-6 w-full animate-fade-in rounded-3xl border-2 border-[#FE6A2F]/30 bg-white p-6 text-left">
            <h3 className="mb-3 text-xl font-black text-[#FE6A2F]">Level Snapshot</h3>
            <ul className="space-y-2">
              {strongest.map((b) => {
                const pct = Math.round(b.pct * 100);
                return (
                  <li key={b.key} className="flex items-center gap-3">
                    <span className="w-44 font-semibold text-[#FE6A2F]">{b.label}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#FEFBDD]">
                      <div
                        className="h-full rounded-full bg-[#FE6A2F] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-20 text-right text-sm font-bold text-[#FE6A2F]/80">
                      {b.s ? `${b.s.earned}/${b.s.max}` : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
            {strongest.length > 0 && (
              <p className="mt-4 text-sm text-[#FE6A2F]/70">
                Strongest area:{" "}
                <span className="font-bold text-[#FE6A2F]">{strongest[0].label}</span>. Focus
                next on:{" "}
                <span className="font-bold text-[#FE6A2F]">
                  {strongest[strongest.length - 1].label}
                </span>
                .
              </p>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// ---------- Confetti ----------
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 2 + Math.random() * 2,
        color: ["#FE6A2F", "#FEFBDD", "#FACC15", "#FB7185", "#60A5FA"][i % 5],
        rotate: Math.random() * 360,
      })),
    [],
  );
  return (
    <>
      <style>{`@keyframes confetti-fall { 0% { transform: translateY(-20%) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(120vh) rotate(720deg); opacity: 1; } }`}</style>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {pieces.map((p, i) => (
          <span
            key={i}
            className="absolute top-0 h-3 w-2 rounded-sm"
            style={{
              left: `${p.left}%`,
              backgroundColor: p.color,
              transform: `rotate(${p.rotate}deg)`,
              animation: `confetti-fall ${p.duration}s ${p.delay}s linear infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}
