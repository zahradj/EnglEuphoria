import { QuestShell, PrimaryButton } from "../QuestShell";
import type { AnswerRecord } from "../useLesson";
import { LEVEL_META, type Difficulty } from "../levels";

const SKILL_LABELS: Record<AnswerRecord["skill"], string> = {
  warmup: "Conversation warm-ups",
  vocab: "Vocabulary",
  grammar: "Grammar",
  reading: "Reading",
  listening: "Listening",
  speaking: "Speaking",
};

const LADDER: Record<Difficulty, { high: { level: string; note: string }; mid: { level: string; note: string }; low: { level: string; note: string } }> = {
  "pre-a1": {
    high: { level: "A1 — Beginner", note: "Ready to step up to the Standard track next time." },
    mid: { level: "Pre-A1 (solid)", note: "Comfortable with the basics. Keep building core vocab." },
    low: { level: "Pre-A1 (emerging)", note: "Lots of repetition with pictures and short phrases will help." },
  },
  standard: {
    high: { level: "A2 — Elementary", note: "Solid foundation. Could try the Challenge track next." },
    mid: { level: "A1+ — High Beginner", note: "Confident with greetings and vocab. Build sentence structure next." },
    low: { level: "A1 — Beginner", note: "Great start! Focus on core vocab, 'to be', and simple questions." },
  },
  challenge: {
    high: { level: "B2 — Upper Intermediate", note: "Strong all-round. Read longer texts and tackle nuanced topics." },
    mid: { level: "B1 — Intermediate", note: "Ready for richer topics, mixed tenses, longer speaking turns." },
    low: { level: "A2+ — Pre-Intermediate", note: "The Challenge track stretched her. Mix in Standard practice." },
  },
};

function suggestLevel(score: number, total: number, difficulty: Difficulty): { level: string; emoji: string; note: string } {
  const pct = total === 0 ? 0 : score / total;
  const band = LADDER[difficulty];
  const emoji = LEVEL_META[difficulty].emoji;
  if (pct >= 0.8) return { ...band.high, emoji };
  if (pct >= 0.5) return { ...band.mid, emoji };
  return { ...band.low, emoji };
}

export function Results({
  answers,
  xp,
  difficulty,
  onRestart,
}: {
  answers: AnswerRecord[];
  xp: number;
  difficulty: Difficulty;
  onRestart: () => void;
}) {
  const correctCount = answers.filter((a) => a.correct === true).length + answers.filter((a) => a.correct === "partial").length * 0.5;
  const total = answers.length;

  const bySkill: Record<string, { ok: number; total: number }> = {};
  answers.forEach((a) => {
    bySkill[a.skill] ??= { ok: 0, total: 0 };
    bySkill[a.skill].total++;
    if (a.correct === true) bySkill[a.skill].ok++;
    else if (a.correct === "partial") bySkill[a.skill].ok += 0.5;
  });

  const strengths: string[] = [];
  const focus: string[] = [];
  Object.entries(bySkill).forEach(([skill, { ok, total }]) => {
    const label = SKILL_LABELS[skill as AnswerRecord["skill"]];
    const pct = total === 0 ? 0 : ok / total;
    if (pct >= 0.75) strengths.push(label);
    else if (pct < 0.6) focus.push(label);
  });

  const suggestion = suggestLevel(correctCount, total, difficulty);

  return (
    <QuestShell
      emoji="🏆"
      title="Lesson Complete!"
      subtitle="Amazing work today. Here's your adventure recap."
      footer={
        <div className="flex flex-wrap gap-3">
          <PrimaryButton onClick={onRestart}>Play again 🔁</PrimaryButton>
        </div>
      }
    >
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl bg-brand-purple/10 border-2 border-brand-purple/30 p-4 text-center">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Total XP</div>
          <div className="font-display text-3xl text-brand-purple-deep">⭐ {xp}</div>
        </div>
        <div className="rounded-2xl bg-brand-mint/20 border-2 border-brand-mint p-4 text-center">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Score</div>
          <div className="font-display text-3xl text-brand-purple-deep">
            {Math.round(correctCount)} / {total}
          </div>
        </div>
        <div className="rounded-2xl bg-brand-sun/20 border-2 border-brand-sun p-4 text-center">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Badge</div>
          <div className="font-display text-2xl text-brand-purple-deep">
            {correctCount / Math.max(1, total) >= 0.75 ? "🥇 Champion" : correctCount / Math.max(1, total) >= 0.5 ? "🥈 Explorer" : "🥉 Rookie"}
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-5 mb-5 text-primary-foreground"
        style={{ background: "linear-gradient(135deg, var(--brand-purple), var(--brand-purple-deep))" }}>
        <div className="text-xs uppercase font-semibold opacity-80">Suggested level</div>
        <div className="font-display text-2xl font-bold mt-1">{suggestion.emoji} {suggestion.level}</div>
        <p className="mt-1 text-sm opacity-95">{suggestion.note}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border-2 border-brand-mint bg-brand-mint/15 p-4">
          <h3 className="font-display font-bold text-brand-purple-deep mb-2">💪 Strengths</h3>
          {strengths.length > 0 ? (
            <ul className="text-sm space-y-1">{strengths.map((s) => <li key={s}>• {s}</li>)}</ul>
          ) : <p className="text-sm text-muted-foreground">Lots of room to shine — let's build skills together!</p>}
        </div>
        <div className="rounded-2xl border-2 border-brand-pink bg-brand-pink/15 p-4">
          <h3 className="font-display font-bold text-brand-purple-deep mb-2">🎯 Let's practice</h3>
          {focus.length > 0 ? (
            <ul className="text-sm space-y-1">{focus.map((s) => <li key={s}>• {s}</li>)}</ul>
          ) : <p className="text-sm text-muted-foreground">Wow — everything looks strong!</p>}
        </div>
      </div>

      <details className="rounded-2xl border-2 border-border bg-secondary/40 p-4">
        <summary className="font-display font-bold text-brand-purple-deep cursor-pointer">
          👩‍🏫 Teacher log ({answers.length} items)
        </summary>
        <ul className="mt-3 space-y-1 text-sm">
          {answers.map((a) => (
            <li key={a.itemId} className="flex items-start gap-2">
              <span aria-hidden>{a.correct === true ? "✅" : a.correct === "partial" ? "🟡" : "❌"}</span>
              <span className="text-muted-foreground"><strong className="text-foreground">[{SKILL_LABELS[a.skill]}]</strong> {a.prompt}</span>
            </li>
          ))}
        </ul>
      </details>
    </QuestShell>
  );
}
