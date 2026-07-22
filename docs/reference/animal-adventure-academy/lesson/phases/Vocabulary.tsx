import { useEffect, useState } from "react";
import { ANIMALS } from "@/lib/lesson/animals";
import { speak } from "@/lib/lesson/speech";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function VocabularyPhase({ onComplete }: { onComplete: () => void }) {
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [stage, setStage] = useState<"listen" | "match">("listen");
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [chips] = useState(() => shuffle(ANIMALS.map((a) => a.name)));

  const allSeen = seen.size === ANIMALS.length;
  const allMatched = matched.size === ANIMALS.length;

  useEffect(() => {
    if (allMatched) onComplete();
  }, [allMatched, onComplete]);

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

  if (stage === "match") {
    return (
      <div>
        <p className="mb-6 text-center text-xl font-semibold text-[color:var(--playground-ink)]/80">
          Drag the word onto the matching animal 🎯
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {ANIMALS.map((a) => {
            const isMatched = matched.has(a.name);
            return (
              <button
                key={a.name}
                onClick={() => dropOn(a.name)}
                disabled={isMatched}
                className={`glass-card relative flex flex-col items-center gap-2 rounded-3xl p-4 transition hover:scale-105 ${
                  wrong === a.name ? "animate-lesson-shake" : ""
                }`}
                style={{
                  outline: isMatched ? "3px solid var(--playground-primary)" : "none",
                  background: isMatched
                    ? "color-mix(in oklab, var(--playground-primary) 18%, white)"
                    : undefined,
                }}
              >
                <img src={a.image} alt={a.name} className="h-24 w-24 object-contain sm:h-32 sm:w-32" />
                {isMatched && (
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
            const isSelected = selected === name;
            return (
              <button
                key={name}
                onClick={() => tapChip(name)}
                disabled={used}
                className="glass-card rounded-2xl px-5 py-3 text-2xl font-extrabold capitalize transition hover:scale-105 disabled:opacity-20"
                style={{
                  background: isSelected ? "var(--playground-primary)" : undefined,
                  color: isSelected ? "white" : "var(--playground-ink)",
                  transform: isSelected ? "scale(1.08)" : undefined,
                }}
              >
                {name}
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-base font-medium text-[color:var(--playground-ink)]/60">
          {matched.size} / {ANIMALS.length} matched
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-6 text-center text-xl font-semibold text-[color:var(--playground-ink)]/80">
        Tap each animal to hear its name 🐾
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
        {ANIMALS.map((a) => {
          const isSeen = seen.has(a.name);
          return (
            <button
              key={a.name}
              onClick={() => tap(a.name)}
              className="glass-card relative flex flex-col items-center gap-3 rounded-3xl p-4 transition hover:scale-105 active:scale-95"
              style={{
                boxShadow: isSeen
                  ? "0 12px 30px -8px color-mix(in oklab, var(--playground-primary) 45%, transparent)"
                  : undefined,
                outline: isSeen ? "3px solid var(--playground-primary)" : "none",
              }}
            >
              <img
                src={a.image}
                alt={a.name}
                width={512}
                height={512}
                loading="lazy"
                className="h-32 w-32 object-contain sm:h-40 sm:w-40"
              />
              <span className="text-2xl font-extrabold capitalize text-[color:var(--playground-ink)] sm:text-3xl">
                {a.name}
              </span>
              {isSeen && (
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
          {seen.size} / {ANIMALS.length} animals heard
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
    </div>
  );
}
