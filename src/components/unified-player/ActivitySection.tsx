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
import { RolePlayGame, SpeakingMissionGame, ListenRepeatGame, type RolePlaySlide, type SpeakingMissionSlide, type ListenRepeatSlide } from './SpeakingActivities';

function ActivityView({ block }: { block: CatalogActivityBlock }) {
  switch (block.activityType) {
    case 'multiple':
      return <TrailChoiceGame slide={{ type: 'multiple', ...block.config } as TrailChoiceSlide} />;
    case 'match':
      return <TrailDragMatchGame slide={{ type: 'match', ...block.config } as TrailDragMatchSlide} />;
    case 'drag':
      return <TrailDragMatchGame slide={{ type: 'drag', ...block.config } as TrailDragMatchSlide} />;
    case 'memory':
      return <MemoryGame slide={{ type: 'memory', ...block.config } as MemorySlide} />;
    case 'fill':
      return <TrailWordGapGame slide={{ type: 'fill', ...block.config } as TrailWordGapSlide} />;
    case 'missing_letter':
      return <MissingLetterGame slide={{ type: 'missing_letter', ...block.config } as MissingLetterSlide} />;
    case 'hotspot':
      return <HotspotGame slide={{ type: 'hotspot', ...block.config } as HotspotSlide} />;
    case 'role_play':
      return <RolePlayGame slide={{ type: 'role_play', ...block.config } as RolePlaySlide} />;
    case 'speaking_mission':
      return <SpeakingMissionGame slide={{ type: 'speaking_mission', ...block.config } as SpeakingMissionSlide} />;
    case 'echo':
    case 'shadowing':
      return <ListenRepeatGame slide={{ type: block.activityType, ...block.config } as ListenRepeatSlide} />;
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

  // Role-play is a floating chat conversation, not a game UI — it supplies
  // its own bubble styling, so it skips the shared white-card frame that
  // every other (game-board-style) activity type still needs.
  const isBubbleStyle = current.activityType === 'role_play';
  const activityView = (
    <GameThemeScope hub={theme.hub}>
      <ActivityView key={index} block={current} />
    </GameThemeScope>
  );

  const body = (
    <div className="mx-auto max-w-3xl">
      {current.label && !isBubbleStyle && (
        <p className="mb-3 text-center">
          <span className="rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wide text-white shadow" style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})` }}>
            {current.label}
          </span>
        </p>
      )}
      {isBubbleStyle ? (
        activityView
      ) : (
        <div className="rounded-3xl bg-white/95 p-5 shadow-md ring-1 ring-slate-200 backdrop-blur-sm sm:p-8">
          {activityView}
        </div>
      )}
      <div className="mt-6 text-center">
        <button
          onClick={() => (isLastBlock ? onNext() : setIndex((i) => i + 1))}
          className="rounded-full px-10 py-4 text-lg font-black text-white shadow-md transition hover:scale-105 active:scale-95"
          style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})` }}
        >
          {isLastBlock ? (isLast ? 'Finish ✨' : 'Continue →') : 'Next activity →'}
        </button>
      </div>
    </div>
  );

  if (!moment.sceneImageUrl) return body;

  return (
    <div className="relative flex min-h-[75vh] flex-col overflow-hidden rounded-3xl shadow-lg">
      <img src={moment.sceneImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.45) 100%)' }} />
      {/* Content hugs the top of the scene instead of centering over it, so
          floating bubbles (role_play) or cards sit above the illustrated
          characters rather than covering their faces. */}
      <div className="relative px-4 pb-10 pt-8 sm:px-8">{body}</div>
    </div>
  );
}
