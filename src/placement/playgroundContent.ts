// Backwards-compatible facade — playground-only API on top of hubContent.
// New code should prefer src/placement/hubContent.ts directly.

import {
  DEFAULT_PLAYGROUND_CONTENT as PG_DEFAULTS,
  loadHubPlacementContent,
  saveHubPlacementContent,
  resetHubContentCache,
  type HubPlacementContent,
} from './hubContent';

export type {
  HubPlacementContent as PlaygroundPlacementContent,
  PlacementOption,
  PlacementQuestion,
  PlacementSection,
  PipVoice,
  PlacementFrontPage,
} from './hubContent';

export const DEFAULT_PLAYGROUND_CONTENT: HubPlacementContent = PG_DEFAULTS;

export const resetPlaygroundContentCache = () => resetHubContentCache('playground');

export const loadPlaygroundPlacementContent = () => loadHubPlacementContent('playground');

export const savePlaygroundPlacementContent = (content: HubPlacementContent) =>
  saveHubPlacementContent('playground', content);
