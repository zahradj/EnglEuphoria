import { useEffect, useMemo, useState } from "react";
import { speak } from "@/playground-blueprint/lib/speech";
import confetti from "canvas-confetti";
import { TeacherNotes } from "@/playground-blueprint/components/TeacherNotes";

/**
 * Memory match game (~5–7 min).
 * Builds a 4-pair deck of {picture, word} cards from any vocab list of
 * {name, image}. Children flip two cards at a time and try to match the
 * picture to its written word — a classic memory game.
 *
 * Reusable across lessons; pass the lesson's own vocab in.
 */
type Item = { name: string; image: string };
type Card = { id: string; pairKey: string; kind: "pic" | "word"; name: string; image: string };

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function MemoryMatchPhase({
  items,
  onComplete,
  pairs = 4,
}: {
  items: Item[];
  onComplete: () => void;
  pairs?: number;
}) {
  const deck = useMemo<Card[]>(() => {
    const picked = shuffle(items).slice(0, Math.min(pairs, items.length));
    const cards: Card[] = picked.flatMap((it) => [
      { id: `${it.name}-pic`, pairKey: it.name, kind: "pic", name: it.name, image: it.image },
      { id: `${it.name}-word`, pairKey: it.name, kind: "word", name: it.name, image: it.image },
    ]);
    return shuffle(cards);
  }, [items, pairs]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (matched.size === deck.length / 2 && deck.length > 0) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 } });
      const t = setTimeout(onComplete, 900);
      return () => clearTimeout(t);
    }
  }, [matched, deck.length, onComplete]);

  const flip = (card: Card) => {
    if (flipped.includes(card.id) || matched.has(card.pairKey)) return;
    if (flipped.length === 2) return;
    speak(card.name);
    const next = [...flipped, card.id];
    setFlipped(next);
    if (next.length === 2) {
      setTries((n) => n + 1);
      const [a, b] = next.map((id) => deck.find((c) => c.id === id)!);
      if (a.pairKey === b.pairKey) {
        setTimeout(() => {
          setMatched((m) => new Set(m).add(a.pairKey));
          setFlipped([]);
        }, 500);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  return (
    <div className="text-center">
      <TeacherNotes>
        Memory game: tap two cards, find the picture and its word. Say each word
        out loud together. Keep going until every pair is found — celebrate
        every match!
      </TeacherNotes>
      <p className="mt-2 text-sm font-bold uppercase tracking-widest text-[color:var(--playground-primary)]">
        Pairs found {matched.size} / {deck.length / 2} · Tries {tries}
      </p>
      <div className="mx-auto mt-5 grid max-w-md grid-cols-4 gap-3">
        {deck.map((c) => {
          const isOpen = flipped.includes(c.id) || matched.has(c.pairKey);
          return (
            <button
              key={c.id}
              onClick={() => flip(c)}
              className={`glass-card flex aspect-square items-center justify-center rounded-2xl p-2 transition ${
                isOpen ? "ring-4 ring-[color:var(--playground-primary)]/50" : "hover:scale-105"
              }`}
              style={{
                background: isOpen
                  ? "color-mix(in oklab, var(--playground-primary) 10%, white)"
                  : undefined,
              }}
              aria-label={isOpen ? c.name : "Hidden card"}
            >
              {isOpen ? (
                c.kind === "pic" ? (
                  <img src={c.image} alt={c.name} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-lg font-black text-[color:var(--playground-ink)] sm:text-xl">
                    {c.name}
                  </span>
                )
              ) : (
                <span className="text-3xl">❓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
