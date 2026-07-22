/**
 * Split-Screen Reading Layout — used for every lesson_phase === "Reading" slide.
 *
 *   ┌──────────────────────┬──────────────────────┐
 *   │                      │                      │
 *   │   Reading text       │   Supportive image   │
 *   │   (paper bg, large   │   OR comprehension   │
 *   │    legible type,     │   widget (children)  │
 *   │    **bold** vocab)   │                      │
 *   │                      │                      │
 *   └──────────────────────┴──────────────────────┘
 *
 * The renderer never puts a wall of text on a single slide — the AI splits
 * passages > 100 words across consecutive Reading slides (enforced in the
 * generate-ppp-slides edge function).
 */
import React from 'react';
import RichText from './RichText';

interface SlideLike {
  title?: string;
  content?: string;
  custom_image_url?: string;
  visual_keyword?: string;
}

interface SlideReadingSplitProps {
  slide: SlideLike;
  /** Optional right-side widget (comprehension question, image, etc). */
  children?: React.ReactNode;
}

export const SlideReadingSplit: React.FC<SlideReadingSplitProps> = ({ slide, children }) => {
  const passage = slide.content ?? '';
  const imageUrl = slide.custom_image_url;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {/* ── LEFT: paper-white scrollable text ── */}
      <article
        className={[
          'rounded-2xl border border-slate-200 dark:border-slate-700',
          'bg-[#fafaf7] dark:bg-slate-900',
          'p-6 sm:p-8 max-h-[60vh] overflow-y-auto',
          'shadow-sm',
        ].join(' ')}
      >
        {slide.title && (
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {slide.title}
          </h3>
        )}
        <p
          className={[
            'font-serif text-lg sm:text-xl leading-relaxed text-slate-800 dark:text-slate-200',
            'whitespace-pre-line',
          ].join(' ')}
        >
          <RichText text={passage} />
        </p>
      </article>

      {/* ── RIGHT: supportive image or comprehension widget ── */}
      <aside className="flex items-center justify-center min-h-[300px]">
        {children ? (
          <div className="w-full">{children}</div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={slide.visual_keyword || slide.title || 'Reading illustration'}
            className="max-w-full max-h-[60vh] rounded-2xl object-cover shadow-md"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-violet-100 to-sky-100 dark:from-violet-950/40 dark:to-sky-950/40 flex items-center justify-center">
            <span className="text-6xl select-none" aria-hidden>
              📖
            </span>
          </div>
        )}
      </aside>
    </div>
  );
};

export default SlideReadingSplit;
