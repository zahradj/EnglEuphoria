import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LessonShell, type PhaseDef } from "@/components/lesson/LessonShell";
import { TeacherNotes } from "@/components/lesson/TeacherNotes";
import { speak } from "@/lib/lesson/speech";
import { Volume2, Trophy, RotateCcw, Star } from "lucide-react";
import confetti from "canvas-confetti";
import catImg from "@/assets/animals/cat.png";
import dogImg from "@/assets/animals/dog.png";
import tigerImg from "@/assets/animals/tiger.png";
import monkeyImg from "@/assets/animals/monkey.png";
import snakeImg from "@/assets/animals/snake.png";
import oceanFishImg from "@/assets/animals/ocean-fish.png";
import octopusImg from "@/assets/animals/octopus.png";
import crabImg from "@/assets/animals/crab.png";

export const Route = createFileRoute("/playground/quiz")({
  head: () => ({
    meta: [
      { title: "Unit Quiz · Lesson 6 — Animal Friends" },
      {
        name: "description",
        content:
          "Lesson 6 unit quiz covering all vocabulary, colours and sentence frames from Lessons 1–4.",
      },
      { property: "og:title", content: "Unit Quiz · Lesson 6" },
      {
        property: "og:description",
        content: "10 mixed questions: pictures, colours, sentence completion, story comprehension.",
      },
    ],
  }),
  component: QuizLesson,
});

type Q =
  | { kind: "picture"; prompt: string; image: string; options: string[]; answer: string }
  | { kind: "text"; prompt: string; options: string[]; answer: string }
  | { kind: "audio"; prompt: string; word: string; options: string[]; answer: string }
  | { kind: "spell"; prompt: string; word: string; image: string };

const QUESTIONS: Q[] = [
  // --- Picture round ---
  { kind: "picture", prompt: "What animal is this?", image: catImg, options: ["cat", "dog", "cow"], answer: "cat" },
  { kind: "picture", prompt: "What animal is this?", image: tigerImg, options: ["monkey", "tiger", "snake"], answer: "tiger" },
  { kind: "picture", prompt: "What animal is this?", image: octopusImg, options: ["crab", "fish", "octopus"], answer: "octopus" },
  { kind: "picture", prompt: "What animal is this?", image: snakeImg, options: ["snake", "tiger", "dog"], answer: "snake" },
  { kind: "picture", prompt: "What animal is this?", image: dogImg, options: ["dog", "cat", "monkey"], answer: "dog" },
  { kind: "picture", prompt: "What animal is this?", image: monkeyImg, options: ["monkey", "tiger", "crab"], answer: "monkey" },
  // --- Listening round ---
  { kind: "audio", prompt: "Listen — tap the picture", word: "crab", options: [crabImg, oceanFishImg, tigerImg], answer: crabImg },
  { kind: "audio", prompt: "Listen — tap the picture", word: "monkey", options: [snakeImg, monkeyImg, dogImg], answer: monkeyImg },
  { kind: "audio", prompt: "Listen — tap the picture", word: "cat", options: [tigerImg, catImg, octopusImg], answer: catImg },
  // --- Colour & describe round ---
  { kind: "text", prompt: "What colour is a tiger?", options: ["orange", "blue", "white"], answer: "orange" },
  { kind: "text", prompt: "What colour is a monkey?", options: ["green", "brown", "red"], answer: "brown" },
  { kind: "text", prompt: "What colour is a crab in our story?", options: ["red", "yellow", "purple"], answer: "red" },
  // --- Sentence completion round ---
  { kind: "text", prompt: "It is ___ orange small fish.", options: ["a", "an", "the"], answer: "an" },
  { kind: "text", prompt: "It is a ___ brown dog.", options: ["big", "small", "red"], answer: "big" },
  { kind: "text", prompt: "They go to the ___.", options: ["jungle", "moon", "shop"], answer: "jungle" },
  { kind: "text", prompt: "It ___ a small white cat.", options: ["is", "are", "be"], answer: "is" },
  // --- Where does it live ---
  { kind: "picture", prompt: "Where does this animal live?", image: crabImg, options: ["jungle", "ocean", "house"], answer: "ocean" },
  { kind: "picture", prompt: "Where does this animal live?", image: monkeyImg, options: ["jungle", "ocean", "farm"], answer: "jungle" },
  { kind: "picture", prompt: "Where does this animal live?", image: catImg, options: ["pets", "jungle", "ocean"], answer: "pets" },
  // --- Phonics round ---
  { kind: "text", prompt: "Which word starts with the /c/ sound?", options: ["cat", "dog", "fish"], answer: "cat" },
  { kind: "text", prompt: "Which word starts with the /m/ sound?", options: ["tiger", "monkey", "snake"], answer: "monkey" },
  { kind: "text", prompt: "Which letter makes the first sound in 'fish'?", options: ["F", "S", "C"], answer: "F" },
  { kind: "text", prompt: "Which letter makes the first sound in 'moon'?", options: ["N", "M", "O"], answer: "M" },
  // --- Spelling round ---
  { kind: "spell", prompt: "Spell this word", word: "cat", image: catImg },
  { kind: "spell", prompt: "Spell this word", word: "dog", image: dogImg },
  { kind: "spell", prompt: "Spell this word", word: "fish", image: oceanFishImg },
  { kind: "spell", prompt: "Spell this word", word: "crab", image: crabImg },
];

const PHASES: PhaseDef[] = [
  { id: "quiz", label: "Quiz" },
  { id: "result", label: "Results" },
];

function QuizLesson() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const q = QUESTIONS[qi];

  const choose = (opt: string, correct: boolean) => {
    if (picked) return;
    setPicked(opt);
    if (q.kind !== "audio") speak(opt);
    if (correct) {
      setScore((s) => s + 1);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
    }
  };

  const next = () => {
    if (qi >= QUESTIONS.length - 1) {
      setPhaseIdx(1);
      return;
    }
    setQi((i) => i + 1);
    setPicked(null);
  };

  const reset = () => {
    setQi(0); setPicked(null); setScore(0); setPhaseIdx(0);
  };

  const phase = PHASES[phaseIdx]?.id;

  return (
    <LessonShell
      phases={PHASES}
      currentIndex={phaseIdx}
      onPrev={() => {}}
      onNext={() => phase === "quiz" && picked && next()}
      canAdvance={!!picked}
      title="Unit Quiz — Animal Friends"
      subtitle={phase === "quiz" ? `Question ${qi + 1} of ${QUESTIONS.length}` : "How did you do?"}
      finishedCelebration={phase === "result"}
    >
      {phase === "quiz" ? (
        <QuestionView q={q} picked={picked} choose={choose} score={score} qi={qi} />
      ) : (
        <Results score={score} total={QUESTIONS.length} reset={reset} />
      )}
    </LessonShell>
  );
}

function QuestionView({
  q, picked, choose, score, qi,
}: {
  q: Q;
  picked: string | null;
  choose: (o: string, correct: boolean) => void;
  score: number;
  qi: number;
}) {
  return (
    <div className="space-y-5">
      <TeacherNotes>
        Read the question with the student. Wait for them to tap an answer, then tap Next. Wrong
        answers are okay — say the correct word together and move on.
      </TeacherNotes>
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-[color:var(--playground-primary)]">
          Question {qi + 1} · Score {score}
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <h3 className="text-2xl font-black text-[color:var(--playground-ink)] sm:text-3xl">
            {q.prompt}
          </h3>
          <button
            onClick={() => speak(q.kind === "audio" ? q.word : q.prompt)}
            className="glass-card flex h-10 w-10 items-center justify-center rounded-xl text-[color:var(--playground-primary)]"
            aria-label="Hear question"
          >
            <Volume2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {q.kind === "picture" && (
        <>
          <div className="mx-auto max-w-xs">
            <div className="glass-card flex aspect-square items-center justify-center rounded-3xl p-4">
              <img src={q.image} alt="" className="h-full w-full object-contain" />
            </div>
          </div>
          <TextOptions
            options={q.options}
            answer={q.answer}
            picked={picked}
            choose={choose}
          />
        </>
      )}

      {q.kind === "text" && (
        <TextOptions
          options={q.options}
          answer={q.answer}
          picked={picked}
          choose={choose}
        />
      )}

      {q.kind === "audio" && (
        <>
          <div className="text-center">
            <button
              onClick={() => speak(q.word)}
              className="shadow-playground inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-lg font-extrabold text-white"
              style={{ background: "var(--playground-primary)" }}
            >
              <Volume2 className="h-5 w-5" /> Hear word
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {q.options.map((img) => {
              const isPicked = picked === img;
              const isRight = isPicked && img === q.answer;
              const isWrong = isPicked && img !== q.answer;
              return (
                <button
                  key={img}
                  onClick={() => choose(img, img === q.answer)}
                  disabled={!!picked}
                  className={`glass-card flex aspect-square items-center justify-center rounded-2xl p-2 transition ${
                    isRight ? "ring-4 ring-emerald-400" : isWrong ? "ring-4 ring-red-400" : "hover:scale-105"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-contain" />
                </button>
              );
            })}
          </div>
        </>
      )}

      {q.kind === "spell" && (
        <SpellQuestion q={q} picked={picked} choose={choose} />
      )}

      {picked && (
        <p className="text-center text-sm font-bold text-[color:var(--playground-ink)]/70">
          Tap <em>Next</em> to continue.
        </p>
      )}
    </div>
  );
}

function TextOptions({
  options, answer, picked, choose,
}: {
  options: string[];
  answer: string;
  picked: string | null;
  choose: (o: string, correct: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {options.map((opt) => {
        const isPicked = picked === opt;
        const isRight = isPicked && opt === answer;
        const isWrong = isPicked && opt !== answer;
        const reveal = picked && opt === answer;
        return (
          <button
            key={opt}
            onClick={() => choose(opt, opt === answer)}
            disabled={!!picked}
            className={`rounded-2xl px-5 py-3 text-lg font-extrabold transition ${
              isRight || reveal
                ? "bg-emerald-500 text-white"
                : isWrong
                  ? "bg-red-300 text-red-900"
                  : "glass-card text-[color:var(--playground-ink)] hover:scale-105"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SpellQuestion({
  q, picked, choose,
}: {
  q: Extract<Q, { kind: "spell" }>;
  picked: string | null;
  choose: (o: string, correct: boolean) => void;
}) {
  const letters = useMemo(() => {
    const ls = q.word.split("");
    let s = [...ls].sort(() => Math.random() - 0.5);
    while (s.join("") === q.word) s = [...ls].sort(() => Math.random() - 0.5);
    return s.map((l, i) => ({ id: `${l}-${i}`, l }));
  }, [q.word]);
  const [order, setOrder] = useState<string[]>([]);
  useEffect(() => setOrder([]), [q.word]);
  const built = order.map((id) => id.split("-")[0]).join("");
  const locked = !!picked;

  useEffect(() => {
    if (!locked && built.length === q.word.length) {
      choose(built, built === q.word);
    }
  }, [built, locked, q.word, choose]);

  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-[180px]">
        <div className="glass-card flex aspect-square items-center justify-center rounded-3xl p-3">
          <img src={q.image} alt="" className="h-full w-full object-contain" />
        </div>
      </div>
      <div
        className={`glass-card mx-auto max-w-md rounded-2xl p-3 text-center text-3xl font-black tracking-[0.4em] ${
          locked
            ? built === q.word
              ? "text-emerald-600"
              : "text-red-500"
            : "text-[color:var(--playground-ink)]"
        }`}
      >
        {built || "____"}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {letters.map((t) => {
          const used = order.includes(t.id);
          return (
            <button
              key={t.id}
              disabled={used || locked}
              onClick={() => setOrder((o) => [...o, t.id])}
              className={`flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-black transition ${
                used
                  ? "bg-[color:var(--playground-primary)]/20 text-[color:var(--playground-ink)]/40"
                  : "glass-card text-[color:var(--playground-ink)] hover:scale-105"
              }`}
            >
              {t.l}
            </button>
          );
        })}
      </div>
      {!locked && (
        <div className="text-center">
          <button
            onClick={() => setOrder([])}
            className="glass-card rounded-2xl px-4 py-2 text-sm font-bold"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

function Results({ score, total, reset }: { score: number; total: number; reset: () => void }) {
  const stars = score >= total - 1 ? 3 : score >= total / 2 ? 2 : 1;
  const message =
    stars === 3 ? "Superstar! 🌟" : stars === 2 ? "Great job!" : "Good try — keep practising!";
  const needsPractice = stars < 3;
  return (
    <div className="space-y-5 text-center">
      <Trophy className="mx-auto h-20 w-20 text-[color:var(--playground-primary)]" />
      <h2 className="text-4xl font-black text-[color:var(--playground-ink)]">
        {score} / {total}
      </h2>
      <div className="flex justify-center gap-2">
        {[1, 2, 3].map((n) => (
          <Star
            key={n}
            className={`h-10 w-10 ${
              n <= stars ? "fill-yellow-400 text-yellow-400" : "text-[color:var(--playground-ink)]/20"
            }`}
          />
        ))}
      </div>
      <p className="text-xl font-bold text-[color:var(--playground-ink)]">{message}</p>

      {needsPractice && (
        <div className="glass-card mx-auto max-w-md rounded-3xl p-5 text-left">
          <p className="text-base font-bold text-[color:var(--playground-ink)]">
            Need a little more practice?
          </p>
          <p className="mt-1 text-sm text-[color:var(--playground-ink)]/70">
            Lesson 7 is an Extra Practice booster: phonics sounds, key vocabulary and the easiest
            sentence frames from Lessons 1–3. Try it, then come back and beat your score.
          </p>
          <Link
            to="/playground/practice"
            className="shadow-playground mt-3 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-extrabold text-white"
            style={{ background: "var(--playground-primary)" }}
          >
            Open Lesson 7 — Extra Practice →
          </Link>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="glass-card inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-sm font-bold"
        >
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
        <Link
          to="/"
          className="shadow-playground inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-base font-extrabold text-white"
          style={{ background: "var(--playground-primary)" }}
        >
          Back to Playground
        </Link>
      </div>
    </div>
  );
}
