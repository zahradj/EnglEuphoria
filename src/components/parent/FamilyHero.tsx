import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import { childBuddy, type FamilyChildProfile } from '@/lib/familyBuddy';
import { firstName, hubStyle } from '@/lib/familyTheme';

export interface HeroChild {
  studentId: string;
  name: string;
  profile?: FamilyChildProfile;
}

interface Props {
  parentName: string | null | undefined;
  children: HeroChild[];
  upcomingLessons: number | null;
  /** The "Add a child" dialog trigger, passed in so the hero doesn't own its state. */
  addChildAction?: ReactNode;
}

function greetingKey(hour: number) {
  if (hour < 12) return 'pd.hero.morning';
  if (hour < 18) return 'pd.hero.afternoon';
  return 'pd.hero.evening';
}

export function FamilyHero({ parentName, children: kids, upcomingLessons, addChildAction }: Props) {
  const { t } = useTranslation();
  const name = firstName(parentName);

  return (
    <section className="fd-hero" aria-labelledby="fd-hero-title">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="fd-hero__eyebrow">{t('pd.hero.eyebrow')}</p>
          <h1 id="fd-hero-title" className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">
            {t(greetingKey(new Date().getHours()), { name })}
          </h1>

          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            <div>
              <dt className="text-xs font-semibold text-white/70">{t('pd.hero.children')}</dt>
              <dd className="fd-num text-3xl font-bold leading-none">{kids.length}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-white/70">{t('pd.hero.upcoming')}</dt>
              <dd className="fd-num text-3xl font-bold leading-none">{upcomingLessons ?? '–'}</dd>
            </div>
          </dl>
        </div>

        {kids.length > 0 && (
          <div className="fd-hero__stack" aria-hidden>
            {kids.slice(0, 5).map((c) => {
              const { art } = childBuddy(c.profile);
              return (
                <span key={c.studentId} className={`fd-stackface ${art ? '' : 'fd-stackface--mono'}`} style={hubStyle(c.profile?.hub)}>
                  {art ? <img src={art} alt="" /> : c.name.slice(0, 1).toUpperCase()}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {kids.length > 0 && (
          <Link to="/who-is-learning" className="fd-btn fd-btn--light">
            <PlayCircle className="h-5 w-5" aria-hidden /> {t('pd.hero.openSpace')}
          </Link>
        )}
        {addChildAction}
      </div>
    </section>
  );
}
