import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Parent report of the Playground tests (owner-approved plan 2026-10-12, docs/assessment/prea1-assessment-plan.md §6):
 * the Boss Tests, the Halfway Check and the Pre-A1 Final Test — stars per skill, the decision in plain words and
 * what to practise. Parents with "can view progress" read `playground_assessment_results` (RLS). All text is `pr.*`.
 */
type Row = {
  id: string; test_key: string; created_at: string; decision: string; stars_total: number; stars_max: number;
  sections: { key: string; stars: number }[] | null;
};

const SKILLS = ['words', 'sentences', 'reading', 'sounds', 'speaking'];

function testName(t: (k: string, o?: Record<string, unknown>) => string, testKey: string): string {
  const boss = /^prea1-u(\d+)-boss$/.exec(testKey);
  if (boss) return t('pr.test.unit', { unit: boss[1], defaultValue: 'Unit {{unit}} Boss Test' });
  if (testKey === 'prea1-checkpoint-1') return t('pr.test.checkpoint', { defaultValue: 'Halfway Check (Units 1–5)' });
  if (testKey === 'prea1-final') return t('pr.test.final', { defaultValue: 'Pre-A1 Final Test' });
  if (testKey === 'a1-halfway-check') return t('pr.test.a1Halfway', { defaultValue: 'A1 Halfway Check (Units 1–5)' });
  return testKey;
}

export function ParentTestReportCard({ studentId }: { studentId: string }) {
  const { t, i18n } = useTranslation();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['parent-test-report', studentId],
    queryFn: async (): Promise<Row[]> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('playground_assessment_results')
        .select('id, test_key, created_at, decision, stars_total, stars_max, sections')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    enabled: !!studentId,
  });

  if (isLoading) return <div className="fd-skel h-[140px] rounded-[22px]" aria-busy="true" />;

  return (
    <section className="fd-surface p-5 md:p-6">
      <h3 className="mb-1 flex items-center gap-2 text-lg font-bold">
        <Award className="h-5 w-5" aria-hidden />
        {t('pr.title', { defaultValue: 'Test results' })}
      </h3>
      <p className="mb-4 text-sm" style={{ color: 'var(--fd-ink-soft)' }}>
        {t('pr.subtitle', { defaultValue: 'Short checks your child does with the teacher. Each skill gets 1 to 5 stars (5 is the best).' })}
      </p>
      {rows.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--fd-ink-soft)' }}>{t('pr.empty', { defaultValue: 'No test results yet.' })}</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => {
            const secs = (r.sections ?? []).filter((s) => SKILLS.includes(s.key));
            const weak = secs.filter((s) => s.stars < 4).map((s) => t(`pr.skill.${s.key}`));
            const good = ['ready', 'go_on', 'unit_pass'].includes(r.decision);
            return (
              <li key={r.id} className="rounded-2xl border p-4" style={{ borderColor: 'var(--fd-line, #e5e7eb)' }}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-bold">{testName(t, r.test_key)}</span>
                  <span className="text-xs" style={{ color: 'var(--fd-ink-soft)' }}>{new Date(r.created_at).toLocaleDateString(i18n.language)}</span>
                </div>
                <div className={`mt-2 rounded-xl px-3 py-2 ${good ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`}>
                  <div className="font-bold">{t(`pr.d.${r.decision}`)}</div>
                  <div className="text-sm">{t(`pr.dn.${r.decision}`)}</div>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
                  {secs.map((s) => (
                    <div key={s.key}>
                      <dt className="text-xs font-bold" style={{ color: 'var(--fd-ink-soft)' }}>{t(`pr.skill.${s.key}`)}</dt>
                      <dd aria-label={t('pr.starsOf', { stars: s.stars, max: 5 })}>
                        <span aria-hidden>{'★'.repeat(s.stars)}<span className="opacity-30">{'★'.repeat(Math.max(0, 5 - s.stars))}</span></span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-2 text-sm font-semibold">
                  {t('pr.total')}: {t('pr.starsOf', { stars: r.stars_total, max: r.stars_max })}
                </div>
                {weak.length > 0 && (
                  <div className="mt-1 text-sm">
                    {t('pr.practise', { skills: weak.join(', ') })} · {t('pr.homework')}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
