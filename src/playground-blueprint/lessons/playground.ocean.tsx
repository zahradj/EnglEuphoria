import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LessonShell, type PhaseDef } from "@/playground-blueprint/components/LessonShell";
import { TeacherNotes } from "@/playground-blueprint/components/TeacherNotes";
import { OCEAN_ANIMALS, OCEAN_COLORS, SIZES, article, type OceanAnimal } from "@/playground-blueprint/lib/ocean";
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
 *  LESSON 3 — OCEAN · BLUEPRINT
 * ============================================================================
 *  Target total time: ~32–38 min (30+ min minimum).
 *  Phase timing budget:
 *    1. Vocabulary    ~3 min   — 3 ocean animals
 *    2. Modeling      ~3 min   — "It is a ___"
 *    3. Memory game   ~5 min   — picture↔word (new)
 *    4. Describe      ~4 min   — color recall
 *    5. Phonics /f/   ~3 min
 *    6. Build         ~5 min   — size + color + animal
 *    7. Practice      ~4 min   — listen, pick, match
 *    8. Spelling      ~4 min
 *    9. Chant         ~3 min   — full sentence chant (new)
 *    10. Cool down    ~2 min
 *  Total: ~36 min.
 * ============================================================================
 */

import fishImg from "@/playground-blueprint/assets/animals/ocean-fish.png";
import frogImg from "@/playground-blueprint/assets/phonics/frog.png";
import footImg from "@/playground-blueprint/assets/phonics/foot.png";

const OCEAN_PHONICS = {
  letter: "F",
  sound: "fff fff fff",
  label: "/f/",
  words: [
    { name: "fish", emoji: "🐟", image: fishImg },
    { name: "frog", emoji: "🐸", image: frogImg },
    { name: "foot", emoji: "🦶", image: footImg },
  ],
  hint: "Top teeth on bottom lip and blow gently — /f/ is a quiet, breathy sound.",
};

const PHASES: PhaseDef[] = [
  { id: "vocab", label: "Vocabulary" },
  { id: "modeling", label: "Modeling" },
  { id: "memory", label: "Memory game" },
  { id: "describe", label: "Describe" },
  { id: "phonics", label: "Phonics /f/" },
  { id: "build", label: "Build sentence" },
  { id: "practice", label: "Practice" },
  { id: "spell", label: "Spelling" },
  { id: "chant", label: "Chant" },
  { id: "break", label: "Brain break" },
  { id: "cool", label: "Cool down" },
];

const FALLBACK_oceanChant = [
  "It is a small orange fish.",
  "It is a big purple octopus.",
  "It is a small red crab.",
];

/** Build chant lines from AI vocab using L3's sentence frame ("It is a ___."). */
function buildOceanChant(vocab: { name: string }[]): string[] {
  if (!vocab.length) return FALLBACK_oceanChant;
  return vocab.slice(0, 3).map((v) => `It is ${article(v.name)} ${v.name}.`);
}

const STORAGE_KEY = "playground-ocean-progress";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function OceanLesson() {
  const [idx, setIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const vocab = useLessonVocab(3, OCEAN_ANIMALS);
  const oceanChant = buildOceanChant(vocab);

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
    { t: "Ocean friends 🌊", s: "Three sea animals" },
    { t: "Under the sea", s: "Listen: It is a ___" },
    { t: "Memory game 🧠", s: "Match the picture and the word" },
    { t: "Add a color", s: "It is ___. (Lesson 2 review)" },
    { t: "Phonics /f/ 🐟", s: "Today's sound: fff" },
    { t: "Build the sentence", s: "It is a [size] [color] [animal]" },
    { t: "Let's practise!", s: "Listen, pick, and match" },
    { t: "Spell the word", s: "Place the letters in order" },
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
      {idx === 4 && <PhonicsAnyPhase config={OCEAN_PHONICS} onComplete={() => markComplete(4)} />}
      {idx === 5 && <BuildPhase onComplete={() => markComplete(5)} />}
      {idx === 6 && <PracticePhase onComplete={() => markComplete(6)} />}
      {idx === 7 && <SpellingPhase onComplete={() => markComplete(7)} />}
      {idx === 8 && <ChantPhase lines={oceanChant} onComplete={() => markComplete(8)} />}
      {idx === 9 && (
        <BrainBreakPhase
          onComplete={() => markComplete(9)}
          games={[
            {
              id: "fish",
              label: "Catch the fish 🐟",
              icon: <Hand className="h-4 w-4" />,
              render: ({ onSolved }) => (
                <TapToCatch
                  onSolved={onSolved}
                  config={{
                    emojis: ["🐟", "🐠", "🦐"],
                    target: 6,
                    cta: "Tap the fish swimming in the sea!",
                    background: "bg-sky-100/70",
                  }}
                />
              ),
            },
            {
              id: "reef",
              label: "Reef maze 🐾",
              icon: <Footprints className="h-4 w-4" />,
              render: ({ onSolved }) => <GridMaze emoji="🐙" goal="🦀" onSolved={onSolved} />,
            },
            {
              id: "puzzle",
              label: "Ocean Puzzle",
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

function LessonMapNotes({ currentIndex }: { currentIndex: number }) {
  return (
    <TeacherNotes title="📍 Lesson map (teacher only)">
      <p className="mb-2 font-semibold">
        Unit: <span className="text-[color:var(--playground-primary)]">Ocean</span> · Lesson 3 ·
        Ages 4–9 · ~30 minutes
      </p>
      <p className="mb-2">
        <strong>Goals:</strong> 3 new ocean animals, combine Lesson 1's frame
        <em> "It is a ___"</em> + Lesson 2's <em>colors</em> + a NEW <em>size</em> adjective into a
        full sentence: <em>"It is a small orange fish."</em>
      </p>
      <ol className="ml-4 list-decimal space-y-1">
        {[
          "Vocabulary — 3 ocean animals (minimal load).",
          "Modeling — hear the simple Lesson-1 frame again.",
          "Describe — recall colors from Lesson 2.",
          "Build — stack [size] + [color] + [animal] tiles.",
          "Practice — listening discrimination.",
          "Spelling — letter recognition stretch task.",
          "Cool down — celebrate the new long sentence.",
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
        Differentiation: For 4-yr-olds, stop after Describe. For 7–9, ask follow-ups ("How many
        legs?", "Where does it live?").
      </p>
    </TeacherNotes>
  );
}

/* ------------------------------ Vocabulary ----------------------------- */
function VocabPhase({ onComplete }: { onComplete: () => void }) {
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const allSeen = seen.size === OCEAN_ANIMALS.length;
  useEffect(() => {
    if (allSeen) onComplete();
  }, [allSeen, onComplete]);
  const tap = (name: string) => {
    speak(name);
    setSeen((s) => new Set(s).add(name));
  };
  return (
    <div>
      <TeacherNotes title="📝 Activity notes — Vocabulary">
        <p>
          <strong>Aim:</strong> recognise 3 new sea animals.
          <strong> Time:</strong> 3 min.
        </p>
        <p>Tap each animal twice and have the student echo.</p>
      </TeacherNotes>
      <p className="mb-6 text-center text-xl font-semibold text-[color:var(--playground-ink)]/80">
        Tap each ocean friend 🐟🐙🦀
      </p>
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        {OCEAN_ANIMALS.map((a) => {
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
                loading="lazy"
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
      <p className="mt-6 text-center text-base font-medium text-[color:var(--playground-ink)]/60">
        {seen.size} / {OCEAN_ANIMALS.length} heard
      </p>
    </div>
  );
}

/* ------------------------------ Modeling ----------------------------- */
function ModelingPhase({ onComplete }: { onComplete: () => void }) {
  const [heard, setHeard] = useState<Set<string>>(new Set());
  const done = heard.size === OCEAN_ANIMALS.length;
  useEffect(() => {
    if (done) {
      const id = setTimeout(onComplete, 500);
      return () => clearTimeout(id);
    }
  }, [done, onComplete]);
  const tap = (a: OceanAnimal) => {
    speak(`It is ${article(a.name)} ${a.name}`);
    setHeard((s) => new Set(s).add(a.name));
  };
  return (
    <div>
      <TeacherNotes title="📝 Activity notes — Modeling">
        <p>
          <strong>Aim:</strong> review the Lesson-1 frame before stacking adjectives.
          <strong> Time:</strong> 2 min.
        </p>
      </TeacherNotes>
      <p className="mb-6 text-center text-xl font-semibold text-[color:var(--playground-ink)]/80">
        Tap each friend to hear: <em>"It is a / an ___"</em>
      </p>
      <div
        className="relative mx-auto overflow-hidden rounded-[2rem] p-6"
        style={{
          background:
            "radial-gradient(circle at 20% 90%, #38bdf8 0%, transparent 55%), radial-gradient(circle at 85% 95%, #0ea5e9 0%, transparent 60%), linear-gradient(180deg, #e0f2fe 0%, #bae6fd 60%, #38bdf8 100%)",
          minHeight: "380px",
        }}
      >
        <div className="absolute right-6 top-4 text-4xl">☀️</div>
        <div className="absolute left-4 top-6 text-4xl">🌊</div>
        <div className="absolute right-12 bottom-4 text-4xl">🪸</div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {OCEAN_ANIMALS.map((a) => {
            const h = heard.has(a.name);
            return (
              <button
                key={a.name}
                onClick={() => tap(a)}
                className="group relative flex flex-col items-center gap-2 rounded-3xl p-2 transition hover:scale-105 active:scale-95"
              >
                <div
                  className="relative rounded-2xl bg-white px-3 py-2 text-sm font-extrabold text-[color:var(--playground-ink)] shadow-md sm:text-base"
                  style={{ outline: h ? "3px solid var(--playground-primary)" : "none" }}
                >
                  It is {article(a.name)}{" "}
                  <span className="capitalize text-[color:var(--playground-primary)]">{a.name}</span>!
                </div>
                <img
                  src={a.image}
                  alt={a.name}
                  className="h-24 w-24 object-contain sm:h-28 sm:w-28"
                  loading="lazy"
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
    </div>
  );
}

/* ------------------------------ Describe (colors review) ----------------------------- */
function DescribePhase({ onComplete }: { onComplete: () => void }) {
  const [round, setRound] = useState(0);
  const animal = OCEAN_ANIMALS[round];
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);

  const choices = useMemo(() => {
    const wrongs = shuffle(OCEAN_COLORS.filter((c) => !animal.colors.includes(c.name))).slice(0, 3);
    const right = OCEAN_COLORS.find((c) => c.name === animal.color)!;
    return shuffle([right, ...wrongs]);
  }, [animal]);

  useEffect(() => {
    if (picked) {
      speak(`It is ${article(picked)} ${picked} ${animal.name}.`);
      const id = setTimeout(() => {
        if (round + 1 >= OCEAN_ANIMALS.length) onComplete();
        else {
          setRound((r) => r + 1);
          setPicked(null);
        }
      }, 2200);
      return () => clearTimeout(id);
    }
  }, [picked, animal, round, onComplete]);

  const pick = (name: string) => {
    if (name === animal.color) setPicked(name);
    else {
      setWrong(name);
      setTimeout(() => setWrong(null), 400);
    }
  };

  return (
    <div>
      <TeacherNotes title="📝 Activity notes — Describe">
        <p>
          <strong>Aim:</strong> reactivate colors from Lesson 2 before stacking size.
          <strong> Time:</strong> 3 min.
        </p>
      </TeacherNotes>
      <div className="text-center">
        <img
          src={animal.image}
          alt={animal.name}
          className="mx-auto h-32 w-32 object-contain sm:h-40 sm:w-40"
          loading="lazy"
        />
        <p className="mt-4 text-3xl font-extrabold text-[color:var(--playground-ink)] sm:text-4xl">
          It is{" "}
          <span className="inline-block min-w-24 rounded-xl bg-white/60 px-3 py-1 align-middle capitalize">
            {picked ? `${article(picked)} ${picked}` : "___"}
          </span>{" "}
          <span className="capitalize text-[color:var(--playground-primary)]">{animal.name}</span>.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {choices.map((c) => (
            <button
              key={c.name}
              onClick={() => pick(c.name)}
              disabled={picked === c.name}
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
          Animal {round + 1} of {OCEAN_ANIMALS.length}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ Build (color + size + noun) ----------------------------- */
function BuildPhase({ onComplete }: { onComplete: () => void }) {
  const [round, setRound] = useState(0);
  const animal = OCEAN_ANIMALS[round];
  const [colorPick, setColorPick] = useState<string | null>(null);
  const [sizePick, setSizePick] = useState<"big" | "small" | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);

  const colorChoices = useMemo(() => {
    const wrongs = shuffle(OCEAN_COLORS.filter((c) => !animal.colors.includes(c.name))).slice(0, 2);
    const right = OCEAN_COLORS.find((c) => c.name === animal.color)!;
    return shuffle([right, ...wrongs]);
  }, [animal]);

  // English adjective order: size before color (a small orange fish, not "an orange small fish").
  const sentence = `It is ${article(sizePick || "")} ${sizePick ?? "___"} ${colorPick ?? "___"} ${animal.name}.`;
  const done = colorPick && sizePick;

  useEffect(() => {
    if (done) {
      speak(sentence);
      const id = setTimeout(() => {
        if (round + 1 >= OCEAN_ANIMALS.length) onComplete();
        else {
          setRound((r) => r + 1);
          setColorPick(null);
          setSizePick(null);
        }
      }, 2600);
      return () => clearTimeout(id);
    }
  }, [done, sentence, round, onComplete]);

  const pickColor = (name: string) => {
    if (name === animal.color) setColorPick(name);
    else {
      setWrong(name);
      setTimeout(() => setWrong(null), 400);
    }
  };
  const pickSize = (s: "big" | "small") => {
    if (s === animal.size) setSizePick(s);
    else {
      setWrong(s);
      setTimeout(() => setWrong(null), 400);
    }
  };

  return (
    <div>
      <TeacherNotes title="📝 Activity notes — Build sentence">
        <p>
          <strong>Aim:</strong> stack adjectives: color → size → noun. Stretch goal of the unit.
          <strong> Time:</strong> 4–5 min.
        </p>
        <p>
          Pick the correct color first, then the right size. The app speaks the full sentence
          back: <em>"It is a small orange fish."</em>
        </p>
      </TeacherNotes>
      <div className="text-center">
        <img
          src={animal.image}
          alt={animal.name}
          className="mx-auto h-32 w-32 object-contain sm:h-40 sm:w-40"
          loading="lazy"
        />
        <p className="mt-4 text-2xl font-extrabold text-[color:var(--playground-ink)] sm:text-3xl">
          It is{" "}
          <span className="inline-block min-w-12 rounded-xl bg-white/60 px-2 py-1 align-middle">
            {colorPick ? article(colorPick) : "a/an"}
          </span>{" "}
          <span className="inline-block min-w-24 rounded-xl bg-white/60 px-3 py-1 align-middle capitalize">
            {colorPick || "___"}
          </span>{" "}
          <span className="inline-block min-w-24 rounded-xl bg-white/60 px-3 py-1 align-middle capitalize">
            {sizePick || "___"}
          </span>{" "}
          <span className="capitalize text-[color:var(--playground-primary)]">{animal.name}</span>.
        </p>

        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-[color:var(--playground-ink)]/60">
          1. Pick a color
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {colorChoices.map((c) => (
            <button
              key={c.name}
              onClick={() => pickColor(c.name)}
              disabled={colorPick === c.name}
              className={`glass-card flex items-center gap-3 rounded-2xl px-5 py-3 text-lg font-bold capitalize transition hover:scale-105 disabled:opacity-30 ${wrong === c.name ? "animate-lesson-shake" : ""}`}
            >
              <span
                className="h-7 w-7 rounded-full border border-white/70 shadow-inner"
                style={{ background: c.hex }}
              />
              {c.name}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-[color:var(--playground-ink)]/60">
          2. Pick the size
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {SIZES.map((s) => (
            <button
              key={s.name}
              onClick={() => pickSize(s.name)}
              disabled={sizePick === s.name}
              className={`glass-card rounded-2xl px-6 py-3 text-lg font-bold transition hover:scale-105 disabled:opacity-30 ${wrong === s.name ? "animate-lesson-shake" : ""}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm font-medium text-[color:var(--playground-ink)]/60">
          Animal {round + 1} of {OCEAN_ANIMALS.length}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ Practice ----------------------------- */
function PracticePhase({ onComplete }: { onComplete: () => void }) {
  const [round, setRound] = useState(0);
  const total = 4;
  const target = useMemo<OceanAnimal>(() => {
    void round;
    return OCEAN_ANIMALS[Math.floor(Math.random() * OCEAN_ANIMALS.length)];
  }, [round]);
  const [wrong, setWrong] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => speak(target.name), 250);
    return () => clearTimeout(id);
  }, [target]);

  const pick = (a: OceanAnimal) => {
    if (a.name === target.name) {
      speak(a.name);
      setTimeout(() => {
        if (round + 1 >= total) onComplete();
        else setRound((r) => r + 1);
      }, 700);
    } else {
      setWrong(a.name);
      setTimeout(() => setWrong(null), 400);
    }
  };

  return (
    <div>
      <TeacherNotes title="📝 Activity notes — Practice">
        <p>
          <strong>Aim:</strong> listening discrimination.
          <strong> Time:</strong> 2 min.
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
        <div className="mt-8 grid grid-cols-3 gap-4">
          {OCEAN_ANIMALS.map((a) => (
            <button
              key={a.name}
              onClick={() => pick(a)}
              className={`glass-card rounded-3xl p-3 transition hover:scale-105 ${wrong === a.name ? "animate-lesson-shake" : ""}`}
            >
              <img
                src={a.image}
                alt={a.name}
                className="h-28 w-28 object-contain sm:h-32 sm:w-32"
                loading="lazy"
              />
            </button>
          ))}
        </div>
        <p className="mt-6 text-sm font-medium text-[color:var(--playground-ink)]/60">
          Round {round + 1} of {total}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ Spelling ----------------------------- */
function SpellingPhase({ onComplete }: { onComplete: () => void }) {
  // Only use short words so 4–6 year-olds can succeed; skip "octopus".
  const rounds = useMemo(
    () => shuffle(OCEAN_ANIMALS.filter((a) => a.letters.length <= 4)),
    [],
  );
  const [idx, setIdx] = useState(0);
  const animal = rounds[idx];
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [slots, setSlots] = useState<(string | null)[]>([]);
  const [wrongAt, setWrongAt] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    setScrambled(shuffle(animal.letters));
    setSlots(Array(animal.letters.length).fill(null));
    setSolved(false);
    speak(animal.name);
  }, [animal]);

  const nextEmpty = slots.findIndex((s) => s === null);

  const tapLetter = (i: number) => {
    if (solved || nextEmpty < 0) return;
    const letter = scrambled[i];
    if (letter === animal.letters[nextEmpty]) {
      const ns = [...slots];
      ns[nextEmpty] = letter;
      const nsc = scrambled.map((l, j) => (j === i ? "" : l));
      setSlots(ns);
      setScrambled(nsc);
      if (ns.every((s) => s)) {
        setSolved(true);
        speak(animal.name);
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
          <strong>Aim:</strong> letter recognition for short ocean words.
          <strong> Time:</strong> 3 min.
        </p>
      </TeacherNotes>
      <div className="text-center">
        <img
          src={animal.image}
          alt=""
          className="mx-auto h-28 w-28 object-contain sm:h-36 sm:w-36"
          loading="lazy"
        />
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
            🎉 {animal.name}!
          </p>
        )}
        <p className="mt-6 text-sm font-medium text-[color:var(--playground-ink)]/60">
          Word {idx + 1} of {rounds.length}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ Cool down ----------------------------- */
function CoolDown({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    onComplete();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.4 },
      colors: ["#FE6A2F", "#FEFBDD", "#38BDF8"],
    });
  }, [onComplete]);
  return (
    <div>
      <TeacherNotes title="📝 Activity notes — Cool down">
        <p>
          <strong>Aim:</strong> celebrate stacking 3 ideas into one sentence.
        </p>
      </TeacherNotes>
      <div className="text-center">
        <p className="text-6xl">🌊🐟🐙🦀</p>
        <h2 className="mt-4 text-4xl font-black text-[color:var(--playground-ink)]">
          Wonderful!
        </h2>
        <p className="mt-2 text-lg text-[color:var(--playground-ink)]/70">
          You can now say things like <em>"It is a small orange fish."</em>
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

export default OceanLesson;
