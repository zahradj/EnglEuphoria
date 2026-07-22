// Student Library — unlocks, recommendations, progress.

import { supabase } from '@/integrations/supabase/client';
import type { LibraryStatus, Storybook } from '@/storybook/types';

export interface LibraryEntry {
  id: string;
  student_id: string;
  book_id: string;
  status: LibraryStatus;
  unlocked_at: string | null;
  last_page_id: string | null;
  reading_progress: number;
  unlock_reason: string | null;
  book?: Pick<Storybook, 'id' | 'title' | 'hub' | 'cefr_level' | 'cover_image_url'>;
}

export async function getMyLibrary(): Promise<LibraryEntry[]> {
  const { data: authData } = await supabase.auth.getUser();
  const uid = authData?.user?.id;
  if (!uid) return [];

  const { data, error } = await (supabase as any)
    .from('student_library')
    .select('*, book:storybooks(id,title,hub,cefr_level,cover_image_url)')
    .eq('student_id', uid)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as LibraryEntry[];
}

export async function unlockBook(bookId: string, reason: string): Promise<void> {
  const { data: authData } = await supabase.auth.getUser();
  const uid = authData?.user?.id;
  if (!uid) throw new Error('Sign in required');

  await (supabase as any).from('student_library').upsert({
    student_id: uid,
    book_id: bookId,
    status: 'unlocked',
    unlocked_at: new Date().toISOString(),
    unlock_reason: reason,
  }, { onConflict: 'student_id,book_id' });
}

export async function updateReadingProgress(bookId: string, lastPageId: string, progress: number): Promise<void> {
  const { data: authData } = await supabase.auth.getUser();
  const uid = authData?.user?.id;
  if (!uid) return;
  const status: LibraryStatus = progress >= 1 ? 'completed' : 'reading';
  await (supabase as any).from('student_library').upsert({
    student_id: uid,
    book_id: bookId,
    status,
    last_page_id: lastPageId,
    reading_progress: Math.max(0, Math.min(1, progress)),
  }, { onConflict: 'student_id,book_id' });
}

export async function toggleFavorite(bookId: string, fav: boolean): Promise<void> {
  const { data: authData } = await supabase.auth.getUser();
  const uid = authData?.user?.id;
  if (!uid) return;
  await (supabase as any).from('student_library').upsert({
    student_id: uid,
    book_id: bookId,
    status: fav ? 'favorite' : 'unlocked',
  }, { onConflict: 'student_id,book_id' });
}

/** Recommend books at the student's CEFR in their hub that aren't already unlocked. */
export async function recommendBooksForHub(hub: 'playground' | 'academy' | 'success', cefr: string, limit = 6) {
  const { data, error } = await (supabase as any)
    .from('storybooks')
    .select('id,title,hub,cefr_level,cover_image_url')
    .eq('hub', hub)
    .eq('published', true)
    .eq('cefr_level', cefr)
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
