import type { StoryPage, StoryPanel, StoryVisualStyle } from './StoryBookViewer';

export type AnyHub = 'playground' | 'academy' | 'success' | 'kids' | 'teen' | 'adult' | string | undefined | null;

const ALLOWED_STYLES: StoryVisualStyle[] = [
  'classic',
  'comic_western',
  'manga_rtl',
  'webtoon',
  'picture_book',
  'comic_spread',
];

/** Resolve the visual style to render. Defaults `classic` to the premium per-hub layout. */
export function resolveStoryVisualStyle(rawStyle: unknown, hub: AnyHub): StoryVisualStyle {
  let style: StoryVisualStyle =
    typeof rawStyle === 'string' && (ALLOWED_STYLES as string[]).includes(rawStyle)
      ? (rawStyle as StoryVisualStyle)
      : 'classic';
  if (style === 'classic') {
    const h = String(hub ?? '').toLowerCase();
    if (h === 'playground' || h === 'kids') style = 'picture_book';
    else if (h === 'academy' || h === 'teen') style = 'comic_spread';
  }
  return style;
}

/**
 * Convert PPP story slides (StoryCreator output) into StoryPage[] for the
 * StoryBookViewer. MCQ slides attach as `mcq` to the previous narrative page.
 * If panels exist but lack image_url, the slide's `custom_image_url` is used
 * as a fallback for the first panel so paneled layouts always have visuals.
 */
export function normalizeSlidesToStoryPages(slides: any[]): StoryPage[] {
  const pages: StoryPage[] = [];
  for (const s of slides ?? []) {
    const slideType = s?.slide_type || s?.type;
    const isMcq =
      slideType === 'multiple_choice' ||
      (s?.interactive_data && Array.isArray(s.interactive_data.options));

    if (isMcq) {
      const data = s.interactive_data || {};
      const mcq = {
        question: data.question || s.content || s.title || 'Question',
        options: Array.isArray(data.options) ? data.options : [],
        correct_index: typeof data.correct_index === 'number' ? data.correct_index : 0,
      };
      const last = pages[pages.length - 1];
      if (last && !last.mcq) {
        last.mcq = mcq;
      } else {
        pages.push({ title: s.title, text: '', mcq });
      }
      continue;
    }

    const text = s?.content || s?.teacher_script || '';
    const imageUrl: string | undefined =
      s?.custom_image_url ||
      s?.image_url ||
      s?.imageUrl ||
      s?.media?.image_url ||
      s?.interactive_data?.image_url ||
      undefined;

    let panels: StoryPanel[] | undefined = Array.isArray(s?.interactive_data?.panels)
      ? (s.interactive_data.panels as StoryPanel[]).map((p) => ({ ...p }))
      : undefined;

    // Fallback: hydrate first panel image from the slide's generated image so
    // comic/manga/webtoon/comic_spread layouts always have a visible visual.
    if (panels && panels.length > 0 && imageUrl) {
      if (!panels[0].image_url && !panels[0].imageUrl) {
        panels[0].image_url = imageUrl;
      }
    }

    pages.push({
      title: s?.title,
      text: typeof text === 'string' ? text : String(text ?? ''),
      imageUrl,
      panels,
    });
  }
  return pages;
}
