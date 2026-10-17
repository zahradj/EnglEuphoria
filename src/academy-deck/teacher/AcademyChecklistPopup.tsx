import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { loadScript } from '../../academy-player-v2/lessonScripts';
import { levelOfBlueprint } from '../../academy-player-v2/lessonScripts';
import { ACADEMY_DECK_BLUEPRINT_IDS } from '../lessonRegistry';
import type { DeckScript } from '../types';
import type { LessonChecklist } from '../../curriculum/academy';
import { AC_TAG_PREFIX, criteriaOf, loadAcademyChecklist, saveAcademyChecklist, suggestMarks, type ActivityRow } from '../classroom/checklistLog';
import { LessonChecklistPanel } from './LessonChecklistPanel';

/**
 * Academy twin of the Playground checklist pop-up (owner 2026-10-15: "do the same in the Academy classroom"). Teacher-only and optional:
 * while the student works, the teacher opens the lesson's checklist and marks each goal (Nailed it / Almost / Not yet). The marks start from
 * what the student's screen saved (suggested), the goals the page on screen trains are highlighted, and everything is kept for this class so the
 * end-of-class report opens with the checklist filled in. The student never sees it.
 */
export function AcademyChecklistPopup({ lessonId, sessionId, bookingId, studentId, slideIndex, accent = '#7C3AED' }: {
  lessonId: string;
  sessionId?: string;
  bookingId?: string;
  studentId?: string;
  /** 0-based slide the class is on now */
  slideIndex: number | null;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const [script, setScript] = useState<DeckScript | null>(null);
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [saved, setSaved] = useState<LessonChecklist | null>(null);
  const blueprintId = ACADEMY_DECK_BLUEPRINT_IDS[lessonId] ?? lessonId;

  useEffect(() => {
    let live = true;
    void loadScript(lessonId)?.then((s) => { if (live) setScript({ lessonId, level: levelOfBlueprint(s.blueprintId), criteria: s.criteria, slides: [] } as unknown as DeckScript); });
    return () => { live = false; };
  }, [lessonId]);

  const refresh = useCallback(async () => {
    if (!sessionId) return;
    const { data } = await supabase.from('quiz_responses').select('slide_id, is_correct, selected_option_id, skill_tag').eq('session_id', sessionId).like('skill_tag', `${AC_TAG_PREFIX}%`);
    setRows((data ?? []) as ActivityRow[]);
  }, [sessionId]);
  useEffect(() => {
    if (!open) return;
    void refresh();
    const t = window.setInterval(() => void refresh(), 15000);
    return () => window.clearInterval(t);
  }, [open, refresh]);

  const prior = useMemo(() => {
    const p = loadAcademyChecklist<LessonChecklist>(bookingId);
    return p && p.lessonId === blueprintId ? p : null;
  }, [bookingId, blueprintId, open]);
  const suggested = useMemo(() => (script ? suggestMarks(script.slides, script.criteria.length, rows) : []), [script, rows]);
  const onChange = useCallback((c: LessonChecklist) => { setSaved(c); saveAcademyChecklist(bookingId, c); }, [bookingId]);
  const marked = saved?.criteria.filter((c) => c.mark !== 'almost' || c.suggested).length ?? 0;
  const highlight = script && slideIndex !== null ? criteriaOf(script.slides[slideIndex]) : [];

  if (!script) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Open the lesson checklist"
        className="fixed bottom-24 start-4 z-40 flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-extrabold text-white shadow-lg transition active:scale-95" style={{ background: accent }}>
        <ClipboardCheck className="h-5 w-5" /> Checklist{marked ? ` · ${marked}` : ''}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-hidden p-0">
          <DialogTitle className="sr-only">Lesson checklist</DialogTitle>
          <div className="max-h-[88vh] overflow-y-auto p-4">
            <p className="mb-3 text-xs text-muted-foreground">Only you see this. Mark as the student works — it is optional, and everything you mark is in the report at the end.</p>
            {open && (
              <LessonChecklistPanel key={rows.length} embedded lessonId={blueprintId} studentId={studentId || 'student'} level={script.level} criteria={script.criteria}
                suggested={suggested.map((m) => m ?? 'almost')} initial={prior ?? saved} highlight={highlight} onChange={onChange} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
