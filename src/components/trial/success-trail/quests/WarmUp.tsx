import { useState } from "react";
import { GhostButton, PrimaryButton, QuestShell } from "../QuestShell";
import { WARMUP, type Track } from "../levels";
import type { AnswerRecord } from "../useLesson";

export function WarmUp({
  onDone,
  record,
  track,
}: {
  onDone: () => void;
  record: (r: AnswerRecord) => void;
  track: Track;
}) {
  const prompts = WARMUP[track];
  const [i, setI] = useState(0);
  const [text, setText] = useState("");

  const submit = () => {
    record({ quest: "Warm-Up", prompt: prompts[i], answer: text.trim() || "(spoken)" });
    setText("");
    if (i + 1 < prompts.length) setI(i + 1);
    else onDone();
  };

  return (
    <QuestShell
      emoji="💬"
      title="Warm-Up"
      subtitle={`Question ${i + 1} of ${prompts.length}`}
      footer={
        <div className="flex flex-col sm:flex-row gap-3">
          <GhostButton type="button" onClick={() => onDone()}>Skip stop</GhostButton>
          <PrimaryButton onClick={submit}>{i + 1 < prompts.length ? "Next question →" : "Finish warm-up →"}</PrimaryButton>
        </div>
      }
    >
      <p className="text-lg sm:text-xl font-display font-semibold text-brand-emerald-deep">
        {prompts[i]}
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Jot your answer or say it out loud…"
        className="mt-4 w-full min-h-[120px] rounded-2xl border-2 border-border bg-card p-4 outline-none focus:border-brand-emerald resize-y"
      />
    </QuestShell>
  );
}
