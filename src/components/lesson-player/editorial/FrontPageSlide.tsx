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
 * Editorial Front Page — 50/50 split layout.
 *   ┌──────────────────────┬──────────────────────┐
 *   │                      │                logo  │
 *   │                      │                      │
 *   │   COVER IMAGE        │   [LEVEL pill]       │
 *   │   (object-cover)     │   Lesson Title       │
 *   │                      │   Unit · Lesson #    │
 *   │                      │                      │
 *   └──────────────────────┴──────────────────────┘
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
    <div className="relative w-full h-full min-h-[520px] overflow-hidden rounded-2xl bg-white grid grid-cols-2">
      {/* ── LEFT: full-bleed cover image ─────────────────────────── */}
      <div className="relative h-full w-full bg-slate-100 overflow-hidden">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={lessonTitle}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-6xl"
            style={{
              background: `linear-gradient(135deg, ${palette.primary}33, ${palette.accent}33)`,
              color: palette.primary,
            }}
            aria-hidden
          >
            📖
          </div>
        )}
        {/* Subtle hub accent stripe at bottom of image */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5"
          style={{
            background: `linear-gradient(90deg, ${palette.primary}, ${palette.accent})`,
          }}
        />
      </div>

      {/* ── RIGHT: metadata panel ────────────────────────────────── */}
      <div
        className="relative h-full w-full px-8 md:px-12 py-10 flex flex-col justify-center"
        style={{
          background: `linear-gradient(180deg, #ffffff 0%, ${palette.primary}0A 100%)`,
        }}
      >
        {/* Logo — top-right */}
        <div className="absolute top-5 right-6 flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-white font-black text-sm"
            style={{ backgroundColor: palette.primary }}
            aria-hidden
          >
            E
          </span>
          <span className="text-sm font-extrabold tracking-tight text-slate-800">
            EnglEuphoria
          </span>
        </div>

        {/* Vertically-centered metadata stack */}
        <div className="flex flex-col gap-4 max-w-md">
          {level && (
            <span
              className={`inline-flex self-start items-center px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest ${palette.pillBg} ${palette.pillText}`}
            >
              {level}
            </span>
          )}

          <h1
            className="font-serif text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.05]"
          >
            {lessonTitle}
          </h1>

          {unitLessonLine && (
            <p className="text-sm md:text-base font-semibold uppercase tracking-[0.18em] text-slate-500">
              {unitLessonLine}
            </p>
          )}

          {(subtitle || (topic && topic !== lessonTitle)) && (
            <p className="text-sm md:text-base text-slate-600 font-light leading-relaxed">
              {subtitle || topic}
            </p>
          )}

          {/* Hub accent bar */}
          <div
            className="mt-2 h-1 w-20 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${palette.primary}, ${palette.accent})`,
            }}
          />

          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">
            {theme.label}
          </span>
        </div>
      </div>
    </div>
  );
}
