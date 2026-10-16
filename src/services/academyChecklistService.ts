import { supabase } from '@/integrations/supabase/client';
import type { LessonChecklist, UnitAssessment } from '@/curriculum/academy';

/**
 * Saves a teacher's checklists (after a lesson, and the final assessment of a unit). Table: academy_teacher_checks
 * (supabase/migrations/20261014150000_academy_teacher_checks.sql, not applied automatically). Every save also goes to this browser,
 * so nothing is lost while the table does not exist; reads merge both. Everything fails soft.
 */
export type CheckKind = 'lesson' | 'unit';
export type CheckData = LessonChecklist | UnitAssessment;

interface CheckTable {
  upsert: (row: Record<string, unknown>, opts?: Record<string, unknown>) => Promise<{ error: unknown }>;
  select: (cols: string) => { eq: (c: string, v: string) => { eq: (c: string, v: string) => Promise<{ data: { kind: string; ref: string; data: CheckData }[] | null; error: unknown }> } };
}
const table = () => (supabase as unknown as { from: (n: string) => CheckTable }).from('academy_teacher_checks');
const KEY = 'academy-checks-v1';
const key = (teacherId: string, studentId: string) => `${KEY}:${teacherId}:${studentId}`;

type Local = Record<string, CheckData>;
const slot = (kind: CheckKind, ref: string) => `${kind}:${ref}`;
function readLocal(teacherId: string, studentId: string): Local {
  try { return JSON.parse(window.localStorage.getItem(key(teacherId, studentId)) ?? '{}') as Local; } catch { return {}; }
}

export async function saveCheck(teacherId: string, studentId: string, kind: CheckKind, ref: string, data: CheckData): Promise<{ remote: boolean }> {
  try {
    const all = readLocal(teacherId, studentId);
    all[slot(kind, ref)] = data;
    window.localStorage.setItem(key(teacherId, studentId), JSON.stringify(all));
  } catch { /* blocked storage */ }
  try {
    const { error } = await table().upsert({ teacher_id: teacherId, student_id: studentId, kind, ref, data, updated_at: new Date().toISOString() }, { onConflict: 'teacher_id,student_id,kind,ref' });
    return { remote: !error };
  } catch {
    return { remote: false };
  }
}

/** All saved checklists for one student by this teacher: the database copy merged over this browser's. */
export async function loadChecks(teacherId: string, studentId: string): Promise<Local> {
  const out = { ...readLocal(teacherId, studentId) };
  try {
    const { data, error } = await table().select('kind, ref, data').eq('teacher_id', teacherId).eq('student_id', studentId);
    if (!error && data) data.forEach((r) => { out[slot(r.kind as CheckKind, r.ref)] = r.data; });
  } catch { /* table missing or offline */ }
  return out;
}
