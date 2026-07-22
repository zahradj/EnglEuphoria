import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LessonShell, type PhaseDef } from "@/components/lesson/LessonShell";
import { TeacherNotes } from "@/components/lesson/TeacherNotes";
import { speak } from "@/lib/lesson/speech";
import { Volume2, RotateCcw, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { PhonicsReviewPhase } from "@/components/lesson/phases/PhonicsReview";
import catImg from "@/assets/animals/cat.png";
import cowImg from "@/assets/animals/cow.png";
import dogImg from "@/assets/animals/dog.png";
import duckImg from "@/assets/animals/duck.png";
import pigImg from "@/assets/animals/pig.png";
import petFishImg from "@/assets/animals/fish.png";
import monkeyImg from "@/assets/animals/monkey.png";
import snakeImg from "@/assets/animals/snake.png";
import tigerImg from "@/assets/animals/tiger.png";
import oceanFishImg from "@/assets/animals/ocean-fish.png";
import octopusImg from "@/assets/animals/octopus.png";
import crabImg from "@/assets/animals/crab.png";

export const Route = createFileRoute("/playground/review")({
  head: () => ({
    meta: [
      { title: "Review · Lesson 5 — Animal Friends" },
      {
        name: "description",
        content:
          "Lesson 5 review of all 12 animal friends, colours and sentence frames from Lessons 1–4.",
      },
      { property: "og:title", content: "Review · Lesson 5" },
      {
        property: "og:description",
        content: "Flashcards, colours, sentence mixer and a listening sprint.",
      },
    ],
  }),
  component: ReviewLesson,
});

type Card = { word: string; image: string; group: "pet" | "jungle" | "ocean" };

const ALL: Card[] = [
  { word: "cat", image: catImg, group: "pet" },
  { word: "cow", image: cowImg, group: "pet" },
  { word: "dog", image: dogImg, group: "pet" },
  { word: "duck", image: duckImg, group: "pet" },
  { word: "pig", image: pigImg, group: "pet" },
  { word: "fish", image: petFishImg, group: "pet" },
  { word: "monkey", image: monkeyImg, group: "jungle" },
  { word: "snake", image: snakeImg, group: "jungle" },
  { word: "tiger", image: tigerImg, group: "jungle" },
  { word: "fish", image: oceanFishImg, group: "ocean" },
  { word: "octopus", image: octopusImg, group: "ocean" },
  { word: "crab", image: crabImg, group: "ocean" },
];

const COLORS = [
  { name: "orange", hex: "#FB923C" },
  { name: "brown", hex: "#8B5A2B" },
  { name: "white", hex: "#F8FAFC" },
  { name: "red", hex: "#EF4444" },
  { name: "yellow", hex: "#FACC15" },
  { name: "green", hex: "#22C55E" },
  { name: "black", hex: "#1F2937" },
  { name: "purple", hex: "#A855F7" },
];

const PHASES: PhaseDef[] = [
  { id: "cards", label: "Flashcards" },
  { id: "colors", label: "Colours" },
  { id: "phonics", label: "Phonics /c/ /m/ /f/" },
  { id: "memory", label: "Memory match" },
  { id: "sort", label: "Sort by home" },
  { id: "odd", label: "Odd one out" },
  { id: "mix", label: "Sentence mixer" },
  { id: "scramble", label: "Sentence scramble" },
  { id: "spell", label: "Spell it" },
  { id: "sprint", label: "Listening sprint" },
  { id: "cool", label: "Cool down" },
];

const STORAGE_KEY = "playground-review-progress";

function shuffle<T>(a: T[]): T[] {
  return [...a].sort(() => Math.random() - 0.5);
}

function ReviewLesson() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    try {
      const r = sessionStorage.getItem(STORAGE_KEY);
      if (r) setIdx(JSON.parse(r).idx ?? 0);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ idx })); } catch { /* ignore */ }
  }, [idx]);
  const phase = PHASES[idx]?.id;

  return (
    <LessonShell
      phases={PHASES}
      currentIndex={idx}
      onPrev={() => setIdx((i) => Math.max(0, i - 1))}
      onNext={() => setIdx((i) => Math.min(PHASES.length - 1, i + 1))}
      title="Big Review — Animal Friends"
      subtitle="Refresh every word, colour and sentence from Lessons 1 to 4."
      finishedCelebration={phase === "cool"}
    >
      {phase === "cards" && <Flashcards />}
      {phase === "colors" && <ColorsReview />}
      {phase === "phonics" && <PhonicsReviewPhase />}
      {phase === "memory" && <MemoryMatch />}
      {phase === "sort" && <SortGame />}
      {phase === "odd" && <OddOneOut />}
      {phase === "mix" && <SentenceMixer />}
      {phase === "scramble" && <SentenceScramble />}
      {phase === "spell" && <SpellIt />}
      {phase === "sprint" && <Sprint />}
      {phase === "cool" && <Cool />}
    </LessonShell>
  );
}

function Flashcards() {
  const [i, setI] = useState(0);
  const c = ALL[i];
  return (
    <div className="space-y-5">
      <TeacherNotes>
        Tap the picture to hear the word. Use the arrows to flip through all 12 cards. Ask the
        student to repeat each one.
      </TeacherNotes>
      <div className="mx-auto max-w-md">
        <button
          onClick={() => speak(c.word)}
          className="glass-card flex aspect-square w-full items-center justify-center rounded-3xl p-6 transition hover:scale-105"
        >
          <img src={c.image} alt={c.word} className="h-full w-full object-contain" />
        </button>
        <p className="mt-3 text-center text-3xl font-black text-[color:var(--playground-ink)]">
          {c.word}
        </p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setI((n) => (n - 1 + ALL.length) % ALL.length)}
          className="glass-card rounded-2xl px-5 py-2 text-sm font-bold"
        >
          ← Previous
        </button>
        <span className="text-sm font-bold text-[color:var(--playground-ink)]/70">
          {i + 1} / {ALL.length}
        </span>
        <button
          onClick={() => setI((n) => (n + 1) % ALL.length)}
          className="glass-card rounded-2xl px-5 py-2 text-sm font-bold"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function ColorsReview() {
  return (
    <div className="space-y-5">
      <TeacherNotes>Tap each colour to hear its name. Then point to things in the room of the same colour.</TeacherNotes>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {COLORS.map((c) => (
          <button
            key={c.name}
            onClick={() => speak(c.name)}
            className="glass-card flex flex-col items-center gap-2 rounded-2xl p-4 transition hover:scale-105"
          >
            <span
              className="h-16 w-16 rounded-full border border-black/10"
              style={{ background: c.hex }}
            />
            <span className="text-lg font-extrabold text-[color:var(--playground-ink)]">
              {c.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SortGame() {
  const pool = useMemo(() => shuffle(ALL).slice(0, 6), []);
  const [placed, setPlaced] = useState<Record<string, "pet" | "jungle" | "ocean">>({});
  const score = pool.reduce((n, c, i) => (placed[`${c.word}-${i}`] === c.group ? n + 1 : n), 0);

  return (
    <div className="space-y-5">
      <TeacherNotes>
        For each animal, tap the home it lives in: pets, jungle or ocean. Some animals live in more
        than one place — the right answer is where we first met it.
      </TeacherNotes>
      <p className="text-center font-bold text-[color:var(--playground-ink)]/70">
        Score: {score} / {pool.length}
      </p>
      <div className="space-y-3">
        {pool.map((c, i) => {
          const key = `${c.word}-${i}`;
          const picked = placed[key];
          return (
            <div key={key} className="glass-card flex items-center gap-3 rounded-2xl p-3">
              <img src={c.image} alt={c.word} className="h-16 w-16 object-contain" />
              <span className="flex-1 text-lg font-extrabold text-[color:var(--playground-ink)]">
                {c.word}
              </span>
              {(["pet", "jungle", "ocean"] as const).map((g) => {
                const isPicked = picked === g;
                const right = isPicked && g === c.group;
                const wrong = isPicked && g !== c.group;
                return (
                  <button
                    key={g}
                    onClick={() => {
                      setPlaced((p) => ({ ...p, [key]: g }));
                      speak(g === "pet" ? "pets" : g);
                    }}
                    className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                      right
                        ? "bg-emerald-500 text-white"
                        : wrong
                          ? "bg-red-300 text-red-900"
                          : "glass-card text-[color:var(--playground-ink)]"
                    }`}
                  >
                    {g === "pet" ? "🏠 pets" : g === "jungle" ? "🌴 jungle" : "🌊 ocean"}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SentenceMixer() {
  const animals = ["cat", "dog", "tiger", "monkey", "fish", "crab"];
  const sizes = ["small", "big"];
  const [color, setColor] = useState("orange");
  const [size, setSize] = useState("small");
  const [animal, setAnimal] = useState("cat");
  const article = /^[aeiou]/i.test(color) ? "an" : "a";
  const sentence = `It is ${article} ${color} ${size} ${animal}.`;

  return (
    <div className="space-y-5">
      <TeacherNotes>
        Mix and match colour + size + animal. Then tap "Say it!" to hear the full sentence. Try
        silly combos!
      </TeacherNotes>
      <div className="glass-card rounded-2xl p-5 text-center">
        <p className="text-2xl font-black text-[color:var(--playground-ink)]">{sentence}</p>
        <button
          onClick={() => speak(sentence)}
          className="shadow-playground mt-3 inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-base font-extrabold text-white"
          style={{ background: "var(--playground-primary)" }}
        >
          <Volume2 className="h-5 w-5" /> Say it!
        </button>
      </div>
      <div className="space-y-3">
        <Row label="Colour" options={COLORS.map((c) => c.name)} value={color} onPick={setColor} />
        <Row label="Size" options={sizes} value={size} onPick={setSize} />
        <Row label="Animal" options={animals} value={animal} onPick={setAnimal} />
      </div>
    </div>
  );
}

function Row({
  label, options, value, onPick,
}: { label: string; options: string[]; value: string; onPick: (s: string) => void }) {
  return (
    <div>
      <p className="mb-1 text-sm font-bold uppercase tracking-widest text-[color:var(--playground-primary)]">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => { onPick(o); speak(o); }}
            className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
              value === o
                ? "shadow-playground text-white"
                : "glass-card text-[color:var(--playground-ink)] hover:scale-105"
            }`}
            style={value === o ? { background: "var(--playground-primary)" } : undefined}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Sprint() {
  const ROUNDS = 6;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const set = useMemo(() => {
    const pool = shuffle(ALL).slice(0, 4);
    return { pool, target: pool[Math.floor(Math.random() * pool.length)] };
  }, [round]);

  if (round >= ROUNDS) {
    return (
      <div className="space-y-4 text-center">
        <Trophy className="mx-auto h-16 w-16 text-[color:var(--playground-primary)]" />
        <h3 className="text-3xl font-black text-[color:var(--playground-ink)]">
          Sprint done — {score} / {ROUNDS}
        </h3>
        <button
          onClick={() => { setRound(0); setScore(0); }}
          className="glass-card inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-sm font-bold"
        >
          <RotateCcw className="h-4 w-4" /> Play again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <TeacherNotes>Six quick rounds. Hear the word and tap the matching picture as fast as you can.</TeacherNotes>
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-[color:var(--playground-primary)]">
          Round {round + 1} / {ROUNDS} · Score {score}
        </p>
        <button
          onClick={() => speak(set.target.word)}
          className="shadow-playground mt-2 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-lg font-extrabold text-white"
          style={{ background: "var(--playground-primary)" }}
        >
          <Volume2 className="h-5 w-5" /> Hear word
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {set.pool.map((c, i) => (
          <button
            key={`${c.word}-${i}`}
            onClick={() => {
              const ok = c.word === set.target.word && c.image === set.target.image;
              if (ok) {
                setScore((s) => s + 1);
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
              }
              setRound((r) => r + 1);
            }}
            className="glass-card flex aspect-square items-center justify-center rounded-2xl p-2 transition hover:scale-105"
          >
            <img src={c.image} alt={c.word} className="h-full w-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Cool() {
  const [choice, setChoice] = useState<"ready" | "more" | null>(null);

  return (
    <div className="space-y-5 text-center">
      <h2 className="text-4xl font-black text-[color:var(--playground-ink)]">Review complete! 🎉</h2>
      <p className="text-lg text-[color:var(--playground-ink)]/70">
        Quick self-check — how did the review feel?
      </p>

      {!choice && (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => setChoice("ready")}
            className="glass-card rounded-3xl p-5 text-left transition hover:scale-[1.02]"
          >
            <div className="text-3xl">😎</div>
            <p className="mt-2 text-lg font-extrabold text-[color:var(--playground-ink)]">
              Easy! I'm ready.
            </p>
            <p className="text-sm text-[color:var(--playground-ink)]/70">Go straight to the Quiz.</p>
          </button>
          <button
            onClick={() => setChoice("more")}
            className="glass-card rounded-3xl p-5 text-left transition hover:scale-[1.02]"
          >
            <div className="text-3xl">🤔</div>
            <p className="mt-2 text-lg font-extrabold text-[color:var(--playground-ink)]">
              I need more practice.
            </p>
            <p className="text-sm text-[color:var(--playground-ink)]/70">
              Try the Booster first, then the Quiz.
            </p>
          </button>
        </div>
      )}

      {choice === "ready" && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/playground/quiz"
            className="shadow-playground inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-base font-extrabold text-white"
            style={{ background: "var(--playground-primary)" }}
          >
            <Trophy className="h-5 w-5" /> Start Unit Quiz
          </Link>
          <button
            onClick={() => setChoice(null)}
            className="glass-card rounded-2xl px-4 py-2 text-sm font-bold"
          >
            Change my mind
          </button>
        </div>
      )}

      {choice === "more" && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/playground/practice"
            className="shadow-playground inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-base font-extrabold text-white"
            style={{ background: "var(--playground-primary)" }}
          >
            💪 Open Booster — Extra Practice
          </Link>
          <button
            onClick={() => setChoice(null)}
            className="glass-card rounded-2xl px-4 py-2 text-sm font-bold"
          >
            Change my mind
          </button>
        </div>
      )}

      <Link to="/" className="block text-sm font-bold text-[color:var(--playground-ink)]/60">
        ← Back to Playground
      </Link>
    </div>
  );
}

/* ---------------- Memory match ---------------- */

function MemoryMatch() {
  const PAIRS = useMemo(() => shuffle(ALL).slice(0, 6), []);
  type Tile = { id: string; word: string; image: string };
  const tiles = useMemo<Tile[]>(
    () =>
      shuffle(
        PAIRS.flatMap((c, i) => [
          { id: `${i}-a`, word: c.word, image: c.image },
          { id: `${i}-b`, word: c.word, image: c.image },
        ]),
      ),
    [PAIRS],
  );
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const allDone = matched.size === PAIRS.length * 2;

  useEffect(() => {
    if (allDone) confetti({ particleCount: 120, spread: 70, origin: { y: 0.5 } });
  }, [allDone]);

  const click = (t: Tile) => {
    if (matched.has(t.id) || flipped.includes(t.id) || flipped.length === 2) return;
    speak(t.word);
    const next = [...flipped, t.id];
    setFlipped(next);
    if (next.length === 2) {
      const [a, b] = next.map((id) => tiles.find((x) => x.id === id)!);
      if (a.word === b.word) {
        setMatched((m) => new Set([...m, a.id, b.id]));
        setTimeout(() => setFlipped([]), 400);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  return (
    <div className="space-y-5">
      <TeacherNotes>Flip two cards. If they match, you keep the pair. Find all 6 pairs!</TeacherNotes>
      <p className="text-center font-bold text-[color:var(--playground-ink)]/70">
        Pairs found: {matched.size / 2} / {PAIRS.length}
      </p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {tiles.map((t) => {
          const show = flipped.includes(t.id) || matched.has(t.id);
          return (
            <button
              key={t.id}
              onClick={() => click(t)}
              className={`glass-card flex aspect-square items-center justify-center rounded-2xl p-2 transition ${
                matched.has(t.id) ? "opacity-50" : "hover:scale-105"
              }`}
            >
              {show ? (
                <img src={t.image} alt={t.word} className="h-full w-full object-contain" />
              ) : (
                <span
                  className="flex h-full w-full items-center justify-center rounded-xl text-3xl font-black text-white"
                  style={{ background: "var(--playground-primary)" }}
                >
                  ?
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Odd one out ---------------- */

const ODD_ROUNDS = [
  { items: ["cat", "dog", "tiger", "duck"], odd: "tiger", reason: "tiger lives in the jungle" },
  { items: ["monkey", "snake", "tiger", "crab"], odd: "crab", reason: "crab lives in the ocean" },
  { items: ["fish", "octopus", "crab", "pig"], odd: "pig", reason: "pig is a pet" },
  { items: ["orange", "red", "yellow", "dog"], odd: "dog", reason: "dog is not a colour" },
  { items: ["big", "small", "tiger", "tall"], odd: "tiger", reason: "tiger is not a size" },
];

function imageFor(word: string) {
  return ALL.find((a) => a.word === word)?.image;
}

function OddOneOut() {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const r = ODD_ROUNDS[i];

  const next = () => {
    setPicked(null);
    setI((n) => (n + 1) % ODD_ROUNDS.length);
  };

  return (
    <div className="space-y-5">
      <TeacherNotes>
        Three things go together — one does not. Tap the odd one out and we will say why.
      </TeacherNotes>
      <p className="text-center font-bold text-[color:var(--playground-ink)]/70">
        Round {i + 1} / {ODD_ROUNDS.length} · Score {score}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {r.items.map((w) => {
          const img = imageFor(w);
          const isPicked = picked === w;
          const ok = isPicked && w === r.odd;
          const bad = isPicked && w !== r.odd;
          return (
            <button
              key={w}
              onClick={() => {
                if (picked) return;
                setPicked(w);
                speak(w);
                if (w === r.odd) setScore((s) => s + 1);
              }}
              className={`glass-card flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl p-3 transition ${
                ok ? "ring-4 ring-emerald-400" : bad ? "ring-4 ring-red-400" : "hover:scale-105"
              }`}
            >
              {img ? (
                <img src={img} alt={w} className="h-full w-full object-contain" />
              ) : (
                <span className="text-2xl font-black text-[color:var(--playground-ink)]">{w}</span>
              )}
              <span className="text-sm font-bold text-[color:var(--playground-ink)]">{w}</span>
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="text-center">
          <p className="font-bold text-[color:var(--playground-ink)]">
            {picked === r.odd ? "Correct! " : "Not quite. "}The odd one is <strong>{r.odd}</strong> — {r.reason}.
          </p>
          <button onClick={next} className="glass-card mt-2 rounded-2xl px-5 py-2 text-sm font-bold">
            Next round →
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Sentence scramble ---------------- */

const SCRAMBLE_ROUNDS = [
  ["It", "is", "a", "small", "white", "cat"],
  ["It", "is", "an", "orange", "tiger"],
  ["They", "see", "a", "red", "crab"],
  ["It", "is", "a", "big", "brown", "dog"],
];

function SentenceScramble() {
  const [round, setRound] = useState(0);
  const target = SCRAMBLE_ROUNDS[round];
  const scrambled = useMemo(() => {
    let s = shuffle(target);
    while (s.every((w, i) => w === target[i])) s = shuffle(target);
    return s;
  }, [round]);
  const [order, setOrder] = useState<string[]>([]);
  useEffect(() => setOrder([]), [round]);
  const remaining = scrambled.filter((w, i) => !order.includes(`${w}-${i}`));
  const built = order.map((k) => k.split("-")[0]);
  const correct = built.length === target.length && built.every((w, i) => w === target[i]);

  useEffect(() => {
    if (correct) {
      speak(target.join(" "));
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.5 } });
    }
  }, [correct]);

  return (
    <div className="space-y-5">
      <TeacherNotes>Tap the word tiles in the right order to make a sentence. Tap a built word to remove it.</TeacherNotes>
      <div className="glass-card min-h-16 rounded-2xl p-4">
        <p className="text-center text-2xl font-extrabold text-[color:var(--playground-ink)]">
          {built.length ? built.join(" ") : "Build the sentence here…"}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {scrambled.map((w, i) => {
          const key = `${w}-${i}`;
          const used = order.includes(key);
          return (
            <button
              key={key}
              disabled={used}
              onClick={() => {
                setOrder((o) => [...o, key]);
                speak(w);
              }}
              className={`rounded-xl px-4 py-2 text-lg font-bold transition ${
                used
                  ? "bg-[color:var(--playground-primary)]/20 text-[color:var(--playground-ink)]/40"
                  : "glass-card text-[color:var(--playground-ink)] hover:scale-105"
              }`}
            >
              {w}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setOrder([])}
          className="glass-card rounded-2xl px-4 py-2 text-sm font-bold"
        >
          Reset
        </button>
        {correct && (
          <button
            onClick={() => setRound((r) => (r + 1) % SCRAMBLE_ROUNDS.length)}
            className="shadow-playground rounded-2xl px-5 py-2 text-sm font-extrabold text-white"
            style={{ background: "var(--playground-primary)" }}
          >
            Next sentence →
          </button>
        )}
      </div>
      <p className="text-center text-sm font-bold text-[color:var(--playground-ink)]/60">
        Sentence {round + 1} / {SCRAMBLE_ROUNDS.length}
      </p>
    </div>
  );
}

/* ---------------- Spell it ---------------- */

const SPELL_WORDS = ["cat", "dog", "cow", "pig", "tiger", "fish", "crab"];

function SpellIt() {
  const [i, setI] = useState(0);
  const word = SPELL_WORDS[i];
  const card = ALL.find((a) => a.word === word);
  const letters = useMemo(() => {
    const ls = word.split("");
    let s = shuffle(ls);
    while (s.join("") === word) s = shuffle(ls);
    return s.map((l, idx) => ({ id: `${l}-${idx}`, l }));
  }, [i]);
  const [order, setOrder] = useState<string[]>([]);
  useEffect(() => setOrder([]), [i]);
  const built = order.map((id) => id.split("-")[0]).join("");
  const correct = built === word;

  useEffect(() => {
    if (correct) {
      speak(word);
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.5 } });
    }
  }, [correct]);

  return (
    <div className="space-y-5">
      <TeacherNotes>Look at the picture, hear the word, then tap the letters in the right order to spell it.</TeacherNotes>
      <div className="mx-auto max-w-xs text-center">
        {card && (
          <div className="glass-card flex aspect-square items-center justify-center rounded-3xl p-4">
            <img src={card.image} alt={word} className="h-full w-full object-contain" />
          </div>
        )}
        <button
          onClick={() => speak(word)}
          className="shadow-playground mt-2 inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-base font-extrabold text-white"
          style={{ background: "var(--playground-primary)" }}
        >
          <Volume2 className="h-5 w-5" /> Hear word
        </button>
      </div>
      <div className="glass-card min-h-14 rounded-2xl p-3 text-center text-3xl font-black tracking-[0.4em] text-[color:var(--playground-ink)]">
        {built || "____"}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {letters.map((t) => {
          const used = order.includes(t.id);
          return (
            <button
              key={t.id}
              disabled={used}
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
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setOrder([])}
          className="glass-card rounded-2xl px-4 py-2 text-sm font-bold"
        >
          Reset
        </button>
        {correct && (
          <button
            onClick={() => setI((n) => (n + 1) % SPELL_WORDS.length)}
            className="shadow-playground rounded-2xl px-5 py-2 text-sm font-extrabold text-white"
            style={{ background: "var(--playground-primary)" }}
          >
            Next word →
          </button>
        )}
      </div>
      <p className="text-center text-sm font-bold text-[color:var(--playground-ink)]/60">
        Word {i + 1} / {SPELL_WORDS.length}
      </p>
    </div>
  );
}
