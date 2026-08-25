/**
 * Persistent Back/Next navigation, rendered below the scene frame instead
 * of a "Continue" pill floating inside it. Each moment ("page") sits
 * between these two controls. Back always steps to the previous moment —
 * PresentationSection/ActivitySection still own their own internal step
 * logic (story pages, activity blocks) and decide what Next does.
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
    <div className="mx-auto mt-6 flex max-w-2xl items-center justify-between gap-4">
      <button
        type="button"
        onClick={onBack}
        disabled={backDisabled}
        className="rounded-full px-6 py-3 text-sm font-black text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-0"
      >
        ← Back
      </button>
      <span className="text-xs font-black text-slate-400">{pageLabel}</span>
      <button
        type="button"
        onClick={onNext}
        className="rounded-full px-8 py-3 text-sm font-black text-white shadow-md transition hover:scale-105 active:scale-95"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent2})` }}
      >
        {nextLabel}
      </button>
    </div>
  );
}
