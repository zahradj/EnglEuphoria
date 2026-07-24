import { useState } from "react";

import logo from "@/assets/playground-trail/logo.png";
import mascot from "@/assets/playground-trail/mascot.png";

// ---------- difficulty levels (CEFR) ----------
type Difficulty = "pre-a1" | "a1" | "a2" | "b1" | "b2";

const LEVELS: Record<
  Difficulty,
  {
    cefr: string;
    label: string;
    short: string;
    emoji: string;
    tagline: string;
    blurb: string;
  }
> = {
  "pre-a1": {
    cefr: "Pre-A1",
    label: "Tiny Seedling",
    short: "Seedling",
    emoji: "🌱",
    tagline: "True starter • first English words",
    blurb: "Lots of pictures, gentle pace, only the easiest activities.",
  },
  a1: {
    cefr: "A1",
    label: "Happy Sprout",
    short: "Sprout",
    emoji: "🌼",
    tagline: "A1 • building first vocabulary",
    blurb: "Adds letters, animals and feelings. Still very friendly.",
  },
  a2: {
    cefr: "A2",
    label: "Brave Explorer",
    short: "Explorer",
    emoji: "🚀",
    tagline: "A2 • the classic adventure",
    blurb: "Reading CVC words, shapes, actions and family.",
  },
  b1: {
    cefr: "B1",
    label: "Sky Voyager",
    short: "Voyager",
    emoji: "🦅",
    tagline: "B1 • trickier and faster",
    blurb: "Full vocabulary set plus 'I like / I don't like' opinions.",
  },
  b2: {
    cefr: "B2",
    label: "Star Champion",
    short: "Champion",
    emoji: "🏆",
    tagline: "B2 • for confident readers",
    blurb: "Every quest plus a memory challenge to push fast thinking.",
  },
};

const DIFFICULTY_ORDER: Difficulty[] = ["pre-a1", "a1", "a2", "b1", "b2"];

// ---------- page ----------
// Only the welcome card remains — the placement test, result screen and the
// 14 lesson-activity stages were removed. A replacement lesson (built in the
// Little Explorers Phonics scene-based style) is coming later.
export function PlaygroundTrailLesson(
  _props: { roomId?: string; role?: "teacher" | "student" } = {},
) {
  return <IntroScreen />;
}

// ---------- Intro / Welcome Card ----------
function IntroScreen() {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [manual, setManual] = useState<Difficulty>("a1");
  const [comingSoon, setComingSoon] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FEFBDD]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(at 15% 10%, rgba(254,106,47,0.45) 0px, transparent 55%), radial-gradient(at 85% 5%, rgba(255,221,120,0.8) 0px, transparent 55%), radial-gradient(at 80% 95%, rgba(254,106,47,0.35) 0px, transparent 55%), radial-gradient(at 10% 90%, rgba(254,251,221,0.9) 0px, transparent 55%)",
        }}
      />
      <main className="relative mx-auto grid min-h-screen max-w-4xl place-items-center px-4 py-8">
        <div className="w-full overflow-hidden rounded-[2.5rem] border-2 border-white/70 bg-white/80 shadow-[0_30px_80px_-30px_rgba(254,106,47,0.55)] backdrop-blur-xl">
          <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
            {/* hero panel */}
            <div
              className="relative overflow-hidden p-7 text-white sm:p-10"
              style={{
                background:
                  "linear-gradient(135deg, #FFB37A 0%, #FE6A2F 55%, #C84810 100%)",
              }}
            >
              <div className="mb-6 flex items-center gap-3">
                <LogoBubble size={84} />
                <span className="text-xs font-extrabold uppercase tracking-widest opacity-90">
                  Engleuphoria · Playground
                </span>
              </div>
              <h1 className="text-4xl font-black leading-tight sm:text-5xl">
                Hi superstar! ✨
              </h1>
              <p className="mt-4 text-base leading-relaxed opacity-95 sm:text-lg">
                I'm <strong>Buddy</strong>, your friend today. First we'll play
                5 quick questions to find your level — then we start a fun
                English adventure made just for you.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-white/25 px-3 py-1.5 backdrop-blur">
                  🧭 5-question placement
                </span>
                <span className="rounded-full bg-white/25 px-3 py-1.5 backdrop-blur">
                  🎯 Auto-pick your CEFR level
                </span>
                <span className="rounded-full bg-white/25 px-3 py-1.5 backdrop-blur">
                  🏆 Earn stars
                </span>
              </div>
            </div>

            {/* mascot panel */}
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

          {/* CEFR overview + CTAs */}
          <div className="border-t-2 border-[#FE6A2F]/15 bg-white/70 p-6 sm:p-8">
            <p className="mb-1 text-base font-black text-[#FE6A2F]">
              🧭 5 CEFR levels — we'll match the right one
            </p>
            <p className="mb-4 text-xs text-[#FE6A2F]/70">
              From true starter to confident reader. The placement test takes
              about 1 minute.
            </p>

            <div className="grid gap-2 sm:grid-cols-5">
              {DIFFICULTY_ORDER.map((d) => {
                const meta = LEVELS[d];
                return (
                  <div
                    key={d}
                    className="rounded-2xl border-2 border-[#FE6A2F]/20 bg-white p-3 text-center"
                  >
                    <div className="text-2xl" aria-hidden>
                      {meta.emoji}
                    </div>
                    <div className="mt-1 text-[10px] font-extrabold uppercase tracking-wide text-[#FE6A2F]/70">
                      {meta.cefr}
                    </div>
                    <div className="text-xs font-black text-[#FE6A2F]">
                      {meta.short}
                    </div>
                  </div>
                );
              })}
            </div>

            {comingSoon ? (
              <div className="mt-6 animate-fade-in rounded-2xl border-2 border-[#FE6A2F]/20 bg-white p-4 text-center text-sm font-bold text-[#FE6A2F]">
                🚧 This adventure is being rebuilt with fresh activities —
                ask your teacher what's next!
              </div>
            ) : (
              <>
                <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
                  <button
                    onClick={() => setPickerOpen((v) => !v)}
                    className="text-xs font-bold text-[#FE6A2F]/80 underline-offset-4 hover:underline"
                  >
                    {pickerOpen ? "Hide manual picker" : "Teacher: skip & pick level manually"}
                  </button>
                  <BigButton onClick={() => setComingSoon(true)}>
                    Start placement test →
                  </BigButton>
                </div>

                {pickerOpen && (
                  <div className="mt-4 animate-fade-in rounded-2xl border-2 border-[#FE6A2F]/20 bg-white p-4">
                    <p className="mb-2 text-xs font-bold text-[#FE6A2F]/80">
                      Pick a level and jump straight in:
                    </p>
                    <LevelPills value={manual} onChange={setManual} />
                    <div className="mt-3 flex justify-end">
                      <BigButton variant="ghost" onClick={() => setComingSoon(true)}>
                        Start at {LEVELS[manual].emoji} {LEVELS[manual].cefr} →
                      </BigButton>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function LevelPills({
  value,
  onChange,
}: {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full border border-[#FE6A2F]/30 bg-white/70 p-1">
      {DIFFICULTY_ORDER.map((d) => {
        const meta = LEVELS[d];
        const active = d === value;
        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            title={meta.label}
            className={`rounded-full px-3 py-1 text-xs font-extrabold transition-all ${
              active
                ? "bg-[#FE6A2F] text-white shadow"
                : "text-[#FE6A2F] hover:bg-[#FE6A2F]/10"
            }`}
          >
            {meta.emoji} {meta.short}
          </button>
        );
      })}
    </div>
  );
}

// ---------- shared UI ----------
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
        {/* glossy highlight */}
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

function BigButton({
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
