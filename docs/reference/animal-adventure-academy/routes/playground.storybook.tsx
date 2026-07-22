import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LessonShell, type PhaseDef } from "@/components/lesson/LessonShell";
import { TeacherNotes } from "@/components/lesson/TeacherNotes";
import {
  STORY_PAGES,
  STORY_TITLE,
  COMPREHENSION,
  LOOK_AND_SAY,
  type Level,
  type LookSayLevel,
  type StoryPage,
} from "@/lib/lesson/storybook";
import { speak } from "@/lib/lesson/speech";
import { SignedStoryPhase } from "@/components/lesson/phases/SignedStory";
import { Volume2, CheckCircle2, BookOpen, Sparkles, Shuffle, Mic } from "lucide-react";
import confetti from "canvas-confetti";
import catImg from "@/assets/animals/cat.png";
import dogImg from "@/assets/animals/dog.png";
import tigerImg from "@/assets/animals/tiger.png";
import monkeyImg from "@/assets/animals/monkey.png";
import fishImg from "@/assets/animals/ocean-fish.png";
import crabImg from "@/assets/animals/crab.png";

export const Route = createFileRoute("/playground/storybook")({
  head: () => ({
    meta: [
      { title: "Storybook · Lesson 4 — Cat and Dog's Big Day" },
      {
        name: "description",
        content:
          "Lesson 4 storybook for ages 4–9. Read a short illustrated story, fill the gaps with vocabulary from Lessons 1–3, and answer Pre-A1, A1 and A2 comprehension questions.",
      },
      { property: "og:title", content: "Storybook · Lesson 4" },
      {
        property: "og:description",
        content: "Illustrated story + fill-the-gaps + leveled comprehension questions.",
      },
    ],
  }),
  component: StorybookLesson,
});

const PHASES: PhaseDef[] = [
  { id: "signed", label: "Signed story" },
  { id: "read", label: "Read" },
  { id: "warmup", label: "Warm up" },
  { id: "vocab", label: "Vocabulary" },
  { id: "sequence", label: "Sequence" },
  { id: "gaps", label: "Fill the gaps" },
  { id: "comp", label: "Questions" },
  { id: "looksay", label: "Look & Say" },
  { id: "retell", label: "Retell" },
  { id: "cool", label: "Cool down" },
];

const STORAGE_KEY = "playground-storybook-progress";

function StorybookLesson() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setIdx(JSON.parse(raw).idx ?? 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ idx }));
    } catch {
      /* ignore */
    }
  }, [idx]);

  const phase = PHASES[idx]?.id;

  return (
    <LessonShell
      phases={PHASES}
      currentIndex={idx}
      onPrev={() => setIdx((i) => Math.max(0, i - 1))}
      onNext={() => setIdx((i) => Math.min(PHASES.length - 1, i + 1))}
      title={STORY_TITLE}
      subtitle="A storybook lesson using words from Lessons 1, 2 and 3."
      finishedCelebration={phase === "cool"}
    >
      {phase === "signed" && <SignedStoryPhase pages={STORY_PAGES} title={STORY_TITLE} />}
      {phase === "warmup" && <WarmupPhase />}
      {phase === "vocab" && <VocabPhase />}
      {phase === "read" && <ReadPhase />}
      {phase === "sequence" && <SequencePhase />}
      {phase === "gaps" && <GapsPhase />}
      {phase === "comp" && <ComprehensionPhase />}
      {phase === "looksay" && <LookAndSayPhase />}
      {phase === "retell" && <RetellPhase />}
      {phase === "cool" && <CoolPhase />}
    </LessonShell>
  );
}

/* ---------------- Read phase ---------------- */

function ReadPhase() {
  const [page, setPage] = useState(0);
  const p = STORY_PAGES[page];

  const readPage = () => speak(p.text.join(" "));

  return (
    <div className="space-y-6">
      <TeacherNotes>
        <p className="mb-2">
          <strong>Before the lesson:</strong> share the story with the student so they can listen
          and look at the pictures. In class, read it together page by page.
        </p>
        <p>
          Tap a sentence to hear it. Encourage the student to repeat after the audio and point at
          the matching part of the picture.
        </p>
      </TeacherNotes>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card overflow-hidden rounded-3xl">
          <img
            src={p.image}
            alt={`Story page ${page + 1}`}
            className="h-full w-full object-cover"
            width={1024}
            height={1024}
            loading="lazy"
          />
        </div>
        <div className="space-y-3">
          {p.text.map((s, i) => (
            <button
              key={i}
              onClick={() => speak(s)}
              className="glass-card flex w-full items-center gap-3 rounded-2xl p-4 text-left text-xl font-bold text-[color:var(--playground-ink)] transition hover:scale-[1.02]"
            >
              <Volume2 className="h-5 w-5 shrink-0 text-[color:var(--playground-primary)]" />
              {s}
            </button>
          ))}
          <button
            onClick={readPage}
            className="shadow-playground mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-base font-extrabold text-white"
            style={{ background: "var(--playground-primary)" }}
          >
            <BookOpen className="h-5 w-5" /> Read the whole page
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setPage((i) => Math.max(0, i - 1))}
          disabled={page === 0}
          className="glass-card rounded-2xl px-5 py-2 text-sm font-bold disabled:opacity-40"
        >
          ← Previous page
        </button>
        <div className="flex gap-2">
          {STORY_PAGES.map((_, i) => (
            <span
              key={i}
              className="h-2.5 w-8 rounded-full transition"
              style={{
                background:
                  i <= page
                    ? "var(--playground-primary)"
                    : "color-mix(in oklab, var(--playground-primary) 18%, white)",
              }}
            />
          ))}
        </div>
        <button
          onClick={() => setPage((i) => Math.min(STORY_PAGES.length - 1, i + 1))}
          disabled={page === STORY_PAGES.length - 1}
          className="glass-card rounded-2xl px-5 py-2 text-sm font-bold disabled:opacity-40"
        >
          Next page →
        </button>
      </div>
    </div>
  );
}

/* ---------------- Fill the gaps ---------------- */

function GapsPhase() {
  const [pageIdx, setPageIdx] = useState(0);
  const page: StoryPage = STORY_PAGES[pageIdx];
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // reset when page changes
  useEffect(() => setAnswers({}), [pageIdx]);

  const allCorrect =
    page.gaps.length > 0 &&
    page.gaps.every((g, i) => answers[i] === g.answer);

  useEffect(() => {
    if (allCorrect) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
    }
  }, [allCorrect]);

  return (
    <div className="space-y-6">
      <TeacherNotes>
        Read the story again. This time some words are missing. The student picks the correct word
        from Lessons 1–3 (animals, colors, places). Tap a word, then tap the gap colour to hear the
        completed sentence.
      </TeacherNotes>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card overflow-hidden rounded-3xl">
          <img
            src={page.image}
            alt=""
            className="h-full w-full object-cover"
            width={1024}
            height={1024}
            loading="lazy"
          />
        </div>
        <div className="space-y-4">
          {page.gaps.map((g, i) => {
            const picked = answers[i];
            const correct = picked === g.answer;
            return (
              <div key={i} className="glass-card rounded-2xl p-4">
                <p className="text-xl font-bold text-[color:var(--playground-ink)]">
                  {renderSentence(g.sentence, picked, correct)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {g.options.map((opt) => {
                    const isPicked = picked === opt;
                    const isRight = isPicked && correct;
                    const isWrong = isPicked && !correct;
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          setAnswers((a) => ({ ...a, [i]: opt }));
                          speak(opt === g.answer ? g.sentence.replace("___", opt) : opt);
                        }}
                        className={`rounded-xl px-4 py-2 text-base font-bold transition ${
                          isRight
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
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setPageIdx((i) => Math.max(0, i - 1))}
          disabled={pageIdx === 0}
          className="glass-card rounded-2xl px-5 py-2 text-sm font-bold disabled:opacity-40"
        >
          ← Previous page
        </button>
        <span className="text-sm font-bold text-[color:var(--playground-ink)]/70">
          Page {pageIdx + 1} of {STORY_PAGES.length}
          {allCorrect && (
            <span className="ml-2 inline-flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> All correct!
            </span>
          )}
        </span>
        <button
          onClick={() => setPageIdx((i) => Math.min(STORY_PAGES.length - 1, i + 1))}
          disabled={pageIdx === STORY_PAGES.length - 1}
          className="glass-card rounded-2xl px-5 py-2 text-sm font-bold disabled:opacity-40"
        >
          Next page →
        </button>
      </div>
    </div>
  );
}

function renderSentence(sentence: string, picked: string | undefined, correct: boolean) {
  const parts = sentence.split("___");
  return (
    <>
      {parts[0]}
      <span
        className={`inline-block min-w-[5rem] rounded-md px-2 text-center ${
          picked
            ? correct
              ? "bg-emerald-200 text-emerald-900"
              : "bg-red-200 text-red-900"
            : "bg-[color:var(--playground-primary)]/20"
        }`}
      >
        {picked ?? "____"}
      </span>
      {parts[1]}
    </>
  );
}

/* ---------------- Comprehension ---------------- */

function ComprehensionPhase() {
  const [level, setLevel] = useState<Level>("preA1");
  const questions = useMemo(() => COMPREHENSION[level], [level]);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => setAnswers({}), [level]);

  const correctCount = questions.reduce(
    (n, q, i) => (answers[i] === q.answer ? n + 1 : n),
    0,
  );

  return (
    <div className="space-y-6">
      <TeacherNotes>
        Pick the level that matches the student. Pre-A1 uses yes/no, A1 uses simple wh-questions,
        and A2 uses full descriptive sentences that stack colour and size like in Lesson 3.
      </TeacherNotes>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {(["preA1", "A1", "A2"] as Level[]).map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`rounded-2xl px-5 py-2 text-sm font-extrabold transition ${
              level === l
                ? "shadow-playground text-white"
                : "glass-card text-[color:var(--playground-ink)] hover:scale-105"
            }`}
            style={level === l ? { background: "var(--playground-primary)" } : undefined}
          >
            {l === "preA1" ? "Pre-A1" : l}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => {
          const picked = answers[i];
          return (
            <div key={`${level}-${i}`} className="glass-card rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xl font-bold text-[color:var(--playground-ink)]">
                  {i + 1}. {q.q}
                </p>
                <button
                  onClick={() => speak(q.q)}
                  className="glass-card flex h-10 w-10 items-center justify-center rounded-xl text-[color:var(--playground-primary)]"
                  aria-label="Hear question"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {q.options.map((opt) => {
                  const isPicked = picked === opt;
                  const isRight = isPicked && opt === q.answer;
                  const isWrong = isPicked && opt !== q.answer;
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        setAnswers((a) => ({ ...a, [i]: opt }));
                        speak(opt);
                      }}
                      className={`rounded-xl px-4 py-2 text-base font-bold transition ${
                        isRight
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
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm font-bold text-[color:var(--playground-ink)]/70">
        Score: {correctCount} / {questions.length}
      </p>
    </div>
  );
}

/* ---------------- Cool down ---------------- */

function CoolPhase() {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-4xl font-black text-[color:var(--playground-ink)]">
        Amazing reading! 📖✨
      </h2>
      <p className="text-lg text-[color:var(--playground-ink)]/70">
        You read a whole story and answered the questions. High five!
      </p>
      <Link
        to="/"
        className="shadow-playground inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-base font-extrabold text-white"
        style={{ background: "var(--playground-primary)" }}
      >
        Back to Playground
      </Link>
    </div>
  );
}

/* ---------------- Warm up: predict from cover ---------------- */

const PREDICT_OPTIONS = [
  { label: "🐱 a cat", correct: true },
  { label: "🐶 a dog", correct: true },
  { label: "🐯 a tiger", correct: true },
  { label: "🐒 a monkey", correct: true },
  { label: "🐠 a fish", correct: true },
  { label: "🦀 a crab", correct: true },
  { label: "🦒 a giraffe", correct: false },
  { label: "🐘 an elephant", correct: false },
  { label: "🐧 a penguin", correct: false },
];

function WarmupPhase() {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  return (
    <div className="space-y-5">
      <TeacherNotes>
        Show the cover. Ask: "Who is in the story? What animals do you see?" Tap every animal you
        think appears. Read the story together if the student is not sure.
      </TeacherNotes>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card overflow-hidden rounded-3xl">
          <img
            src={STORY_PAGES[0].image}
            alt="Story cover"
            className="h-full w-full object-cover"
            width={1024}
            height={1024}
          />
        </div>
        <div>
          <h3 className="mb-3 text-2xl font-extrabold text-[color:var(--playground-ink)]">
            Who is in the story?
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PREDICT_OPTIONS.map((o) => {
              const isPicked = picked.has(o.label);
              const ok = isPicked && o.correct;
              const bad = isPicked && !o.correct;
              return (
                <button
                  key={o.label}
                  onClick={() => {
                    speak(o.label.replace(/^\S+\s/, ""));
                    setPicked((s) => {
                      const n = new Set(s);
                      if (n.has(o.label)) n.delete(o.label);
                      else n.add(o.label);
                      return n;
                    });
                  }}
                  className={`rounded-2xl px-3 py-3 text-base font-bold transition ${
                    ok
                      ? "bg-emerald-500 text-white"
                      : bad
                        ? "bg-red-300 text-red-900"
                        : "glass-card text-[color:var(--playground-ink)] hover:scale-105"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-[color:var(--playground-ink)]/60">
            Tap each animal you expect to see. Green = yes, red = not in this story.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Vocabulary recall ---------------- */

const VOCAB_CARDS: { word: string; image: string }[] = [
  { word: "cat", image: catImg },
  { word: "dog", image: dogImg },
  { word: "tiger", image: tigerImg },
  { word: "monkey", image: monkeyImg },
  { word: "fish", image: fishImg },
  { word: "crab", image: crabImg },
];

const COLOR_CARDS = [
  { word: "orange", hex: "#FB923C" },
  { word: "brown", hex: "#8B5A2B" },
  { word: "white", hex: "#F8FAFC" },
  { word: "red", hex: "#EF4444" },
];

function VocabPhase() {
  const [target, setTarget] = useState(() => VOCAB_CARDS[0].word);
  const [score, setScore] = useState(0);
  const next = () => {
    const pool = VOCAB_CARDS.filter((c) => c.word !== target);
    setTarget(pool[Math.floor(Math.random() * pool.length)].word);
  };
  return (
    <div className="space-y-5">
      <TeacherNotes>
        Quick warm-up of the words the student will meet in the story. Tap the speaker, then the
        student taps the matching picture. Then review the colour swatches.
      </TeacherNotes>
      <div className="glass-card rounded-2xl p-4 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-[color:var(--playground-primary)]">
          Listen and tap
        </p>
        <button
          onClick={() => speak(target)}
          className="shadow-playground mt-2 inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-base font-extrabold text-white"
          style={{ background: "var(--playground-primary)" }}
        >
          <Volume2 className="h-5 w-5" /> Hear the word
        </button>
        <p className="mt-2 text-sm text-[color:var(--playground-ink)]/60">Score: {score}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {VOCAB_CARDS.map((c) => (
          <button
            key={c.word}
            onClick={() => {
              if (c.word === target) {
                setScore((s) => s + 1);
                confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
                next();
              } else {
                speak(c.word);
              }
            }}
            className="glass-card flex aspect-square items-center justify-center rounded-2xl p-2 transition hover:scale-105"
          >
            <img src={c.image} alt={c.word} className="h-full w-full object-contain" />
          </button>
        ))}
      </div>
      <div>
        <h3 className="mb-2 text-lg font-extrabold text-[color:var(--playground-ink)]">
          Review colours
        </h3>
        <div className="flex flex-wrap gap-3">
          {COLOR_CARDS.map((c) => (
            <button
              key={c.word}
              onClick={() => speak(c.word)}
              className="glass-card flex items-center gap-2 rounded-2xl px-4 py-2 font-bold text-[color:var(--playground-ink)] transition hover:scale-105"
            >
              <span
                className="h-6 w-6 rounded-full border border-black/10"
                style={{ background: c.hex }}
              />
              {c.word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Sequence the story ---------------- */

function SequencePhase() {
  const correctOrder = STORY_PAGES.map((p) => p.id);
  const [order, setOrder] = useState<string[]>(() =>
    [...correctOrder].sort(() => Math.random() - 0.5),
  );
  const done = order.every((id, i) => id === correctOrder[i]);

  const move = (from: number, to: number) => {
    setOrder((arr) => {
      const n = [...arr];
      const [item] = n.splice(from, 1);
      n.splice(to, 0, item);
      return n;
    });
  };

  useEffect(() => {
    if (done) confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
  }, [done]);

  return (
    <div className="space-y-5">
      <TeacherNotes>
        Put the story pages in the right order: pets first, then jungle, then ocean. Use the arrows
        to move a page left or right.
      </TeacherNotes>
      <p className="text-center text-lg font-bold text-[color:var(--playground-ink)]">
        Put the story in order — what happened first?
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {order.map((id, i) => {
          const page = STORY_PAGES.find((p) => p.id === id)!;
          const correct = id === correctOrder[i];
          return (
            <div
              key={id}
              className={`glass-card overflow-hidden rounded-3xl border-4 transition ${
                done ? "border-emerald-400" : correct ? "border-emerald-300/60" : "border-transparent"
              }`}
            >
              <div className="relative">
                <img
                  src={page.image}
                  alt=""
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute left-2 top-2 rounded-full bg-white/80 px-3 py-1 text-sm font-extrabold text-[color:var(--playground-ink)]">
                  {i + 1}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 p-2">
                <button
                  onClick={() => i > 0 && move(i, i - 1)}
                  disabled={i === 0}
                  className="glass-card rounded-xl px-3 py-1 font-bold disabled:opacity-40"
                >
                  ←
                </button>
                <span className="text-xs font-bold uppercase tracking-widest text-[color:var(--playground-ink)]/60">
                  {id}
                </span>
                <button
                  onClick={() => i < order.length - 1 && move(i, i + 1)}
                  disabled={i === order.length - 1}
                  className="glass-card rounded-xl px-3 py-1 font-bold disabled:opacity-40"
                >
                  →
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {done && (
        <p className="flex items-center justify-center gap-2 text-lg font-extrabold text-emerald-600">
          <CheckCircle2 className="h-5 w-5" /> Perfect order!
        </p>
      )}
      <button
        onClick={() => setOrder([...correctOrder].sort(() => Math.random() - 0.5))}
        className="glass-card mx-auto flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold"
      >
        <Shuffle className="h-4 w-4" /> Shuffle again
      </button>
    </div>
  );
}

/* ---------------- Retell ---------------- */

const RETELL_FRAMES = [
  {
    image: STORY_PAGES[0].image,
    prompt: "Tell me about the cat and the dog.",
    parts: ["It is a", "small / big", "white / brown", "cat / dog", "."],
    example: "It is a small white cat. It is a big brown dog.",
  },
  {
    image: STORY_PAGES[1].image,
    prompt: "Who do they meet in the jungle?",
    parts: ["They see", "an / a", "orange / brown", "tiger / monkey", "."],
    example: "They see an orange tiger and a brown monkey.",
  },
  {
    image: STORY_PAGES[2].image,
    prompt: "What is in the sea?",
    parts: ["They see", "a", "small / red", "fish / crab", "."],
    example: "They see a small orange fish and a red crab.",
  },
];

function RetellPhase() {
  const [page, setPage] = useState(0);
  const f = RETELL_FRAMES[page];
  return (
    <div className="space-y-5">
      <TeacherNotes>
        Your turn to tell the story! Look at the picture and use the sentence frames to retell it.
        Tap "Hear example" if you need help.
      </TeacherNotes>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card overflow-hidden rounded-3xl">
          <img src={f.image} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="space-y-3">
          <p className="text-xl font-extrabold text-[color:var(--playground-ink)]">
            <Mic className="mr-2 inline h-5 w-5 text-[color:var(--playground-primary)]" />
            {f.prompt}
          </p>
          <div className="glass-card rounded-2xl p-4">
            <p className="text-sm font-bold uppercase tracking-widest text-[color:var(--playground-primary)]">
              Sentence frame
            </p>
            <p className="mt-1 text-lg font-bold text-[color:var(--playground-ink)]">
              {f.parts.join(" ")}
            </p>
          </div>
          <button
            onClick={() => speak(f.example)}
            className="shadow-playground inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-base font-extrabold text-white"
            style={{ background: "var(--playground-primary)" }}
          >
            <Volume2 className="h-5 w-5" /> Hear example
          </button>
          <p className="text-sm text-[color:var(--playground-ink)]/60">
            Example: <em>{f.example}</em>
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage((i) => Math.max(0, i - 1))}
          disabled={page === 0}
          className="glass-card rounded-2xl px-5 py-2 text-sm font-bold disabled:opacity-40"
        >
          ← Previous scene
        </button>
        <span className="text-sm font-bold text-[color:var(--playground-ink)]/70">
          Scene {page + 1} of {RETELL_FRAMES.length}
        </span>
        <button
          onClick={() => setPage((i) => Math.min(RETELL_FRAMES.length - 1, i + 1))}
          disabled={page === RETELL_FRAMES.length - 1}
          className="glass-card rounded-2xl px-5 py-2 text-sm font-bold disabled:opacity-40"
        >
          Next scene →
        </button>
      </div>
    </div>
  );
}

/* ---------------- Post-reading · Look & Say (A2 / B1 / B2) ---------------- */


/**
 * Graphic organizer inspired by classroom "Look & Say" cards:
 *   👤 Who   ·   📍 Where   ·   ❓ What
 *
 * Difficulty scales with CEFR level:
 *   A2 → one short sentence per slot.
 *   B1 → reasons + linkers (because / and).
 *   B2 → 3–4 sentence retell with sequencing + cause/effect.
 *
 * Students type or say their answer, then reveal the model to compare and
 * tap the speaker to hear it read aloud. Page tabs let them work through
 * every scene of the story.
 */
function LookAndSayPhase() {
  const [level, setLevel] = useState<LookSayLevel>("A2");
  const [pageIdx, setPageIdx] = useState(0);
  const cards = LOOK_AND_SAY[level];
  const card = cards[pageIdx];
  const storyPage = STORY_PAGES.find((p) => p.id === card.pageId)!;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setAnswers({});
    setRevealed({});
  }, [level, pageIdx]);

  const key = (i: number) => `${level}-${card.pageId}-${i}`;

  return (
    <div className="space-y-6">
      <TeacherNotes>
        <p className="mb-2">
          <strong>Post-reading Look &amp; Say.</strong> For older students (A2 / B1 / B2). After
          reading, the student rebuilds the story using the Who / Where / What organizer.
        </p>
        <p>
          The frame and model answer get richer as the level goes up — A2 is one short sentence,
          B1 adds reasons with <em>because</em>, B2 asks for sequencing and cause/effect. Have the
          student speak their answer first, then reveal to compare.
        </p>
      </TeacherNotes>

      {/* Level switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {(["A2", "B1", "B2"] as LookSayLevel[]).map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`rounded-2xl px-5 py-2 text-sm font-extrabold transition ${
              level === l
                ? "shadow-playground text-white"
                : "glass-card text-[color:var(--playground-ink)] hover:scale-105"
            }`}
            style={level === l ? { background: "var(--playground-primary)" } : undefined}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Scene tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {cards.map((c, i) => (
          <button
            key={c.pageId}
            onClick={() => setPageIdx(i)}
            className={`rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-widest transition ${
              i === pageIdx
                ? "bg-[color:var(--playground-primary)] text-white"
                : "glass-card text-[color:var(--playground-ink)]/70 hover:scale-105"
            }`}
          >
            {i + 1}. {c.title}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <div className="glass-card overflow-hidden rounded-3xl">
          <img
            src={storyPage.image}
            alt={card.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="space-y-3">
          {card.slots.map((slot, i) => {
            const k = key(i);
            const shown = revealed[k];
            return (
              <div key={k} className="glass-card rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-lg font-extrabold text-[color:var(--playground-ink)]">
                    {slot.label}
                  </p>
                  <button
                    onClick={() => speak(slot.prompt)}
                    className="glass-card inline-flex h-9 w-9 items-center justify-center rounded-xl text-[color:var(--playground-primary)]"
                    aria-label="Hear question"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-[color:var(--playground-ink)]/70">{slot.prompt}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[color:var(--playground-primary)]">
                  Sentence frame
                </p>
                <p className="text-base font-bold text-[color:var(--playground-ink)]">
                  {slot.frame}
                </p>
                <textarea
                  value={answers[k] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [k]: e.target.value }))}
                  placeholder="Type your answer or say it out loud…"
                  rows={level === "B2" ? 3 : 2}
                  className="mt-3 w-full rounded-xl border border-black/10 bg-white/70 p-3 text-base font-medium text-[color:var(--playground-ink)] outline-none focus:border-[color:var(--playground-primary)]"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setRevealed((r) => ({ ...r, [k]: !r[k] }))}
                    className="shadow-playground inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold text-white"
                    style={{ background: "var(--playground-primary)" }}
                  >
                    <Sparkles className="h-4 w-4" /> {shown ? "Hide model" : "Show model"}
                  </button>
                  <button
                    onClick={() => speak(slot.model)}
                    className="glass-card inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-[color:var(--playground-ink)]"
                  >
                    <Volume2 className="h-4 w-4" /> Hear model
                  </button>
                </div>
                {shown && (
                  <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
                    <span className="mr-1 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-widest text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Model
                    </span>
                    <span className="ml-1">{slot.model}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

