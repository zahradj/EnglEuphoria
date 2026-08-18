/**
 * Unified pilot lesson types — Phase 1 of the cross-hub PPP+activity engine.
 *
 * Deliberately NOT added to src/game-runtime/engine/types.ts: that file's
 * `BlockType`/`LessonBlock` union is pattern-matched exhaustively by the
 * Phaser scene planner (engine/scenePlanner.ts's `planBlock` switch) and
 * validated by a closed zod union (engine/lessonSchema.ts). Widening those
 * shared types would either break Phaser's exhaustiveness check or require
 * touching the live Playground rendering path — out of scope for a pilot.
 *
 * Instead this reuses the existing `LessonBlock`/`MomentKind` types (the
 * hub-typed foundation already in the engine) and layers the new
 * `catalog_activity` block kind + presentation/activity `mode` on top, in a
 * parallel envelope nothing else in the codebase touches.
 */
import type { LessonBlock, MomentKind } from '@/game-runtime/engine/types';

export type Hub = 'playground' | 'academy' | 'success';

/** Thin pass-through wrapper for any ACTIVITY_CATALOG entry (ActivityTab.tsx). */
export interface CatalogActivityBlock {
  type: 'catalog_activity';
  /** Matches the reused game component's slide `type` (e.g. 'multiple', 'match', 'memory', 'sort'). */
  activityType: string;
  label?: string;
  config: Record<string, unknown>;
}

export type UnifiedBlock = LessonBlock | CatalogActivityBlock;

export type SectionMode = 'presentation' | 'activity';

export interface UnifiedMoment {
  id: string;
  kind: MomentKind;
  title?: string;
  mode: SectionMode;
  hostCharacterId?: string;
  blocks: UnifiedBlock[];
}

export interface UnifiedLesson {
  id: string;
  title: string;
  cefr: string;
  hub: Hub;
  defaultHostCharacterId?: string;
  moments: UnifiedMoment[];
}
