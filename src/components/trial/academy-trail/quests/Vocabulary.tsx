import { useMemo, useState } from "react";
import { QuestShell, PrimaryButton } from "../QuestShell";
import type { AnswerRecord } from "../useLesson";
import type { Difficulty } from "../levels";

type Pair = { id: string; word: string; emoji: string };

const SETS: Record<Difficulty, Pair[]> = {
  "pre-a1": [
    { id: "v1", word: "Cat", emoji: "🐱" },
    { id: "v2", word: "Sun", emoji: "☀️" },
    { id: "v3", word: "Ball", emoji: "⚽" },
    { id: "v4", word: "Banana", emoji: "🍌" },
    { id: "v5", word: "House", emoji: "🏠" },
    { id: "v6", word: "Star", emoji: "⭐" },
  ],
  standard: [
    { id: "v1", word: "Dog", emoji: "🐶" },
    { id: "v2", word: "Apple", emoji: "🍎" },
    { id: "v3", word: "Backpack", emoji: "🎒" },
    { id: "v4", word: "Sister", emoji: "👧" },
    { id: "v5", word: "Rainbow", emoji: "🌈" },
    { id: "v6", word: "Pencil", emoji: "✏️" },
    { id: "v7", word: "Elephant", emoji: "🐘" },
    { id: "v8", word: "Sandwich", emoji: "🥪" },
  ],
  challenge: [
    { id: "v1", word: "Microscope", emoji: "🔬" },
    { id: "v2", word: "Volcano", emoji: "🌋" },
    { id: "v3", word: "Compass", emoji: "🧭" },
    { id: "v4", word: "Detective", emoji: "🕵️" },
    { id: "v5", word: "Lighthouse", emoji: "🗼" },
    { id: "v6", word: "Astronaut", emoji: "👨‍🚀" },
    { id: "v7", word: "Trophy", emoji: "🏆" },
    { id: "v8", word: "Skeleton", emoji: "💀" },
  ],
};

export function Vocabulary({
  onDone,
  record,
  difficulty,
}: {
  onDone: () => void;
  record: (r: AnswerRecord) => void;
  difficulty: Difficulty;
}) {
  const PAIRS = SETS[difficulty];
  const [target, setTarget] = useState(0);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const shuffled = useMemo(() => [...PAIRS].sort(() => Math.random() - 0.5), [PAIRS]);

  const current = PAIRS[target];
  const done = matched.size === PAIRS.length;

  const handleTap = (id: string) => {
    if (matched.has(id)) return;
    const correct = id === current.id;
    record({ questId: "vocab", itemId: current.id, prompt: current.word, correct, skill: "vocab" });
    if (correct) {
      const newMatched = new Set(matched).add(id);
      setMatched(newMatched);
      if (target < PAIRS.length - 1) setTarget(target + 1);
    }
  };

  return (
    <QuestShell
      emoji="🗺️"
      title="Vocabulary Treasure Hunt"
      subtitle="Tap the picture that matches the word."
      footer={done && <PrimaryButton onClick={onDone}>Treasure found! →</PrimaryButton>}
    >
      <div className="mb-6 text-center">
        <p className="text-sm text-muted-foreground">Find this word:</p>
        <p className="font-display text-3xl text-brand-purple-deep">{done ? "🏆 All found!" : current.word}</p>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {shuffled.map((p) => {
          const isMatched = matched.has(p.id);
          return (
            <button
              key={p.id}
              onClick={() => handleTap(p.id)}
              disabled={isMatched || done}
              className={`aspect-square rounded-2xl text-4xl sm:text-5xl border-2 transition-all active:scale-95 ${
                isMatched
                  ? "border-brand-mint bg-brand-mint/30 opacity-60"
                  : "border-border bg-card hover:border-brand-purple hover:bg-secondary"
              }`}
              aria-label={p.word}
            >
              {p.emoji}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        {matched.size} / {PAIRS.length} matched
      </p>
    </QuestShell>
  );
}
