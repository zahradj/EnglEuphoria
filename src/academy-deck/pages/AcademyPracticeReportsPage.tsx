import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTeacherStudents } from '@/hooks/useTeacherStudents';
import { loadRemotePractice } from '@/services/academyPracticeService';
import { gapReport, type GapReport } from '../../curriculum/academy';
import { reportInput } from '../practiceStore';
import { GapReportCard } from '../teacher/GapReportCard';

type Level = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
const LEVELS: Level[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];
export const toLevel = (s?: string): Level => (LEVELS.find((l) => s?.toUpperCase().startsWith(l.toUpperCase())) ?? 'A1');
const ORDER: Record<GapReport['risk'], number> = { red: 0, amber: 1, green: 2 };

interface Row { id: string; name: string; report: GapReport | null }

/** The teacher's practice reports: one card per student, worst first. Reads each student's practice record (RLS lets teachers read it); a student with no record yet shows "no practice record". */
export default function AcademyPracticeReportsPage() {
  const navigate = useNavigate();
  const { students, loading } = useTeacherStudents();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    if (loading) return;
    let alive = true;
    const today = new Date().toISOString().slice(0, 10);
    void Promise.all(students.map(async (s) => {
      const data = await loadRemotePractice(s.id);
      return { id: s.id, name: s.name, report: data ? gapReport(reportInput(data, toLevel(s.level), today)) : null };
    })).then((r) => { if (alive) setRows(r); });
    return () => { alive = false; };
  }, [loading, students]);

  const sorted = (rows ?? []).slice().sort((a, b) => (a.report ? ORDER[a.report.risk] : 3) - (b.report ? ORDER[b.report.risk] : 3) || a.name.localeCompare(b.name));
  return (
    <div className="min-h-screen bg-[#f5f3ff] p-4 sm:p-8">
      <button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-violet-800 shadow ring-1 ring-violet-200">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Back
      </button>
      <h1 className="text-2xl font-black text-violet-900">Practice reports</h1>
      <p className="mb-4 text-sm text-violet-900/80">Who is practising, who needs a nudge, and what the next lesson should do. Students with a restart plan come first.</p>
      {loading || rows === null ? (
        <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-violet-700" /></div>
      ) : sorted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-violet-300 p-8 text-center text-violet-900/80">You have no students yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.map((r) => r.report
            ? <GapReportCard key={r.id} name={r.name} report={r.report} />
            : <section key={r.id} className="rounded-2xl bg-white/80 p-4 text-sm text-slate-700 ring-1 ring-slate-200" aria-label={`Practice report for ${r.name}`}><h3 className="font-extrabold">{r.name}</h3><p className="mt-1">No practice record yet. It appears after the student's first finished Academy lesson.</p></section>)}
        </div>
      )}
    </div>
  );
}
