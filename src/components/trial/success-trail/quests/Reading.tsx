import { useState } from "react";
import { PrimaryButton, QuestShell } from "../QuestShell";
import { ChoiceButton } from "../ChoiceButton";
import { READING, type Track } from "../levels";
import type { AnswerRecord } from "../useLesson";

export function Reading({
  onDone,
  record,
  track,
}: {
  onDone: () => void;
  record: (r: AnswerRecord) => void;
  track: Track;
}) {
  const item = READING[track];
  const [picked, setPicked] = useState<string | null>(null);

  const pick = (o: string) => {
    if (picked) return;
    setPicked(o);
    const correct = o === item.answer;
    record({ quest: "Reading", prompt: item.question, answer: o, correct });
  };

  return (
    <QuestShell
      emoji="📖"
      title="Reading Island"
      subtitle="Read the passage, then answer the question."
      footer={
        <PrimaryButton disabled={!picked} onClick={onDone}>
          Continue →
        </PrimaryButton>
      }
    >
      <article className="rounded-2xl bg-secondary/50 border-2 border-border p-5 leading-relaxed text-foreground">
        {item.passage}
      </article>
      <p className="mt-5 font-display font-bold text-brand-emerald-deep">{item.question}</p>
      <div className="grid gap-2 mt-3">
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
