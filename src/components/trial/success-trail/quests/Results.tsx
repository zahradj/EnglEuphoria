import { GhostButton, PrimaryButton, QuestShell } from "../QuestShell";
import { TRACK_LABEL, type Difficulty, type Track } from "../levels";
import type { AnswerRecord } from "../useLesson";

function badgeFor(xp: number) {
  if (xp >= 200) return { label: "Trail Champion", emoji: "🏆" };
  if (xp >= 130) return { label: "Trail Explorer", emoji: "🥇" };
  if (xp >= 70) return { label: "Trail Pathfinder", emoji: "🥈" };
  return { label: "Trail Beginner", emoji: "🌱" };
}

export function Results({
  answers,
  xp,
  difficulty,
  track,
  onRestart,
}: {
  answers: AnswerRecord[];
  xp: number;
  difficulty: Difficulty;
  track: Track;
  onRestart: () => void;
}) {
  const scored = answers.filter((a) => typeof a.correct === "boolean");
  const correct = scored.filter((a) => a.correct).length;
  const badge = badgeFor(xp);

  const byQuest = answers.reduce<Record<string, AnswerRecord[]>>((acc, a) => {
    (acc[a.quest] ||= []).push(a);
    return acc;
  }, {});

  return (
    <QuestShell
      emoji={badge.emoji}
      title={`You earned: ${badge.label}!`}
      subtitle={`${TRACK_LABEL[track]} · level ${difficulty} · ${xp} XP`}
      footer={
        <div className="flex flex-col sm:flex-row gap-3">
          <GhostButton type="button" onClick={() => window.print()}>Save as PDF</GhostButton>
          <PrimaryButton onClick={onRestart}>Walk a new trail →</PrimaryButton>
        </div>
      }
    >
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <Stat label="XP earned" value={`${xp}`} />
        <Stat label="Right answers" value={`${correct} / ${scored.length || "—"}`} />
        <Stat label="Stops walked" value={`${Object.keys(byQuest).length}`} />
      </div>
      <div className="space-y-4">
        {Object.entries(byQuest).map(([quest, list]) => (
          <div key={quest} className="rounded-2xl border-2 border-border bg-secondary/40 p-4">
            <p className="font-display font-bold text-brand-emerald-deep mb-2">{quest}</p>
            <ul className="space-y-1 text-sm">
              {list.map((a, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span aria-hidden>
                    {a.correct === true ? "✅" : a.correct === false ? "❌" : "💬"}
                  </span>
                  <span className="text-muted-foreground">
                    <span className="text-foreground">{a.prompt}</span> — {a.answer}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </QuestShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-brand-mint border-2 border-brand-emerald/30 p-4 text-center">
      <p className="font-display text-3xl font-bold text-brand-emerald-deep">{value}</p>
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}
