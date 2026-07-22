import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LessonShell, type PhaseDef } from "@/playground-blueprint/components/LessonShell";
import { TeacherNotes } from "@/playground-blueprint/components/TeacherNotes";
import { JUNGLE_ANIMALS, COLORS } from "@/playground-blueprint/lib/jungle";
import { useLessonVocab } from "@/playground-blueprint/lib/useDynamicVocab";
import { speak } from "@/playground-blueprint/lib/speech";
import { Volume2 } from "lucide-react";
import confetti from "canvas-confetti";
import { PhonicsAnyPhase } from "@/playground-blueprint/components/phases/PhonicsAny";
import { MemoryMatchPhase } from "@/playground-blueprint/components/phases/MemoryMatch";
import { ChantPhase } from "@/playground-blueprint/components/phases/Chant";
import { BrainBreakPhase, TapToCatch, PicturePuzzle, GridMaze } from "@/playground-blueprint/components/phases/BrainBreak";
import { Puzzle, Hand, Footprints } from "lucide-react";

/**
 * ============================================================================
 *  LESSON 2 — JUNGLE · BLUEPRINT
 * ============================================================================
 *  Target total time: ~32–38 min (30+ min minimum).
 *  Phase timing budget:
 *    1. Vocabulary    ~3 min   — 3 jungle animals
 *    2. Modeling      ~3 min   — "It is a ___"
 *    3. Memory game   ~5 min   — picture↔word (new)
 *    4. Describe      ~4 min   — "It is ___ and ___"
 *    5. Phonics /m/   ~3 min
 *    6. Listen cage   ~5 min   — drag animal to jungle cage
 *    7. Spelling      ~4 min
 *    8. Coloring      ~4 min
 *    9. Chant         ~3 min   — color + animal chant (new)
 *    10. Cool down    ~2 min
 *  Total: ~36 min.
 * ============================================================================
 */

import monkeyImg from "@/playground-blueprint/assets/animals/monkey.png";
import moonImg from "@/playground-blueprint/assets/phonics/moon.png";
import mouseImg from "@/playground-blueprint/assets/phonics/mouse.png";

const JUNGLE_PHONICS = {
  letter: "M",
  sound: "mmm mmm mmm",
  label: "/m/",
  words: [
    { name: "monkey", emoji: "🐒", image: monkeyImg },
    { name: "moon", emoji: "🌙", image: moonImg },
    { name: "mouse", emoji: "🐭", image: mouseImg },
  ],
  hint: "Stretch the /m/ sound with closed lips. Have the student hum it before saying each word.",
};

const PHASES: PhaseDef[] = [
  { id: "vocab", label: "Vocabulary" },
  { id: "modeling", label: "Modeling" },
  { id: "memory", label: "Memory game" },
  { id: "describe", label: "Describe" },
  { id: "phonics", label: "Phonics /m/" },
  { id: "practice", label: "Listen cage" },
  { id: "spell", label: "Spelling" },
  { id: "color", label: "Coloring" },
  { id: "chant", label: "Chant" },
  { id: "break", label: "Brain break" },
  { id: "cool", label: "Cool down" },
];

const FALLBACK_jungleChant = [
  "It is a tiger. Orange and black!",
  "It is a monkey. Brown and yellow!",
  "It is a snake. Green and yellow!",
];

/** Build chant lines from AI vocab using L2's sentence frame ("It is a ___."). */
function buildJungleChant(vocab: { name: string }[]): string[] {
  if (!vocab.length) return FALLBACK_jungleChant;
  return vocab.slice(0, 3).map((v) => {
    const article = /^[aeiou]/i.test(v.name) ? "an" : "a";
    return `It is ${article} ${v.name}.`;
  });
}

const STORAGE_KEY = "playground-jungle-progress";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function scrambleDifferent(arr: string[]): string[] {
  if (arr.length < 2) return arr;
  const original = arr.join("");
  for (let i = 0; i < 20; i++) {
    const s = shuffle(arr);
    if (s.join("") !== original) return s;
  }
  return [arr[1], arr[0], ...arr.slice(2)];
}

function JungleLesson() {
  const [idx, setIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const vocab = useLessonVocab(2, JUNGLE_ANIMALS);
  const jungleChant = buildJungleChant(vocab);


  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { idx: number; completed: number[] };
        setIdx(p.idx);
        setCompleted(new Set(p.completed));
      }
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ idx, completed: [...completed] }));
    } catch {
      /* ignore */
    }
  }, [idx, completed]);

  const markComplete = useCallback((i: number) => setCompleted((c) => new Set(c).add(i)), []);

  const titles = [
    { t: "Jungle friends 🌴", s: "Three new animals" },
    { t: "In the jungle", s: "Listen: It is a ___" },
    { t: "Memory game 🧠", s: "Match the picture and the word" },
    { t: "Describe it!", s: "It is a ___. It is ___ and ___." },
    { t: "Phonics /m/ 🐒", s: "Today's sound: mmm" },
    { t: "Listen & cage 🪤", s: "Drag the right animal into the jungle cage" },
    { t: "Spell the word", s: "Animals and colors" },
    { t: "Color it in 🎨", s: "Pick a color, tap a part" },
    { t: "Sing & chant 🎵", s: "Repeat after me" },
    { t: "Brain break 🧩", s: "Puzzle or maze — your pick!" },
    { t: "Cool down", s: "You did it!" },
  ];

  return (
    <LessonShell
      phases={PHASES}
      currentIndex={idx}
      onPrev={() => setIdx((i) => Math.max(0, i - 1))}
      onNext={() => setIdx((i) => Math.min(PHASES.length - 1, i + 1))}
      title={titles[idx].t}
      subtitle={titles[idx].s}
      canAdvance={true}
      finishedCelebration={idx === PHASES.length - 1 && completed.has(idx)}
    >
      <LessonMapNotes currentIndex={idx} />

      {idx === 0 && <VocabPhase onComplete={() => markComplete(0)} />}
      {idx === 1 && <ModelingPhase onComplete={() => markComplete(1)} />}
      {idx === 2 && <MemoryMatchPhase items={vocab} pairs={3} onComplete={() => markComplete(2)} />}
      {idx === 3 && <DescribePhase onComplete={() => markComplete(3)} />}
      {idx === 4 && <PhonicsAnyPhase config={JUNGLE_PHONICS} onComplete={() => markComplete(4)} />}
      {idx === 5 && <PracticePhase onComplete={() => markComplete(5)} />}
      {idx === 6 && <SpellingPhase onComplete={() => markComplete(6)} />}
      {idx === 7 && <ColoringPhase onComplete={() => markComplete(7)} />}
      {idx === 8 && <ChantPhase lines={jungleChant} onComplete={() => markComplete(8)} />}
      {idx === 9 && (
        <BrainBreakPhase
          onComplete={() => markComplete(9)}
          games={[
            {
              id: "butterflies",
              label: "Catch butterflies 🦋",
              icon: <Hand className="h-4 w-4" />,
              render: ({ onSolved }) => (
                <TapToCatch
                  onSolved={onSolved}
                  config={{
                    emojis: ["🦋", "🐛", "🪲"],
                    target: 6,
                    cta: "Tap the butterflies fluttering in the jungle!",
                    background: "bg-emerald-100/70",
                  }}
                />
              ),
            },
            {
              id: "maze",
              label: "Jungle path 🐾",
              icon: <Footprints className="h-4 w-4" />,
              render: ({ onSolved }) => <GridMaze emoji="🐒" goal="🍌" onSolved={onSolved} />,
            },
            {
              id: "puzzle",
              label: "Jungle Puzzle",
              icon: <Puzzle className="h-4 w-4" />,
              render: ({ onSolved }) => (
                <PicturePuzzle
                  image={vocab[0].image}
                  label={vocab[0].name}
                  onSolved={onSolved}
                />
              ),
            },
          ]}
        />
      )}
      {idx === 10 && <CoolDown onComplete={() => markComplete(10)} />}
    </LessonShell>
  );
}

/* ------------------------------------------------------------------ */
/* LESSON MAP — shown above every phase as a collapsible teacher note */
/* ------------------------------------------------------------------ */
function LessonMapNotes({ currentIndex }: { currentIndex: number }) {
  return (
    <TeacherNotes title="📍 Lesson map (teacher only)">
      <p className="mb-2 font-semibold">
        Unit: <span className="text-[color:var(--playground-primary)]">Jungle</span> · Lesson 2 ·
        Ages 4–9 (Pre-A / A1 / A2) · ~25 minutes
      </p>
      <p className="mb-2">
        <strong>Goals:</strong> introduce 3 new jungle animals (monkey, snake, tiger) with minimal
        vocabulary load, expand the Lesson 1 sentence frame
        <em> "It is a ___"</em> with color descriptions
        <em> "It is ___ and ___"</em>, and revisit one phonic CVC pattern.
      </p>
      <ol className="ml-4 list-decimal space-y-1">
        {[
          "Vocabulary — 3 animals + tap-match (limit input on purpose).",
          "Modeling — jungle scene, hear modeled sentences before output.",
          "Describe — colors + adjective frame; teacher elicits, then student builds.",
          "Practice — listen & choose to consolidate.",
          "Spelling — scrambled letters for letter recognition.",
          "Cool down — quick reward & re-cap.",
        ].map((step, i) => (
          <li
            key={i}
            className={i === currentIndex ? "font-bold text-[color:var(--playground-primary)]" : ""}
          >
            {step}
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs italic">
        Differentiation: For 4-yr-olds, stop after Describe and skip Spelling. For 7–9 yr olds, ask
        follow-ups ("Is it big or small?").
      </p>
    </TeacherNotes>
  );
}

/* ------------------------------ Phases ----------------------------- */

function VocabPhase({ onComplete }: { onComplete: () => void }) {
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [stage, setStage] = useState<"listen" | "match">("listen");
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [chips] = useState(() => shuffle(JUNGLE_ANIMALS.map((a) => a.name)));

  const allSeen = seen.size === JUNGLE_ANIMALS.length;
  const allMatched = matched.size === JUNGLE_ANIMALS.length;

  useEffect(() => {
    if (allSeen) onComplete();
  }, [allSeen, onComplete]);

  const tap = (name: string) => {
    speak(name);
    setSeen((s) => new Set(s).add(name));
  };
  const tapChip = (name: string) => {
    if (matched.has(name)) return;
    speak(name);
    setSelected(name);
  };
  const dropOn = (name: string) => {
    if (!selected) {
      speak(name);
      return;
    }
    if (selected === name) {
      speak(name);
      setMatched((m) => new Set(m).add(name));
      setSelected(null);
    } else {
      setWrong(name);
      setTimeout(() => setWrong(null), 400);
    }
  };

  return (
    <div>
      <TeacherNotes title="📝 Activity notes — Vocabulary">
        <p>
          <strong>Aim:</strong> recognise 3 new nouns by ear.
          <strong> Time:</strong> 3–4 min.
        </p>
        <p>
          Model each word twice (slow → normal). Have the student repeat after the audio. Praise
          effort, not accuracy. Then tap "Play matching game" to consolidate.
        </p>
      </TeacherNotes>

      {stage === "listen" ? (
        <>
          <p className="mb-6 text-center text-xl font-semibold text-[color:var(--playground-ink)]/80">
            Tap each jungle friend 🐒🐍🐯
          </p>
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {JUNGLE_ANIMALS.map((a) => {
              const s = seen.has(a.name);
              return (
                <button
                  key={a.name}
                  onClick={() => tap(a.name)}
                  className="glass-card relative flex flex-col items-center gap-3 rounded-3xl p-4 transition hover:scale-105 active:scale-95"
                  style={{ outline: s ? "3px solid var(--playground-primary)" : "none" }}
                >
                  <img
                    src={a.image}
                    alt={a.name}
                    className="h-28 w-28 object-contain sm:h-36 sm:w-36"
                  />
                  <span className="text-2xl font-extrabold capitalize text-[color:var(--playground-ink)]">
                    {a.name}
                  </span>
                  {s && (
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--playground-primary)] text-white">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-base font-medium text-[color:var(--playground-ink)]/60">
              {seen.size} / {JUNGLE_ANIMALS.length} heard
            </p>
            <button
              onClick={() => setStage("match")}
              disabled={!allSeen}
              className="shadow-playground rounded-2xl px-8 py-4 text-lg font-extrabold text-white transition hover:scale-105 disabled:opacity-30"
              style={{ background: "var(--playground-primary)" }}
            >
              Play matching game →
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-6 text-center text-xl font-semibold text-[color:var(--playground-ink)]/80">
            Tap a word, then tap the matching animal 🎯
          </p>
          <div className="grid grid-cols-3 gap-4">
            {JUNGLE_ANIMALS.map((a) => {
              const m = matched.has(a.name);
              return (
                <button
                  key={a.name}
                  onClick={() => dropOn(a.name)}
                  disabled={m}
                  className={`glass-card flex flex-col items-center gap-2 rounded-3xl p-4 transition hover:scale-105 ${wrong === a.name ? "animate-lesson-shake" : ""}`}
                  style={{
                    outline: m ? "3px solid var(--playground-primary)" : "none",
                    background: m
                      ? "color-mix(in oklab, var(--playground-primary) 18%, white)"
                      : undefined,
                  }}
                >
                  <img
                    src={a.image}
                    alt={a.name}
                    className="h-24 w-24 object-contain sm:h-32 sm:w-32"
                  />
                  {m && (
                    <span className="text-xl font-extrabold capitalize text-[color:var(--playground-primary)]">
                      {a.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {chips.map((name) => {
              const used = matched.has(name);
              const isSel = selected === name;
              return (
                <button
                  key={name}
                  onClick={() => tapChip(name)}
                  disabled={used}
                  className="glass-card rounded-2xl px-5 py-3 text-2xl font-extrabold capitalize transition hover:scale-105 disabled:opacity-20"
                  style={{
                    background: isSel ? "var(--playground-primary)" : undefined,
                    color: isSel ? "white" : "var(--playground-ink)",
                    transform: isSel ? "scale(1.08)" : undefined,
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ModelingPhase({ onComplete }: { onComplete: () => void }) {
  const [heard, setHeard] = useState<Set<string>>(new Set());
  const done = heard.size === JUNGLE_ANIMALS.length;
  useEffect(() => {
    if (done) {
      const id = setTimeout(onComplete, 500);
      return () => clearTimeout(id);
    }
  }, [done, onComplete]);
  const tap = (name: string) => {
    speak(`It is a ${name}`);
    setHeard((s) => new Set(s).add(name));
  };
  return (
    <div>
      <TeacherNotes title="📝 Activity notes — Modeling">
        <p>
          <strong>Aim:</strong> model the target sentence frame before any student production.
          <strong> Time:</strong> 2–3 min.
        </p>
        <p>Tap each animal; have student echo the full sentence chorally.</p>
      </TeacherNotes>
      <p className="mb-6 text-center text-xl font-semibold text-[color:var(--playground-ink)]/80">
        Tap each friend to hear: <em>"It is a ___"</em>
      </p>
      <div
        className="relative mx-auto overflow-hidden rounded-[2rem] p-6"
        style={{
          background:
            "radial-gradient(circle at 20% 90%, #6dd56d 0%, transparent 55%), radial-gradient(circle at 85% 95%, #4fb86b 0%, transparent 60%), linear-gradient(180deg, #bfeaff 0%, #d6f5d6 60%, #8ed18e 100%)",
          minHeight: "380px",
        }}
      >
        <div className="absolute right-6 top-4 h-16 w-16 rounded-full bg-yellow-300 shadow-[0_0_30px_10px_rgba(253,224,71,0.5)]" />
        <div className="absolute left-2 top-8 text-5xl">🌴</div>
        <div className="absolute right-10 top-24 text-4xl">🌳</div>
        <div className="absolute left-1/2 top-2 text-4xl">🌿</div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {JUNGLE_ANIMALS.map((a) => {
            const h = heard.has(a.name);
            return (
              <button
                key={a.name}
                onClick={() => tap(a.name)}
                className="group relative flex flex-col items-center gap-2 rounded-3xl p-2 transition hover:scale-105 active:scale-95"
              >
                <div
                  className="relative rounded-2xl bg-white px-3 py-2 text-sm font-extrabold text-[color:var(--playground-ink)] shadow-md sm:text-base"
                  style={{ outline: h ? "3px solid var(--playground-primary)" : "none" }}
                >
                  It is a{" "}
                  <span className="capitalize text-[color:var(--playground-primary)]">
                    {a.name}
                  </span>
                  !
                  <span
                    className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white"
                    aria-hidden
                  />
                </div>
                <img
                  src={a.image}
                  alt={a.name}
                  className="h-24 w-24 object-contain sm:h-28 sm:w-28"
                />
                {h && (
                  <span className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--playground-primary)] text-sm text-white">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-6 text-center text-base font-medium text-[color:var(--playground-ink)]/60">
        {heard.size} / {JUNGLE_ANIMALS.length} heard
      </p>
    </div>
  );
}

/* Describe: pick the two correct colors for each animal */
function DescribePhase({ onComplete }: { onComplete: () => void }) {
  const [round, setRound] = useState(0);
  const animal = JUNGLE_ANIMALS[round];
  const [picked, setPicked] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);

  const choices = useMemo(() => {
    const wrongs = shuffle(COLORS.filter((c) => !animal.colors.includes(c.name))).slice(0, 2);
    return shuffle([...animal.colors.map((n) => COLORS.find((c) => c.name === n)!), ...wrongs]);
  }, [animal]);

  const done = picked.length === 2 && animal.colors.every((c) => picked.includes(c));

  useEffect(() => {
    if (done) {
      speak(`It is a ${animal.name}. It is ${picked[0]} and ${picked[1]}.`);
      const id = setTimeout(() => {
        if (round + 1 >= JUNGLE_ANIMALS.length) onComplete();
        else {
          setRound((r) => r + 1);
          setPicked([]);
        }
      }, 2400);
      return () => clearTimeout(id);
    }
  }, [done, animal, picked, round, onComplete]);

  const pick = (name: string) => {
    if (picked.includes(name)) return;
    if (animal.colors.includes(name)) {
      speak(name);
      setPicked((p) => [...p, name]);
    } else {
      setWrong(name);
      setTimeout(() => setWrong(null), 400);
    }
  };

  return (
    <div>
      <TeacherNotes title="📝 Activity notes — Describe">
        <p>
          <strong>Aim:</strong> chain the new frame "It is ___ and ___" onto Lesson 1's "It is a
          ___". <strong>Time:</strong> 4–5 min.
        </p>
        <p>
          Elicit the colors first ("What color?"). Two correct colors per animal. Wrong colors
          gently shake — no negative audio. Younger students can stop here.
        </p>
      </TeacherNotes>

      <div className="text-center">
        <img
          src={animal.image}
          alt={animal.name}
          className="mx-auto h-32 w-32 object-contain sm:h-40 sm:w-40"
        />
        <p className="mt-4 text-3xl font-extrabold text-[color:var(--playground-ink)] sm:text-4xl">
          It is a{" "}
          <span className="capitalize text-[color:var(--playground-primary)]">{animal.name}</span>.
        </p>
        <p className="mt-2 text-2xl font-bold text-[color:var(--playground-ink)]/80 sm:text-3xl">
          It is{" "}
          <span className="inline-block min-w-24 rounded-xl bg-white/60 px-3 py-1 align-middle capitalize">
            {picked[0] || "___"}
          </span>{" "}
          and{" "}
          <span className="inline-block min-w-24 rounded-xl bg-white/60 px-3 py-1 align-middle capitalize">
            {picked[1] || "___"}
          </span>
          .
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {choices.map((c) => (
            <button
              key={c.name}
              onClick={() => pick(c.name)}
              disabled={picked.includes(c.name)}
              className={`glass-card flex items-center gap-3 rounded-2xl px-5 py-3 text-xl font-bold capitalize transition hover:scale-105 disabled:opacity-30 ${wrong === c.name ? "animate-lesson-shake" : ""}`}
            >
              <span
                className="h-8 w-8 rounded-full border border-white/70 shadow-inner"
                style={{ background: c.hex }}
              />
              {c.name}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm font-medium text-[color:var(--playground-ink)]/60">
          Animal {round + 1} of {JUNGLE_ANIMALS.length}
        </p>
      </div>
    </div>
  );
}

/* Listen & basket: hear the word, drag the matching animal into the basket */
function PracticePhase({ onComplete }: { onComplete: () => void }) {
  const order = useMemo(() => shuffle(JUNGLE_ANIMALS), []);
  const [round, setRound] = useState(0);
  const [dragName, setDragName] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [vanished, setVanished] = useState<Set<string>>(new Set());
  const [overBasket, setOverBasket] = useState(false);

  const target = order[round];

  useEffect(() => {
    if (!target) return;
    const id = setTimeout(() => speak(target.name), 250);
    return () => clearTimeout(id);
  }, [target]);

  const drop = (name: string) => {
    setOverBasket(false);
    if (name === target.name) {
      speak(name);
      setVanished((v) => new Set(v).add(name));
      setTimeout(() => {
        if (round + 1 >= order.length) onComplete();
        else setRound((r) => r + 1);
      }, 700);
    } else {
      setWrong(name);
      setTimeout(() => setWrong(null), 400);
    }
  };

  return (
    <div>
      <TeacherNotes title="📝 Activity notes — Listen cage">
        <p>
          <strong>Aim:</strong> listening discrimination through drag-and-drop.
          <strong> Time:</strong> 3 min.
        </p>
        <p>
          Jungle theme = a cage / trap. (Food topic → fridge. Fruit topic → basket.) Tap the speaker
          to hear the animal, then drag the matching picture into the cage. Correct animal vanishes
          inside; wrong animal gently shakes.
        </p>
      </TeacherNotes>
      <div className="text-center">
        <button
          onClick={() => speak(target.name)}
          className="shadow-playground mx-auto mt-2 flex h-24 w-24 items-center justify-center rounded-full text-white"
          style={{ background: "var(--playground-primary)" }}
          aria-label="Play sound"
        >
          <Volume2 className="h-10 w-10" />
        </button>
        <p className="mt-3 text-base font-medium text-[color:var(--playground-ink)]/70">
          Hear it, then drag the animal into the cage 🪤
        </p>

        <div className="mt-6 grid grid-cols-3 gap-4">
          {JUNGLE_ANIMALS.map((a) => {
            const gone = vanished.has(a.name);
            return (
              <button
                key={a.name}
                draggable={!gone}
                onDragStart={() => setDragName(a.name)}
                onDragEnd={() => setDragName(null)}
                onClick={() => drop(a.name)}
                className={`glass-card rounded-3xl p-3 transition hover:scale-105 ${wrong === a.name ? "animate-lesson-shake" : ""}`}
                style={{
                  opacity: gone ? 0 : 1,
                  transform: gone ? "scale(0.2) translateY(120px)" : undefined,
                  transition: "opacity .5s, transform .5s",
                  pointerEvents: gone ? "none" : undefined,
                  cursor: "grab",
                }}
                aria-label={`Drag ${a.name}`}
              >
                <img
                  src={a.image}
                  alt={a.name}
                  className="h-24 w-24 object-contain sm:h-32 sm:w-32"
                />
              </button>
            );
          })}
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setOverBasket(true);
          }}
          onDragLeave={() => setOverBasket(false)}
          onDrop={(e) => {
            e.preventDefault();
            if (dragName) drop(dragName);
          }}
          className="relative mx-auto mt-8 flex w-full max-w-2xl items-end justify-center overflow-hidden rounded-3xl text-7xl transition"
          style={{
            height: "180px",
            background: overBasket
              ? "color-mix(in oklab, var(--playground-primary) 30%, white)"
              : "color-mix(in oklab, var(--playground-primary) 15%, white)",
            border: "4px dashed var(--playground-primary)",
            transform: overBasket ? "scale(1.02)" : undefined,
            backgroundImage:
              "repeating-linear-gradient(90deg, color-mix(in oklab, var(--playground-primary) 60%, white) 0 4px, transparent 4px 38px)",
          }}
          aria-label="Jungle cage"
        >
          <span className="absolute left-4 top-3 rounded-full bg-white/80 px-3 py-1 text-sm font-extrabold text-[color:var(--playground-ink)]">
            🪤 Jungle cage
          </span>
          <span className="mb-4 drop-shadow">🐾</span>
        </div>

        <p className="mt-4 text-sm font-medium text-[color:var(--playground-ink)]/60">
          {round + 1} of {order.length}
        </p>
      </div>
    </div>
  );
}

/* Spell BOTH the animal noun and one of its color words */
type SpellItem = { word: string; letters: string[]; image?: string; swatch?: string };
function SpellingPhase({ onComplete }: { onComplete: () => void }) {
  const rounds = useMemo<SpellItem[]>(() => {
    const items: SpellItem[] = [];
    JUNGLE_ANIMALS.forEach((a) => {
      items.push({ word: a.name, letters: a.name.split(""), image: a.image });
      const c = a.colors[0];
      const swatch = COLORS.find((cc) => cc.name === c)?.hex;
      items.push({ word: c, letters: c.split(""), swatch });
    });
    return shuffle(items).slice(0, 4);
  }, []);

  const [idx, setIdx] = useState(0);
  const item = rounds[idx];
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [slots, setSlots] = useState<(string | null)[]>([]);
  const [wrongAt, setWrongAt] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    setScrambled(scrambleDifferent(item.letters));
    setSlots(Array(item.letters.length).fill(null));
    setSolved(false);
    speak(item.word);
  }, [item]);

  const nextEmpty = slots.findIndex((s) => s === null);

  const tapLetter = (i: number) => {
    if (solved || nextEmpty < 0) return;
    const letter = scrambled[i];
    if (letter === item.letters[nextEmpty]) {
      const ns = [...slots];
      ns[nextEmpty] = letter;
      const nsc = scrambled.map((l, j) => (j === i ? "" : l));
      setSlots(ns);
      setScrambled(nsc);
      if (ns.every((s) => s)) {
        setSolved(true);
        speak(item.word);
        setTimeout(() => {
          if (idx + 1 >= rounds.length) onComplete();
          else setIdx((j) => j + 1);
        }, 1400);
      }
    } else {
      setWrongAt(i);
      setTimeout(() => setWrongAt(null), 400);
    }
  };

  return (
    <div>
      <TeacherNotes title="📝 Activity notes — Spelling">
        <p>
          <strong>Aim:</strong> letter recognition + spelling for BOTH animals and colors.
          <strong> Time:</strong> 4–5 min.
        </p>
        <p>
          4 mixed rounds drawn from animal nouns and color words. Skip for ages 4–5 if attention
          fades.
        </p>
      </TeacherNotes>
      <div className="text-center">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="mx-auto h-28 w-28 object-contain sm:h-36 sm:w-36"
          />
        ) : (
          <div
            className="mx-auto h-24 w-24 rounded-3xl border-4 border-white/70 shadow-inner sm:h-32 sm:w-32"
            style={{ background: item.swatch }}
            aria-label={`${item.word} swatch`}
          />
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {slots.map((s, i) => (
            <div
              key={i}
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-black sm:h-20 sm:w-20"
              style={{
                background: s
                  ? "var(--playground-primary)"
                  : "color-mix(in oklab, var(--playground-primary) 15%, white)",
                color: s ? "white" : "transparent",
                border: "3px dashed color-mix(in oklab, var(--playground-primary) 40%, white)",
              }}
            >
              {s || "_"}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {scrambled.map((l, i) =>
            l ? (
              <button
                key={i}
                onClick={() => tapLetter(i)}
                className={`glass-card h-16 w-16 rounded-2xl text-3xl font-black text-[color:var(--playground-ink)] transition hover:scale-105 sm:h-20 sm:w-20 ${wrongAt === i ? "animate-lesson-shake" : ""}`}
              >
                {l}
              </button>
            ) : (
              <div key={i} className="h-16 w-16 sm:h-20 sm:w-20" />
            ),
          )}
        </div>
        {solved && (
          <p className="animate-lesson-pop mt-6 text-4xl font-black text-[color:var(--playground-primary)]">
            🎉 {item.word}!
          </p>
        )}
        <p className="mt-6 text-sm font-medium text-[color:var(--playground-ink)]/60">
          Word {idx + 1} of {rounds.length}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ Coloring (optional, end-of-lesson) ----------------------------- */
type Part = { id: string; label: string; target: string; d?: string; cx?: number; cy?: number; r?: number };

// One simple cartoon "dog/animal" silhouette with named parts.
// Built from SVG primitives so any animal vibe works.
// Cute cartoon tiger built from clean primitives — much friendlier than the previous silhouette.
const COLORING_PARTS: Part[] = [
  // Tail: long curved swoosh behind the body
  { id: "tail", label: "Tail", target: "orange", d: "M120,300 Q40,290 50,210 Q55,170 95,170 Q110,170 110,195 Q110,225 85,235 Q75,240 80,260 Q90,285 130,285 Z" },
  // Back legs
  { id: "legBL", label: "Back leg (left)", target: "orange", d: "M170,330 Q160,330 160,355 L160,395 Q160,410 180,410 L210,410 Q225,410 225,395 L225,355 Q225,330 215,330 Z" },
  { id: "legBR", label: "Back leg (right)", target: "orange", d: "M300,330 Q290,330 290,355 L290,395 Q290,410 310,410 L340,410 Q355,410 355,395 L355,355 Q355,330 345,330 Z" },
  // Body: rounded oval
  { id: "body", label: "Body", target: "orange", d: "M150,260 Q150,180 260,180 Q370,180 370,260 Q370,340 260,340 Q150,340 150,260 Z" },
  // Head: big round friendly head
  { id: "head", label: "Head", target: "orange", d: "M260,60 Q360,60 360,160 Q360,235 260,235 Q160,235 160,160 Q160,60 260,60 Z" },
  // Ears
  { id: "earL", label: "Left ear", target: "brown", d: "M175,80 Q160,40 200,45 Q215,55 210,90 Z" },
  { id: "earR", label: "Right ear", target: "brown", d: "M345,80 Q360,40 320,45 Q305,55 310,90 Z" },
  // Muzzle / mouth area (white)
  { id: "muzzle", label: "Muzzle", target: "white", d: "M220,165 Q220,135 260,135 Q300,135 300,165 Q300,200 260,200 Q220,200 220,165 Z" },
  // Eyes
  { id: "eyeL", label: "Left eye", target: "black", cx: 225, cy: 130, r: 10 },
  { id: "eyeR", label: "Right eye", target: "black", cx: 295, cy: 130, r: 10 },
  // Nose
  { id: "nose", label: "Nose", target: "black", cx: 260, cy: 158, r: 9 },
];

const PALETTE = ["orange", "brown", "yellow", "green", "black", "white"] as const;

function ColoringPhase({ onComplete }: { onComplete: () => void }) {
  const [active, setActive] = useState<string>("orange");
  const [fills, setFills] = useState<Record<string, string>>({});
  const [wrong, setWrong] = useState<string | null>(null);

  const correct = COLORING_PARTS.filter((p) => fills[p.id] === p.target).length;
  const done = correct === COLORING_PARTS.length;

  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  const paint = (p: Part) => {
    if (active === p.target) {
      setFills((f) => ({ ...f, [p.id]: active }));
      speak(`${active} ${p.label}`);
    } else {
      setFills((f) => ({ ...f, [p.id]: active }));
      setWrong(p.id);
      setTimeout(() => setWrong(null), 350);
    }
  };

  const swatchHex = (name: string) => COLORS.find((c) => c.name === name)?.hex ?? "#999";

  return (
    <div>
      <TeacherNotes title="📝 Activity notes — Coloring (extra time)">
        <p>
          <strong>Aim:</strong> reactivate color vocab through play. Optional — use only if there is
          time at the end of class.
        </p>
        <p>
          Read the target chart aloud ("Color the body orange…"). The student picks a color from the
          palette, then taps the body part. Each tap is spoken back.
        </p>
      </TeacherNotes>

      <div className="grid gap-6 lg:grid-cols-[1fr,260px]">
        <div className="glass-card rounded-3xl p-4">
          <svg
            viewBox="0 0 500 420"
            className="mx-auto w-full max-w-xl"
            role="img"
            aria-label="Color the animal"
          >
            {COLORING_PARTS.map((p) => {
              const fill = fills[p.id] ? swatchHex(fills[p.id]) : "#ffffff";
              const isWrong = wrong === p.id;
              const common = {
                onClick: () => paint(p),
                fill,
                stroke: "#1f2937",
                strokeWidth: 3,
                style: {
                  cursor: "pointer",
                  transition: "fill .2s, transform .2s",
                  transformOrigin: "center",
                  transform: isWrong ? "scale(0.97)" : undefined,
                  opacity: isWrong ? 0.7 : 1,
                },
              } as const;
              return p.d ? (
                <path key={p.id} d={p.d} {...common} />
              ) : (
                <circle key={p.id} cx={p.cx} cy={p.cy} r={p.r} {...common} />
              );
            })}
          </svg>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[color:var(--playground-ink)]/70">
            🎨 Pick a color
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PALETTE.map((name) => (
              <button
                key={name}
                onClick={() => {
                  setActive(name);
                  speak(name);
                }}
                className="glass-card flex flex-col items-center gap-1 rounded-2xl p-2 transition hover:scale-105"
                style={{
                  outline: active === name ? "3px solid var(--playground-primary)" : "none",
                }}
              >
                <span
                  className="h-10 w-10 rounded-full border border-white/70 shadow-inner"
                  style={{ background: swatchHex(name) }}
                />
                <span className="text-xs font-bold capitalize text-[color:var(--playground-ink)]">
                  {name}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-4 text-sm font-bold uppercase tracking-widest text-[color:var(--playground-ink)]/70">
            Target
          </p>
          <ul className="mt-1 space-y-1 text-sm text-[color:var(--playground-ink)]/80">
            {COLORING_PARTS.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full border"
                  style={{ background: swatchHex(p.target) }}
                />
                <span className="capitalize">{p.label}</span> —{" "}
                <span className="capitalize">{p.target}</span>
                {fills[p.id] === p.target && (
                  <span className="text-[color:var(--playground-primary)]">✓</span>
                )}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm font-medium text-[color:var(--playground-ink)]/60">
            {correct} / {COLORING_PARTS.length} correctly colored
          </p>
        </div>
      </div>
    </div>
  );
}

function CoolDown({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    onComplete();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.4 },
      colors: ["#FE6A2F", "#FEFBDD", "#22C55E"],
    });
  }, [onComplete]);
  return (
    <div>
      <TeacherNotes title="📝 Activity notes — Cool down">
        <p>
          <strong>Aim:</strong> close on a positive note; reactivate language casually.
          <strong> Time:</strong> 2 min.
        </p>
        <p>Re-ask "What is it?" pointing at each animal. Praise specifically.</p>
      </TeacherNotes>
      <div className="text-center">
        <p className="text-6xl">🎉🌴🐒🐍🐯</p>
        <h2 className="mt-4 text-4xl font-black text-[color:var(--playground-ink)]">
          Amazing job!
        </h2>
        <p className="mt-2 text-lg text-[color:var(--playground-ink)]/70">
          You learned 3 new jungle friends and described them with colors.
        </p>
        <Link
          to="/"
          className="shadow-playground mt-8 inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-lg font-extrabold text-white transition hover:scale-105"
          style={{ background: "var(--playground-primary)" }}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default JungleLesson;
