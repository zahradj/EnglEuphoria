/**
 * AceLessonButton — single "✨ Ace Lesson" call-to-action.
 *
 * Wraps `useAceLesson` with a progress modal that streams 8 phase checks.
 * On success calls `onApplyUnit(unit)` so the surrounding CreatorShell
 * can hydrate the editor + persist via the existing saveUnitLessons path.
 */

import { Loader2, Sparkles, Check, X } from "lucide-react";
import { useState } from "react";
import { ACE_PHASES, useAceLesson, type AceLessonInput } from "@/hooks/useAceLesson";

const PHASE_LABEL: Record<string, string> = {
  plan: "Plan unit blueprint",
  vocab: "Generate vocabulary",
  grammar: "Build grammar models",
  reading: "Draft reading & listening",
  speaking: "Speaking scaffolds",
  game: "Wire game pack",
  homework: "Wire homework pack",
  validate: "Run publish gate",
};

interface Props {
  input: () => AceLessonInput;
  onApplyUnit: (unit: any, scope?: "lesson" | "unit") => void | Promise<void>;
  disabled?: boolean;
}

export function AceLessonButton({ input, onApplyUnit, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<"lesson" | "unit">("lesson");
  const { run, reset, isRunning, phases, error } = useAceLesson();

  const phaseState = (phase: string) => phases.find((p) => p.phase === phase);

  const handleClick = async (s: "lesson" | "unit") => {
    setScope(s);
    setOpen(true);
    reset();
    const result = await run({ ...input(), scope: s });
    if (result?.unit) await onApplyUnit(result.unit, s);
  };

  return (
    <>
      <button
        onClick={() => handleClick("lesson")}
        disabled={disabled || isRunning}
        className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-3 py-1.5 text-xs font-bold text-white shadow hover:opacity-95 disabled:opacity-60"
        title="Generate a complete, classroom-ready ace lesson in one click"
      >
        {isRunning && scope === "lesson" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        {isRunning && scope === "lesson" ? "Building Ace…" : "✨ Ace Lesson"}
      </button>
      <button
        onClick={() => handleClick("unit")}
        disabled={disabled || isRunning}
        className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:opacity-95 disabled:opacity-60"
        title="Generate all 7 lessons of this unit at ace quality"
      >
        {isRunning && scope === "unit" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        {isRunning && scope === "unit" ? "Building Unit…" : "🏆 Ace Unit"}
      </button>


      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !isRunning && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              <h2 className="text-base font-bold text-orange-900">{scope === "unit" ? "Building your Ace Unit (7 lessons)" : "Building your Ace Lesson"}</h2>
            </div>
            <p className="mb-4 text-xs text-orange-800/80">
              Expert ESL agent + games builder are co-creating a fully planned, gamified lesson.
            </p>

            <ul className="space-y-1.5">
              {ACE_PHASES.map((p) => {
                const state = phaseState(p);
                const done = !!state;
                const ok = state?.ok !== false;
                const pending = !done && isRunning;
                return (
                  <li
                    key={p}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${
                        done
                        ? ok
                          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                          : "border-rose-200 bg-rose-50 text-rose-900"
                        : pending
                        ? "border-orange-100 bg-orange-50/40 text-orange-800/60"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    {done ? (
                      ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />
                    ) : pending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span className="h-3.5 w-3.5 rounded-full border border-slate-300" />
                    )}
                    <span className="flex-1 font-semibold">{PHASE_LABEL[p]}</span>
                    {state?.detail && (
                      <span className="truncate text-[10px] opacity-70">{state.detail}</span>
                    )}
                  </li>
                );
              })}
            </ul>

            {error && (
              <div className="mt-3 rounded-lg border border-rose-300 bg-rose-50 p-2 text-xs text-rose-900">
                {error}
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                disabled={isRunning}
                className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-semibold text-orange-900 hover:bg-orange-50 disabled:opacity-50"
              >
                {isRunning ? "Working…" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
