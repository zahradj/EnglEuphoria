import { useState } from "react";
import { QuestShell, PrimaryButton } from "../QuestShell";
import { ChoiceButton } from "../ChoiceButton";
import type { AnswerRecord } from "../useLesson";
import type { Difficulty } from "../levels";

type Q = { id: string; prompt: string; options: string[]; answer: number };

const SETS: Record<Difficulty, Q[]> = {
  "pre-a1": [
    { id: "w1", prompt: "Hello! 👋", options: ["Goodbye!", "Hello!", "Thank you!"], answer: 1 },
    { id: "w2", prompt: "What is your name?", options: ["My name is Emma.", "I am happy.", "It is red."], answer: 0 },
    { id: "w3", prompt: "How old are you? (point to a number)", options: ["I'm 12.", "I'm a girl.", "I'm here."], answer: 0 },
    { id: "w4", prompt: "What color is the sky? ☀️", options: ["Green", "Blue", "Pink"], answer: 1 },
  ],
  standard: [
    { id: "w1", prompt: "How are you today?", options: ["My name is Anna.", "I'm fine, thank you!", "I am 12 years old."], answer: 1 },
    { id: "w2", prompt: "What's your name?", options: ["I'm from Spain.", "I have a dog.", "My name is Emma."], answer: 2 },
    { id: "w3", prompt: "How old are you?", options: ["I'm 12 years old.", "I'm a student.", "It's Monday."], answer: 0 },
    { id: "w4", prompt: "Where are you from?", options: ["I like pizza.", "I'm from Italy.", "I'm tired."], answer: 1 },
  ],
  challenge: [
    { id: "w1", prompt: "How have you been lately?", options: ["I went there yesterday.", "Pretty good, thanks — busy with school.", "It's mine, actually."], answer: 1 },
    { id: "w2", prompt: "What are you up to this weekend?", options: ["I'm meeting friends downtown.", "I were tired.", "Since two hours."], answer: 0 },
    { id: "w3", prompt: "If you could live anywhere, where would it be?", options: ["I will live in Paris yesterday.", "Probably somewhere by the sea.", "I am living here since born."], answer: 1 },
    { id: "w4", prompt: "What's something you're really good at?", options: ["I think I'm pretty good at drawing.", "I am good in the drawing.", "I drawing very good."], answer: 0 },
  ],
};

export function WarmUp({
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
  const [answered, setAnswered] = useState(false);
  const q = QUESTIONS[i];
  const isLast = i === QUESTIONS.length - 1;

  return (
    <QuestShell
      emoji="💬"
      title="Warm-Up Bubbles"
      subtitle="Tap the bubble that answers the question."
      footer={
        answered &&
        (isLast ? (
          <PrimaryButton onClick={onDone}>Finish quest →</PrimaryButton>
        ) : (
          <PrimaryButton
            onClick={() => {
              setI(i + 1);
              setAnswered(false);
            }}
          >
            Next question →
          </PrimaryButton>
        ))
      }
    >
      <p className="font-display text-2xl text-brand-purple-deep mb-5">{q.prompt}</p>
      <div className="grid gap-3">
        {q.options.map((opt, idx) => (
          <ChoiceButton
            key={`${q.id}-${idx}`}
            isCorrect={idx === q.answer}
            locked={answered}
            onResolve={(correct) => {
              record({ questId: "warmup", itemId: q.id, prompt: q.prompt, correct, skill: "warmup" });
              if (correct) setAnswered(true);
            }}
          >
            {opt}
          </ChoiceButton>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Question {i + 1} of {QUESTIONS.length}</p>
    </QuestShell>
  );
}
