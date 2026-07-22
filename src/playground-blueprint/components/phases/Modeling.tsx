import { useEffect, useMemo, useState } from "react";
import { useLessonVocab } from "@/playground-blueprint/lib/useDynamicVocab";
import { speak } from "@/playground-blueprint/lib/speech";

/**
 * Two-step Modeling phase:
 *   1. Grammar Representation — colored chips showing the sentence frame.
 *   2. Grammar Modeling — tap each animal to hear the frame, the slot chip
 *      fills with the picked word so the grammar is made visible.
 *
 * Backward-compatible: callers can omit `frame` / `slotLabel`.
 */

export type ModelingFrame = {
  subject: string;
  verb: string;
  article?: string;
  /** Hint about the slot — defaults to "animal". */
  slotLabel?: string;
};

const DEFAULT_FRAME: Required<ModelingFrame> = {
  subject: "My name",
  verb: "is",
  article: "",
  slotLabel: "name",
};


export function ModelingPhase({
  onComplete,
  frame,
}: {
  onComplete: () => void;
  frame?: ModelingFrame;
}) {
  const F = { ...DEFAULT_FRAME, ...(frame ?? {}) };
  const ANIMALS = useLessonVocab(1);
  const [step, setStep] = useState<"frame" | "fill">("frame");
  const [heard, setHeard] = useState<Set<string>>(new Set());
  const [lastPicked, setLastPicked] = useState<string | null>(null);
  const done = heard.size === ANIMALS.length;

  useEffect(() => {
    if (done) {
      const id = setTimeout(onComplete, 600);
      return () => clearTimeout(id);
    }
  }, [done, onComplete]);

  const fullFrame = useMemo(() => {
    const parts = [F.subject, F.verb, F.article].filter(Boolean).join(" ");
    return `${parts} …`;
  }, [F]);

  const tap = (name: string) => {
    speak(`${F.subject} ${F.verb}${F.article ? ` ${F.article}` : ""} ${name}`);
    setLastPicked(name);
    setHeard((s) => new Set(s).add(name));
  };

  return (
    <div className="space-y-6">
      {/* ── Step 1 · Grammar Representation ──────────────────────────────── */}
      <div className="rounded-3xl border-2 border-[color:var(--playground-primary)]/30 bg-white/70 p-5">
        <p className="mb-3 text-center text-xs font-extrabold uppercase tracking-widest text-[color:var(--playground-primary)]">
          Grammar frame
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xl font-extrabold">
          <Chip color="purple" label="subject">{F.subject}</Chip>
          <Chip color="blue" label="verb">{F.verb}</Chip>
          {F.article && (
            <Chip color="gray" label="article">{F.article}</Chip>
          )}
          <Chip color="orange" label="slot" dashed>
            {step === "fill" && lastPicked ? lastPicked : `___ ${F.slotLabel}`}
          </Chip>
        </div>
        <p className="mt-3 text-center text-sm font-semibold text-[color:var(--playground-ink)]/70">
          We use <strong>{F.verb}</strong> for <strong>one</strong> {F.slotLabel}.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => speak(fullFrame)}
            className="glass-card rounded-2xl px-4 py-2 text-sm font-bold text-[color:var(--playground-ink)]"
          >
            🔊 Hear the frame
          </button>
          {step === "frame" && (
            <button
              onClick={() => setStep("fill")}
              className="shadow-playground rounded-2xl px-5 py-2 text-sm font-extrabold text-white"
              style={{ background: "var(--playground-primary)" }}
            >
              Got it →
            </button>
          )}
        </div>
      </div>

      {/* ── Step 2 · Grammar Modeling (tap to fill the slot) ─────────────── */}
      {step === "fill" && (
        <div>
          <p className="mb-6 text-center text-xl font-semibold text-[color:var(--playground-ink)]/80">
            Tap each friend to hear the full sentence.
          </p>

          <div
            className="relative mx-auto overflow-hidden rounded-[2rem] p-4 sm:p-6"
            style={{
              background:
                "radial-gradient(circle at 15% 15%, color-mix(in oklab, var(--playground-primary) 20%, white) 0%, transparent 55%), radial-gradient(circle at 85% 85%, color-mix(in oklab, var(--playground-primary) 14%, white) 0%, transparent 60%), linear-gradient(180deg, #FFF8EE 0%, #FEFBDD 100%)",
              minHeight: "420px",
            }}
          >


            <div className="relative z-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {ANIMALS.map((a) => {
                const isHeard = heard.has(a.name);
                return (
                  <button
                    key={a.name}
                    onClick={() => tap(a.name)}
                    className="group relative flex flex-col items-center gap-2 rounded-3xl p-2 transition hover:scale-105 active:scale-95"
                  >
                    <div
                      className="relative rounded-2xl bg-white px-3 py-2 text-sm font-extrabold text-[color:var(--playground-ink)] shadow-md sm:text-base"
                      style={{
                        outline: isHeard ? "3px solid var(--playground-primary)" : "none",
                      }}
                    >
                      {F.subject} {F.verb}{F.article ? ` ${F.article}` : ""}{" "}
                      <span className="capitalize text-[color:var(--playground-primary)]">{a.name}</span>!
                      <span
                        className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white"
                        aria-hidden
                      />
                    </div>
                    <img
                      src={a.image}
                      alt={a.name}
                      className="h-24 w-24 object-contain sm:h-28 sm:w-28"
                    />
                    {isHeard && (
                      <span className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--playground-primary)] text-sm text-white">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-6 text-center text-base font-medium text-[color:var(--playground-ink)]/60">
            {heard.size} / {ANIMALS.length} heard
          </p>
        </div>
      )}
    </div>
  );
}

function Chip({
  children,
  color,
  label,
  dashed,
}: {
  children: React.ReactNode;
  color: "purple" | "blue" | "gray" | "orange";
  label: string;
  dashed?: boolean;
}) {
  const tones: Record<string, string> = {
    purple: "bg-purple-100 text-purple-900 border-purple-300",
    blue: "bg-sky-100 text-sky-900 border-sky-300",
    gray: "bg-slate-100 text-slate-700 border-slate-300",
    orange: "bg-orange-100 text-orange-900 border-orange-400",
  };
  return (
    <span className="flex flex-col items-center">
      <span
        className={`rounded-2xl border-2 ${dashed ? "border-dashed" : ""} px-4 py-2 ${tones[color]}`}
      >
        {children}
      </span>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[color:var(--playground-ink)]/50">
        {label}
      </span>
    </span>
  );
}
