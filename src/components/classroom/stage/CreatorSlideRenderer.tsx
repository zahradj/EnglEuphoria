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
import { SlideRenderer as AcademySlideRenderer, themeMap as academyThemeMap } from '@/pages/AcademyDemo';
import { SlideRenderer as SuccessSlideRenderer, themeMap as successThemeMap } from '@/pages/SuccessDemo';
import {
  TrailBackground,
  TrailSlideCard,
} from '@/components/playground-player/trail-chrome';

export type CreatorHub = 'playground' | 'academy' | 'professional';

interface Props {
  slide: any;
  hub: CreatorHub;
  theme?: 'light' | 'dark';
}

export const CreatorSlideRenderer: React.FC<Props> = ({ slide, hub, theme = 'light' }) => {
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

  const t = academyThemeMap[theme];
  return (
    <div className={`w-full h-full flex items-center justify-center px-6 py-4 ${t.bg}`}>
      <div className="w-full max-w-4xl">
        <AcademySlideRenderer slide={slide as any} t={t} />
      </div>
    </div>
  );
};

export default CreatorSlideRenderer;
