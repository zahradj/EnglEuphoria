/**
 * Trail-style chrome reused by the PlaygroundLessonPlayer.
 *
 * Mirrors the look of `PlaygroundTrailLesson` (yellow mesh background,
 * glassy header, mascot bubble, star counter, glass slide card and
 * celebration screen) so that GENERATED Playground lessons render with
 * the same visual identity as the hand-built trail demo.
 *
 * These components are intentionally self-contained — they import the
 * same asset bundle as the trail demo and do not depend on the trail
 * file's internals, so refactors to the trail demo cannot break
 * generated lesson rendering and vice versa.
 *
 * Brand: Playground hub — Orange #FE6A2F + Yellow #FEFBDD.
 */
import { useMemo } from "react";
import logo from "@/assets/playground-trail/logo.png";
import mascot from "@/assets/playground-trail/mascot.png";
import starImg from "@/assets/playground-trail/star.png";
import trophy from "@/assets/playground-trail/trophy.png";

// ---------- background ----------
export function TrailBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "radial-gradient(at 20% 10%, rgba(254,106,47,0.35) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(254,251,221,0.9) 0px, transparent 50%), radial-gradient(at 80% 90%, rgba(254,106,47,0.25) 0px, transparent 50%), radial-gradient(at 10% 90%, rgba(255,221,120,0.6) 0px, transparent 50%)",
      }}
    />
  );
}

// ---------- logo bubble ----------
export function LogoBubble({ size = 84 }: { size?: number }) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <style>{`@keyframes logo-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }`}</style>
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-white/40"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, #FFD0A8 0%, #FE6A2F 55%, #B5400C 100%)",
          boxShadow:
            "0 14px 28px -10px rgba(254,106,47,0.6), inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -8px 14px rgba(0,0,0,0.18)",
          animation: "logo-float 3s ease-in-out infinite",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute left-[18%] top-[10%] h-[28%] w-[40%] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
        <img
          src={logo}
          alt="Engleuphoria logo"
          className="relative z-10 object-contain drop-shadow"
          style={{ width: size * 0.72, height: size * 0.72 }}
        />
      </div>
    </div>
  );
}

// ---------- progress + counters ----------
export function ProgressDots({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label?: string;
}) {
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all ${
            i < current
              ? "w-3 bg-[#FE6A2F]"
              : i === current
                ? "w-6 bg-[#FE6A2F]"
                : "w-3 bg-[#FE6A2F]/25"
          }`}
        />
      ))}
      {label && (
        <span className="ml-2 text-xs font-medium text-[#FE6A2F]/80">{label}</span>
      )}
    </div>
  );
}

export function StarCounter({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-[#FE6A2F] px-4 py-2 text-white shadow-lg">
      <img src={starImg} alt="" className="h-5 w-5" width={1024} height={1024} />
      <span className="text-lg font-extrabold tabular-nums">{count}</span>
    </div>
  );
}

export function CefrPill({ cefr }: { cefr?: string }) {
  if (!cefr) return null;
  return (
    <span className="rounded-full border border-[#FE6A2F]/30 bg-white/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#FE6A2F] shadow-sm">
      {cefr}
    </span>
  );
}

// ---------- containers ----------
export function TrailHeader({
  title,
  current,
  total,
  stars,
  cefr,
  onExit,
}: {
  title: string;
  current: number;
  total: number;
  stars: number;
  cefr?: string;
  onExit?: () => void;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-center gap-3 rounded-3xl border border-white/60 bg-white/50 px-5 py-3 shadow-lg backdrop-blur-xl">
      <LogoBubble size={72} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-[#FE6A2F]">
          Engleuphoria · {title}
        </div>
        <ProgressDots
          current={current}
          total={total}
          label={`Step ${Math.min(current + 1, total)} of ${total}`}
        />
      </div>
      <CefrPill cefr={cefr} />
      <StarCounter count={stars} />
      {onExit && (
        <button
          onClick={onExit}
          className="rounded-full border-2 border-[#FE6A2F]/30 bg-white/80 px-3 py-1.5 text-xs font-bold text-[#FE6A2F] hover:bg-white"
        >
          Exit
        </button>
      )}
    </header>
  );
}

export function TrailSlideCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
      {children}
    </div>
  );
}

export function BigButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
}) {
  const base =
    "rounded-full px-8 py-4 text-lg font-extrabold shadow-lg transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-[#FE6A2F] text-white hover:scale-105"
      : "bg-white/80 text-[#FE6A2F] border-2 border-[#FE6A2F]/30 hover:bg-white";
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

// ---------- intro ----------
export function TrailIntro({
  title,
  subtitle,
  cefr,
  onStart,
  onExit,
}: {
  title: string;
  subtitle?: string;
  cefr?: string;
  onStart: () => void;
  onExit?: () => void;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FEFBDD]">
      <TrailBackground />
      <main className="relative mx-auto grid min-h-screen max-w-4xl place-items-center px-4 py-8">
        <div className="w-full overflow-hidden rounded-[2.5rem] border-2 border-white/70 bg-white/80 shadow-[0_30px_80px_-30px_rgba(254,106,47,0.55)] backdrop-blur-xl">
          <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
            <div
              className="relative overflow-hidden p-7 text-white sm:p-10"
              style={{
                background:
                  "linear-gradient(135deg, #FFB37A 0%, #FE6A2F 55%, #C84810 100%)",
              }}
            >
              <div className="mb-6 flex items-center gap-3">
                <LogoBubble size={72} />
                <span className="text-xs font-extrabold uppercase tracking-widest opacity-90">
                  Engleuphoria · Playground
                </span>
              </div>
              <h1 className="text-4xl font-black leading-tight sm:text-5xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-4 text-base leading-relaxed opacity-95 sm:text-lg">
                  {subtitle}
                </p>
              )}
              {cefr && (
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-white/25 px-3 py-1.5 backdrop-blur">
                    🎯 Level {cefr.toUpperCase()}
                  </span>
                  <span className="rounded-full bg-white/25 px-3 py-1.5 backdrop-blur">
                    🏆 Earn stars
                  </span>
                </div>
              )}
            </div>

            <div className="relative grid place-items-center bg-[#FEFBDD] p-6">
              <img
                src={mascot}
                alt="Buddy, the Engleuphoria mascot"
                className="w-full max-w-xs drop-shadow-2xl"
                style={{ animation: "float 3s ease-in-out infinite" }}
                width={1024}
                height={1024}
              />
              <style>{`@keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }`}</style>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t-2 border-[#FE6A2F]/15 bg-white/70 p-6 sm:flex-row sm:p-8">
            {onExit ? (
              <button
                onClick={onExit}
                className="text-xs font-bold text-[#FE6A2F]/80 underline-offset-4 hover:underline"
              >
                Back
              </button>
            ) : (
              <span />
            )}
            <BigButton onClick={onStart}>Start Lesson ▶</BigButton>
          </div>
        </div>
      </main>
    </div>
  );
}

// ---------- celebration ----------
export function TrailCelebration({
  totalStars,
  totalPossible,
  onRestart,
  onExit,
}: {
  totalStars: number;
  totalPossible: number;
  onRestart?: () => void;
  onExit?: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
      <Confetti />
      <div className="relative flex flex-col items-center text-center">
        <img
          src={trophy}
          alt="Champion trophy"
          className="h-40 w-40 animate-scale-in drop-shadow-2xl"
          width={1024}
          height={1024}
        />
        <h2 className="mt-2 text-4xl font-black text-[#FE6A2F] sm:text-5xl">
          You're a Champion!
        </h2>
        <p className="mt-2 text-lg text-[#FE6A2F]/80">Lesson Complete 🎉</p>

        <div className="mt-6 flex items-center gap-2 rounded-full bg-[#FE6A2F] px-6 py-3 text-white shadow-xl">
          <img src={starImg} alt="" className="h-7 w-7" width={1024} height={1024} />
          <span className="text-3xl font-extrabold tabular-nums">{totalStars}</span>
          <span className="font-bold">/ {totalPossible} stars</span>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {onRestart && <BigButton onClick={onRestart}>Play Again 🔁</BigButton>}
          {onExit && (
            <BigButton variant="ghost" onClick={onExit}>
              Done
            </BigButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- confetti ----------
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 2 + Math.random() * 2,
        color: ["#FE6A2F", "#FEFBDD", "#FACC15", "#FB7185", "#60A5FA"][i % 5],
        rotate: Math.random() * 360,
      })),
    [],
  );
  return (
    <>
      <style>{`@keyframes confetti-fall { 0% { transform: translateY(-20%) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(120vh) rotate(720deg); opacity: 1; } }`}</style>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {pieces.map((p, i) => (
          <span
            key={i}
            className="absolute top-0 h-3 w-2 rounded-sm"
            style={{
              left: `${p.left}%`,
              backgroundColor: p.color,
              transform: `rotate(${p.rotate}deg)`,
              animation: `confetti-fall ${p.duration}s ${p.delay}s linear infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}
