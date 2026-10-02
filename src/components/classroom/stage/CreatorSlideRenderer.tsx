/**
 * Unified bridge that renders ANY creator-studio slide
 * (Playground / Academy / Success) inside the live classroom — using the
 * SAME renderer the creator preview uses, so layout/activities are 1:1.
 *
 * The 3 creators each produce slides with their own native schema
 * (`type: 'multiple' | 'truefalse' | 'vocab' | 'matching' | …`). The legacy
 * DynamicSlideRenderer expected a different schema (`activityType`,
 * `interactive_data`), which is why classroom slides showed
 * "Interactive data missing" or were blank. This component dispatches by
 * hub to the correct SlideRenderer.
 */
import React from 'react';
import { SlideRenderer as PlaygroundSlideRenderer } from '@/pages/PlaygroundDemo';
import { SlideRenderer as AcademySlideRenderer, themeMap as academyThemeMap, type OnAnswer } from '@/pages/AcademyDemo';
import { SlideRenderer as SuccessSlideRenderer, themeMap as successThemeMap } from '@/pages/SuccessDemo';
import { isAcademyFullBleed, needsJournalFrame, academySlideBackground } from '@/lib/academy/slideChrome';
import {
  TrailBackground,
  TrailSlideCard,
} from '@/components/playground-player/trail-chrome';

export type CreatorHub = 'playground' | 'academy' | 'professional';

interface Props {
  slide: any;
  hub: CreatorHub;
  theme?: 'light' | 'dark';
  /** Fired when a student answers a gradable item on an Academy quiz-like
   *  slide (multiple/truefalse/matching/etc.) — wired only for Academy,
   *  where the real live-classroom persistence path needs it; Playground
   *  and Success slide renderers don't accept this prop yet. */
  onAnswer?: OnAnswer;
}

export const CreatorSlideRenderer: React.FC<Props> = ({ slide, hub, theme = 'light', onAnswer }) => {
  if (!slide) return null;

  if (hub === 'playground') {
    // Classroom rule: Playground slides render on a clean white surface — no
    // immersive yellow/orange trail shell behind the slide content.
    return (
      <div className="relative w-full h-full overflow-hidden bg-white">
        <div className="relative w-full h-full flex items-center justify-center px-6 py-4">
          <div className="w-full max-w-4xl">
            <PlaygroundSlideRenderer slide={slide as any} />
          </div>
        </div>
      </div>
    );
  }

  if (hub === 'professional') {
    const t = successThemeMap[theme];
    return (
      <div className={`w-full h-full flex items-center justify-center px-6 py-4 ${t.bg}`}>
        <div className="w-full max-w-4xl">
          <SuccessSlideRenderer slide={slide as any} t={t} />
        </div>
      </div>
    );
  }

  // Academy: lay the slide out exactly as the student lesson player does —
  // full-bleed scene slides edge-to-edge over their own art, other slides as a
  // card on a dark scene backdrop.
  const bgImage = academySlideBackground(slide);
  const fullBleed = isAcademyFullBleed(slide);
  const sceneStyle: React.CSSProperties = bgImage
    ? { backgroundImage: `linear-gradient(rgba(8,8,24,0.35), rgba(8,8,24,0.35)), url("${bgImage}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: 'linear-gradient(160deg, #171335 0%, #100e28 55%, #0b0a1f 100%)' };

  // Soft rounded "picture frame" around every Academy slide: margins on all
  // sides, extra room at the bottom so the floating teacher toolbar never sits
  // on top of lesson content, rounded corners, a drop shadow and an inner
  // vignette so the edges fade instead of cutting off hard.
  const frame = (children: React.ReactNode) => (
    <div
      className="h-full w-full p-3 pb-[88px] md:p-5 md:pb-[92px]"
      style={{ background: 'linear-gradient(135deg, hsl(220 100% 97%) 0%, hsl(260 60% 94%) 100%)' }}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-[28px] ring-1 ring-white/50 shadow-[0_12px_40px_rgba(30,27,75,0.28)]"
        style={sceneStyle}
      >
        {children}
        <div
          className="pointer-events-none absolute inset-0 rounded-[28px]"
          style={{ boxShadow: 'inset 0 0 70px 6px rgba(8,8,24,0.35)' }}
        />
      </div>
    </div>
  );

  if (fullBleed) {
    return frame(
      <div className={`absolute inset-0 flex items-center justify-center ${slide?.type === 'intro' ? '[&>div]:!min-h-0' : ''}`}>
        {needsJournalFrame(slide) ? (
          <div className="mx-4 max-h-full w-full max-w-3xl overflow-y-auto rounded-3xl border-4 border-emerald-800 bg-[#fbf8ee] p-6 text-slate-900 shadow-xl md:p-8">
            <AcademySlideRenderer slide={slide as any} t={academyThemeMap.light} fullBleed={false} onAnswer={onAnswer} />
          </div>
        ) : (
          <AcademySlideRenderer slide={slide as any} t={academyThemeMap.dark} fullBleed={slide?.type !== 'intro'} onAnswer={onAnswer} />
        )}
      </div>,
    );
  }

  return frame(
    <div className="absolute inset-0 flex items-center justify-center px-4 py-4 md:px-8">
      <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-3xl border-4 border-emerald-800 bg-white p-5 text-slate-900 shadow-xl md:p-7">
        <AcademySlideRenderer slide={slide as any} t={academyThemeMap.light} onAnswer={onAnswer} />
      </div>
    </div>,
  );
};

export default CreatorSlideRenderer;
