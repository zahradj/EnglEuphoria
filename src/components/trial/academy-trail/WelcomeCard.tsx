import mascot from "@/assets/mascot.png";
import { LogoBubble } from "./LogoBubble";
import { PrimaryButton } from "./QuestShell";
import { LevelPicker } from "./LevelPicker";
import type { Difficulty } from "./levels";

export function WelcomeCard({
  onContinue,
  difficulty,
  setDifficulty,
}: {
  onContinue: () => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
}) {
  return (
    <main className="min-h-screen grid place-items-center px-4 py-8">
      <div className="max-w-3xl w-full rounded-3xl bg-card border-2 border-border shadow-[0_30px_60px_-25px_color-mix(in_oklch,var(--brand-purple)_50%,transparent)] overflow-hidden">
        <div className="grid sm:grid-cols-[1.1fr_1fr] gap-0">
          <div
            className="p-7 sm:p-10 text-primary-foreground relative"
            style={{
              background:
                "linear-gradient(135deg, var(--brand-purple-glow) 0%, var(--brand-purple) 55%, var(--brand-purple-deep) 100%)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <LogoBubble size={56} />
              <span className="font-display font-semibold tracking-wide text-sm uppercase opacity-90">
                Engleuphoria Academy
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
              Hi superstar! ✨
            </h1>
            <p className="mt-4 text-base sm:text-lg opacity-95 leading-relaxed">
              I'm <strong>Professor Hoot</strong>, your guide today. Together we'll go on a
              30-minute English adventure across 6 fun quests.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur">⏱️ 30 minutes</span>
              <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur">🎯 6 mini-quests</span>
              <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur">🏆 Earn a badge</span>
            </div>
          </div>
          <div className="relative bg-brand-cream grid place-items-center p-6">
            <img
              src={mascot}
              alt="Professor Hoot, the Engleuphoria mascot"
              width={1024}
              height={1024}
              className="w-full max-w-xs animate-float drop-shadow-2xl"
            />
          </div>
        </div>
        <div className="p-6 sm:p-8 border-t-2 border-border">
          <p className="font-display font-bold text-brand-purple-deep mb-1">
            👩‍🏫 Teacher: pick a starting level
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            You can change it any time from the top bar if it feels too easy or too tricky.
          </p>
          <LevelPicker value={difficulty} onChange={setDifficulty} />
          <div className="mt-6">
            <PrimaryButton onClick={onContinue}>I'm ready! Let's go →</PrimaryButton>
          </div>
        </div>
      </div>
    </main>
  );
}
