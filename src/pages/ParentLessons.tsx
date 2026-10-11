import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, Clock, Coins, Flame, Loader2, Lock, Sprout, Trophy, Users, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FamilyTopBar } from '@/components/family/FamilyTopBar';
import { MoveCreditsDialog } from '@/components/parent/MoveCreditsDialog';
import { useFamilyLearners, type FamilyLearnerView } from '@/hooks/useFamilyLearners';
import { childBuddy } from '@/lib/familyBuddy';
import { firstName, hubStyle } from '@/lib/familyTheme';
import { contactToBuyHref, ONLINE_PAYMENTS_ENABLED } from '@/config/payments';
import '@/components/parent/family-dashboard.css';
import './parent-lessons.css';

interface Pack {
  id: string;
  name: string;
  session_count: number;
  price_eur: number;
  family_only: boolean;
}

const euro = (n: number) => `€${Number.isInteger(n) ? n : n.toFixed(2)}`;
/** Keeps the euro sign in front of the number inside right-to-left text. */
const euroIso = (n: number) => `⁦${euro(n)}⁩`;
const REGULAR_ICONS = [Sprout, Flame, Trophy, Zap];

/** A child's face: their buddy when it has artwork, otherwise their initial (adults have no cartoon buddy). */
function Face({ learner }: { learner: FamilyLearnerView }) {
  const { art } = childBuddy(learner.profile);
  return (
    <span className="fp-face" aria-hidden>
      {art ? <img src={art} alt="" /> : learner.name.slice(0, 1).toUpperCase()}
    </span>
  );
}

/**
 * Standalone "Lessons" page of the family dashboard: pick a child, see how many lessons they have left,
 * buy a pack (or a bigger family pack to share with "Move lessons"). Paying opens Stripe; the lessons go to the child.
 */
export default function ParentLessons() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const { learners, credits, isLoading } = useFamilyLearners();

  const [selectedId, setSelectedId] = useState<string>(params.get('child') ?? '');
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loadingPacks, setLoadingPacks] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);

  useEffect(() => {
    if (learners.length > 0 && !learners.some((l) => l.studentId === selectedId)) setSelectedId(learners[0].studentId);
  }, [learners, selectedId]);

  const learner = learners.find((l) => l.studentId === selectedId);
  const hub = learner?.hub;

  useEffect(() => {
    if (!hub) return;
    let cancelled = false;
    setLoadingPacks(true);
    supabase
      .from('credit_packs')
      .select('id, name, session_count, price_eur, family_only, sort_order')
      .eq('student_level', hub)
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) toast({ title: t('pk.loadFail', 'Could not load lesson packages'), description: error.message, variant: 'destructive' });
        setPacks((data ?? []).map((p: any) => ({ ...p, price_eur: Number(p.price_eur) })));
        setLoadingPacks(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hub]);

  const buy = async (pack: Pack) => {
    if (!learner) return;
    setBuyingId(pack.id);
    try {
      const { data, error } = await supabase.functions.invoke('create-pack-checkout', {
        body: { packId: pack.id, studentId: learner.studentId },
      });
      if (error || !data?.url) throw new Error('Could not start checkout');
      window.location.href = data.url;
    } catch {
      toast({
        title: t('pk.checkoutFail', 'Checkout failed'),
        description: t('pk.checkoutFailDesc', 'Please try again in a moment, or contact us to buy.'),
        variant: 'destructive',
      });
      setBuyingId(null);
    }
  };

  const regular = useMemo(() => packs.filter((p) => !p.family_only), [packs]);
  const family = useMemo(() => packs.filter((p) => p.family_only), [packs]);
  const name = learner ? firstName(learner.name) || learner.name : '';
  const left = learner ? credits[learner.studentId] : undefined;

  const card = (p: Pack, Icon: typeof Sprout, isFamily: boolean) => (
    <li key={p.id} className={`fp-card${isFamily ? ' fp-card--family' : ''}`}>
      <div className="fp-card__top">
        <span className="fp-card__icon" aria-hidden><Icon className="h-5 w-5" /></span>
        <span className="fp-card__name">{p.name}</span>
        {isFamily && (
          <span className="fp-badge"><Users className="h-3 w-3" aria-hidden /> {t('pk.familyBadge', 'Family')}</span>
        )}
      </div>
      <p className="fp-card__count">
        <span className="fd-num">{p.session_count}</span>
        <span className="fp-card__unit">{t('pk.lessons', 'lessons')}</span>
      </p>
      <p className="fp-card__meta">
        {t('pk.minEach', '25 minutes each')} · {t('pk.perLesson', { price: euroIso(Number((p.price_eur / p.session_count).toFixed(2))), defaultValue: '{{price}} a lesson' })}
      </p>
      <div className="fp-card__foot">
        <span className="fp-card__price fd-num">{euro(p.price_eur)}</span>
        {ONLINE_PAYMENTS_ENABLED ? (
          <button type="button" className="fp-buy" onClick={() => buy(p)} disabled={!!buyingId}>
            {buyingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : t('pk.buyFor', { name, defaultValue: 'Buy for {{name}}' })}
          </button>
        ) : (
          <a className="fp-buy" href={contactToBuyHref({ packName: p.name, credits: p.session_count })}>
            {t('pk.contactBuy', 'Contact us to buy')}
          </a>
        )}
      </div>
    </li>
  );

  return (
    <div className="family-dash fp-page min-h-dvh">
      <Helmet><title>{t('pk.title', 'Lessons for your family')} | EnglEuphoria</title></Helmet>
      <main className="mx-auto max-w-6xl space-y-7 px-4 py-4 md:py-8" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 40px)' }}>
        <FamilyTopBar backTo="/parent" />

        <header className="fp-hero">
          <div>
            <p className="fd-hero__eyebrow"><Coins className="mr-1.5 inline h-4 w-4 align-[-3px]" aria-hidden />{t('pk.eyebrow', 'Lessons')}</p>
            <h1 className="mt-1 text-3xl font-bold leading-tight md:text-4xl">{t('pk.title', 'Lessons for your family')}</h1>
            <p className="mt-2 max-w-xl text-base text-white/80">{t('pk.subtitle', 'Choose a child, then a pack. The lessons go straight to that child.')}</p>
          </div>
          <ul className="fp-facts">
            <li><Clock className="h-4 w-4" aria-hidden /> {t('pk.minEach', '25 minutes each')}</li>
            <li><Lock className="h-4 w-4" aria-hidden /> {t('pk.secure', 'Secure online checkout')}</li>
          </ul>
        </header>

        {isLoading ? (
          <div className="grid gap-4" aria-busy="true">
            <div className="fd-skel h-24 rounded-[24px]" />
            <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="fd-skel h-[250px] rounded-[26px]" />)}</div>
          </div>
        ) : learners.length === 0 ? (
          <div className="fd-surface p-6 text-center">
            <p className="font-semibold">{t('pk.noChildren', 'Add a child to your family first, then you can buy lessons for them.')}</p>
            <Link to="/parent" className="fp-buy mt-4 inline-flex">{t('pk.toDashboard', 'Go to the dashboard')}</Link>
          </div>
        ) : (
          <>
            <section aria-labelledby="fp-who">
              <h2 id="fp-who" className="mb-3 text-sm font-bold" style={{ color: 'var(--fd-ink-soft)' }}>{t('pk.pickChild', 'Who are the lessons for?')}</h2>
              <div className="fp-kids">
                {learners.map((l) => {
                  const n = credits[l.studentId];
                  return (
                    <button
                      key={l.studentId}
                      type="button"
                      className="fp-kid"
                      style={hubStyle(l.hub)}
                      aria-pressed={l.studentId === selectedId}
                      onClick={() => setSelectedId(l.studentId)}
                    >
                      <Face learner={l} />
                      <span className="min-w-0 text-start">
                        <span className="fp-kid__name">{l.name}</span>
                        <span className="fp-kid__left">
                          <span className="fd-num fp-kid__num">{n ?? '–'}</span> {t('pk.balance', 'Lessons left')}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <div style={learner ? hubStyle(learner.hub) : undefined} className="space-y-7">
              <section aria-labelledby="fp-packs">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h2 id="fp-packs" className="text-xl font-bold">{t('pk.packsTitle', 'Lesson packs')}</h2>
                    <p className="text-sm" style={{ color: 'var(--fd-ink-soft)' }}>{t('pk.packsSub', { name, defaultValue: 'Pick the size that suits {{name}}.' })}</p>
                  </div>
                  {left !== undefined && (
                    <p className="fp-now">
                      <span className="fd-num">{left}</span> {t('pk.balance', 'Lessons left')}
                    </p>
                  )}
                </div>
                {loadingPacks ? (
                  <div className="grid gap-4 md:grid-cols-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="fd-skel h-[250px] rounded-[26px]" />)}</div>
                ) : regular.length === 0 ? (
                  <p className="fd-surface p-5 text-sm">{t('pk.none', 'No lesson packages are available right now.')}</p>
                ) : (
                  <ul className="fp-grid">{regular.map((p, i) => card(p, REGULAR_ICONS[i % REGULAR_ICONS.length], false))}</ul>
                )}
              </section>

              {!loadingPacks && family.length > 0 && (
                <section className="fp-family" aria-labelledby="fp-family">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="max-w-2xl">
                      <h2 id="fp-family" className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5" aria-hidden /> {t('pk.familyTitle', 'Family packs')}</h2>
                      <p className="mt-1 text-sm" style={{ color: 'var(--fd-ink-soft)' }}>
                        {t('pk.familySub', 'Bigger packs for several children. Buy once, then share the lessons between your children with “Move lessons”.')}
                      </p>
                    </div>
                    {learners.length > 1 && (
                      <button type="button" className="fp-ghost" onClick={() => setMoveOpen(true)}>
                        <ArrowLeftRight className="h-4 w-4 rtl:rotate-180" aria-hidden /> {t('pk.moveLessons', 'Move lessons')}
                      </button>
                    )}
                  </div>
                  <ul className="fp-grid">{family.map((p) => card(p, Users, true))}</ul>
                </section>
              )}
            </div>

            <p className="text-center text-sm" style={{ color: 'var(--fd-ink-soft)' }}>
              {t('pk.otherWay', 'Prefer to pay another way?')}{' '}
              <a className="font-semibold underline" href={contactToBuyHref({})}>{t('pk.contactBuy', 'Contact us to buy')}</a>
            </p>
          </>
        )}

        <MoveCreditsDialog
          open={moveOpen}
          onOpenChange={setMoveOpen}
          learners={learners.map((l) => ({ studentId: l.studentId, name: l.name }))}
          credits={credits}
          fromId={selectedId || null}
        />
      </main>
    </div>
  );
}
