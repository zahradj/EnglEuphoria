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
  TapOrderGame,
  WordBuilderGame,
  SortGame,
  type TrailChoiceSlide,
  type TrailDragMatchSlide,
  type MemorySlide,
  type TrailWordGapSlide,
  type MissingLetterSlide,
  type HotspotSlide,
  type TapOrderSlide,
  type WordBuilderSlide,
  type SortSlide,
} from '@/components/playground-player/playground-games';
import type { UnifiedMoment, CatalogActivityBlock } from '@/unified-lessons/types';
import { GameThemeScope, useHubTheme } from './HubTheme';
import { NavFooter } from './NavFooter';
import { PhonicsPopGame, type PhonicsPopSlide } from './PhonicsPopGame';
import { RolePlayGame, SpeakingMissionGame, ListenRepeatGame, type RolePlaySlide, type SpeakingMissionSlide, type ListenRepeatSlide } from './SpeakingActivities';

const ACTIVITY_ICON: Record<string, string> = {
  multiple: '🤔',
  match: '🧩',
  drag: '🎯',
  memory: '🧠',
  fill: '✏️',
  missing_letter: '🔤',
  hotspot: '👆',
  echo: '🔊',
  shadowing: '🔊',
  tap_order: '🔢',
  word_builder: '🔡',
  sort: '🗂️',
  phonics_pop: '🫧',
};

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
    case 'tap_order':
      return <TapOrderGame slide={{ type: 'tap_order', ...block.config } as TapOrderSlide} />;
    case 'word_builder':
      return <WordBuilderGame slide={{ type: 'word_builder', ...block.config } as WordBuilderSlide} />;
    case 'sort':
      return <SortGame slide={{ type: 'sort', ...block.config } as SortSlide} />;
    case 'role_play':
      return <RolePlayGame slide={{ type: 'role_play', ...block.config } as RolePlaySlide} />;
    case 'speaking_mission':
      return <SpeakingMissionGame slide={{ type: 'speaking_mission', ...block.config } as SpeakingMissionSlide} />;
    case 'echo':
    case 'shadowing':
      return <ListenRepeatGame slide={{ type: block.activityType, ...block.config } as ListenRepeatSlide} />;
    case 'phonics_pop':
      return <PhonicsPopGame slide={{ type: 'phonics_pop', ...block.config } as PhonicsPopSlide} />;
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
  onBack,
  isFirst,
  isLast,
  pageLabel,
}: {
  moment: UnifiedMoment;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  pageLabel: string;
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
  // its own bubble styling, so it skips the shared card treatment every
  // other (game-board-style) activity type still needs.
  const isBubbleStyle = current.activityType === 'role_play';
  const activityView = (
    <GameThemeScope hub={theme.hub}>
      <ActivityView key={index} block={current} />
    </GameThemeScope>
  );
  // A clean, near-opaque content panel — closer to a slide's white content
  // block than an app "card" (no tinted border/backdrop-blur trying to
  // read the background through it), since it now sits on a bold color
  // background rather than a busy mesh.
  const gameCard = isBubbleStyle ? (
    activityView
  ) : (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-2xl sm:p-8">{activityView}</div>
  );

  // A designed presentation slide, not an app screen: a bold color-block
  // (or the moment's own scene photo) background, one big confident
  // headline set directly on it like real slide type — no floating pill
  // chip, no circular avatar badge, no soft app-style mesh texture.
  return (
    <div className="relative flex h-full flex-col overflow-hidden" style={moment.sceneImageUrl ? undefined : { backgroundImage: theme.slideBackground }}>
      {moment.sceneImageUrl && (
        <>
          <img src={moment.sceneImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/35" />
        </>
      )}
      <div className="relative z-10 flex-shrink-0 p-4 sm:p-8">
        <h2 className="text-2xl font-black text-white drop-shadow-lg sm:text-4xl">
          {ACTIVITY_ICON[current.activityType] ?? '🎮'} {current.label}
        </h2>
      </div>
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-8 sm:pb-8">
        <div className="flex min-h-full items-center justify-center">{gameCard}</div>
      </div>
      <NavFooter
        onBack={() => (index > 0 ? setIndex((i) => i - 1) : onBack())}
        backDisabled={isFirst && index === 0}
        onNext={() => (isLastBlock ? onNext() : setIndex((i) => i + 1))}
        nextLabel={isLastBlock ? (isLast ? 'Finish ✨' : 'Next →') : 'Next activity →'}
        pageLabel={pageLabel}
        accent={theme.accent}
        accent2={theme.accent2}
      />
    </div>
  );
}
