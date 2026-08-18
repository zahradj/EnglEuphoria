// CRUD for the unified_lessons table (Academy + Success PPP+activity
// lessons). Mirrors the castVault.ts service pattern already used for cast
// characters — same client import, same `(supabase as any).from(...)` cast
// since this table isn't in the generated Supabase types yet.
import { supabase } from '@/integrations/supabase/client';
import type { Hub, UnifiedLesson, UnifiedMoment } from './types';

const TABLE = 'unified_lessons' as const;

export type LessonStatus = 'draft' | 'published';

export interface UnifiedLessonRow {
  id: string;
  hub: Hub;
  title: string;
  cefr: string;
  default_host_character_id: string | null;
  moments: UnifiedMoment[];
  status: LessonStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

function rowToLesson(row: UnifiedLessonRow): UnifiedLesson {
  return {
    id: row.id,
    title: row.title,
    cefr: row.cefr,
    hub: row.hub,
    defaultHostCharacterId: row.default_host_character_id ?? undefined,
    moments: row.moments,
  };
}

export async function listUnifiedLessons(hub: Hub, opts?: { mineOnly?: boolean }): Promise<UnifiedLessonRow[]> {
  let query = (supabase as any).from(TABLE).select('*').eq('hub', hub).order('updated_at', { ascending: false });
  if (opts?.mineOnly) {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user?.id) query = query.eq('created_by', authData.user.id);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as UnifiedLessonRow[];
}

export async function listPublishedUnifiedLessons(hub: Hub): Promise<UnifiedLessonRow[]> {
  const { data, error } = await (supabase as any)
    .from(TABLE)
    .select('*')
    .eq('hub', hub)
    .eq('status', 'published')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as UnifiedLessonRow[];
}

export async function getUnifiedLessonRow(id: string): Promise<UnifiedLessonRow | null> {
  const { data, error } = await (supabase as any).from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as UnifiedLessonRow | null;
}

export async function getUnifiedLesson(id: string): Promise<UnifiedLesson | null> {
  const row = await getUnifiedLessonRow(id);
  return row ? rowToLesson(row) : null;
}

export interface SaveUnifiedLessonInput {
  id?: string;
  hub: Hub;
  title: string;
  cefr: string;
  defaultHostCharacterId?: string | null;
  moments: UnifiedMoment[];
  status?: LessonStatus;
}

export async function saveUnifiedLesson(input: SaveUnifiedLessonInput): Promise<UnifiedLessonRow> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) throw new Error('Must be signed in to save a lesson');

  const row = {
    id: input.id,
    hub: input.hub,
    title: input.title,
    cefr: input.cefr,
    default_host_character_id: input.defaultHostCharacterId ?? null,
    moments: input.moments,
    ...(input.status ? { status: input.status } : {}),
    created_by: userId,
  };

  const { data, error } = await (supabase as any).from(TABLE).upsert(row).select().single();
  if (error) throw error;
  return data as UnifiedLessonRow;
}

export async function setUnifiedLessonStatus(id: string, status: LessonStatus): Promise<void> {
  const { error } = await (supabase as any).from(TABLE).update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteUnifiedLesson(id: string): Promise<void> {
  const { error } = await (supabase as any).from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
