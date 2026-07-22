/**
 * Spot registry — maps SceneKind → a named adventure spot. Icons are simple
 * pictograms drawn as graphics (no asset deps).
 */
import type { SceneKind } from '../../engine/types';

export type SpotKind = 'cave' | 'bridge' | 'meadow' | 'garden' | 'tent' | 'tower' | 'castle' | 'pond';

export interface SpotDef {
  kind: SpotKind;
  label: string;
}

const MAP: Record<SceneKind, SpotDef> = {
  IntroScene:     { kind: 'tent',   label: 'Start' },
  PhonicsScene:   { kind: 'pond',   label: 'Sound Pond' },
  VocabScene:     { kind: 'cave',   label: 'Word Cave' },
  QuizScene:      { kind: 'bridge', label: 'Quiz Bridge' },
  DragScene:      { kind: 'meadow', label: 'Drag Meadow' },
  MatchScene:     { kind: 'garden', label: 'Match Garden' },
  FillBlankScene: { kind: 'tower',  label: 'Word Tower' },
  StoryScene:     { kind: 'tent',   label: 'Story Tent' },
  EndScene:       { kind: 'castle', label: 'Castle' },
};

export function spotFor(kind: SceneKind): SpotDef {
  return MAP[kind];
}
