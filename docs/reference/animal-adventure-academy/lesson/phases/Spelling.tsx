import { useEffect, useMemo, useState } from "react";
import { ANIMALS } from "@/lib/lesson/animals";
import { speak } from "@/lib/lesson/speech";

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
  // Fallback: swap first two
  return [arr[1], arr[0], ...arr.slice(2)];
}

export function SpellingPhase({ onComplete }: { onComplete: () => void }) {
  const rounds = useMemo(() => shuffle(ANIMALS).slice(0, 4), []);
  const [idx, setIdx] = useState(0);
  const animal = rounds[idx];
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [slots, setSlots] = useState<(string | null)[]>([]);
  const [wrongAt, setWrongAt] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    setScrambled(scrambleDifferent(animal.letters));
    setSlots(Array(animal.letters.length).fill(null));
    setSolved(false);
    speak(animal.name);
  }, [animal]);

  const nextEmpty = slots.findIndex((s) => s === null);

  const tapLetter = (letterIdx: number) => {
    if (solved || nextEmpty < 0) return;
    const letter = scrambled[letterIdx];
    if (letter === animal.letters[nextEmpty]) {
      const newSlots = [...slots];
      newSlots[nextEmpty] = letter;
      const newScrambled = scrambled.map((l, i) => (i === letterIdx ? "" : l));
      setSlots(newSlots);
      setScrambled(newScrambled);
      if (newSlots.every((s) => s)) {
        setSolved(true);
        speak(animal.name);
        setTimeout(() => {
          if (idx + 1 >= rounds.length) onComplete();
          else setIdx((i) => i + 1);
        }, 1500);
      }
    } else {
      setWrongAt(letterIdx);
      setTimeout(() => setWrongAt(null), 400);
    }
  };

  return (
    <div className="text-center">
      <p className="text-xl font-semibold text-[color:var(--playground-ink)]/80">
        Spell the word
      </p>
      <img
        src={animal.image}
        alt=""
        className="mx-auto mt-4 h-32 w-32 object-contain sm:h-40 sm:w-40"
      />

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {slots.map((s, i) => (
          <div
            key={i}
            className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl font-black sm:h-24 sm:w-24"
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

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {scrambled.map((l, i) =>
          l ? (
            <button
              key={i}
              onClick={() => tapLetter(i)}
              className={`glass-card h-20 w-20 rounded-2xl text-4xl font-black text-[color:var(--playground-ink)] transition hover:scale-105 sm:h-24 sm:w-24 ${
                wrongAt === i ? "animate-lesson-shake" : ""
              }`}
            >
              {l}
            </button>
          ) : (
            <div key={i} className="h-20 w-20 sm:h-24 sm:w-24" />
          )
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
  );
}
