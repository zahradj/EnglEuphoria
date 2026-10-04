import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Eye, PlayCircle } from 'lucide-react';
import { HUB_BRAND, type HubType } from '@/lib/hubAssignment';
import { childBuddy, type FamilyChildProfile } from '@/lib/familyBuddy';
import { hubStyle } from '@/lib/familyTheme';
import type { ChildSnapshotState } from '@/hooks/useChildSnapshots';

export interface ChildCardData {
  studentId: string;
  name: string;
  email?: string | null;
  profile?: FamilyChildProfile;
  snapshot: ChildSnapshotState;
  isPrimaryContact?: boolean;
}

interface Props {
  child: ChildCardData;
  onViewProgress: (studentId: string) => void;
}

const isPlaceholderEmail = (e?: string | null) => !e || e.endsWith('.invalid');

export function ChildCard({ child, onViewProgress }: Props) {
  const { t } = useTranslation();
  const { profile, snapshot } = child;
  const hub = (profile?.hub ?? 'playground') as HubType;
  const brand = HUB_BRAND[hub] ?? HUB_BRAND.playground;
  const { art } = childBuddy(profile);
  const snap = snapshot.data;
  const xpIntoLevel = snap ? (snap.total_xp % 500) / 5 : 0;

  const meta = [
    profile?.age ? t('pd.child.age', { age: profile.age }) : null,
    snap?.cefr_level ?? null,
    isPlaceholderEmail(child.email) ? null : child.email,
  ].filter(Boolean).join(' · ');

  return (
    <article className="fd-child" style={hubStyle(profile?.hub)} aria-label={child.name}>
      <div className="fd-child__top">
        <span className="fd-hubchip">{brand.label}</span>
        {art && (art.startsWith('http') || art.includes('/avatars/academy/')) ? (
          // Academy cast art is a head-and-shoulders portrait (not a leaning cut-out): show it in a round frame.
          <span className={`fd-child__portrait${art.startsWith('http') ? '' : ' fd-child__portrait--bust'}`} aria-hidden>
            <img src={art} alt="" loading="lazy" />
          </span>
        ) : art ? (
          <img className="fd-child__buddy" src={art} alt="" loading="lazy" />
        ) : (
          <span className="fd-child__mono" aria-hidden>{child.name.slice(0, 1).toUpperCase()}</span>
        )}
      </div>

      <div className="fd-child__body">
        <div>
          <h3 className="fd-child__name">{child.name}</h3>
          {meta && <p className="fd-child__meta">{meta}</p>}
        </div>

        {snapshot.isLoading ? (
          <div className="fd-stats" aria-hidden>
            {[0, 1, 2].map((i) => <div key={i} className="fd-skel h-[64px]" />)}
          </div>
        ) : snap ? (
          <>
            <dl className="fd-stats">
              <div className="fd-stat">
                <dt>{t('pd.child.lessons')}</dt>
                <dd className="fd-num">{snap.total_lessons}</dd>
              </div>
              <div className="fd-stat">
                <dt>{t('pd.child.upcoming')}</dt>
                <dd className="fd-num">{snap.upcoming_lessons}</dd>
              </div>
              <div className="fd-stat">
                <dt>{t('pd.child.level')}</dt>
                <dd className="fd-num">{snap.current_level}</dd>
              </div>
            </dl>
            <div
              className="fd-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(xpIntoLevel)}
              aria-label={`${t('pd.child.level')} ${snap.current_level}`}
            >
              <span style={{ width: `${Math.max(4, xpIntoLevel)}%` }} />
            </div>
          </>
        ) : (
          <p className="text-sm" style={{ color: 'var(--fd-ink-soft)' }}>{t('pd.child.noProgress')}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <Link to="/who-is-learning" className="fd-btn fd-btn--hub flex-1">
            <PlayCircle className="h-5 w-5" aria-hidden /> {t('pd.child.openSpace')}
          </Link>
          <button type="button" className="fd-btn fd-btn--outline" onClick={() => onViewProgress(child.studentId)}>
            <Eye className="h-4 w-4" aria-hidden /> {t('pd.students.viewProgressBtn')}
          </button>
        </div>
      </div>
    </article>
  );
}
