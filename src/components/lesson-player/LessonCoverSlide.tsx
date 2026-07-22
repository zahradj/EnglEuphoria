import React from 'react';
import engleuphoriaLogo from '@/assets/engleuphoria-logo-dark.png';

/**
 * LessonCoverSlide — unified 50/50 lesson intro cover used by Playground,
 * Academy, and Success Hub lesson players. Hub-themed coating per the
 * workspace branding rules (Playground orange, Academy purple, Success
 * emerald). Renders a full-bleed topic image on one side and a metadata
 * panel (level chip · unit · lesson · topic) on the other.
 */
export type CoverHub = 'playground' | 'academy' | 'success' | 'professional';

export interface LessonCoverSlideProps {
  hub: CoverHub;
  topic: string;
  subtitle?: string;
  imageUrl?: string;
  level?: string | null;
  unitNumber?: number | string | null;
  unitTitle?: string | null;
  lessonNumber?: number | string | null;
  /** Reverse the split (image on right). Defaults to image-left. */
  imageRight?: boolean;
}

interface HubPalette {
  bubble: string;
  accent: string;
  ring: string;
  pillBg: string;
  pillText: string;
  titleText: string;
}

const HUB_PALETTE: Record<CoverHub, HubPalette> = {
  playground: {
    bubble: '#FE6A2F',
    accent: '#FBBF24',
    ring: 'rgba(254,106,47,0.25)',
    pillBg: 'bg-orange-100',
    pillText: 'text-orange-700',
    titleText: 'text-orange-600',
  },
  academy: {
    bubble: '#6B21A8',
    accent: '#A855F7',
    ring: 'rgba(107,33,168,0.25)',
    pillBg: 'bg-purple-100',
    pillText: 'text-purple-700',
    titleText: 'text-purple-700',
  },
  success: {
    bubble: '#059669',
    accent: '#14B8A6',
    ring: 'rgba(5,150,105,0.25)',
    pillBg: 'bg-emerald-100',
    pillText: 'text-emerald-700',
    titleText: 'text-emerald-700',
  },
  professional: {
    bubble: '#059669',
    accent: '#14B8A6',
    ring: 'rgba(5,150,105,0.25)',
    pillBg: 'bg-emerald-100',
    pillText: 'text-emerald-700',
    titleText: 'text-emerald-700',
  },
};

export const LessonCoverSlide: React.FC<LessonCoverSlideProps> = ({
  hub,
  topic,
  subtitle,
  imageUrl,
  level,
  unitNumber,
  unitTitle,
  lessonNumber,
  imageRight = false,
}) => {
  const palette = HUB_PALETTE[hub] || HUB_PALETTE.academy;

  const unitLessonLine = (() => {
    const parts: string[] = [];
    if (unitNumber != null && unitNumber !== '') parts.push(`Unit ${unitNumber}`);
    if (unitTitle) parts.push(unitTitle);
    if (lessonNumber != null && lessonNumber !== '') parts.push(`Lesson ${lessonNumber}`);
    return parts.join(' · ');
  })();

  const ImagePanel = (
    <div
      className="relative h-full min-h-[280px] w-full overflow-hidden"
      style={{ background: `${palette.bubble}10` }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center text-7xl"
          style={{
            background: `linear-gradient(135deg, ${palette.bubble}33, ${palette.accent}33)`,
            color: palette.bubble,
          }}
          aria-hidden
        >
          📘
        </div>
      )}
      <div
        className="absolute bottom-0 left-0 right-0 h-1.5"
        style={{ background: `linear-gradient(90deg, ${palette.bubble}, ${palette.accent})` }}
      />
    </div>
  );

  const MetaPanel = (
    <div
      className="relative h-full w-full px-6 md:px-10 py-8 flex flex-col justify-center"
      style={{
        background: `linear-gradient(180deg, #FFFFFF 0%, ${palette.bubble}0D 100%)`,
      }}
    >
      <div className="absolute top-4 right-5 flex items-center gap-2.5">
        <span
          className="inline-flex items-center justify-center h-11 w-11 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${palette.accent}, ${palette.bubble} 70%)`,
            boxShadow: `0 4px 14px ${palette.ring}, inset 0 -2px 4px rgba(0,0,0,0.08)`,
          }}
          aria-hidden
        >
          <img
            src={engleuphoriaLogo}
            alt=""
            className="h-7 w-7 object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </span>
        <span className="text-sm font-extrabold tracking-tight text-slate-800">
          EnglEuphoria
        </span>
      </div>

      <div className="flex flex-col gap-3 max-w-md mt-12 md:mt-0">
        {level && (
          <span
            className={`inline-flex self-start items-center px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest ${palette.pillBg} ${palette.pillText}`}
          >
            {level}
          </span>
        )}

        {unitLessonLine && (
          <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            {unitLessonLine}
          </p>
        )}

        <h1 className={`font-extrabold text-3xl md:text-4xl lg:text-5xl ${palette.titleText} leading-[1.05] drop-shadow-sm`}>
          {topic}
        </h1>

        {subtitle && (
          <p className="text-base md:text-lg text-slate-700 font-medium leading-relaxed">
            {subtitle}
          </p>
        )}

        <div
          className="mt-2 h-1 w-20 rounded-full"
          style={{ background: `linear-gradient(90deg, ${palette.bubble}, ${palette.accent})` }}
        />
      </div>
    </div>
  );

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-white grid grid-cols-1 md:grid-cols-2 min-h-[360px] border"
      style={{ borderColor: `${palette.bubble}22` }}
    >
      {imageRight ? (
        <>
          {MetaPanel}
          {ImagePanel}
        </>
      ) : (
        <>
          {ImagePanel}
          {MetaPanel}
        </>
      )}
    </div>
  );
};

export default LessonCoverSlide;
