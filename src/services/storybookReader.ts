// Storybook reader — load full book with chapters + pages for the reader UI.
import { supabase } from '@/integrations/supabase/client';
import type { Storybook, StorybookChapter, StorybookPage } from '@/storybook/types';

export interface LoadedBook {
  book: Storybook;
  chapters: (StorybookChapter & { pages: StorybookPage[] })[];
  flatPages: Array<StorybookPage & { chapter_index: number; chapter_title: string }>;
}

export async function loadBook(bookId: string): Promise<LoadedBook> {
  const { data: book, error: bErr } = await (supabase as any)
    .from('storybooks').select('*').eq('id', bookId).maybeSingle();
  if (bErr) throw bErr;
  if (!book) throw new Error('Book not found');

  const { data: chapters, error: cErr } = await (supabase as any)
    .from('storybook_chapters').select('*').eq('book_id', bookId).order('order_index');
  if (cErr) throw cErr;

  const chapterIds = (chapters ?? []).map((c: any) => c.id);
  const { data: pages, error: pErr } = chapterIds.length
    ? await (supabase as any).from('storybook_pages').select('*').in('chapter_id', chapterIds).order('order_index')
    : { data: [], error: null };
  if (pErr) throw pErr;

  const enriched = (chapters ?? []).map((c: any) => ({
    ...c,
    pages: (pages ?? []).filter((p: any) => p.chapter_id === c.id),
  }));

  const flatPages: LoadedBook['flatPages'] = [];
  enriched.forEach((c, ci) => {
    c.pages.forEach((p: any) =>
      flatPages.push({ ...p, chapter_index: ci, chapter_title: c.title })
    );
  });

  return { book: book as Storybook, chapters: enriched, flatPages };
}
