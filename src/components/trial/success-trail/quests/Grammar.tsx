import { useState } from "react";
import { QuestShell } from "../QuestShell";
import { ChoiceButton } from "../ChoiceButton";
import { GRAMMAR, type Difficulty } from "../levels";
import type { AnswerRecord } from "../useLesson";

export function Grammar({
  onDone,
  record,
  difficulty,
}: {
  onDone: () => void;
  record: (r: AnswerRecord) => void;
  difficulty: Difficulty;
}) {
  const items = GRAMMAR[difficulty];
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const item = items[i];

  const next = () => {
    setPicked(null);
    if (i + 1 < items.length) setI(i + 1);
    else onDone();
  };

  const pick = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    const correct = opt === item.answer;
    record({ quest: "Grammar", prompt: item.sentence, answer: opt, correct });
    setTimeout(next, 850);
  };

  const parts = item.sentence.split("___");

  return (
    <QuestShell
      emoji="🧩"
      title="Grammar Quest"
      subtitle={`Item ${i + 1} of ${items.length} · level ${difficulty}`}
      footer={null}
    >
      <p className="text-lg sm:text-xl leading-relaxed text-foreground">
        {parts[0]}
        <span className="inline-block min-w-[3.5rem] mx-1 px-3 py-0.5 rounded-md bg-brand-mint border-2 border-dashed border-brand-emerald text-brand-emerald-deep font-bold">
          ?
        </span>
        {parts[1]}
      </p>
      <div className="grid gap-2 mt-5">
        {item.options.map((o) => {
          const state =
            picked == null
              ? "idle"
              : o === item.answer
              ? "correct"
              : o === picked
              ? "wrong"
              : "idle";
          return (
            <ChoiceButton key={o} state={state} onClick={() => pick(o)}>
              {o}
            </ChoiceButton>
          );
        })}
      </div>
    </QuestShell>
  );
}
