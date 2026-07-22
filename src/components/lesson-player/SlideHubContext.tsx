import { createContext, useContext } from 'react';
import type { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';
import { HUB_CONFIGS } from '@/components/admin/lesson-builder/ai-wizard/hubConfig';

export interface SlideHubContextValue {
  hub: HubType;
  accent: string;     // primary accent hex
  accentSoft: string; // soft tint (background)
}

const defaultValue: SlideHubContextValue = {
  hub: 'academy',
  accent: HUB_CONFIGS.academy.colorPalette.primary,
  accentSoft: HUB_CONFIGS.academy.colorPalette.highlight,
};

export const SlideHubContext = createContext<SlideHubContextValue>(defaultValue);

export const useSlideHub = () => useContext(SlideHubContext);

export const buildHubValue = (hub: HubType): SlideHubContextValue => ({
  hub,
  accent: HUB_CONFIGS[hub].colorPalette.primary,
  accentSoft: HUB_CONFIGS[hub].colorPalette.highlight,
});
