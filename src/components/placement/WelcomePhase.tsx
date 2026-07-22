import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles, Clock, Target, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Hub } from './questionBanks';

interface WelcomePhaseProps {
  hub: Hub;
  onStart: () => void;
}

const hubAccent: Record<Hub, { ring: string; btn: string; glow: string }> = {
  playground: {
    ring: 'ring-orange-400/40',
    btn: 'from-orange-500 to-amber-500',
    glow: 'shadow-[0_0_60px_rgba(254,106,47,0.35)]',
  },
  academy: {
    ring: 'ring-violet-400/40',
    btn: 'from-violet-600 to-fuchsia-600',
    glow: 'shadow-[0_0_60px_rgba(139,92,246,0.35)]',
  },
  professional: {
    ring: 'ring-emerald-400/40',
    btn: 'from-emerald-600 to-teal-600',
    glow: 'shadow-[0_0_60px_rgba(5,150,105,0.35)]',
  },
};

const WelcomePhase = ({ hub, onStart }: WelcomePhaseProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const fallback = t('placement.welcome.greetingFallback', 'there');
  const name =
    (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ||
    (user?.user_metadata?.name as string | undefined)?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    fallback;

  const accent = hubAccent[hub];

  const chips = [
    { icon: Clock, key: 'placement.welcome.chip.duration' as const },
    { icon: Target, key: 'placement.welcome.chip.personalized' as const },
    { icon: Lock, key: 'placement.welcome.chip.oneTime' as const },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col items-center justify-center text-center px-6 py-8"
      dir="auto"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ${accent.ring} ${accent.glow} backdrop-blur-xl`}
      >
        <Sparkles className="h-8 w-8 text-white" />
      </motion.div>

      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight max-w-lg">
        {t(`placement.welcome.title.${hub}`, { name })}
      </h1>
      <p className="text-white/70 max-w-md mb-8 leading-relaxed">
        {t('placement.welcome.subtitle')}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {chips.map(({ icon: Icon, key }) => (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl px-3 py-1.5 text-xs font-medium text-white/90"
          >
            <Icon className="h-3.5 w-3.5" />
            {t(key)}
          </span>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        className={`bg-gradient-to-r ${accent.btn} text-white font-semibold rounded-2xl px-8 py-4 hover:opacity-95 transition-opacity ${accent.glow}`}
      >
        {t('placement.welcome.cta')}
      </motion.button>
    </motion.div>
  );
};

export default WelcomePhase;
