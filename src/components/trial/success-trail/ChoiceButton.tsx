import type { ButtonHTMLAttributes } from "react";

type State = "idle" | "correct" | "wrong" | "selected";

export function ChoiceButton({
  state = "idle",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { state?: State }) {
  const base =
    "w-full text-left rounded-2xl border-2 px-4 py-3 font-semibold transition outline-none focus-visible:ring-4 focus-visible:ring-brand-emerald-glow/40";
  const styles: Record<State, string> = {
    idle: "border-border bg-card hover:border-brand-emerald hover:bg-brand-mint/60 text-foreground",
    selected: "border-brand-emerald bg-brand-mint text-brand-emerald-deep",
    correct:
      "border-brand-emerald bg-brand-emerald text-primary-foreground shadow-[0_8px_24px_-8px_color-mix(in_oklch,var(--brand-emerald)_70%,transparent)] animate-pop",
    wrong: "border-destructive bg-destructive/10 text-destructive animate-wiggle",
  };
  return (
    <button {...rest} className={`${base} ${styles[state]} ${className}`}>
      {children}
    </button>
  );
}
