import { supabase } from '@/integrations/supabase/client';
import { loadPractice, mergePractice, savePractice, type PracticeData } from '@/academy-deck/practiceStore';

/**
 * Keeps an Academy student's practice record (Daily 10 item states, finished lessons with their "Say it" tally) in the database as well as the browser,
 * so it follows the student across devices and teachers can read it for the gap report. Table: student_academy_practice
 * (supabase/migrations/20261014140000_student_academy_practice.sql, not applied automatically).
 * Everything fails soft: if the table is missing or the network drops, the browser copy keeps working exactly as before.
 */

interface PracticeRow { data: PracticeData | null; updated_at: string | null }
interface PracticeTable {
  select: (cols: string) => { eq: (col: string, value: string) => { maybeSingle: () => Promise<{ data: PracticeRow | null; error: unknown }> } };
  upsert: (row: Record<string, unknown>, opts?: Record<string, unknown>) => Promise<{ error: unknown }>;
}
const table = () => (supabase as unknown as { from: (name: string) => PracticeTable }).from('student_academy_practice');

export async function loadRemotePractice(userId: string): Promise<PracticeData | null> {
  try {
    const { data, error } = await table().select('data, updated_at').eq('user_id', userId).maybeSingle();
    if (error || !data?.data) return null;
    return { items: data.data.items ?? [], lessons: data.data.lessons ?? [], daily10Days: data.data.daily10Days ?? [] };
  } catch {
    return null;
  }
}

export async function saveRemotePractice(userId: string, data: PracticeData): Promise<boolean> {
  try {
    const { error } = await table().upsert({ user_id: userId, data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    return !error;
  } catch {
    return false;
  }
}

/** Load the database copy, merge it with this device's, keep both up to date, and return the merged record (the local one if the database is unreachable). */
export async function syncPractice(userId: string): Promise<PracticeData> {
  const local = loadPractice(userId);
  const remote = await loadRemotePractice(userId);
  if (!remote) {
    // the table may not exist yet or the user is offline: still try to store what we have, ignore failure
    void saveRemotePractice(userId, local);
    return local;
  }
  const merged = mergePractice(local, remote);
  savePractice(userId, merged);
  await saveRemotePractice(userId, merged);
  return merged;
}
