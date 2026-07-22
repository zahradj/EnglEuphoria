import { useState } from "react";
import { QuestShell, PrimaryButton } from "../QuestShell";
import type { AnswerRecord } from "../useLesson";
import type { Difficulty } from "../levels";

type Prompt = { id: string; text: string; emoji: string };

const SETS: Record<Difficulty, Prompt[]> = {
  "pre-a1": [
    { id: "s1", text: "Say hello and your name.", emoji: "👋" },
    { id: "s2", text: "Name 3 colors you can see.", emoji: "🎨" },
    { id: "s3", text: "Count from 1 to 10.", emoji: "🔢" },
    { id: "s4", text: "Point to something and say what it is.", emoji: "👉" },
  ],
  standard: [
    { id: "s1", text: "Tell me about your best friend.", emoji: "👯" },
    { id: "s2", text: "What did you do yesterday?", emoji: "🕰️" },
    { id: "s3", text: "Describe your favorite food. Why do you like it?", emoji: "🍕" },
    { id: "s4", text: "If you had a superpower, what would it be and why?", emoji: "🦸" },
  ],
  challenge: [
    { id: "s1", text: "Describe a problem in your city and how you'd solve it.", emoji: "🏙️" },
    { id: "s2", text: "Talk about a book or movie that changed how you think.", emoji: "📖" },
    { id: "s3", text: "Should kids have phones at school? Defend your opinion.", emoji: "📱" },
    { id: "s4", text: "Imagine it's 10 years from now. Describe your day.", emoji: "🔮" },
  ],
};

export function Speaking({
  onDone,
  record,
  difficulty,
}: {
  onDone: () => void;
  record: (r: AnswerRecord) => void;
  difficulty: Difficulty;
}) {
  const PROMPTS = SETS[difficulty];
  const [i, setI] = useState(0);
  const [scored, setScored] = useState(false);
  const p = PROMPTS[i];
  const isLast = i === PROMPTS.length - 1;

  const score = (val: true | "partial" | false, label: string) => {
    setScored(true);
    record({ questId: "speaking", itemId: p.id, prompt: `${p.text} (${label})`, correct: val, skill: "speaking" });
  };

  return (
    <QuestShell
      emoji="🎤"
      title="Speaking Challenge"
      subtitle="Answer out loud. Teacher taps how it went."
      footer={
        scored &&
        (isLast ? (
          <PrimaryButton onClick={onDone}>See results 🏆</PrimaryButton>
        ) : (
          <PrimaryButton
            onClick={() => {
              setI(i + 1);
              setScored(false);
            }}
          >
            Next prompt →
          </PrimaryButton>
        ))
      }
    >
      <div
        className="rounded-3xl p-8 text-center mb-5 text-primary-foreground"
        style={{
          background:
            "linear-gradient(135deg, var(--brand-purple-glow), var(--brand-purple) 60%, var(--brand-purple-deep))",
        }}
      >
        <div className="text-5xl mb-3 animate-float" aria-hidden>{p.emoji}</div>
        <p className="font-display text-2xl font-bold leading-snug">{p.text}</p>
      </div>
      <div className="rounded-2xl border-2 border-dashed border-brand-purple/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          👩‍🏫 Teacher: how did she do?
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => score(true, "got it")}
            disabled={scored}
            className="px-3 py-3 rounded-xl font-semibold border-2 border-brand-mint bg-brand-mint/20 hover:bg-brand-mint/40 disabled:opacity-50 transition-all active:scale-95"
          >
            ✅ Got it
          </button>
          <button
            onClick={() => score("partial", "partial")}
            disabled={scored}
            className="px-3 py-3 rounded-xl font-semibold border-2 border-brand-sun bg-brand-sun/20 hover:bg-brand-sun/40 disabled:opacity-50 transition-all active:scale-95"
          >
            🟡 Partial
          </button>
          <button
            onClick={() => score(false, "struggled")}
            disabled={scored}
            className="px-3 py-3 rounded-xl font-semibold border-2 border-destructive/40 bg-destructive/10 hover:bg-destructive/20 disabled:opacity-50 transition-all active:scale-95"
          >
            💭 Struggled
          </button>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Prompt {i + 1} of {PROMPTS.length}</p>
    </QuestShell>
  );
}
