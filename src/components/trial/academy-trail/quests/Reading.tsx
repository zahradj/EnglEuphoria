import { useState } from "react";
import { QuestShell, PrimaryButton } from "../QuestShell";
import { ChoiceButton } from "../ChoiceButton";
import type { AnswerRecord } from "../useLesson";
import type { Difficulty } from "../levels";

type Q = { id: string; prompt: string; options: string[]; answer: number };
type Set = { story: string; questions: Q[] };

const SETS: Record<Difficulty, Set> = {
  "pre-a1": {
    story: "This is Tom. Tom has a red ball. Tom likes to play with his dog, Max. They play in the park.",
    questions: [
      { id: "r1", prompt: "What color is Tom's ball?", options: ["Blue", "Red", "Green"], answer: 1 },
      { id: "r2", prompt: "Who is Max?", options: ["Tom's brother", "Tom's dog", "Tom's friend"], answer: 1 },
      { id: "r3", prompt: "Where do they play?", options: ["At home", "At school", "In the park"], answer: 2 },
    ],
  },
  standard: {
    story:
      "Last Saturday, Mia went to the beach with her family. They built a big sandcastle and ate ice cream. In the afternoon, it started to rain, so they went home. Mia was a little sad, but her mom made hot chocolate and they watched a funny movie together.",
    questions: [
      { id: "r1", prompt: "Where did Mia go on Saturday?", options: ["To the mountains", "To the beach", "To school"], answer: 1 },
      { id: "r2", prompt: "Why did the family go home?", options: ["They were hungry", "It was late", "It started to rain"], answer: 2 },
      { id: "r3", prompt: "How did Mia feel at the end?", options: ["Still a little sad but okay", "Very angry", "Excited to go back"], answer: 0 },
    ],
  },
  challenge: {
    story:
      "Although Lara had been training for months, she felt nervous the morning of the science fair. Her project — a small robot that could sort recycling — had broken twice during practice. When her name was finally called, she took a deep breath and pressed the button. To her relief, the robot whirred to life and worked perfectly. The judges were impressed not only by the design but by how clearly she explained the problem it solved. She didn't win first place, but she left with something better: the confidence that her ideas mattered.",
    questions: [
      { id: "r1", prompt: "How did Lara feel before her turn?", options: ["Confident", "Nervous", "Bored"], answer: 1 },
      { id: "r2", prompt: "What impressed the judges most?", options: ["Her speed", "The robot's color", "Her clear explanation and design"], answer: 2 },
      { id: "r3", prompt: "What did Lara gain in the end?", options: ["First place", "Confidence in her ideas", "A new robot"], answer: 1 },
      { id: "r4", prompt: "The word 'whirred' suggests the robot…", options: ["broke down", "made a soft running sound", "stayed silent"], answer: 1 },
    ],
  },
};

export function Reading({
  onDone,
  record,
  difficulty,
}: {
  onDone: () => void;
  record: (r: AnswerRecord) => void;
  difficulty: Difficulty;
}) {
  const { story, questions } = SETS[difficulty];
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState(false);
  const q = questions[i];
  const isLast = i === questions.length - 1;

  return (
    <QuestShell
      emoji="🏝️"
      title="Reading Island"
      subtitle="Read the story, then answer the questions."
      footer={
        answered &&
        (isLast ? (
          <PrimaryButton onClick={onDone}>Sail onward →</PrimaryButton>
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
      <div className="rounded-2xl border-2 border-brand-sun/60 bg-brand-sun/20 p-5 mb-5">
        <p className="text-base leading-relaxed text-foreground">{story}</p>
      </div>
      <p className="font-display text-xl text-brand-purple-deep mb-3">{q.prompt}</p>
      <div className="grid gap-3">
        {q.options.map((opt, idx) => (
          <ChoiceButton
            key={`${q.id}-${idx}`}
            isCorrect={idx === q.answer}
            locked={answered}
            onResolve={(c) => {
              record({ questId: "reading", itemId: q.id, prompt: q.prompt, correct: c, skill: "reading" });
              if (c) setAnswered(true);
            }}
          >
            {opt}
          </ChoiceButton>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Question {i + 1} of {questions.length}</p>
    </QuestShell>
  );
}
