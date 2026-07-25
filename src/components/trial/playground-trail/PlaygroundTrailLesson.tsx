import { useState } from "react";

import PlayUnitLesson from "@/pages/playground-scene/PlayUnitLesson";
import { PLAYGROUND_TRIAL_SCENES } from "@/content/playground-library/trial/trialScenes";

import logo from "@/assets/playground-trail/logo.png";
import mascot from "@/assets/playground-trail/mascot.png";

// ---------- page ----------
// A short, no-reading-required welcome adventure for true first-time
// English learners — meet Pip, Mia and Bella, play, and sing together.
// Meant to be a fun, memorable first impression of the school.
export function PlaygroundTrailLesson({
  roomId,
}: { roomId?: string; role?: "teacher" | "student" } = {}) {
  const [started, setStarted] = useState(false);

  if (started) {
    return (
      <PlayUnitLesson
        scenes={PLAYGROUND_TRIAL_SCENES}
        sessionKey={`playground-trial-${roomId ?? "anon"}`}
      />
    );
  }

  return <IntroScreen onStart={() => setStarted(true)} />;
}

// ---------- Intro / Welcome Card ----------
function IntroScreen({ onStart }: { onStart: () => void }) {
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
                I'm <strong>Buddy</strong>! Today you'll meet Pip, Mia and
                Bella, play fun games together, and sing a happy song — no
                reading needed, just smiles.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-white/25 px-3 py-1.5 backdrop-blur">
                  👋 Meet new friends
                </span>
                <span className="rounded-full bg-white/25 px-3 py-1.5 backdrop-blur">
                  🎨 Fun games
                </span>
                <span className="rounded-full bg-white/25 px-3 py-1.5 backdrop-blur">
                  🎵 Sing & celebrate
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

          {/* what to expect + CTA */}
          <div className="border-t-2 border-[#FE6A2F]/15 bg-white/70 p-6 sm:p-8">
            <p className="mb-1 text-base font-black text-[#FE6A2F]">
              🌱 A gentle Pre-A1 adventure, made for true beginners
            </p>
            <p className="mb-4 text-xs text-[#FE6A2F]/70">
              About 10 minutes of pictures, sounds and games — perfect for a
              first English class.
            </p>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border-2 border-[#FE6A2F]/20 bg-white p-3 text-center">
                <div className="text-2xl" aria-hidden>👋</div>
                <div className="mt-1 text-xs font-black text-[#FE6A2F]">Say hello</div>
              </div>
              <div className="rounded-2xl border-2 border-[#FE6A2F]/20 bg-white p-3 text-center">
                <div className="text-2xl" aria-hidden>😊</div>
                <div className="mt-1 text-xs font-black text-[#FE6A2F]">Share feelings</div>
              </div>
              <div className="rounded-2xl border-2 border-[#FE6A2F]/20 bg-white p-3 text-center">
                <div className="text-2xl" aria-hidden>🎉</div>
                <div className="mt-1 text-xs font-black text-[#FE6A2F]">Celebrate!</div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <BigButton onClick={onStart}>Let's play! →</BigButton>
            </div>
          </div>
        </div>
      </main>
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
