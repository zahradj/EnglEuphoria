import { useEffect, useMemo, useState } from "react";
import { ANIMALS, type Animal } from "@/lib/lesson/animals";
import { speak } from "@/lib/lesson/speech";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const ACTIVITIES = ["build", "parade", "blank"] as const;

export function SentencePhase({ onComplete }: { onComplete: () => void }) {
  const [idx, setIdx] = useState(0);
  const next = () => {
    if (idx < ACTIVITIES.length - 1) setIdx((i) => i + 1);
    else onComplete();
  };
  const a = ACTIVITIES[idx];
  return (
    <div>
      <div className="mb-6 flex justify-center gap-2">
        {ACTIVITIES.map((g, i) => (
          <span
            key={g}
            className="h-2 w-10 rounded-full"
            style={{
              background:
                i <= idx
                  ? "var(--playground-primary)"
                  : "color-mix(in oklab, var(--playground-primary) 20%, white)",
            }}
          />
        ))}
      </div>
      {a === "build" && <TapToBuild onDone={next} />}
      {a === "parade" && <PictureParade onDone={next} />}
      {a === "blank" && <FillBlank onDone={next} />}
    </div>
  );
}

const TOKENS = ["It", "is", "a"] as const;

function TapToBuild({ onDone }: { onDone: () => void }) {
  const queue = useMemo(() => shuffle(ANIMALS).slice(0, 3), []);
  const totalRounds = queue.length;
  const [round, setRound] = useState(0);
  const animal = queue[round];
  const [picked, setPicked] = useState<string[]>([]);
  const target = [...TOKENS, animal.name];

  const tap = (t: string) => {
    const nextIndex = picked.length;
    if (t === target[nextIndex]) {
      speak(t);
      const np = [...picked, t];
      setPicked(np);
      if (np.length === target.length) {
        setTimeout(() => speak(np.join(" ")), 300);
        setTimeout(() => {
          if (round + 1 >= totalRounds) onDone();
          else {
            setPicked([]);
            setRound((r) => r + 1);
          }
        }, 2000);
      }
    }
  };

  const allTiles = shuffle([...TOKENS, animal.name]);

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-[color:var(--playground-ink)]">Build the sentence</h2>
      <p className="mt-1 text-base text-[color:var(--playground-ink)]/70">
        Tap the words in order: <strong>It is a {animal.name}</strong>
      </p>
      <img
        src={animal.image}
        alt={animal.name}
        className="mx-auto mt-4 h-32 w-32 object-contain sm:h-40 sm:w-40"
      />
      <div className="mx-auto mt-4 flex min-h-20 max-w-xl flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[color:var(--playground-primary)]/40 bg-white/40 p-4">
        {picked.length === 0 && (
          <span className="text-base text-[color:var(--playground-ink)]/40">Your sentence…</span>
        )}
        {picked.map((p, i) => (
          <span
            key={i}
            className="animate-lesson-pop rounded-xl px-4 py-2 text-2xl font-extrabold text-white"
            style={{ background: "var(--playground-primary)" }}
          >
            {p}
          </span>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {allTiles.map((t, i) => {
          const usedCount = picked.filter((p) => p === t).length;
          const totalCount = target.filter((p) => p === t).length;
          const disabled = usedCount >= totalCount;
          return (
            <button
              key={i + t}
              onClick={() => tap(t)}
              disabled={disabled}
              className="glass-card rounded-2xl px-5 py-3 text-2xl font-bold text-[color:var(--playground-ink)] transition hover:scale-105 disabled:opacity-20"
            >
              {t}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-sm font-medium text-[color:var(--playground-ink)]/60">
        Round {round + 1} of {totalRounds}
      </p>
    </div>
  );
}

function PictureParade({ onDone }: { onDone: () => void }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const all = done.size === ANIMALS.length;
  useEffect(() => {
    if (all) {
      const id = setTimeout(onDone, 700);
      return () => clearTimeout(id);
    }
  }, [all, onDone]);
  const tap = (a: Animal) => {
    speak(`It is a ${a.name}`);
    setDone((s) => new Set(s).add(a.name));
  };
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-[color:var(--playground-ink)]">Picture Parade</h2>
      <p className="mt-1 text-base text-[color:var(--playground-ink)]/70">
        Tap each animal to say a full sentence
      </p>
      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {ANIMALS.map((a) => (
          <button
            key={a.name}
            onClick={() => tap(a)}
            className="glass-card flex flex-col items-center gap-1 rounded-2xl p-2 transition hover:scale-105"
            style={{
              outline: done.has(a.name) ? "3px solid var(--playground-primary)" : "none",
            }}
          >
            <img src={a.image} alt={a.name} className="h-20 w-20 object-contain" />
            <span className="text-sm font-bold capitalize">{a.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FillBlank({ onDone }: { onDone: () => void }) {
  const queue = useMemo(() => shuffle(ANIMALS).slice(0, 3), []);
  const totalRounds = queue.length;
  const [round, setRound] = useState(0);
  const animal = queue[round];
  const choices = useMemo(() => {
    const others = shuffle(ANIMALS.filter((a) => a.name !== animal.name)).slice(0, 2);
    return shuffle([animal, ...others]);
  }, [animal]);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);

  const pick = (name: string) => {
    if (name === animal.name) {
      setSolved(true);
      speak(`It is a ${animal.name}`);
      setTimeout(() => {
        if (round + 1 >= totalRounds) onDone();
        else {
          setSolved(false);
          setRound((r) => r + 1);
        }
      }, 1800);
    } else {
      setWrong(name);
      setTimeout(() => setWrong(null), 400);
    }
  };
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-[color:var(--playground-ink)]">Fill the blank</h2>
      <img src={animal.image} alt="" className="mx-auto mt-4 h-32 w-32 object-contain sm:h-40 sm:w-40" />
      <p className="mt-4 text-3xl font-extrabold text-[color:var(--playground-ink)] sm:text-4xl">
        It is a{" "}
        <span
          className="inline-block min-w-32 rounded-xl px-4 py-1 align-middle"
          style={{
            background: solved
              ? "var(--playground-primary)"
              : "color-mix(in oklab, var(--playground-primary) 15%, white)",
            color: solved ? "white" : "var(--playground-ink)",
          }}
        >
          {solved ? animal.name : "___"}
        </span>
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {choices.map((c) => (
          <button
            key={c.name}
            onClick={() => pick(c.name)}
            disabled={solved}
            className={`glass-card rounded-2xl px-5 py-3 text-2xl font-bold text-[color:var(--playground-ink)] transition hover:scale-105 ${
              wrong === c.name ? "animate-lesson-shake" : ""
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm font-medium text-[color:var(--playground-ink)]/60">
        Round {round + 1} of {totalRounds}
      </p>
    </div>
  );
}
