// The teacher's checklist after a lesson: one mark per success criterion (the player suggests one from the wrong tries), the speaking step reached,
// up to three recurring errors, comfort, notes, and the verdict with what to do next. Rules: src/curriculum/academy/checklist.ts.
import { useEffect, useMemo, useState } from 'react';
import { ERROR_CATEGORIES, LESSON_VERDICT_LABEL, MARK_LABEL, SPEAKING_LADDER, lessonResult, type ErrorCategory, type LadderStepId, type LessonChecklist, type Mark } from '../../curriculum/academy';

const MARKS: Mark[] = ['nailed', 'almost', 'not-yet'];
const TONE: Record<Mark, string> = { nailed: 'bg-emerald-600 text-white', almost: 'bg-amber-500 text-white', 'not-yet': 'bg-rose-600 text-white' };
const VERDICT_TONE = { nailed: 'bg-emerald-100 text-emerald-900 ring-emerald-400', practise: 'bg-amber-100 text-amber-900 ring-amber-400', replay: 'bg-rose-100 text-rose-900 ring-rose-400' } as const;

export interface LessonChecklistPanelProps {
  lessonId: string;
  studentId: string;
  level: LessonChecklist['level'];
  criteria: string[];
  /** suggested marks from the player (same order as `criteria`) */
  suggested?: Mark[];
  sayIt?: number;
  today?: string;
  onSave?: (c: LessonChecklist) => void;
  onSkip?: () => void;
  /** inside another form (the lesson report): no Save/Skip buttons, the parent reads every change */
  embedded?: boolean;
  onChange?: (c: LessonChecklist) => void;
}

export function LessonChecklistPanel({ lessonId, studentId, level, criteria, suggested, sayIt, today = new Date().toISOString().slice(0, 10), onSave, onSkip, embedded = false, onChange }: LessonChecklistPanelProps) {
  const [marks, setMarks] = useState<Mark[]>(() => criteria.map((_, i) => suggested?.[i] ?? 'almost'));
  const [step, setStep] = useState<LadderStepId | null>(null);
  const [errors, setErrors] = useState<ErrorCategory[]>([]);
  const [comfort, setComfort] = useState<'ok' | 'tense'>('ok');
  const [notes, setNotes] = useState('');
  const checklist: LessonChecklist = useMemo(() => ({
    lessonId, studentId, on: today, level, speakingStep: step, errors, comfort, notes, sayIt,
    criteria: criteria.map((text, i) => ({ text, mark: marks[i], suggested: suggested?.[i] })),
  }), [lessonId, studentId, today, level, step, errors, comfort, notes, sayIt, criteria, marks, suggested]);
  const result = lessonResult(checklist);
  useEffect(() => { onChange?.(checklist); }, [checklist, onChange]);
  const toggleError = (e: ErrorCategory) => setErrors((cur) => (cur.includes(e) ? cur.filter((x) => x !== e) : cur.length >= 3 ? cur : [...cur, e]));

  return (
    <section className={`mx-auto max-w-2xl space-y-4 rounded-2xl bg-white p-5 text-slate-900 ${embedded ? 'ring-1 ring-slate-200' : 'shadow-xl ring-1 ring-slate-200'}`} aria-label="Lesson checklist">
      <header>
        <h2 className={embedded ? 'text-base font-extrabold' : 'text-xl font-black'}>Lesson checklist</h2>
        <p className="text-sm text-slate-600">What did the student do? Mark each goal. {suggested ? 'The marks start from what the player saw; change any of them.' : ''}</p>
      </header>
      <ul className="space-y-2">
        {criteria.map((text, i) => (
          <li key={text} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3">
            <span className="text-sm font-semibold">{text}</span>
            <span className="flex gap-1" role="group" aria-label={`Mark for: ${text}`}>
              {MARKS.map((m) => (
                <button key={m} type="button" aria-pressed={marks[i] === m} onClick={() => setMarks((cur) => cur.map((x, k) => (k === i ? m : x)))}
                  className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ring-slate-300 ${marks[i] === m ? TONE[m] : 'bg-white text-slate-700'}`}>
                  {MARK_LABEL[m]}{suggested?.[i] === m ? ' ·' : ''}
                </button>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <div>
        <h3 className="text-sm font-bold">Speaking: the highest step reached</h3>
        <div className="mt-1 flex flex-wrap gap-1">
          {SPEAKING_LADDER.map((s) => (
            <button key={s.step} type="button" aria-pressed={step === s.step} onClick={() => setStep(s.step)} className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ring-slate-300 ${step === s.step ? 'bg-violet-700 text-white' : 'bg-white'}`}>{s.step}</button>
          ))}
        </div>
        {sayIt !== undefined && <p className="mt-1 text-xs text-slate-500">The student tapped “Say it” {sayIt} times.</p>}
      </div>
      <div>
        <h3 className="text-sm font-bold">Recurring errors (up to 3): they start the next Remember?</h3>
        <div className="mt-1 flex flex-wrap gap-1">
          {ERROR_CATEGORIES.map((e) => (
            <button key={e} type="button" aria-pressed={errors.includes(e)} onClick={() => toggleError(e)} className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ring-slate-300 ${errors.includes(e) ? 'bg-slate-800 text-white' : 'bg-white'}`}>{e}</button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={comfort === 'tense'} onChange={(e) => setComfort(e.target.checked ? 'tense' : 'ok')} /> The student seemed tense or tired</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes for the next lesson (optional)" className="w-full rounded-xl border border-slate-300 p-2 text-sm" rows={2} aria-label="Notes" />
      <div className={`rounded-xl p-3 ring-1 ${VERDICT_TONE[result.verdict]}`} role="status" aria-label="Verdict" data-verdict={result.verdict}>
        <p className="font-extrabold">{LESSON_VERDICT_LABEL[result.verdict]}</p>
        <ul className="mt-1 list-disc ps-5 text-sm">{result.actions.map((a) => <li key={a}>{a}</li>)}</ul>
      </div>
      {!embedded && (
        <div className="flex justify-end gap-2">
          {onSkip && <button type="button" onClick={onSkip} className="rounded-full px-4 py-2 text-sm font-bold text-slate-600">Skip</button>}
          {onSave && <button type="button" onClick={() => onSave(checklist)} className="rounded-full bg-violet-700 px-5 py-2 text-sm font-extrabold text-white">Save checklist</button>}
        </div>
      )}
    </section>
  );
}
