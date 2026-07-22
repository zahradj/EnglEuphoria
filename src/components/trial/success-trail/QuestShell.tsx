import type { ReactNode, ButtonHTMLAttributes } from "react";

export function PrimaryButton({
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={
        "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 font-display font-bold text-base sm:text-lg text-primary-foreground " +
        "bg-gradient-to-br from-brand-emerald-glow via-brand-emerald to-brand-emerald-deep " +
        "shadow-[0_12px_30px_-12px_color-mix(in_oklch,var(--brand-emerald)_70%,transparent)] " +
        "transition active:translate-y-[1px] hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed " +
        className
      }
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={
        "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-display font-semibold border-2 border-border bg-card text-brand-emerald-deep transition hover:bg-secondary " +
        className
      }
    >
      {children}
    </button>
  );
}

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
    <section className="max-w-3xl mx-auto px-4 mt-6">
      <div className="rounded-3xl bg-card border-2 border-border shadow-[0_24px_60px_-30px_color-mix(in_oklch,var(--brand-emerald)_55%,transparent)] overflow-hidden animate-pop">
        <header className="px-6 sm:px-8 pt-6 sm:pt-8 pb-3 flex items-start gap-4 border-b-2 border-border bg-gradient-to-br from-brand-mint to-card">
          <div
            aria-hidden
            className="grid place-items-center w-14 h-14 rounded-2xl bg-brand-emerald text-primary-foreground text-2xl shadow-md flex-shrink-0"
          >
            {emoji}
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-emerald-deep leading-tight">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm sm:text-base text-muted-foreground">{subtitle}</p>}
          </div>
        </header>
        <div className="px-6 sm:px-8 py-6">{children}</div>
        {footer && <div className="px-6 sm:px-8 pb-6 sm:pb-8">{footer}</div>}
      </div>
    </section>
  );
}
