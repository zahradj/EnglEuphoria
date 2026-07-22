import { type ReactNode, useEffect } from "react";
import { ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useEmbedded } from "../EmbeddedContext";

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
  const embedded = useEmbedded();

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
    <div className={embedded ? "w-full bg-playground-mesh" : "min-h-screen bg-playground-mesh"}>
      <div
        className={`mx-auto flex ${embedded ? "" : "min-h-screen"} max-w-6xl flex-col ${
          embedded ? "px-3 py-2 sm:px-4 sm:py-3 gap-2" : "px-4 py-4 sm:px-6 sm:py-6"
        }`}
      >
        {/* Top bar */}
        <header className="flex items-center justify-between gap-3">
          {embedded ? (
            <div className="w-8" />
          ) : (
            <a
              href="/"
              className="glass-card flex h-12 w-12 items-center justify-center rounded-2xl text-[color:var(--playground-ink)] transition hover:scale-105"
              aria-label="Back to home"
            >
              <span className="text-lg">🏠</span>
            </a>
          )}
          <div className="flex flex-1 items-center justify-center gap-2">
            {phases.map((p, i) => (
              <div
                key={p.id}
                className={`${embedded ? "h-1.5" : "h-2.5"} flex-1 max-w-16 rounded-full transition-all duration-300`}
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
              className={`glass-card flex ${embedded ? "h-8 px-2 text-xs" : "h-12 px-4 text-sm"} items-center gap-2 rounded-2xl font-semibold text-[color:var(--playground-ink)] transition hover:scale-105`}
              aria-label="Replay audio"
            >
              <Volume2 className={embedded ? "h-4 w-4" : "h-5 w-5"} />
              <span className="hidden sm:inline">Replay</span>
            </button>
          ) : (
            <div className="w-8" />
          )}
        </header>

        {/* Phase label */}
        <div className={embedded ? "mt-2 text-center" : "mt-6 text-center"}>
          <p className={`${embedded ? "text-[11px]" : "text-sm"} font-semibold uppercase tracking-widest text-[color:var(--playground-primary)]`}>
            {phases[currentIndex]?.label} · Step {currentIndex + 1} of {phases.length}
          </p>
          <h1 className={`mt-1 font-black text-[color:var(--playground-ink)] ${embedded ? "text-xl sm:text-2xl" : "text-4xl sm:text-5xl"}`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`${embedded ? "mt-1 text-sm" : "mt-2 text-lg sm:text-xl"} text-[color:var(--playground-ink)]/70`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Phase content */}
        <main className={embedded ? "mt-3 flex-1" : "mt-8 flex-1"}>
          <div className={`glass-card-strong shadow-playground-soft rounded-[2rem] ${embedded ? "p-3 sm:p-4" : "p-6 sm:p-10"}`}>
            {children}
          </div>
        </main>

        {/* Nav */}
        <footer className={embedded ? "mt-3 flex items-center justify-between gap-3" : "mt-6 flex items-center justify-between gap-4"}>
          <button
            onClick={onPrev}
            disabled={isFirst}
            className={`glass-card flex items-center gap-2 rounded-2xl font-bold text-[color:var(--playground-ink)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 ${embedded ? "h-10 px-4 text-sm" : "h-16 px-6 text-base"}`}
          >
            <ArrowLeft className={embedded ? "h-4 w-4" : "h-5 w-5"} />
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!canAdvance || isLast}
            className={`shadow-playground flex items-center gap-2 rounded-2xl font-extrabold text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 ${embedded ? "h-10 px-5 text-sm" : "h-16 px-8 text-lg"}`}
            style={{ background: "var(--playground-primary)" }}
          >
            {isLast ? "Finish" : "Next"}
            <ArrowRight className={embedded ? "h-4 w-4" : "h-5 w-5"} />
          </button>
        </footer>
      </div>
    </div>
  );
}
