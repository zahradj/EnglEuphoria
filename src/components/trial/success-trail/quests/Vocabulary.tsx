import { useMemo, useState } from "react";
import { QuestShell } from "../QuestShell";
import { ChoiceButton } from "../ChoiceButton";
import { VOCAB, type Difficulty, type Track } from "../levels";
import type { AnswerRecord } from "../useLesson";

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Vocabulary({
  onDone,
  record,
  difficulty,
  track,
}: {
  onDone: () => void;
  record: (r: AnswerRecord) => void;
  difficulty: Difficulty;
  track: Track;
}) {
  const items = VOCAB[track][difficulty];
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const item = items[i];
  const choices = useMemo(() => shuffle([item.def, ...items.filter((_, idx) => idx !== i).slice(0, 3).map((x) => x.def)]), [i, items, item.def]);

  const next = () => {
    setPicked(null);
    if (i + 1 < items.length) setI(i + 1);
    else onDone();
  };

  const pick = (def: string) => {
    if (picked) return;
    setPicked(def);
    const correct = def === item.def;
    record({ quest: "Vocabulary", prompt: item.term, answer: def, correct });
    setTimeout(next, 850);
  };

  return (
    <QuestShell
      emoji="🗺️"
      title="Vocabulary Treasure"
      subtitle={`Word ${i + 1} of ${items.length} · level ${difficulty}`}
      footer={null}
    >
      <p className="text-sm text-muted-foreground mb-2">Match the word to its meaning:</p>
      <div className="rounded-2xl bg-brand-mint border-2 border-brand-emerald/30 p-5 mb-4">
        <p className="font-display text-3xl font-bold text-brand-emerald-deep">{item.term}</p>
      </div>
      <div className="grid gap-2">
        {choices.map((c) => {
          const state =
            picked == null
              ? "idle"
              : c === item.def
              ? "correct"
              : c === picked
              ? "wrong"
              : "idle";
          return (
            <ChoiceButton key={c} state={state} onClick={() => pick(c)}>
              {c}
            </ChoiceButton>
          );
        })}
      </div>
    </QuestShell>
  );
}
