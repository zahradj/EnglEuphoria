import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LessonShell, type PhaseDef } from "@/components/lesson/LessonShell";
import { TeacherNotes } from "@/components/lesson/TeacherNotes";
import { speak } from "@/lib/lesson/speech";
import { Volume2, Trophy, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { PhonicsReviewPhase } from "@/components/lesson/phases/PhonicsReview";
import catImg from "@/assets/animals/cat.png";
import dogImg from "@/assets/animals/dog.png";
import cowImg from "@/assets/animals/cow.png";
import duckImg from "@/assets/animals/duck.png";
import pigImg from "@/assets/animals/pig.png";
import petFishImg from "@/assets/animals/fish.png";
import monkeyImg from "@/assets/animals/monkey.png";
import snakeImg from "@/assets/animals/snake.png";
import tigerImg from "@/assets/animals/tiger.png";
import oceanFishImg from "@/assets/animals/ocean-fish.png";
import octopusImg from "@/assets/animals/octopus.png";
import crabImg from "@/assets/animals/crab.png";

export const Route = createFileRoute("/playground/practice")({
  head: () => ({
    meta: [
      { title: "Extra Practice · Lesson 7 — Animal Friends" },
      {
        name: "description",
        content:
          "Lesson 7 booster for students who need more practice after the unit review or quiz: phonics, core vocabulary and easy sentence frames.",
      },
      { property: "og:title", content: "Extra Practice · Lesson 7" },
      {
        property: "og:description",
        content: "Gentle, repeat-friendly practice covering phonics, vocabulary and sentences.",
      },
    ],
  }),
  component: PracticeLesson,
});

type Card = { word: string; image: string };
const CORE: Card[] = [
  { word: "cat", image: catImg },
  { word: "dog", image: dogImg },
  { word: "cow", image: cowImg },
  { word: "duck", image: duckImg },
  { word: "pig", image: pigImg },
  { word: "fish", image: petFishImg },
  { word: "monkey", image: monkeyImg },
  { word: "snake", image: snakeImg },
  { word: "tiger", image: tigerImg },
  { word: "fish", image: oceanFishImg },
  { word: "octopus", image: octopusImg },
  { word: "crab", image: crabImg },
];

const PHASES: PhaseDef[] = [
  { id: "hello", label: "Warm up" },
  { id: "phonics", label: "Phonics /c/ /m/ /f/" },
  { id: "listen", label: "Listen & point" },
  { id: "match", label: "Match word" },
  { id: "frame", label: "It is a ___" },
  { id: "done", label: "All done" },
];

function shuffle<T>(a: T[]): T[] {
  return [...a].sort(() => Math.random() - 0.5);
}

function PracticeLesson() {
  const [idx, setIdx] = useState(0);
  const phase = PHASES[idx]?.id;
  return (
    <LessonShell
      phases={PHASES}
      currentIndex={idx}
      onPrev={() => setIdx((i) => Math.max(0, i - 1))}
      onNext={() => setIdx((i) => Math.min(PHASES.length - 1, i + 1))}
      title="Extra Practice — booster"
      subtitle="Slow, friendly repetition. Repeat any phase as many times as you like."
      finishedCelebration={phase === "done"}
    >
      <TeacherNotes title="📍 Lesson map (teacher only)">
        <p className="mb-2 font-semibold">
          Unit: <span className="text-[color:var(--playground-primary)]">Animal Friends</span> ·
          Lesson 7 · Ages 4–9 · ~20 min
        </p>
        <p>
          Use after a low score in Lesson 5 (Review) or Lesson 6 (Quiz). Phases are intentionally
          short and repeatable — focus on the targets the student missed.
        </p>
      </TeacherNotes>

      {phase === "hello" && <Warmup />}
      {phase === "phonics" && <PhonicsReviewPhase />}
      {phase === "listen" && <ListenPoint />}
      {phase === "match" && <MatchWord />}
      {phase === "frame" && <FrameBuilder />}
      {phase === "done" && <Done />}
    </LessonShell>
  );
}

function Warmup() {
  return (
    <div className="space-y-4 text-center">
      <p className="text-2xl font-extrabold text-[color:var(--playground-ink)]">
        Hi! Let's practise together. 🐱🐒🐟
      </p>
      <p className="text-base text-[color:var(--playground-ink)]/70">
        We will play with sounds, words and short sentences. Tap{" "}
        <span className="font-bold">Next</span> when you are ready.
      </p>
      <div className="flex justify-center gap-3">
        {[catImg, monkeyImg, oceanFishImg].map((src, i) => (
          <button
            key={i}
            onClick={() => speak(["cat", "monkey", "fish"][i])}
            className="glass-card flex h-28 w-28 items-center justify-center rounded-3xl p-2 transition hover:scale-105"
          >
            <img src={src} alt="" className="h-full w-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ListenPoint() {
  const pool = useMemo(() => shuffle(CORE).slice(0, 8), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const target = pool[i];
  const choices = useMemo(() => {
    const others = shuffle(CORE.filter((c) => c.word !== target.word)).slice(0, 2);
    return shuffle([target, ...others]);
  }, [target]);

  useEffect(() => {
    const id = setTimeout(() => speak(target.word, { rate: 0.8 }), 250);
    return () => clearTimeout(id);
  }, [target.word]);

  const pick = (w: Card) => {
    if (picked) return;
    setPicked(w.word);
    speak(w.word, { rate: 0.85 });
    if (w.word === target.word) {
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
    }
    setTimeout(() => {
      setI((x) => (x + 1) % pool.length);
      setPicked(null);
    }, 1300);
  };

  return (
    <div className="text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-[color:var(--playground-primary)]">
        Round {i + 1} / {pool.length}
      </p>
      <button
        onClick={() => speak(target.word, { rate: 0.8 })}
        className="shadow-playground mx-auto mt-3 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-lg font-extrabold text-white"
        style={{ background: "var(--playground-primary)" }}
      >
        <Volume2 className="h-5 w-5" /> Hear the word
      </button>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {choices.map((c, k) => (
          <button
            key={`${c.word}-${k}`}
            disabled={!!picked}
            onClick={() => pick(c)}
            className="glass-card flex aspect-square items-center justify-center rounded-3xl p-3 transition hover:scale-105 disabled:opacity-80"
            style={{
              outline:
                picked === c.word
                  ? c.word === target.word
                    ? "4px solid #10b981"
                    : "4px solid #ef4444"
                  : "none",
            }}
          >
            <img src={c.image} alt={c.word} className="h-full w-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
}

function MatchWord() {
  const pool = useMemo(() => shuffle(CORE).slice(0, 6), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const target = pool[i];
  const choices = useMemo(() => {
    const others = shuffle(CORE.filter((c) => c.word !== target.word)).slice(0, 2);
    return shuffle([target.word, ...others.map((o) => o.word)]);
  }, [target]);

  const pick = (w: string) => {
    if (picked) return;
    setPicked(w);
    speak(w);
    if (w === target.word) confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => {
      setI((x) => (x + 1) % pool.length);
      setPicked(null);
    }, 1200);
  };

  return (
    <div className="text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-[color:var(--playground-primary)]">
        Round {i + 1} / {pool.length}
      </p>
      <div className="glass-card mx-auto mt-4 flex h-44 w-44 items-center justify-center rounded-3xl p-3">
        <img src={target.image} alt="" className="h-full w-full object-contain" />
      </div>
      <p className="mt-4 text-lg font-semibold text-[color:var(--playground-ink)]/80">
        Tap the word for the picture.
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        {choices.map((w) => (
          <button
            key={w}
            disabled={!!picked}
            onClick={() => pick(w)}
            className="glass-card rounded-2xl px-5 py-3 text-2xl font-extrabold capitalize transition hover:scale-105 disabled:opacity-80"
            style={{
              background:
                picked === w
                  ? w === target.word
                    ? "#10b981"
                    : "#ef4444"
                  : undefined,
              color: picked === w ? "white" : "var(--playground-ink)",
            }}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

function FrameBuilder() {
  const pool = useMemo(() => shuffle(CORE).slice(0, 6), []);
  const [i, setI] = useState(0);
  const target = pool[i];
  const [built, setBuilt] = useState<string[]>([]);
  const correct = built.join(" ") === `It is a ${target.word}`;
  const article = /^[aeiou]/i.test(target.word) ? "an" : "a";
  const wantWords = ["It", "is", article, target.word];
  const chips = useMemo(
    () => shuffle([...wantWords, "the", "tiger"]),
    [target.word],
  );

  useEffect(() => setBuilt([]), [target.word]);

  useEffect(() => {
    if (built.length === wantWords.length) {
      const ok = built.join(" ") === wantWords.join(" ");
      if (ok) {
        speak(built.join(" "));
        confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
        setTimeout(() => {
          setI((x) => (x + 1) % pool.length);
        }, 1600);
      } else {
        setTimeout(() => setBuilt([]), 600);
      }
    }
  }, [built, wantWords, pool.length]);

  return (
    <div className="text-center">
      <div className="glass-card mx-auto flex h-36 w-36 items-center justify-center rounded-3xl p-3">
        <img src={target.image} alt="" className="h-full w-full object-contain" />
      </div>
      <div
        className={`glass-card mx-auto mt-4 max-w-md rounded-2xl p-3 text-2xl font-black ${
          correct ? "text-emerald-600" : "text-[color:var(--playground-ink)]"
        }`}
      >
        {built.length ? built.join(" ") : "____ ____ ____ ____"}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {chips.map((w, k) => {
          const used = built.filter((b) => b === w).length >= chips.filter((c) => c === w).length;
          return (
            <button
              key={`${w}-${k}`}
              disabled={used}
              onClick={() => setBuilt((b) => [...b, w])}
              className="glass-card rounded-2xl px-4 py-2 text-lg font-extrabold capitalize transition hover:scale-105 disabled:opacity-30"
            >
              {w}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => setBuilt([])}
        className="glass-card mt-3 rounded-2xl px-4 py-2 text-sm font-bold"
      >
        Reset
      </button>
    </div>
  );
}

function Done() {
  return (
    <div className="space-y-5 text-center">
      <Trophy className="mx-auto h-20 w-20 text-[color:var(--playground-primary)]" />
      <h2 className="text-3xl font-black text-[color:var(--playground-ink)]">Great practice!</h2>
      <p className="text-base text-[color:var(--playground-ink)]/70">
        Now jump back into the Review or try the Quiz again for a higher score.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/playground/review"
          className="glass-card inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold"
        >
          <RotateCcw className="h-4 w-4" /> Back to Review
        </Link>
        <Link
          to="/playground/quiz"
          className="shadow-playground inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-base font-extrabold text-white"
          style={{ background: "var(--playground-primary)" }}
        >
          Try the Quiz again →
        </Link>
      </div>
    </div>
  );
}
