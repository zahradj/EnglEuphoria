// The teacher's final assessment of a unit (Season): six strands (0-100) and the Release rubric (1-4), with the verdict and the practice plan.
// Rules: src/curriculum/academy/checklist.ts.
import { useEffect, useMemo, useState } from 'react';
import { RELEASE_CRITERIA, STRANDS, UNIT_VERDICT_LABEL, MARK_LABEL, unitResult, type ReleaseCriterion, type Strand, type UnitAssessment } from '../../curriculum/academy';

const VERDICT_TONE = { nailed: 'bg-emerald-100 text-emerald-900 ring-emerald-400', ready: 'bg-sky-100 text-sky-900 ring-sky-400', practise: 'bg-amber-100 text-amber-900 ring-amber-400', repeat: 'bg-rose-100 text-rose-900 ring-rose-400' } as const;
const MARK_TONE = { nailed: 'text-emerald-700', almost: 'text-amber-700', 'not-yet': 'text-rose-700' } as const;

export interface UnitAssessmentPanelProps {
  seasonId: string;
  studentId: string;
  levelCheck?: boolean;
  today?: string;
  onSave?: (a: UnitAssessment) => void;
  embedded?: boolean;
  onChange?: (a: UnitAssessment) => void;
}

export function UnitAssessmentPanel({ seasonId, studentId, levelCheck = false, today = new Date().toISOString().slice(0, 10), onSave, embedded = false, onChange }: UnitAssessmentPanelProps) {
  const [strands, setStrands] = useState<Record<Strand, number>>(() => Object.fromEntries(STRANDS.map((s) => [s, 70])) as Record<Strand, number>);
  const [release, setRelease] = useState<Record<ReleaseCriterion, 1 | 2 | 3 | 4>>(() => Object.fromEntries(RELEASE_CRITERIA.map((c) => [c, 3])) as Record<ReleaseCriterion, 1 | 2 | 3 | 4>);
  const [notes, setNotes] = useState('');
  const assessment: UnitAssessment = useMemo(() => ({ seasonId, studentId, on: today, levelCheck, strands, release, notes }), [seasonId, studentId, today, levelCheck, strands, release, notes]);
  const result = unitResult(assessment);
  useEffect(() => { onChange?.(assessment); }, [assessment, onChange]);
  return (
    <section className="mx-auto max-w-2xl space-y-4 rounded-2xl bg-white p-5 text-slate-900 shadow-xl ring-1 ring-slate-200" aria-label="Unit assessment">
      <header>
        <h2 className="text-xl font-black">{levelCheck ? 'Level check' : 'Unit assessment'} · {seasonId}</h2>
        <p className="text-sm text-slate-600">Score the checkpoint on six strands (0–100; for speaking and writing use the rubric as a percentage) and rate the Release from 1 to 4.</p>
      </header>
      <div className="grid gap-2 sm:grid-cols-2">
        {STRANDS.map((s) => (
          <label key={s} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-sm font-semibold capitalize">
            {s}
            <span className="flex items-center gap-2">
              <input type="number" min={0} max={100} value={strands[s]} aria-label={`Score for ${s}`} onChange={(e) => setStrands((cur) => ({ ...cur, [s]: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }))} className="w-16 rounded border border-slate-300 p-1 text-end" />
              <b className={`w-32 text-xs ${MARK_TONE[result.marks[s]]}`}>{MARK_LABEL[result.marks[s]]}</b>
            </span>
          </label>
        ))}
      </div>
      <div>
        <h3 className="text-sm font-bold">Release rubric (1 not yet · 4 strong)</h3>
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {RELEASE_CRITERIA.map((c) => (
            <label key={c} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm font-semibold capitalize">
              {c}
              <select value={release[c]} aria-label={`Release ${c}`} onChange={(e) => setRelease((cur) => ({ ...cur, [c]: Number(e.target.value) as 1 | 2 | 3 | 4 }))} className="rounded border border-slate-300 p-1">
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          ))}
        </div>
      </div>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className="w-full rounded-xl border border-slate-300 p-2 text-sm" rows={2} aria-label="Notes" />
      <div className={`rounded-xl p-3 ring-1 ${VERDICT_TONE[result.verdict]}`} role="status" aria-label="Verdict" data-verdict={result.verdict}>
        <p className="font-extrabold">{UNIT_VERDICT_LABEL[result.verdict]}</p>
        <p className="text-xs">Release average {result.releaseAverage.toFixed(1)} of 4</p>
        <ul className="mt-1 list-disc ps-5 text-sm">{result.plan.map((p) => <li key={p}>{p}</li>)}</ul>
      </div>
      {!embedded && onSave && <div className="flex justify-end"><button type="button" onClick={() => onSave(assessment)} className="rounded-full bg-violet-700 px-5 py-2 text-sm font-extrabold text-white">Save assessment</button></div>}
    </section>
  );
}
