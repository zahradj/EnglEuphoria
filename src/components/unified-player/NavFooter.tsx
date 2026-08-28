/**
 * Persistent Back/Next navigation — a full-width bottom action bar (the
 * Duolingo/Playground-style "check/continue" strip), not a small centered
 * row floating below the content. Buttons use the chunky 3D "pressable"
 * treatment (a solid bottom shadow that collapses on press) instead of a
 * flat gradient pill — the single most recognizable "this is a game, not a
 * form" visual cue in that whole genre of app.
 *
 * Each moment ("page") sits between these two controls. Back always steps
 * to the previous moment — PresentationSection/ActivitySection still own
 * their own internal step logic (story pages, activity blocks) and decide
 * what Next does.
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
    // relative z-20: any absolutely-positioned full-bleed scene image/scrim
    // a moment renders behind its content (ActivitySection, SlideFrame) is
    // position:absolute with no z-index, which paints above plain in-flow
    // siblings regardless of DOM order — without this, that scrim sits on
    // top of this bar and silently eats every click on Back/Next. Learned
    // the hard way: buttons looked perfectly normal and were completely
    // dead on any moment with background art.
    <div className="relative z-20 flex-shrink-0 border-t-2 border-slate-100 bg-white px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={backDisabled}
          className="rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-slate-500 ring-2 ring-slate-200 transition active:translate-y-1 active:shadow-none disabled:opacity-0"
          style={{ boxShadow: '0 5px 0 0 #e2e8f0' }}
        >
          ← Back
        </button>
        {/* The top progress bar (UnifiedLessonPlayer) is now the primary,
            glanceable progress signal, so this stays a small plain label
            instead of a competing star pill. */}
        <span className="text-xs font-bold text-slate-400">{pageLabel}</span>
        <button
          type="button"
          onClick={onNext}
          className="rounded-2xl px-9 py-3.5 text-base font-black text-white transition active:translate-y-1 active:shadow-none"
          style={{ backgroundColor: accent, boxShadow: `0 5px 0 0 ${accent2}` }}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
