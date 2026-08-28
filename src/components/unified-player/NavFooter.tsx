/**
 * Persistent Back/Next navigation — a full-width bottom action bar (the
 * Duolingo-style "check/continue" strip), not a small centered row floating
 * below the content. Each moment ("page") sits between these two controls.
 * Back always steps to the previous moment — PresentationSection/
 * ActivitySection still own their own internal step logic (story pages,
 * activity blocks) and decide what Next does.
 */
export function NavFooter({
  onBack,
  backDisabled,
  onNext,
  nextLabel,
  pageLabel,
  accent,
  accent2,
}: {
  onBack: () => void;
  backDisabled: boolean;
  onNext: () => void;
  nextLabel: string;
  pageLabel: string;
  accent: string;
  accent2: string;
}) {
  return (
    <div className="flex-shrink-0 border-t-2 border-slate-100 bg-white px-4 py-4 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] sm:px-8">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={backDisabled}
          className="rounded-full px-6 py-3.5 text-sm font-black text-slate-500 ring-2 ring-slate-200 transition hover:bg-slate-50 active:scale-95 disabled:opacity-0"
        >
          ← Back
        </button>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-400">{pageLabel}</span>
        <button
          type="button"
          onClick={onNext}
          className="rounded-full px-9 py-3.5 text-base font-black text-white transition hover:scale-105 active:scale-95"
          style={{ background: `linear-gradient(90deg, ${accent}, ${accent2})`, boxShadow: `0 8px 20px -4px ${accent}99` }}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
