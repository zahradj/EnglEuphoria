// Read-only view of a saved Academy checklist inside the lesson report (teacher, student and parent views). Data shape: feedback_content.academy_checklist.
import { MARK_LABEL, LESSON_VERDICT_LABEL, UNIT_VERDICT_LABEL, lessonResult, unitResult, type LessonChecklist, type Mark, type UnitAssessment } from '../../curriculum/academy';

export interface SavedAcademyChecklist { lesson?: LessonChecklist | null; unit?: UnitAssessment | null }
const DOT: Record<Mark, string> = { nailed: 'bg-emerald-500', almost: 'bg-amber-500', 'not-yet': 'bg-rose-500' };

/** Families see kind wording: "Replay" and "Repeat" read as "Needs more practice", and the teacher's practice plan stays with the teacher. */
export function AcademyChecklistSummary({ data, audience = 'family' }: { data: SavedAcademyChecklist | null | undefined; audience?: 'teacher' | 'family' }) {
  const teacher = audience === 'teacher';
  if (!data || (!data.lesson && !data.unit)) return null;
  const lr = data.lesson ? lessonResult(data.lesson) : null;
  const ur = data.unit ? unitResult(data.unit) : null;
  return (
    <section className="space-y-3 rounded-xl border border-border p-3 text-sm" aria-label="Lesson checklist">
      {data.lesson && lr && (
        <div>
          <h4 className="font-extrabold">Lesson goals · {teacher || lr.verdict === 'nailed' ? LESSON_VERDICT_LABEL[lr.verdict] : LESSON_VERDICT_LABEL.practise}</h4>
          <ul className="mt-1 space-y-1">
            {data.lesson.criteria.map((c) => (
              <li key={c.text} className="flex items-start gap-2"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${DOT[c.mark]}`} aria-hidden /><span><b>{MARK_LABEL[c.mark]}:</b> {c.text}</span></li>
            ))}
          </ul>
          {data.lesson.errors.length > 0 && <p className="mt-1 text-xs text-muted-foreground">Keep practising: {data.lesson.errors.join(', ')}</p>}
        </div>
      )}
      {data.unit && ur && (
        <div>
          <h4 className="font-extrabold">Unit result · {teacher || ur.verdict !== 'repeat' ? UNIT_VERDICT_LABEL[ur.verdict] : UNIT_VERDICT_LABEL.practise}</h4>
          <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
            {Object.entries(ur.marks).map(([s, m]) => <li key={s} className="flex items-center gap-2 capitalize"><span className={`h-2.5 w-2.5 rounded-full ${DOT[m]}`} aria-hidden />{s}: {MARK_LABEL[m]}</li>)}
          </ul>
          {teacher && ur.plan.length > 0 && <ul className="mt-1 list-disc ps-5 text-xs text-muted-foreground">{ur.plan.map((p) => <li key={p}>{p}</li>)}</ul>}
        </div>
      )}
    </section>
  );
}
