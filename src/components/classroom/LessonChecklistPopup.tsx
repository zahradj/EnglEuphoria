import React, { useEffect, useRef, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { LessonChecklistCard, type ChecklistValue, type SceneLessonRef } from './LessonChecklistCard';

/**
 * Teacher-only, optional (owner, 2026-10-15: "a pop-up in the classroom on the teacher's side"): while the student
 * works — the Boss Test too — the teacher opens the lesson checklist and taps Did it / Needed help / Not yet. The ticks
 * are kept for this class (LessonChecklistCard's store), so the end-of-class report opens with the full list filled in.
 * The student never sees it.
 */
export function LessonChecklistPopup({ sceneLesson, sessionId, bookingId, currentPage, accent }: {
  sceneLesson: SceneLessonRef;
  sessionId?: string;
  bookingId?: string;
  /** 1-based page the class is on now. */
  currentPage: number | null;
  accent: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<ChecklistValue | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // A different lesson put on the stage starts a fresh list.
  const lessonKey = `${sceneLesson.contentFormat}-${sceneLesson.unitNumber}-${sceneLesson.lessonNumber}`;
  useEffect(() => { setValue(null); }, [lessonKey]);

  // Bring the line of the current page into view when the pop-up opens.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => bodyRef.current?.querySelector('[data-now]')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 400);
    return () => clearTimeout(t);
  }, [open, value === null]);

  const ticked = value?.lines.filter((l) => l.byTeacher || l.recorded).length ?? 0;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Open the lesson checklist"
        className="fixed bottom-24 start-4 z-40 flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-extrabold text-white shadow-lg transition active:scale-95"
        style={{ background: accent }}>
        <ClipboardCheck className="h-5 w-5" /> Checklist{ticked ? ` · ${ticked}` : ''}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-hidden p-0">
          <DialogTitle className="sr-only">Lesson checklist</DialogTitle>
          <div ref={bodyRef} className="max-h-[88vh] overflow-y-auto p-4">
            <p className="mb-3 text-xs text-muted-foreground">
              Only you see this. Tick as the student works — it is optional, and everything you tick is in the report at the end.
            </p>
            {open && (
              <LessonChecklistCard sceneLesson={sceneLesson} sessionId={sessionId} bookingId={bookingId} pagesReached={currentPage}
                currentPage={currentPage} accent={accent} value={value} onChange={setValue} heading="Checklist — tick as you go" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
