import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Coins } from 'lucide-react';
import type { FamilyLearner } from './FamilyPackList';
import { hubStyle } from '@/lib/familyTheme';

interface Props {
  learners: FamilyLearner[];
  /** Unused lessons per child. */
  credits: Record<string, number>;
}

/**
 * The family dashboard's entry to the Lessons page (/parent/lessons): each child's lessons left and one button.
 * Buying itself happens on the standalone page.
 */
export function FamilyLessonsSummary({ learners, credits }: Props) {
  const { t } = useTranslation();
  if (learners.length === 0) return null;

  return (
    <section className="fd-surface flex flex-wrap items-center justify-between gap-4 p-5" aria-labelledby="family-lessons-title">
      <div className="min-w-0">
        <h2 id="family-lessons-title" className="flex items-center gap-2 text-lg font-bold">
          <Coins className="h-5 w-5" aria-hidden /> {t('pk.sum.title', 'Lessons')}
        </h2>
        <p className="text-sm" style={{ color: 'var(--fd-ink-soft)' }}>
          {t('pk.sum.sub', 'See how many lessons each child has left and buy more.')}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {learners.map((l) => (
            <li
              key={l.studentId}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
              style={{ ...hubStyle(l.hub), borderColor: 'var(--fd-line)', background: 'var(--fd-card)' }}
            >
              <span className="font-semibold">{l.name}</span>
              <span className="fd-num font-bold" style={{ color: 'var(--hub)' }}>{credits[l.studentId] ?? '–'}</span>
              <span style={{ color: 'var(--fd-ink-soft)' }}>{t('pk.sum.left', 'left')}</span>
            </li>
          ))}
        </ul>
      </div>
      <Link to="/parent/lessons" className="fd-btn fd-btn--hub shrink-0" style={hubStyle(learners[0].hub)}>
        {t('pk.sum.buy', 'Buy lessons')} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
      </Link>
    </section>
  );
}
