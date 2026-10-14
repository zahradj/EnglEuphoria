// Teacher's gap report card for one student (docs/academy-recall-spacing-progression.md §7). Presentational: give it a GapReport from gapReport().
import type { GapReport } from '../../curriculum/academy';

const RISK: Record<GapReport['risk'], { label: string; cls: string }> = {
  green: { label: 'On track', cls: 'bg-emerald-100 text-emerald-900 ring-emerald-400' },
  amber: { label: 'Needs a nudge', cls: 'bg-amber-100 text-amber-900 ring-amber-400' },
  red: { label: 'Needs a restart plan', cls: 'bg-rose-100 text-rose-900 ring-rose-400' },
};

export function GapReportCard({ name, report }: { name: string; report: GapReport }) {
  const r = RISK[report.risk];
  return (
    <section className="rounded-2xl bg-white/90 p-4 text-slate-900 shadow ring-1 ring-slate-200" aria-label={`Practice report for ${name}`}>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-extrabold">{name}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${r.cls}`} data-risk={report.risk}>{r.label}</span>
      </header>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
        <div><dt className="text-xs font-semibold text-slate-500">Days since last lesson</dt><dd className="font-bold">{report.daysSinceLastLesson}</dd></div>
        <div><dt className="text-xs font-semibold text-slate-500">Daily 10 (14 days)</dt><dd className="font-bold">{report.daily10Rate === null ? 'no data' : `${Math.round(report.daily10Rate * 100)} %`}</dd></div>
        <div><dt className="text-xs font-semibold text-slate-500">Due today</dt><dd className="font-bold">{report.counts.dueToday}</dd></div>
        <div><dt className="text-xs font-semibold text-slate-500">Spoken answers</dt><dd className="font-bold">{report.speaking ? `${report.speaking.spoken} / ${report.speaking.target}` : 'no data'}</dd></div>
      </dl>
      <p className="mt-2 text-xs text-slate-600">Items: {report.counts.new} new · {report.counts.learning} learning · {report.counts.known} known · {report.counts.secure} secure · {report.counts.fading} fading</p>
      {report.weak.length > 0 && (
        <p className="mt-2 text-sm"><b>Needs attention:</b> {report.weak.map((w) => `${w.item} (${w.why})`).join(', ')}</p>
      )}
      <ul className="mt-3 list-disc space-y-1 ps-5 text-sm">{report.actions.map((a) => <li key={a}>{a}</li>)}</ul>
    </section>
  );
}
