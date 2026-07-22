import { useCreator } from '@/components/creator-studio/CreatorContext';
import { getHubTheme, type HubThemeStructure } from '@/lib/hubTheme';
import type { HubType } from '@/components/creator-studio/CreatorContext';

/**
 * Resolves the active Hub for theming.
 * Priority: explicit override > active lesson hub > curriculum hub > 'playground'.
 *
 * Components can call this anywhere inside <CreatorProvider> and pass an
 * optional override (e.g. when previewing a specific lesson in a list).
 */
export function useHubTheme(override?: HubType | null): {
  hub: HubType;
  theme: HubThemeStructure;
} {
  const { activeLessonData, curriculumData } = useCreator();
  const hub: HubType =
    override ??
    activeLessonData?.hub ??
    curriculumData?.hub ??
    'playground';
  return { hub, theme: getHubTheme(hub) };
}
