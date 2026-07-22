import type { ReactNode } from "react";

export function QuestShell({
  emoji,
  title,
  subtitle,
  children,
  footer,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <div className="rounded-3xl bg-card border-2 border-border shadow-[0_20px_50px_-20px_color-mix(in_oklch,var(--brand-purple)_40%,transparent)] overflow-hidden">
        <div
          className="px-6 py-5 flex items-center gap-3 text-primary-foreground"
          style={{
            background:
              "linear-gradient(135deg, var(--brand-purple) 0%, var(--brand-purple-deep) 100%)",
          }}
        >
          <span className="text-3xl drop-shadow-sm" aria-hidden>{emoji}</span>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold leading-tight">{title}</h2>
            {subtitle && <p className="text-sm opacity-90">{subtitle}</p>}
          </div>
        </div>
        <div className="p-5 sm:p-7">{children}</div>
        {footer && <div className="px-5 sm:px-7 pb-6">{footer}</div>}
      </div>
    </section>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full sm:w-auto px-6 py-3 rounded-2xl font-display font-bold text-lg text-primary-foreground transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background:
          "linear-gradient(135deg, var(--brand-purple-glow), var(--brand-purple))",
        boxShadow:
          "0 8px 20px -6px color-mix(in oklch, var(--brand-purple) 60%, transparent)",
      }}
    >
      {children}
    </button>
  );
}
