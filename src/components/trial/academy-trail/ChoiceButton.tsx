import { useState, type ReactNode } from "react";

type State = "idle" | "correct" | "wrong";

export function ChoiceButton({
  children,
  isCorrect,
  locked,
  onResolve,
}: {
  children: ReactNode;
  isCorrect: boolean;
  locked: boolean;
  onResolve: (correct: boolean) => void;
}) {
  const [state, setState] = useState<State>("idle");

  const click = () => {
    if (locked || state !== "idle") return;
    setState(isCorrect ? "correct" : "wrong");
    onResolve(isCorrect);
    if (!isCorrect) {
      setTimeout(() => setState("idle"), 600);
    }
  };

  const base =
    "group relative w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold text-base sm:text-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed";
  const variant =
    state === "correct"
      ? "border-brand-mint bg-brand-mint/30 text-brand-purple-deep animate-pop"
      : state === "wrong"
        ? "border-destructive bg-destructive/10 text-destructive animate-wiggle"
        : "border-border bg-card hover:border-brand-purple hover:bg-secondary text-foreground";

  return (
    <button onClick={click} disabled={locked} className={`${base} ${variant}`}>
      <span className="flex items-center justify-between gap-3">
        <span>{children}</span>
        {state === "correct" && <span aria-hidden>✅</span>}
        {state === "wrong" && <span aria-hidden>💭</span>}
      </span>
    </button>
  );
}
