import { type ReactNode, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Volume2, Home } from "lucide-react";
import confetti from "canvas-confetti";

export type PhaseDef = { id: string; label: string };

type Props = {
  phases: PhaseDef[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onReplay?: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  canAdvance?: boolean;
  finishedCelebration?: boolean;
};

export function LessonShell({
  phases,
  currentIndex,
  onPrev,
  onNext,
  onReplay,
  title,
  subtitle,
  children,
  canAdvance = true,
  finishedCelebration,
}: Props) {
  const isLast = currentIndex >= phases.length - 1;
  const isFirst = currentIndex <= 0;

  useEffect(() => {
    if (finishedCelebration) {
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.4 },
        colors: ["#FE6A2F", "#FEFBDD", "#FFD49A", "#FF9A3D"],
      });
    }
  }, [finishedCelebration]);

  return (
    <div className="min-h-screen bg-playground-mesh">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-8">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="glass-card flex h-12 w-12 items-center justify-center rounded-2xl text-[color:var(--playground-ink)] transition hover:scale-105"
            aria-label="Back to home"
          >
            <Home className="h-5 w-5" />
          </Link>
          <div className="flex flex-1 items-center justify-center gap-2">
            {phases.map((p, i) => (
              <div
                key={p.id}
                className="h-2.5 flex-1 max-w-16 rounded-full transition-all duration-300"
                style={{
                  background:
                    i <= currentIndex
                      ? "var(--playground-primary)"
                      : "color-mix(in oklab, var(--playground-primary) 18%, white)",
                }}
              />
            ))}
          </div>
          {onReplay ? (
            <button
              onClick={onReplay}
              className="glass-card flex h-12 items-center gap-2 rounded-2xl px-4 text-sm font-semibold text-[color:var(--playground-ink)] transition hover:scale-105"
              aria-label="Replay audio"
            >
              <Volume2 className="h-5 w-5" />
              <span className="hidden sm:inline">Replay</span>
            </button>
          ) : (
            <div className="w-12" />
          )}
        </header>

        {/* Phase label */}
        <div className="mt-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[color:var(--playground-primary)]">
            {phases[currentIndex]?.label} · Step {currentIndex + 1} of {phases.length}
          </p>
          <h1 className="mt-2 text-4xl font-black text-[color:var(--playground-ink)] sm:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-lg text-[color:var(--playground-ink)]/70 sm:text-xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Phase content */}
        <main className="mt-8 flex-1">
          <div className="glass-card-strong shadow-playground-soft rounded-[2rem] p-6 sm:p-10">
            {children}
          </div>
        </main>

        {/* Nav */}
        <footer className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="glass-card flex h-16 items-center gap-2 rounded-2xl px-6 text-base font-bold text-[color:var(--playground-ink)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!canAdvance || isLast}
            className="shadow-playground flex h-16 items-center gap-2 rounded-2xl px-8 text-lg font-extrabold text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: "var(--playground-primary)" }}
          >
            {isLast ? "Finish" : "Next"}
            <ArrowRight className="h-5 w-5" />
          </button>
        </footer>
      </div>
    </div>
  );
}
