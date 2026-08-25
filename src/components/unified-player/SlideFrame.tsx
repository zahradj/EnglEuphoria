/**
 * A classic presentation-slide shell. Two layouts, chosen by whether an
 * `image` is supplied:
 *
 * - With an image: the illustration fills the whole slide edge-to-edge
 *   (a "full bleed" picture slide, like a real PPT background-image
 *   layout) — kicker/title overlay near the top with a light scrim for
 *   legibility, and any `children` (a caption, a game card) sit in a
 *   floating card pinned toward the bottom.
 * - Without an image: a solid-color title bar up top, plain content area
 *   below — for text-only slides (a review summary, a game with no scene).
 *
 * Defaults to a fixed 16:9 frame. Pass `flexHeight` for content whose size
 * varies a lot (game boards, memory grids) — same visual language, but the
 * frame grows to fit instead of clipping/scrolling inside a fixed box.
 */
export function SlideFrame({
  kicker,
  title,
  accent,
  accent2,
  headerRight,
  children,
  image,
  flexHeight = false,
  large = false,
}: {
  kicker?: string;
  title?: string;
  accent: string;
  accent2: string;
  headerRight?: React.ReactNode;
  children?: React.ReactNode;
  image?: string;
  flexHeight?: boolean;
  /** Cover-page treatment — a much bigger title, for the intro slide. */
  large?: boolean;
}) {
  if (image) {
    return (
      <div
        className={`relative mx-auto flex w-full max-w-3xl flex-col justify-end overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200 ${flexHeight ? 'min-h-[50vh]' : 'aspect-video'}`}
      >
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0) 30%, rgba(15,23,42,0) 55%, rgba(15,23,42,0.75) 100%)' }}
        />
        {(title || kicker) && (
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4 sm:p-6">
            <div className="min-w-0">
              {kicker && <div className={`font-black uppercase tracking-[0.2em] text-white/90 drop-shadow ${large ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'}`}>{kicker}</div>}
              {title && <h2 className={`truncate font-black text-white drop-shadow-lg ${large ? 'text-2xl sm:text-4xl' : 'text-lg sm:text-2xl'}`}>{title}</h2>}
            </div>
            {headerRight}
          </div>
        )}
        {children && <div className="relative z-10 p-4 sm:p-6">{children}</div>}
      </div>
    );
  }

  return (
    <div className={`mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 ${flexHeight ? '' : 'aspect-video'}`}>
      {(title || kicker) && (
        <div
          className="flex flex-shrink-0 items-center justify-between gap-3 px-5 py-3 sm:px-8 sm:py-4"
          style={{ background: `linear-gradient(90deg, ${accent}, ${accent2})` }}
        >
          <div className="min-w-0">
            {kicker && <div className={`font-black uppercase tracking-[0.2em] text-white/80 ${large ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'}`}>{kicker}</div>}
            {title && <h2 className={`truncate font-black text-white ${large ? 'text-2xl sm:text-4xl' : 'text-lg sm:text-2xl'}`}>{title}</h2>}
          </div>
          {headerRight}
        </div>
      )}
      {children && (
        <div className={`flex w-full p-4 sm:p-8 ${flexHeight ? '' : 'min-h-0 flex-1 overflow-hidden'}`}>
          <div className="h-full w-full">{children}</div>
        </div>
      )}
    </div>
  );
}
