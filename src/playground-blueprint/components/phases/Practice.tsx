import { useEffect, useMemo, useState } from "react";
import { useLessonVocab } from "@/playground-blueprint/lib/useDynamicVocab";
import { type Animal } from "@/playground-blueprint/lib/animals";
import { speak } from "@/playground-blueprint/lib/speech";
import { Volume2 } from "lucide-react";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const GAMES = ["listen-choose", "flip-match", "listen-match"] as const;
type Game = (typeof GAMES)[number];

export function PracticePhase({ onComplete }: { onComplete: () => void }) {
  const [gameIdx, setGameIdx] = useState(0);
  const game = GAMES[gameIdx];

  const next = () => {
    if (gameIdx < GAMES.length - 1) setGameIdx((i) => i + 1);
    else onComplete();
  };

  return (
    <div>
      <div className="mb-6 flex justify-center gap-2">
        {GAMES.map((g, i) => (
          <span
            key={g}
            className="h-2 w-10 rounded-full"
            style={{
              background:
                i <= gameIdx
                  ? "var(--playground-primary)"
                  : "color-mix(in oklab, var(--playground-primary) 20%, white)",
            }}
          />
        ))}
      </div>
      {game === "listen-choose" && <ListenChoose onDone={next} />}
      {game === "flip-match" && <FlipMatch onDone={next} />}
      {game === "listen-match" && <ListenMatch onDone={next} />}
    </div>
  );
}

/* --- Game 1: Listen & Choose --- */
function ListenChoose({ onDone }: { onDone: () => void }) {
  const ANIMALS = useLessonVocab(1);
  const [round, setRound] = useState(0);
  const totalRounds = 4;
  const [feedback, setFeedback] = useState<"right" | "wrong" | null>(null);

  const { target, choices } = useMemo(() => {
    const t = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const others = shuffle(ANIMALS.filter((a) => a.name !== t.name)).slice(0, 3);
    return { target: t, choices: shuffle([t, ...others]) };
  }, [round, ANIMALS]);

  useEffect(() => {
    const id = setTimeout(() => speak(target.name), 250);
    return () => clearTimeout(id);
  }, [target]);

  const pick = (a: Animal) => {
    if (a.name === target.name) {
      setFeedback("right");
      speak(a.name);
      setTimeout(() => {
        setFeedback(null);
        if (round + 1 >= totalRounds) onDone();
        else setRound((r) => r + 1);
      }, 900);
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 500);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-[color:var(--playground-ink)]">Listen & Choose</h2>
      <p className="mt-1 text-base text-[color:var(--playground-ink)]/70">
        Tap the picture you hear
      </p>
      <button
        onClick={() => speak(target.name)}
        className="shadow-playground mx-auto mt-6 flex h-24 w-24 items-center justify-center rounded-full text-white"
        style={{ background: "var(--playground-primary)" }}
      >
        <Volume2 className="h-10 w-10" />
      </button>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {choices.map((a) => (
          <button
            key={a.name}
            onClick={() => pick(a)}
            className={`glass-card rounded-3xl p-3 transition hover:scale-105 active:scale-95 ${
              feedback === "wrong" ? "animate-lesson-shake" : ""
            }`}
          >
            <img
              src={a.image}
              alt={a.name}
              width={512}
              height={512}
              loading="lazy"
              className="h-28 w-28 object-contain sm:h-32 sm:w-32"
            />
          </button>
        ))}
      </div>
      <p className="mt-6 text-sm font-medium text-[color:var(--playground-ink)]/60">
        Round {round + 1} of {totalRounds}
      </p>
    </div>
  );
}

/* --- Game 2: Flip & Match --- */
type Card = { id: number; name: string; image: string; flipped: boolean; matched: boolean };
function FlipMatch({ onDone }: { onDone: () => void }) {
  const ANIMALS = useLessonVocab(1);
  const [cards, setCards] = useState<Card[]>(() => buildDeck(ANIMALS));
  const [picked, setPicked] = useState<number[]>([]);

  function buildDeck(pool: Animal[]): Card[] {
    const subset = shuffle(pool).slice(0, 4);
    const doubled = shuffle([...subset, ...subset]);
    return doubled.map((a, i) => ({ id: i, name: a.name, image: a.image, flipped: false, matched: false }));
  }

  const done = cards.every((c) => c.matched);
  useEffect(() => {
    if (done) {
      const id = setTimeout(onDone, 900);
      return () => clearTimeout(id);
    }
  }, [done, onDone]);

  const flip = (id: number) => {
    if (picked.length >= 2) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;
    speak(card.name);
    const newCards = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    setCards(newCards);
    const newPicked = [...picked, id];
    setPicked(newPicked);
    if (newPicked.length === 2) {
      const [a, b] = newPicked.map((p) => newCards.find((c) => c.id === p)!);
      setTimeout(() => {
        if (a.name === b.name) {
          setCards((cs) => cs.map((c) => (c.id === a.id || c.id === b.id ? { ...c, matched: true } : c)));
        } else {
          setCards((cs) => cs.map((c) => (c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c)));
        }
        setPicked([]);
      }, 800);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-[color:var(--playground-ink)]">Flip & Match</h2>
      <p className="mt-1 text-base text-[color:var(--playground-ink)]/70">Find the matching pairs</p>
      <div className="mx-auto mt-6 grid max-w-2xl grid-cols-4 gap-3 sm:gap-4">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => flip(c.id)}
            className="glass-card aspect-square rounded-3xl p-2 transition hover:scale-105"
            style={{
              background: c.matched
                ? "color-mix(in oklab, var(--playground-primary) 25%, white)"
                : undefined,
            }}
          >
            {c.flipped || c.matched ? (
              <img src={c.image} alt={c.name} className="h-full w-full object-contain" />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center rounded-2xl text-3xl font-black text-white"
                style={{ background: "var(--playground-primary)" }}
              >
                ?
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* --- Game 3: Listen & Match (tap audio chip then tap picture) --- */
function ListenMatch({ onDone }: { onDone: () => void }) {
  const ANIMALS = useLessonVocab(1);
  const [subset] = useState(() => shuffle(ANIMALS).slice(0, 4));
  const [chips] = useState(() => shuffle(subset));
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);

  useEffect(() => {
    if (matched.size === subset.length) {
      const id = setTimeout(onDone, 700);
      return () => clearTimeout(id);
    }
  }, [matched, subset.length, onDone]);

  const playChip = (name: string) => {
    speak(name);
    setActive(name);
  };
  const pickPic = (name: string) => {
    if (!active) {
      speak(name);
      return;
    }
    if (active === name) {
      setMatched((m) => new Set(m).add(name));
      setActive(null);
      speak(name);
    } else {
      setWrong(name);
      setTimeout(() => setWrong(null), 400);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-[color:var(--playground-ink)]">Listen & Match</h2>
      <p className="mt-1 text-base text-[color:var(--playground-ink)]/70">
        Tap a sound, then tap the matching animal
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {chips.map((c) => {
          const used = matched.has(c.name);
          const isActive = active === c.name;
          return (
            <button
              key={c.name}
              disabled={used}
              onClick={() => playChip(c.name)}
              className="glass-card flex items-center gap-2 rounded-2xl px-5 py-3 text-base font-bold transition disabled:opacity-30"
              style={{
                background: isActive ? "var(--playground-primary)" : undefined,
                color: isActive ? "white" : "var(--playground-ink)",
              }}
            >
              <Volume2 className="h-5 w-5" />
              Sound
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {subset.map((a) => {
          const isMatched = matched.has(a.name);
          return (
            <button
              key={a.name}
              onClick={() => pickPic(a.name)}
              disabled={isMatched}
              className={`glass-card rounded-3xl p-3 transition hover:scale-105 ${
                wrong === a.name ? "animate-lesson-shake" : ""
              }`}
              style={{
                background: isMatched
                  ? "color-mix(in oklab, var(--playground-primary) 25%, white)"
                  : undefined,
              }}
            >
              <img src={a.image} alt={a.name} className="h-24 w-24 object-contain sm:h-28 sm:w-28" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
