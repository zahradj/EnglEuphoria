import { useState } from "react";
import { QuestShell, PrimaryButton } from "../QuestShell";
import type { AnswerRecord } from "../useLesson";
import type { Difficulty } from "../levels";

type Q = { id: string; before: string; after: string; options: string[]; answer: number; hint: string };

const SETS: Record<Difficulty, Q[]> = {
  "pre-a1": [
    { id: "g1", before: "I ", after: " Mia.", options: ["am", "is", "are"], answer: 0, hint: "to be" },
    { id: "g2", before: "This ", after: " a cat.", options: ["am", "is", "are"], answer: 1, hint: "to be" },
    { id: "g3", before: "I have ", after: " apple.", options: ["a", "an", "the"], answer: 1, hint: "a / an" },
    { id: "g4", before: "The dog ", after: " happy.", options: ["am", "is", "are"], answer: 1, hint: "to be" },
    { id: "g5", before: "I ", after: " a book.", options: ["have", "has", "is"], answer: 0, hint: "have / has" },
  ],
  standard: [
    { id: "g1", before: "She ", after: " my best friend.", options: ["am", "is", "are"], answer: 1, hint: "verb to be" },
    { id: "g2", before: "I ", after: " a cat and a dog.", options: ["have", "has", "haves"], answer: 0, hint: "have / has" },
    { id: "g3", before: "Look! He ", after: " a song right now.", options: ["sing", "sings", "is singing"], answer: 2, hint: "present continuous" },
    { id: "g4", before: "I want ", after: " orange juice, please.", options: ["a", "an", "the"], answer: 1, hint: "articles" },
    { id: "g5", before: "Yesterday we ", after: " to the park.", options: ["go", "went", "goed"], answer: 1, hint: "past simple" },
    { id: "g6", before: "If it rains tomorrow, I ", after: " at home.", options: ["stay", "will stay", "stayed"], answer: 1, hint: "first conditional" },
  ],
  challenge: [
    { id: "g1", before: "By the time we arrived, the movie ", after: " already started.", options: ["has", "had", "have"], answer: 1, hint: "past perfect" },
    { id: "g2", before: "If I ", after: " you, I'd apologize.", options: ["was", "were", "am"], answer: 1, hint: "2nd conditional" },
    { id: "g3", before: "She ", after: " here since 2019.", options: ["lives", "is living", "has been living"], answer: 2, hint: "present perfect continuous" },
    { id: "g4", before: "The cake ", after: " by my grandma.", options: ["baked", "was baked", "is baking"], answer: 1, hint: "passive voice" },
    { id: "g5", before: "I wish I ", after: " more time to read.", options: ["have", "had", "will have"], answer: 1, hint: "wish + past" },
    { id: "g6", before: "Neither Tom nor his sisters ", after: " coming.", options: ["is", "are", "was"], answer: 1, hint: "subject-verb agreement" },
  ],
};

export function Grammar({
  onDone,
  record,
  difficulty,
}: {
  onDone: () => void;
  record: (r: AnswerRecord) => void;
  difficulty: Difficulty;
}) {
  const QUESTIONS = SETS[difficulty];
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const q = QUESTIONS[i];
  const isLast = i === QUESTIONS.length - 1;

  const pick = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    record({
      questId: "grammar",
      itemId: q.id,
      prompt: `${q.before}___${q.after}`,
      correct: idx === q.answer,
      skill: "grammar",
    });
  };

  return (
    <QuestShell
      emoji="🧩"
      title="Grammar Quest"
      subtitle="Pick the chip that fits the sentence."
      footer={
        picked !== null &&
        (isLast ? (
          <PrimaryButton onClick={onDone}>Complete quest →</PrimaryButton>
        ) : (
          <PrimaryButton
            onClick={() => {
              setI(i + 1);
              setPicked(null);
            }}
          >
            Next →
          </PrimaryButton>
        ))
      }
    >
      <div className="rounded-2xl bg-secondary/60 p-5 mb-5">
        <p className="font-display text-xl sm:text-2xl text-brand-purple-deep leading-relaxed">
          {q.before}
          <span
            className={`inline-block min-w-24 mx-1 px-3 py-1 rounded-xl border-2 border-dashed ${
              picked === null ? "border-brand-purple text-muted-foreground" : picked === q.answer ? "border-brand-mint bg-brand-mint/30" : "border-destructive bg-destructive/10"
            }`}
          >
            {picked === null ? "____" : q.options[picked]}
          </span>
          {q.after}
        </p>
        <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">hint: {q.hint}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {q.options.map((opt, idx) => {
          const state =
            picked === null
              ? "bg-card border-border hover:border-brand-purple hover:bg-secondary"
              : idx === q.answer
                ? "bg-brand-mint/40 border-brand-mint"
                : idx === picked
                  ? "bg-destructive/10 border-destructive"
                  : "bg-card border-border opacity-60";
          return (
            <button
              key={`${q.id}-${idx}`}
              onClick={() => pick(idx)}
              disabled={picked !== null}
              className={`px-5 py-3 rounded-full font-display font-bold text-lg border-2 transition-all active:scale-95 ${state}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Question {i + 1} of {QUESTIONS.length}</p>
    </QuestShell>
  );
}
