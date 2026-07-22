import { useState, useRef, MouseEvent as ReactMouseEvent } from 'react';
import { Check, Sparkles, Clock, Shield, Cpu, UserCheck, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useTranslation } from 'react-i18next';
import { Price } from '@/components/locale/Price';
import { CurrencySwitcher } from '@/components/locale/CurrencySwitcher';


type AudienceLevel = 'playground' | 'academy' | 'professional';

interface PackTier {
  nameKey: Record<AudienceLevel, string>;
  labelKey: string;
  sessions: number;
  price: Record<AudienceLevel, number>;
  originalPrice: Record<AudienceLevel, number>;
  savings: Record<AudienceLevel, number>;
  popular: boolean;
  isMastery: boolean;
}

const PER_SESSION: Record<AudienceLevel, number> = {
  playground: 7.5,
  academy: 15,
  professional: 20,
};

const packTiers: PackTier[] = [
  {
    nameKey: {
      playground: 'lp.pricing.pack.starter',
      academy: 'lp.pricing.pack.explorer',
      professional: 'lp.pricing.pack.pro',
    },
    labelKey: 'lp.pricing.label.tryItOut',
    sessions: 5,
    price: { playground: 37.5, academy: 75, professional: 100 },
    originalPrice: { playground: 37.5, academy: 75, professional: 100 },
    savings: { playground: 0, academy: 0, professional: 0 },
    popular: false,
    isMastery: false,
  },
  {
    nameKey: {
      playground: 'lp.pricing.pack.adventurer',
      academy: 'lp.pricing.pack.achiever',
      professional: 'lp.pricing.pack.executive',
    },
    labelKey: 'lp.pricing.label.mostPopular',
    sessions: 10,
    price: { playground: 75, academy: 150, professional: 195 },
    originalPrice: { playground: 85, academy: 165, professional: 200 },
    savings: { playground: 10, academy: 15, professional: 5 },
    popular: true,
    isMastery: false,
  },
  {
    nameKey: {
      playground: 'lp.pricing.pack.champion',
      academy: 'lp.pricing.pack.mastery',
      professional: 'lp.pricing.pack.globalLeader',
    },
    labelKey: 'lp.pricing.label.bestValue',
    sessions: 20,
    price: { playground: 150, academy: 300, professional: 390 },
    originalPrice: { playground: 170, academy: 330, professional: 400 },
    savings: { playground: 20, academy: 30, professional: 10 },
    popular: false,
    isMastery: true,
  },
];


function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('rotateX(0deg) rotateY(0deg)');

  const handleMouseMove = (e: ReactMouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`);
  };

  const handleMouseLeave = () => setTransform('rotateY(0deg) rotateX(0deg)');

  return { ref, transform, handleMouseMove, handleMouseLeave };
}

export function PricingSection() {
  const [level, setLevel] = useState<AudienceLevel>('playground');
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const perSession = PER_SESSION[level];
  const { t } = useTranslation();

  return (
    <section id="pricing" className={`py-24 relative overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#09090B]' : 'bg-[#FAFAFA]'
    }`}>
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${
        isDark ? 'from-indigo-500/5 via-transparent to-transparent' : 'from-amber-500/[0.03] via-transparent to-transparent'
      }`} />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${
            isDark
              ? 'bg-white/[0.04] border border-white/[0.08] text-indigo-400'
              : 'bg-white border border-slate-200 text-indigo-600 shadow-sm'
          }`}>
            <Sparkles className="w-4 h-4" />
            {t('lp.pricing.badge')}
          </span>
          <h2 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-4 font-display transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {t('lp.pricing.heading')}{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              {t('lp.pricing.headingAccent')}
            </span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto mb-8 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            {t('lp.pricing.subtitle')}
          </p>

          {/* 2-Way Toggle */}
          <div className={`inline-flex items-center backdrop-blur-xl rounded-full p-1.5 ${
            isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-slate-100 border border-slate-200'
          }`}>
            {([
              { key: 'playground' as const, labelKey: 'lp.pricing.toggle.playground' },
              { key: 'academy' as const, labelKey: 'lp.pricing.toggle.academy' },
              { key: 'professional' as const, labelKey: 'lp.pricing.toggle.professional' },
            ]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setLevel(opt.key)}
                data-cursor={opt.key}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  level === opt.key
                    ? isDark
                      ? 'bg-white/10 text-white shadow-lg'
                      : 'bg-white text-slate-900 shadow-md'
                    : isDark
                      ? 'text-slate-500 hover:text-slate-300'
                      : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>

          <p className={`text-sm mt-3 ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>
            {t('lp.pricing.baseRate')}:{' '}
            <span className={`font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
              <Price usd={perSession} showUsdHint />
            </span>{' '}
            {t(`lp.pricing.perSession.${level}`)}
          </p>

          <div className="mt-4 flex justify-center">
            <CurrencySwitcher compact />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto" style={{ perspective: '1200px' }}>
          {packTiers.map((pack, index) => (
            <PricingCard key={pack.labelKey} pack={pack} index={index} level={level} isDark={isDark} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-3xl mx-auto mt-12"
        >
          <div className={`backdrop-blur-xl rounded-2xl p-5 transition-colors duration-300 ${
            isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-white border border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('lp.pricing.policy.title')}
              </h4>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/10">
                <p className="text-emerald-400 font-semibold mb-1">✅ {t('lp.pricing.policy.free.title')}</p>
                <p className={isDark ? 'text-slate-500' : 'text-slate-500'}>{t('lp.pricing.policy.free.desc')}</p>
              </div>
              <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/10">
                <p className="text-amber-400 font-semibold mb-1">⚠️ {t('lp.pricing.policy.late.title')}</p>
                <p className={isDark ? 'text-slate-500' : 'text-slate-500'}>{t('lp.pricing.policy.late.desc')}</p>
              </div>
              <div className={`rounded-xl p-3 border ${isDark ? 'bg-white/[0.04] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>📅 {t('lp.pricing.policy.expiry.title')}</p>
                <p className={isDark ? 'text-slate-500' : 'text-slate-500'}>{t('lp.pricing.policy.expiry.desc')}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className={`text-center mt-8 text-sm ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
        >
          {t('lp.pricing.footnote')}
        </motion.p>
      </div>
    </section>
  );
}

function PricingCard({ pack, index, level, isDark }: { pack: PackTier; index: number; level: AudienceLevel; isDark: boolean }) {
  const { ref, transform, handleMouseMove, handleMouseLeave } = useTilt();
  const { t } = useTranslation();
  const price = pack.price[level];
  const originalPrice = pack.originalPrice[level];
  const savings = pack.savings[level];
  const hasDiscount = savings > 0;
  const packName = t(pack.nameKey[level]);

  const features = [
    t('lp.pricing.feature.oneOnOne'),
    t('lp.pricing.feature.plan'),
    t('lp.pricing.feature.homework'),
    t('lp.pricing.feature.tracking'),
    t('lp.pricing.feature.cancellation'),
    t('lp.pricing.feature.validity'),
  ];

  const valueBullets = [
    { icon: Timer, text: t(`lp.pricing.bullet.sessions.${level}`) },
    { icon: Cpu, text: t('lp.pricing.bullet.adaptive') },
    { icon: UserCheck, text: t('lp.pricing.bullet.verified') },
  ];

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      style={{ transform, transition: 'transform 0.3s ease' }}
      className={`relative rounded-3xl p-7 flex flex-col backdrop-blur-xl transition-all duration-500 ${
        pack.isMastery
          ? isDark
            ? 'bg-white/[0.06] border border-white/[0.08] scale-[1.03]'
            : 'bg-white border border-slate-200 scale-[1.03] shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
          : pack.popular
            ? isDark
              ? 'bg-white/[0.05] border border-amber-500/20'
              : 'bg-white border border-amber-300/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)]'
            : isDark
              ? 'bg-white/[0.04] border border-white/[0.08]'
              : 'bg-white border border-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.05)]'
      } ${isDark ? 'hover:bg-white/[0.08]' : 'hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]'}`}
    >
      {pack.isMastery && (
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden">
            <div
              className="h-full w-1/3 animate-border-beam"
              style={{
                background: isDark
                  ? 'linear-gradient(90deg, transparent, #6366f1, #10b981, transparent)'
                  : 'linear-gradient(90deg, transparent, #4f46e5, #059669, transparent)',
              }}
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] overflow-hidden">
            <div
              className="h-full w-1/3 animate-border-beam"
              style={{
                background: isDark
                  ? 'linear-gradient(90deg, transparent, #f59e0b, #6366f1, transparent)'
                  : 'linear-gradient(90deg, transparent, #d97706, #4f46e5, transparent)',
                animationDelay: '1s',
                animationDirection: 'reverse',
              }}
            />
          </div>
        </div>
      )}

      {hasDiscount && (
        <div className="absolute -top-3 end-4 z-10">
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white animate-shimmer"
            style={{
              backgroundImage: isDark
                ? 'linear-gradient(110deg, #f97316, #fbbf24, rgba(255,255,255,0.5), #f97316, #fbbf24)'
                : 'linear-gradient(110deg, #4f46e5, #6366f1, rgba(255,255,255,0.6), #4f46e5, #6366f1)',
              backgroundSize: '300% 100%',
            }}
          >
            🔥 {t('lp.pricing.save')} <Price usd={savings} />
          </span>
        </div>
      )}

      {pack.popular && (
        <div className="absolute -top-3 start-4 z-10">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 blur-md opacity-40 animate-pulse-ring" />
            <Badge className="relative bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg shadow-orange-500/20 px-3 py-1 text-xs font-bold">
              <Sparkles className="w-3 h-3 me-1" />
              {t('lp.pricing.popular')}
            </Badge>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col flex-1">
        <div className="mb-5 mt-2">
          <h3 className={`text-xl font-bold mb-1 font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>{packName}</h3>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t(pack.labelKey)}</p>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {pack.sessions} × {t(`lp.pricing.bullet.sessions.${level}`)}
          </span>
        </div>

        <div className="mb-5" style={{ perspective: '600px' }}>
          <div className="flex items-baseline gap-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={`${packName}-${price}`}
                className={`font-extrabold font-display ${pack.isMastery ? 'text-5xl' : 'text-4xl'} ${isDark ? 'text-white' : 'text-slate-900'}`}
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Price usd={price} showUsdHint />
              </motion.span>
            </AnimatePresence>
            {hasDiscount && (
              <span className={`line-through text-lg ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                <Price usd={originalPrice} />
              </span>
            )}
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            <Price usd={price / pack.sessions} /> {t('lp.pricing.perSessionUnit')}
          </p>
        </div>

        <div className={`space-y-2 mb-5 pb-5 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
          {valueBullets.map((bullet) => {
            const BulletIcon = bullet.icon;
            return (
              <div key={bullet.text} className="flex items-center gap-2.5">
                <BulletIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? 'text-indigo-400/60' : 'text-indigo-500/60'}`} />
                <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{bullet.text}</span>
              </div>
            );
          })}
        </div>

        <ul className="space-y-2.5 mb-6 flex-1">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5">
              <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${isDark ? 'bg-white/[0.06]' : 'bg-slate-100'}`}>
                <Check className={`w-2.5 h-2.5 ${
                  pack.isMastery
                    ? isDark ? 'text-indigo-400' : 'text-indigo-600'
                    : pack.popular
                      ? isDark ? 'text-amber-400' : 'text-amber-600'
                      : isDark ? 'text-slate-500' : 'text-slate-400'
                }`} />
              </div>
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{feature}</span>
            </li>
          ))}
        </ul>

        <Link to="/student-signup">
          <Button
            className={`w-full py-5 text-base font-semibold transition-all duration-300 rounded-xl ${
              pack.isMastery
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg animate-glow-pulse'
                : pack.popular
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg'
                  : isDark
                    ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
          >
            {t('lp.pricing.cta')}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
