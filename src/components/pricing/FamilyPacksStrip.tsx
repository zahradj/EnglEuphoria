import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Users } from 'lucide-react';
import { familyPacks, usePackCatalog, type PackHub } from '@/lib/packCatalog';

interface Props {
  hub: PackHub;
  /** The page is dark (the homepage in dark mode). */
  dark?: boolean;
  /** How a price is written: the homepage converts to the visitor's currency, other pages show euros. */
  renderPrice?: (euros: number) => React.ReactNode;
  cta: { label: string; to?: string; onClick?: () => void };
}

const euro = (n: number) => `€${Number.isInteger(n) ? n : n.toFixed(2)}`;

/**
 * "Family packs" for one hub (20 / 30 / 40 lessons), shown everywhere packs are shown. They are bigger packs bought from the
 * family dashboard (Lessons tab) and shared between the children with "Move lessons". The strip wears the three hub
 * colours (orange, purple, green), because a family can have children in several hubs.
 */
export const FamilyPacksStrip: React.FC<Props> = ({ hub, dark = false, renderPrice = euro, cta }) => {
  const { t } = useTranslation();
  const { packs } = usePackCatalog();
  const list = familyPacks(packs, hub);
  if (list.length === 0) return null;

  const ink = dark ? 'text-white' : 'text-slate-900';
  const soft = dark ? 'text-slate-400' : 'text-slate-500';
  const surface = dark ? 'bg-white/[0.04] border-white/[0.1]' : 'bg-white border-slate-200 shadow-sm';

  return (
    <section className={`relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-3xl border p-6 md:p-8 ${surface}`} aria-labelledby={`family-packs-${hub}`}>
      {/* the three hubs as a ribbon along the top */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: 'linear-gradient(100deg, #FE6A2F, #FEAF15 18%, #8B5CF6 52%, #3B82F6 70%, #14B8A6)' }}
      />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h3 id={`family-packs-${hub}`} className={`flex items-center gap-2 text-xl font-extrabold ${ink}`}>
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg,#D9480F,#6B21A8 55%,#047857)' }}
              aria-hidden
            >
              <Users className="h-5 w-5" />
            </span>
            {t('lp.pricing.family.title', 'Family packs')}
          </h3>
          <p className={`mt-1.5 text-sm ${soft}`}>
            {t('lp.pricing.family.sub', 'Bigger packs for several children. Buy once, then share the lessons between your children with “Move lessons”.')}
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ background: 'linear-gradient(100deg,#D9480F,#6B21A8 55%,#047857)' }}
        >
          {t('lp.pricing.family.badge', 'Family')}
        </span>
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {list.map((p, i) => (
          <li
            key={`${p.name}-${p.sessions}`}
            className={`rounded-2xl border p-5 ${dark ? 'border-white/[0.1] bg-white/[0.03]' : 'border-slate-200 bg-slate-50/60'}`}
          >
            <p className={`text-sm font-semibold ${soft}`}>{p.name}</p>
            <p className={`mt-1 flex items-baseline gap-1.5 ${ink}`}>
              <span className="text-4xl font-extrabold">{p.sessions}</span>
              <span className={`text-sm font-medium ${soft}`}>{t('lp.pricing.family.lessons', 'lessons')}</span>
            </p>
            <p className={`mt-3 text-2xl font-extrabold ${ink}`}>{renderPrice(p.price)}</p>
            <p className={`mt-0.5 text-xs ${soft}`}>
              {t('lp.pricing.family.perLesson', { price: euro(Math.round((p.price / p.sessions) * 100) / 100), defaultValue: '{{price}} a lesson' })}
            </p>
            {i === 0 && (
              <p className="mt-3 inline-block rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-600">
                {t('lp.pricing.family.start', 'Most families start here')}
              </p>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className={`text-xs ${soft}`}>{t('lp.pricing.family.note', 'Bought from the family dashboard (Lessons tab), 25 minutes per lesson.')}</p>
        {cta.to ? (
          <Link
            to={cta.to}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-sm font-bold text-white"
            style={{ background: 'linear-gradient(100deg,#D9480F,#6B21A8 55%,#047857)' }}
          >
            {cta.label} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Link>
        ) : (
          <button
            type="button"
            onClick={cta.onClick}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-sm font-bold text-white"
            style={{ background: 'linear-gradient(100deg,#D9480F,#6B21A8 55%,#047857)' }}
          >
            {cta.label} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </button>
        )}
      </div>
    </section>
  );
};

export default FamilyPacksStrip;
