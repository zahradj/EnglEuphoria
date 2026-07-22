import mascot from "@/assets/success-trail/trail-mascot.png";
import { LogoBubble } from "./LogoBubble";
import { PrimaryButton } from "./QuestShell";
import { LevelPicker } from "./LevelPicker";
import { TrackPicker } from "./TrackPicker";
import type { Difficulty, Track } from "./levels";

export function WelcomeCard({
  onContinue,
  difficulty,
  setDifficulty,
  track,
  setTrack,
}: {
  onContinue: () => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  track: Track;
  setTrack: (t: Track) => void;
}) {
  return (
    <main className="min-h-screen grid place-items-center px-4 py-8">
      <div className="max-w-3xl w-full rounded-3xl bg-card border-2 border-border shadow-[0_30px_60px_-25px_color-mix(in_oklch,var(--brand-emerald)_55%,transparent)] overflow-hidden">
        <div className="grid sm:grid-cols-[1.1fr_1fr] gap-0">
          <div
            className="p-7 sm:p-10 text-primary-foreground relative"
            style={{
              background:
                "linear-gradient(135deg, var(--brand-emerald-glow) 0%, var(--brand-emerald) 55%, var(--brand-emerald-deep) 100%)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <LogoBubble size={56} />
              <span className="font-display font-semibold tracking-wide text-sm uppercase opacity-90">
                Engleuphoria Success
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
              Welcome aboard ✨
            </h1>
            <p className="mt-4 text-base sm:text-lg opacity-95 leading-relaxed">
              I'm <strong>Professor Hoot</strong>. Together we'll walk a{" "}
              <strong>30-minute English trail</strong> across 6 stops — built for adults,
              professionals, and college students.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur">⏱️ 30 minutes</span>
              <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur">🎯 6 stops</span>
              <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur">🏆 Earn a badge</span>
            </div>
          </div>
          <div className="relative bg-brand-cream grid place-items-center p-6">
            <img
              src={mascot}
              alt="Professor Hoot, the Engleuphoria mascot"
              width={1024}
              height={1024}
              className="w-full max-w-xs animate-trail-float drop-shadow-2xl"
            />
          </div>
        </div>
        <div className="p-6 sm:p-8 border-t-2 border-border space-y-6">
          <div>
            <p className="font-display font-bold text-brand-emerald-deep mb-1">
              🧭 Pick your track
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              The trail adapts its topics to your world.
            </p>
            <TrackPicker value={track} onChange={setTrack} />
          </div>
          <div>
            <p className="font-display font-bold text-brand-emerald-deep mb-1">
              📊 Pick your level
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              CEFR A1 through C1 — change it any time from the top bar.
            </p>
            <LevelPicker value={difficulty} onChange={setDifficulty} />
          </div>
          <PrimaryButton onClick={onContinue}>I'm ready! Let's go →</PrimaryButton>
        </div>
      </div>
    </main>
  );
}
