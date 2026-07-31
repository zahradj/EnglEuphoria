import React from 'react';
import { getEditorialTheme } from './editorialHubTheme';

interface FrontPageSlideProps {
  lessonTitle: string;
  topic?: string;
  level?: string;
  hub?: string;
  coverImageUrl?: string;
  unitNumber?: number | string;
  unitTitle?: string;
  subtitle?: string;
  lessonNumber?: number | string;
}

/**
 * Hub-specific accent palette for the IntroSlide.
 * (User-spec overrides — kept local so we don't disturb the global hub theme.)
 */
const INTRO_HUB_PALETTE: Record<
  string,
  { primary: string; accent: string; ring: string; pillBg: string; pillText: string }
> = {
  playground: {
    primary: '#84CC16', // lime
    accent: '#A855F7', // purple
    ring: 'ring-lime-300/60',
    pillBg: 'bg-lime-100',
    pillText: 'text-lime-800',
  },
  academy: {
    primary: '#06B6D4', // cyan
    accent: '#F97316', // orange
    ring: 'ring-cyan-300/60',
    pillBg: 'bg-cyan-100',
    pillText: 'text-cyan-800',
  },
  professional: {
    primary: '#0F172A', // navy
    accent: '#D4A24C', // gold
    ring: 'ring-amber-300/60',
    pillBg: 'bg-slate-900',
    pillText: 'text-amber-300',
  },
  success: {
    primary: '#0F172A',
    accent: '#D4A24C',
    ring: 'ring-amber-300/60',
    pillBg: 'bg-slate-900',
    pillText: 'text-amber-300',
  },
};

function getIntroPalette(hub?: string) {
  return INTRO_HUB_PALETTE[hub || 'academy'] || INTRO_HUB_PALETTE.academy;
}

/**
 * Editorial Front Page — full-bleed hero cover.
 *   ┌───────────────────────────────────────────────┐
 *   │  full-bleed cover image (or themed gradient)   │
 *   │                                         logo   │
 *   │                                                │
 *   │  [LEVEL pill]                                  │
 *   │  Lesson Title (large, overlaid)                │
 *   │  Unit · Lesson #                               │
 *   │  subtitle                                      │
 *   └───────────────────────────────────────────────┘
 * No cover image yet? Falls back to a rich hub-themed gradient with
 * soft decorative highlights instead of a flat tint + lone emoji, so the
 * slide still reads as a designed cover rather than an empty placeholder.
 */
export default function FrontPageSlide({
  lessonTitle,
  topic,
  level,
  hub,
  coverImageUrl,
  unitNumber,
  unitTitle,
  subtitle,
  lessonNumber,
}: FrontPageSlideProps) {
  const theme = getEditorialTheme(hub);
  const palette = getIntroPalette(hub);

  const unitLessonLine = (() => {
    const parts: string[] = [];
    if (unitNumber != null) parts.push(`Unit ${unitNumber}`);
    if (unitTitle) parts.push(unitTitle);
    if (lessonNumber != null) parts.push(`Lesson ${lessonNumber}`);
    return parts.join(' · ');
  })();

  return (
    <div className="relative w-full h-full min-h-[520px] overflow-hidden rounded-2xl">
      {/* ── Full-bleed background: real cover image, or a themed hero gradient ── */}
      <div className="absolute inset-0">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={lessonTitle}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.accent} 100%)` }}
            aria-hidden
          >
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.55) 0%, transparent 32%),' +
                  'radial-gradient(circle at 85% 75%, rgba(255,255,255,0.35) 0%, transparent 30%),' +
                  'radial-gradient(circle at 75% 15%, rgba(255,255,255,0.25) 0%, transparent 25%)',
              }}
            />
          </div>
        )}
      </div>

      {/* Scrim for text legibility over any image/gradient. */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.72) 100%)' }}
      />

      {/* Logo — top-right, overlaid */}
      <div className="absolute top-5 right-6 z-10 flex items-center gap-2">
        <span
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-white/95 font-black text-sm"
          style={{ color: palette.primary }}
          aria-hidden
        >
          E
        </span>
        <span className="text-sm font-extrabold tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
          EnglEuphoria
        </span>
      </div>

      {/* Content block, bottom-aligned over the full-bleed art. */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 px-8 py-8 md:px-12 md:py-10">
        {level && (
          <span
            className={`inline-flex self-start items-center px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest ${palette.pillBg} ${palette.pillText}`}
          >
            {level}
          </span>
        )}

        <h1
          className="font-serif text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.05] max-w-3xl drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)]"
        >
          {lessonTitle}
        </h1>

        {unitLessonLine && (
          <p className="text-sm md:text-base font-semibold uppercase tracking-[0.18em] text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
            {unitLessonLine}
          </p>
        )}

        {(subtitle || (topic && topic !== lessonTitle)) && (
          <p className="text-sm md:text-lg text-white/90 font-light leading-relaxed max-w-2xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
            {subtitle || topic}
          </p>
        )}

        {/* Hub accent bar */}
        <div
          className="mt-1 h-1 w-20 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${palette.primary}, ${palette.accent})`,
          }}
        />

        <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-bold">
          {theme.label}
        </span>
      </div>
    </div>
  );
}
