import { useEffect, useState } from "react";
import { useLessonVocab } from "@/playground-blueprint/lib/useDynamicVocab";
import { speak } from "@/playground-blueprint/lib/speech";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function VocabularyPhase({ onComplete }: { onComplete: () => void }) {
  const ANIMALS = useLessonVocab(1);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [stage, setStage] = useState<"listen" | "match">("listen");
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [chips] = useState(() => shuffle(ANIMALS.map((a) => a.name)));
  const [cardIdx, setCardIdx] = useState(0);

  const hasVocab = ANIMALS.length > 0;
  const allSeen = hasVocab && seen.size === ANIMALS.length;
  const allMatched = hasVocab && matched.size === ANIMALS.length;
  const current = hasVocab ? ANIMALS[Math.min(cardIdx, ANIMALS.length - 1)] : undefined;
  const isCurrentSeen = current ? seen.has(current.name) : false;
  const isLast = cardIdx >= ANIMALS.length - 1;

  useEffect(() => {
    if (allMatched) onComplete();
  }, [allMatched, onComplete]);

  // Auto-mark seen + speak when card mounts/changes (listen stage only).
  useEffect(() => {
    if (stage !== "listen" || !current) return;
    const t = setTimeout(() => {
      speak(current.name);
      setSeen((s) => new Set(s).add(current.name));
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardIdx, stage]);

  // Guard placed AFTER all hooks to respect the Rules of Hooks.
  if (!hasVocab) {
    return (
      <div className="grid min-h-[200px] place-items-center text-[#3a1d0a]/70">
        No vocabulary for this page yet.
      </div>
    );
  }

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
          Drag the word onto the matching picture 🎯
        </p>


        <div className="mx-auto grid max-w-[34rem] grid-cols-2 gap-5 place-items-center">
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
                <img src={a.image} alt={a.name} className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
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

  // ─── Listen stage: ONE card per word, step through them ────────────────


  return (
    <div>
      <p className="mb-6 text-center text-xl font-semibold text-[color:var(--playground-ink)]/80">
        Listen and repeat 🐾
      </p>

      <div className="mx-auto flex max-w-xl flex-col items-center">
        {/* Compact card sized for classroom frame */}
        <button
          key={current?.name}
          onClick={() => current && tap(current.name)}
          className="glass-card flex w-full flex-col items-center gap-3 rounded-3xl p-4 transition hover:scale-[1.01] active:scale-[0.99]"
          style={{
            boxShadow: isCurrentSeen
              ? "0 16px 40px -10px color-mix(in oklab, var(--playground-primary) 50%, transparent)"
              : undefined,
            outline: isCurrentSeen ? "3px solid var(--playground-primary)" : "none",
          }}
        >
          <div className="flex w-full items-center justify-center rounded-2xl bg-white p-2">
            <img
              src={current?.image}
              alt={current?.name}
              width={512}
              height={512}
              className="aspect-square w-full max-w-[14rem] object-contain sm:max-w-[16rem]"
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-3xl font-extrabold capitalize text-[color:var(--playground-ink)] sm:text-4xl">
              {current?.name}
            </span>
            <span className="text-xs font-semibold text-[color:var(--playground-ink)]/60">
              🔊 Tap to hear again
            </span>
          </div>
        </button>


        {/* Progress dots */}
        <div className="mt-6 flex items-center gap-2">
          {ANIMALS.map((a, i) => (
            <span
              key={a.name}
              className="h-2.5 rounded-full transition-all"
              style={{
                width: i === cardIdx ? 28 : 10,
                background:
                  i === cardIdx
                    ? "var(--playground-primary)"
                    : seen.has(a.name)
                    ? "color-mix(in oklab, var(--playground-primary) 50%, white)"
                    : "color-mix(in oklab, var(--playground-ink) 15%, white)",
              }}
            />
          ))}
        </div>

        {/* Step controls */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-base font-medium text-[color:var(--playground-ink)]/60">
            {seen.size} / {ANIMALS.length} words heard
          </p>
          {!isLast ? (
            <button
              onClick={() => setCardIdx((i) => Math.min(ANIMALS.length - 1, i + 1))}
              disabled={!isCurrentSeen}
              className="shadow-playground rounded-2xl px-8 py-4 text-lg font-extrabold text-white transition hover:scale-105 disabled:opacity-30"
              style={{ background: "var(--playground-primary)" }}
            >
              Next word →
            </button>
          ) : (
            <button
              onClick={() => setStage("match")}
              disabled={!allSeen}
              className="shadow-playground rounded-2xl px-8 py-4 text-lg font-extrabold text-white transition hover:scale-105 disabled:opacity-30"
              style={{ background: "var(--playground-primary)" }}
            >
              Play matching game →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
