/**
 * Renders a `mode: 'activity'` UnifiedMoment's `catalog_activity` blocks by
 * dispatching to a trimmed subset of the existing, reusable React game
 * components in playground-player/playground-games.tsx. Wrapped in
 * <GameThemeScope> so those components pick up hub-specific CSS vars
 * instead of Playground's hardcoded orange (their fallback stays orange, so
 * nothing changes for the existing Playground callsite).
 *
 * Pilot scope: activity types shared by both Academy and Success pilot
 * lessons — 'multiple', 'match', 'memory', 'fill' (drag/tap-to-fill gap),
 * 'missing_letter' (type the missing letter).
 */
import { useState } from 'react';
import {
  TrailChoiceGame,
  TrailDragMatchGame,
  MemoryGame,
  TrailWordGapGame,
  MissingLetterGame,
  HotspotGame,
  type TrailChoiceSlide,
  type TrailDragMatchSlide,
  type MemorySlide,
  type TrailWordGapSlide,
  type MissingLetterSlide,
  type HotspotSlide,
} from '@/components/playground-player/playground-games';
import type { UnifiedMoment, CatalogActivityBlock } from '@/unified-lessons/types';
import { GameThemeScope, useHubTheme } from './HubTheme';

function ActivityView({ block }: { block: CatalogActivityBlock }) {
  switch (block.activityType) {
    case 'multiple':
      return <TrailChoiceGame slide={{ type: 'multiple', ...block.config } as TrailChoiceSlide} />;
    case 'match':
      return <TrailDragMatchGame slide={{ type: 'match', ...block.config } as TrailDragMatchSlide} />;
    case 'memory':
      return <MemoryGame slide={{ type: 'memory', ...block.config } as MemorySlide} />;
    case 'fill':
      return <TrailWordGapGame slide={{ type: 'fill', ...block.config } as TrailWordGapSlide} />;
    case 'missing_letter':
      return <MissingLetterGame slide={{ type: 'missing_letter', ...block.config } as MissingLetterSlide} />;
    case 'hotspot':
      return <HotspotGame slide={{ type: 'hotspot', ...block.config } as HotspotSlide} />;
    default:
      return (
        <p className="text-center text-slate-500">
          Unsupported pilot activity type: {block.activityType}
        </p>
      );
  }
}

export function ActivitySection({
  moment,
  onNext,
  isLast,
}: {
  moment: UnifiedMoment;
  onNext: () => void;
  isLast: boolean;
}) {
  const theme = useHubTheme();
  const [index, setIndex] = useState(0);
  const activityBlocks = moment.blocks.filter(
    (b): b is CatalogActivityBlock => b.type === 'catalog_activity',
  );
  const current = activityBlocks[index];
  const isLastBlock = index >= activityBlocks.length - 1;

  if (!current) return null;

  return (
    <GameThemeScope hub={theme.hub}>
      <div className="mx-auto max-w-3xl">
        {current.label && (
          <p className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-slate-500">{current.label}</p>
        )}
        <ActivityView block={current} />
        <div className="mt-6 text-center">
          <button
            onClick={() => (isLastBlock ? onNext() : setIndex((i) => i + 1))}
            className="rounded-2xl px-8 py-3 text-lg font-black text-white shadow-md transition-transform hover:scale-105"
            style={{ backgroundColor: theme.accent }}
          >
            {isLastBlock ? (isLast ? 'Finish' : 'Continue') : 'Next activity'}
          </button>
        </div>
      </div>
    </GameThemeScope>
  );
}
