/**
 * The full-screen slide shell. The slide IS the screen — no floating card,
 * no page margin around it, no rounded corners cutting off the edges. Two
 * layouts, chosen by whether an `image` is supplied:
 *
 * - With an image: the illustration fills the entire screen edge-to-edge
 *   — kicker/title overlay near the top with a scrim for legibility, and
 *   any `children` (a caption, a game card) float near the bottom.
 * - Without an image: a solid-color title bar up top, the content area
 *   filling the rest of the screen below it.
 */
export function SlideFrame({
  kicker,
  title,
  accent,
  accent2,
  headerRight,
  children,
  image,
  large = false,
}: {
  kicker?: string;
  title?: string;
  accent: string;
  accent2: string;
  headerRight?: React.ReactNode;
  children?: React.ReactNode;
  image?: string;
  /** Cover-page treatment — a much bigger title, for the intro slide. */
  large?: boolean;
}) {
  if (image) {
    return (
      <div className="relative flex h-full w-full flex-col justify-end overflow-hidden">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0) 30%, rgba(15,23,42,0) 55%, rgba(15,23,42,0.75) 100%)' }}
        />
        {(title || kicker) && (
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4 sm:p-8">
            <div className="min-w-0">
              {kicker && <div className={`font-black uppercase tracking-[0.2em] text-white/90 drop-shadow ${large ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'}`}>{kicker}</div>}
              {title && <h2 className={`truncate font-black text-white drop-shadow-lg ${large ? 'text-3xl sm:text-5xl' : 'text-xl sm:text-3xl'}`}>{title}</h2>}
            </div>
            {headerRight}
          </div>
        )}
        {children && <div className="relative z-10 p-4 sm:p-8">{children}</div>}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      {(title || kicker) && (
        <div
          className="flex flex-shrink-0 items-center justify-between gap-3 px-5 py-4 sm:px-8 sm:py-6"
          style={{ background: `linear-gradient(90deg, ${accent}, ${accent2})` }}
        >
          <div className="min-w-0">
            {kicker && <div className={`font-black uppercase tracking-[0.2em] text-white/80 ${large ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'}`}>{kicker}</div>}
            {title && <h2 className={`truncate font-black text-white ${large ? 'text-3xl sm:text-5xl' : 'text-xl sm:text-3xl'}`}>{title}</h2>}
          </div>
          {headerRight}
        </div>
      )}
      {children && (
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4 sm:p-8">
          <div className="w-full">{children}</div>
        </div>
      )}
    </div>
  );
}
